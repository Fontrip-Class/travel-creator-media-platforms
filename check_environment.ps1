Write-Host "========================================" -ForegroundColor Green
Write-Host "環境檢查結果" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "檢查 PHP (XAMPP)..." -ForegroundColor Yellow
try {
    $phpVersion = & "C:\xampp\php\php.exe" --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PHP: 已安裝 (XAMPP)" -ForegroundColor Green
        Write-Host $phpVersion[0] -ForegroundColor Cyan
    } else {
        Write-Host "PHP: 未安裝" -ForegroundColor Red
    }
} catch {
    Write-Host "PHP: 未安裝" -ForegroundColor Red
}

Write-Host ""
Write-Host "檢查 Composer..." -ForegroundColor Yellow
try {
    $composerVersion = & "C:\ProgramData\ComposerSetup\bin\composer.bat" --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Composer: 已安裝" -ForegroundColor Green
        Write-Host $composerVersion[0] -ForegroundColor Cyan
    } else {
        Write-Host "Composer: 未安裝" -ForegroundColor Red
    }
} catch {
    Write-Host "Composer: 未安裝" -ForegroundColor Red
}

Write-Host ""
Write-Host "檢查 PostgreSQL..." -ForegroundColor Yellow
try {
    $psqlVersion = & "C:\Program Files\PostgreSQL\14\bin\psql.exe" --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL: 已安裝" -ForegroundColor Green
        Write-Host $psqlVersion[0] -ForegroundColor Cyan
    } else {
        Write-Host "PostgreSQL: 未安裝" -ForegroundColor Red
    }
} catch {
    Write-Host "PostgreSQL: 未安裝" -ForegroundColor Red
}

Write-Host ""
Write-Host "檢查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & "node" --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Node.js: 已安裝" -ForegroundColor Green
        Write-Host $nodeVersion -ForegroundColor Cyan
    } else {
        Write-Host "Node.js: 未安裝" -ForegroundColor Red
    }
} catch {
    Write-Host "Node.js: 未安裝" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "檢查完成！" -ForegroundColor Green

