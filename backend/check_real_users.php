<?php
// 檢查真實用戶的狀態
require __DIR__ . '/vendor/autoload.php';

echo "=== 檢查真實用戶狀態 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    $authService = new \App\Services\AuthService($db);

    // 檢查的用戶
    $usersToCheck = [
        'pittchao@gmail.com',
        'snine122@gmail.com'
    ];

    echo "=== 資料庫中的用戶資料 ===\n";
    foreach ($usersToCheck as $email) {
        $user = $db->fetchOne(
            'SELECT id, username, email, role, is_active, is_verified, login_attempts, locked_until, created_at FROM users WHERE email = :email',
            ['email' => $email]
        );

        if ($user) {
            echo "\n--- {$email} ---\n";
            echo "ID: {$user['id']}\n";
            echo "用戶名: {$user['username']}\n";
            echo "角色: {$user['role']}\n";
            echo "是否活躍: " . ($user['is_active'] ? '是' : '否') . "\n";
            echo "是否驗證: " . ($user['is_verified'] ? '是' : '否') . "\n";
            echo "登入嘗試次數: {$user['login_attempts']}\n";
            echo "鎖定到: " . ($user['locked_until'] ?: '無') . "\n";
            echo "創建時間: {$user['created_at']}\n";
        } else {
            echo "\n❌ 用戶 {$email} 不存在\n";
        }
    }

    echo "\n=== 測試登入功能 ===\n";

    // 測試 pittchao@gmail.com
    echo "\n--- 測試 pittchao@gmail.com ---\n";
    try {
        $result1 = $authService->login('pittchao@gmail.com', '1qaz2wsx');
        echo "✅ pittchao 登入成功\n";
        echo "用戶ID: {$result1['user_id']}\n";
        echo "角色: {$result1['role']}\n";
        echo "Token: " . substr($result1['token'], 0, 50) . "...\n";
        file_put_contents(__DIR__ . '/pittchao_token.txt', $result1['token']);
        echo "Token 已保存到 pittchao_token.txt\n";
    } catch (\Exception $e) {
        echo "❌ pittchao 登入失敗: {$e->getMessage()}\n";

        // 檢查密碼是否正確
        $user = $db->fetchOne('SELECT password_hash FROM users WHERE email = :email', ['email' => 'pittchao@gmail.com']);
        if ($user) {
            $passwordCheck = password_verify('1qaz2wsx', $user['password_hash']);
            echo "密碼驗證: " . ($passwordCheck ? '正確' : '錯誤') . "\n";
        }
    }

    // 測試 snine122@gmail.com
    echo "\n--- 測試 snine122@gmail.com ---\n";
    try {
        $result2 = $authService->login('snine122@gmail.com', '1qaz2wsx');
        echo "✅ snine122 登入成功\n";
        echo "用戶ID: {$result2['user_id']}\n";
        echo "角色: {$result2['role']}\n";
        echo "Token: " . substr($result2['token'], 0, 50) . "...\n";
        file_put_contents(__DIR__ . '/snine122_token.txt', $result2['token']);
        echo "Token 已保存到 snine122_token.txt\n";
    } catch (\Exception $e) {
        echo "❌ snine122 登入失敗: {$e->getMessage()}\n";

        // 檢查密碼是否正確
        $user = $db->fetchOne('SELECT password_hash FROM users WHERE email = :email', ['email' => 'snine122@gmail.com']);
        if ($user) {
            $passwordCheck = password_verify('1qaz2wsx', $user['password_hash']);
            echo "密碼驗證: " . ($passwordCheck ? '正確' : '錯誤') . "\n";
        }
    }

    echo "\n=== 檢查用戶會話 ===\n";
    $sessions = $db->fetchAll(
        'SELECT user_id, expires_at, created_at FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE email IN (:email1, :email2))',
        ['email1' => 'pittchao@gmail.com', 'email2' => 'snine122@gmail.com']
    );

    if (empty($sessions)) {
        echo "沒有找到活躍會話\n";
    } else {
        foreach ($sessions as $session) {
            echo "用戶ID {$session['user_id']}: 會話到期時間 {$session['expires_at']}\n";
        }
    }

    echo "\n=== API 測試 ===\n";
    echo "如果登入成功，您可以用以下命令測試 API：\n";
    if (file_exists(__DIR__ . '/pittchao_token.txt')) {
        $token = file_get_contents(__DIR__ . '/pittchao_token.txt');
        echo "curl -H \"Authorization: Bearer {$token}\" http://localhost:8000/api/auth/profile\n";
    }

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
    echo "文件: " . $e->getFile() . "\n";
    echo "行數: " . $e->getLine() . "\n";
}
?>


