# 旅遊平台資料庫架構 v5.0 - 用戶角色分離版

## 概述

v5.0 版本重新設計了用戶-角色-業務實體的關係模型，解決了舊架構中一個用戶只能擁有一個角色的限制，現在支持：

- **一個用戶帳號可以擁有多個角色**（如：供應商 + 創作者 + 管理員）
- **一個用戶可以管理多個業務實體**（如：Pitt 管理"九族文化村"和"趙致緯"）
- **靈活的權限管理系統**，支持細粒度的權限控制

## 架構變更摘要

### 🔄 主要變更

| 項目 | 舊架構 (v4) | 新架構 (v5) |
|------|-------------|-------------|
| 用戶角色 | 單一角色字段 | 多對多關聯表 |
| 業務實體 | 混合在用戶表中 | 獨立的業務實體表 |
| 權限管理 | 基於角色的簡單權限 | 細粒度權限控制 |
| 任務關聯 | 關聯到用戶 | 關聯到業務實體 |

### 🏗️ 新表結構

#### 核心表
1. **`users`** - 用戶帳號（身份驗證層）
2. **`roles`** - 系統角色定義
3. **`user_roles`** - 用戶-角色關聯
4. **`business_entities`** - 業務實體（供應商、KOC、媒體等）
5. **`user_business_permissions`** - 用戶業務實體管理權限

#### 詳細資訊表
6. **`supplier_profiles`** - 供應商詳細資訊
7. **`creator_profiles`** - KOC/創作者詳細資訊
8. **`media_profiles`** - 媒體詳細資訊

#### 任務相關表（更新版）
9. **`tasks`** - 任務表（關聯到業務實體）

## 詳細設計說明

### 1. 用戶帳號表 (`users`)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    bio TEXT,
    -- 安全相關欄位
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    -- 審計欄位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**特點：**
- 只負責身份驗證和基本個人資訊
- 移除了舊的 `role` 字段
- 不再包含業務相關的欄位

### 2. 角色定義表 (`roles`)

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'supplier', 'creator', 'media', 'admin'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB, -- 角色權限配置
    is_system_role BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**預設角色：**
- `admin` - 系統管理員
- `supplier` - 供應商
- `creator` - 創作者/KOC
- `media` - 媒體

### 3. 用戶角色關聯表 (`user_roles`)

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE, -- 角色過期時間
    UNIQUE(user_id, role_id)
);
```

**特點：**
- 支持一個用戶擁有多個角色
- 支持角色啟用/停用
- 支持角色過期時間
- 記錄角色授予者和時間

### 4. 業務實體表 (`business_entities`)

```sql
CREATE TABLE business_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL, -- 如"九族文化村"、"趙致緯"
    business_type VARCHAR(50) NOT NULL, -- 'supplier', 'koc', 'media', 'agency'
    description TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    website VARCHAR(255),
    location POINT, -- 使用PostGIS的POINT類型
    address JSONB, -- 詳細地址資訊
    business_license VARCHAR(100),
    tax_id VARCHAR(100),
    industry VARCHAR(100),
    specialties TEXT[], -- 專長領域
    social_media JSONB, -- 社交媒體連結
    status VARCHAR(20) DEFAULT 'active',
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

**業務類型：**
- `supplier` - 供應商（如：九族文化村）
- `koc` - 關鍵意見領袖/創作者（如：趙致緯）
- `media` - 媒體機構
- `agency` - 代理機構

### 5. 用戶業務實體管理權限表 (`user_business_permissions`)

```sql
CREATE TABLE user_business_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_entity_id UUID REFERENCES business_entities(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    
    -- 權限級別
    permission_level VARCHAR(20) DEFAULT 'manager' CHECK (
        permission_level IN ('owner', 'admin', 'manager', 'viewer')
    ),
    
    -- 權限範圍
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_manage_content BOOLEAN DEFAULT FALSE,
    can_manage_finance BOOLEAN DEFAULT FALSE,
    can_view_analytics BOOLEAN DEFAULT FALSE,
    
    -- 狀態
    is_active BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, business_entity_id, role_id)
);
```

**權限級別：**
- `owner` - 擁有者（完全控制）
- `admin` - 管理員（大部分權限）
- `manager` - 經理（部分管理權限）
- `viewer` - 查看者（只讀權限）

## 使用場景示例

### 場景1：Pitt 管理多個業務實體

```
用戶帳號：Pitt (pitt@example.com)
├── 角色：系統管理員
├── 業務實體1：九族文化村 (supplier)
│   └── 權限：owner (完全控制)
└── 業務實體2：趙致緯 (koc)
    └── 權限：owner (完全控制)
```

**數據結構：**
```sql
-- 用戶表
INSERT INTO users (username, email, first_name, last_name) 
VALUES ('pitt', 'pitt@example.com', 'Pitt', 'User');

-- 業務實體表
INSERT INTO business_entities (name, business_type, description, created_by) VALUES
('九族文化村', 'supplier', '知名主題樂園，提供文化體驗和娛樂服務', 'pitt-uuid'),
('趙致緯', 'koc', '旅遊內容創作者，專注於台灣旅遊景點介紹', 'pitt-uuid');

-- 用戶角色關聯
INSERT INTO user_roles (user_id, role_id, granted_by) VALUES
('pitt-uuid', 'admin-role-uuid', 'pitt-uuid'),
('pitt-uuid', 'supplier-role-uuid', 'pitt-uuid'),
('pitt-uuid', 'creator-role-uuid', 'pitt-uuid');

-- 業務實體管理權限
INSERT INTO user_business_permissions (user_id, business_entity_id, role_id, permission_level, ...) VALUES
('pitt-uuid', '九族文化村-uuid', 'supplier-role-uuid', 'owner', ...),
('pitt-uuid', '趙致緯-uuid', 'creator-role-uuid', 'owner', ...);
```

