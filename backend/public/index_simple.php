<?php

use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

// 創建應用
$app = AppFactory::create();

// 添加錯誤處理
$app->addErrorMiddleware(true, true, true);

// 簡單的路由測試
$app->get('/', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'message' => '旅遊創作者媒體平台後端API',
        'status' => 'running',
        'timestamp' => date('Y-m-d H:i:s')
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/health', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'php_version' => PHP_VERSION
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/test', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'message' => 'API測試成功！',
        'endpoints' => ['/', '/api/health', '/api/test']
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// 運行應用
$app->run();
