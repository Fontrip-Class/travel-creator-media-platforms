@echo off
chcp 65001 >nul
echo 🚀 旅遊平台環境安裝腳本
echo ================================
echo.

echo 📋 檢查系統環境...
echo.

echo 📥 開始下載必要軟件...
echo.

echo 1️⃣ 下載 PHP 8.1+...
echo    正在下載 PHP 8.1+ Thread Safe x64...
powershell -Command "& {Invoke-WebRequest -Uri 'https://windows.php.net/downloads/releases/php-8.1.33-Win32-VS16-x64.zip' -OutFile 'php-8.1.33.zip'}"
if %errorlevel% equ 0 (
    echo ✅ PHP 下載完成
) else (
    echo ❌ PHP 下載失敗
    echo    請手動下載: https://windows.php.net/download/
    pause
    exit /b 1
)

echo.
echo 2️⃣ 下載 Composer...
echo    正在下載 Composer 安裝程序...
powershell -Command "& {Invoke-WebRequest -Uri 'https://getcomposer.org/Composer-Setup.exe' -OutFile 'Composer-Setup.exe'}"
if %errorlevel% equ 0 (
    echo ✅ Composer 下載完成
) else (
    echo ❌ Composer 下載失敗
    echo    請手動下載: https://getcomposer.org/Composer-Setup.exe
    pause
    exit /b 1
)

echo.
echo 3️⃣ 下載 PostgreSQL...
echo    正在下載 PostgreSQL 14+...
powershell -Command "& {Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-14.10-1-windows-x64.exe' -OutFile 'postgresql-14.10.exe'}"
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 下載完成
) else (
    echo ❌ PostgreSQL 下載失敗
    echo    請手動下載: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo.
echo 📦 開始安裝軟件...
echo.

echo 1️⃣ 安裝 PHP...
echo    解壓 PHP 到 C:\php...
if not exist "C:\php" mkdir "C:\php"
powershell -Command "& {Expand-Archive -Path 'php-8.1.33.zip' -DestinationPath 'C:\php' -Force}"
if %errorlevel% equ 0 (
    echo ✅ PHP 解壓完成
) else (
    echo ❌ PHP 解壓失敗
    pause
    exit /b 1
)

echo.
echo 2️⃣ 配置 PHP...
echo    複製配置文件...
copy "C:\php\php.ini-development" "C:\php\php.ini"
if %errorlevel% equ 0 (
    echo ✅ PHP 配置完成
) else (
    echo ❌ PHP 配置失敗
    pause
    exit /b 1
)

echo.
echo 3️⃣ 安裝 Composer...
echo    運行 Composer 安裝程序...
start /wait Composer-Setup.exe
if %errorlevel% equ 0 (
    echo ✅ Composer 安裝完成
) else (
    echo ❌ Composer 安裝失敗
    pause
    exit /b 1
)

echo.
echo 4️⃣ 安裝 PostgreSQL...
echo    運行 PostgreSQL 安裝程序...
start /wait postgresql-14.10.exe
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 安裝完成
) else (
    echo ❌ PostgreSQL 安裝失敗
    pause
    exit /b 1
)

echo.
echo 🔧 配置環境變數...
echo    添加 PHP 到 PATH...
setx PATH "%PATH%;C:\php" /M
if %errorlevel% equ 0 (
    echo ✅ 環境變數配置完成
) else (
    echo ❌ 環境變數配置失敗
    echo    請手動添加 C:\php 到系統 PATH
)

echo.
echo 🧹 清理下載文件...
del php-8.1.33.zip
del Composer-Setup.exe
del postgresql-14.10.exe

echo.
echo ✅ 環境安裝完成！
echo.
echo 🚀 下一步操作：
echo    1. 重新啟動 PowerShell 或命令提示字元
echo    2. 運行 php --version 檢查 PHP 安裝
echo    3. 運行 composer --version 檢查 Composer 安裝
echo    4. 運行 psql --version 檢查 PostgreSQL 安裝
echo    5. 進入 backend 目錄運行 install_optimized.bat
echo.
echo 📚 詳細說明請查看：
echo    - backend/README.md
echo    - backend/WINDOWS_INSTALL.md
echo.
pause


