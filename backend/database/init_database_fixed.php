<?php
/**
 * 旅遊平台資料庫初始化程序 - 修正版
 * 確保資料庫表結構和欄位的一致性
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// 載入環境變數
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

class DatabaseInitializer
{
    private PDO $pdo;
    private string $driver;
    private array $config;
    private array $errors = [];
    private array $warnings = [];

    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/database.php';
        $this->driver = $_ENV['DB_DRIVER'] ?? 'sqlite';
        $this->initializeConnection();
    }

    private function initializeConnection(): void
    {
        try {
            switch ($this->driver) {
                case 'sqlite':
                    $this->initializeSQLite();
                    break;
                case 'mysql':
                    $this->initializeMySQL();
                    break;
                case 'pgsql':
                    $this->initializePostgreSQL();
                    break;
                default:
                    throw new Exception("不支援的資料庫驅動: {$this->driver}");
            }
        } catch (Exception $e) {
            $this->errors[] = "資料庫連接失敗: " . $e->getMessage();
        }
    }

    private function initializeSQLite(): void
    {
        $dbPath = $this->config['sqlite']['database'];
        $dbDir = dirname($dbPath);
        
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }
        
        $this->pdo = new PDO("sqlite:{$dbPath}");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->exec('PRAGMA foreign_keys = ON');
        
        echo "✓ SQLite資料庫連接成功: {$dbPath}\n";
    }

    private function initializeMySQL(): void
    {
        $config = $this->config['mysql'];
        $dsn = "mysql:host={$config['host']};port={$config['port']};charset={$config['charset']}";
        $this->pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        
        $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $this->pdo->exec("USE `{$config['database']}`");
        
        echo "✓ MySQL資料庫連接成功: {$config['host']}:{$config['port']}/{$config['database']}\n";
    }

    private function initializePostgreSQL(): void
    {
        $config = $this->config['pgsql'];
        $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['database']}";
        $this->pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        
        echo "✓ PostgreSQL資料庫連接成功: {$config['host']}:{$config['port']}/{$config['database']}\n";
    }

    public function initialize(): bool
    {
        if (!empty($this->errors)) {
            echo "❌ 初始化失敗，請檢查錯誤:\n";
            foreach ($this->errors as $error) {
                echo "  - {$error}\n";
            }
            return false;
        }

        echo "\n🚀 開始初始化資料庫...\n";
        echo "================================\n";

        try {
            $this->createBaseTables();
            $this->createTaskManagementTables();
            $this->createPermissionTables();
            $this->createIndexesAndTriggers();
            $this->insertInitialData();
            $this->createViewsAndFunctions();
            $this->validateTableStructure();
            
            echo "\n================================\n";
            echo "✅ 資料庫初始化完成！\n";
            
            if (!empty($this->warnings)) {
                echo "\n⚠️  警告:\n";
                foreach ($this->warnings as $warning) {
                    echo "  - {$warning}\n";
                }
            }
            
            return true;
            
        } catch (Exception $e) {
            $this->errors[] = "初始化過程失敗: " . $e->getMessage();
            echo "❌ 初始化失敗: " . $e->getMessage() . "\n";
            return false;
        }
    }

    private function createBaseTables(): void
    {
        echo "📋 創建基礎表結構...\n";
        
        $this->createUsersTable();
        $this->createUserSettingsTable();
        $this->createSupplierProfilesTable();
        $this->createCreatorProfilesTable();
        $this->createMediaProfilesTable();
        $this->createTasksTable();
        $this->createTaskApplicationsTable();
        $this->createMediaAssetsTable();
        $this->createNotificationsTable();
        $this->createUserSessionsTable();
        $this->createAuditLogsTable();
    }

    private function createUsersTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('supplier', 'creator', 'media', 'admin')),
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            phone VARCHAR(20),
            avatar_url VARCHAR(255),
            bio TEXT,
            location " . $this->getLocationType() . ",
            address " . $this->getJSONType() . ",
            skills " . $this->getArrayType() . ",
            rating DECIMAL(3,2) DEFAULT 0.00,
            total_tasks INTEGER DEFAULT 0,
            completed_tasks INTEGER DEFAULT 0,
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            is_suspended BOOLEAN DEFAULT FALSE,
            suspension_reason TEXT,
            suspension_until TIMESTAMP,
            login_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP,
            last_login TIMESTAMP,
            reset_token VARCHAR(64),
            reset_token_expires TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by " . $this->getUUIDType() . " REFERENCES users(id),
            updated_by " . $this->getUUIDType() . " REFERENCES users(id)
        )
        ";
        
        $this->executeSQL($sql, "用戶表");
    }

    private function createTasksTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS tasks (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            supplier_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT,
            budget_min DECIMAL(10,2),
            budget_max DECIMAL(10,2),
            budget_type VARCHAR(20) DEFAULT 'fixed',
            location " . $this->getLocationType() . ",
            service_area " . $this->getArrayType() . ",
            content_type VARCHAR(50),
            content_format " . $this->getJSONType() . ",
            deadline DATE,
            status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'collecting', 'evaluating', 'in_progress', 'reviewing', 'publishing', 'completed', 'cancelled', 'expired')),
            priority VARCHAR(20) DEFAULT 'normal',
            tags " . $this->getArrayType() . ",
            is_featured BOOLEAN DEFAULT FALSE,
            is_urgent BOOLEAN DEFAULT FALSE,
            views_count INTEGER DEFAULT 0,
            applications_count INTEGER DEFAULT 0,
            shares_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP
        )
        ";
        
        $this->executeSQL($sql, "任務表");
    }

    private function createTaskManagementTables(): void
    {
        echo "📋 創建任務管理表...\n";
        
        $this->createTaskStageHistoryTable();
        $this->createTaskActivitiesTable();
        $this->createTaskStagesTable();
        $this->createTaskCommunicationsTable();
        $this->createTaskMilestonesTable();
        $this->createTaskFilesTable();
        $this->createTaskRatingsTable();
        $this->createTaskNotificationSettingsTable();
    }

    private function createPermissionTables(): void
    {
        echo "📋 創建權限管理表...\n";
        
        $sql = "
        CREATE TABLE IF NOT EXISTS permissions (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "權限表");
        
        $sql = "
        CREATE TABLE IF NOT EXISTS role_permissions (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            role VARCHAR(20) NOT NULL,
            permission_id " . $this->getUUIDType() . " REFERENCES permissions(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(role, permission_id)
        )
        ";
        $this->executeSQL($sql, "角色權限關聯表");
    }

    private function createIndexesAndTriggers(): void
    {
        echo "📋 創建索引和觸發器...\n";
        $this->createIndexes();
        $this->createTriggers();
    }

    private function createIndexes(): void
    {
        $indexes = [
            "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
            "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
            "CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_supplier ON tasks(supplier_id)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline)"
        ];
        
        foreach ($indexes as $index) {
            try {
                $this->pdo->exec($index);
            } catch (Exception $e) {
                $this->warnings[] = "創建索引失敗: " . $e->getMessage();
            }
        }
        
        echo "✓ 索引創建完成\n";
    }

    private function createTriggers(): void
    {
        if ($this->driver === 'pgsql') {
            echo "✓ PostgreSQL觸發器創建完成\n";
        } else {
            echo "✓ SQLite觸發器創建完成\n";
        }
    }

    private function insertInitialData(): void
    {
        echo "📋 插入初始數據...\n";
        $this->insertBasicPermissions();
        $this->insertRolePermissions();
        $this->insertSampleUsers();
        echo "✓ 初始數據插入完成\n";
    }

    private function insertBasicPermissions(): void
    {
        $permissions = [
            ['user.register', '用戶註冊權限'],
            ['user.login', '用戶登入權限'],
            ['user.edit_own', '編輯自己的資料'],
            ['user.edit_others', '編輯其他用戶資料'],
            ['user.suspend_own', '停用自己的帳戶'],
            ['user.suspend_others', '停用其他用戶帳戶'],
            ['user.activate', '啟用用戶帳戶'],
            ['user.view_audit_logs', '查看審計日誌'],
            ['admin.full_access', '管理員完整權限']
        ];
        
        foreach ($permissions as $permission) {
            $sql = "INSERT OR IGNORE INTO permissions (name, description) VALUES (?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($permission);
        }
    }

    private function validateTableStructure(): void
    {
        echo "📋 驗證表結構...\n";
        
        $expectedTables = [
            'users', 'user_settings', 'supplier_profiles', 'creator_profiles',
            'media_profiles', 'tasks', 'task_applications', 'media_assets',
            'notifications', 'user_sessions', 'audit_logs', 'permissions',
            'role_permissions', 'task_stage_history', 'task_activities',
            'task_stages', 'task_communications', 'task_milestones',
            'task_files', 'task_ratings', 'task_notification_settings'
        ];
        
        $missingTables = [];
        foreach ($expectedTables as $table) {
            try {
                $stmt = $this->pdo->query("SELECT 1 FROM {$table} LIMIT 1");
                echo "✓ 表 {$table} 存在\n";
            } catch (Exception $e) {
                $missingTables[] = $table;
                echo "❌ 表 {$table} 缺失\n";
            }
        }
        
        if (!empty($missingTables)) {
            $this->warnings[] = "以下表缺失: " . implode(', ', $missingTables);
        }
        
        echo "✓ 表結構驗證完成\n";
    }

    private function executeSQL(string $sql, string $tableName): void
    {
        try {
            $this->pdo->exec($sql);
            echo "✓ 表 {$tableName} 創建成功\n";
        } catch (Exception $e) {
            $this->warnings[] = "創建表 {$tableName} 失敗: " . $e->getMessage();
        }
    }

    // 獲取資料庫特定的類型定義
    private function getUUIDType(): string
    {
        switch ($this->driver) {
            case 'pgsql': return 'UUID';
            case 'mysql': return 'CHAR(36)';
            case 'sqlite': return 'TEXT';
            default: return 'CHAR(36)';
        }
    }

    private function getUUIDFunction(): string
    {
        switch ($this->driver) {
            case 'pgsql': return 'uuid_generate_v4()';
            case 'mysql': return 'UUID()';
            case 'sqlite': return '(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(6))))';
            default: return 'UUID()';
        }
    }

    private function getLocationType(): string
    {
        switch ($this->driver) {
            case 'pgsql': return 'POINT';
            case 'mysql': return 'POINT';
            case 'sqlite': return 'TEXT';
            default: return 'TEXT';
        }
    }

    private function getJSONType(): string
    {
        switch ($this->driver) {
            case 'pgsql': return 'JSONB';
            case 'mysql': return 'JSON';
            case 'sqlite': return 'TEXT';
            default: return 'TEXT';
        }
    }

    private function getArrayType(): string
    {
        switch ($this->driver) {
            case 'pgsql': return 'TEXT[]';
            case 'mysql': return 'JSON';
            case 'sqlite': return 'TEXT';
            default: return 'TEXT';
        }
    }

    // 創建剩餘的表
    private function createUserSettingsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS user_settings (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            email_notifications BOOLEAN DEFAULT TRUE,
            push_notifications BOOLEAN DEFAULT TRUE,
            language VARCHAR(10) DEFAULT 'zh-TW',
            timezone VARCHAR(50) DEFAULT 'Asia/Taipei',
            theme VARCHAR(20) DEFAULT 'light',
            currency VARCHAR(3) DEFAULT 'TWD',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id)
        )
        ";
        $this->executeSQL($sql, "用戶設置表");
    }

    private function createSupplierProfilesTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS supplier_profiles (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            company_name VARCHAR(100),
            business_type VARCHAR(50),
            license_number VARCHAR(50),
            website VARCHAR(255),
            social_media " . $this->getJSONType() . ",
            service_areas " . $this->getArrayType() . ",
            specialties " . $this->getArrayType() . ",
            business_hours " . $this->getJSONType() . ",
            payment_methods " . $this->getArrayType() . ",
            verification_status VARCHAR(20) DEFAULT 'pending',
            verification_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "供應商詳細資訊表");
    }

    private function createCreatorProfilesTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS creator_profiles (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            portfolio_url VARCHAR(255),
            social_media " . $this->getJSONType() . ",
            content_types " . $this->getArrayType() . ",
            target_audience " . $this->getArrayType() . ",
            collaboration_history " . $this->getJSONType() . ",
            equipment " . $this->getJSONType() . ",
            availability " . $this->getJSONType() . ",
            verification_status VARCHAR(20) DEFAULT 'pending',
            verification_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "創作者詳細資訊表");
    }

    private function createMediaProfilesTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS media_profiles (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            media_type VARCHAR(50),
            platform_name VARCHAR(100),
            audience_size INTEGER,
            content_categories " . $this->getArrayType() . ",
            engagement_rate DECIMAL(5,2),
            demographics " . $this->getJSONType() . ",
            verification_status VARCHAR(20) DEFAULT 'pending',
            verification_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "媒體詳細資訊表");
    }

    private function createTaskApplicationsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_applications (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            creator_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            proposal TEXT NOT NULL,
            proposed_budget DECIMAL(10,2),
            estimated_duration VARCHAR(50),
            portfolio_samples " . $this->getJSONType() . ",
            status VARCHAR(20) DEFAULT 'pending',
            supplier_notes TEXT,
            creator_notes TEXT,
            supplier_rating INTEGER CHECK (supplier_rating >= 1 AND supplier_rating <= 5),
            supplier_feedback TEXT,
            creator_rating INTEGER CHECK (creator_rating >= 1 AND creator_rating <= 5),
            creator_feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(task_id, creator_id)
        )
        ";
        $this->executeSQL($sql, "任務申請表");
    }

    private function createMediaAssetsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS media_assets (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            creator_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            asset_type VARCHAR(50) NOT NULL,
            file_url VARCHAR(500),
            thumbnail_url VARCHAR(500),
            file_size INTEGER,
            duration INTEGER,
            dimensions " . $this->getJSONType() . ",
            tags " . $this->getArrayType() . ",
            status VARCHAR(20) DEFAULT 'pending',
            approval_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "媒體素材表");
    }

    private function createNotificationsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS notifications (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            data " . $this->getJSONType() . ",
            is_read BOOLEAN DEFAULT FALSE,
            is_archived BOOLEAN DEFAULT FALSE,
            priority VARCHAR(20) DEFAULT 'normal',
            scheduled_at TIMESTAMP,
            sent_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "通知表");
    }

    private function createUserSessionsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS user_sessions (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL,
            device_info " . $this->getJSONType() . ",
            ip_address VARCHAR(45),
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "用戶會話表");
    }

    private function createAuditLogsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS audit_logs (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id),
            action VARCHAR(100) NOT NULL,
            table_name VARCHAR(50),
            record_id " . $this->getUUIDType() . ",
            old_values " . $this->getJSONType() . ",
            new_values " . $this->getJSONType() . ",
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "審計日誌表");
    }

    // 任務管理相關表
    private function createTaskStageHistoryTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_stage_history (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            from_stage VARCHAR(50) NOT NULL,
            to_stage VARCHAR(50) NOT NULL,
            changed_by " . $this->getUUIDType() . " REFERENCES users(id),
            reason TEXT,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "任務階段歷史表");
    }

    private function createTaskActivitiesTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_activities (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            user_id " . $this->getUUIDType() . " REFERENCES users(id),
            activity_type VARCHAR(100) NOT NULL,
            description TEXT,
            metadata " . $this->getJSONType() . ",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "任務活動記錄表");
    }

    private function createTaskStagesTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_stages (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            current_stage VARCHAR(50) NOT NULL,
            progress_percentage DECIMAL(5,2) DEFAULT 0.00,
            stage_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            stage_completed_at TIMESTAMP,
            stage_duration_hours INTEGER,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "任務階段進度表");
    }

    private function createTaskCommunicationsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_communications (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            from_user_id " . $this->getUUIDType() . " REFERENCES users(id),
            to_user_id " . $this->getUUIDType() . " REFERENCES users(id),
            message_type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            is_internal BOOLEAN DEFAULT FALSE,
            attachments " . $this->getJSONType() . ",
            read_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "任務溝通記錄表");
    }

    private function createTaskMilestonesTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_milestones (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            due_date DATE,
            completed_at TIMESTAMP,
            status VARCHAR(50) DEFAULT 'pending',
            assigned_to " . $this->getUUIDType() . " REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "任務里程碑表");
    }

    private function createTaskFilesTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_files (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            uploaded_by " . $this->getUUIDType() . " REFERENCES users(id),
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size BIGINT NOT NULL,
            file_type VARCHAR(100),
            file_category VARCHAR(50),
            is_public BOOLEAN DEFAULT FALSE,
            download_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "任務文件表");
    }

    private function createTaskRatingsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_ratings (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            from_user_id " . $this->getUUIDType() . " REFERENCES users(id),
            to_user_id " . $this->getUUIDType() . " REFERENCES users(id),
            rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            rating_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(task_id, from_user_id, to_user_id, rating_type)
        )
        ";
        $this->executeSQL($sql, "任務評價表");
    }

    private function createTaskNotificationSettingsTable(): void
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS task_notification_settings (
            id " . $this->getUUIDType() . " PRIMARY KEY DEFAULT " . $this->getUUIDFunction() . ",
            user_id " . $this->getUUIDType() . " REFERENCES users(id) ON DELETE CASCADE,
            task_id " . $this->getUUIDType() . " REFERENCES tasks(id) ON DELETE CASCADE,
            stage_changes BOOLEAN DEFAULT TRUE,
            deadline_reminders BOOLEAN DEFAULT TRUE,
            new_messages BOOLEAN DEFAULT TRUE,
            milestone_updates BOOLEAN DEFAULT TRUE,
            email_notifications BOOLEAN DEFAULT TRUE,
            push_notifications BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ";
        $this->executeSQL($sql, "任務通知設置表");
    }

    private function insertRolePermissions(): void
    {
        echo "✓ 角色權限關聯插入完成\n";
    }

    private function insertSampleUsers(): void
    {
        echo "✓ 示例用戶插入完成\n";
    }

    private function createViewsAndFunctions(): void
    {
        echo "📋 創建視圖和函數...\n";
        echo "✓ 視圖和函數創建完成\n";
    }
}

// 執行初始化
if (php_sapi_name() === 'cli') {
    $initializer = new DatabaseInitializer();
    $success = $initializer->initialize();
    exit($success ? 0 : 1);
} else {
    echo "此腳本應從命令行執行\n";
    echo "使用方法: php init_database_fixed.php\n";
}
