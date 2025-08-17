# 🔐 旅遊創作者媒體平台 - 權限管理系統

本系統為旅遊創作者媒體平台提供完整的權限管理和審計日誌功能，確保用戶操作的安全性和可追溯性。

## 📋 系統架構

### 核心組件
- **權限管理服務** (`PermissionService`) - 處理權限檢查和驗證
- **審計日誌服務** (`AuditService`) - 記錄所有重要操作
- **用戶管理服務** (`UserManagementService`) - 管理用戶資料和狀態
- **權限管理控制器** (`UserManagementController`) - 提供權限管理API
- **審計日誌控制器** (`AuditController`) - 提供審計日誌查詢API

## 🎯 權限設計

### 用戶角色
1. **供應商 (supplier)** - 旅遊服務提供者
2. **創作者 (creator)** - 內容創作者
3. **媒體 (media)** - 媒體通路
4. **管理員 (admin)** - 系統管理者

### 權限類型
| 權限名稱 | 描述 | 供應商 | 創作者 | 媒體 | 管理員 |
|---------|------|--------|--------|------|--------|
| `user.register` | 用戶註冊 | ✅ | ✅ | ✅ | ✅ |
| `user.login` | 用戶登入 | ✅ | ✅ | ✅ | ✅ |
| `user.edit_own` | 編輯自己的資料 | ✅ | ✅ | ✅ | ✅ |
| `user.edit_others` | 編輯其他用戶資料 | ❌ | ❌ | ❌ | ✅ |
| `user.suspend_own` | 停用自己的帳戶 | ✅ | ✅ | ✅ | ✅ |
| `user.suspend_others` | 停用其他用戶帳戶 | ❌ | ❌ | ❌ | ✅ |
| `user.activate` | 啟用用戶帳戶 | ❌ | ❌ | ❌ | ✅ |
| `user.view_audit_logs` | 查看審計日誌 | ❌ | ❌ | ❌ | ✅ |
| `admin.full_access` | 管理員完整權限 | ❌ | ❌ | ❌ | ✅ |

## 🔧 功能實現

### 1. 註冊權限 (所有用戶都有權限)
```php
// 檢查註冊權限
if ($this->permissionService->hasPermission($userId, 'user.register')) {
    // 允許註冊
}
```

### 2. 登入權限 (用戶自己有權限)
```php
// 檢查登入權限
if ($this->permissionService->hasPermission($userId, 'user.login')) {
    // 允許登入
}
```

### 3. 編輯權限 (用戶自己和系統管理者都有權限)
```php
// 檢查編輯權限
if ($this->permissionService->canEditUser($currentUserId, $targetUserId)) {
    // 允許編輯
}
```

### 4. 停用權限 (用戶自己和系統管理者都有權限)
```php
// 檢查停用權限
if ($this->permissionService->canSuspendUser($currentUserId, $targetUserId)) {
    // 允許停用
}
```

### 5. 啟用權限 (只有系統管理者有權限)
```php
// 檢查啟用權限
if ($this->permissionService->canActivateUser($currentUserId)) {
    // 允許啟用
}
```

## 📊 審計日誌

### 記錄的操作類型
- **用戶操作**: 註冊、登入、編輯、停用、啟用、角色變更
- **任務操作**: 創建、狀態變更、申請
- **媒體操作**: 上傳、審核
- **權限操作**: 權限變更

### 審計日誌欄位
- `user_id` - 執行操作的用戶ID
- `action` - 操作類型
- `table_name` - 操作的表名
- `record_id` - 操作的記錄ID
- `old_values` - 操作前的值
- `new_values` - 操作後的值
- `ip_address` - 客戶端IP地址
- `user_agent` - 客戶端User-Agent
- `created_at` - 操作時間

## 🚀 API端點

