<?php
/**
 * SQLite 數據庫初始化腳本
 * 創建必要的表和初始數據
 */

$dbPath = __DIR__ . '/database/sqlite.db';

echo "🧪 開始初始化 SQLite 數據庫...\n";
echo "數據庫路徑: {$dbPath}\n\n";

try {
    // 創建數據庫連接
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ 數據庫連接成功\n\n";
    
    // 創建用戶表
    echo "1. 創建用戶表...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'creator',
            phone VARCHAR(20),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    echo "   ✅ 用戶表創建成功\n\n";
    
    // 創建供應商資料表
    echo "2. 創建供應商資料表...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS supplier_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            company_name VARCHAR(100),
            business_type VARCHAR(100),
            service_areas TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ");
    echo "   ✅ 供應商資料表創建成功\n\n";
    
    // 創建創作者資料表
    echo "3. 創建創作者資料表...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS creator_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            specialties TEXT,
            followers_count INTEGER DEFAULT 0,
            platform VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ");
    echo "   ✅ 創作者資料表創建成功\n\n";
    
    // 創建媒體資料表
    echo "4. 創建媒體資料表...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS media_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            media_type VARCHAR(100),
            website VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ");
    echo "   ✅ 媒體資料表創建成功\n\n";
    
    // 創建任務表
    echo "5. 創建任務表...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id INTEGER NOT NULL,
            title VARCHAR(200) NOT NULL,
            summary TEXT,
            description TEXT NOT NULL,
            requirements TEXT,
            budget_min INTEGER NOT NULL,
            budget_max INTEGER NOT NULL,
            content_type VARCHAR(50),
            deadline DATE NOT NULL,
            location VARCHAR(100),
            tags TEXT,
            status VARCHAR(20) DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (supplier_id) REFERENCES users(id)
        )
    ");
    echo "   ✅ 任務表創建成功\n\n";
    
    // 創建任務申請表
    echo "6. 創建任務申請表...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS task_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            creator_id INTEGER NOT NULL,
            proposal TEXT NOT NULL,
            experience TEXT,
            estimated_duration VARCHAR(100),
            proposed_budget INTEGER,
            portfolio_samples TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (creator_id) REFERENCES users(id)
        )
    ");
    echo "   ✅ 任務申請表創建成功\n\n";
    
    // 創建測試用戶
    echo "7. 創建測試用戶...\n";
    
    // 測試供應商
    $supplierPassword = password_hash('supplier123', PASSWORD_DEFAULT);
    $pdo->exec("
        INSERT OR IGNORE INTO users (username, email, password_hash, role, phone)
        VALUES ('test_supplier', 'supplier@test.com', '{$supplierPassword}', 'supplier', '0912345678')
    ");
    
    // 測試創作者
    $creatorPassword = password_hash('creator123', PASSWORD_DEFAULT);
    $pdo->exec("
        INSERT OR IGNORE INTO users (username, email, password_hash, role, phone)
        VALUES ('test_creator', 'creator@test.com', '{$creatorPassword}', 'creator', '0987654321')
    ");
    
    // 測試媒體
    $mediaPassword = password_hash('media123', PASSWORD_DEFAULT);
    $pdo->exec("
        INSERT OR IGNORE INTO users (username, email, password_hash, role, phone)
        VALUES ('test_media', 'media@test.com', '{$mediaPassword}', 'media', '0955555555')
    ");
    
    echo "   ✅ 測試用戶創建成功\n\n";
    
    // 創建測試任務
    echo "8. 創建測試任務...\n";
    $pdo->exec("
        INSERT OR IGNORE INTO tasks (
            supplier_id, title, summary, description, requirements,
            budget_min, budget_max, content_type, deadline, location, tags, status
        )
        VALUES (
            1, '台東熱氣球節宣傳影片製作', '製作台東熱氣球節的宣傳影片',
            '我們需要一支3-5分鐘的宣傳影片，展現台東熱氣球節的魅力。影片需要突出當地的自然風光和熱氣球活動的精彩瞬間。',
            '專業影片製作團隊，具備旅遊宣傳片製作經驗',
            15000, 25000, 'video,image', '2024-02-15', '台東縣',
            '台東,熱氣球,宣傳,影片', 'published'
        )
    ");
    echo "   ✅ 測試任務創建成功\n\n";
    
    echo "🎉 SQLite 數據庫初始化完成！\n";
    echo "數據庫文件: {$dbPath}\n";
    echo "測試帳號:\n";
    echo "  供應商: supplier@test.com / supplier123\n";
    echo "  創作者: creator@test.com / creator123\n";
    echo "  媒體: media@test.com / media123\n";
    
} catch (PDOException $e) {
    echo "❌ 數據庫初始化失敗: " . $e->getMessage() . "\n";
    exit(1);
}
