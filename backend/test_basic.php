<?php
// 基本PHP功能測試腳本

echo "🧪 基本PHP功能測試...\n\n";

// 測試1: PHP版本
echo "1. PHP版本: " . PHP_VERSION . "\n";

// 測試2: 擴展檢查
echo "2. 擴展檢查:\n";
$required_extensions = ['json', 'pdo', 'openssl', 'mbstring'];
foreach ($required_extensions as $ext) {
    $status = extension_loaded($ext) ? "✅" : "❌";
    echo "   $status $ext\n";
}

// 測試3: 目錄權限
echo "3. 目錄權限檢查:\n";
$directories = ['logs', 'uploads', 'config'];
foreach ($directories as $dir) {
    if (is_dir($dir)) {
        $writable = is_writable($dir) ? "✅" : "❌";
        echo "   $writable $dir (可寫)\n";
    } else {
        echo "   ❌ $dir (不存在)\n";
    }
}

// 測試4: 文件檢查
echo "4. 文件檢查:\n";
$files = ['composer.json', 'config/database.php', 'src/Services/AuthService.php'];
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "   ✅ $file\n";
    } else {
        echo "   ❌ $file\n";
    }
}

// 測試5: 類自動加載
echo "5. 類自動加載測試:\n";
try {
    require_once 'vendor/autoload.php';
    echo "   ✅ Composer自動加載器\n";
    
    // 嘗試實例化一些類
    if (class_exists('App\Services\AuthService')) {
        echo "   ✅ AuthService類存在\n";
    } else {
        echo "   ❌ AuthService類不存在\n";
    }
    
    if (class_exists('App\Services\DatabaseService')) {
        echo "   ✅ DatabaseService類存在\n";
    } else {
        echo "   ❌ DatabaseService類不存在\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ 自動加載失敗: " . $e->getMessage() . "\n";
}

// 測試6: 環境變數
echo "6. 環境變數檢查:\n";
if (file_exists('.env')) {
    echo "   ✅ .env文件存在\n";
} else {
    echo "   ⚠️ .env文件不存在 (使用默認值)\n";
}

echo "\n🏁 基本測試完成\n";
