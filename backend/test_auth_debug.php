<?php
/**
 * 調試版本的認證測試
 * 包含詳細的錯誤信息和環境檢查
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\DatabaseService;
use App\Services\AuthService;
use Respect\Validation\Validator as v;

echo "🧪 調試版本的認證測試...\n\n";

// 環境檢查
echo "=== 環境檢查 ===\n";
echo "PHP 版本: " . PHP_VERSION . "\n";
echo "當前工作目錄: " . getcwd() . "\n";
echo "Respect\Validation 版本: 檢查中...\n";
echo "已加載的擴展: " . implode(', ', get_loaded_extensions()) . "\n\n";

try {
    // 1. 測試數據庫連接
    echo "=== 1. 測試數據庫連接 ===\n";
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
    echo "✅ 數據庫連接成功\n\n";
    
    // 2. 測試用戶查詢
    echo "=== 2. 測試用戶查詢 ===\n";
    $users = $db->fetchAll("SELECT id, username, email, role FROM users LIMIT 3");
    echo "✅ 找到 " . count($users) . " 個用戶\n\n";
    
    // 3. 測試認證服務
    echo "=== 3. 測試認證服務 ===\n";
    $authService = new AuthService($db);
    echo "✅ 認證服務創建成功\n\n";
    
    // 4. 測試驗證器（直接使用）
    echo "=== 4. 測試驗證器（直接使用）===\n";
    $testData = [
        'username' => 'testuser',
        'email' => 'testuser@example.com',
        'password' => 'test123456',
        'role' => 'creator'
    ];
    
    echo "測試數據: " . json_encode($testData, JSON_UNESCAPED_UNICODE) . "\n";
    
    try {
        $validator = v::key('username', v::stringType()->length(3, 50)->regex('/^[\p{Han}a-zA-Z0-9_\s]+$/u'))
                     ->key('email', v::email())
                     ->key('password', v::stringType()->length(6, 255))
                     ->key('role', v::in(['supplier', 'creator', 'media']));
        
        $validator->assert($testData);
        echo "✅ 驗證器測試通過\n\n";
    } catch (Exception $e) {
        echo "❌ 驗證器測試失敗: " . $e->getMessage() . "\n";
        echo "錯誤詳情: " . $e->getTraceAsString() . "\n\n";
    }
    
    // 5. 測試用戶註冊（使用反射調用私有方法）
    echo "=== 5. 測試用戶註冊（使用反射調用私有方法）===\n";
    try {
        $reflection = new ReflectionClass($authService);
        $validateMethod = $reflection->getMethod('validateRegistrationData');
        $validateMethod->setAccessible(true);
        
        $validateMethod->invoke($authService, $testData);
        echo "✅ 私有驗證方法測試通過\n\n";
    } catch (Exception $e) {
        echo "❌ 私有驗證方法測試失敗: " . $e->getMessage() . "\n";
        echo "錯誤詳情: " . $e->getTraceAsString() . "\n\n";
    }
    
    // 6. 測試完整的註冊流程
    echo "=== 6. 測試完整的註冊流程 ===\n";
    try {
        $result = $authService->register($testData);
        echo "✅ 用戶註冊成功: " . $result['username'] . "\n\n";
    } catch (Exception $e) {
        echo "❌ 用戶註冊失敗: " . $e->getMessage() . "\n";
        echo "錯誤詳情: " . $e->getTraceAsString() . "\n\n";
    }
    
    echo "🎯 調試測試完成！\n";
    
} catch (Exception $e) {
    echo "❌ 測試失敗: " . $e->getMessage() . "\n";
    echo "錯誤詳情: " . $e->getTraceAsString() . "\n";
}
