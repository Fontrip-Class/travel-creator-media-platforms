<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔍 驗證資料庫結構完整性...\n";

try {
    $dbPath = __DIR__ . '/database/sqlite.db';
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ 資料庫連接成功\n";

    // 檢查關鍵表是否存在
    $requiredTables = [
        'users', 'user_settings', 'user_sessions',
        'tasks', 'task_applications', 'media_assets',
        'notifications', 'permissions', 'role_permissions',
        'supplier_profiles', 'creator_profiles', 'media_profiles'
    ];

    echo "\n📋 檢查必要表結構...\n";
    foreach ($requiredTables as $table) {
        $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
        $stmt->execute([$table]);
        if ($stmt->fetch()) {
            echo "✅ 表 {$table} 存在\n";
        } else {
            echo "❌ 表 {$table} 缺失\n";
        }
    }

    // 檢查users表的關鍵欄位
    echo "\n📋 檢查users表欄位...\n";
    $requiredUserColumns = [
        'id', 'username', 'email', 'password_hash', 'role',
        'is_active', 'is_verified', 'is_suspended', 'avatar_url',
        'created_at', 'updated_at'
    ];

    $stmt = $pdo->query("PRAGMA table_info(users)");
    $existingColumns = [];
    while ($row = $stmt->fetch()) {
        $existingColumns[] = $row['name'];
    }

    foreach ($requiredUserColumns as $column) {
        if (in_array($column, $existingColumns)) {
            echo "✅ users.{$column} 存在\n";
        } else {
            echo "❌ users.{$column} 缺失\n";
        }
    }

    // 檢查tasks表的關鍵欄位
    echo "\n📋 檢查tasks表欄位...\n";
    $requiredTaskColumns = [
        'id', 'title', 'description', 'status', 'budget_min', 'budget_max',
        'deadline', 'supplier_id', 'assigned_creator_id', 'applications_count',
        'views_count', 'workflow_stage', 'reward_type', 'created_at', 'updated_at'
    ];

    $stmt = $pdo->query("PRAGMA table_info(tasks)");
    $existingTaskColumns = [];
    while ($row = $stmt->fetch()) {
        $existingTaskColumns[] = $row['name'];
    }

    foreach ($requiredTaskColumns as $column) {
        if (in_array($column, $existingTaskColumns)) {
            echo "✅ tasks.{$column} 存在\n";
        } else {
            echo "❌ tasks.{$column} 缺失\n";
        }
    }

    // 檢查索引
    echo "\n📋 檢查重要索引...\n";
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'");
    $indexes = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $requiredIndexes = [
        'idx_users_email', 'idx_users_role', 'idx_tasks_status',
        'idx_tasks_supplier_id', 'idx_task_applications_task_id'
    ];

    foreach ($requiredIndexes as $index) {
        if (in_array($index, $indexes)) {
            echo "✅ 索引 {$index} 存在\n";
        } else {
            echo "⚠️  索引 {$index} 缺失（建議添加）\n";
        }
    }

    // 檢查測試數據
    echo "\n📋 檢查測試數據...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    echo "👥 用戶數量: {$userCount}\n";

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM tasks");
    $taskCount = $stmt->fetch()['count'];
    echo "📋 任務數量: {$taskCount}\n";

    if ($userCount > 0) {
        $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
        echo "📊 用戶角色分布:\n";
        while ($row = $stmt->fetch()) {
            echo "   - {$row['role']}: {$row['count']}\n";
        }
    }

    echo "\n✅ 資料庫結構驗證完成！\n";

} catch (Exception $e) {
    echo "❌ 驗證失敗: " . $e->getMessage() . "\n";
    exit(1);
}
