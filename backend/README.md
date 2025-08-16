# 旅遊創作者媒體平台 - 後端API

## 專案概述

這是旅遊創作者媒體平台的後端API服務，使用PHP + PostgreSQL技術棧構建，提供完整的用戶認證、任務管理、媒合系統和媒體素材管理功能。

## 技術棧

- **後端框架**: Slim Framework 4
- **資料庫**: PostgreSQL 14+
- **認證**: JWT (JSON Web Tokens)
- **驗證**: Respect\Validation
- **日誌**: Monolog
- **依賴注入**: PHP-DI

## 系統需求

- PHP 8.1+
- PostgreSQL 14+
- Composer
- 啟用PostGIS擴展

## 安裝步驟

### 1. 安裝依賴

```bash
cd backend
composer install
```

### 2. 環境配置

```bash
# 複製環境變數文件
cp env.example .env

# 編輯 .env 文件，配置資料庫連接
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_platform
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 3. 資料庫設置

```bash
# 連接到PostgreSQL
psql -U postgres

# 創建資料庫
CREATE DATABASE travel_platform;

# 啟用PostGIS擴展
\c travel_platform
CREATE EXTENSION postgis;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pg_trgm";

# 執行資料庫結構腳本
\i database/schema.sql
```

### 4. 創建必要目錄

```bash
mkdir logs
mkdir uploads
chmod 755 logs uploads
```

### 5. 啟動服務

```bash
# 開發模式
composer start

# 或使用PHP內建伺服器
php -S localhost:8000 -t public
```

## API端點

### 認證端點
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/refresh` - 刷新Token

### 用戶管理
- `GET /api/users/profile` - 獲取用戶資料
- `PUT /api/users/profile` - 更新用戶資料
- `GET /api/users/{id}` - 獲取指定用戶資料

### 任務管理
- `GET /api/tasks` - 獲取任務列表
- `POST /api/tasks` - 創建新任務
- `GET /api/tasks/{id}` - 獲取任務詳情
- `PUT /api/tasks/{id}` - 更新任務
- `DELETE /api/tasks/{id}` - 刪除任務
- `POST /api/tasks/{id}/apply` - 申請任務

### 媒體素材
- `GET /api/media` - 獲取素材列表
- `POST /api/media` - 上傳素材
- `GET /api/media/{id}` - 獲取素材詳情
- `PUT /api/media/{id}` - 更新素材
- `DELETE /api/media/{id}` - 刪除素材
- `POST /api/media/{id}/download` - 下載素材

### 媒合系統
- `POST /api/match` - 查找媒合
- `GET /api/match/suggestions` - 獲取媒合建議

## 資料庫結構

### 主要表格
- `users` - 用戶基本資訊
- `supplier_profiles` - 供應商詳細資料
- `creator_profiles` - 創作者詳細資料
- `media_profiles` - 媒體詳細資料
- `tasks` - 任務資訊
- `task_applications` - 任務申請
- `media_assets` - 媒體素材
- `matching_records` - 媒合記錄
- `notifications` - 通知

### 特色功能
- 使用PostGIS處理地理位置查詢
- JSONB欄位儲存靈活資料
- 陣列類型處理標籤和技能
- 全文搜尋支援中文
- UUID主鍵確保安全性

## 開發指南

### 添加新的API端點

1. 在 `src/Controllers/` 創建控制器
2. 在 `config/routes.php` 添加路由
3. 在 `config/dependencies.php` 配置依賴

### 資料庫操作

使用 `DatabaseService` 進行資料庫操作：

```php
// 查詢
$users = $this->db->fetchAll('SELECT * FROM users WHERE role = :role', ['role' => 'creator']);

// 插入
$userId = $this->db->insert('users', ['username' => 'test', 'email' => 'test@example.com']);

// 更新
$this->db->update('users', ['is_active' => false], 'id = :id', ['id' => $userId]);
```

### 驗證

使用 Respect\Validation 進行資料驗證：

```php
use Respect\Validation\Validator as v;

$validator = v::key('email', v::email())
             ->key('password', v::stringType()->length(8, 255));

$validator->assert($data);
```

## 測試

```bash
# 運行單元測試
composer test

# 程式碼風格檢查
composer cs

# 靜態分析
composer stan
```

## 部署

### 生產環境配置

1. 設置適當的環境變數
2. 配置Web伺服器 (Apache/Nginx)
3. 設置SSL憑證
4. 配置資料庫連接池
5. 設置檔案上傳限制

### 性能優化

- 啟用OPcache
- 配置Redis快取
- 資料庫查詢優化
- 檔案CDN配置

## 故障排除

### 常見問題

1. **資料庫連接失敗**
   - 檢查PostgreSQL服務狀態
   - 驗證連接參數
   - 確認PostGIS擴展已啟用

2. **權限錯誤**
   - 檢查目錄權限
   - 確認Web伺服器用戶權限

3. **JWT錯誤**
   - 檢查JWT_SECRET設置
   - 確認Token格式正確

## 貢獻指南

1. Fork專案
2. 創建功能分支
3. 提交更改
4. 創建Pull Request

## 授權

本專案採用MIT授權條款。
