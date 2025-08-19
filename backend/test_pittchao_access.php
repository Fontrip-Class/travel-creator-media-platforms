<?php
// 測試 pittchao 用戶的路由訪問權限
require __DIR__ . '/vendor/autoload.php';

echo "=== 測試 pittchao 用戶訪問權限 ===\n";

try {
    $db = new \App\Services\DatabaseService([
        'driver' => 'sqlite',
        'database' => __DIR__ . '/database/sqlite.db'
    ]);

    $authService = new \App\Services\AuthService($db);

    // 檢查 pittchao 用戶資料
    echo "=== 檢查用戶資料 ===\n";
    $user = $db->fetchOne(
        'SELECT id, username, email, role, is_active, is_verified FROM users WHERE email = :email',
        ['email' => 'pittchao@gmail.com']
    );

    if ($user) {
        echo "✅ 用戶資料：\n";
        echo "  ID: {$user['id']}\n";
        echo "  用戶名: {$user['username']}\n";
        echo "  Email: {$user['email']}\n";
        echo "  角色: {$user['role']}\n";
        echo "  是否活躍: " . ($user['is_active'] ? '是' : '否') . "\n";
        echo "  是否驗證: " . ($user['is_verified'] ? '是' : '否') . "\n";
    } else {
        echo "❌ 用戶不存在\n";
        exit(1);
    }

    // 測試登入
    echo "\n=== 測試登入 ===\n";
    try {
        $loginResult = $authService->login('pittchao@gmail.com', '1qaz2wsx');
        echo "✅ 登入成功\n";
        echo "角色: {$loginResult['role']}\n";
        echo "Token: " . substr($loginResult['token'], 0, 50) . "...\n";
        $token = $loginResult['token'];
    } catch (\Exception $e) {
        echo "❌ 登入失敗: {$e->getMessage()}\n";
        exit(1);
    }

    // 驗證 token
    echo "\n=== 驗證 Token ===\n";
    try {
        $tokenData = $authService->validateToken($token);
        echo "✅ Token 有效\n";
        echo "用戶ID: {$tokenData['user_id']}\n";
        echo "角色: {$tokenData['role']}\n";
    } catch (\Exception $e) {
        echo "❌ Token 驗證失敗: {$e->getMessage()}\n";
    }

    echo "\n=== 前端測試指南 ===\n";
    echo "現在 pittchao@gmail.com 應該能夠：\n\n";

    echo "🔐 登入流程：\n";
    echo "1. 訪問 http://localhost:8080/login\n";
    echo "2. 輸入 pittchao@gmail.com / 1qaz2wsx\n";
    echo "3. 登入成功後自動重定向到 /supplier/dashboard\n\n";

    echo "✅ 可以訪問的頁面：\n";
    echo "- http://localhost:8080/supplier/dashboard (供應商儀表板)\n";
    echo "- http://localhost:8080/supplier/tasks (任務管理)\n";
    echo "- http://localhost:8080/supplier/create-task (創建任務)\n\n";

    echo "❌ 不應該能訪問：\n";
    echo "- http://localhost:8080/admin (管理員後台)\n";
    echo "- http://localhost:8080/creator/dashboard (創作者儀表板)\n";
    echo "- http://localhost:8080/media/dashboard (媒體儀表板)\n\n";

    echo "📱 導航欄狀態：\n";
    echo "登入後應該顯示：[Logo] [解決方案] [探索] [關於平台] [價格方案] [FAQ] [管理後台] [登出] [聯絡我們]\n";
    echo "應該隱藏：[登入] [註冊]\n\n";

    echo "🔧 已修復的問題：\n";
    echo "1. ✅ AuthGuard 現在使用 AuthContext 而非獨立狀態\n";
    echo "2. ✅ 角色檢查邏輯已修復 (user?.role === requiredRole)\n";
    echo "3. ✅ 用戶密碼已重設為 1qaz2wsx\n";
    echo "4. ✅ API 服務已添加 getUserPermissions 方法\n";
    echo "5. ✅ 登入流程完整整合\n\n";

    echo "🧪 手動測試步驟：\n";
    echo "1. 開啟瀏覽器開發者工具\n";
    echo "2. 清除 Local Storage 中的所有資料\n";
    echo "3. 重新整理頁面\n";
    echo "4. 使用憑證登入\n";
    echo "5. 檢查是否正確重定向到供應商儀表板\n";
    echo "6. 驗證導航欄狀態變化\n";
    echo "7. 嘗試訪問其他角色的路由（應該被拒絕）\n\n";

    echo "🐛 如果仍有問題，請檢查：\n";
    echo "1. 瀏覽器 Console 是否有 JavaScript 錯誤\n";
    echo "2. Network 標籤中 API 請求是否成功\n";
    echo "3. Local Storage 中是否正確保存 auth_token\n";
    echo "4. AuthContext 的 isAuthenticated 狀態是否正確\n";

} catch (Exception $e) {
    echo "❌ 錯誤: " . $e->getMessage() . "\n";
    echo "文件: " . $e->getFile() . "\n";
    echo "行數: " . $e->getLine() . "\n";
}

echo "\n=== 測試完成 ===\n";
?>


