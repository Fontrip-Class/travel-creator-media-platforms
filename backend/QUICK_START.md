# 🚀 快速開始指南

## 📋 系統需求檢查

在開始之前，請確保您的系統已安裝：

- ✅ **PHP 8.1+** - 後端程式語言
- ✅ **Composer** - PHP套件管理器
- ✅ **PostgreSQL 14+** - 資料庫
- ✅ **PostGIS擴展** - 地理資訊處理

## ⚡ 快速安裝步驟

### 1. 安裝PHP依賴
```bash
cd backend
composer install
```

### 2. 配置環境變數
```bash
# 複製環境變數文件
cp env.example .env

# 編輯 .env 文件，配置資料庫連接
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_platform
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
```

### 3. 設置資料庫
```sql
-- 連接到PostgreSQL
psql -U postgres

-- 創建資料庫
CREATE DATABASE travel_platform;

-- 啟用PostGIS擴展
\c travel_platform
CREATE EXTENSION postgis;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pg_trgm";

-- 執行資料庫結構腳本
\i database/schema.sql
```

### 4. 啟動服務
```bash
# 使用PHP內建伺服器
php -S localhost:8000 -t public

# 或使用Composer腳本
composer start
```

### 5. 測試API
訪問以下端點測試API是否正常運行：

- **健康檢查**: http://localhost:8000/api/health
- **測試端點**: http://localhost:8000/api/test

## 🔍 常見問題

### Q: Composer安裝失敗？
**A**: 確保PHP版本 >= 8.1，並已安裝Composer

### Q: 資料庫連接失敗？
**A**: 檢查PostgreSQL服務狀態和連接參數

### Q: PostGIS擴展無法啟用？
**A**: 確保PostgreSQL安裝時包含了PostGIS

### Q: 權限錯誤？
**A**: 確保logs和uploads目錄有寫入權限

## 📚 下一步

- 查看 [README.md](README.md) 了解完整功能
- 運行 [install.bat](install.bat) (Windows) 或 [install.sh](install.sh) (Linux/Mac) 自動安裝
- 開始開發您的旅遊媒合平台！

## 🆘 需要幫助？

如果遇到問題，請檢查：
1. 系統需求是否滿足
2. 環境變數配置是否正確
3. 資料庫服務是否正常運行
4. 目錄權限是否正確
