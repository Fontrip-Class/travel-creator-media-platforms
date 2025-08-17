# 旅遊平台資料庫初始化說明

## 概述
本目錄包含了旅遊平台的資料庫初始化腳本和相關文檔，用於確保資料庫表結構和欄位的一致性。

## 文件說明

### 核心文件
- `init_database.php` - 主要的資料庫初始化腳本
- `consistency_report.md` - 資料庫字段一致性檢查報告
- `schema_v4.sql` - 最新的資料庫結構定義
- `schema_v3.sql` - 權限管理版資料庫結構
- `schema_v2.sql` - 優化版資料庫結構

### 執行腳本
- `../init_db.bat` - Windows批處理腳本
- `../init_db.sh` - Linux/Mac shell腳本

## 快速開始

### Windows用戶
1. 雙擊 `init_db.bat` 文件
2. 腳本會自動檢查環境並執行初始化
3. 按照提示完成操作

### Linux/Mac用戶
1. 確保腳本有執行權限：
   ```bash
   chmod +x ../init_db.sh
   ```
2. 執行腳本：
   ```bash
   ./../init_db.sh
   ```

### 手動執行
```bash
cd backend
php database/init_database.php
```

## 支援的資料庫

### SQLite (開發環境)
- 默認配置，無需額外安裝
- 適合開發和測試
- 自動創建資料庫文件

### MySQL (生產環境)
- 需要安裝MySQL服務器
- 支援所有功能
- 高性能和穩定性

### PostgreSQL (進階功能)
- 支援PostGIS地理信息功能
- 支援JSON和陣列類型
- 適合複雜查詢和地理應用

## 環境配置

### 創建.env文件
```bash
# 複製環境變數模板
cp env.example .env

# 編輯.env文件
DB_DRIVER=sqlite  # 或 mysql, pgsql
DB_HOST=localhost
DB_PORT=3306      # MySQL: 3306, PostgreSQL: 5432
DB_NAME=travel_platform
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 資料庫驅動選擇
```bash
# SQLite (推薦開發環境)
DB_DRIVER=sqlite

# MySQL (推薦生產環境)
DB_DRIVER=mysql

# PostgreSQL (推薦進階功能)
DB_DRIVER=pgsql
```

## 初始化過程

### 1. 環境檢查
- 檢查PHP安裝
- 檢查Composer依賴
- 檢查環境變數配置

### 2. 資料庫連接
- 根據驅動類型建立連接
- 創建資料庫（如果不存在）
- 啟用必要的擴展

### 3. 表結構創建
- 創建基礎表（用戶、任務等）
- 創建任務管理表
- 創建權限管理表
- 創建索引和觸發器

### 4. 初始數據
- 插入基本權限
- 插入角色權限關聯
- 插入示例用戶（可選）

### 5. 驗證和報告
- 驗證所有表結構
- 生成初始化報告
- 顯示警告和錯誤

## 常見問題

### Q: 初始化失敗怎麼辦？
A: 檢查以下幾點：
1. PHP版本是否支援（建議7.4+）
2. Composer依賴是否正確安裝
3. 資料庫連接配置是否正確
4. 查看錯誤日誌獲取詳細信息

### Q: 如何遷移現有數據？
A: 建議按以下步驟：
1. 備份現有資料庫
2. 執行初始化腳本
3. 使用數據遷移腳本（需要單獨開發）
4. 驗證數據完整性

### Q: 支援哪些PHP版本？
A: 建議使用PHP 7.4或更高版本，支援：
- 類型聲明
- 屬性提升
- 空合併運算符
- 箭頭函數

### Q: 如何自定義表結構？
A: 修改 `init_database.php` 文件：
1. 在對應的 `create*Table()` 方法中修改SQL
2. 添加新的表創建方法
3. 在 `createBaseTables()` 中調用新方法

## 開發建議

### 1. 版本控制
- 每次修改資料庫結構後更新schema文件
- 使用遷移腳本管理資料庫版本
- 記錄所有結構變更

### 2. 測試
- 在開發環境中充分測試
- 使用測試數據驗證功能
- 執行回滾測試

### 3. 備份
- 生產環境執行前務必備份
- 使用事務確保數據一致性
- 準備回滾方案

## 聯繫支持

如果遇到問題或需要幫助，請：
1. 查看錯誤日誌
2. 檢查環境配置
3. 參考一致性檢查報告
4. 聯繫開發團隊

## 更新日誌

### v1.0.0 (2024-12-19)
- 初始版本發布
- 支援SQLite、MySQL、PostgreSQL
- 完整的表結構定義
- 自動化初始化腳本
- 一致性檢查報告
