<?php

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;
use Slim\Middleware\MethodOverrideMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// 載入環境變數
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// 創建容器
$containerBuilder = new ContainerBuilder();
$dependencies = require __DIR__ . '/../config/dependencies.php';
$dependencies($containerBuilder);
$container = $containerBuilder->build();

// 創建應用
$app = AppFactory::createFromContainer($container);

// 添加中間件
$app->addMiddleware(new MethodOverrideMiddleware());
$app->addMiddleware(new \App\Middleware\CorsMiddleware());
$app->addMiddleware(new \App\Middleware\JsonBodyParserMiddleware());

// 添加錯誤處理
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// 載入路由
$routes = require __DIR__ . '/../config/routes.php';
$routes($app);

// 添加一個根路由處理器
$app->get('/', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'message' => '旅遊創作者媒體平台後端API',
        'status' => 'running',
        'endpoints' => [
            'health' => '/api/health',
            'test' => '/api/test',
            'docs' => '請查看API文檔'
        ]
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// 運行應用
$app->run();
