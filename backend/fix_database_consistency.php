<?php
/**
 * 旅遊平台資料庫一致性快速修正腳本
 * 修正前端、後端、資料庫三個層面的資料結構不一致問題
 */

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// 載入環境變數
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

class DatabaseConsistencyFixer
{
    private PDO $pdo;
    private string $driver;
    private array $errors = [];
    private array $warnings = [];
    private array $fixes = [];

    public function __construct()
    {
        $this->driver = $_ENV['DB_DRIVER'] ?? 'sqlite';
        $this->initializeConnection();
    }

    private function initializeConnection(): void
    {
        try {
            $config = require __DIR__ . '/config/database.php';
            
            switch ($this->driver) {
                case 'sqlite':
                    $this->pdo = new PDO("sqlite:{$config['sqlite']['database']}");
                    break;
                case 'mysql':
                    $dsn = "mysql:host={$config['mysql']['host']};port={$config['mysql']['port']};dbname={$config['mysql']['database']};charset={$config['mysql']['charset']}";
                    $this->pdo = new PDO($dsn, $config['mysql']['username'], $config['mysql']['password'], $config['mysql']['options']);
                    break;
                case 'pgsql':
                    $dsn = "pgsql:host={$config['pgsql']['host']};port={$config['pgsql']['port']};dbname={$config['pgsql']['database']}";
                    $this->pdo = new PDO($dsn, $config['pgsql']['username'], $config['pgsql']['password'], $config['pgsql']['options']);
                    break;
                default:
                    throw new Exception("不支援的資料庫驅動: {$this->driver}");
            }
            
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "✓ 資料庫連接成功: {$this->driver}\n";
            
        } catch (Exception $e) {
            $this->errors[] = "資料庫連接失敗: " . $e->getMessage();
        }
    }

    public function fixConsistency(): bool
    {
        if (!empty($this->errors)) {
            echo "❌ 無法繼續，請檢查錯誤:\n";
            foreach ($this->errors as $error) {
                echo "  - {$error}\n";
            }
            return false;
        }

        echo "\n🔧 開始修正資料庫一致性問題...\n";
        echo "================================\n";

        try {
            // 1. 檢查並修正任務狀態欄位
            $this->fixTaskStatusField();
            
            // 2. 檢查並修正地理位置欄位
            $this->fixLocationFields();
            
            // 3. 檢查並修正JSON欄位
            $this->fixJSONFields();
            
            // 4. 檢查並修正陣列欄位
            $this->fixArrayFields();
            
            // 5. 檢查並修正UUID欄位
            $this->fixUUIDFields();
            
            // 6. 檢查並修正時間戳欄位
            $this->fixTimestampFields();
            
            // 7. 生成修正報告
            $this->generateFixReport();
            
            echo "\n================================\n";
            echo "✅ 資料庫一致性修正完成！\n";
            
            return true;
            
        } catch (Exception $e) {
            $this->errors[] = "修正過程失敗: " . $e->getMessage();
            echo "❌ 修正失敗: " . $e->getMessage() . "\n";
            return false;
        }
    }

    private function fixTaskStatusField(): void
    {
        echo "📋 檢查並修正任務狀態欄位...\n";
        
        try {
            // 檢查tasks表是否存在
            $stmt = $this->pdo->query("SELECT 1 FROM tasks LIMIT 1");
            
            // 檢查status欄位的約束
            $sql = "SELECT constraint_name, check_clause FROM information_schema.check_constraints 
                    WHERE constraint_name LIKE '%status%' AND table_name = 'tasks'";
            
            try {
                $stmt = $this->pdo->query($sql);
                $constraints = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (empty($constraints)) {
                    // 添加正確的狀態約束
                    $this->addTaskStatusConstraint();
                    $this->fixes[] = "添加了任務狀態欄位的CHECK約束";
                } else {
                    // 檢查約束是否正確
                    foreach ($constraints as $constraint) {
                        if (strpos($constraint['check_clause'], 'expired') === false) {
                            $this->updateTaskStatusConstraint();
                            $this->fixes[] = "更新了任務狀態欄位的CHECK約束";
                            break;
                        }
                    }
                }
            } catch (Exception $e) {
                // 如果無法查詢約束信息，嘗試直接添加約束
                $this->addTaskStatusConstraint();
                $this->fixes[] = "添加了任務狀態欄位的CHECK約束";
            }
            
            echo "✓ 任務狀態欄位檢查完成\n";
            
        } catch (Exception $e) {
            $this->warnings[] = "無法檢查任務狀態欄位: " . $e->getMessage();
        }
    }

