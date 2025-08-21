<?php
// 重設用戶密碼
require __DIR__ . '/vendor/autoload.php';

echo "=== 重設用戶密碼 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    // 重設 pittchao@gmail.com 的密碼為 test123
    $email = 'pittchao@gmail.com';
    $newPassword = 'test123';
    $passwordHash = password_hash($newPassword, PASSWORD_ARGON2ID);

    echo "重設用戶: {$email}\n";
    echo "新密碼: {$newPassword}\n";

    $result = $db->update('users', [
        'password_hash' => $passwordHash
    ], 'email = :email', ['email' => $email]);

    if ($result > 0) {
        echo "✅ 密碼重設成功\n";

        // 測試登入
        echo "\n--- 測試登入 ---\n";
        $authService = new \App\Services\AuthService($db);

        try {
            $loginResult = $authService->login($email, $newPassword);
            echo "✅ 登入測試成功!\n";
            echo "用戶: {$loginResult['username']}\n";
            echo "角色: {$loginResult['role']}\n";
            echo "Token: " . substr($loginResult['token'], 0, 50) . "...\n";

            // 將 token 保存到文件，方便前端測試
            file_put_contents(__DIR__ . '/test_token.txt', $loginResult['token']);
            echo "Token 已保存到 test_token.txt\n";

        } catch (\Exception $e) {
            echo "❌ 登入測試失敗: {$e->getMessage()}\n";
        }
    } else {
        echo "❌ 密碼重設失敗，用戶可能不存在\n";
    }

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
}
?>



