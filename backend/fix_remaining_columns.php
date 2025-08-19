<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔧 修復剩餘的資料庫欄位問題...\n";

try {
    $dbPath = __DIR__ . '/database/sqlite.db';
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ 資料庫連接成功\n";

    // 添加缺失的欄位到tasks表
    $taskColumnFixes = [
        "ALTER TABLE tasks ADD COLUMN content_types TEXT",
        "ALTER TABLE tasks ADD COLUMN requirements TEXT",
        "ALTER TABLE tasks ADD COLUMN deliverables TEXT",
        "ALTER TABLE tasks ADD COLUMN target_audience TEXT"
    ];

    echo "\n📋 修復tasks表欄位...\n";
    foreach ($taskColumnFixes as $sql) {
        try {
            $pdo->exec($sql);
            echo "✅ " . substr($sql, 0, 60) . "...\n";
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'duplicate column name') !== false) {
                echo "ℹ️  欄位已存在: " . substr($sql, 20, 40) . "\n";
            } else {
                echo "❌ " . substr($sql, 0, 60) . "... 失敗: " . $e->getMessage() . "\n";
            }
        }
    }

    // 為現有任務設置預設值
    echo "\n📋 設置預設值...\n";
    try {
        $pdo->exec("UPDATE tasks SET content_types = '[\"article\"]' WHERE content_types IS NULL");
        echo "✅ 設置content_types預設值\n";
    } catch (Exception $e) {
        echo "❌ 設置預設值失敗: " . $e->getMessage() . "\n";
    }

    try {
        $pdo->exec("UPDATE tasks SET requirements = description WHERE requirements IS NULL");
        echo "✅ 設置requirements預設值\n";
    } catch (Exception $e) {
        echo "❌ 設置requirements預設值失敗: " . $e->getMessage() . "\n";
    }

    echo "\n✅ 資料庫欄位修復完成！\n";

} catch (Exception $e) {
    echo "❌ 修復失敗: " . $e->getMessage() . "\n";
    exit(1);
}

