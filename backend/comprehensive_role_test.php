<?php
// 完整的角色權限測試
require __DIR__ . '/vendor/autoload.php';

echo "=== 完整角色權限測試 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    $authService = new \App\Services\AuthService($db);

    // 為每個角色創建測試用戶
    $testUsers = [
        'admin' => ['email' => 'admin@roletest.com', 'username' => 'admin_test'],
        'supplier' => ['email' => 'supplier@roletest.com', 'username' => 'supplier_test'],
        'creator' => ['email' => 'creator@roletest.com', 'username' => 'creator_test'],
        'media' => ['email' => 'media@roletest.com', 'username' => 'media_test']
    ];

    $password = 'test123';
    $passwordHash = password_hash($password, PASSWORD_ARGON2ID);

    echo "=== 創建測試用戶 ===\n";
    foreach ($testUsers as $role => $userData) {
        // 檢查用戶是否存在
        $existingUser = $db->fetchOne('SELECT id FROM users WHERE email = :email', ['email' => $userData['email']]);

        if (!$existingUser) {
            // 創建新用戶
            $userId = $db->insert('users', [
                'username' => $userData['username'],
                'email' => $userData['email'],
                'password_hash' => $passwordHash,
                'role' => $role,
                'is_active' => true,
                'is_verified' => true,
                'created_at' => date('Y-m-d H:i:s')
            ]);
            echo "✅ 創建 {$role} 用戶: {$userData['email']}\n";
        } else {
            // 更新現有用戶的密碼
            $db->update('users', [
                'password_hash' => $passwordHash,
                'role' => $role
            ], 'email = :email', ['email' => $userData['email']]);
            echo "✅ 更新 {$role} 用戶: {$userData['email']}\n";
        }
    }

    echo "\n=== 測試登入功能 ===\n";
    $tokens = [];

    foreach ($testUsers as $role => $userData) {
        try {
            $loginResult = $authService->login($userData['email'], $password);
            $tokens[$role] = $loginResult['token'];
            echo "✅ {$role} 登入成功 - {$userData['email']}\n";
        } catch (\Exception $e) {
            echo "❌ {$role} 登入失敗 - {$e->getMessage()}\n";
        }
    }

    echo "\n=== API 端點權限測試 ===\n";

    function testAPIEndpoint($token, $endpoint, $expectedStatus = 200) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://localhost:8000{$endpoint}");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'http_code' => $httpCode,
            'response' => json_decode($response, true),
            'success' => $httpCode === $expectedStatus
        ];
    }

    // 測試端點
    $endpoints = [
        '/api/auth/profile' => '用戶資料',
        '/api/tasks' => '任務列表（公開）',
        '/api/task-management' => '任務管理（認證）'
    ];

    foreach ($tokens as $role => $token) {
        echo "\n--- {$role} 用戶 API 測試 ---\n";
        foreach ($endpoints as $endpoint => $description) {
            $result = testAPIEndpoint($token, $endpoint);
            $status = $result['success'] ? '✅' : '❌';
            echo "{$status} {$description}: HTTP {$result['http_code']}\n";
        }
    }

    echo "\n=== 前端路由權限指南 ===\n";

    $routePermissions = [
        'admin' => [
            'allowed' => ['/admin', '/admin/users', '/admin/suppliers', '/admin/creators'],
            'denied' => ['/supplier/dashboard', '/creator/dashboard', '/media/dashboard']
        ],
        'supplier' => [
            'allowed' => ['/supplier/dashboard', '/supplier/tasks', '/supplier/create-task'],
            'denied' => ['/admin', '/creator/dashboard', '/media/dashboard']
        ],
        'creator' => [
            'allowed' => ['/creator/dashboard', '/creator/tasks', '/creator/portfolio'],
            'denied' => ['/admin', '/supplier/dashboard', '/media/dashboard']
        ],
        'media' => [
            'allowed' => ['/media/dashboard', '/media/assets'],
            'denied' => ['/admin', '/supplier/dashboard', '/creator/dashboard']
        ]
    ];

    foreach ($routePermissions as $role => $permissions) {
        echo "\n【{$role} 角色】\n";
        echo "✅ 應該可以訪問：\n";
        foreach ($permissions['allowed'] as $route) {
            echo "  - http://localhost:8080{$route}\n";
        }
        echo "❌ 應該被拒絕：\n";
        foreach ($permissions['denied'] as $route) {
            echo "  - http://localhost:8080{$route}\n";
        }
    }

    echo "\n=== 測試用戶憑證 ===\n";
    foreach ($testUsers as $role => $userData) {
        echo "{$role}: {$userData['email']} / {$password}\n";
    }

    echo "\n=== 手動測試步驟 ===\n";
    echo "1. 確保前端服務運行在 http://localhost:8080\n";
    echo "2. 確保後端服務運行在 http://localhost:8000\n";
    echo "3. 測試未登入狀態：\n";
    echo "   - 訪問受保護路由應該重定向到登入頁\n";
    echo "   - 導航欄應該顯示 '登入' 和 '註冊' 按鈕\n";
    echo "4. 使用不同角色登入並測試：\n";
    echo "   - 登入後導航欄應該顯示 '管理後台' 和 '登出'\n";
    echo "   - 只能訪問對應角色的路由\n";
    echo "   - 訪問其他角色路由應該顯示權限不足\n";
    echo "5. 測試登出功能：\n";
    echo "   - 點擊登出後應該清除登入狀態\n";
    echo "   - 導航欄應該恢復顯示 '登入' 和 '註冊'\n";

    echo "\n=== API 測試命令 ===\n";
    if (!empty($tokens)) {
        $firstRole = array_key_first($tokens);
        $firstToken = $tokens[$firstRole];
        echo "測試認證端點：\n";
        echo "curl -H \"Authorization: Bearer {$firstToken}\" http://localhost:8000/api/auth/profile\n";
        echo "\n測試未認證訪問：\n";
        echo "curl http://localhost:8000/api/task-management\n";
    }

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
    echo "文件: " . $e->getFile() . "\n";
    echo "行數: " . $e->getLine() . "\n";
}

echo "\n=== 測試完成 ===\n";
?>



