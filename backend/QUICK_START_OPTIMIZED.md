# 🚀 旅遊平台後端優化版快速開始指南 v2.0

## 📋 系統需求

- ✅ **PHP 8.1+** - 後端程式語言
- ✅ **Composer** - PHP套件管理器  
- ✅ **PostgreSQL 14+** - 資料庫
- ✅ **PostGIS擴展** - 地理資訊處理

## ⚡ 快速安裝步驟

### 1. 自動安裝（推薦）
```bash
# Windows
.\install_optimized.bat

# Linux/Mac
./install_optimized.sh
```

### 2. 手動安裝
```bash
# 安裝PHP依賴
composer install --no-dev --optimize-autoloader

# 配置環境變數
cp env_v2.example .env
# 編輯 .env 文件，配置資料庫連接

# 創建必要目錄
mkdir -p logs uploads cache
```

## 🔧 環境配置

### 基本配置
```env
# 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_platform
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=3600

# 應用配置
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
```

### 安全配置
```env
# 密碼策略
PASSWORD_MIN_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900

# 上傳限制
UPLOAD_MAX_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp,mp4,mov,avi
```

## 🗄️ 資料庫設置

### 1. 創建資料庫
```sql
CREATE DATABASE travel_platform;
\c travel_platform
```

### 2. 啟用擴展
```sql
CREATE EXTENSION postgis;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pg_trgm";
```

### 3. 執行優化後的結構
```sql
\i database/schema_v2.sql
```

## 🚀 啟動服務

### 開發環境
```bash
# 使用PHP內建伺服器
php -S localhost:8000 -t public

# 或使用Composer腳本
composer start
```

### 生產環境
```bash
# 使用Apache/Nginx
# 配置虛擬主機指向 public/ 目錄
```

## 🧪 測試API

### 健康檢查
```bash
curl http://localhost:8000/api/health
```

### 測試端點
```bash
curl http://localhost:8000/api/test
```

### 用戶註冊
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "creator"
  }'
```

## 🔌 主要API端點

### 認證系統
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/refresh` - Token刷新
- `POST /api/auth/forgot-password` - 忘記密碼
- `POST /api/auth/reset-password` - 重置密碼

### 任務管理
- `POST /api/tasks` - 創建任務
- `GET /api/tasks` - 獲取任務列表
- `GET /api/tasks/{id}` - 獲取任務詳情
- `PUT /api/tasks/{id}` - 更新任務
- `DELETE /api/tasks/{id}` - 刪除任務

### 智能媒合
- `GET /api/tasks/{id}/matching-creators` - 匹配創作者
- `GET /api/tasks/recommendations` - 任務推薦
- `GET /api/matching/suggestions` - 媒合建議

### 管理員功能
- `GET /api/admin/dashboard` - 管理員儀表板
- `GET /api/admin/users` - 用戶管理
- `GET /api/admin/reports/*` - 各種報表

## 🛡️ 安全特性

### 認證安全
- ✅ 密碼強度驗證（大小寫、數字、特殊字符）
- ✅ 登入嘗試限制和帳戶鎖定
- ✅ JWT增強（JWT ID、過期時間管理）
- ✅ 安全的密碼重置流程

### 資料安全
- ✅ 輸入驗證（Respect\Validation）
- ✅ SQL注入防護（參數化查詢）
- ✅ XSS防護（輸出轉義）
- ✅ CSRF防護（Token驗證）

### 系統安全
- ✅ 速率限制（防止API濫用）
- ✅ 審計日誌（完整操作記錄）
- ✅ 錯誤處理（不暴露敏感資訊）
- ✅ 維護模式（優雅降級）

## 📊 性能優化

### 資料庫優化
- ✅ 連接池和重試機制
- ✅ 智能索引（全文搜尋、地理位置）
- ✅ 查詢優化和批量操作
- ✅ 快取策略

### 應用優化
- ✅ 依賴注入（PHP-DI）
- ✅ 中間件優化
- ✅ 響應快取
- ✅ 非同步處理支援

## 🔍 監控和診斷

### 健康檢查
- ✅ 系統狀態監控
- ✅ 資料庫連接檢查
- ✅ 服務可用性驗證

### 性能監控
- ✅ 響應時間追蹤
- ✅ 吞吐量監控
- ✅ 資源使用率監控
- ✅ 慢查詢檢測

## 🚨 故障排除

### 常見問題

#### 1. 資料庫連接失敗
```bash
# 檢查PostgreSQL服務狀態
# 檢查 .env 中的資料庫配置
# 確認PostGIS擴展已啟用
```

#### 2. JWT認證失敗
```bash
# 檢查 JWT_SECRET 是否設置
# 確認 JWT_EXPIRATION 時間
# 檢查時區設置
```

#### 3. 文件上傳失敗
```bash
# 檢查 uploads/ 目錄權限
# 確認 UPLOAD_MAX_SIZE 設置
# 檢查 ALLOWED_EXTENSIONS 配置
```

### 日誌查看
```bash
# 查看應用日誌
tail -f logs/app.log

# 查看錯誤日誌
tail -f logs/error.log

# 查看訪問日誌
tail -f logs/access.log
```

## 📚 更多資源

- 📖 **優化總結**: [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)
- 🪟 **Windows安裝**: [WINDOWS_INSTALL.md](WINDOWS_INSTALL.md)
- 🐧 **Linux安裝**: [LINUX_INSTALL.md](LINUX_INSTALL.md)
- 📖 **完整文檔**: [README.md](README.md)

## 🆘 需要幫助？

如果遇到問題，請檢查：
1. 系統需求是否滿足
2. 環境變數配置是否正確
3. 資料庫服務是否正常運行
4. 目錄權限是否正確
5. 日誌文件中的錯誤訊息

## 🎯 下一步

安裝完成後，您可以：
1. 開始開發前端應用
2. 測試各種API端點
3. 配置生產環境
4. 實現更多業務功能
5. 部署到雲端服務

祝您使用愉快！🚀
