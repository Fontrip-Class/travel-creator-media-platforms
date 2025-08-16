# 🪟 Windows系統安裝指南

## 📋 系統需求

- Windows 10/11 (64位元)
- 至少4GB RAM
- 至少2GB可用磁碟空間

## 🚀 安裝步驟

### 步驟1：安裝PHP 8.1+

#### 選項A：使用XAMPP（推薦新手）
1. 下載 [XAMPP for Windows](https://www.apachefriends.org/download.html)
2. 選擇PHP 8.1+版本
3. 運行安裝程式
4. 選擇安裝組件：**Apache** 和 **PHP**
5. 完成安裝
6. 將PHP添加到系統PATH：
   - 複製 `C:\xampp\php` 路徑
   - 右鍵「此電腦」→「內容」→「進階系統設定」→「環境變數」
   - 在「系統變數」中找到「Path」，點擊「編輯」
   - 點擊「新增」，貼上PHP路徑
   - 確定所有對話框

#### 選項B：直接安裝PHP
1. 下載 [PHP for Windows](https://windows.php.net/download/)
2. 選擇「Thread Safe」版本，ZIP格式
3. 解壓到 `C:\php`
4. 複製 `php.ini-development` 為 `php.ini`
5. 編輯 `php.ini`，取消註解以下行：
   ```ini
   extension=pdo_pgsql
   extension=gd
   extension=mbstring
   ```
6. 添加到系統PATH（同上）

### 步驟2：安裝Composer

1. 下載 [Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe)
2. 運行安裝程式
3. 選擇PHP執行檔路徑（通常是 `C:\xampp\php\php.exe` 或 `C:\php\php.exe`）
4. 完成安裝
5. 重新開啟命令提示字元或PowerShell

### 步驟3：安裝PostgreSQL + PostGIS

1. 下載 [PostgreSQL for Windows](https://www.postgresql.org/download/windows/)
2. 運行安裝程式
3. 選擇安裝組件：
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ PostGIS
   - ✅ Stack Builder
4. 設定資料庫超級用戶密碼（記住這個密碼！）
5. 完成安裝

### 步驟4：驗證安裝

開啟新的命令提示字元或PowerShell，運行：

```bash
# 檢查PHP
php --version

# 檢查Composer
composer --version

# 檢查PostgreSQL
psql --version
```

### 步驟5：設置資料庫

1. 開啟pgAdmin 4
2. 連接到PostgreSQL伺服器
3. 右鍵「Databases」→「Create」→「Database」
4. 輸入資料庫名稱：`travel_platform`
5. 點擊「Save」

### 步驟6：啟用PostGIS擴展

1. 在pgAdmin中右鍵 `travel_platform` 資料庫
2. 選擇「Query Tool」
3. 執行以下SQL：

```sql
CREATE EXTENSION postgis;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pg_trgm";
```

### 步驟7：執行資料庫結構腳本

1. 在Query Tool中執行：
```sql
\i 'C:\path\to\your\project\backend\database\schema.sql'
```

## 🔧 配置環境變數

編輯 `backend\.env` 文件：

```env
# 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_platform
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

# JWT配置
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=3600

# 應用配置
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
```

## 🚀 啟動後端服務

安裝完成後，在 `backend` 目錄中運行：

```bash
# 安裝PHP依賴
composer install

# 啟動服務
php -S localhost:8000 -t public
```

## 🧪 測試API

開啟瀏覽器訪問：
- **健康檢查**: http://localhost:8000/api/health
- **測試端點**: http://localhost:8000/api/test

## 🔍 常見問題

### Q: PHP命令找不到？
**A**: 檢查系統PATH是否包含PHP目錄

### Q: Composer安裝失敗？
**A**: 確保選擇了正確的PHP執行檔路徑

### Q: PostgreSQL連接失敗？
**A**: 檢查服務是否啟動，密碼是否正確

### Q: PostGIS擴展無法啟用？
**A**: 確保安裝時選擇了PostGIS組件

## 📞 需要幫助？

如果遇到問題：
1. 檢查錯誤訊息
2. 確認所有組件版本相容
3. 重新啟動命令提示字元
4. 檢查防火牆設定