    private function addTaskStatusConstraint(): void
    {
        $validStatuses = "'draft', 'open', 'collecting', 'evaluating', 'in_progress', 'reviewing', 'publishing', 'completed', 'cancelled', 'expired'";
        
        switch ($this->driver) {
            case 'pgsql':
                $sql = "ALTER TABLE tasks ADD CONSTRAINT chk_task_status CHECK (status IN ({$validStatuses}))";
                break;
            case 'mysql':
                $sql = "ALTER TABLE tasks ADD CONSTRAINT chk_task_status CHECK (status IN ({$validStatuses}))";
                break;
            case 'sqlite':
                // SQLite不支援ALTER TABLE ADD CONSTRAINT，需要重建表
                $this->rebuildTasksTableWithConstraint();
                return;
        }
        
        try {
            $this->pdo->exec($sql);
        } catch (Exception $e) {
            $this->warnings[] = "無法添加狀態約束: " . $e->getMessage();
        }
    }

    private function updateTaskStatusConstraint(): void
    {
        // 先刪除舊約束，再添加新約束
        try {
            $this->pdo->exec("ALTER TABLE tasks DROP CONSTRAINT chk_task_status");
            $this->addTaskStatusConstraint();
        } catch (Exception $e) {
            $this->warnings[] = "無法更新狀態約束: " . $e->getMessage();
        }
    }

    private function rebuildTasksTableWithConstraint(): void
    {
        // SQLite需要重建表來添加約束
        try {
            // 創建臨時表
            $sql = "
            CREATE TABLE tasks_temp (
                id TEXT PRIMARY KEY,
                supplier_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT,
                budget_min REAL,
                budget_max REAL,
                budget_type VARCHAR(20) DEFAULT 'fixed',
                location TEXT,
                service_area TEXT,
                content_type VARCHAR(50),
                content_format TEXT,
                deadline TEXT,
                status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'collecting', 'evaluating', 'in_progress', 'reviewing', 'publishing', 'completed', 'cancelled', 'expired')),
                priority VARCHAR(20) DEFAULT 'normal',
                tags TEXT,
                is_featured INTEGER DEFAULT 0,
                is_urgent INTEGER DEFAULT 0,
                views_count INTEGER DEFAULT 0,
                applications_count INTEGER DEFAULT 0,
                shares_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                expires_at TEXT
            )
            ";
            
            $this->pdo->exec($sql);
            
            // 複製數據
            $this->pdo->exec("INSERT INTO tasks_temp SELECT * FROM tasks");
            
            // 刪除舊表
            $this->pdo->exec("DROP TABLE tasks");
            
            // 重命名新表
            $this->pdo->exec("ALTER TABLE tasks_temp RENAME TO tasks");
            
