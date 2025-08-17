-- 旅遊平台資料庫結構 v3.0 (權限管理版)
-- 使用PostgreSQL的進階功能

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 權限表
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 角色權限關聯表
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);

-- 用戶表 (權限管理版)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('supplier', 'creator', 'media', 'admin')),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    bio TEXT,
    location POINT,
    address JSONB,
    skills TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_suspended BOOLEAN DEFAULT FALSE,
    suspension_reason TEXT,
    suspension_until TIMESTAMP WITH TIME ZONE,
    
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

-- 用戶設置表
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'zh-TW',
    timezone VARCHAR(50) DEFAULT 'Asia/Taipei',
    theme VARCHAR(20) DEFAULT 'light',
    currency VARCHAR(3) DEFAULT 'TWD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 供應商詳細資訊表
CREATE TABLE supplier_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(100),
    business_type VARCHAR(50),
    license_number VARCHAR(50),
    website VARCHAR(255),
    social_media JSONB,
    service_areas TEXT[],
    specialties TEXT[],
    business_hours JSONB,
    payment_methods TEXT[],
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 創作者詳細資訊表
CREATE TABLE creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    portfolio_url VARCHAR(255),
    social_media JSONB,
    content_types TEXT[],
    target_audience TEXT[],
    collaboration_history JSONB,
    equipment JSONB,
    availability JSONB,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 媒體詳細資訊表
CREATE TABLE media_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_type VARCHAR(50),
    platform_name VARCHAR(100),
    audience_size INTEGER,
    content_categories TEXT[],
    engagement_rate DECIMAL(5,2),
    demographics JSONB,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 審計日誌表
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務表 (權限管理版)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    budget_type VARCHAR(20) DEFAULT 'fixed',
    location POINT,
    service_area TEXT[],
    content_type VARCHAR(50),
    content_format JSONB,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'expired')),
    priority VARCHAR(20) DEFAULT 'normal',
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    
    -- 統計欄位
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- 審計欄位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 任務申請表
CREATE TABLE task_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    proposed_budget DECIMAL(10,2),
    estimated_duration VARCHAR(50),
    portfolio_samples JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
    supplier_notes TEXT,
    creator_notes TEXT,
    
    -- 評分和反饋
    supplier_rating INTEGER CHECK (supplier_rating >= 1 AND supplier_rating <= 5),
    supplier_feedback TEXT,
    creator_rating INTEGER CHECK (creator_rating >= 1 AND creator_rating <= 5),
    creator_feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, creator_id)
);

-- 媒體素材表
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    asset_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    file_size INTEGER,
    duration INTEGER, -- 影片長度（秒）
    dimensions JSONB, -- 圖片/影片尺寸
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入基本權限
INSERT INTO permissions (name, description) VALUES
('user.register', '用戶註冊權限'),
('user.login', '用戶登入權限'),
('user.edit_own', '編輯自己的資料'),
('user.edit_others', '編輯其他用戶資料'),
('user.suspend_own', '停用自己的帳戶'),
('user.suspend_others', '停用其他用戶帳戶'),
('user.activate', '啟用用戶帳戶'),
('user.view_audit_logs', '查看審計日誌'),
('admin.full_access', '管理員完整權限');

-- 插入角色權限關聯
INSERT INTO role_permissions (role, permission_id) VALUES
-- 供應商權限
('supplier', (SELECT id FROM permissions WHERE name = 'user.register')),
('supplier', (SELECT id FROM permissions WHERE name = 'user.login')),
('supplier', (SELECT id FROM permissions WHERE name = 'user.edit_own')),
('supplier', (SELECT id FROM permissions WHERE name = 'user.suspend_own')),

-- 創作者權限
('creator', (SELECT id FROM permissions WHERE name = 'user.register')),
('creator', (SELECT id FROM permissions WHERE name = 'user.login')),
('creator', (SELECT id FROM permissions WHERE name = 'user.edit_own')),
('creator', (SELECT id FROM permissions WHERE name = 'user.suspend_own')),

-- 媒體權限
('media', (SELECT id FROM permissions WHERE name = 'user.register')),
('media', (SELECT id FROM permissions WHERE name = 'user.login')),
('media', (SELECT id FROM permissions WHERE name = 'user.edit_own')),
('media', (SELECT id FROM permissions WHERE name = 'user.suspend_own')),

-- 管理員權限
('admin', (SELECT id FROM permissions WHERE name = 'user.register')),
('admin', (SELECT id FROM permissions WHERE name = 'user.login')),
('admin', (SELECT id FROM permissions WHERE name = 'user.edit_own')),
('admin', (SELECT id FROM permissions WHERE name = 'user.edit_others')),
('admin', (SELECT id FROM permissions WHERE name = 'user.suspend_own')),
('admin', (SELECT id FROM permissions WHERE name = 'user.suspend_others')),
('admin', (SELECT id FROM permissions WHERE name = 'user.activate')),
('admin', (SELECT id FROM permissions WHERE name = 'user.view_audit_logs')),
('admin', (SELECT id FROM permissions WHERE name = 'admin.full_access'));

-- 創建索引
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_suspended ON users(is_suspended);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 創建觸發器函數來更新updated_at
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

CREATE TRIGGER update_supplier_profiles_updated_at BEFORE UPDATE ON supplier_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON creator_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_profiles_updated_at BEFORE UPDATE ON media_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_applications_updated_at BEFORE UPDATE ON task_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
