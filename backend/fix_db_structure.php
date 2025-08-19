<?php
// 修復資料庫結構
require __DIR__ . '/vendor/autoload.php';

echo "=== 修復資料庫結構 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    echo "✅ 資料庫連接成功\n\n";

    // 檢查是否需要添加refresh_token欄位
    $columns = $db->fetchAll("PRAGMA table_info(user_sessions)");
    $hasRefreshToken = false;

    foreach ($columns as $column) {
        if ($column['name'] === 'refresh_token') {
            $hasRefreshToken = true;
            break;
        }
    }

    if (!$hasRefreshToken) {
        echo "🔧 添加 refresh_token 欄位...\n";

        // 添加refresh_token欄位
        $db->query("ALTER TABLE user_sessions ADD COLUMN refresh_token VARCHAR(255)");

        echo "✅ refresh_token 欄位添加成功\n";

        // 驗證欄位是否添加成功
        $newColumns = $db->fetchAll("PRAGMA table_info(user_sessions)");
        echo "\n更新後的表結構：\n";
        foreach ($newColumns as $column) {
            echo "  - {$column['name']} ({$column['type']})\n";
        }
    } else {
        echo "✅ refresh_token 欄位已存在\n";
    }

    echo "\n=== 修復完成 ===\n";
    echo "現在可以正常使用refresh token功能了！\n";

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
    echo "文件: " . $e->getFile() . "\n";
    echo "行數: " . $e->getLine() . "\n";

    echo "\n=== 備用方案 ===\n";
    echo "如果無法修改資料庫，我們可以暫時禁用refresh token功能\n";
}
?>