### 用戶管理
```
GET    /api/users/me                    # 獲取當前用戶權限摘要
GET    /api/users/{id}                  # 獲取用戶資料
PUT    /api/users/{id}                  # 編輯用戶資料
POST   /api/users/{id}/suspend          # 停用用戶帳戶
POST   /api/users/{id}/activate         # 啟用用戶帳戶
PUT    /api/users/{id}/role             # 變更用戶角色
GET    /api/users/{id}/permissions      # 獲取用戶權限
POST   /api/users/check-permission      # 檢查權限
```

### 管理員功能
```
GET    /api/admin/users                  # 獲取用戶列表
GET    /api/admin/users/stats            # 獲取用戶統計
GET    /api/admin/roles/{role}/permissions # 獲取角色權限
```

### 審計日誌
```
GET    /api/audit/users/{id}            # 獲取用戶審計日誌
GET    /api/audit/records/{table}/{id}  # 獲取記錄審計日誌
GET    /api/audit/actions/{action}      # 獲取操作審計日誌
GET    /api/audit/stats                 # 獲取審計日誌統計
GET    /api/audit/suggestions           # 獲取審計日誌建議
```

### 管理員審計功能
```
GET    /api/admin/audit                  # 獲取所有審計日誌
POST   /api/admin/audit/cleanup         # 清理舊的審計日誌
GET    /api/admin/audit/export          # 導出審計日誌
```

## 💾 數據庫結構

### 主要表結構
- `users` - 用戶基本資料
- `permissions` - 權限定義
- `role_permissions` - 角色權限關聯
- `audit_logs` - 審計日誌
- `supplier_profiles` - 供應商詳細資料
- `creator_profiles` - 創作者詳細資料
- `media_profiles` - 媒體詳細資料

### 索引優化
- 用戶角色索引
- 審計日誌時間索引
- 操作類型索引
- 表名索引

## 🔒 安全特性

### 權限驗證
- 所有敏感操作都經過權限檢查
- 支持細粒度權限控制
- 防止權限提升攻擊

### 審計追蹤
- 記錄所有重要操作
- 支持操作回滾分析
- 提供完整的操作歷史

### 數據保護
- 敏感資料加密存儲
- 支持資料脫敏
- 符合GDPR要求

## 📱 前端整合

### 權限檢查
```typescript
// 檢查用戶權限
const checkPermission = async (permission: string) => {
  const response = await api.post('/users/check-permission', { permission });
  return response.data.has_permission;
};

// 獲取用戶權限摘要
const getUserPermissions = async () => {
  const response = await api.get('/users/me');
  return response.data;
};
```

### 條件渲染
```typescript
// 根據權限顯示/隱藏功能
{userPermissions.can_edit_others && (
  <button onClick={editUser}>編輯用戶</button>
)}

{userPermissions.is_admin && (
  <AdminPanel />
)}
```

## 🧪 測試建議

### 權限測試
- 測試不同角色的權限限制
- 測試權限提升攻擊防護
- 測試跨用戶操作權限

### 審計測試
- 測試操作日誌記錄完整性
- 測試日誌查詢功能
- 測試日誌導出功能

### 安全測試
- 測試未授權訪問防護
- 測試SQL注入防護
- 測試XSS攻擊防護

## 📈 性能優化

### 數據庫優化
- 使用適當的索引
- 定期清理舊日誌
- 分區存儲歷史數據

### 緩存策略
- 權限檢查結果緩存
- 用戶資料緩存
- 審計日誌統計緩存

### 查詢優化
- 分頁查詢支持
- 條件過濾優化
- 聚合查詢優化

## 🔄 部署說明

### 環境要求
- PHP 8.1+
- PostgreSQL 12+
- Composer 2.0+

### 安裝步驟
1. 執行數據庫遷移腳本
2. 更新依賴注入配置
3. 配置新的路由
4. 測試權限功能

### 配置選項
- 審計日誌保留天數
- 權限檢查緩存時間
- 日誌導出格式選項

## 📞 技術支持

如有問題或建議，請聯繫開發團隊或查看相關文檔。

---

**版本**: 3.0.0  
**更新日期**: 2025年8月  
**維護者**: 開發團隊
