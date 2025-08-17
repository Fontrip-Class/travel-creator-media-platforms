<?php
/**
 * 旅遊平台資料庫遷移腳本 v4 -> v5
 * 將舊的用戶-角色混合模型遷移到新的分離模型
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// 載入環境變數
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

class DatabaseMigrationV5
{
    private PDO $pdo;
    private string $dbType;

    public function __construct()
    {
        $this->dbType = $_ENV['DB_CONNECTION'] ?? 'sqlite';
        $this->connectDatabase();
    }

    private function connectDatabase(): void
    {
        try {
            switch ($this->dbType) {
                case 'mysql':
                    $dsn = "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_DATABASE']};charset=utf8mb4";
                    $this->pdo = new PDO($dsn, $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD']);
                    break;
                    
                case 'pgsql':
                    $dsn = "pgsql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_DATABASE']};port={$_ENV['DB_PORT']}";
                    $this->pdo = new PDO($dsn, $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD']);
                    break;
                    
                default: // sqlite
                    $dbPath = $_ENV['DB_DATABASE'] ?? __DIR__ . '/../database.sqlite';
                    $this->pdo = new PDO("sqlite:$dbPath");
                    break;
            }
            
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "✅ 資料庫連接成功 ({$this->dbType})\n";
            
        } catch (PDOException $e) {
            die("❌ 資料庫連接失敗: " . $e->getMessage() . "\n");
        }
    }

    public function migrate(): void
    {
        echo "\n🚀 開始遷移資料庫到 v5 架構...\n";
        
        try {
            // 1. 備份現有數據
            $this->backupExistingData();
            
            // 2. 創建新表結構
            $this->createNewTables();
            
            // 3. 遷移用戶數據
            $this->migrateUsers();
            
            // 4. 遷移角色數據
            $this->migrateRoles();
            
            // 5. 遷移業務實體數據
            $this->migrateBusinessEntities();
            
            // 6. 遷移任務數據
            $this->migrateTasks();
            
            // 7. 清理舊表（可選）
            $this->cleanupOldTables();
            
            echo "\n🎉 資料庫遷移完成！\n";
            
        } catch (Exception $e) {
            echo "\n❌ 遷移失敗: " . $e->getMessage() . "\n";
            echo "請檢查錯誤日誌並手動修復問題\n";
        }
    }

    private function backupExistingData(): void
    {
        echo "\n📦 備份現有數據...\n";
        
        // 檢查是否存在舊表
        $tables = ['users', 'tasks', 'task_applications'];
        $existingTables = [];
        
        foreach ($tables as $table) {
            try {
                $stmt = $this->pdo->query("SELECT COUNT(*) FROM $table LIMIT 1");
                $existingTables[] = $table;
                echo "  - 發現表: $table\n";
            } catch (PDOException $e) {
                echo "  - 表不存在: $table\n";
            }
        }
        
        if (empty($existingTables)) {
            echo "  ⚠️  沒有發現需要遷移的表，跳過備份\n";
            return;
        }
        
        // 創建備份表
        foreach ($existingTables as $table) {
            $backupTable = $table . '_backup_v4';
            try {
                $this->pdo->exec("CREATE TABLE {$backupTable} AS SELECT * FROM {$table}");
                echo "  ✅ 備份表 {$table} -> {$backupTable}\n";
            } catch (PDOException $e) {
                echo "  ⚠️  備份表 {$table} 失敗: " . $e->getMessage() . "\n";
            }
        }
    }

    private function createNewTables(): void
    {
        echo "\n🏗️  創建新表結構...\n";
        
        $sqlFile = __DIR__ . '/schema_v5_user_roles.sql';
        if (!file_exists($sqlFile)) {
            throw new Exception("找不到 schema_v5_user_roles.sql 文件");
        }
        
        $sql = file_get_contents($sqlFile);
        
        // 移除PostgreSQL特定的擴展和類型（如果使用SQLite或MySQL）
        if ($this->dbType !== 'pgsql') {
            $sql = preg_replace('/CREATE EXTENSION.*?;/', '', $sql);
            $sql = preg_replace('/POINT/', 'TEXT', $sql); // 將POINT類型轉換為TEXT
            $sql = preg_replace('/JSONB/', 'TEXT', $sql); // 將JSONB轉換為TEXT
        }
        
        // 分割SQL語句
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (empty($statement) || strpos($statement, '--') === 0) {
                continue;
            }
            
            try {
                $this->pdo->exec($statement);
                echo "  ✅ 執行SQL語句成功\n";
            } catch (PDOException $e) {
                // 忽略已存在的表錯誤
                if (strpos($e->getMessage(), 'already exists') !== false || 
                    strpos($e->getMessage(), 'duplicate') !== false) {
                    echo "  ⚠️  表已存在，跳過\n";
                } else {
                    echo "  ❌ SQL執行失敗: " . $e->getMessage() . "\n";
                    echo "    語句: " . substr($statement, 0, 100) . "...\n";
                }
            }
        }
    }

    private function migrateUsers(): void
    {
        echo "\n👥 遷移用戶數據...\n";
        
        try {
            // 檢查是否存在舊的users表
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM users_backup_v4");
            $userCount = $stmt->fetchColumn();
            
            if ($userCount == 0) {
                echo "  ⚠️  沒有用戶數據需要遷移\n";
                return;
            }
            
            echo "  📊 發現 {$userCount} 個用戶需要遷移\n";
            
            // 遷移用戶基本資訊
            $stmt = $this->pdo->query("
                SELECT id, username, email, password_hash, first_name, last_name, 
                       phone, avatar_url, bio, created_at, updated_at
                FROM users_backup_v4
            ");
            
            $migratedCount = 0;
            while ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
                try {
                    $insertStmt = $this->pdo->prepare("
                        INSERT INTO users (id, username, email, password_hash, first_name, last_name, 
                                         phone, avatar_url, bio, created_at, updated_at)
                        VALUES (:id, :username, :email, :password_hash, :first_name, :last_name,
                                :phone, :avatar_url, :bio, :created_at, :updated_at)
                    ");
                    
                    $insertStmt->execute($user);
                    $migratedCount++;
                    
                } catch (PDOException $e) {
                    echo "  ⚠️  遷移用戶 {$user['username']} 失敗: " . $e->getMessage() . "\n";
                }
            }
            
            echo "  ✅ 成功遷移 {$migratedCount} 個用戶\n";
            
        } catch (PDOException $e) {
            echo "  ❌ 遷移用戶數據失敗: " . $e->getMessage() . "\n";
        }
    }

    private function migrateRoles(): void
    {
        echo "\n🔐 遷移角色數據...\n";
        
        try {
            // 檢查是否已存在角色
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM roles");
            $roleCount = $stmt->fetchColumn();
            
            if ($roleCount > 0) {
                echo "  ✅ 角色表已存在數據，跳過遷移\n";
                return;
            }
            
            // 插入預設角色
            $defaultRoles = [
                ['admin', '系統管理員', '擁有系統所有權限', '{"all": true}'],
                ['supplier', '供應商', '可以發布任務和管理供應商業務', '{"task_management": true, "business_management": true}'],
                ['creator', '創作者/KOC', '可以申請任務和創作內容', '{"task_application": true, "content_creation": true}'],
                ['media', '媒體', '可以發布媒體任務和內容', '{"media_management": true, "content_publishing": true}']
            ];
            
            $insertStmt = $this->pdo->prepare("
                INSERT INTO roles (name, display_name, description, permissions, is_system_role, created_at)
                VALUES (?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)
            ");
            
            foreach ($defaultRoles as $role) {
                $insertStmt->execute($role);
            }
            
            echo "  ✅ 成功創建預設角色\n";
            
        } catch (PDOException $e) {
            echo "  ❌ 遷移角色數據失敗: " . $e->getMessage() . "\n";
        }
    }

    private function migrateBusinessEntities(): void
    {
        echo "\n🏢 遷移業務實體數據...\n";
        
        try {
            // 檢查是否存在舊的用戶角色數據
            $stmt = $this->pdo->query("
                SELECT COUNT(*) FROM users_backup_v4 
                WHERE role IN ('supplier', 'creator', 'media')
            ");
            $businessUserCount = $stmt->fetchColumn();
            
            if ($businessUserCount == 0) {
                echo "  ⚠️  沒有業務用戶數據需要遷移\n";
                return;
            }
            
            echo "  📊 發現 {$businessUserCount} 個業務用戶需要遷移\n";
            
            // 遷移業務實體
            $stmt = $this->pdo->query("
                SELECT id, username, email, role, first_name, last_name, 
                       phone, avatar_url, bio, created_at, updated_at
                FROM users_backup_v4 
                WHERE role IN ('supplier', 'creator', 'media')
            ");
            
            $migratedCount = 0;
            while ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
                try {
                    // 創建業務實體
                    $businessType = $this->mapRoleToBusinessType($user['role']);
                    $businessName = $user['first_name'] && $user['last_name'] 
                        ? $user['first_name'] . ' ' . $user['last_name']
                        : $user['username'];
                    
                    $insertStmt = $this->pdo->prepare("
                        INSERT INTO business_entities (id, name, business_type, description, 
                                                     contact_email, contact_phone, status, 
                                                     verification_status, created_at, updated_at, created_by)
                        VALUES (:id, :name, :business_type, :description, :contact_email, 
                                :contact_phone, 'active', 'verified', :created_at, :updated_at, :created_by)
                    ");
                    
                    $insertStmt->execute([
                        'id' => $user['id'],
                        'name' => $businessName,
                        'business_type' => $businessType,
                        'description' => $user['bio'] ?: "從舊系統遷移的{$businessType}",
                        'contact_email' => $user['email'],
                        'contact_phone' => $user['phone'],
                        'created_at' => $user['created_at'],
                        'updated_at' => $user['updated_at'],
                        'created_by' => $user['id']
                    ]);
                    
                    // 創建用戶角色關聯
                    $roleId = $this->getRoleIdByName($user['role']);
                    if ($roleId) {
                        $roleStmt = $this->pdo->prepare("
                            INSERT INTO user_roles (user_id, role_id, is_active, granted_at, granted_by)
                            VALUES (:user_id, :role_id, TRUE, :granted_at, :granted_by)
                        ");
                        
                        $roleStmt->execute([
                            'user_id' => $user['id'],
                            'role_id' => $roleId,
                            'granted_at' => $user['created_at'],
                            'granted_by' => $user['id']
                        ]);
                        
                        // 創建業務實體管理權限
                        $permissionStmt = $this->pdo->prepare("
                            INSERT INTO user_business_permissions 
                            (user_id, business_entity_id, role_id, permission_level, 
                             can_manage_users, can_manage_content, can_manage_finance, 
                             can_view_analytics, can_edit_profile, is_active, granted_at, granted_by)
                            VALUES (:user_id, :business_entity_id, :role_id, 'manager', 
                                    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, :granted_at, :granted_by)
                        ");
                        
                        $permissionStmt->execute([
                            'user_id' => $user['id'],
                            'business_entity_id' => $user['id'],
                            'role_id' => $roleId,
                            'granted_at' => $user['created_at'],
                            'granted_by' => $user['id']
                        ]);
                    }
                    
                    $migratedCount++;
                    
                } catch (PDOException $e) {
                    echo "  ⚠️  遷移業務實體 {$user['username']} 失敗: " . $e->getMessage() . "\n";
                }
            }
            
            echo "  ✅ 成功遷移 {$migratedCount} 個業務實體\n";
            
        } catch (PDOException $e) {
            echo "  ❌ 遷移業務實體數據失敗: " . $e->getMessage() . "\n";
        }
    }

    private function migrateTasks(): void
    {
        echo "\n📋 遷移任務數據...\n";
        
        try {
            // 檢查是否存在舊的tasks表
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM tasks_backup_v4");
            $taskCount = $stmt->fetchColumn();
            
            if ($taskCount == 0) {
                echo "  ⚠️  沒有任務數據需要遷移\n";
                return;
            }
            
            echo "  📊 發現 {$taskCount} 個任務需要遷移\n";
            
            // 遷移任務
            $stmt = $this->pdo->query("
                SELECT id, supplier_id, title, description, requirements, 
                       budget_min, budget_max, deadline, status, created_at, updated_at
                FROM tasks_backup_v4
            ");
            
            $migratedCount = 0;
            while ($task = $stmt->fetch(PDO::FETCH_ASSOC)) {
                try {
                    // 檢查supplier_id是否對應到業務實體
                    $businessEntityId = $this->getBusinessEntityIdByUserId($task['supplier_id']);
                    if (!$businessEntityId) {
                        echo "  ⚠️  跳過任務 {$task['title']}：找不到對應的業務實體\n";
                        continue;
                    }
                    
                    // 轉換預算格式
                    $budgetRange = null;
                    if ($task['budget_min'] || $task['budget_max']) {
                        $budgetRange = json_encode([
                            'min' => $task['budget_min'] ?: 0,
                            'max' => $task['budget_max'] ?: 0,
                            'currency' => 'TWD'
                        ]);
                    }
                    
                    $insertStmt = $this->pdo->prepare("
                        INSERT INTO tasks (id, business_entity_id, title, description, requirements,
                                         budget_range, deadline, status, created_at, updated_at, created_by)
                        VALUES (:id, :business_entity_id, :title, :description, :requirements,
                                :budget_range, :deadline, :status, :created_at, :updated_at, :created_by)
                    ");
                    
                    $insertStmt->execute([
                        'id' => $task['id'],
                        'business_entity_id' => $businessEntityId,
                        'title' => $task['title'],
                        'description' => $task['description'],
                        'requirements' => $task['requirements'],
                        'budget_range' => $budgetRange,
                        'deadline' => $task['deadline'],
                        'status' => $task['status'] ?: 'draft',
                        'created_at' => $task['created_at'],
                        'updated_at' => $task['updated_at'],
                        'created_by' => $task['supplier_id']
                    ]);
                    
                    $migratedCount++;
                    
                } catch (PDOException $e) {
                    echo "  ⚠️  遷移任務 {$task['title']} 失敗: " . $e->getMessage() . "\n";
                }
            }
            
            echo "  ✅ 成功遷移 {$migratedCount} 個任務\n";
            
        } catch (PDOException $e) {
            echo "  ❌ 遷移任務數據失敗: " . $e->getMessage() . "\n";
        }
    }

    private function cleanupOldTables(): void
    {
        echo "\n🧹 清理舊表（可選）...\n";
        
        echo "  ⚠️  注意：此操作將刪除舊的備份表，請確認數據已正確遷移\n";
        echo "  輸入 'yes' 確認刪除舊表：";
        
        $handle = fopen("php://stdin", "r");
        $confirmation = trim(fgets($handle));
        fclose($handle);
        
        if (strtolower($confirmation) === 'yes') {
            $backupTables = ['users_backup_v4', 'tasks_backup_v4'];
            
            foreach ($backupTables as $table) {
                try {
                    $this->pdo->exec("DROP TABLE IF EXISTS {$table}");
                    echo "  ✅ 刪除備份表: {$table}\n";
                } catch (PDOException $e) {
                    echo "  ⚠️  刪除備份表 {$table} 失敗: " . $e->getMessage() . "\n";
                }
            }
        } else {
            echo "  ℹ️  跳過清理舊表\n";
        }
    }

    private function mapRoleToBusinessType(string $role): string
    {
        $mapping = [
            'supplier' => 'supplier',
            'creator' => 'koc',
            'media' => 'media',
            'admin' => 'agency'
        ];
        
        return $mapping[$role] ?? 'agency';
    }

    private function getRoleIdByName(string $roleName): ?string
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id FROM roles WHERE name = ?");
            $stmt->execute([$roleName]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['id'] : null;
        } catch (PDOException $e) {
            return null;
        }
    }

    private function getBusinessEntityIdByUserId(string $userId): ?string
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id FROM business_entities WHERE id = ?");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['id'] : null;
        } catch (PDOException $e) {
            return null;
        }
    }

    public function generateMigrationReport(): void
    {
        echo "\n📊 生成遷移報告...\n";
        
        try {
            $report = [
                'migration_date' => date('Y-m-d H:i:s'),
                'database_type' => $this->dbType,
                'tables_created' => [],
                'data_migrated' => []
            ];
            
            // 檢查新表
            $newTables = ['users', 'roles', 'user_roles', 'business_entities', 
                         'user_business_permissions', 'tasks'];
            
            foreach ($newTables as $table) {
                try {
                    $stmt = $this->pdo->query("SELECT COUNT(*) FROM $table");
                    $count = $stmt->fetchColumn();
                    $report['tables_created'][$table] = $count;
                } catch (PDOException $e) {
                    $report['tables_created'][$table] = 'ERROR';
                }
            }
            
            // 檢查備份表
            $backupTables = ['users_backup_v4', 'tasks_backup_v4'];
            foreach ($backupTables as $table) {
                try {
                    $stmt = $this->pdo->query("SELECT COUNT(*) FROM $table");
                    $count = $stmt->fetchColumn();
                    $report['data_migrated'][$table] = $count;
                } catch (PDOException $e) {
                    $report['data_migrated'][$table] = 'NOT_FOUND';
                }
            }
            
            // 保存報告
            $reportFile = __DIR__ . '/migration_report_v5.json';
            file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            echo "  ✅ 遷移報告已保存到: {$reportFile}\n";
            echo "\n📋 遷移摘要:\n";
            echo "  數據庫類型: {$report['database_type']}\n";
            echo "  遷移時間: {$report['migration_date']}\n";
            echo "  新表記錄數:\n";
            foreach ($report['tables_created'] as $table => $count) {
                echo "    - {$table}: {$count}\n";
            }
            
        } catch (Exception $e) {
            echo "  ❌ 生成遷移報告失敗: " . $e->getMessage() . "\n";
        }
    }
}

// 執行遷移
if (php_sapi_name() === 'cli') {
    $migration = new DatabaseMigrationV5();
    $migration->migrate();
    $migration->generateMigrationReport();
} else {
    echo "此腳本需要在命令行中執行\n";
}
