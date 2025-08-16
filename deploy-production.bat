@echo off
chcp 65001 >nul
echo 🚀 旅遊平台生產環境部署腳本
echo ============================================
echo.

echo 📋 檢查生產環境需求...
echo.

echo 📋 檢查PHP...
php --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('php --version 2^>^&1 ^| findstr "PHP"') do set PHP_VERSION=%%i
    echo ✅ PHP已安裝，版本: %PHP_VERSION%
) else (
    echo ❌ PHP未安裝
    echo    請先安裝PHP 8.1+
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
    pause
    exit /b 1
)

echo.
echo 🎯 開始生產環境部署...
echo.

echo 📦 安裝生產環境依賴...
composer install --no-dev --optimize-autoloader --classmap-authoritative
if %errorlevel% neq 0 (
    echo ❌ 依賴安裝失敗
    pause
    exit /b 1
)

echo.
echo 🔧 配置生產環境變數...
if not exist ".env" (
    echo    複製生產環境變數模板...
    copy "env.production.example" ".env"
    echo    ⚠️  請編輯 .env 文件，配置生產環境參數
    echo.
)

echo.
echo 📁 創建生產環境目錄...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "cache" mkdir cache
if not exist "backups" mkdir backups

echo.
echo 🔐 生成生產環境JWT密鑰...
php -r "echo 'JWT_SECRET=' . bin2hex(random_bytes(64)) . PHP_EOL;" >> .env

echo.
echo 🗄️ 設置資料庫...
echo    請在PostgreSQL中執行以下命令：
echo    CREATE DATABASE travel_platform_prod;
echo    \c travel_platform_prod
echo    CREATE EXTENSION postgis;
echo    CREATE EXTENSION "uuid-ossp";
echo    CREATE EXTENSION "pg_trgm";
echo    \i database/schema_v2.sql
echo.

echo.
echo 🚀 生產環境部署完成！
echo.
echo 📚 下一步操作：
echo    1. 編輯 .env 文件，配置生產環境參數
echo    2. 設置資料庫並執行結構腳本
echo    3. 配置Web伺服器（Apache/Nginx）
echo    4. 設置SSL證書
echo    5. 配置防火牆和安全設置
echo    6. 啟動服務並測試
echo.
echo 🛡️ 安全提醒：
echo    - 更改所有預設密碼
echo    - 設置強密碼策略
echo    - 啟用日誌記錄
echo    - 配置備份策略
echo    - 設置監控和警報
echo.
pause
