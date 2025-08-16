@echo off
chcp 65001 >nul
echo 🚀 旅遊平台後端優化版安裝腳本 v2.0
echo ============================================
echo.

echo 📋 檢查系統需求...
echo.

echo 📋 檢查PHP...
php --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('php --version 2^>^&1 ^| findstr "PHP"') do set PHP_VERSION=%%i
    echo ✅ PHP已安裝，版本: %PHP_VERSION%
) else (
    echo ❌ PHP未安裝
    echo    請先安裝PHP 8.1+，建議使用XAMPP
    echo    下載地址: https://www.apachefriends.org/download.html
    pause
    exit /b 1
)

echo.
echo 📋 檢查Composer...
composer --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Composer已安裝
) else (
    echo ❌ Composer未安裝
    echo    請先安裝Composer
    echo    下載地址: https://getcomposer.org/Composer-Setup.exe
    pause
    exit /b 1
)

echo.
echo 📋 檢查PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL已安裝
) else (
    echo ❌ PostgreSQL未安裝
    echo    請先安裝PostgreSQL 14+ with PostGIS
    echo    下載地址: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo.
echo 🎯 開始安裝優化版後端...
echo.

echo 📦 安裝PHP依賴...
composer install --no-dev --optimize-autoloader
if %errorlevel% neq 0 (
    echo ❌ 依賴安裝失敗
    pause
    exit /b 1
)

echo.
echo 🔧 配置環境變數...
if not exist ".env" (
    echo    複製環境變數模板...
    copy "env_v2.example" ".env"
    echo    ⚠️  請編輯 .env 文件，配置資料庫連接和JWT密鑰
    echo.
)

echo.
echo 📁 創建必要目錄...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "cache" mkdir cache

echo.
echo 🔐 生成JWT密鑰...
php -r "echo 'JWT_SECRET=' . bin2hex(random_bytes(32)) . PHP_EOL;" >> .env

echo.
echo ✅ 安裝完成！
echo.
echo 🚀 下一步操作：
echo    1. 編輯 .env 文件，配置資料庫連接
echo    2. 在PostgreSQL中創建資料庫並執行 schema_v2.sql
echo    3. 啟動服務: php -S localhost:8000 -t public
echo.
echo 📚 詳細說明請查看：
echo    - OPTIMIZATION_SUMMARY.md (優化總結)
echo    - WINDOWS_INSTALL.md (安裝指南)
echo    - QUICK_START.md (快速開始)
echo.
pause
