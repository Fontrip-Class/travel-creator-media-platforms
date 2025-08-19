<?php
echo "=== 简化版index.php测试 ===\n";

// 1. 检查基本PHP功能
echo "1. PHP基本功能: ✅\n";

// 2. 检查autoload文件
echo "2. 检查autoload文件...\n";
$autoload_path = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoload_path)) {
    echo "   autoload.php: ✅ 存在\n";
    require_once $autoload_path;
    echo "   autoload: ✅ 加载成功\n";
} else {
    echo "   autoload.php: ❌ 不存在\n";
    exit;
}

// 3. 检查环境变量
echo "3. 检查环境变量...\n";
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
    echo "   环境变量: ✅ 加载成功\n";
} catch (Exception $e) {
    echo "   环境变量: ❌ 加载失败 - " . $e->getMessage() . "\n";
    // 设置默认值
    $_ENV['APP_ENV'] = 'development';
    $_ENV['APP_DEBUG'] = 'true';
    $_ENV['DB_DRIVER'] = 'sqlite';
    $_ENV['DB_DATABASE'] = __DIR__ . '/../database/sqlite.db';
    echo "   环境变量: ⚠️ 使用默认值\n";
}

// 4. 检查容器构建
echo "4. 检查容器构建...\n";
try {
    $containerBuilder = new DI\ContainerBuilder();
    echo "   ContainerBuilder: ✅ 创建成功\n";

    $dependencies = require __DIR__ . '/../config/dependencies.php';
    echo "   依赖配置: ✅ 加载成功\n";

    $dependencies($containerBuilder);
    echo "   依赖注入: ✅ 配置成功\n";

    $container = $containerBuilder->build();
    echo "   容器: ✅ 构建成功\n";
} catch (Exception $e) {
    echo "   容器构建: ❌ 失败 - " . $e->getMessage() . "\n";
    exit;
}

// 5. 检查Slim应用创建
echo "5. 检查Slim应用创建...\n";
try {
    $app = Slim\Factory\AppFactory::createFromContainer($container);
    echo "   Slim应用: ✅ 创建成功\n";
} catch (Exception $e) {
    echo "   Slim应用: ❌ 创建失败 - " . $e->getMessage() . "\n";
    exit;
}

// 6. 添加中间件
echo "6. 添加中间件...\n";
try {
    $app->addMiddleware(new Slim\Middleware\MethodOverrideMiddleware());
    echo "   MethodOverrideMiddleware: ✅ 添加成功\n";
} catch (Exception $e) {
    echo "   MethodOverrideMiddleware: ❌ 添加失败 - " . $e->getMessage() . "\n";
}

// 7. 添加错误处理
echo "7. 添加错误处理...\n";
try {
    $errorMiddleware = $app->addErrorMiddleware(true, true, true);
    echo "   错误处理: ✅ 添加成功\n";
} catch (Exception $e) {
    echo "   错误处理: ❌ 添加失败 - " . $e->getMessage() . "\n";
}

// 8. 添加根路由
echo "8. 添加根路由...\n";
try {
    $app->get('/', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'message' => '旅遊創作者媒體平台後端API',
            'status' => 'running',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
    echo "   根路由: ✅ 添加成功\n";
} catch (Exception $e) {
    echo "   根路由: ❌ 添加失败 - " . $e->getMessage() . "\n";
}

echo "\n=== 所有检查完成 ===\n";
echo "如果所有检查都通过，应用应该可以正常运行。\n";
?>
