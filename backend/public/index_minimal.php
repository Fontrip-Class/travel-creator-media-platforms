<?php
// 最小化版本 - 只包含基本功能
require __DIR__ . '/../vendor/autoload.php';

// 创建Slim应用
$app = Slim\Factory\AppFactory::create();

// 添加错误处理
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// 添加根路由
$app->get('/', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'message' => '旅遊創作者媒體平台後端API',
        'status' => 'running',
        'timestamp' => date('Y-m-d H:i:s')
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// 添加健康检查端点
$app->get('/api/health', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'php_version' => PHP_VERSION
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// 运行应用
$app->run();
?>


