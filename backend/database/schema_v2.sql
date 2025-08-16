-- 旅遊平台資料庫結構 v2.0 (優化版)
-- 使用PostgreSQL的進階功能

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 用戶表 (優化版)
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
    location POINT, -- 使用PostGIS的POINT類型
    address JSONB, -- 詳細地址資訊
    skills TEXT[], -- 技能陣列
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務表 (優化版)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    budget_type VARCHAR(20) DEFAULT 'fixed', -- fixed, hourly, negotiable
    location POINT,
    service_area TEXT[],
    content_type VARCHAR(50), -- 圖片、影片、文章等
    content_format JSONB, -- 詳細規格要求
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

-- 任務申請表 (優化版)
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

-- 媒體素材表 (優化版)
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    dimensions JSONB, -- 圖片/影片尺寸
    duration INTEGER, -- 影片時長（秒）
    thumbnail_path VARCHAR(500),
    tags TEXT[],
    location POINT,
    location_name VARCHAR(200),
    content_category VARCHAR(50),
    usage_rights JSONB, -- 使用權限和授權條款
    is_public BOOLEAN DEFAULT TRUE,
    is_licensed BOOLEAN DEFAULT FALSE,
    license_type VARCHAR(50),
    license_expires TIMESTAMP WITH TIME ZONE,
    
    -- 統計欄位
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 媒合記錄表 (優化版)
CREATE TABLE matching_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2),
    match_reasons JSONB,
    status VARCHAR(20) DEFAULT 'suggested' CHECK (status IN ('suggested', 'viewed', 'interested', 'not_interested')),
    supplier_feedback TEXT,
    creator_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 通知表 (優化版)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用戶會話表 (新增)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 審計日誌表 (新增)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引 (優化版)
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_skills ON users USING GIN(skills);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_location ON tasks USING GIST(location);
CREATE INDEX idx_tasks_content_type ON tasks(content_type);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_tasks_supplier ON tasks(supplier_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

CREATE INDEX idx_media_assets_creator ON media_assets(creator_id);
CREATE INDEX idx_media_assets_tags ON media_assets USING GIN(tags);
CREATE INDEX idx_media_assets_location ON media_assets USING GIST(location);
CREATE INDEX idx_media_assets_category ON media_assets(content_category);
CREATE INDEX idx_media_assets_is_public ON media_assets(is_public);

CREATE INDEX idx_task_applications_task ON task_applications(task_id);
CREATE INDEX idx_task_applications_creator ON task_applications(creator_id);
CREATE INDEX idx_task_applications_status ON task_applications(status);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 全文搜尋索引 (優化版)
CREATE INDEX idx_tasks_search ON tasks USING GIN(to_tsvector('chinese', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_media_search ON media_assets USING GIN(to_tsvector('chinese', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_users_search ON users USING GIN(to_tsvector('chinese', username || ' ' || COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')));

-- 觸發器：更新updated_at欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 觸發器：創建審計日誌
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (current_setting('app.current_user_id')::UUID, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (current_setting('app.current_user_id')::UUID, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (current_setting('app.current_user_id')::UUID, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 觸發器：自動設置過期任務狀態
CREATE OR REPLACE FUNCTION update_expired_tasks()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tasks 
    SET status = 'expired' 
    WHERE deadline < CURRENT_DATE 
    AND status IN ('open', 'in_progress');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 應用觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_applications_updated_at BEFORE UPDATE ON task_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 審計觸發器
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_media_assets AFTER INSERT OR UPDATE OR DELETE ON media_assets FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- 定時觸發器 (每天檢查過期任務)
CREATE TRIGGER check_expired_tasks AFTER INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_expired_tasks();

-- 創建視圖：活躍用戶統計
CREATE VIEW active_users_stats AS
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN last_login > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 1 END) as active_30_days,
    COUNT(CASE WHEN last_login > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as active_7_days,
    AVG(rating) as avg_rating
FROM users 
WHERE is_active = true 
GROUP BY role;

-- 創建視圖：任務統計
CREATE VIEW task_stats AS
SELECT 
    status,
    COUNT(*) as total_tasks,
    AVG(budget_min + budget_max) / 2 as avg_budget,
    COUNT(CASE WHEN is_urgent = true THEN 1 END) as urgent_tasks
FROM tasks 
GROUP BY status;

-- 創建視圖：媒合成功率
CREATE VIEW matching_success_rate AS
SELECT 
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) * 100.0 / COUNT(*) as success_rate,
    COUNT(*) as total_applications
FROM task_applications;
