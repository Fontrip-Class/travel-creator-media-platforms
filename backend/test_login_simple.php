<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🧪 簡化登入測試\n";
echo "=================\n";

try {
    // 直接測試資料庫連接和用戶查詢
    $dbPath = __DIR__ . '/database/sqlite.db';
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ 資料庫連接成功\n";

    // 檢查是否有用戶
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    echo "📊 資料庫中有 {$userCount} 個用戶\n";

    // 列出前5個用戶
    $stmt = $pdo->query("SELECT id, username, email, role FROM users LIMIT 5");
    $users = $stmt->fetchAll();

    echo "\n👥 用戶列表:\n";
    foreach ($users as $user) {
        echo "  - {$user['username']} ({$user['email']}) - {$user['role']}\n";
    }

    // 測試登入邏輯
    if (count($users) > 0) {
        $testUser = $users[0];
        echo "\n🔐 測試用戶登入邏輯...\n";
        echo "測試用戶: {$testUser['username']} ({$testUser['email']})\n";

        // 檢查用戶表結構
        $stmt = $pdo->query("PRAGMA table_info(users)");
        $columns = $stmt->fetchAll();

        echo "\n📋 users 表結構:\n";
        foreach ($columns as $column) {
            echo "  - {$column['name']} ({$column['type']})\n";
        }

        // 嘗試查詢用戶（模擬登入查詢）
        $stmt = $pdo->prepare("
            SELECT id, username, email, password_hash, role, is_active,
                   COALESCE(login_attempts, 0) as login_attempts,
                   locked_until
            FROM users WHERE email = :email
        ");
        $stmt->execute(['email' => $testUser['email']]);
        $loginUser = $stmt->fetch();

        if ($loginUser) {
            echo "\n✅ 用戶查詢成功\n";
            echo "  - ID: {$loginUser['id']}\n";
            echo "  - 用戶名: {$loginUser['username']}\n";
            echo "  - 角色: {$loginUser['role']}\n";
            echo "  - 狀態: " . ($loginUser['is_active'] ? '啟用' : '停用') . "\n";
        } else {
            echo "\n❌ 用戶查詢失敗\n";
        }
    }

    // 測試 user_sessions 表
    echo "\n📋 檢查 user_sessions 表結構:\n";
    try {
        $stmt = $pdo->query("PRAGMA table_info(user_sessions)");
        $sessionColumns = $stmt->fetchAll();

        foreach ($sessionColumns as $column) {
            echo "  - {$column['name']} ({$column['type']})\n";
        }
    } catch (Exception $e) {
        echo "❌ user_sessions 表檢查失敗: " . $e->getMessage() . "\n";
    }

} catch (Exception $e) {
    echo "❌ 測試失敗: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n🎯 建議:\n";
echo "1. 如果用戶查詢成功，問題可能在AuthService邏輯\n";
echo "2. 如果表結構有問題，需要重新初始化資料庫\n";
echo "3. 檢查 JWT 相關配置\n";
