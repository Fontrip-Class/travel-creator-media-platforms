@echo off
chcp 65001 >nul
echo 🗄️  旅遊平台數據庫配置腳本
echo ================================
echo.

echo 📋 請確保已安裝 PostgreSQL 並創建 travel_platform 數據庫
echo.

set /p DB_PASSWORD=請輸入 PostgreSQL postgres 用戶密碼: 

echo.
echo 🔧 開始配置數據庫擴展...
echo.

echo 1️⃣ 安裝 PostGIS 擴展...
psql -U postgres -h localhost -d travel_platform -c "CREATE EXTENSION IF NOT EXISTS postgis;" -w
if %errorlevel% equ 0 (
    echo ✅ PostGIS 擴展安裝成功
) else (
    echo ❌ PostGIS 擴展安裝失敗
    echo    請檢查 PostGIS 是否已安裝
    pause
    exit /b 1
)

echo.
echo 2️⃣ 安裝 uuid-ossp 擴展...
psql -U postgres -h localhost -d travel_platform -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" -w
if %errorlevel% equ 0 (
    echo ✅ uuid-ossp 擴展安裝成功
) else (
    echo ❌ uuid-ossp 擴展安裝失敗
    pause
    exit /b 1
)

echo.
echo 3️⃣ 安裝 pg_trgm 擴展...
psql -U postgres -h localhost -d travel_platform -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";" -w
if %errorlevel% equ 0 (
    echo ✅ pg_trgm 擴展安裝成功
) else (
    echo ❌ pg_trgm 擴展安裝失敗
    pause
    exit /b 1
)

echo.
echo 4️⃣ 驗證擴展安裝...
psql -U postgres -h localhost -d travel_platform -c "SELECT extname, extversion FROM pg_extension WHERE extname IN ('postgis', 'uuid-ossp', 'pg_trgm');" -w

echo.
echo 5️⃣ 執行數據庫腳本...
if exist "backend\database\schema_v2.sql" (
    echo    正在執行 schema_v2.sql...
    psql -U postgres -h localhost -d travel_platform -f "backend\database\schema_v2.sql" -w
    if %errorlevel% equ 0 (
        echo ✅ 數據庫腳本執行成功
    ) else (
        echo ❌ 數據庫腳本執行失敗
        echo    請檢查腳本文件是否存在
    )
) else (
    echo ⚠️  schema_v2.sql 文件不存在
    echo    請先創建數據庫腳本文件
)

echo.
echo 🎉 數據庫配置完成！
echo.
echo 🚀 下一步操作：
echo    1. 配置 backend/.env 文件
echo    2. 安裝後端依賴: composer install
echo    3. 啟動服務: composer start
echo.
pause