### 場景2：創作者申請供應商任務

```
1. 創作者用戶登入系統
2. 系統檢查用戶角色（creator）
3. 用戶可以瀏覽供應商發布的任務
4. 用戶以創作者身份申請任務
5. 任務關聯到創作者的業務實體
```

## 權限控制邏輯

### 權限檢查流程

```php
// 檢查用戶是否有權限管理特定業務實體
function canManageBusinessEntity($userId, $businessEntityId, $permission) {
    $stmt = $pdo->prepare("
        SELECT permission_level, can_manage_users, can_manage_content, 
               can_manage_finance, can_view_analytics
        FROM user_business_permissions
        WHERE user_id = ? AND business_entity_id = ? AND is_active = TRUE
    ");
    
    $stmt->execute([$userId, $businessEntityId]);
    $permissions = $stmt->fetch();
    
    if (!$permissions) {
        return false;
    }
    
    // 根據權限級別和具體權限進行檢查
    switch ($permission) {
        case 'manage_users':
            return $permissions['permission_level'] === 'owner' || 
                   $permissions['can_manage_users'];
        case 'manage_content':
            return $permissions['permission_level'] === 'owner' || 
                   $permissions['can_manage_content'];
        // ... 其他權限檢查
    }
}
```

## 遷移指南

### 自動遷移

使用提供的遷移腳本：

```bash
# 在 backend/database 目錄下執行
php migrate_to_v5.php
```

### 手動遷移步驟

1. **備份現有數據**
   ```sql
   CREATE TABLE users_backup_v4 AS SELECT * FROM users;
   CREATE TABLE tasks_backup_v4 AS SELECT * FROM tasks;
   ```

2. **創建新表結構**
   - 執行 `schema_v5_user_roles.sql`

3. **遷移用戶數據**
   - 將舊 `users` 表的用戶基本資訊遷移到新 `users` 表
   - 根據舊的 `role` 字段創建對應的業務實體

4. **遷移任務數據**
   - 將任務的 `supplier_id` 改為 `business_entity_id`

## 前端整合

### TypeScript 類型定義

```typescript
// 用戶角色摘要
interface UserRolesSummary {
    user_id: UUID;
    username: string;
    email: string;
    roles: string[];
    role_display_names: string[];
    managed_businesses: number;
}

// 業務實體管理摘要
interface BusinessManagementSummary {
    business_entity_id: UUID;
    business_name: string;
    business_type: BusinessType;
    manager_username: string;
    permission_level: PermissionLevel;
    can_manage_users: boolean;
    can_manage_content: boolean;
    can_manage_finance: boolean;
}
```

### API 端點

```typescript
// 獲取用戶角色摘要
GET /api/users/{userId}/roles/summary

// 獲取業務實體管理摘要
GET /api/business-management/summary

// 分配角色
POST /api/users/{userId}/roles

// 分配業務實體權限
POST /api/user-business-permissions
```

## 優勢和好處

### ✅ 優點

1. **靈活性**：一個用戶可以擁有多個角色
2. **可擴展性**：支持複雜的業務實體關係
3. **權限細化**：細粒度的權限控制
4. **業務分離**：用戶帳號和業務實體分離
5. **審計追蹤**：完整的權限授予和變更記錄

### ⚠️ 注意事項

1. **複雜性增加**：相比舊架構，查詢會更複雜
2. **性能考慮**：需要適當的索引優化
3. **數據一致性**：需要確保關聯數據的完整性

## 性能優化建議

### 索引策略

```sql
-- 用戶角色查詢優化
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- 業務實體權限查詢優化
CREATE INDEX idx_user_business_permissions_user_id ON user_business_permissions(user_id);
CREATE INDEX idx_user_business_permissions_business_id ON user_business_permissions(business_entity_id);

-- 複合索引
CREATE INDEX idx_user_business_permissions_composite ON user_business_permissions(user_id, business_entity_id, is_active);
```

### 查詢優化

```sql
-- 使用視圖簡化複雜查詢
CREATE VIEW user_roles_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    array_agg(r.name) as roles,
    array_agg(r.display_name) as role_display_names,
    COUNT(DISTINCT ubp.business_entity_id) as managed_businesses
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN user_business_permissions ubp ON u.id = ubp.user_id AND ubp.is_active = TRUE
GROUP BY u.id, u.username, u.email;
```

## 總結

v5.0 架構通過分離用戶帳號、角色和業務實體，實現了更靈活和可擴展的權限管理系統。這種設計特別適合：

- 需要多角色支持的用戶
- 複雜的業務實體關係
- 細粒度權限控制需求
- 多租戶或多品牌管理

通過合理的索引設計和查詢優化，新架構在保持靈活性的同時，也能確保良好的性能表現。
