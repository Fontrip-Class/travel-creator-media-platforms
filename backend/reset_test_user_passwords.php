<?php

require_once __DIR__ . '/vendor/autoload.php';

echo "🔐 重設測試用戶密碼\n";
echo "===================\n";

try {
    $dbPath = __DIR__ . '/database/sqlite.db';
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ 資料庫連接成功\n";

    // 重設測試用戶密碼
    $testUsers = [
        ['email' => 'supplier@test.com', 'password' => 'supplier123'],
        ['email' => 'creator@test.com', 'password' => 'creator123'],
        ['email' => 'media@test.com', 'password' => 'media123'],
        ['email' => 'admin@test.com', 'password' => 'admin123']
    ];

    foreach ($testUsers as $user) {
        $passwordHash = password_hash($user['password'], PASSWORD_ARGON2ID);

        $stmt = $pdo->prepare("UPDATE users SET password_hash = :password_hash WHERE email = :email");
        $result = $stmt->execute([
            'password_hash' => $passwordHash,
            'email' => $user['email']
        ]);

        if ($stmt->rowCount() > 0) {
            echo "✅ 重設密碼: {$user['email']} / {$user['password']}\n";
        } else {
            echo "⚠️  用戶不存在: {$user['email']}\n";
        }
    }

    echo "\n🎯 測試用戶帳號:\n";
    echo "  - 供應商: supplier@test.com / supplier123\n";
    echo "  - 創作者: creator@test.com / creator123\n";
    echo "  - 媒體: media@test.com / media123\n";
    echo "  - 管理員: admin@test.com / admin123\n";

} catch (Exception $e) {
    echo "❌ 密碼重設失敗: " . $e->getMessage() . "\n";
    exit(1);
}
