@echo off
chcp 65001 >nul
echo ========================================
echo 旅遊平台資料庫初始化腳本
echo ========================================
echo.

REM 檢查PHP是否安裝
php --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤: 未找到PHP，請先安裝PHP
    echo 請訪問: https://www.php.net/downloads
    pause
    exit /b 1
)

echo ✓ PHP已安裝
echo.

REM 檢查composer依賴
if not exist "vendor\autoload.php" (
    echo 📦 安裝Composer依賴...
    composer install --no-dev --optimize-autoloader
    if errorlevel 1 (
        echo ❌ 錯誤: Composer依賴安裝失敗
        pause
        exit /b 1
    )
    echo ✓ Composer依賴安裝完成
    echo.
)

REM 檢查環境變數文件
if not exist ".env" (
    echo ⚠️  警告: 未找到.env文件，將使用默認配置
    echo 建議創建.env文件以自定義資料庫配置
    echo.
)

REM 執行資料庫初始化
echo 🚀 開始初始化資料庫...
echo.

php database\init_database.php

if errorlevel 1 (
    echo.
    echo ❌ 資料庫初始化失敗
    echo 請檢查錯誤信息並修復問題
    pause
    exit /b 1
) else (
    echo.
    echo ✅ 資料庫初始化成功！
    echo.
    echo 📋 下一步操作:
    echo 1. 檢查資料庫表結構是否正確
    echo 2. 更新前後台程式以匹配新的資料庫結構
    echo 3. 執行測試以驗證功能正常
    echo.
)

pause
