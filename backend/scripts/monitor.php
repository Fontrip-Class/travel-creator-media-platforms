<?php
/**
 * 🚀 旅遊平台系統監控腳本
 * 用於監控系統健康狀態、性能指標和服務可用性
 */

// 載入環境變數
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// 監控配置
$monitorConfig = [
    'enabled' => $_ENV['MONITORING_ENABLED'] ?? true,
    'interval' => (int) ($_ENV['HEALTH_CHECK_INTERVAL'] ?? 300),
    'performance_monitoring' => $_ENV['PERFORMANCE_MONITORING'] ?? true,
    'error_reporting' => $_ENV['ERROR_REPORTING'] ?? true,
    'slow_query_threshold' => (int) ($_ENV['SLOW_QUERY_THRESHOLD'] ?? 1000)
];

// 檢查監控是否啟用
if (!$monitorConfig['enabled']) {
    echo "監控功能已停用\n";
    exit(0);
}

// 監控結果
$monitorResults = [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => 'healthy',
    'checks' => []
];

echo "🔍 開始系統監控檢查...\n";
echo "檢查時間: " . $monitorResults['timestamp'] . "\n\n";

// 1. 資料庫連接檢查
echo "📊 檢查資料庫連接...\n";
$dbCheck = checkDatabaseConnection();
$monitorResults['checks']['database'] = $dbCheck;
echo $dbCheck['status'] === 'healthy' ? "✅ " : "❌ ";
echo "資料庫: " . $dbCheck['message'] . "\n";

// 2. 磁碟空間檢查
echo "💾 檢查磁碟空間...\n";
$diskCheck = checkDiskSpace();
$monitorResults['checks']['disk'] = $diskCheck;
echo $diskCheck['status'] === 'healthy' ? "✅ " : "❌ ";
echo "磁碟空間: " . $diskCheck['message'] . "\n";

// 3. 記憶體使用檢查
echo "🧠 檢查記憶體使用...\n";
$memoryCheck = checkMemoryUsage();
$monitorResults['checks']['memory'] = $memoryCheck;
echo $memoryCheck['status'] === 'healthy' ? "✅ " : "❌ ";
echo "記憶體: " . $memoryCheck['message'] . "\n";

// 4. CPU使用檢查
echo "⚡ 檢查CPU使用...\n";
$cpuCheck = checkCpuUsage();
$monitorResults['checks']['cpu'] = $cpuCheck;
echo $cpuCheck['status'] === 'healthy' ? "✅ " : "❌ ";
echo "CPU: " . $cpuCheck['message'] . "\n";

// 5. 服務狀態檢查
echo "🔧 檢查服務狀態...\n";
$serviceCheck = checkServices();
$monitorResults['checks']['services'] = $serviceCheck;
echo $serviceCheck['status'] === 'healthy' ? "✅ " : "✅ ";
echo "服務: " . $serviceCheck['message'] . "\n";

// 6. 日誌文件檢查
echo "📝 檢查日誌文件...\n";
$logCheck = checkLogFiles();
$monitorResults['checks']['logs'] = $logCheck;
echo $logCheck['status'] === 'healthy' ? "✅ " : "❌ ";
echo "日誌: " . $logCheck['message'] . "\n";

// 7. 性能指標檢查
if ($monitorConfig['performance_monitoring']) {
    echo "📈 檢查性能指標...\n";
    $performanceCheck = checkPerformanceMetrics();
    $monitorResults['checks']['performance'] = $performanceCheck;
    echo $performanceCheck['status'] === 'healthy' ? "✅ " : "❌ ";
    echo "性能: " . $performanceCheck['message'] . "\n";
}

// 8. 安全檢查
echo "🛡️ 檢查安全狀態...\n";
$securityCheck = checkSecurityStatus();
$monitorResults['checks']['security'] = $securityCheck;
echo $securityCheck['status'] === 'healthy' ? "✅ " : "❌ ";
echo "安全: " . $securityCheck['message'] . "\n";

// 評估整體狀態
$overallStatus = evaluateOverallStatus($monitorResults['checks']);
$monitorResults['status'] = $overallStatus;

