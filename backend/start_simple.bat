@echo off
chcp 65001 >nul
echo 🚀 啟動簡化版後端服務...
echo.

cd /d "%~dp0"
echo 📁 當前目錄: %CD%

echo.
echo 🔧 檢查PHP...
php --version
if %errorlevel% neq 0 (
    echo ❌ PHP未安裝或不在PATH中
    pause
    exit /b 1
)

echo.
echo 🚀 啟動PHP開發伺服器...
echo 📍 服務地址: http://localhost:8000
echo 📍 文檔根目錄: public/
echo.

php -S localhost:8000 -t public

pause
