<?php
// 創建測試用戶
require __DIR__ . '/vendor/autoload.php';

echo "=== 創建測試用戶 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    $authService = new \App\Services\AuthService($db);

    echo "✅ 服務初始化成功\n\n";

    // 檢查現有用戶
    echo "--- 檢查現有用戶 ---\n";
    $existingUsers = $db->fetchAll("SELECT email, role FROM users");
    if (empty($existingUsers)) {
        echo "資料庫中沒有用戶\n";
    } else {
        foreach ($existingUsers as $user) {
            echo "- {$user['email']} ({$user['role']})\n";
        }
    }

    // 測試用戶資料
    $testUsers = [
        [
            'username' => 'admin',
            'email' => 'admin@test.com',
            'password' => 'test123',
            'role' => 'admin',
            'is_active' => true,
            'is_verified' => true,
            'created_at' => date('Y-m-d H:i:s')
        ],
        [
            'username' => 'supplier',
            'email' => 'supplier@test.com',
            'password' => 'test123',
            'role' => 'supplier',
            'is_active' => true,
            'is_verified' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'company_name' => 'Test Company',
            'business_type' => 'tourism'
        ],
        [
            'username' => 'creator',
            'email' => 'creator@test.com',
            'password' => 'test123',
            'role' => 'creator',
            'is_active' => true,
            'is_verified' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'specialties' => 'photography,videography',
            'platform' => 'instagram'
        ],
        [
            'username' => 'media',
            'email' => 'media@test.com',
            'password' => 'test123',
            'role' => 'media',
            'is_active' => true,
            'is_verified' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'platform_name' => 'Test Media'
        ]
    ];

    echo "\n--- 創建測試用戶 ---\n";

    foreach ($testUsers as $userData) {
        try {
            // 檢查用戶是否已存在
            if ($db->exists('users', 'email = :email', ['email' => $userData['email']])) {
                echo "⚠️  {$userData['email']} 已存在，跳過\n";
                continue;
            }

            $result = $authService->register($userData);
            echo "✅ 創建用戶成功: {$userData['email']} ({$userData['role']})\n";

        } catch (\Exception $e) {
            echo "❌ 創建用戶失敗: {$userData['email']} - {$e->getMessage()}\n";
        }
    }

    echo "\n--- 驗證創建的用戶 ---\n";
    $allUsers = $db->fetchAll("SELECT username, email, role, is_active FROM users");
    foreach ($allUsers as $user) {
        $status = $user['is_active'] ? '✅' : '❌';
        echo "{$status} {$user['username']} ({$user['email']}) - {$user['role']}\n";
    }

    echo "\n=== 測試登入功能 ===\n";

    // 測試每個用戶的登入
    foreach ($testUsers as $userData) {
        try {
            echo "\n--- 測試 {$userData['role']} 登入 ---\n";
            $loginResult = $authService->login($userData['email'], $userData['password']);
            echo "✅ 登入成功: {$userData['email']}\n";
            echo "   Token: " . substr($loginResult['token'], 0, 50) . "...\n";
            echo "   角色: {$loginResult['role']}\n";
        } catch (\Exception $e) {
            echo "❌ 登入失敗: {$userData['email']} - {$e->getMessage()}\n";
        }
    }

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
    echo "文件: " . $e->getFile() . "\n";
    echo "行數: " . $e->getLine() . "\n";
}

echo "\n=== 完成 ===\n";
?>