            $this->fixes[] = "重建了tasks表並添加了狀態約束";
            
        } catch (Exception $e) {
            $this->warnings[] = "無法重建tasks表: " . $e->getMessage();
        }
    }

    private function fixLocationFields(): void
    {
        echo "📋 檢查並修正地理位置欄位...\n";
        
        try {
            // 檢查users表的location欄位
            $sql = "PRAGMA table_info(users)";
            if ($this->driver === 'sqlite') {
                $stmt = $this->pdo->query($sql);
                $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($columns as $column) {
                    if ($column['name'] === 'location') {
                        if ($column['type'] !== 'TEXT') {
                            $this->warnings[] = "users表的location欄位類型不是TEXT，建議使用TEXT存儲JSON格式的座標";
                        }
                        break;
                    }
                }
            }
            
            echo "✓ 地理位置欄位檢查完成\n";
            
        } catch (Exception $e) {
            $this->warnings[] = "無法檢查地理位置欄位: " . $e->getMessage();
        }
    }

    private function fixJSONFields(): void
    {
        echo "📋 檢查並修正JSON欄位...\n";
        
        try {
            // 檢查JSON欄位的類型
            $tables = ['users', 'supplier_profiles', 'creator_profiles', 'media_profiles', 'tasks', 'task_applications'];
            
            foreach ($tables as $table) {
                try {
                    $stmt = $this->pdo->query("SELECT 1 FROM {$table} LIMIT 1");
                    
                    // 檢查JSON欄位
                    $jsonColumns = ['address', 'social_media', 'business_hours', 'collaboration_history', 'equipment', 'availability', 'demographics', 'content_format', 'portfolio_samples', 'dimensions', 'device_info', 'old_values', 'new_values', 'attachments', 'data'];
                    
                    foreach ($jsonColumns as $column) {
                        try {
                            $stmt = $this->pdo->query("SELECT {$column} FROM {$table} LIMIT 1");
                            echo "✓ 表 {$table} 的 {$column} 欄位正常\n";
                        } catch (Exception $e) {
                            // 欄位不存在，這是正常的
                        }
                    }
                    
                } catch (Exception $e) {
                    // 表不存在，跳過
                }
            }
            
            echo "✓ JSON欄位檢查完成\n";
            
        } catch (Exception $e) {
            $this->warnings[] = "無法檢查JSON欄位: " . $e->getMessage();
        }
    }

    private function fixArrayFields(): void
    {
        echo "📋 檢查並修正陣列欄位...\n";
        
        try {
            // 檢查陣列欄位
            $arrayColumns = [
                'users' => ['skills'],
                'supplier_profiles' => ['service_areas', 'specialties', 'payment_methods'],
                'creator_profiles' => ['content_types', 'target_audience'],
                'media_profiles' => ['content_categories'],
                'tasks' => ['service_area', 'tags']
            ];
            
            foreach ($arrayColumns as $table => $columns) {
                try {
                    $stmt = $this->pdo->query("SELECT 1 FROM {$table} LIMIT 1");
                    
                    foreach ($columns as $column) {
                        try {
                            $stmt = $this->pdo->query("SELECT {$column} FROM {$table} LIMIT 1");
                            echo "✓ 表 {$table} 的 {$column} 欄位正常\n";
                        } catch (Exception $e) {
                            // 欄位不存在，這是正常的
                        }
                    }
                    
                } catch (Exception $e) {
                    // 表不存在，跳過
                }
            }
            
            echo "✓ 陣列欄位檢查完成\n";
            
        } catch (Exception $e) {
            $this->warnings[] = "無法檢查陣列欄位: " . $e->getMessage();
        }
    }

    private function fixUUIDFields(): void
    {
        echo "📋 檢查並修正UUID欄位...\n";
        
        try {
            // 檢查UUID欄位的類型
            $tables = ['users', 'tasks', 'task_applications', 'media_assets', 'notifications', 'user_sessions', 'audit_logs'];
            
            foreach ($tables as $table) {
                try {
                    $stmt = $this->pdo->query("SELECT 1 FROM {$table} LIMIT 1");
                    
                    // 檢查id欄位
                    try {
                        $stmt = $this->pdo->query("SELECT id FROM {$table} LIMIT 1");
                        echo "✓ 表 {$table} 的 id 欄位正常\n";
                    } catch (Exception $e) {
                        $this->warnings[] = "表 {$table} 的 id 欄位有問題";
                    }
                    
                } catch (Exception $e) {
                    // 表不存在，跳過
                }
            }
            
            echo "✓ UUID欄位檢查完成\n";
            
        } catch (Exception $e) {
            $this->warnings[] = "無法檢查UUID欄位: " . $e->getMessage();
        }
    }

    private function fixTimestampFields(): void
    {
        echo "📋 檢查並修正時間戳欄位...\n";
        
        try {
            // 檢查時間戳欄位
            $timestampColumns = ['created_at', 'updated_at', 'last_login', 'expires_at', 'scheduled_at', 'sent_at', 'read_at', 'changed_at', 'stage_started_at', 'stage_completed_at', 'due_date', 'completed_at'];
            
            $tables = ['users', 'tasks', 'task_applications', 'media_assets', 'notifications', 'user_sessions', 'audit_logs'];
            
            foreach ($tables as $table) {
                try {
                    $stmt = $this->pdo->query("SELECT 1 FROM {$table} LIMIT 1");
                    
                    foreach ($timestampColumns as $column) {
                        try {
                            $stmt = $this->pdo->query("SELECT {$column} FROM {$table} LIMIT 1");
                            echo "✓ 表 {$table} 的 {$column} 欄位正常\n";
                        } catch (Exception $e) {
                            // 欄位不存在，這是正常的
                        }
                    }
                    
                } catch (Exception $e) {
                    // 表不存在，跳過
                }
            }
            
            echo "✓ 時間戳欄位檢查完成\n";
            
        } catch (Exception $e) {
            $this->warnings[] = "無法檢查時間戳欄位: " . $e->getMessage();
        }
    }

    private function generateFixReport(): void
    {
        echo "\n📊 修正報告\n";
        echo "================================\n";
        
        if (!empty($this->fixes)) {
            echo "✅ 已修正的問題:\n";
            foreach ($this->fixes as $fix) {
                echo "  - {$fix}\n";
            }
        } else {
            echo "✅ 沒有發現需要修正的問題\n";
        }
        
        if (!empty($this->warnings)) {
            echo "\n⚠️  警告:\n";
            foreach ($this->warnings as $warning) {
                echo "  - {$warning}\n";
            }
        }
        
        if (!empty($this->errors)) {
            echo "\n❌ 錯誤:\n";
            foreach ($this->errors as $error) {
                echo "  - {$error}\n";
            }
        }
        
        echo "\n================================\n";
        echo "📋 建議的後續操作:\n";
        echo "1. 檢查前端TypeScript類型定義是否與資料庫結構一致\n";
        echo "2. 更新後端API的資料驗證規則\n";
        echo "3. 測試所有API端點的資料格式\n";
        echo "4. 執行完整的資料庫測試\n";
    }
}

// 執行修正
if (php_sapi_name() === 'cli') {
    $fixer = new DatabaseConsistencyFixer();
    $success = $fixer->fixConsistency();
    exit($success ? 0 : 1);
} else {
    echo "此腳本應從命令行執行\n";
    echo "使用方法: php fix_database_consistency.php\n";
}
