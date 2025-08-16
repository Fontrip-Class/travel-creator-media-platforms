# 🚀 旅遊平台環境手動安裝指南

## 📋 系統需求

- Windows 10/11 (64位)
- 至少 4GB RAM
- 至少 2GB 可用磁盤空間
- 管理員權限

## 📥 第一步：安裝 PHP 8.1+

### 1.1 下載 PHP
1. 訪問 [PHP官方下載頁面](https://windows.php.net/download/)
2. 下載 **PHP 8.1+ Thread Safe (TS) x64** 版本
3. 選擇 **VS16 x64 Thread Safe** 版本
4. 下載 `php-8.1.33-Win32-VS16-x64.zip`

### 1.2 安裝 PHP
1. 創建目錄 `C:\php`
2. 解壓下載的zip文件到 `C:\php`
3. 複製 `php.ini-development` 為 `php.ini`
4. 編輯 `php.ini`，啟用以下擴展：
   ```ini
   extension=pdo_pgsql
   extension=gd
   extension=mbstring
   extension=openssl
   extension=curl
   extension=fileinfo
   extension=zip
   extension=exif
   extension=intl
   ```

### 1.3 配置環境變數
1. 按 `Win + R`，輸入 `sysdm.cpl`
2. 點擊「環境變數」
3. 在「系統變數」中找到 `Path`
4. 點擊「編輯」，添加 `C:\php`
5. 點擊「確定」保存

## 📥 第二步：安裝 Composer

### 2.1 下載安裝程序
1. 訪問 [Composer官網](https://getcomposer.org/Composer-Setup.exe)
2. 下載 `Composer-Setup.exe`

### 2.2 安裝 Composer
1. 以管理員身份運行 `Composer-Setup.exe`
2. 選擇 PHP 路徑為 `C:\php\php.exe`
3. 按照安裝嚮導完成安裝
4. 安裝完成後重新啟動 PowerShell

## 📥 第三步：安裝 PostgreSQL 14+

### 3.1 下載安裝程序
1. 訪問 [PostgreSQL官網](https://www.postgresql.org/download/windows/)
2. 下載 PostgreSQL 14+ 安裝程序

### 3.2 安裝 PostgreSQL
1. 以管理員身份運行安裝程序
2. 選擇安裝目錄（建議使用默認）
3. 設置 `postgres` 用戶密碼（請記住！）
4. 選擇端口（建議使用默認 5432）
5. 選擇區域設置（建議使用默認）
6. 完成安裝

### 3.3 安裝 PostGIS 擴展
1. 下載 [PostGIS安裝程序](https://postgis.net/windows_downloads/)
2. 運行安裝程序，選擇對應的PostgreSQL版本
3. 完成安裝

## 🔧 第四步：配置數據庫

### 4.1 創建數據庫
1. 打開 pgAdmin 4
2. 連接到本地服務器
3. 右鍵點擊「Databases」，選擇「Create」→「Database」
4. 輸入數據庫名稱：`travel_platform`
5. 點擊「Save」

### 4.2 啟用擴展
1. 在 `travel_platform` 數據庫上右鍵
2. 選擇「Query Tool」
3. 執行以下SQL命令：
   ```sql
   CREATE EXTENSION postgis;
   CREATE EXTENSION "uuid-ossp";
   CREATE EXTENSION "pg_trgm";
   ```

## 🚀 第五步：安裝後端依賴

### 5.1 進入後端目錄
```bash
cd backend
```

### 5.2 安裝PHP依賴
```bash
composer install
```

### 5.3 配置環境變數
1. 複製 `env_v2.example` 為 `.env`
2. 編輯 `.env` 文件，配置數據庫連接：
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=travel_platform
   DB_USERNAME=postgres
   DB_PASSWORD=your_postgres_password
   ```

### 5.4 執行數據庫腳本
1. 在pgAdmin中打開Query Tool
2. 執行 `database/schema_v2.sql`

## 🧪 第六步：測試安裝

### 6.1 檢查PHP安裝
```bash
php --version
```

### 6.2 檢查Composer安裝
```bash
composer --version
```

### 6.3 檢查PostgreSQL安裝
```bash
psql --version
```

### 6.4 啟動後端服務
```bash
cd backend
composer start
```

### 6.5 測試API
在瀏覽器中訪問：`http://localhost:8000/api/health`

## 🚨 常見問題解決

### 問題1: PHP不在PATH中
- 檢查環境變數設置
- 重新啟動PowerShell
- 確認PHP目錄路徑正確

### 問題2: Composer找不到PHP
- 檢查PHP安裝路徑
- 重新安裝Composer
- 手動指定PHP路徑

### 問題3: PostgreSQL連接失敗
- 檢查服務是否啟動
- 確認端口號
- 檢查防火牆設置

### 問題4: PostGIS擴展安裝失敗
- 確認PostgreSQL版本匹配
- 重新安裝PostGIS
- 檢查權限設置

## 📚 參考資源

- [PHP官方文檔](https://www.php.net/manual/)
- [Composer官方文檔](https://getcomposer.org/doc/)
- [PostgreSQL官方文檔](https://www.postgresql.org/docs/)
- [PostGIS官方文檔](https://postgis.net/documentation/)

## 🆘 需要幫助？

如果遇到問題，請：
1. 檢查錯誤日誌
2. 參考官方文檔
3. 在GitHub Issues中提問
4. 聯繫開發團隊

---

**安裝完成後，您就可以啟動後端服務並測試新實現的功能了！** 🎉


