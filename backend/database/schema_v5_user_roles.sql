-- 旅遊平台資料庫結構 v5.0 (用戶角色分離版)
-- 重新設計用戶-角色-業務實體關係，支持一個用戶擁有多個角色和管理多個業務實體

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==================== 核心用戶表 ====================
-- 用戶帳號表：只負責身份驗證和基本資訊
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
    reset_token VARCHAR(64),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    
    -- 審計欄位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ==================== 角色定義表 ====================
-- 系統角色表：定義可用的角色類型
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'supplier', 'creator', 'media', 'admin'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB, -- 角色權限配置
    is_system_role BOOLEAN DEFAULT TRUE, -- 是否為系統預設角色
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 業務實體表 ====================
-- 業務實體表：供應商、KOC、媒體等
CREATE TABLE business_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL, -- 業務實體名稱，如"九族文化村"、"趙致緯"
    business_type VARCHAR(50) NOT NULL, -- 'supplier', 'koc', 'media', 'agency'
    description TEXT,
    
    -- 聯絡資訊
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    website VARCHAR(255),
    
    -- 地理位置
    location POINT, -- 使用PostGIS的POINT類型
    address JSONB, -- 詳細地址資訊
    
    -- 業務相關
    business_license VARCHAR(100),
    tax_id VARCHAR(100),
    industry VARCHAR(100),
    specialties TEXT[], -- 專長領域
    
    -- 社交媒體
    social_media JSONB, -- {facebook: "...", instagram: "...", youtube: "..."}
    
    -- 狀態
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    
    -- 審計欄位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ==================== 用戶角色關聯表 ====================
-- 用戶-角色關聯表：一個用戶可以擁有多個角色
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

-- ==================== 用戶業務實體管理權限表 ====================
-- 用戶-業務實體管理權限表：定義用戶對特定業務實體的管理權限
-- 簡化為兩種權限等級：管理者和一般使用者
CREATE TABLE user_business_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_entity_id UUID REFERENCES business_entities(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE, -- 在此業務實體中的角色
    
    -- 權限級別：簡化為兩種
    permission_level VARCHAR(20) DEFAULT 'user' CHECK (permission_level IN ('manager', 'user')),
    
    -- 權限範圍（管理者擁有所有權限，一般使用者只有基本權限）
    can_manage_users BOOLEAN DEFAULT FALSE, -- 是否可以管理其他用戶權限
    can_manage_content BOOLEAN DEFAULT FALSE, -- 是否可以管理內容
    can_manage_finance BOOLEAN DEFAULT FALSE, -- 是否可以管理財務
    can_view_analytics BOOLEAN DEFAULT FALSE, -- 是否可以查看分析數據
    can_edit_profile BOOLEAN DEFAULT TRUE, -- 是否可以編輯基本資料（所有用戶都有）
    
    -- 狀態
    is_active BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, business_entity_id, role_id)
);

-- ==================== 業務實體詳細資訊表 ====================
-- 供應商詳細資訊表
CREATE TABLE supplier_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_entity_id UUID REFERENCES business_entities(id) ON DELETE CASCADE,
    
    -- 業務資訊
    company_name VARCHAR(200),
    business_type VARCHAR(100),
    license_number VARCHAR(100),
    service_areas TEXT[],
    business_hours JSONB,
    payment_methods TEXT[],
    
    -- 服務相關
    service_categories TEXT[],
    pricing_info JSONB,
    availability_schedule JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KOC/創作者詳細資訊表
CREATE TABLE creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_entity_id UUID REFERENCES business_entities(id) ON DELETE CASCADE,
    
    -- 創作者資訊
    portfolio_url VARCHAR(255),
    content_types TEXT[], -- 內容類型：video, photo, article, live
    target_audience TEXT[], -- 目標受眾
    content_categories TEXT[], -- 內容分類：travel, food, lifestyle
    
    -- 影響力數據
    follower_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_views INTEGER DEFAULT 0,
    avg_likes INTEGER DEFAULT 0,
    
    -- 合作相關
    collaboration_history JSONB,
    equipment JSONB,
    availability JSONB,
    rate_card JSONB, -- 報價單
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 媒體詳細資訊表
CREATE TABLE media_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_entity_id UUID REFERENCES business_entities(id) ON DELETE CASCADE,
    
    -- 媒體資訊
    media_type VARCHAR(100), -- 媒體類型：TV, radio, newspaper, digital
    platform_name VARCHAR(200),
    audience_size INTEGER DEFAULT 0,
    content_categories TEXT[],
    
    -- 數據指標
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    demographics JSONB, -- 受眾人口統計
    reach_coverage JSONB, -- 覆蓋範圍
    
    -- 合作相關
    advertising_rates JSONB,
    content_guidelines TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 任務相關表（更新版） ====================
