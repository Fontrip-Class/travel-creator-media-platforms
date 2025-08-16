@echo off
chcp 65001 >nul
echo 🚀 開始安裝旅遊創作者媒體平台後端...

echo.
echo 📋 檢查PHP版本...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PHP未安裝，請先安裝PHP 8.1+
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('php --version 2^>^&1 ^| findstr "PHP"') do set PHP_VERSION=%%i
echo ✅ PHP版本: %PHP_VERSION%

echo.
echo 📋 檢查Composer...
composer --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Composer未安裝，請先安裝Composer
    pause
    exit /b 1
)

echo ✅ Composer已安裝

echo.
echo 📋 檢查PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL未安裝，請先安裝PostgreSQL 14+
    pause
    exit /b 1
)

echo ✅ PostgreSQL已安裝

echo.
echo 📦 安裝PHP依賴...
composer install --no-dev --optimize-autoloader

echo.
echo 📁 創建必要目錄...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads

echo.
echo 📝 複製環境變數文件...
if not exist ".env" (
    copy "env.example" ".env"
    echo ⚠️  請編輯 .env 文件，配置資料庫連接參數
) else (
    echo ✅ .env 文件已存在
)

echo.
echo 🎉 安裝完成！
echo.
echo 📋 下一步：
echo    1. 編輯 .env 文件，配置資料庫連接
echo    2. 確保PostgreSQL和PostGIS已正確安裝
echo    3. 運行 'composer start' 啟動服務
echo    4. 訪問 http://localhost:8000/api/health 檢查服務狀態
echo.
echo 📚 詳細文檔請參考 README.md
echo.
pause
