<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔍 檢查用戶權限問題...\n";

try {
    $dbPath = __DIR__ . '/database/sqlite.db';
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ 資料庫連接成功\n";

    // 檢查pittchao@gmail.com用戶
    echo "\n📋 檢查pittchao@gmail.com用戶...\n";
    $stmt = $pdo->prepare("SELECT id, username, email, role, is_active, is_verified FROM users WHERE email = ?");
    $stmt->execute(['pittchao@gmail.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "✅ 用戶存在\n";
        echo "📊 用戶資訊:\n";
        echo "  - ID: {$user['id']}\n";
        echo "  - 用戶名: {$user['username']}\n";
        echo "  - 郵箱: {$user['email']}\n";
        echo "  - 角色: {$user['role']}\n";
        echo "  - 狀態: " . ($user['is_active'] ? '啟用' : '停用') . "\n";
        echo "  - 驗證: " . ($user['is_verified'] ? '已驗證' : '未驗證') . "\n";

        // 檢查是否需要升級為管理員
        if ($user['role'] !== 'admin') {
            echo "\n🔧 將用戶升級為管理員...\n";
            $updateStmt = $pdo->prepare("UPDATE users SET role = 'admin' WHERE email = ?");
            $updateStmt->execute(['pittchao@gmail.com']);
            echo "✅ 用戶角色已更新為管理員\n";
        } else {
            echo "ℹ️  用戶已經是管理員\n";
        }
    } else {
        echo "❌ 用戶不存在，需要創建\n";

        // 創建pittchao@gmail.com管理員用戶
        echo "\n🔧 創建管理員用戶...\n";
        $passwordHash = password_hash('admin123', PASSWORD_ARGON2ID);

        $insertStmt = $pdo->prepare("
            INSERT INTO users (username, email, password_hash, role, is_active, is_verified, created_at, updated_at)
            VALUES (?, ?, ?, 'admin', 1, 1, datetime('now'), datetime('now'))
        ");
        $insertStmt->execute(['pittchao', 'pittchao@gmail.com', $passwordHash]);

        echo "✅ 管理員用戶創建成功\n";
        echo "📋 登入資訊:\n";
        echo "  - 郵箱: pittchao@gmail.com\n";
        echo "  - 密碼: admin123\n";
        echo "  - 角色: admin\n";
    }

    // 檢查所有管理員用戶
    echo "\n📋 所有管理員用戶:\n";
    $stmt = $pdo->query("SELECT username, email FROM users WHERE role = 'admin'");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($admins as $admin) {
        echo "  - {$admin['username']} ({$admin['email']})\n";
    }

    echo "\n✅ 用戶權限檢查完成！\n";

} catch (Exception $e) {
    echo "❌ 檢查失敗: " . $e->getMessage() . "\n";
    exit(1);
}
