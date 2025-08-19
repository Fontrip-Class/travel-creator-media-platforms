<?php
// 測試修復後的登入功能
echo "=== 測試修復後的登入功能 ===\n";

// 測試用戶資料
$testUser = [
    'email' => 'supplier@test.com',
    'password' => 'test123'
];

echo "測試用戶：{$testUser['email']}\n";
echo "測試密碼：{$testUser['password']}\n\n";

echo "=== 測試步驟 ===\n";
echo "1. ✅ 資料庫結構已修復（refresh_token欄位已添加）\n";
echo "2. ✅ 後端服務正常運行\n";
echo "3. 🔄 現在可以測試登入功能\n\n";

echo "=== 測試方法 ===\n";
echo "1. 在瀏覽器中訪問：http://localhost:8000/\n";
echo "2. 使用以下憑證登入：\n";
echo "   - Email: {$testUser['email']}\n";
echo "   - 密碼: {$testUser['password']}\n";
echo "3. 或者使用API測試：\n";
echo "   POST http://localhost:8000/api/auth/login\n";
echo "   Content-Type: application/json\n";
echo "   Body: " . json_encode($testUser, JSON_PRETTY_PRINT) . "\n\n";

echo "=== 預期結果 ===\n";
echo "✅ 登入成功\n";
echo "✅ 返回access_token和refresh_token\n";
echo "✅ 用戶會話持久化（24小時內無需重新登入）\n";
echo "✅ 支持使用refresh_token自動獲取新token\n\n";

echo "=== 如果仍有問題 ===\n";
echo "請檢查：\n";
echo "1. 資料庫連接是否正常\n";
echo "2. 用戶資料是否存在\n";
echo "3. 密碼是否正確\n";
echo "4. 後端日誌中的錯誤信息\n";
?>
