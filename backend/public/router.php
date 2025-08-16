<?php
// 路由文件 - 處理所有請求
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// 如果請求的是實際文件，直接提供
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// 否則載入index.php
require_once __DIR__ . '/index.php';