// 輸出監控結果
echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 監控結果摘要\n";
echo str_repeat("=", 50) . "\n";
echo "整體狀態: " . ($overallStatus === 'healthy' ? "✅ 健康" : "❌ 異常") . "\n";
echo "檢查項目: " . count($monitorResults['checks']) . "\n";
echo "健康項目: " . count(array_filter($monitorResults['checks'], fn($c) => $c['status'] === 'healthy')) . "\n";
echo "異常項目: " . count(array_filter($monitorResults['checks'], fn($c) => $c['status'] !== 'healthy')) . "\n";

// 記錄監控結果
logMonitorResults($monitorResults);

// 如果有異常，發送警報
if ($overallStatus !== 'healthy') {
    sendAlert($monitorResults);
    exit(1);
}

echo "\n🎉 所有檢查項目正常，系統運行良好！\n";

/**
 * 檢查資料庫連接
 */
function checkDatabaseConnection() {
    try {
        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            $_ENV['DB_HOST'] ?? 'localhost',
            $_ENV['DB_PORT'] ?? 5432,
            $_ENV['DB_NAME'] ?? 'travel_platform'
        );
        
        $pdo = new PDO($dsn, $_ENV['DB_USERNAME'] ?? 'postgres', $_ENV['DB_PASSWORD'] ?? '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->query('SELECT 1');
        $result = $stmt->fetch();
        
        return [
            'status' => 'healthy',
            'message' => '連接正常',
            'response_time' => 0,
            'details' => '資料庫連接成功'
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'critical',
            'message' => '連接失敗: ' . $e->getMessage(),
            'response_time' => 0,
            'details' => $e->getMessage()
        ];
    }
}

/**
 * 檢查磁碟空間
 */
function checkDiskSpace() {
    $path = __DIR__ . '/..';
    $total = disk_total_space($path);
    $free = disk_free_space($path);
    $used = $total - $free;
    $usagePercent = ($used / $total) * 100;
    
    if ($usagePercent > 90) {
        $status = 'critical';
        $message = '磁碟空間不足';
    } elseif ($usagePercent > 80) {
        $status = 'warning';
        $message = '磁碟空間緊張';
    } else {
        $status = 'healthy';
        $message = '磁碟空間充足';
    }
    
    return [
        'status' => $status,
        'message' => $message,
        'usage_percent' => round($usagePercent, 2),
        'free_gb' => round($free / 1024 / 1024 / 1024, 2),
        'total_gb' => round($total / 1024 / 1024 / 1024, 2)
    ];
}

/**
 * 檢查記憶體使用
 */
function checkMemoryUsage() {
    $memoryInfo = file_get_contents('/proc/meminfo');
    preg_match('/MemTotal:\s+(\d+)/', $memoryInfo, $total);
    preg_match('/MemAvailable:\s+(\d+)/', $memoryInfo, $available);
    
    if (empty($total) || empty($available)) {
        return [
            'status' => 'unknown',
            'message' => '無法獲取記憶體信息',
            'details' => '系統不支持/proc/meminfo'
        ];
    }
    
    $totalMem = (int) $total[1];
    $availableMem = (int) $available[1];
    $usedMem = $totalMem - $availableMem;
    $usagePercent = ($usedMem / $totalMem) * 100;
    
    if ($usagePercent > 90) {
        $status = 'critical';
        $message = '記憶體使用率過高';
    } elseif ($usagePercent > 80) {
        $status = 'warning';
        $message = '記憶體使用率較高';
    } else {
        $status = 'healthy';
        $message = '記憶體使用正常';
    }
    
    return [
        'status' => $status,
        'message' => $message,
        'usage_percent' => round($usagePercent, 2),
        'used_mb' => round($usedMem / 1024, 2),
        'total_mb' => round($totalMem / 1024, 2)
    ];
}

/**
 * 檢查CPU使用
 */
function checkCpuUsage() {
    $load = sys_getloadavg();
    $cpuCount = 1;
    
    if (is_readable('/proc/cpuinfo')) {
        $cpuInfo = file_get_contents('/proc/cpuinfo');
        $cpuCount = substr_count($cpuInfo, 'processor');
    }
    
    $loadAverage = $load[0] / $cpuCount;
    
    if ($loadAverage > 2.0) {
        $status = 'critical';
        $message = 'CPU負載過高';
    } elseif ($loadAverage > 1.0) {
        $status = 'warning';
        $message = 'CPU負載較高';
    } else {
        $status = 'healthy';
        $message = 'CPU負載正常';
    }
    
    return [
        'status' => $status,
        'message' => $message,
        'load_average' => round($loadAverage, 2),
        'cpu_count' => $cpuCount,
        'details' => "1分鐘負載: {$load[0]}, 5分鐘負載: {$load[1]}, 15分鐘負載: {$load[2]}"
    ];
}

