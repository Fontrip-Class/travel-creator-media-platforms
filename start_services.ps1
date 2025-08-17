# 旅遊創作者媒體平台 - 服務啟動器 (PowerShell版本)
# 需要以管理員權限運行

param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$Help
)

# 設置控制台編碼和顏色
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "旅遊創作者媒體平台 - 服務啟動器"

# 顏色定義
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Show-Header {
    Clear-Host
    Write-ColorText "╔══════════════════════════════════════════════════════════════╗" $Colors.Header
    Write-ColorText "║                旅遊創作者媒體平台 - 服務啟動器                ║" $Colors.Header
    Write-ColorText "║                                                              ║" $Colors.Header
    Write-ColorText "║  本程序將同時啟動前端和後端服務                              ║" $Colors.Header
    Write-ColorText "║  前端: React + Vite (端口 8080)                              ║" $Colors.Header
    Write-ColorText "║  後端: PHP + Slim Framework (端口 8000)                      ║" $Colors.Header
    Write-ColorText "╚══════════════════════════════════════════════════════════════╝" $Colors.Header
    Write-Host ""
}

function Show-Help {
    Write-ColorText "使用方法:" $Colors.Info
    Write-Host "  .\start_services.ps1          # 啟動所有服務"
    Write-Host "  .\start_services.ps1 -Stop    # 停止所有服務"
    Write-Host "  .\start_services.ps1 -Status  # 檢查服務狀態"
    Write-Host "  .\start_services.ps1 -Help    # 顯示此幫助信息"
    Write-Host ""
    Write-ColorText "注意事項:" $Colors.Warning
    Write-Host "  - 需要以管理員權限運行PowerShell"
    Write-Host "  - 確保已安裝Node.js和PHP 8.1+"
    Write-Host "  - 首次運行會自動安裝依賴"
}

function Test-Environment {
    Write-ColorText "🔍 檢查環境..." $Colors.Info
    Write-Host ""

    # 檢查Node.js
    Write-ColorText "📦 檢查Node.js..." $Colors.Info
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-ColorText "✅ Node.js已安裝: $nodeVersion" $Colors.Success
        } else {
            throw "Node.js未安裝"
        }
    } catch {
        Write-ColorText "❌ Node.js未安裝或不在PATH中" $Colors.Error
        Write-ColorText "💡 請先安裝Node.js: https://nodejs.org/" $Colors.Warning
        return $false
    }

    # 檢查PHP
    Write-ColorText "📦 檢查PHP..." $Colors.Info
    try {
        $phpVersion = php --version 2>$null | Select-Object -First 1
        if ($phpVersion) {
            Write-ColorText "✅ PHP已安裝: $phpVersion" $Colors.Success
        } else {
            throw "PHP未安裝"
        }
    } catch {
        Write-ColorText "❌ PHP未安裝或不在PATH中" $Colors.Error
        Write-ColorText "💡 請先安裝PHP 8.1或更高版本" $Colors.Warning
        return $false
    }

    # 檢查Composer
    Write-ColorText "📦 檢查Composer..." $Colors.Info
    try {
        $composerVersion = composer --version 2>$null | Select-Object -First 1
        if ($composerVersion) {
            Write-ColorText "✅ Composer已安裝: $composerVersion" $Colors.Success
        } else {
            throw "Composer未安裝"
        }
    } catch {
        Write-ColorText "❌ Composer未安裝或不在PATH中" $Colors.Error
        Write-ColorText "💡 請先安裝Composer: https://getcomposer.org/" $Colors.Warning
        return $false
    }

    Write-Host ""
    return $true
}

function Install-Dependencies {
    Write-ColorText "📦 安裝依賴..." $Colors.Info
    Write-Host ""

    # 安裝前端依賴
    Write-ColorText "📦 安裝前端依賴..." $Colors.Info
    if (-not (Test-Path "node_modules")) {
        Write-ColorText "⚠️  前端依賴未安裝，正在安裝..." $Colors.Warning
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-ColorText "❌ 前端依賴安裝失敗" $Colors.Error
            return $false
        }
        Write-ColorText "✅ 前端依賴安裝完成" $Colors.Success
    } else {
        Write-ColorText "✅ 前端依賴已安裝" $Colors.Success
    }

    # 安裝後端依賴
    Write-ColorText "📦 安裝後端依賴..." $Colors.Info
    if (-not (Test-Path "backend\vendor")) {
        Write-ColorText "⚠️  後端依賴未安裝，正在安裝..." $Colors.Warning
        Set-Location backend
        composer install
        if ($LASTEXITCODE -ne 0) {
            Write-ColorText "❌ 後端依賴安裝失敗" $Colors.Error
            Set-Location ..
            return $false
        }
        Set-Location ..
        Write-ColorText "✅ 後端依賴安裝完成" $Colors.Success
    } else {
        Write-ColorText "✅ 後端依賴已安裝" $Colors.Success
    }

    Write-Host ""
    return $true
}

