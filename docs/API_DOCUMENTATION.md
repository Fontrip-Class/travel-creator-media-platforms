# 旅遊創作者平台 API 文檔

## 概述

本文檔描述了旅遊創作者平台的所有API端點，包括認證、用戶管理、業務實體管理、任務管理等功能的詳細說明。

## 基礎資訊

- **基礎URL**: `http://localhost:8000/api`
- **認證方式**: Bearer Token (JWT)
- **內容類型**: `application/json`
- **編碼**: UTF-8

## 通用響應格式

### 成功響應
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功"
}
```

### 錯誤響應
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤描述",
    "details": {...}
  }
}
```

## 錯誤代碼

| 錯誤代碼 | HTTP狀態碼 | 描述 |
|---------|-----------|------|
| `VALIDATION_ERROR` | 400 | 請求參數驗證失敗 |
| `UNAUTHORIZED` | 401 | 未授權訪問 |
| `FORBIDDEN` | 403 | 權限不足 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `CONFLICT` | 409 | 資源衝突 |
| `INTERNAL_ERROR` | 500 | 內部服務器錯誤 |
| `TIMEOUT` | 408 | 請求超時 |

## 認證相關 API

### 用戶註冊
- **端點**: `POST /auth/register`
- **描述**: 創建新用戶帳戶
- **請求體**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string (可選)"
}
```
- **響應**: 用戶資料（不含密碼）

### 用戶登入
- **端點**: `POST /auth/login`
- **描述**: 用戶登入獲取認證令牌
- **請求體**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **響應**:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {...}
  }
}
```

### 刷新令牌
- **端點**: `POST /auth/refresh`
- **描述**: 刷新過期的認證令牌
- **請求體**: 空
- **響應**: 新的JWT令牌

### 用戶登出
- **端點**: `POST /auth/logout`
- **描述**: 用戶登出，使令牌失效
- **請求體**: 空

## 用戶管理 API

### 獲取用戶資料
- **端點**: `GET /users/profile`
- **描述**: 獲取當前登入用戶的資料
- **認證**: 需要
- **響應**: 用戶資料

### 更新用戶資料
- **端點**: `PUT /users/profile`
- **描述**: 更新當前用戶的資料
- **認證**: 需要
- **請求體**:
```json
{
  "username": "string (可選)",
  "email": "string (可選)",
  "phone": "string (可選)"
}
```

### 獲取用戶列表 (管理員)
- **端點**: `GET /admin/users`
- **描述**: 獲取所有用戶列表（管理員專用）
- **認證**: 需要管理員權限
- **查詢參數**:
  - `role`: 角色過濾
  - `status`: 狀態過濾
  - `search`: 搜尋關鍵字
  - `page`: 頁碼
  - `limit`: 每頁數量

