<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔍 調試登入問題...\n";

try {
    $dbPath = __DIR__ . '/database/sqlite.db';
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ 資料庫連接成功\n";

    // 檢查pittchao@gmail.com用戶
    echo "\n📋 檢查pittchao@gmail.com用戶...\n";
    $stmt = $pdo->prepare("SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = ?");
    $stmt->execute(['pittchao@gmail.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "✅ 用戶存在\n";
        echo "  - ID: {$user['id']}\n";
        echo "  - 用戶名: {$user['username']}\n";
        echo "  - 角色: {$user['role']}\n";
        echo "  - 狀態: " . ($user['is_active'] ? '啟用' : '停用') . "\n";

        // 測試密碼驗證
        $testPassword = 'admin123';
        if (password_verify($testPassword, $user['password_hash'])) {
            echo "✅ 密碼驗證成功\n";
        } else {
            echo "❌ 密碼驗證失敗\n";

            // 重設密碼
            echo "🔧 重設密碼...\n";
            $newHash = password_hash($testPassword, PASSWORD_ARGON2ID);
            $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            $updateStmt->execute([$newHash, 'pittchao@gmail.com']);
            echo "✅ 密碼已重設\n";
        }
    } else {
        echo "❌ 用戶不存在\n";
    }

    // 測試AuthService
    echo "\n🧪 測試AuthService...\n";

    // 創建DatabaseService
    $config = [
        'driver' => 'sqlite',
        'database' => $dbPath
    ];

    $dbService = new App\Services\DatabaseService($config);
    echo "✅ DatabaseService創建成功\n";

    $authService = new App\Services\AuthService($dbService);
    echo "✅ AuthService創建成功\n";

    // 測試登入
    try {
        $result = $authService->login('pittchao@gmail.com', 'admin123');
        echo "✅ AuthService登入成功\n";
        echo "  - Token存在: " . (isset($result['token']) ? '是' : '否') . "\n";
        echo "  - 用戶ID: " . ($result['user']['user_id'] ?? '未知') . "\n";
    } catch (Exception $e) {
        echo "❌ AuthService登入失敗: " . $e->getMessage() . "\n";
    }

} catch (Exception $e) {
    echo "❌ 調試失敗: " . $e->getMessage() . "\n";
    echo "📍 錯誤位置: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

