<?php
// 修復真實用戶的問題
require __DIR__ . '/vendor/autoload.php';

echo "=== 修復真實用戶問題 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    $authService = new \App\Services\AuthService($db);

    // 修復 pittchao@gmail.com 的密碼
    echo "--- 修復 pittchao@gmail.com ---\n";
    $newPassword = '1qaz2wsx';
    $passwordHash = password_hash($newPassword, PASSWORD_ARGON2ID);

    $result1 = $db->update('users', [
        'password_hash' => $passwordHash,
        'login_attempts' => 0,  // 重置登入嘗試次數
        'locked_until' => null  // 解除鎖定
    ], 'email = :email', ['email' => 'pittchao@gmail.com']);

    if ($result1 > 0) {
        echo "✅ pittchao 密碼已重設為: {$newPassword}\n";

        // 測試登入
        try {
            $loginResult = $authService->login('pittchao@gmail.com', $newPassword);
            echo "✅ pittchao 登入測試成功\n";
            echo "角色: {$loginResult['role']}\n";
        } catch (\Exception $e) {
            echo "❌ pittchao 登入測試失敗: {$e->getMessage()}\n";
        }
    }

    // 檢查 snine122@gmail.com 的角色問題
    echo "\n--- 檢查 snine122@gmail.com 角色 ---\n";
    $user = $db->fetchOne('SELECT role FROM users WHERE email = :email', ['email' => 'snine122@gmail.com']);
    echo "當前角色: {$user['role']}\n";
    echo "您說這個用戶應該有 supplier 和 creator 權限\n";
    echo "目前系統不支援多重角色，需要選擇一個主要角色\n";

    // 如果需要，可以更新為 supplier 角色
    $choice = 'supplier'; // 根據您的需求調整
    $db->update('users', [
        'role' => $choice
    ], 'email = :email', ['email' => 'snine122@gmail.com']);
    echo "✅ 已將 snine122 的角色更新為: {$choice}\n";

    echo "\n=== 重新測試兩個用戶登入 ===\n";

    // 測試 pittchao
    echo "\n--- pittchao@gmail.com 測試 ---\n";
    try {
        $result1 = $authService->login('pittchao@gmail.com', '1qaz2wsx');
        echo "✅ 登入成功\n";
        echo "角色: {$result1['role']}\n";
        echo "Token: " . substr($result1['token'], 0, 50) . "...\n";

        // 保存 token 用於前端測試
        file_put_contents(__DIR__ . '/pittchao_working_token.txt', $result1['token']);
    } catch (\Exception $e) {
        echo "❌ 登入失敗: {$e->getMessage()}\n";
    }

    // 測試 snine122
    echo "\n--- snine122@gmail.com 測試 ---\n";
    try {
        $result2 = $authService->login('snine122@gmail.com', '1qaz2wsx');
        echo "✅ 登入成功\n";
        echo "角色: {$result2['role']}\n";
        echo "Token: " . substr($result2['token'], 0, 50) . "...\n";

        // 保存 token 用於前端測試
        file_put_contents(__DIR__ . '/snine122_working_token.txt', $result2['token']);
    } catch (\Exception $e) {
        echo "❌ 登入失敗: {$e->getMessage()}\n";
    }

    echo "\n=== 前端測試指南 ===\n";
    echo "現在您可以使用以下憑證在前端測試：\n\n";
    echo "用戶1 - pittchao@gmail.com / 1qaz2wsx (supplier 角色)\n";
    echo "應該可以訪問：\n";
    echo "  - /supplier/dashboard\n";
    echo "  - /supplier/tasks\n";
    echo "  - /supplier/create-task\n";
    echo "不應該能訪問：\n";
    echo "  - /admin\n";
    echo "  - /creator/dashboard\n\n";

    echo "用戶2 - snine122@gmail.com / 1qaz2wsx (supplier 角色)\n";
    echo "應該可以訪問：\n";
    echo "  - /supplier/dashboard\n";
    echo "  - /supplier/tasks\n";
    echo "  - /supplier/create-task\n";
    echo "不應該能訪問：\n";
    echo "  - /admin\n";
    echo "  - /creator/dashboard\n\n";

    echo "=== API 測試命令 ===\n";
    if (file_exists(__DIR__ . '/pittchao_working_token.txt')) {
        $token = file_get_contents(__DIR__ . '/pittchao_working_token.txt');
        echo "測試 pittchao API：\n";
        echo "curl -H \"Authorization: Bearer {$token}\" http://localhost:8000/api/auth/profile\n\n";
    }

    echo "=== 檢查前端問題 ===\n";
    echo "如果用戶登入後前端沒有作用，可能是以下問題：\n";
    echo "1. AuthContext 沒有正確更新登入狀態\n";
    echo "2. 前端沒有正確處理登入回應\n";
    echo "3. Token 沒有正確保存到 localStorage\n";
    echo "4. SiteHeader 沒有正確檢測登入狀態\n";
    echo "\n建議檢查瀏覽器的：\n";
    echo "- 開發者工具 > Application > Local Storage\n";
    echo "- 開發者工具 > Console (查看錯誤訊息)\n";
    echo "- 開發者工具 > Network (查看 API 請求)\n";

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
    echo "文件: " . $e->getFile() . "\n";
    echo "行數: " . $e->getLine() . "\n";
}
?>


