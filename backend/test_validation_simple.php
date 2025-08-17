<?php
/**
 * 簡化的驗證測試
 * 逐步測試 Respect\Validation 的每個規則
 */

require_once __DIR__ . '/vendor/autoload.php';

use Respect\Validation\Validator as v;

echo "🧪 簡化的驗證測試...\n\n";

$testData = [
    'username' => 'testuser',
    'email' => 'testuser@example.com',
    'password' => 'test123456',
    'role' => 'creator'
];

echo "測試數據: " . json_encode($testData, JSON_UNESCAPED_UNICODE) . "\n\n";

// 逐步測試每個規則
echo "1. 測試用戶名規則...\n";
try {
    $usernameValidator = v::stringType()->length(3, 50)->regex('/^[\p{Han}a-zA-Z0-9_\s]+$/u');
    $usernameValidator->assert($testData['username']);
    echo "   ✅ 用戶名驗證通過\n";
} catch (Exception $e) {
    echo "   ❌ 用戶名驗證失敗: " . $e->getMessage() . "\n";
}

echo "\n2. 測試用戶名長度規則...\n";
try {
    $lengthValidator = v::stringType()->length(3, 50);
    $lengthValidator->assert($testData['username']);
    echo "   ✅ 用戶名長度驗證通過\n";
} catch (Exception $e) {
    echo "   ❌ 用戶名長度驗證失敗: " . $e->getMessage() . "\n";
}

echo "\n3. 測試用戶名正則表達式規則...\n";
try {
    $regexValidator = v::regex('/^[\p{Han}a-zA-Z0-9_\s]+$/u');
    $regexValidator->assert($testData['username']);
    echo "   ✅ 用戶名正則表達式驗證通過\n";
} catch (Exception $e) {
    echo "   ❌ 用戶名正則表達式驗證失敗: " . $e->getMessage() . "\n";
}

echo "\n4. 測試完整驗證器...\n";
try {
    $validator = v::key('username', v::stringType()->length(3, 50)->regex('/^[\p{Han}a-zA-Z0-9_\s]+$/u'))
                 ->key('email', v::email())
                 ->key('password', v::stringType()->length(6, 255))
                 ->key('role', v::in(['supplier', 'creator', 'media']));
    
    $validator->assert($testData);
    echo "   ✅ 完整驗證通過\n";
} catch (Exception $e) {
    echo "   ❌ 完整驗證失敗: " . $e->getMessage() . "\n";
}

echo "\n🎯 驗證測試完成！\n";
