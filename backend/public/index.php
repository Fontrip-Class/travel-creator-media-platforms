<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Slim\Middleware\MethodOverrideMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// 載入環境變數
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// 創建容器
$container = new Container();

// 設置依賴注入
require __DIR__ . '/../config/dependencies.php';

// 創建應用
$app = AppFactory::createFromContainer($container);

// 添加中間件
$app->addMiddleware(new MethodOverrideMiddleware());
$app->addMiddleware(new \App\Middleware\CorsMiddleware());
$app->addMiddleware(new \App\Middleware\JsonBodyParserMiddleware());

// 添加錯誤處理
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// 載入路由
require __DIR__ . '/../config/routes.php';

// 運行應用
$app->run();
