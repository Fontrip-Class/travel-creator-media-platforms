<?php
// 測試前端整合
require __DIR__ . '/vendor/autoload.php';

echo "=== 前端整合測試 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    $authService = new \App\Services\AuthService($db);

    echo "=== 測試修復後的登入流程 ===\n";

    // 測試用戶憑證
    $testUsers = [
        ['email' => 'pittchao@gmail.com', 'password' => '1qaz2wsx'],
        ['email' => 'snine122@gmail.com', 'password' => '1qaz2wsx']
    ];

    foreach ($testUsers as $i => $user) {
        echo "\n--- 測試用戶 " . ($i + 1) . ": {$user['email']} ---\n";

        try {
            $loginResult = $authService->login($user['email'], $user['password']);
            echo "✅ 登入成功\n";
            echo "用戶ID: {$loginResult['user_id']}\n";
            echo "用戶名: {$loginResult['username']}\n";
            echo "角色: {$loginResult['role']}\n";
            echo "Token: " . substr($loginResult['token'], 0, 50) . "...\n";
            echo "Refresh Token: " . substr($loginResult['refresh_token'], 0, 50) . "...\n";

            // 驗證 token
            echo "\n🔍 驗證 Token...\n";
            try {
                $tokenData = $authService->validateToken($loginResult['token']);
                echo "✅ Token 有效\n";
                echo "用戶ID: {$tokenData['user_id']}\n";
                echo "角色: {$tokenData['role']}\n";
            } catch (\Exception $e) {
                echo "❌ Token 驗證失敗: {$e->getMessage()}\n";
            }

            // 測試用戶資料端點（模擬前端呼叫）
            echo "\n📱 測試用戶資料端點...\n";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/users/profile');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer {$loginResult['token']}",
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200) {
                echo "✅ 用戶資料端點正常 (HTTP {$httpCode})\n";
                $responseData = json_decode($response, true);
                if ($responseData && isset($responseData['data'])) {
                    echo "用戶資料: " . $responseData['data']['username'] . " ({$responseData['data']['role']})\n";
                }
            } else {
                echo "❌ 用戶資料端點錯誤 (HTTP {$httpCode})\n";
                echo "回應: " . substr($response, 0, 200) . "\n";
            }

        } catch (\Exception $e) {
            echo "❌ 登入失敗: {$e->getMessage()}\n";
        }
    }

    echo "\n=== 前端測試指南 ===\n";
    echo "修復完成！現在您可以在前端測試：\n\n";

    echo "🌐 打開瀏覽器訪問: http://localhost:8080\n\n";

    echo "🔑 使用以下憑證登入：\n";
    echo "用戶1: pittchao@gmail.com / 1qaz2wsx (supplier)\n";
    echo "用戶2: snine122@gmail.com / 1qaz2wsx (supplier)\n\n";

    echo "✅ 登入後應該看到：\n";
    echo "1. 導航欄顯示 '管理後台' 和 '登出' 按鈕\n";
    echo "2. 隱藏 '登入' 和 '註冊' 按鈕\n";
    echo "3. 自動重定向到 /supplier/dashboard\n\n";

    echo "🎯 可以訪問的頁面：\n";
    echo "- http://localhost:8080/supplier/dashboard\n";
    echo "- http://localhost:8080/supplier/tasks\n";
    echo "- http://localhost:8080/supplier/create-task\n\n";

    echo "🚫 不應該能訪問：\n";
    echo "- http://localhost:8080/admin (應顯示權限不足)\n";
    echo "- http://localhost:8080/creator/dashboard (應顯示權限不足)\n\n";

    echo "🔍 偵錯提示：\n";
    echo "如果還有問題，請檢查瀏覽器開發者工具：\n";
    echo "1. Console 標籤 - 查看 JavaScript 錯誤\n";
    echo "2. Network 標籤 - 查看 API 請求是否成功\n";
    echo "3. Application > Local Storage - 確認 auth_token 已保存\n";
    echo "4. 重新整理頁面，確認自動身份驗證正常\n\n";

    echo "🧪 API 測試命令：\n";
    if (file_exists(__DIR__ . '/pittchao_working_token.txt')) {
        $token = file_get_contents(__DIR__ . '/pittchao_working_token.txt');
        echo "PowerShell:\n";
        echo "\$headers = @{'Authorization'='Bearer {$token}'}\n";
        echo "Invoke-RestMethod -Uri 'http://localhost:8000/api/users/profile' -Headers \$headers\n\n";
    }

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
}

echo "=== 測試完成 ===\n";
?>



