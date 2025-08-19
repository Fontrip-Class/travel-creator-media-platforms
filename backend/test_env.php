<?php
// 测试环境配置
echo "=== 环境配置测试 ===\n";

// 检查PHP版本
echo "PHP版本: " . PHP_VERSION . "\n";

// 检查扩展
$required_extensions = ['pdo', 'pdo_sqlite', 'json', 'mbstring'];
foreach ($required_extensions as $ext) {
    echo "扩展 {$ext}: " . (extension_loaded($ext) ? "✅ 已加载" : "❌ 未加载") . "\n";
}

// 检查目录权限
$directories = [
    'database' => 'database',
    'logs' => 'logs',
    'uploads' => 'uploads'
];

foreach ($directories as $name => $path) {
    $full_path = __DIR__ . '/' . $path;
    if (is_dir($full_path)) {
        echo "目录 {$name}: ✅ 存在";
        if (is_writable($full_path)) {
            echo " (可写)";
        } else {
            echo " (不可写)";
        }
        echo "\n";
    } else {
        echo "目录 {$name}: ❌ 不存在\n";
    }
}

// 尝试创建SQLite数据库
echo "\n=== 数据库连接测试 ===\n";
$db_path = __DIR__ . '/database/sqlite.db';
try {
    $pdo = new PDO("sqlite:{$db_path}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "SQLite连接: ✅ 成功\n";

    // 检查表是否存在
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    if (empty($tables)) {
        echo "数据库表: ❌ 无表存在\n";
    } else {
        echo "数据库表: ✅ " . implode(', ', $tables) . "\n";
    }
} catch (Exception $e) {
    echo "SQLite连接: ❌ 失败 - " . $e->getMessage() . "\n";
}

// 检查Composer依赖
echo "\n=== Composer依赖检查 ===\n";
$vendor_path = __DIR__ . '/vendor';
if (is_dir($vendor_path)) {
    echo "Vendor目录: ✅ 存在\n";

    // 检查Slim Framework
    $slim_path = $vendor_path . '/slim/slim';
    if (is_dir($slim_path)) {
        echo "Slim Framework: ✅ 已安装\n";
    } else {
        echo "Slim Framework: ❌ 未安装\n";
    }
} else {
    echo "Vendor目录: ❌ 不存在\n";
}

echo "\n=== 测试完成 ===\n";
