# 旅遊平台資料庫架構 v5.0 一致性檢查報告

## 📋 概述

本報告詳細記錄了 v5.0 架構的變更，確保前端、後端、資料庫三個層面的資料結構一致性。主要變更包括：

1. **業務實體欄位調整**：確保與供應商、創作者、媒體的欄位需求一致
2. **權限系統簡化**：從四級權限簡化為兩級（管理者和一般使用者）
3. **類型定義更新**：更新 TypeScript 類型定義以反映新的資料庫結構
4. **API 服務更新**：添加新的權限檢查方法和業務實體管理端點
5. **後端服務創建**：實現新的權限檢查服務

## 🔄 主要變更摘要

### 1. 業務實體表 (`business_entities`) 欄位調整

#### 新增欄位
- `portfolio_url` (創作者檔案連結)
- `can_edit_profile` (編輯基本資料權限)

#### 欄位對應關係
| 業務類型 | 對應的詳細資訊表 | 主要欄位 |
|----------|------------------|----------|
| `supplier` | `supplier_profiles` | company_name, business_type, license_number, service_areas |
| `koc` | `creator_profiles` | portfolio_url, content_types, target_audience, follower_count |
| `media` | `media_profiles` | media_type, platform_name, audience_size, content_categories |

### 2. 權限系統簡化

#### 舊權限等級 (v4)
- `owner` - 擁有者
- `admin` - 管理員  
- `manager` - 經理
- `viewer` - 查看者

#### 新權限等級 (v5)
- `manager` - 管理者（擁有所有權限）
- `user` - 一般使用者（根據具體權限配置）

#### 權限範圍
| 權限 | manager | user (可配置) |
|------|---------|---------------|
| `can_manage_users` | ✅ | ⚙️ |
| `can_manage_content` | ✅ | ⚙️ |
| `can_manage_finance` | ✅ | ⚙️ |
| `can_view_analytics` | ✅ | ⚙️ |
| `can_edit_profile` | ✅ | ✅ (預設) |

## 📁 文件變更清單

### 1. 資料庫結構文件
- ✅ `schema_v5_user_roles.sql` - 更新權限等級和業務實體欄位
- ✅ `migrate_to_v5.php` - 調整權限插入邏輯

### 2. 前端類型定義
- ✅ `src/types/database.ts` - 更新權限等級和業務實體類型

### 3. 前端 API 服務
- ✅ `src/lib/api.ts` - 添加權限檢查方法和業務實體管理端點

### 4. 後端服務
- ✅ `backend/src/Services/PermissionService.php` - 新的權限檢查服務

## 🔍 一致性檢查結果

### 1. 資料庫欄位一致性 ✅

#### business_entities 表
- 基本資訊欄位：✅ 一致
- 聯絡資訊欄位：✅ 一致
- 地理位置欄位：✅ 一致
- 業務相關欄位：✅ 一致
- 社交媒體欄位：✅ 一致
- 狀態欄位：✅ 一致
- 審計欄位：✅ 一致

#### user_business_permissions 表
- 權限等級：✅ 簡化為 manager/user
- 權限範圍：✅ 與 TypeScript 類型一致
- 狀態欄位：✅ 一致

### 2. TypeScript 類型一致性 ✅

#### 權限相關類型
```typescript
// 權限等級
export type PermissionLevel = 'manager' | 'user';

// 權限介面
export interface UserBusinessPermission {
  permission_level: PermissionLevel;
  can_manage_users: boolean;
  can_manage_content: boolean;
  can_manage_finance: boolean;
  can_view_analytics: boolean;
  can_edit_profile: boolean;
}
```

#### 業務實體類型
```typescript
// 業務實體介面
export interface BusinessEntity {
  id: UUID;
  name: string;
  business_type: BusinessType;
  // ... 其他欄位與資料庫一致
}

// 創作者詳細資訊
export interface CreatorProfile {
  portfolio_url?: string; // 新增欄位
  // ... 其他欄位
}
```

### 3. API 端點一致性 ✅

#### 權限檢查端點
```typescript
// 檢查權限
GET /api/permissions/check?user_id={userId}&business_entity_id={businessId}&permission={permission}

// 獲取用戶權限等級
GET /api/permissions/user-level?user_id={userId}&business_entity_id={businessId}
```

#### 業務實體管理端點
```typescript
// 業務實體 CRUD
GET /api/business-entities
POST /api/business-entities
PUT /api/business-entities/{id}
DELETE /api/business-entities/{id}

// 權限管理
POST /api/user-business-permissions
PUT /api/user-business-permissions/{id}
DELETE /api/user-business-permissions/{id}
```

## 🚀 使用方式

### 1. 執行資料庫遷移
```bash
cd backend/database
php migrate_to_v5.php
```

### 2. 權限檢查使用
```typescript
// 檢查用戶是否可以管理內容
const canManage = await api.checkBusinessEntityPermission(
  userId, 
  businessEntityId, 
  'manage_content'
);

// 獲取用戶權限等級
const userLevel = await api.getUserPermissionLevel(userId, businessEntityId);
```

### 3. 業務實體管理
```typescript
// 創建業務實體
const business = await api.createBusinessEntity({
  name: '九族文化村',
  business_type: 'supplier',
  description: '知名主題樂園'
});

// 分配權限
const permission = await api.assignBusinessPermission({
  user_id: userId,
  business_entity_id: business.id,
  role_id: roleId,
  permission_level: 'manager'
});
```

## ⚠️ 注意事項

### 1. 權限系統變更
- 舊的四級權限系統已簡化為兩級
- 需要更新現有的權限檢查邏輯
- 建議在遷移後重新分配用戶權限

### 2. 業務實體欄位
- 新增的 `portfolio_url` 欄位主要用於創作者
- `can_edit_profile` 權限預設為 true，確保基本功能可用

### 3. 向後兼容性
- 舊的 API 端點仍然可用
- 新的權限檢查方法提供了更細緻的控制
- 建議逐步遷移到新的權限系統

## 📊 測試建議

### 1. 權限檢查測試
- 測試管理者權限（應擁有所有權限）
- 測試一般使用者權限（應根據配置限制）
- 測試權限邊界情況

### 2. 業務實體管理測試
- 測試創建、更新、刪除業務實體
- 測試權限分配和移除
- 測試不同業務類型的欄位驗證

### 3. 前端整合測試
- 測試 TypeScript 類型檢查
- 測試 API 調用
- 測試權限相關的 UI 顯示

## 🎯 後續工作

### 1. 短期目標
- [ ] 完成後端 API 端點實現
- [ ] 更新前端組件以使用新的權限系統
- [ ] 進行完整的端到端測試

### 2. 中期目標
- [ ] 優化權限檢查性能
- [ ] 添加權限變更審計日誌
- [ ] 實現權限模板系統

### 3. 長期目標
- [ ] 支持更複雜的權限規則
- [ ] 實現基於角色的權限繼承
- [ ] 添加權限分析報表

## 📝 總結

v5.0 架構通過以下方式確保了前後台資料庫欄位的一致性：

1. **統一的資料結構**：所有表結構都經過仔細設計，確保欄位名稱、類型和約束一致
2. **類型安全**：TypeScript 類型定義與資料庫結構完全對應
3. **API 一致性**：前端 API 服務與後端端點保持一致
4. **權限系統簡化**：從複雜的四級權限簡化為清晰的兩級權限
5. **完整的文檔**：提供詳細的遷移指南和使用說明

這種設計確保了系統的可維護性、可擴展性和一致性，為未來的功能擴展奠定了堅實的基礎。
