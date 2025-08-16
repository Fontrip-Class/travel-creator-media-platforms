@echo off
echo ========================================
echo 環境檢查結果
echo ========================================
echo.

echo 檢查 PHP (XAMPP)...
"C:\xampp\php\php.exe" --version >nul 2>&1
if %errorlevel% equ 0 (
    echo PHP: 已安裝 (XAMPP)
    "C:\xampp\php\php.exe" --version
) else (
    echo PHP: 未安裝
)

echo.
echo 檢查 Composer...
"C:\ProgramData\ComposerSetup\bin\composer.bat" --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Composer: 已安裝
    "C:\ProgramData\ComposerSetup\bin\composer.bat" --version
) else (
    echo Composer: 未安裝
)

echo.
echo 檢查 PostgreSQL...
"C:\Program Files\PostgreSQL\14\bin\psql.exe" --version >nul 2>&1
if %errorlevel% equ 0 (
    echo PostgreSQL: 已安裝
    "C:\Program Files\PostgreSQL\14\bin\psql.exe" --version
) else (
    echo PostgreSQL: 未安裝
)

echo.
echo 檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js: 已安裝
    node --version
) else (
    echo Node.js: 未安裝
)

echo.
echo ========================================
pause

