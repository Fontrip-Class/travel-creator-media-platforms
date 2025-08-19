<?php
// 完整的可运行版本
require __DIR__ . '/../vendor/autoload.php';

// 环境变量
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
} catch (Exception $e) {
    $_ENV['APP_ENV'] = 'development';
    $_ENV['APP_DEBUG'] = 'true';
    $_ENV['DB_DRIVER'] = 'sqlite';
    $_ENV['DB_DATABASE'] = __DIR__ . '/../database/sqlite.db';
}

// 容器构建
$containerBuilder = new DI\ContainerBuilder();
$dependencies = require __DIR__ . '/../config/dependencies.php';
$dependencies($containerBuilder);
$container = $containerBuilder->build();

// 创建Slim应用
$app = Slim\Factory\AppFactory::createFromContainer($container);

// 添加中间件
$app->addMiddleware(new Slim\Middleware\MethodOverrideMiddleware());

// 错误处理
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// 添加根路由
$app->get('/', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'message' => '旅遊創作者媒體平台後端API',
        'status' => 'running',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            'health' => '/api/health',
            'test' => '/api/test'
        ]
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

// 添加测试端点
$app->get('/api/test', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'message' => 'API測試成功！',
        'timestamp' => date('Y-m-d H:i:s')
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// 加载路由配置
try {
    $routes = require __DIR__ . '/../config/routes.php';
    $routes($app);
} catch (Exception $e) {
    // 如果路由配置失败，记录错误但不中断
    error_log("路由配置加载失败: " . $e->getMessage());
}

// 运行应用
$app->run();
?>


