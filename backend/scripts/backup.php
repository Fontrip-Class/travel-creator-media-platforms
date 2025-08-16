<?php
/**
 * 🚀 旅遊平台資料庫備份腳本
 * 用於自動備份PostgreSQL資料庫
 */

// 載入環境變數
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// 備份配置
$backupConfig = [
    'enabled' => $_ENV['BACKUP_ENABLED'] ?? true,
    'path' => $_ENV['BACKUP_PATH'] ?? 'backups/',
    'retention_days' => (int) ($_ENV['BACKUP_RETENTION_DAYS'] ?? 30),
    'compression' => $_ENV['BACKUP_COMPRESSION'] ?? true,
    'schedule' => $_ENV['BACKUP_SCHEDULE'] ?? '0 2 * * *'
];

// 資料庫配置
$dbConfig = [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'port' => $_ENV['DB_PORT'] ?? 5432,
    'name' => $_ENV['DB_NAME'] ?? 'travel_platform',
    'username' => $_ENV['DB_USERNAME'] ?? 'postgres',
    'password' => $_ENV['DB_PASSWORD'] ?? ''
];

// 檢查備份是否啟用
if (!$backupConfig['enabled']) {
    echo "備份功能已停用\n";
    exit(0);
}

// 創建備份目錄
if (!is_dir($backupConfig['path'])) {
    mkdir($backupConfig['path'], 0755, true);
}

// 生成備份文件名
$timestamp = date('Y-m-d_H-i-s');
$backupFile = $backupConfig['path'] . "backup_{$dbConfig['name']}_{$timestamp}.sql";

// 執行備份
echo "開始備份資料庫: {$dbConfig['name']}\n";
echo "備份文件: {$backupFile}\n";

// 設置環境變數
putenv("PGPASSWORD={$dbConfig['password']}");

// 執行pg_dump命令
$command = sprintf(
    'pg_dump -h %s -p %s -U %s -d %s --no-password --verbose --clean --create --if-exists > %s',
    escapeshellarg($dbConfig['host']),
    escapeshellarg($dbConfig['port']),
    escapeshellarg($dbConfig['username']),
    escapeshellarg($dbConfig['name']),
    escapeshellarg($backupFile)
);

$output = [];
$returnCode = 0;

exec($command, $output, $returnCode);

if ($returnCode === 0) {
    echo "✅ 資料庫備份成功\n";
    
    // 壓縮備份文件
    if ($backupConfig['compression']) {
        $compressedFile = $backupFile . '.gz';
        $gz = gzopen($compressedFile, 'w9');
        gzwrite($gz, file_get_contents($backupFile));
        gzclose($gz);
        
        // 刪除未壓縮的文件
        unlink($backupFile);
        
        echo "✅ 備份文件已壓縮: {$compressedFile}\n";
        $backupFile = $compressedFile;
    }
    
    // 清理舊備份
    cleanupOldBackups($backupConfig['path'], $backupConfig['retention_days']);
    
    // 記錄備份日誌
    logBackup($backupFile, 'success');
    
} else {
    echo "❌ 資料庫備份失敗\n";
    echo "錯誤輸出: " . implode("\n", $output) . "\n";
    
    // 記錄錯誤日誌
    logBackup($backupFile, 'failed', implode("\n", $output));
    
    exit(1);
}

/**
 * 清理舊備份文件
 */
function cleanupOldBackups($backupPath, $retentionDays) {
    $files = glob($backupPath . 'backup_*.sql*');
    $cutoffTime = time() - ($retentionDays * 24 * 60 * 60);
    
    $deletedCount = 0;
    foreach ($files as $file) {
        if (filemtime($file) < $cutoffTime) {
            if (unlink($file)) {
                $deletedCount++;
                echo "🗑️  已刪除舊備份: " . basename($file) . "\n";
            }
        }
    }
    
    if ($deletedCount > 0) {
        echo "✅ 已清理 {$deletedCount} 個舊備份文件\n";
    }
}

/**
 * 記錄備份日誌
 */
function logBackup($backupFile, $status, $error = '') {
    $logFile = __DIR__ . '/../logs/backup.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'status' => $status,
        'file' => basename($backupFile),
        'size' => file_exists($backupFile) ? filesize($backupFile) : 0,
        'error' => $error
    ];
    
    $logLine = json_encode($logEntry, JSON_UNESCAPED_UNICODE) . "\n";
    file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
}

echo "🎯 備份完成時間: " . date('Y-m-d H:i:s') . "\n";
