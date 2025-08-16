<?php
/**
 * 🚀 旅遊平台隊列工作腳本
 * 用於處理非同步任務，如郵件發送、通知處理等
 */

// 載入環境變數
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// 隊列配置
$queueConfig = [
    'enabled' => true,
    'sleep_time' => 3,
    'max_jobs' => 1000,
    'max_time' => 3600, // 1小時
    'memory_limit' => '512M'
];

// 設置記憶體限制
ini_set('memory_limit', $queueConfig['memory_limit']);

// 隊列統計
$stats = [
    'start_time' => time(),
    'jobs_processed' => 0,
    'jobs_failed' => 0,
    'memory_peak' => 0
];

echo "🚀 旅遊平台隊列工作器啟動\n";
echo "啟動時間: " . date('Y-m-d H:i:s') . "\n";
echo "記憶體限制: " . $queueConfig['memory_limit'] . "\n";
echo "最大任務數: " . $queueConfig['max_jobs'] . "\n";
echo "最大運行時間: " . $queueConfig['max_time'] . " 秒\n\n";

// 註冊信號處理器
pcntl_signal(SIGTERM, 'signalHandler');
pcntl_signal(SIGINT, 'signalHandler');

// 主循環
$running = true;
while ($running && shouldContinue($stats, $queueConfig)) {
    // 處理信號
    pcntl_signal_dispatch();
    
    try {
        // 獲取下一個任務
        $job = getNextJob();
        
        if ($job) {
            echo "📋 處理任務: " . $job['id'] . " (" . $job['type'] . ")\n";
            
            // 處理任務
            $result = processJob($job);
            
            if ($result['success']) {
                echo "✅ 任務完成: " . $job['id'] . "\n";
                $stats['jobs_processed']++;
                
                // 標記任務為完成
                markJobAsCompleted($job['id']);
                
            } else {
                echo "❌ 任務失敗: " . $job['id'] . " - " . $result['error'] . "\n";
                $stats['jobs_failed']++;
                
                // 標記任務為失敗
                markJobAsFailed($job['id'], $result['error']);
            }
            
        } else {
            // 沒有任務，等待一段時間
            echo "⏳ 沒有待處理任務，等待 " . $queueConfig['sleep_time'] . " 秒...\n";
            sleep($queueConfig['sleep_time']);
        }
        
        // 更新記憶體使用統計
        $stats['memory_peak'] = max($stats['memory_peak'], memory_get_peak_usage(true));
        
        // 檢查記憶體使用
        if (memory_get_usage(true) > 100 * 1024 * 1024) { // 100MB
            echo "⚠️  記憶體使用較高，執行垃圾回收\n";
            gc_collect_cycles();
        }
        
    } catch (Exception $e) {
        echo "🚨 處理任務時發生錯誤: " . $e->getMessage() . "\n";
        logError($e);
        
        // 短暫等待後繼續
        sleep(1);
    }
}

// 輸出統計信息
echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 隊列工作器統計\n";
echo str_repeat("=", 50) . "\n";
echo "運行時間: " . (time() - $stats['start_time']) . " 秒\n";
echo "處理任務: " . $stats['jobs_processed'] . "\n";
echo "失敗任務: " . $stats['jobs_failed'] . "\n";
echo "記憶體峰值: " . formatBytes($stats['memory_peak']) . "\n";
echo "完成時間: " . date('Y-m-d H:i:s') . "\n";

/**
 * 信號處理器
 */
function signalHandler($signal) {
    global $running;
    
    echo "\n📡 收到信號 " . $signal . "，準備關閉...\n";
    $running = false;
}

/**
 * 檢查是否應該繼續運行
 */
function shouldContinue($stats, $config) {
    // 檢查最大任務數
    if ($stats['jobs_processed'] >= $config['max_jobs']) {
        echo "📊 已達到最大任務數限制\n";
        return false;
    }
    
    // 檢查最大運行時間
    if ((time() - $stats['start_time']) >= $config['max_time']) {
        echo "⏰ 已達到最大運行時間限制\n";
        return false;
    }
    
    return true;
}

/**
 * 獲取下一個任務
 */
function getNextJob() {
    try {
        // 這裡應該從資料庫或Redis隊列中獲取任務
        // 目前返回模擬任務
        return [
            'id' => uniqid(),
            'type' => 'email',
            'data' => [
                'to' => 'test@example.com',
                'subject' => '測試郵件',
                'body' => '這是一封測試郵件'
            ],
            'created_at' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        logError($e);
        return null;
    }
}

/**
 * 處理任務
 */
function processJob($job) {
    try {
        switch ($job['type']) {
            case 'email':
                return processEmailJob($job);
                
            case 'notification':
                return processNotificationJob($job);
                
            case 'file_upload':
                return processFileUploadJob($job);
                
            case 'data_export':
                return processDataExportJob($job);
                
            default:
                return [
                    'success' => false,
                    'error' => '未知任務類型: ' . $job['type']
                ];
        }
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

/**
 * 處理郵件任務
 */
function processEmailJob($job) {
    $data = $job['data'];
    
    // 模擬郵件發送
    echo "📧 發送郵件到: " . $data['to'] . "\n";
    echo "主題: " . $data['subject'] . "\n";
    
    // 這裡應該調用實際的郵件發送服務
    // 例如：sendEmail($data['to'], $data['subject'], $data['body']);
    
    // 模擬處理時間
    usleep(100000); // 0.1秒
    
    return [
        'success' => true,
        'message' => '郵件發送成功'
    ];
}

/**
 * 處理通知任務
 */
function processNotificationJob($job) {
    $data = $job['data'];
    
    echo "🔔 發送通知: " . $data['message'] . "\n";
    
    // 這裡應該調用實際的通知服務
    // 例如：sendNotification($data['user_id'], $data['message']);
    
    usleep(50000); // 0.05秒
    
    return [
        'success' => true,
        'message' => '通知發送成功'
    ];
}

/**
 * 處理文件上傳任務
 */
function processFileUploadJob($job) {
    $data = $job['data'];
    
    echo "📁 處理文件上傳: " . $data['filename'] . "\n";
    
    // 這裡應該處理文件上傳後的任務
    // 例如：生成縮圖、提取元數據等
    
    usleep(200000); // 0.2秒
    
    return [
        'success' => true,
        'message' => '文件處理完成'
    ];
}

/**
 * 處理數據導出任務
 */
function processDataExportJob($job) {
    $data = $job['data'];
    
    echo "📊 處理數據導出: " . $data['format'] . "\n";
    
    // 這裡應該處理數據導出任務
    // 例如：生成CSV、PDF報表等
    
    usleep(500000); // 0.5秒
    
    return [
        'success' => true,
        'message' => '數據導出完成'
    ];
}

/**
 * 標記任務為完成
 */
function markJobAsCompleted($jobId) {
    // 這裡應該更新資料庫中的任務狀態
    echo "✅ 標記任務 {$jobId} 為完成\n";
}

/**
 * 標記任務為失敗
 */
function markJobAsFailed($jobId, $error) {
    // 這裡應該更新資料庫中的任務狀態
    echo "❌ 標記任務 {$jobId} 為失敗: {$error}\n";
}

/**
 * 記錄錯誤
 */
function logError($exception) {
    $logFile = __DIR__ . '/../logs/queue-worker-error.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'error' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString()
    ];
    
    $logLine = json_encode($logEntry, JSON_UNESCAPED_UNICODE) . "\n";
    file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
}

/**
 * 格式化字節數
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}
