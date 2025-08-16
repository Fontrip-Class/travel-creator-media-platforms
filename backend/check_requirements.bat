@echo off
chcp 65001 >nul
echo 🔍 檢查系統需求...
echo.

echo 📋 檢查PHP...
php --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('php --version 2^>^&1 ^| findstr "PHP"') do set PHP_VERSION=%%i
    echo ✅ PHP已安裝，版本: %PHP_VERSION%
) else (
    echo ❌ PHP未安裝
    echo    請下載安裝: https://www.apachefriends.org/download.html
    echo    或直接安裝: https://windows.php.net/download/
)

echo.
echo 📋 檢查Composer...
composer --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Composer已安裝
) else (
    echo ❌ Composer未安裝
    echo    請下載安裝: https://getcomposer.org/Composer-Setup.exe
)

echo.
echo 📋 檢查PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL已安裝
) else (
    echo ❌ PostgreSQL未安裝
    echo    請下載安裝: https://www.postgresql.org/download/windows/
)

echo.
echo 📋 檢查PostGIS擴展...
if exist "C:\Program Files\PostgreSQL" (
    echo ✅ PostgreSQL目錄存在
) else (
    echo ⚠️  PostgreSQL目錄未找到
)

echo.
echo 📋 檢查必要目錄...
if exist "logs" (
    echo ✅ logs目錄存在
) else (
    echo ❌ logs目錄不存在
)

if exist "uploads" (
    echo ✅ uploads目錄存在
) else (
    echo ❌ uploads目錄不存在
)

echo.
echo 📋 檢查環境變數文件...
if exist ".env" (
    echo ✅ .env文件存在
) else (
    echo ⚠️  .env文件不存在，請複製env.example
)

echo.
echo 🎯 安裝建議：
echo    1. 如果PHP未安裝，建議使用XAMPP
echo    2. 如果Composer未安裝，下載Composer-Setup.exe
echo    3. 如果PostgreSQL未安裝，下載官方安裝包
echo    4. 安裝完成後運行: composer install
echo    5. 配置.env文件中的資料庫連接
echo.
pause