function Start-Services {
    Write-ColorText "🚀 啟動服務..." $Colors.Info
    Write-Host ""

    # 啟動前端服務
    Write-ColorText "🎨 啟動前端服務 (React + Vite)..." $Colors.Info
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🚀 前端服務啟動中...' -ForegroundColor Cyan; Write-Host '📍 地址: http://localhost:8080' -ForegroundColor Green; Write-Host '💡 按 Ctrl+C 停止服務' -ForegroundColor Yellow; npm run dev" -WindowStyle Normal

    # 等待前端啟動
    Start-Sleep -Seconds 3

    # 啟動後端服務
    Write-ColorText "🔧 啟動後端服務 (PHP + Slim)..." $Colors.Info
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🚀 後端服務啟動中...' -ForegroundColor Cyan; Write-Host '📍 地址: http://localhost:8000' -ForegroundColor Green; Write-Host '💡 按 Ctrl+C 停止服務' -ForegroundColor Yellow; Set-Location backend; php -S localhost:8000 -t public" -WindowStyle Normal

    Write-Host ""
    Write-ColorText "╔══════════════════════════════════════════════════════════════╗" $Colors.Header
    Write-ColorText "║                        服務啟動完成                          ║" $Colors.Header
    Write-ColorText "╚══════════════════════════════════════════════════════════════╝" $Colors.Header
    Write-Host ""
    Write-ColorText "🌐 前端服務: http://localhost:8080" $Colors.Success
    Write-ColorText "🔌 後端API:  http://localhost:8000" $Colors.Success
    Write-Host ""
    Write-ColorText "💡 提示:" $Colors.Info
    Write-Host "   - 前端服務運行在藍色視窗中"
    Write-Host "   - 後端服務運行在黃色視窗中"
    Write-Host "   - 關閉對應視窗即可停止服務"
    Write-Host "   - 或按 Ctrl+C 停止服務"
    Write-Host ""
    Write-ColorText "🎉 現在可以打開瀏覽器訪問 http://localhost:8080 了！" $Colors.Success
    Write-Host ""
}

function Stop-Services {
    Write-ColorText "🛑 停止服務..." $Colors.Warning
    Write-Host ""

    # 停止Node.js進程
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" }
    if ($nodeProcesses) {
        Write-ColorText "🔄 停止前端服務..." $Colors.Info
        $nodeProcesses | Stop-Process -Force
        Write-ColorText "✅ 前端服務已停止" $Colors.Success
    } else {
        Write-ColorText "ℹ️  前端服務未運行" $Colors.Info
    }

    # 停止PHP進程
    $phpProcesses = Get-Process | Where-Object { $_.ProcessName -eq "php" }
    if ($phpProcesses) {
        Write-ColorText "🔄 停止後端服務..." $Colors.Info
        $phpProcesses | Stop-Process -Force
        Write-ColorText "✅ 後端服務已停止" $Colors.Success
    } else {
        Write-ColorText "ℹ️  後端服務未運行" $Colors.Info
    }

    Write-Host ""
    Write-ColorText "✅ 所有服務已停止" $Colors.Success
}

function Get-ServiceStatus {
    Write-ColorText "📊 服務狀態檢查..." $Colors.Info
    Write-Host ""

    # 檢查端口使用情況
    $frontendPort = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
    $backendPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

    Write-ColorText "🌐 前端服務 (端口 8080):" $Colors.Info
    if ($frontendPort) {
        Write-ColorText "✅ 運行中 - http://localhost:8080" $Colors.Success
    } else {
        Write-ColorText "❌ 未運行" $Colors.Error
    }

    Write-ColorText "🔌 後端服務 (端口 8000):" $Colors.Info
    if ($backendPort) {
        Write-ColorText "✅ 運行中 - http://localhost:8000" $Colors.Success
    } else {
        Write-ColorText "❌ 未運行" $Colors.Error
    }

    Write-Host ""
    Write-ColorText "💡 使用 .\start_services.ps1 啟動服務" $Colors.Info
}

# 主程序
if ($Help) {
    Show-Help
    exit
}

if ($Stop) {
    Stop-Services
    exit
}

if ($Status) {
    Get-ServiceStatus
    exit
}

# 檢查權限
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-ColorText "❌ 需要管理員權限運行此腳本" $Colors.Error
    Write-ColorText "💡 請右鍵點擊PowerShell，選擇'以管理員身份運行'" $Colors.Warning
    pause
    exit
}

Show-Header

if (-not (Test-Environment)) {
    Write-ColorText "❌ 環境檢查失敗，請解決上述問題後重試" $Colors.Error
    pause
    exit
}

if (-not (Install-Dependencies)) {
    Write-ColorText "❌ 依賴安裝失敗，請檢查錯誤信息後重試" $Colors.Error
    pause
    exit
}

Start-Services

Write-ColorText "👋 服務啟動器已完成，服務仍在運行中..." $Colors.Info
Write-ColorText "💡 如需停止服務，請使用 .\start_services.ps1 -Stop" $Colors.Info
Write-Host ""
pause
