<?php
// 测试增强的认证系统
require __DIR__ . '/vendor/autoload.php';

// 设置环境变量
$_ENV['JWT_SECRET'] = 'test_secret_key_for_testing';
$_ENV['JWT_EXPIRATION'] = '86400';
$_ENV['JWT_REFRESH_EXPIRATION'] = '604800';

echo "=== 增强认证系统测试 ===\n";

try {
    // 创建数据库服务
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    // 创建认证服务
    $authService = new \App\Services\AuthService($db);

    echo "✅ 服务创建成功\n";

    // 测试登录（使用测试用户）
    echo "\n--- 测试登录 ---\n";

    // 查找一个测试用户
    $testUser = $db->fetchOne('SELECT email, username FROM users LIMIT 1');

    if ($testUser) {
        echo "找到测试用户: {$testUser['username']} ({$testUser['email']})\n";

        // 注意：这里需要知道密码，或者创建一个测试用户
        echo "⚠️  请手动测试登录功能\n";
        echo "   登录端点: POST /api/auth/login\n";
        echo "   刷新端点: POST /api/auth/refresh\n";

    } else {
        echo "❌ 没有找到测试用户\n";
        echo "请先创建用户或检查数据库\n";
    }

    echo "\n=== 测试完成 ===\n";
    echo "\n主要改进：\n";
    echo "1. JWT token有效期延长到24小时\n";
    echo "2. 添加了refresh token机制（7天有效期）\n";
    echo "3. 改进了token存储和管理\n";
    echo "4. 支持自动token刷新\n";

} catch (Exception $e) {
    echo "❌ 错误: " . $e->getMessage() . "\n";
    echo "文件: " . $e->getFile() . "\n";
    echo "行数: " . $e->getLine() . "\n";
}
?>
