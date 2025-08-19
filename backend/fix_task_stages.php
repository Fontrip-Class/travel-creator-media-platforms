<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔧 修復task_stages表結構...\n";

try {
    $dbPath = __DIR__ . '/database/sqlite.db';
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ 資料庫連接成功\n";

    // 檢查task_stages表是否存在
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='task_stages'");
    if (!$stmt->fetch()) {
        echo "❌ task_stages表不存在，跳過修復\n";
        exit(0);
    }

    // 檢查現有欄位
    $stmt = $pdo->query("PRAGMA table_info(task_stages)");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);

    echo "\n📋 現有欄位: " . implode(', ', $columns) . "\n";

    // 添加缺失的欄位
    $requiredColumns = [
        'stage_name' => 'VARCHAR(50)',
        'stage_description' => 'TEXT',
        'stage_order' => 'INTEGER',
        'is_completed' => 'BOOLEAN DEFAULT FALSE'
    ];

    foreach ($requiredColumns as $column => $definition) {
        if (!in_array($column, $columns)) {
            try {
                $pdo->exec("ALTER TABLE task_stages ADD COLUMN {$column} {$definition}");
                echo "✅ 添加欄位: {$column}\n";
            } catch (Exception $e) {
                echo "❌ 添加欄位失敗 {$column}: " . $e->getMessage() . "\n";
            }
        } else {
            echo "ℹ️  欄位已存在: {$column}\n";
        }
    }

    echo "\n✅ task_stages表修復完成！\n";

} catch (Exception $e) {
    echo "❌ 修復失敗: " . $e->getMessage() . "\n";
    exit(1);
}

