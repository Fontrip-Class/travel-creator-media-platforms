# 編碼檢查腳本
Write-Host "開始檢查所有 TypeScript 文件的編碼問題..." -ForegroundColor Green

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Where-Object { $_.Name -notlike "*node_modules*" }
$problemFiles = @()

Write-Host "找到 $($files.Count) 個文件需要檢查" -ForegroundColor Yellow

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # 檢查常見的編碼問題
        if ($content -match '[\?\?\?\?]') {
            $problemFiles += $file.Name
            Write-Host "發現編碼問題: $($file.Name)" -ForegroundColor Red
        } else {
            Write-Host "  ✓ $($file.Name)" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  ✗ 檢查失敗: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n檢查完成！" -ForegroundColor Green

if ($problemFiles.Count -gt 0) {
    Write-Host "發現 $($problemFiles.Count) 個文件有編碼問題:" -ForegroundColor Red
    foreach ($file in $problemFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Write-Host "`n建議運行編碼修復腳本: .\fix_encoding.bat" -ForegroundColor Yellow
} else {
    Write-Host "所有文件編碼正常！" -ForegroundColor Green
}

Write-Host "`n按任意鍵繼續..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
