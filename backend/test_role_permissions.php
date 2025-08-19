<?php
// 測試不同角色的路由訪問權限
require __DIR__ . '/vendor/autoload.php';

echo "=== 角色權限測試 ===\n";

// 測試用戶資料
$testUsers = [
    'admin' => [
        'email' => 'admin@test.com',
        'password' => 'test123',
        'role' => 'admin'
    ],
    'supplier' => [
        'email' => 'supplier@test.com',
        'password' => 'test123',
        'role' => 'supplier'
    ],
    'creator' => [
        'email' => 'creator@test.com',
        'password' => 'test123',
        'role' => 'creator'
    ],
    'media' => [
        'email' => 'media@test.com',
        'password' => 'test123',
        'role' => 'media'
    ]
];

// 需要測試的受保護路由
$protectedRoutes = [
    'admin' => [
        '/admin',
        '/admin/users',
        '/admin/suppliers',
        '/admin/creators',
        '/admin/tasks'
    ],
    'supplier' => [
        '/supplier/dashboard',
        '/supplier/tasks',
        '/supplier/create-task'
    ],
    'creator' => [
        '/creator/dashboard',
        '/creator/tasks',
        '/creator/portfolio'
    ],
    'media' => [
        '/media/dashboard',
        '/media/assets'
    ]
];

echo "\n=== 測試用戶資料 ===\n";
foreach ($testUsers as $role => $userData) {
    echo "- {$role}: {$userData['email']} / {$userData['password']}\n";
}

echo "\n=== 前端路由保護測試 ===\n";
echo "以下路由應該受到角色保護：\n\n";

foreach ($protectedRoutes as $role => $routes) {
    echo "【{$role} 角色路由】\n";
    foreach ($routes as $route) {
        echo "  - http://localhost:8080{$route}\n";
    }
    echo "\n";
}

echo "=== 手動測試步驟 ===\n";
echo "1. 開啟瀏覽器訪問 http://localhost:8080\n";
echo "2. 嘗試直接訪問受保護路由（應該重定向到登入頁面）\n";
echo "3. 使用不同角色的帳號登入\n";
echo "4. 確認只能訪問對應角色的路由\n";
echo "5. 嘗試訪問其他角色的路由（應該顯示權限不足）\n\n";

echo "=== API 身份驗證測試 ===\n";

function testLogin($email, $password) {
    $data = json_encode([
        'email' => $email,
        'password' => $password
    ]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/auth/login');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'http_code' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

function testProtectedAPI($token, $endpoint) {
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
        'response' => json_decode($response, true)
    ];
}

// 測試登入和 token 獲取
echo "測試登入功能：\n";
$tokens = [];

foreach ($testUsers as $role => $userData) {
    echo "\n--- 測試 {$role} 登入 ---\n";
    $result = testLogin($userData['email'], $userData['password']);

    if ($result['http_code'] === 200 && isset($result['response']['data']['token'])) {
        $tokens[$role] = $result['response']['data']['token'];
        echo "✅ {$role} 登入成功\n";
        echo "   Token: " . substr($tokens[$role], 0, 50) . "...\n";
        echo "   角色: " . ($result['response']['data']['role'] ?? 'N/A') . "\n";
    } else {
        echo "❌ {$role} 登入失敗\n";
        echo "   HTTP Code: {$result['http_code']}\n";
        echo "   Response: " . json_encode($result['response']) . "\n";
    }
}

// 測試受保護的 API 端點
echo "\n=== API 端點訪問測試 ===\n";

$apiEndpoints = [
    '/api/auth/profile' => '用戶資料',
    '/api/task-management' => '任務管理（需要認證）',
    '/api/tasks' => '任務列表（公開）'
];

foreach ($tokens as $role => $token) {
    echo "\n--- 使用 {$role} token 測試 API ---\n";

    foreach ($apiEndpoints as $endpoint => $description) {
        $result = testProtectedAPI($token, $endpoint);
        $status = $result['http_code'] === 200 ? '✅' : '❌';
        echo "{$status} {$description}: HTTP {$result['http_code']}\n";

        if ($result['http_code'] !== 200) {
            echo "    錯誤: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
        }
    }
}

echo "\n=== 跨角色訪問測試建議 ===\n";
echo "1. 使用 supplier token 嘗試訪問 /admin 路由\n";
echo "2. 使用 creator token 嘗試訪問 /supplier 路由\n";
echo "3. 使用 media token 嘗試訪問 /creator 路由\n";
echo "4. 未登入狀態嘗試訪問任何受保護路由\n\n";

echo "=== 測試完成 ===\n";
echo "請根據上述結果檢查：\n";
echo "- 登入功能是否正常\n";
echo "- Token 是否正確生成\n";
echo "- API 端點是否正確保護\n";
echo "- 前端路由保護是否生效\n";
?>

