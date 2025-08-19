<?php
// 註冊測試端點 - 用於診斷註冊問題
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
    
    echo json_encode([
        'status' => 'success',
        'message' => '環境變數載入成功',
        'env_vars' => [
            'APP_ENV' => $_ENV['APP_ENV'] ?? 'not_set',
            'APP_DEBUG' => $_ENV['APP_DEBUG'] ?? 'not_set',
            'DB_DRIVER' => $_ENV['DB_DRIVER'] ?? 'not_set',
            'JWT_SECRET' => $_ENV['JWT_SECRET'] ? 'set' : 'not_set'
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => '環境變數載入失敗',
        'error' => [
            'type' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
