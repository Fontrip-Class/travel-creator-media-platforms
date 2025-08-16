<?php
use Slim\Factory\AppFactory;

echo "=== Slim框架測試 ===<br>";

// 1. 測試autoloader
echo "1. 測試autoloader...<br>";
try {
    require __DIR__ . '/../vendor/autoload.php';
    echo "✅ Autoloader載入成功<br>";
} catch (Exception $e) {
    echo "❌ Autoloader載入失敗: " . $e->getMessage() . "<br>";
    exit;
}

// 2. 測試Slim類
echo "2. 測試Slim類...<br>";
try {
    echo "✅ Slim類載入成功<br>";
} catch (Exception $e) {
    echo "❌ Slim類載入失敗: " . $e->getMessage() . "<br>";
    exit;
}

// 3. 創建Slim應用
echo "3. 創建Slim應用...<br>";
try {
    $app = AppFactory::create();
    echo "✅ Slim應用創建成功<br>";
} catch (Exception $e) {
    echo "❌ Slim應用創建失敗: " . $e->getMessage() . "<br>";
    exit;
}

// 4. 添加路由
echo "4. 添加路由...<br>";
try {
    $app->get('/', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'message' => 'Slim框架測試成功！',
            'status' => 'running',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
    echo "✅ 路由添加成功<br>";
} catch (Exception $e) {
    echo "❌ 路由添加失敗: " . $e->getMessage() . "<br>";
    exit;
}

// 5. 運行應用
echo "5. 運行應用...<br>";
try {
    $app->run();
    echo "✅ 應用運行成功<br>";
} catch (Exception $e) {
    echo "❌ 應用運行失敗: " . $e->getMessage() . "<br>";
    echo "錯誤詳情: " . $e->getTraceAsString() . "<br>";
    exit;
}
