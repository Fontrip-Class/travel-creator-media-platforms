# 🗄️ 數據庫配置詳細操作指南

## 📋 前置條件

在開始配置數據庫之前，請確保：
- ✅ PostgreSQL 14+ 已安裝
- ✅ PostGIS 擴展已安裝
- ✅ `travel_platform` 數據庫已創建
- ✅ 記住了 postgres 用戶密碼

## 🔧 方法1：使用 pgAdmin 4 圖形界面（推薦新手）

### 步驟1：啟動 pgAdmin 4

1. **打開開始菜單**
   - 按 `Win` 鍵
   - 輸入 "pgAdmin 4"
   - 點擊 "pgAdmin 4" 應用程序

2. **設置主密碼**
   - 首次啟動會要求設置主密碼
   - 輸入一個安全的密碼（請記住！）
   - 點擊 "OK"

### 步驟2：連接到 PostgreSQL 服務器

1. **展開服務器列表**
   - 在左側導航欄找到 "Servers"
   - 點擊展開箭頭

2. **連接到本地服務器**
   - 找到 "PostgreSQL 14" 或類似名稱
   - 雙擊服務器名稱
   - 輸入安裝時設置的 postgres 用戶密碼
   - 點擊 "OK"

### 步驟3：選擇目標數據庫

1. **展開數據庫列表**
   - 在服務器下找到 "Databases"
   - 點擊展開箭頭

2. **選擇 travel_platform**
   - 找到 `travel_platform` 數據庫
   - 雙擊數據庫名稱（會顯示連接狀態）

### 步驟4：打開查詢工具

1. **右鍵點擊數據庫**
   - 在 `travel_platform` 上右鍵
   - 選擇 "Query Tool"（查詢工具）

2. **等待查詢工具加載**
   - 會打開一個新的查詢編輯器窗口

### 步驟5：安裝 PostGIS 擴展

1. **輸入安裝命令**
   ```sql
   CREATE EXTENSION postgis;
   ```

2. **執行命令**
   - 點擊工具欄的執行按鈕（⚡ 閃電圖標）
   - 或按 `F5` 鍵

3. **檢查結果**
   - 如果成功，會顯示 "Query returned successfully"
   - 如果失敗，會顯示錯誤信息

### 步驟6：安裝 uuid-ossp 擴展

1. **輸入安裝命令**
   ```sql
   CREATE EXTENSION "uuid-ossp";
   ```

2. **執行命令**
   - 點擊執行按鈕或按 `F5`

### 步驟7：安裝 pg_trgm 擴展

1. **輸入安裝命令**
   ```sql
   CREATE EXTENSION "pg_trgm";
   ```

2. **執行命令**
   - 點擊執行按鈕或按 `F5`

### 步驟8：驗證安裝

1. **執行驗證查詢**
   ```sql
   SELECT extname, extversion FROM pg_extension 
   WHERE extname IN ('postgis', 'uuid-ossp', 'pg_trgm');
   ```

2. **檢查結果**
   - 應該看到三個擴展及其版本號

## 🔧 方法2：使用命令行（適合進階用戶）

### 步驟1：打開命令提示字元

1. **按快捷鍵**
   - 按 `Win + R` 鍵
   - 輸入 `cmd`
   - 按 `Enter`

2. **以管理員身份運行**
   - 右鍵點擊命令提示字元
   - 選擇 "以管理員身份運行"

### 步驟2：連接到 PostgreSQL

```bash
psql -U postgres -h localhost
```

- 系統會提示輸入密碼
- 輸入安裝時設置的 postgres 用戶密碼

### 步驟3：切換到目標數據庫

```sql
\c travel_platform
```

- 系統會顯示連接成功信息

### 步驟4：安裝擴展

```sql
-- 安裝 PostGIS
CREATE EXTENSION postgis;

-- 安裝 uuid-ossp
CREATE EXTENSION "uuid-ossp";

-- 安裝 pg_trgm
CREATE EXTENSION "pg_trgm";
```

### 步驟5：驗證安裝

```sql
-- 查看已安裝的擴展
SELECT extname, extversion FROM pg_extension 
WHERE extname IN ('postgis', 'uuid-ossp', 'pg_trgm');

-- 退出 psql
\q
```

## 🔧 方法3：使用自動化腳本（最快速）

### 步驟1：運行配置腳本

1. **雙擊運行**
   - 雙擊 `setup_database.bat` 文件

2. **輸入密碼**
   - 腳本會提示輸入 PostgreSQL 密碼
   - 輸入安裝時設置的 postgres 用戶密碼

3. **等待完成**
   - 腳本會自動執行所有配置步驟
   - 顯示每個步驟的執行結果

## 🚨 常見問題和解決方案

### 問題1：PostGIS 擴展安裝失敗

**錯誤信息**：
```
ERROR: could not open extension control file
```

**解決方案**：
1. 確認 PostGIS 已正確安裝
2. 重新安裝 PostGIS
3. 檢查 PostgreSQL 版本兼容性

### 問題2：權限不足

**錯誤信息**：
```
ERROR: permission denied to create extension
```

**解決方案**：
1. 確認使用 postgres 超級用戶
2. 檢查數據庫所有者權限
3. 重新以管理員身份運行

### 問題3：擴展已存在

**錯誤信息**：
```
ERROR: extension "postgis" already exists
```

**解決方案**：
- 這是正常情況，表示擴展已經安裝
- 可以忽略此錯誤，繼續安裝其他擴展

### 問題4：連接失敗

**錯誤信息**：
```
psql: error: connection to server at "localhost" failed
```

**解決方案**：
1. 確認 PostgreSQL 服務已啟動
2. 檢查防火牆設置
3. 確認端口號（默認 5432）

## ✅ 驗證配置成功

### 檢查擴展狀態

```sql
-- 在 pgAdmin 查詢工具中執行
SELECT 
    extname AS "擴展名稱",
    extversion AS "版本",
    CASE 
        WHEN extname = 'postgis' THEN '地理信息系統'
        WHEN extname = 'uuid-ossp' THEN 'UUID生成器'
        WHEN extname = 'pg_trgm' THEN '文本相似度'
    END AS "功能說明"
FROM pg_extension 
WHERE extname IN ('postgis', 'uuid-ossp', 'pg_trgm')
ORDER BY extname;
```

### 測試擴展功能

```sql
-- 測試 PostGIS
SELECT PostGIS_Version();

-- 測試 UUID
SELECT uuid_generate_v4();

-- 測試 pg_trgm
SELECT similarity('hello', 'helo');
```

## 🚀 下一步操作

配置完成後，您需要：

1. **執行數據庫腳本**
   - 在 pgAdmin 中執行 `backend/database/schema_v2.sql`

2. **配置環境變數**
   - 複製 `backend/env_v2.example` 為 `backend/.env`
   - 更新數據庫連接信息

3. **安裝後端依賴**
   ```bash
   cd backend
   composer install
   ```

4. **啟動服務**
   ```bash
   composer start
   ```

## 📞 需要幫助？

如果遇到問題：
1. 檢查錯誤日誌
2. 參考 PostgreSQL 官方文檔
3. 在 GitHub Issues 中提問
4. 聯繫開發團隊

---

**完成數據庫配置後，您就可以啟動後端服務並測試新實現的功能了！** 🎉


