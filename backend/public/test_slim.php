<?php
echo "開始測試Slim框架...<br>";

try {
    require __DIR__ . '/../vendor/autoload.php';
    echo "✅ Autoloader載入成功<br>";
    
    use Slim\Factory\AppFactory;
    echo "✅ Slim類載入成功<br>";
    
    $app = AppFactory::create();
    echo "✅ Slim應用創建成功<br>";
    
    $app->get('/', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'message' => 'Slim框架測試成功！',
            'status' => 'running',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    echo "✅ 路由添加成功<br>";
    
    $app->run();
    echo "✅ 應用運行成功<br>";
    
} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "<br>";
    echo "文件: " . $e->getFile() . "<br>";
    echo "行數: " . $e->getLine() . "<br>";
}
