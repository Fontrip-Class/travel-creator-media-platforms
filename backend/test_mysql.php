<?php
// MySQL連接測試腳本

echo "🧪 測試MySQL連接...\n";

try {
    // 嘗試連接到MySQL
    $host = 'localhost';
    $port = '3306';
    $dbname = 'travel_platform_test';
    $username = 'root';
    $password = ''; // 空密碼
    
    echo "📡 連接到: $host:$port/$dbname\n";
    echo "👤 用戶名: $username\n";
    
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    
    echo "✅ MySQL數據庫連接成功！\n";
    
    // 檢查數據庫版本
    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    echo "📊 MySQL版本: $version\n";
    
    // 檢查表是否存在
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "📋 現有表:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (PDOException $e) {
    echo "❌ MySQL數據庫連接失敗: " . $e->getMessage() . "\n";
    
    // 嘗試創建數據庫
    echo "\n🔄 嘗試創建數據庫...\n";
    try {
        $pdo = new PDO("mysql:host=$host;port=$port", $username, $password);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "✅ 數據庫創建成功！\n";
        
        // 連接到新創建的數據庫
        $pdo = new PDO($dsn, $username, $password);
        echo "✅ 連接到新數據庫成功！\n";
        
        // 創建基本的users表
        echo "🔄 創建基本表結構...\n";
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            phone VARCHAR(20),
            avatar_url VARCHAR(255),
            bio TEXT,
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($sql);
        echo "✅ users表創建成功！\n";
        
        // 創建供應商資料表
        $sql = "
        CREATE TABLE IF NOT EXISTS supplier_profiles (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            company_name VARCHAR(100),
            business_type VARCHAR(50),
            license_number VARCHAR(50),
            website VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($sql);
        echo "✅ supplier_profiles表創建成功！\n";
        
        // 創建創作者資料表
        $sql = "
        CREATE TABLE IF NOT EXISTS creator_profiles (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            portfolio_url VARCHAR(255),
            content_types TEXT,
            target_audience TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($sql);
        echo "✅ creator_profiles表創建成功！\n";
        
        // 創建媒體資料表
        $sql = "
        CREATE TABLE IF NOT EXISTS media_profiles (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            media_type VARCHAR(50),
            platform_name VARCHAR(100),
            audience_size INT,
            content_categories TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($sql);
        echo "✅ media_profiles表創建成功！\n";
        
    } catch (PDOException $e2) {
        echo "❌ 數據庫創建失敗: " . $e2->getMessage() . "\n";
    }
} catch (Exception $e) {
    echo "❌ 其他錯誤: " . $e->getMessage() . "\n";
}

echo "\n🏁 MySQL測試完成\n";
