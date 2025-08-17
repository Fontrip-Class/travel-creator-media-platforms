<?php
/**
 * 直接測試認證功能
 * 繞過路由系統，直接測試核心邏輯
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\DatabaseService;
use App\Services\AuthService;
use App\Services\ApiResponseService;

echo "🧪 直接測試認證功能...\n\n";

try {
    // 1. 測試數據庫連接
    echo "1. 測試數據庫連接...\n";
    $config = [
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ],
    ];
    
    $db = new DatabaseService($config);
    $connection = $db->getConnection();
    echo "   ✅ 數據庫連接成功\n";
    
    // 2. 測試用戶查詢
    echo "\n2. 測試用戶查詢...\n";
    $users = $db->fetchAll("SELECT id, username, email, role FROM users LIMIT 5");
    echo "   ✅ 找到 " . count($users) . " 個用戶:\n";
    foreach ($users as $user) {
        echo "      - {$user['username']} ({$user['email']}) - {$user['role']}\n";
    }
    
    // 3. 測試認證服務
    echo "\n3. 測試認證服務...\n";
    $authService = new AuthService($db);
    echo "   ✅ 認證服務創建成功\n";
    
    // 4. 測試用戶註冊
    echo "\n4. 測試用戶註冊...\n";
    $testUserData = [
        'username' => 'testuser',
        'email' => 'testuser@example.com',
        'password' => 'test123456',
        'role' => 'creator'
    ];
    
    try {
        $result = $authService->register($testUserData);
        echo "   ✅ 用戶註冊成功: " . $result['username'] . "\n";
    } catch (Exception $e) {
        echo "   ❌ 用戶註冊失敗: " . $e->getMessage() . "\n";
        echo "      錯誤詳情: " . $e->getTraceAsString() . "\n";
    }
    
    // 5. 測試用戶登入
    echo "\n5. 測試用戶登入...\n";
    try {
        $loginResult = $authService->login($testUserData['email'], $testUserData['password']);
        echo "   ✅ 用戶登入成功: " . $loginResult['user']['username'] . "\n";
        echo "      Token: " . substr($loginResult['token'], 0, 20) . "...\n";
    } catch (Exception $e) {
        echo "   ❌ 用戶登入失敗: " . $e->getMessage() . "\n";
        echo "      錯誤詳情: " . $e->getTraceAsString() . "\n";
    }
    
    echo "\n🎯 直接測試完成！\n";
    
} catch (Exception $e) {
    echo "❌ 測試失敗: " . $e->getMessage() . "\n";
    echo "錯誤詳情: " . $e->getTraceAsString() . "\n";
}
