# 編碼問題預防和解決指南

## 🚨 編碼問題的根本原因

### 1. **編碼不一致問題**
- **文件編碼混亂**：部分文件使用 UTF-8，部分使用其他編碼（GBK、Big5 等）
- **編輯器設置不一致**：不同開發環境的編輯器編碼設置不同
- **Git 配置問題**：Git 的 `core.autocrlf` 和編碼設置不當

### 2. **具體表現**
- 中文字符顯示為 `?` 或亂碼
- 字符串未終止錯誤
- 編譯失敗
- 前端構建錯誤

### 3. **觸發條件**
- 跨平台開發（Windows/Linux/Mac）
- 不同編輯器間切換
- Git 操作時的編碼轉換
- 複製貼上中文字符時編碼丟失

## 🛠️ 解決方案

### **短期解決方案（已執行）**
1. ✅ 批量修復所有 TypeScript 文件的編碼問題
2. ✅ 修復關鍵文件的亂碼字符
3. ✅ 統一文件編碼為 UTF-8

### **長期解決方案（已配置）**
1. ✅ 創建 `.gitattributes` 文件
2. ✅ 配置 Git 編碼設置
3. ✅ 設置文件行尾符號標準

## 📋 開發環境標準化

### **VS Code 設置**
```json
{
  "files.encoding": "utf8",
  "files.eol": "\n",
  "files.autoGuessEncoding": false
}
```

### **WebStorm 設置**
- File Encoding: UTF-8
- Line Separator: Unix and OS X (\n)

### **Sublime Text 設置**
- File > Save with Encoding > UTF-8
- View > Syntax > Plain Text > UTF-8

## 🔍 編碼檢查工具

### **PowerShell 編碼檢查腳本**
```powershell
# 檢查文件編碼
Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    if ($content -match '[\?\?\?\?]') {
        Write-Host "發現編碼問題: $($_.Name)" -ForegroundColor Red
    }
}
```

### **Git 編碼檢查**
```bash
# 檢查文件編碼
git diff --name-only | xargs file

# 檢查特定文件的編碼
file src/pages/Index.tsx
```

## 🚫 預防措施

### **1. 編輯器設置統一**
- 所有開發者使用相同的編碼設置
- 強制使用 UTF-8 編碼
- 禁用自動編碼猜測

### **2. Git 操作規範**
- 提交前檢查文件編碼
- 使用 `.gitattributes` 強制編碼
- 避免跨平台複製貼上

### **3. 開發流程標準化**
- 新文件必須使用 UTF-8 編碼
- 定期檢查編碼一致性
- 在 CI/CD 流程中加入編碼檢查

## 📚 常見編碼問題及解決方法

### **問題 1: 中文字符顯示為 ?**
**原因**: 文件編碼不是 UTF-8
**解決**: 重新保存文件為 UTF-8 編碼

### **問題 2: 字符串未終止錯誤**
**原因**: 編碼問題導致引號丟失
**解決**: 修復編碼後重新檢查語法

### **問題 3: 前端構建失敗**
**原因**: TypeScript 文件編碼問題
**解決**: 批量修復編碼問題

## 🔄 定期維護

### **每月檢查**
1. 運行編碼檢查腳本
2. 檢查新文件的編碼
3. 更新編碼修復腳本

### **版本發布前檢查**
1. 編碼一致性檢查
2. 前端構建測試
3. 編碼問題修復

## 📞 緊急處理流程

### **發現編碼問題時**
1. 立即停止相關開發工作
2. 運行編碼修復腳本
3. 檢查修復結果
4. 提交修復後的代碼
5. 分析問題原因
6. 更新預防措施

---

**最後更新**: $(Get-Date)
**維護者**: 開發團隊
**版本**: 1.0
