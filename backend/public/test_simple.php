<?php
// 簡單測試文件
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => '後端服務正常運行',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP Built-in Server'
]);
