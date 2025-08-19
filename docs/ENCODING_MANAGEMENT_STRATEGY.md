# 編碼管理策略 (Encoding Management Strategy)

## 🎯 目標

建立統一的編碼標準，確保所有開發人員在不同環境下都能保持一致的編碼格式，避免中文字符亂碼問題。

## 📋 編碼標準

### 1. 文件編碼
- **統一使用 UTF-8 編碼**
- **無 BOM (Byte Order Mark)**
- **換行符統一使用 LF (Unix 風格)**

### 2. 語言特定編碼
- **前端文件**: `.tsx`, `.ts`, `.js`, `.jsx`, `.css`, `.html` → UTF-8
- **後端文件**: `.php` → UTF-8
- **配置文件**: `.json`, `.yml`, `.yaml`, `.md` → UTF-8
- **腳本文件**: `.bat`, `.ps1` → UTF-8 (Windows 兼容)

## 🛠️ 工具配置

### 1. EditorConfig 配置

項目根目錄已包含 `.editorconfig` 文件，確保所有編輯器都遵循相同的編碼標準。

**支援的編輯器**:
- VS Code / Cursor
- IntelliJ IDEA / WebStorm
- Sublime Text
- Atom
- Vim / Neovim
- 其他支援 EditorConfig 的編輯器

### 2. VS Code / Cursor 配置

在 `.vscode/settings.json` 中添加：

```json
{
  "files.encoding": "utf8",
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  "files.autoGuessEncoding": false,
  "files.encoding": "utf8",
  "files.eol": "\n"
}
```

### 3. Git 配置

在項目根目錄的 `.gitattributes` 文件中添加：

```
# 設置默認行為，如果沒有指定，Git 會自動處理
* text=auto

# 明確指定文本文件
*.tsx text eol=lf
*.ts text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.css text eol=lf
*.html text eol=lf
*.php text eol=lf
*.json text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
*.md text eol=lf
*.sql text eol=lf

# 二進制文件
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary
*.zip binary
*.tar binary
*.gz binary

# Windows 腳本文件保持 CRLF
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf
```

## 📝 開發流程

### 1. 新文件創建
1. **確保編輯器設置為 UTF-8 編碼**
2. **使用 EditorConfig 自動格式化**
3. **保存時檢查編碼是否正確**

### 2. 現有文件檢查
1. **使用編碼檢測工具檢查文件編碼**
2. **如有問題，使用轉換工具修復**
3. **重新保存為 UTF-8 編碼**

### 3. 代碼提交前檢查
1. **檢查是否有編碼問題**
2. **確保換行符統一**
3. **驗證中文字符顯示正常**

## 🔧 編碼問題解決方案

### 1. 檢測文件編碼

#### Windows PowerShell
```powershell
# 檢查文件編碼
Get-Content -Path "filename.tsx" -Encoding UTF8 | Out-Null
if ($?) { Write-Host "UTF-8 編碼正確" } else { Write-Host "編碼有問題" }
```

#### 使用 VS Code
1. 打開文件
2. 查看右下角狀態欄的編碼信息
3. 如果不是 UTF-8，點擊更改編碼

### 2. 修復編碼問題

#### 方法 1: VS Code 轉換
1. 打開有問題的文件
2. 按 `Ctrl+Shift+P` 打開命令面板
3. 輸入 "Change File Encoding"
4. 選擇 "Reopen with Encoding" → "UTF-8"
5. 重新保存文件

#### 方法 2: 使用 PowerShell 腳本
```powershell
# 創建編碼修復腳本
$content = Get-Content -Path "filename.tsx" -Raw
$utf8NoBOM = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("filename.tsx", $content, $utf8NoBOM)
```

### 3. 批量修復編碼

創建 `fix_encoding.ps1` 腳本：

```powershell
param(
    [string]$Path = ".",
    [string]$Filter = "*.tsx"
)

$files = Get-ChildItem -Path $Path -Filter $Filter -Recurse

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw
        $utf8NoBOM = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBOM)
        Write-Host "已修復: $($file.FullName)" -ForegroundColor Green
    }
    catch {
        Write-Host "修復失敗: $($file.FullName) - $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

## 🚨 常見問題及解決方案

### 1. 中文字符顯示為問號 (??)
**原因**: 文件編碼不是 UTF-8
**解決方案**: 使用 VS Code 重新編碼為 UTF-8

### 2. 中文字符顯示為亂碼
**原因**: 編碼格式錯誤或 BOM 問題
**解決方案**: 使用 UTF-8 無 BOM 格式重新保存

### 3. 換行符不一致
**原因**: 不同操作系統的換行符不同
**解決方案**: 使用 EditorConfig 統一為 LF

### 4. Git 顯示編碼問題
**原因**: Git 配置不正確
**解決方案**: 配置 `.gitattributes` 和 Git 設置

## 📚 最佳實踐

### 1. 開發環境設置
- **統一使用 VS Code 或 Cursor**
- **安裝 EditorConfig 擴展**
- **設置默認編碼為 UTF-8**

### 2. 團隊協作
- **所有開發人員都使用相同的編輯器配置**
- **提交代碼前檢查編碼**
- **定期檢查項目編碼一致性**

### 3. 持續集成
- **在 CI/CD 流程中添加編碼檢查**
- **自動檢測和報告編碼問題**
- **強制執行編碼標準**

## 🔍 編碼檢查工具

### 1. 內建工具
- **VS Code**: 內建編碼檢測和轉換
- **Git**: 自動處理文本文件編碼
- **EditorConfig**: 自動格式化

### 2. 第三方工具
- **file**: 檢測文件類型
- **iconv**: 轉換文件編碼
- **PowerShell**: 腳本化編碼處理

## 📋 檢查清單

### 開發前檢查
- [ ] 編輯器設置為 UTF-8 編碼
- [ ] EditorConfig 擴展已安裝
- [ ] Git 配置正確

### 開發中檢查
- [ ] 新文件使用正確編碼
- [ ] 中文字符顯示正常
- [ ] 換行符統一

### 提交前檢查
- [ ] 編碼問題已修復
- [ ] 文件格式正確
- [ ] 中文字符測試通過

## 🎉 總結

通過實施這套編碼管理策略，我們可以：

1. **避免編碼問題**: 統一的編碼標準
2. **提高開發效率**: 自動化編碼處理
3. **確保代碼質量**: 一致的代碼格式
4. **改善團隊協作**: 統一的開發環境

**記住**: 編碼問題是預防勝於治療，正確的配置和工具使用可以避免大部分編碼問題的發生。

---

**最後更新**: 2024年1月18日
**維護人員**: 開發團隊
**版本**: v1.0.0
