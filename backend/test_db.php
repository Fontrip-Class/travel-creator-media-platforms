<?php
// 數據庫連接測試腳本

echo "🔍 測試數據庫連接...\n";

try {
    // 嘗試連接到PostgreSQL
    $host = 'localhost';
    $port = '5432';
    $dbname = 'travel_platform';
    $username = 'postgres';
    $password = ''; // 空密碼
    
    echo "📡 連接到: $host:$port/$dbname\n";
    echo "👤 用戶名: $username\n";
    
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $username, $password);
    
    echo "✅ 數據庫連接成功！\n";
    
    // 檢查數據庫版本
    $version = $pdo->query('SELECT version()')->fetchColumn();
    echo "📊 PostgreSQL版本: $version\n";
    
    // 檢查表是否存在
    $tables = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")->fetchAll(PDO::FETCH_COLUMN);
    echo "📋 現有表:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
    // 檢查users表結構
    if (in_array('users', $tables)) {
        echo "\n👥 users表結構:\n";
        $columns = $pdo->query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position")->fetchAll();
        foreach ($columns as $column) {
            echo "  - {$column['column_name']}: {$column['data_type']} (" . ($column['is_nullable'] === 'YES' ? '可空' : '必填') . ")\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ 數據庫連接失敗: " . $e->getMessage() . "\n";
    
    // 嘗試創建數據庫
    echo "\n🔄 嘗試創建數據庫...\n";
    try {
        $pdo = new PDO("pgsql:host=$host;port=$port", $username, $password);
        $pdo->exec("CREATE DATABASE $dbname");
        echo "✅ 數據庫創建成功！\n";
    } catch (PDOException $e2) {
        echo "❌ 數據庫創建失敗: " . $e2->getMessage() . "\n";
    }
} catch (Exception $e) {
    echo "❌ 其他錯誤: " . $e->getMessage() . "\n";
}

echo "\n🏁 測試完成\n";
