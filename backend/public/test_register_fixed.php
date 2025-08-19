<?php
// 測試修復後的註冊功能
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 載入必要的文件
require_once __DIR__ . '/../vendor/autoload.php';

try {
    // 檢查環境變數
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
    
    // 模擬註冊請求數據
    $testData = [
        'username' => 'test_user_' . time(),
        'email' => 'test_' . time() . '@example.com',
        'password' => 'Test123456',
        'phone' => '+886912345678',
        'role' => 'supplier' // 這是之前缺少的字段
    ];
    
    echo json_encode([
        'status' => 'success',
        'message' => '註冊測試數據準備完成',
        'test_data' => $testData,
        'env_vars' => [
            'APP_ENV' => $_ENV['APP_ENV'] ?? 'not_set',
            'APP_DEBUG' => $_ENV['APP_DEBUG'] ?? 'not_set',
            'DB_DRIVER' => $_ENV['DB_DRIVER'] ?? 'not_set',
            'JWT_SECRET' => $_ENV['JWT_SECRET'] ? 'set' : 'not_set'
        ],
        'timestamp' => date('Y-m-d H:i:s'),
        'note' => '現在前端會發送 role 字段，應該不會再出現驗證錯誤'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => '測試準備失敗',
        'error' => [
            'type' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
