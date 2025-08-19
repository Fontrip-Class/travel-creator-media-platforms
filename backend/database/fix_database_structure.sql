-- 修復資料庫結構問題
-- 確保所有必要欄位和約束都存在

-- 修復 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at DATETIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until DATETIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME;

-- 修復 user_sessions 表
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(255);
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255);
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS device_info TEXT;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 修復 creator_profiles 表
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS content_types TEXT;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS collaboration_history TEXT;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS availability TEXT;

-- 修復 tasks 表
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_creator_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at DATETIME;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workflow_stage VARCHAR(50) DEFAULT 'draft';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reward_type VARCHAR(20) DEFAULT 'money';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS gift_details TEXT;

-- 修復 task_applications 表
ALTER TABLE task_applications ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(50);
ALTER TABLE task_applications ADD COLUMN IF NOT EXISTS portfolio_samples TEXT;
ALTER TABLE task_applications ADD COLUMN IF NOT EXISTS reviewed_at DATETIME;
ALTER TABLE task_applications ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- 修復 media_assets 表
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS approved_at DATETIME;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;

-- 創建缺失的索引
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_creator ON tasks(assigned_creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_stage ON tasks(workflow_stage);

-- 更新現有數據的預設值
UPDATE users SET last_login_at = created_at WHERE last_login_at IS NULL;
UPDATE tasks SET workflow_stage = status WHERE workflow_stage = 'draft';
UPDATE tasks SET reward_type = 'money' WHERE reward_type IS NULL;

-- 檢查並修復數據一致性
UPDATE tasks SET applications_count = (
    SELECT COUNT(*) FROM task_applications WHERE task_id = tasks.id
) WHERE applications_count != (
    SELECT COUNT(*) FROM task_applications WHERE task_id = tasks.id
);

-- 確保所有用戶都有基本設置
INSERT OR IGNORE INTO user_settings (user_id, email_notifications, push_notifications, language, timezone, theme, created_at, updated_at)
SELECT
    id,
    TRUE,
    TRUE,
    'zh-TW',
    'Asia/Taipei',
    'light',
    datetime('now'),
    datetime('now')
FROM users
WHERE id NOT IN (SELECT user_id FROM user_settings);
