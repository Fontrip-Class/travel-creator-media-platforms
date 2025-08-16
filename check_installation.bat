@echo off
chcp 65001 >nul
echo 🔍 旅遊平台環境安裝檢查
echo ================================
echo.

echo 📋 檢查系統環境...
echo.

echo 1️⃣ 檢查 PHP...
php --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('php --version 2^>^&1 ^| findstr "PHP"') do set PHP_VERSION=%%i
    echo ✅ PHP已安裝，版本: %PHP_VERSION%
) else (
    echo ❌ PHP未安裝
    echo    請按照 INSTALL_GUIDE.md 安裝 PHP 8.1+
)

echo.
echo 2️⃣ 檢查 Composer...
composer --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Composer已安裝
) else (
    echo ❌ Composer未安裝
    echo    請按照 INSTALL_GUIDE.md 安裝 Composer
)

echo.
echo 3️⃣ 檢查 PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL已安裝
) else (
    echo ❌ PostgreSQL未安裝
    echo    請按照 INSTALL_GUIDE.md 安裝 PostgreSQL 14+
)

echo.
echo 4️⃣ 檢查 PHP 擴展...
php -m | findstr "pdo_pgsql" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ pdo_pgsql 擴展已啟用
) else (
    echo ❌ pdo_pgsql 擴展未啟用
    echo    請在 php.ini 中啟用 pdo_pgsql 擴展
)

php -m | findstr "gd" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ gd 擴展已啟用
) else (
    echo ❌ gd 擴展未啟用
    echo    請在 php.ini 中啟用 gd 擴展
)

php -m | findstr "mbstring" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ mbstring 擴展已啟用
) else (
    echo ❌ mbstring 擴展未啟用
    echo    請在 php.ini 中啟用 mbstring 擴展
)

echo.
echo 5️⃣ 檢查後端依賴...
if exist "backend\vendor" (
    echo ✅ 後端依賴已安裝
) else (
    echo ❌ 後端依賴未安裝
    echo    請在 backend 目錄運行: composer install
)

echo.
echo 6️⃣ 檢查環境配置...
if exist "backend\.env" (
    echo ✅ 環境配置文件已存在
) else (
    echo ❌ 環境配置文件不存在
    echo    請複製 env_v2.example 為 .env 並配置
)

echo.
echo 📊 安裝狀態總結...
echo.

set /a total=0
set /a installed=0

php --version >nul 2>&1 && set /a installed+=1
set /a total+=1

composer --version >nul 2>&1 && set /a installed+=1
set /a total+=1

psql --version >nul 2>&1 && set /a installed+=1
set /a total+=1

if exist "backend\vendor" set /a installed+=1
set /a total+=1

if exist "backend\.env" set /a installed+=1
set /a total+=1

echo 總計: %installed%/%total% 項已安裝
echo.

if %installed% equ %total% (
    echo 🎉 所有環境已安裝完成！
    echo.
    echo 🚀 下一步操作：
    echo    1. 進入 backend 目錄
    echo    2. 運行 composer start 啟動服務
    echo    3. 測試 API: http://localhost:8000/api/health
) else (
    echo ⚠️  還有 %total%-%installed% 項需要安裝
    echo    請參考 INSTALL_GUIDE.md 完成安裝
)

echo.
pause


