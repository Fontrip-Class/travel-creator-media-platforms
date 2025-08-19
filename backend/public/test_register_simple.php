<?php
// 簡化註冊測試 - 直接測試數據庫連接
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$response = ['status' => 'testing', 'timestamp' => date('Y-m-d H:i:s')];

try {
    // 1. 檢查PHP版本和擴展
    $response['php_info'] = [
        'version' => PHP_VERSION,
        'extensions' => [
            'pdo' => extension_loaded('pdo'),
            'pdo_sqlite' => extension_loaded('pdo_sqlite'),
            'pdo_mysql' => extension_loaded('pdo_mysql'),
            'pdo_pgsql' => extension_loaded('pdo_pgsql'),
            'json' => extension_loaded('json'),
            'mbstring' => extension_loaded('mbstring')
        ]
    ];

    // 2. 檢查目錄權限
    $response['directories'] = [
        'logs' => [
            'exists' => is_dir(__DIR__ . '/../logs'),
            'writable' => is_writable(__DIR__ . '/../logs') || is_writable(__DIR__ . '/..'),
            'path' => __DIR__ . '/../logs'
        ],
        'database' => [
            'exists' => is_dir(__DIR__ . '/../database'),
            'writable' => is_writable(__DIR__ . '/../database') || is_writable(__DIR__ . '/..'),
            'path' => __DIR__ . '/../database'
        ],
        'uploads' => [
            'exists' => is_dir(__DIR__ . '/../uploads'),
            'writable' => is_writable(__DIR__ . '/../uploads') || is_writable(__DIR__ . '/..'),
            'path' => __DIR__ . '/../uploads'
        ]
    ];

    // 3. 檢查vendor目錄
    $response['vendor'] = [
        'exists' => is_dir(__DIR__ . '/../vendor'),
        'autoload_exists' => file_exists(__DIR__ . '/../vendor/autoload.php')
    ];

    // 4. 嘗試連接SQLite數據庫
    $dbPath = __DIR__ . '/../database/travel_platform.db';
    $response['database'] = [
        'path' => $dbPath,
        'exists' => file_exists($dbPath),
        'size' => file_exists($dbPath) ? filesize($dbPath) : 'N/A'
    ];

    if (file_exists($dbPath)) {
        try {
            $pdo = new PDO("sqlite:$dbPath");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // 檢查表結構
            $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
            $response['database']['tables'] = $tables;
            $response['database']['connection'] = 'success';
            
        } catch (PDOException $e) {
            $response['database']['connection'] = 'failed';
            $response['database']['error'] = $e->getMessage();
        }
    }

    // 5. 檢查環境變數
    $response['environment'] = [
        'APP_ENV' => $_ENV['APP_ENV'] ?? 'not_set',
        'APP_DEBUG' => $_ENV['APP_DEBUG'] ?? 'not_set',
        'DB_DRIVER' => $_ENV['DB_DRIVER'] ?? 'not_set',
        'JWT_SECRET' => $_ENV['JWT_SECRET'] ? 'set' : 'not_set'
    ];

    $response['status'] = 'success';
    $response['message'] = '診斷完成';

} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = '診斷過程中發生錯誤';
    $response['error'] = [
        'type' => get_class($e),
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
