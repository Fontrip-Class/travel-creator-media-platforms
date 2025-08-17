@echo off
chcp 65001 >nul
title 旅遊創作者媒體平台 - 服務啟動器
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                旅遊創作者媒體平台 - 服務啟動器                ║
echo ║                                                              ║
echo ║  本程序將同時啟動前端和後端服務                              ║
echo ║  前端: React + Vite (端口 8080)                              ║
echo ║  後端: PHP + Slim Framework (端口 8000)                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 檢查環境...
echo.

REM 檢查Node.js
echo 📦 檢查Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安裝或不在PATH中
    echo 💡 請先安裝Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js已安裝

REM 檢查PHP
echo 📦 檢查PHP...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PHP未安裝或不在PATH中
    echo 💡 請先安裝PHP 8.1或更高版本
    pause
    exit /b 1
)
echo ✅ PHP已安裝

REM 檢查依賴
echo 📦 檢查前端依賴...
if not exist "node_modules" (
    echo ⚠️  前端依賴未安裝，正在安裝...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依賴安裝失敗
        pause
        exit /b 1
    )
    echo ✅ 前端依賴安裝完成
) else (
    echo ✅ 前端依賴已安裝
)

echo 📦 檢查後端依賴...
if not exist "backend\vendor" (
    echo ⚠️  後端依賴未安裝，正在安裝...
    cd backend
    composer install
    if %errorlevel% neq 0 (
        echo ❌ 後端依賴安裝失敗
        pause
        exit /b 1
    )
    cd ..
    echo ✅ 後端依賴安裝完成
) else (
    echo ✅ 後端依賴已安裝
)

echo.
echo 🚀 啟動服務...
echo.

REM 創建啟動腳本
echo @echo off > start_frontend.bat
echo title 前端服務 - React + Vite >> start_frontend.bat
echo color 0B >> start_frontend.bat
echo echo 🚀 啟動前端服務... >> start_frontend.bat
echo echo 📍 地址: http://localhost:8080 >> start_frontend.bat
echo echo. >> start_frontend.bat
echo echo 💡 按 Ctrl+C 停止服務 >> start_frontend.bat
echo echo. >> start_frontend.bat
echo npm run dev >> start_frontend.bat

echo @echo off > start_backend.bat
echo title 後端服務 - PHP + Slim >> start_backend.bat
echo color 0E >> start_backend.bat
echo echo 🚀 啟動後端服務... >> start_backend.bat
echo echo 📍 地址: http://localhost:8000 >> start_backend.bat
echo echo. >> start_backend.bat
echo echo 💡 按 Ctrl+C 停止服務 >> start_backend.bat
echo echo. >> start_backend.bat
echo cd backend >> start_backend.bat
echo php -S localhost:8000 -t public >> start_backend.bat

REM 啟動前端服務
echo 🎨 啟動前端服務 (React + Vite)...
start "前端服務" cmd /k "start_frontend.bat"

REM 等待一下讓前端啟動
timeout /t 3 /nobreak >nul

REM 啟動後端服務
echo 🔧 啟動後端服務 (PHP + Slim)...
start "後端服務" cmd /k "start_backend.bat"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        服務啟動完成                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 前端服務: http://localhost:8080
echo 🔌 後端API:  http://localhost:8000
echo.
echo 💡 提示:
echo    - 前端服務運行在藍色視窗中
echo    - 後端服務運行在黃色視窗中
echo    - 關閉對應視窗即可停止服務
echo    - 或按 Ctrl+C 停止服務
echo.
echo 🎉 現在可以打開瀏覽器訪問 http://localhost:8080 了！
echo.

REM 等待用戶確認
pause

REM 清理臨時文件
del start_frontend.bat >nul 2>&1
del start_backend.bat >nul 2>&1

echo.
echo 👋 服務啟動器已關閉，服務仍在運行中...
echo �� 如需停止服務，請關閉對應的服務視窗