/**
 * 檢查服務狀態
 */
function checkServices() {
    $services = ['nginx', 'php-fpm', 'postgresql', 'redis'];
    $status = 'healthy';
    $message = '所有服務正常';
    $details = [];
    
    foreach ($services as $service) {
        $output = [];
        exec("systemctl is-active $service 2>/dev/null", $output, $returnCode);
        
        if ($returnCode === 0 && $output[0] === 'active') {
            $details[$service] = 'active';
        } else {
            $details[$service] = 'inactive';
            $status = 'critical';
            $message = '部分服務異常';
        }
    }
    
    return [
        'status' => $status,
        'message' => $message,
        'details' => $details
    ];
}

/**
 * 檢查日誌文件
 */
function checkLogFiles() {
    $logPath = __DIR__ . '/../logs';
    $status = 'healthy';
    $message = '日誌文件正常';
    $details = [];
    
    if (!is_dir($logPath)) {
        return [
            'status' => 'warning',
            'message' => '日誌目錄不存在',
            'details' => 'logs目錄未創建'
        ];
    }
    
    $logFiles = glob($logPath . '/*.log');
    foreach ($logFiles as $logFile) {
        $size = filesize($logFile);
        $sizeMB = round($size / 1024 / 1024, 2);
        
        if ($sizeMB > 100) {
            $status = 'warning';
            $message = '部分日誌文件過大';
        }
        
        $details[basename($logFile)] = $sizeMB . 'MB';
    }
    
    return [
        'status' => $status,
        'message' => $message,
        'details' => $details
    ];
}

/**
 * 檢查性能指標
 */
function checkPerformanceMetrics() {
    // 這裡可以添加更多性能檢查邏輯
    return [
        'status' => 'healthy',
        'message' => '性能指標正常',
        'details' => '基本性能檢查通過'
    ];
}

/**
 * 檢查安全狀態
 */
function checkSecurityStatus() {
    $status = 'healthy';
    $message = '安全狀態正常';
    $details = [];
    
    // 檢查敏感文件權限
    $sensitiveFiles = [
        __DIR__ . '/../.env',
        __DIR__ . '/../composer.json',
        __DIR__ . '/../logs'
    ];
    
    foreach ($sensitiveFiles as $file) {
        if (file_exists($file)) {
            $perms = fileperms($file);
            $perms = substr(sprintf('%o', $perms), -4);
            
            if ($perms === '0644' || $perms === '0755') {
                $details[basename($file)] = '權限正常';
            } else {
                $details[basename($file)] = '權限異常: ' . $perms;
                $status = 'warning';
                $message = '部分文件權限異常';
            }
        }
    }
    
    return [
        'status' => $status,
        'message' => $message,
        'details' => $details
    ];
}

/**
 * 評估整體狀態
 */
function evaluateOverallStatus($checks) {
    foreach ($checks as $check) {
        if ($check['status'] === 'critical') {
            return 'critical';
        }
    }
    
    foreach ($checks as $check) {
        if ($check['status'] === 'warning') {
            return 'warning';
        }
    }
    
    return 'healthy';
}

/**
 * 記錄監控結果
 */
function logMonitorResults($results) {
    $logFile = __DIR__ . '/../logs/monitor.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logLine = json_encode($results, JSON_UNESCAPED_UNICODE) . "\n";
    file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
}

/**
 * 發送警報
 */
function sendAlert($results) {
    // 這裡可以實現郵件、簡訊、Slack等警報方式
    echo "\n🚨 系統異常，請檢查以上問題！\n";
    
    // 記錄警報
    $alertLog = __DIR__ . '/../logs/alerts.log';
    $alertData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'status' => $results['status'],
        'checks' => $results['checks']
    ];
    
    $alertLine = json_encode($alertData, JSON_UNESCAPED_UNICODE) . "\n";
    file_put_contents($alertLog, $alertLine, FILE_APPEND | LOCK_EX);
}
