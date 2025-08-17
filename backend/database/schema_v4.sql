-- 旅遊平台資料庫結構 v4.0 (任務階段管理版)
-- 使用PostgreSQL的進階功能

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 任務階段歷史表
CREATE TABLE task_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    from_stage VARCHAR(50) NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務活動記錄表
CREATE TABLE task_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務階段進度表
CREATE TABLE task_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    current_stage VARCHAR(50) NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    stage_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stage_completed_at TIMESTAMP WITH TIME ZONE,
    stage_duration_hours INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務溝通記錄表
CREATE TABLE task_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    message_type VARCHAR(50) NOT NULL, -- 'comment', 'feedback', 'question', 'answer'
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務里程碑表
CREATE TABLE task_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'overdue'
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務文件表
CREATE TABLE task_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    file_category VARCHAR(50), -- 'proposal', 'content', 'review', 'final'
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任務評價表
CREATE TABLE task_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    rating_type VARCHAR(50) NOT NULL, -- 'quality', 'communication', 'timeliness', 'overall'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, from_user_id, to_user_id, rating_type)
);

-- 任務通知設置表
CREATE TABLE task_notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    stage_changes BOOLEAN DEFAULT TRUE,
    deadline_reminders BOOLEAN DEFAULT TRUE,
    new_messages BOOLEAN DEFAULT TRUE,
    milestone_updates BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引
CREATE INDEX idx_task_stage_history_task_id ON task_stage_history(task_id);
CREATE INDEX idx_task_stage_history_changed_at ON task_stage_history(changed_at);
CREATE INDEX idx_task_activities_task_id ON task_activities(task_id);
CREATE INDEX idx_task_activities_user_id ON task_activities(user_id);
CREATE INDEX idx_task_activities_created_at ON task_activities(created_at);
CREATE INDEX idx_task_stages_task_id ON task_stages(task_id);
CREATE INDEX idx_task_stages_current_stage ON task_stages(current_stage);
CREATE INDEX idx_task_communications_task_id ON task_communications(task_id);
CREATE INDEX idx_task_communications_from_user ON task_communications(from_user_id);
CREATE INDEX idx_task_communications_to_user ON task_communications(to_user_id);
CREATE INDEX idx_task_milestones_task_id ON task_milestones(task_id);
CREATE INDEX idx_task_milestones_due_date ON task_milestones(due_date);
CREATE INDEX idx_task_files_task_id ON task_files(task_id);
CREATE INDEX idx_task_files_uploaded_by ON task_files(uploaded_by);
CREATE INDEX idx_task_ratings_task_id ON task_ratings(task_id);
CREATE INDEX idx_task_ratings_from_user ON task_ratings(from_user_id);
CREATE INDEX idx_task_ratings_to_user ON task_ratings(to_user_id);

-- 創建觸發器函數來更新updated_at
CREATE OR REPLACE FUNCTION update_task_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為task_stages表添加觸發器
CREATE TRIGGER update_task_stages_updated_at BEFORE UPDATE ON task_stages
    FOR EACH ROW EXECUTE FUNCTION update_task_stages_updated_at();

-- 為task_notification_settings表添加觸發器
CREATE TRIGGER update_task_notification_settings_updated_at BEFORE UPDATE ON task_notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_task_notification_settings_updated_at();

