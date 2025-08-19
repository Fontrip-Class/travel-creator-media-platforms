<?php
// 檢查資料庫結構
require __DIR__ . '/vendor/autoload.php';

echo "=== 資料庫結構檢查 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    echo "✅ 資料庫連接成功\n\n";

    // 檢查user_sessions表
    echo "--- user_sessions 表結構 ---\n";
    $columns = $db->fetchAll("PRAGMA table_info(user_sessions)");

    if (empty($columns)) {
        echo "❌ user_sessions 表不存在\n";
        echo "需要創建此表\n";
    } else {
        echo "欄位列表：\n";
        foreach ($columns as $column) {
            echo "  - {$column['name']} ({$column['type']})\n";
        }
    }

    echo "\n--- 其他相關表 ---\n";

    // 檢查users表
    echo "users 表：\n";
    $usersColumns = $db->fetchAll("PRAGMA table_info(users)");
    foreach ($usersColumns as $column) {
        echo "  - {$column['name']} ({$column['type']})\n";
    }

    echo "\n--- 建議的修復方案 ---\n";
    echo "1. 如果 user_sessions 表不存在，需要創建\n";
    echo "2. 如果缺少 refresh_token 欄位，需要添加\n";
    echo "3. 或者暫時禁用 refresh token 功能\n";

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
}
?>