### 創建用戶 (管理員)
- **端點**: `POST /admin/users`
- **描述**: 創建新用戶（管理員專用）
- **認證**: 需要管理員權限
- **請求體**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string (可選)",
  "role": "user|supplier|creator|media|admin"
}
```

### 更新用戶 (管理員)
- **端點**: `PUT /admin/users/{id}`
- **描述**: 更新指定用戶資料（管理員專用）
- **認證**: 需要管理員權限
- **請求體**: 同創建用戶

### 刪除用戶 (管理員)
- **端點**: `DELETE /admin/users/{id}`
- **描述**: 刪除指定用戶（管理員專用）
- **認證**: 需要管理員權限

### 暫停用戶 (管理員)
- **端點**: `POST /admin/users/{id}/suspend`
- **描述**: 暫停指定用戶帳戶（管理員專用）
- **認證**: 需要管理員權限
- **請求體**:
```json
{
  "reason": "string",
  "suspension_until": "string (ISO 8601 日期，可選)"
}
```

### 啟用用戶 (管理員)
- **端點**: `POST /admin/users/{id}/activate`
- **描述**: 重新啟用暫停的用戶帳戶（管理員專用）
- **認證**: 需要管理員權限

## 業務實體管理 API

### 創建業務實體
- **端點**: `POST /business-entities`
- **描述**: 創建新的業務實體
- **認證**: 需要
- **請求體**:
```json
{
  "name": "string",
  "business_type": "supplier|creator|media",
  "description": "string",
  "contact_person": "string",
  "contact_phone": "string",
  "contact_email": "string",
  "website": "string (可選)",
  "address": "string (可選)",
  "business_hours": "string (可選)",
  "tags": ["string"]
}
```

### 獲取業務實體列表
- **端點**: `GET /business-entities`
- **描述**: 獲取業務實體列表
- **認證**: 可選
- **查詢參數**:
  - `type`: 業務類型過濾
  - `status`: 驗證狀態過濾
  - `search`: 搜尋關鍵字
  - `page`: 頁碼
  - `limit`: 每頁數量

### 獲取業務實體詳情
- **端點**: `GET /business-entities/{id}`
- **描述**: 獲取指定業務實體的詳細資料
- **認證**: 可選

### 更新業務實體
- **端點**: `PUT /business-entities/{id}`
- **描述**: 更新指定業務實體資料
- **認證**: 需要（擁有者或管理員）

### 刪除業務實體
- **端點**: `DELETE /business-entities/{id}`
- **描述**: 刪除指定業務實體
- **認證**: 需要（擁有者或管理員）

### 獲取業務實體列表 (管理員)
- **端點**: `GET /admin/business-entities`
- **描述**: 獲取所有業務實體列表（管理員專用）
- **認證**: 需要管理員權限

### 更新業務實體 (管理員)
- **端點**: `PUT /admin/business-entities/{id}`
- **描述**: 更新指定業務實體資料（管理員專用）
- **認證**: 需要管理員權限

### 刪除業務實體 (管理員)
- **端點**: `DELETE /admin/business-entities/{id}`
- **描述**: 刪除指定業務實體（管理員專用）
- **認證**: 需要管理員權限

### 驗證業務實體 (管理員)
- **端點**: `POST /admin/business-entities/{id}/verify`
- **描述**: 設定業務實體的驗證狀態（管理員專用）
- **認證**: 需要管理員權限
- **請求體**:
```json
{
  "status": "verified|rejected",
  "reason": "string (可選)"
}
```

## 任務管理 API

### 創建任務
- **端點**: `POST /tasks`
- **描述**: 創建新的任務
- **認證**: 需要
- **請求體**:
```json
{
  "title": "string",
  "description": "string",
  "budget": "number",
  "deadline": "string (ISO 8601 日期)",
  "requirements": ["string"],
  "tags": ["string"]
}
```

### 獲取任務列表
- **端點**: `GET /tasks`
- **描述**: 獲取任務列表
- **認證**: 可選
- **查詢參數**:
  - `status`: 任務狀態過濾
  - `budget_min`: 最低預算
  - `budget_max`: 最高預算
  - `search`: 搜尋關鍵字
  - `page`: 頁碼
  - `limit`: 每頁數量

### 獲取任務詳情
- **端點**: `GET /tasks/{id}`
- **描述**: 獲取指定任務的詳細資料
- **認證**: 可選

### 更新任務
- **端點**: `PUT /tasks/{id}`
- **描述**: 更新指定任務資料
- **認證**: 需要（創建者或管理員）

### 刪除任務
- **端點**: `DELETE /tasks/{id}`
- **描述**: 刪除指定任務
- **認證**: 需要（創建者或管理員）

### 申請任務
- **端點**: `POST /tasks/{id}/apply`
- **描述**: 申請參與指定任務
- **認證**: 需要
- **請求體**:
```json
{
  "proposal": "string",
  "estimated_duration": "string",
  "portfolio_links": ["string"]
}
```

### 獲取任務列表 (管理員)
- **端點**: `GET /admin/tasks`
- **描述**: 獲取所有任務列表（管理員專用）
- **認證**: 需要管理員權限

### 更新任務 (管理員)
- **端點**: `PUT /admin/tasks/{id}`
- **描述**: 更新指定任務資料（管理員專用）
- **認證**: 需要管理員權限

### 刪除任務 (管理員)
- **端點**: `DELETE /admin/tasks/{id}`
- **描述**: 刪除指定任務（管理員專用）
- **認證**: 需要管理員權限

### 審核任務 (管理員)
- **端點**: `POST /admin/tasks/{id}/approve`
- **描述**: 審核通過任務（管理員專用）
- **認證**: 需要管理員權限
- **請求體**:
```json
{
  "reason": "string (可選)"
}
```

### 拒絕任務 (管理員)
- **端點**: `POST /admin/tasks/{id}/reject`
- **描述**: 拒絕任務（管理員專用）
- **認證**: 需要管理員權限
- **請求體**:
```json
{
  "reason": "string"
}
```

## 管理後台 API

### 獲取儀表板統計
- **端點**: `GET /admin/dashboard`
- **描述**: 獲取管理後台儀表板統計數據
- **認證**: 需要管理員權限
- **響應**:
```json
{
  "success": true,
  "data": {
    "total_users": "number",
    "total_business_entities": "number",
    "total_tasks": "number",
    "total_revenue": "number",
    "system_health": "string"
  }
}
```

### 獲取系統統計
- **端點**: `GET /admin/system/stats`
- **描述**: 獲取系統詳細統計數據
- **認證**: 需要管理員權限
- **響應**:
```json
{
  "success": true,
  "data": {
    "total_users": "number",
    "total_business_entities": "number",
    "total_tasks": "number",
    "total_revenue": "number",
    "system_health": "string",
    "recent_activities": [...]
  }
}
```

## 通知 API

### 獲取通知列表
- **端點**: `GET /notifications`
- **描述**: 獲取當前用戶的通知列表
- **認證**: 需要
- **查詢參數**:
  - `read`: 已讀/未讀過濾
  - `type`: 通知類型過濾
  - `page`: 頁碼
  - `limit`: 每頁數量

### 標記通知為已讀
- **端點**: `POST /notifications/{id}/read`
- **描述**: 標記指定通知為已讀
- **認證**: 需要

### 刪除通知
- **端點**: `DELETE /notifications/{id}`
- **描述**: 刪除指定通知
- **認證**: 需要

## 權限管理 API

### 獲取用戶權限
- **端點**: `GET /users/{id}/permissions`
- **描述**: 獲取指定用戶的權限列表
- **認證**: 需要（本人或管理員）

### 獲取用戶角色摘要
- **端點**: `GET /users/{id}/roles-summary`
- **描述**: 獲取指定用戶的角色摘要
- **認證**: 需要（本人或管理員）

### 獲取業務管理摘要
- **端點**: `GET /users/{id}/business-management-summary`
- **描述**: 獲取指定用戶的業務管理摘要
- **認證**: 需要（本人或管理員）

## 錯誤處理

### 請求超時
當請求超過30秒時，會返回408狀態碼和以下響應：
```json
{
  "success": false,
  "error": {
    "code": "TIMEOUT",
    "message": "請求超時，請稍後重試"
  }
}
```

### 驗證錯誤
當請求參數驗證失敗時，會返回400狀態碼和詳細的錯誤信息：
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "請求參數驗證失敗",
    "details": {
      "field": "錯誤描述"
    }
  }
}
```

### 權限錯誤
當用戶權限不足時，會返回403狀態碼：
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "權限不足，無法執行此操作"
  }
}
```

## 速率限制

為了保護API服務，我們實施了以下速率限制：

- **認證端點**: 每分鐘最多5次請求
- **一般端點**: 每分鐘最多60次請求
- **管理端點**: 每分鐘最多30次請求

當超過限制時，會返回429狀態碼：
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "請求頻率過高，請稍後重試",
    "retry_after": "number (秒)"
  }
}
```

## 測試建議

### 測試環境
- **開發環境**: `http://localhost:8000/api`
- **測試環境**: `https://test-api.example.com/api`
- **生產環境**: `https://api.example.com/api`

### 測試工具
- Postman
- Insomnia
- curl
- 前端開發工具

### 測試數據
請參考 `docs/TEST_DATA.md` 文件中的測試數據和測試流程說明。

## 更新日誌

### v1.0.0 (2024-01-20)
- 初始版本發布
- 包含用戶認證、管理、業務實體管理等核心功能
- 完整的錯誤處理和響應格式
- 管理後台API支援