-- 任務表：關聯到業務實體而不是用戶
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_entity_id UUID REFERENCES business_entities(id) ON DELETE CASCADE, -- 改為關聯業務實體
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    
    -- 任務詳情
    category VARCHAR(100),
    tags TEXT[],
    budget_range JSONB, -- {min: 1000, max: 5000, currency: "TWD"}
    
    -- 時間相關
    deadline DATE,
    estimated_duration_hours INTEGER,
    
    -- 狀態管理
    status VARCHAR(20) DEFAULT 'draft' CHECK (
        status IN ('draft', 'published', 'collecting', 'evaluating',
                   'in_progress', 'reviewing', 'publishing', 'completed', 'cancelled', 'expired')
    ),
    
    -- 地理位置
    location POINT,
    location_description TEXT,
    
    -- 審計欄位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ==================== 插入預設角色數據 ====================
INSERT INTO roles (name, display_name, description, permissions) VALUES
('admin', '系統管理員', '擁有系統所有權限', '{"all": true}'),
('supplier', '供應商', '可以發布任務和管理供應商業務', '{"task_management": true, "business_management": true}'),
('creator', '創作者/KOC', '可以申請任務和創作內容', '{"task_application": true, "content_creation": true}'),
('media', '媒體', '可以發布媒體任務和內容', '{"media_management": true, "content_publishing": true}');

-- ==================== 創建索引 ====================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_business_entities_name ON business_entities(name);
CREATE INDEX idx_business_entities_type ON business_entities(business_type);
CREATE INDEX idx_user_business_permissions_user_id ON user_business_permissions(user_id);
CREATE INDEX idx_user_business_permissions_business_id ON user_business_permissions(business_entity_id);
CREATE INDEX idx_tasks_business_entity_id ON tasks(business_entity_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ==================== 創建視圖 ====================
-- 用戶角色摘要視圖
CREATE VIEW user_roles_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    array_agg(r.name) as roles,
    array_agg(r.display_name) as role_display_names,
    COUNT(DISTINCT ubp.business_entity_id) as managed_businesses
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN user_business_permissions ubp ON u.id = ubp.user_id AND ubp.is_active = TRUE
GROUP BY u.id, u.username, u.email, u.first_name, u.last_name;

-- 業務實體管理權限視圖
CREATE VIEW business_management_summary AS
SELECT 
    be.id as business_entity_id,
    be.name as business_name,
    be.business_type,
    be.status,
    u.username as manager_username,
    u.first_name,
    u.last_name,
    r.name as role_name,
    ubp.permission_level,
    ubp.can_manage_users,
    ubp.can_manage_content,
    ubp.can_manage_finance
FROM business_entities be
JOIN user_business_permissions ubp ON be.id = ubp.business_entity_id
JOIN users u ON ubp.user_id = u.id
JOIN roles r ON ubp.role_id = r.id
WHERE ubp.is_active = TRUE;

-- ==================== 創建觸發器 ====================
-- 更新時間戳觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為相關表添加觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_entities_updated_at BEFORE UPDATE ON business_entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== 示例數據插入 ====================
-- 插入示例用戶
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('pitt', 'pitt@example.com', '$2y$10$example_hash', 'Pitt', 'User');

-- 插入示例業務實體
INSERT INTO business_entities (name, business_type, description, created_by) VALUES
('九族文化村', 'supplier', '知名主題樂園，提供文化體驗和娛樂服務', (SELECT id FROM users WHERE username = 'pitt')),
('趙致緯', 'koc', '旅遊內容創作者，專注於台灣旅遊景點介紹', (SELECT id FROM users WHERE username = 'pitt'));

-- 為Pitt分配角色
INSERT INTO user_roles (user_id, role_id, granted_by) VALUES
((SELECT id FROM users WHERE username = 'pitt'), (SELECT id FROM roles WHERE name = 'admin'), (SELECT id FROM users WHERE username = 'pitt')),
((SELECT id FROM users WHERE username = 'pitt'), (SELECT id FROM roles WHERE name = 'supplier'), (SELECT id FROM users WHERE username = 'pitt')),
((SELECT id FROM users WHERE username = 'pitt'), (SELECT id FROM roles WHERE name = 'creator'), (SELECT id FROM users WHERE username = 'pitt'));

-- 為Pitt分配業務實體管理權限（管理者權限）
INSERT INTO user_business_permissions (user_id, business_entity_id, role_id, permission_level, can_manage_users, can_manage_content, can_manage_finance, can_view_analytics, granted_by) VALUES
((SELECT id FROM users WHERE username = 'pitt'), (SELECT id FROM business_entities WHERE name = '九族文化村'), (SELECT id FROM roles WHERE name = 'supplier'), 'manager', TRUE, TRUE, TRUE, TRUE, (SELECT id FROM users WHERE username = 'pitt')),
((SELECT id FROM users WHERE username = 'pitt'), (SELECT id FROM business_entities WHERE name = '趙致緯'), (SELECT id FROM roles WHERE name = 'creator'), 'manager', TRUE, TRUE, TRUE, TRUE, (SELECT id FROM users WHERE username = 'pitt'));

-- 插入供應商和創作者詳細資訊
INSERT INTO supplier_profiles (business_entity_id) VALUES
((SELECT id FROM business_entities WHERE name = '九族文化村'));

INSERT INTO creator_profiles (business_entity_id, content_types, target_audience, follower_count) VALUES
((SELECT id FROM business_entities WHERE name = '趙致緯'), ARRAY['video', 'photo'], ARRAY['travel_enthusiasts', 'taiwan_tourists'], 50000);
