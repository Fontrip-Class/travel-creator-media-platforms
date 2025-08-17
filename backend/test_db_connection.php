<?php
/**
 * 資料庫連接測試腳本
 * 用於快速驗證資料庫配置是否正確
 */

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// 載入環境變數
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

// 載入配置
$config = require __DIR__ . '/config/database.php';

echo "========================================";
echo "資料庫連接測試";
echo "========================================";
echo "\n";

$driver = $_ENV['DB_DRIVER'] ?? 'sqlite';
echo "當前資料庫驅動: {$driver}\n\n";

try {
    switch ($driver) {
        case 'sqlite':
            testSQLite($config);
            break;
        case 'mysql':
            testMySQL($config);
            break;
        case 'pgsql':
            testPostgreSQL($config);
            break;
        default:
            echo "❌ 不支援的資料庫驅動: {$driver}\n";
            exit(1);
    }
} catch (Exception $e) {
    echo "❌ 測試失敗: " . $e->getMessage() . "\n";
    exit(1);
}

function testSQLite($config) {
    echo "🔍 測試SQLite連接...\n";
    
    $dbPath = $config['sqlite']['database'];
    $dbDir = dirname($dbPath);
    
    if (!is_dir($dbDir)) {
        mkdir($dbDir, 0755, true);
        echo "✓ 創建資料庫目錄: {$dbDir}\n";
    }
    
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 測試基本查詢
    $stmt = $pdo->query("SELECT SQLITE_VERSION() as version");
    $version = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "✓ SQLite連接成功\n";
    echo "✓ 版本: {$version['version']}\n";
    echo "✓ 資料庫文件: {$dbPath}\n";
    
    // 測試創建簡單表
    $pdo->exec("CREATE TABLE IF NOT EXISTS test_connection (id INTEGER PRIMARY KEY, name TEXT)");
    echo "✓ 測試表創建成功\n";
    
    // 清理測試表
    $pdo->exec("DROP TABLE test_connection");
    echo "✓ 測試表清理完成\n";
}

function testMySQL($config) {
    echo "🔍 測試MySQL連接...\n";
    
    $mysqlConfig = $config['mysql'];
    
    // 先連接到MySQL服務器（不指定資料庫）
    $dsn = "mysql:host={$mysqlConfig['host']};port={$mysqlConfig['port']};charset={$mysqlConfig['charset']}";
    $pdo = new PDO($dsn, $mysqlConfig['username'], $mysqlConfig['password'], $mysqlConfig['options']);
    
    echo "✓ MySQL服務器連接成功\n";
    
    // 檢查資料庫是否存在
    $stmt = $pdo->query("SHOW DATABASES LIKE '{$mysqlConfig['database']}'");
    $exists = $stmt->fetch();
    
    if (!$exists) {
        echo "📝 創建資料庫: {$mysqlConfig['database']}\n";
        $pdo->exec("CREATE DATABASE `{$mysqlConfig['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }
    
    // 連接到指定資料庫
    $pdo->exec("USE `{$mysqlConfig['database']}`");
    echo "✓ 資料庫連接成功: {$mysqlConfig['database']}\n";
    
    // 測試基本查詢
    $stmt = $pdo->query("SELECT VERSION() as version");
    $version = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ MySQL版本: {$version['version']}\n";
    
    // 測試創建簡單表
    $pdo->exec("CREATE TABLE IF NOT EXISTS test_connection (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50))");
    echo "✓ 測試表創建成功\n";
    
    // 清理測試表
    $pdo->exec("DROP TABLE test_connection");
    echo "✓ 測試表清理完成\n";
}

function testPostgreSQL($config) {
    echo "🔍 測試PostgreSQL連接...\n";
    
    $pgsqlConfig = $config['pgsql'];
    
    $dsn = "pgsql:host={$pgsqlConfig['host']};port={$pgsqlConfig['port']};dbname={$pgsqlConfig['database']}";
    $pdo = new PDO($dsn, $pgsqlConfig['username'], $pgsqlConfig['password'], $pgsqlConfig['options']);
    
    echo "✓ PostgreSQL連接成功\n";
    
    // 測試基本查詢
    $stmt = $pdo->query("SELECT version() as version");
    $version = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ PostgreSQL版本: {$version['version']}\n";
    
    // 檢查UUID擴展
    try {
        $stmt = $pdo->query("SELECT uuid_generate_v4() as uuid");
        $uuid = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "✓ UUID擴展可用\n";
    } catch (Exception $e) {
        echo "⚠️  UUID擴展不可用，需要安裝uuid-ossp\n";
    }
    
    // 測試創建簡單表
    $pdo->exec("CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, name VARCHAR(50))");
    echo "✓ 測試表創建成功\n";
    
    // 清理測試表
    $pdo->exec("DROP TABLE test_connection");
    echo "✓ 測試表清理完成\n";
}

echo "\n========================================";
echo "✅ 所有測試通過！資料庫配置正確";
echo "========================================";
echo "\n";
echo "📋 下一步操作:";
echo "1. 執行資料庫初始化: php database/init_database.php";
echo "2. 或使用腳本: ./init_db.bat (Windows) 或 ./init_db.sh (Linux/Mac)";
echo "\n";
