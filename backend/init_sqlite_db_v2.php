<?php
/**
 * SQLite 數據庫初始化腳本 v2
 * 使用正確的 schema 和測試數據
 */

$dbPath = __DIR__ . '/database/sqlite.db';

echo "🧪 開始初始化 SQLite 數據庫 v2...\n";
echo "數據庫路徑: {$dbPath}\n\n";

try {
    // 刪除舊的數據庫文件
    if (file_exists($dbPath)) {
        unlink($dbPath);
        echo "🗑️ 刪除舊的數據庫文件\n";
    }
    
    // 創建數據庫連接
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ 數據庫連接成功\n\n";
    
    // 讀取並執行 schema 文件
    echo "1. 執行數據庫 schema...\n";
    $schemaFile = __DIR__ . '/database/sqlite_schema.sql';
    
    if (file_exists($schemaFile)) {
        $schema = file_get_contents($schemaFile);
        $pdo->exec($schema);
        echo "   ✅ Schema 執行成功\n";
    } else {
        echo "   ❌ Schema 文件不存在: {$schemaFile}\n";
        exit(1);
    }
    echo "\n";
    
    // 創建測試用戶
    echo "2. 創建測試用戶...\n";
    
    // 測試供應商
    $supplierPassword = password_hash('supplier123', PASSWORD_DEFAULT);
    $pdo->exec("
        INSERT INTO users (username, email, password_hash, role, phone, contact, is_active, is_verified, email_verified_at, last_login_at, login_attempts, locked_until, created_at, updated_at)
        VALUES ('test_supplier', 'supplier@test.com', '{$supplierPassword}', 'supplier', '0912345678', '測試供應商', 1, 1, CURRENT_TIMESTAMP, NULL, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ");
    $supplierId = $pdo->lastInsertId();
    echo "   ✅ 測試供應商創建成功 (ID: {$supplierId})\n";
    
    // 測試創作者
    $creatorPassword = password_hash('creator123', PASSWORD_DEFAULT);
    $pdo->exec("
        INSERT INTO users (username, email, password_hash, role, phone, contact, is_active, is_verified, email_verified_at, last_login_at, login_attempts, locked_until, created_at, updated_at)
        VALUES ('test_creator', 'creator@test.com', '{$creatorPassword}', 'creator', '0987654321', '測試創作者', 1, 1, CURRENT_TIMESTAMP, NULL, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ");
    $creatorId = $pdo->lastInsertId();
    echo "   ✅ 測試創作者創建成功 (ID: {$creatorId})\n";
    
    // 測試媒體
    $mediaPassword = password_hash('media123', PASSWORD_DEFAULT);
    $pdo->exec("
        INSERT INTO users (username, email, password_hash, role, phone, contact, is_active, is_verified, email_verified_at, last_login_at, login_attempts, locked_until, created_at, updated_at)
        VALUES ('test_media', 'media@test.com', '{$mediaPassword}', 'media', '0955555555', '測試媒體', 1, 1, CURRENT_TIMESTAMP, NULL, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ");
    $mediaId = $pdo->lastInsertId();
    echo "   ✅ 測試媒體創建成功 (ID: {$mediaId})\n";
    
    // 測試管理員
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $pdo->exec("
        INSERT INTO users (username, email, password_hash, role, phone, contact, is_active, is_verified, email_verified_at, last_login_at, login_attempts, locked_until, created_at, updated_at)
        VALUES ('admin', 'admin@test.com', '{$adminPassword}', 'admin', '0900000000', '系統管理員', 1, 1, CURRENT_TIMESTAMP, NULL, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ");
    $adminId = $pdo->lastInsertId();
    echo "   ✅ 測試管理員創建成功 (ID: {$adminId})\n";
    echo "\n";
    
    // 創建用戶資料
    echo "3. 創建用戶資料...\n";
    
    // 供應商資料
    $pdo->exec("
        INSERT INTO supplier_profiles (user_id, company_name, business_type, service_areas)
        VALUES ({$supplierId}, '台東旅遊服務公司', '旅行社', '台東縣全境')
    ");
    echo "   ✅ 供應商資料創建成功\n";
    
    // 創作者資料
    $pdo->exec("
        INSERT INTO creator_profiles (user_id, specialties, followers_count, platform)
        VALUES ({$creatorId}, '旅遊攝影,影片製作,內容創作', 5000, 'Instagram,YouTube')
    ");
    echo "   ✅ 創作者資料創建成功\n";
    
    // 媒體資料
    $pdo->exec("
        INSERT INTO media_profiles (user_id, media_type, website, audience_size)
        VALUES ({$mediaId}, '網路媒體', 'https://travel-media.com', 100000)
    ");
    echo "   ✅ 媒體資料創建成功\n";
    echo "\n";
    
    // 創建測試任務
    echo "4. 創建測試任務...\n";
    $pdo->exec("
        INSERT INTO tasks (
            supplier_id, title, summary, description, requirements,
            budget_min, budget_max, content_type, deadline, location, tags, status
        )
        VALUES (
            {$supplierId}, '台東熱氣球節宣傳影片製作', '製作台東熱氣球節的宣傳影片',
            '我們需要一支3-5分鐘的宣傳影片，展現台東熱氣球節的魅力。影片需要突出當地的自然風光和熱氣球活動的精彩瞬間。要求畫面精美，節奏明快，能夠吸引觀眾的注意力。',
            '專業影片製作團隊，具備旅遊宣傳片製作經驗，熟悉台東地區特色',
            15000, 25000, 'video,image', '2024-02-15', '台東縣',
            '台東,熱氣球,宣傳,影片', 'published'
        )
    ");
    $taskId = $pdo->lastInsertId();
    echo "   ✅ 測試任務創建成功 (ID: {$taskId})\n";
    
    // 創建任務階段
    $pdo->exec("
        INSERT INTO task_stages (task_id, current_stage, progress_percentage)
        VALUES ({$taskId}, 'published', 0.00)
    ");
    echo "   ✅ 任務階段創建成功\n";
    
    // 創建任務申請
    $pdo->exec("
        INSERT INTO task_applications (
            task_id, creator_id, proposal, experience, estimated_duration, proposed_budget
        )
        VALUES (
            {$taskId}, {$creatorId}, 
            '我是一名專業的旅遊影片創作者，有5年以上的經驗。我熟悉台東地區，曾經製作過多支旅遊宣傳片。我建議使用無人機拍攝熱氣球升空的壯觀場面，結合地面的人文風情，創造出震撼的視覺效果。',
            '5年旅遊影片製作經驗，曾獲多個獎項，熟悉台東地區特色',
            '20天', 20000
        )
    ");
    echo "   ✅ 任務申請創建成功\n";
    echo "\n";
    
    // 創建通知
    echo "5. 創建測試通知...\n";
    $pdo->exec("
        INSERT INTO notifications (user_id, title, message, type)
        VALUES 
        ({$supplierId}, '新任務申請', '您的任務「台東熱氣球節宣傳影片製作」收到了新的申請', 'task_application'),
        ({$creatorId}, '任務申請提交成功', '您的任務申請已成功提交，請等待供應商回覆', 'application_submitted')
    ");
    echo "   ✅ 測試通知創建成功\n";
    echo "\n";
    
    echo "🎉 SQLite 數據庫初始化 v2 完成！\n";
    echo "數據庫文件: {$dbPath}\n";
    echo "測試帳號:\n";
    echo "  供應商: supplier@test.com / supplier123\n";
    echo "  創作者: creator@test.com / creator123\n";
    echo "  媒體: media@test.com / media123\n";
    echo "  管理員: admin@test.com / admin123\n";
    echo "\n";
    echo "測試任務: 台東熱氣球節宣傳影片製作 (ID: {$taskId})\n";
    
} catch (PDOException $e) {
    echo "❌ 數據庫初始化失敗: " . $e->getMessage() . "\n";
    exit(1);
}
