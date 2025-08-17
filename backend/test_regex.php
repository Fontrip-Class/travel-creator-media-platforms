<?php
/**
 * 測試用戶名驗證的正則表達式
 */

echo "🧪 測試用戶名驗證正則表達式...\n\n";

$regex = '/^[\p{Han}a-zA-Z0-9_\s]+$/u';
echo "正則表達式: {$regex}\n\n";

$testUsernames = [
    'testuser',
    'test_user',
    'test user',
    '測試用戶',
    'test123',
    'test_user_123',
    'test user 123',
    '測試用戶123',
    'testuser9806',
    'test_user_9806',
    'test user 9806',
    '測試用戶9806',
    'a',
    'ab',
    'abc',
    'test',
    'user',
    'admin',
    'supplier',
    'creator',
    'media'
];

echo "測試結果:\n";
foreach ($testUsernames as $username) {
    $matches = preg_match($regex, $username);
    $status = $matches ? '✅ 匹配' : '❌ 不匹配';
    $length = mb_strlen($username);
    $validLength = ($length >= 3 && $length <= 50) ? '✅ 長度正確' : '❌ 長度錯誤';
    
    echo sprintf("  %-20s | %s | %s | 長度: %d\n", $username, $status, $validLength, $length);
}

echo "\n🎯 正則表達式測試完成！\n";
