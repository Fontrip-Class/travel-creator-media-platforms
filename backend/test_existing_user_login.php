<?php
// 測試現有用戶登入
require __DIR__ . '/vendor/autoload.php';

echo "=== 測試現有用戶登入 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    $authService = new \App\Services\AuthService($db);

    // 使用我們知道的有效用戶
    $knownUser = [
        'email' => 'pittchao@gmail.com',
        'password' => 'test123'
    ];

    echo "測試用戶: {$knownUser['email']}\n";
    echo "測試密碼: {$knownUser['password']}\n\n";

    try {
        $loginResult = $authService->login($knownUser['email'], $knownUser['password']);
        echo "✅ 登入成功!\n";
        echo "用戶 ID: {$loginResult['user_id']}\n";
        echo "用戶名: {$loginResult['username']}\n";
        echo "角色: {$loginResult['role']}\n";
        echo "Token: " . substr($loginResult['token'], 0, 50) . "...\n";
        echo "Refresh Token: " . substr($loginResult['refresh_token'], 0, 50) . "...\n";

        // 測試 token 驗證
        echo "\n--- 測試 Token 驗證 ---\n";
        try {
            $tokenData = $authService->validateToken($loginResult['token']);
            echo "✅ Token 驗證成功!\n";
            echo "用戶 ID: {$tokenData['user_id']}\n";
            echo "角色: {$tokenData['role']}\n";
        } catch (\Exception $e) {
            echo "❌ Token 驗證失敗: {$e->getMessage()}\n";
        }

        // 現在用這個用戶的 token 測試前端路由權限
        echo "\n=== 前端路由權限測試 ===\n";

        $userRole = $loginResult['role'];
        echo "用戶角色: {$userRole}\n\n";

        // 根據角色顯示應該可訪問的路由
        $roleRoutes = [
            'admin' => ['/admin', '/admin/users', '/admin/suppliers'],
            'supplier' => ['/supplier/dashboard', '/supplier/tasks', '/supplier/create-task'],
            'creator' => ['/creator/dashboard', '/creator/tasks', '/creator/portfolio'],
            'media' => ['/media/dashboard', '/media/assets']
        ];

        if (isset($roleRoutes[$userRole])) {
            echo "✅ 此用戶應該可以訪問以下路由：\n";
            foreach ($roleRoutes[$userRole] as $route) {
                echo "  - http://localhost:8080{$route}\n";
            }
        }

        echo "\n❌ 此用戶不應該能訪問其他角色的路由：\n";
        foreach ($roleRoutes as $role => $routes) {
            if ($role !== $userRole) {
                echo "  【{$role} 角色路由】\n";
                foreach ($routes as $route) {
                    echo "    - http://localhost:8080{$route}\n";
                }
            }
        }

        echo "\n=== API 測試 ===\n";
        echo "Token: {$loginResult['token']}\n";
        echo "您可以使用此 token 來測試 API 端點：\n";
        echo "curl -H \"Authorization: Bearer {$loginResult['token']}\" http://localhost:8000/api/auth/profile\n";

    } catch (\Exception $e) {
        echo "❌ 登入失敗: {$e->getMessage()}\n";
    }

} catch (Exception $e) {
    echo "❌ 初始化錯誤: " . $e->getMessage() . "\n";
}

echo "\n=== 手動測試建議 ===\n";
echo "1. 在瀏覽器中訪問 http://localhost:8080\n";
echo "2. 使用 pittchao@gmail.com / test123 登入\n";
echo "3. 確認導航欄顯示 '管理後台' 和 '登出' 按鈕\n";
echo "4. 嘗試訪問 /supplier/dashboard（應該成功）\n";
echo "5. 嘗試訪問 /admin（應該被拒絕或重定向）\n";
echo "6. 嘗試訪問 /creator/dashboard（應該被拒絕）\n";
echo "7. 點擊登出，確認清除登入狀態\n";
?>