-- 創建觸發器函數來自動創建任務階段記錄
CREATE OR REPLACE FUNCTION create_task_stage_record()
RETURNS TRIGGER AS $$
BEGIN
    -- 當任務狀態改變時，自動創建階段記錄
    INSERT INTO task_stages (task_id, current_stage, progress_percentage)
    VALUES (NEW.id, NEW.status, 
        CASE 
            WHEN NEW.status = 'draft' THEN 0
            WHEN NEW.status = 'published' THEN 12.5
            WHEN NEW.status = 'collecting' THEN 25
            WHEN NEW.status = 'evaluating' THEN 37.5
            WHEN NEW.status = 'in_progress' THEN 50
            WHEN NEW.status = 'reviewing' THEN 62.5
            WHEN NEW.status = 'publishing' THEN 75
            WHEN NEW.status = 'completed' THEN 100
            ELSE 0
        END
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為tasks表添加觸發器
CREATE TRIGGER create_task_stage_record_trigger AFTER INSERT ON tasks
    FOR EACH ROW EXECUTE FUNCTION create_task_stage_record();

-- 創建觸發器函數來自動更新任務階段進度
CREATE OR REPLACE FUNCTION update_task_stage_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- 當任務狀態改變時，自動更新階段進度
    UPDATE task_stages 
    SET 
        current_stage = NEW.status,
        progress_percentage = 
            CASE 
                WHEN NEW.status = 'draft' THEN 0
                WHEN NEW.status = 'published' THEN 12.5
                WHEN NEW.status = 'collecting' THEN 25
                WHEN NEW.status = 'evaluating' THEN 37.5
                WHEN NEW.status = 'in_progress' THEN 50
                WHEN NEW.status = 'reviewing' THEN 62.5
                WHEN NEW.status = 'publishing' THEN 75
                WHEN NEW.status = 'completed' THEN 100
                ELSE 0
            END,
        updated_at = CURRENT_TIMESTAMP
    WHERE task_id = NEW.id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為tasks表添加觸發器
CREATE TRIGGER update_task_stage_progress_trigger AFTER UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_task_stage_progress();

-- 插入示例數據
INSERT INTO task_notification_settings (user_id, task_id, stage_changes, deadline_reminders, new_messages, milestone_updates, email_notifications, push_notifications)
SELECT 
    u.id as user_id,
    t.id as task_id,
    TRUE as stage_changes,
    TRUE as deadline_reminders,
    TRUE as new_messages,
    TRUE as milestone_updates,
    TRUE as email_notifications,
    TRUE as push_notifications
FROM users u
CROSS JOIN tasks t
WHERE u.role IN ('supplier', 'creator', 'media')
LIMIT 100;

-- 創建視圖：任務進度摘要
CREATE VIEW task_progress_summary AS
SELECT 
    t.id as task_id,
    t.title,
    t.status,
    t.supplier_id,
    ts.current_stage,
    ts.progress_percentage,
    ts.stage_started_at,
    t.deadline,
    CASE 
        WHEN t.deadline < CURRENT_DATE THEN 'overdue'
        WHEN t.deadline = CURRENT_DATE THEN 'due_today'
        WHEN t.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END as deadline_status,
    COUNT(DISTINCT ta.id) as total_applications,
    COUNT(DISTINCT tc.id) as total_comments,
    COUNT(DISTINCT tf.id) as total_files
FROM tasks t
LEFT JOIN task_stages ts ON t.id = ts.task_id
LEFT JOIN task_applications ta ON t.id = ta.task_id
LEFT JOIN task_communications tc ON t.id = tc.task_id
LEFT JOIN task_files tf ON t.id = tf.task_id
GROUP BY t.id, t.title, t.status, t.supplier_id, ts.current_stage, ts.progress_percentage, ts.stage_started_at, t.deadline;

-- 創建視圖：用戶任務統計
CREATE VIEW user_task_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.role,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status IN ('collecting', 'evaluating', 'in_progress', 'reviewing') THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'cancelled' THEN t.id END) as cancelled_tasks,
    AVG(ts.progress_percentage) as avg_progress,
    COUNT(DISTINCT ta.id) as total_applications,
    COUNT(DISTINCT tr.id) as total_ratings,
    AVG(tr.rating) as avg_rating
FROM users u
LEFT JOIN tasks t ON u.id = t.supplier_id
LEFT JOIN task_stages ts ON t.id = ts.task_id
LEFT JOIN task_applications ta ON u.id = ta.creator_id
LEFT JOIN task_ratings tr ON u.id = tr.to_user_id
GROUP BY u.id, u.username, u.role;

-- 創建函數：獲取任務階段統計
CREATE OR REPLACE FUNCTION get_task_stage_stats()
RETURNS TABLE (
    stage_name VARCHAR(50),
    stage_count BIGINT,
    avg_progress DECIMAL(5,2),
    avg_duration_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.current_stage,
        COUNT(*) as stage_count,
        AVG(ts.progress_percentage) as avg_progress,
        AVG(EXTRACT(EPOCH FROM (ts.updated_at - ts.stage_started_at)) / 3600) as avg_duration_hours
    FROM task_stages ts
    GROUP BY ts.current_stage
    ORDER BY ts.current_stage;
END;
$$ LANGUAGE plpgsql;

-- 創建函數：檢查任務是否逾期
CREATE OR REPLACE FUNCTION check_task_deadline(task_uuid UUID)
RETURNS TABLE (
    is_overdue BOOLEAN,
    days_remaining INTEGER,
    deadline_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.deadline < CURRENT_DATE as is_overdue,
        (t.deadline - CURRENT_DATE)::INTEGER as days_remaining,
        t.deadline as deadline_date
    FROM tasks t
    WHERE t.id = task_uuid;
END;
$$ LANGUAGE plpgsql;
