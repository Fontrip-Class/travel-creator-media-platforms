<?php
echo "=== 逐步测试index.php ===\n";

// 1. 基本设置
require __DIR__ . '/../vendor/autoload.php';

// 2. 环境变量
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
    echo "环境变量: ✅ 加载成功\n";
} catch (Exception $e) {
    $_ENV['APP_ENV'] = 'development';
    $_ENV['APP_DEBUG'] = 'true';
    $_ENV['DB_DRIVER'] = 'sqlite';
    $_ENV['DB_DATABASE'] = __DIR__ . '/../database/sqlite.db';
    echo "环境变量: ⚠️ 使用默认值\n";
}

// 3. 容器构建
try {
    $containerBuilder = new DI\ContainerBuilder();
    $dependencies = require __DIR__ . '/../config/dependencies.php';
    $dependencies($containerBuilder);
    $container = $containerBuilder->build();
    echo "容器: ✅ 构建成功\n";
} catch (Exception $e) {
    echo "容器构建失败: " . $e->getMessage() . "\n";
    exit;
}

// 4. 创建Slim应用
try {
    $app = Slim\Factory\AppFactory::createFromContainer($container);
    echo "Slim应用: ✅ 创建成功\n";
} catch (Exception $e) {
    echo "Slim应用创建失败: " . $e->getMessage() . "\n";
    exit;
}

// 5. 添加中间件
try {
    $app->addMiddleware(new Slim\Middleware\MethodOverrideMiddleware());
    echo "中间件: ✅ 添加成功\n";
} catch (Exception $e) {
    echo "中间件添加失败: " . $e->getMessage() . "\n";
}

// 6. 错误处理
try {
    $errorMiddleware = $app->addErrorMiddleware(true, true, true);
    echo "错误处理: ✅ 添加成功\n";
} catch (Exception $e) {
    echo "错误处理添加失败: " . $e->getMessage() . "\n";
}

// 7. 添加根路由
try {
    $app->get('/', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'message' => '旅遊創作者媒體平台後端API',
            'status' => 'running',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
    echo "根路由: ✅ 添加成功\n";
} catch (Exception $e) {
    echo "根路由添加失败: " . $e->getMessage() . "\n";
}

// 8. 测试路由配置（不运行，只检查语法）
echo "8. 检查路由配置...\n";
try {
    $routes = require __DIR__ . '/../config/routes.php';
    echo "路由配置: ✅ 语法检查通过\n";

    // 尝试应用路由配置
    $routes($app);
    echo "路由应用: ✅ 成功\n";
} catch (Exception $e) {
    echo "路由配置失败: " . $e->getMessage() . "\n";
    echo "错误文件: " . $e->getFile() . "\n";
    echo "错误行数: " . $e->getLine() . "\n";
    echo "错误追踪:\n" . $e->getTraceAsString() . "\n";
    exit;
}

echo "\n=== 所有测试通过 ===\n";
echo "应用配置成功，可以正常运行！\n";

// 注意：这里不调用 $app->run()，只是测试配置
?>


