-- 用戶管理與任務管理整合優化 SQL 腳本
-- 創建索引、視圖和優化查詢以提升系統效能

-- ==================== 索引優化 ====================

-- 用戶相關索引
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- 任務相關索引
CREATE INDEX IF NOT EXISTS idx_tasks_supplier_status ON tasks(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_status_deadline ON tasks(status, deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_budget_range ON tasks(budget_min, budget_max);

-- 任務申請相關索引
CREATE INDEX IF NOT EXISTS idx_task_applications_creator_status ON task_applications(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_task_applications_task_status ON task_applications(task_id, status);
CREATE INDEX IF NOT EXISTS idx_task_applications_created_at ON task_applications(created_at);

-- 業務實體權限索引
CREATE INDEX IF NOT EXISTS idx_user_business_permissions_user ON user_business_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_permissions_business ON user_business_permissions(business_entity_id);
CREATE INDEX IF NOT EXISTS idx_user_business_permissions_level ON user_business_permissions(permission_level);

-- 媒體資源索引
CREATE INDEX IF NOT EXISTS idx_media_assets_task_creator ON media_assets(task_id, creator_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets(created_at);

-- 通知索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 審計日誌索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ==================== 視圖創建 ====================

-- 用戶詳細資訊視圖
CREATE OR REPLACE VIEW v_users_detailed AS
SELECT
    u.*,
    us.email_notifications,
    us.push_notifications,
    us.language,
    us.timezone,
    us.theme,
    COUNT(ubp.id) as business_entities_count,
    COUNT(t.id) as total_tasks_created,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks_count,
    AVG(tr.rating) as average_rating
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
LEFT JOIN user_business_permissions ubp ON u.id = ubp.user_id
LEFT JOIN tasks t ON u.id = t.supplier_id
LEFT JOIN task_ratings tr ON u.id = tr.to_user_id
WHERE u.is_active = TRUE
GROUP BY u.id, us.user_id;

-- 任務詳細資訊視圖
CREATE OR REPLACE VIEW v_tasks_detailed AS
SELECT
    t.*,
    u.username as supplier_name,
    u.email as supplier_email,
    u.avatar_url as supplier_avatar,
    COUNT(ta.id) as applications_count,
    COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END) as accepted_applications,
    COUNT(ma.id) as media_assets_count,
    AVG(tr.rating) as average_rating,
    MAX(ta.created_at) as last_application_date
FROM tasks t
LEFT JOIN users u ON t.supplier_id = u.id
LEFT JOIN task_applications ta ON t.id = ta.task_id
LEFT JOIN media_assets ma ON t.id = ma.task_id
LEFT JOIN task_ratings tr ON t.id = tr.task_id
GROUP BY t.id, u.id;

-- 用戶業務實體關聯視圖
CREATE OR REPLACE VIEW v_user_business_entities AS
SELECT
    u.id as user_id,
    u.username,
    u.email,
    u.role as user_role,
    be.id as business_entity_id,
    be.name as business_entity_name,
    be.business_type,
    be.verification_status,
    ubp.permission_level,
    ubp.can_edit_profile,
    ubp.can_manage_users,
    ubp.can_manage_content,
    ubp.can_manage_finance,
    ubp.can_view_analytics
FROM users u
JOIN user_business_permissions ubp ON u.id = ubp.user_id
JOIN business_entities be ON ubp.business_entity_id = be.id
WHERE u.is_active = TRUE AND be.verification_status = 'verified';

-- 任務申請詳細視圖
CREATE OR REPLACE VIEW v_task_applications_detailed AS
SELECT
    ta.*,
    t.title as task_title,
    t.status as task_status,
    t.deadline as task_deadline,
    t.budget_min,
    t.budget_max,
    supplier.username as supplier_name,
    supplier.email as supplier_email,
    creator.username as creator_name,
    creator.email as creator_email,
    creator.avatar_url as creator_avatar
FROM task_applications ta
JOIN tasks t ON ta.task_id = t.id
JOIN users supplier ON t.supplier_id = supplier.id
JOIN users creator ON ta.creator_id = creator.id;

-- ==================== 儲存程序（如果支援）====================

-- 獲取用戶儀表板統計
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS GetUserDashboardStats(
    IN p_user_id VARCHAR(36),
    IN p_user_role VARCHAR(20)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_user_role = 'supplier' THEN
        SELECT
            COUNT(*) as total_tasks,
            COUNT(CASE WHEN status IN ('open', 'collecting', 'evaluating', 'in_progress', 'reviewing', 'publishing') THEN 1 END) as active_tasks,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
            SUM(CASE WHEN status = 'completed' THEN budget_min ELSE 0 END) as total_budget_spent,
            AVG(CASE WHEN status = 'completed' THEN DATEDIFF(updated_at, created_at) END) as avg_completion_days
        FROM tasks
        WHERE supplier_id = p_user_id;

    ELSEIF p_user_role = 'creator' THEN
        SELECT
            COUNT(*) as total_applications,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
            AVG(proposed_budget) as avg_proposed_budget
        FROM task_applications
        WHERE creator_id = p_user_id;

    ELSEIF p_user_role = 'media' THEN
        SELECT
            COUNT(DISTINCT task_id) as tasks_with_assets,
            COUNT(*) as total_assets,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_assets,
            AVG(file_size) as avg_file_size
        FROM media_assets
        WHERE creator_id = p_user_id;

    ELSEIF p_user_role = 'admin' THEN
        SELECT
            (SELECT COUNT(*) FROM tasks) as total_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status IN ('open', 'collecting', 'evaluating', 'in_progress', 'reviewing', 'publishing')) as active_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'completed') as completed_tasks,
            (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
            (SELECT SUM(budget_min) FROM tasks) as total_budget;
    END IF;
END$$
DELIMITER ;

-- ==================== 觸發器優化 ====================

-- 自動更新任務申請計數
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_task_applications_count
AFTER INSERT ON task_applications
FOR EACH ROW
BEGIN
    UPDATE tasks
    SET applications_count = (
        SELECT COUNT(*) FROM task_applications
        WHERE task_id = NEW.task_id
    )
    WHERE id = NEW.task_id;
END$$
DELIMITER ;

-- 自動更新用戶任務統計
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_user_task_stats
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status AND NEW.status = 'completed' THEN
        UPDATE users
        SET
            completed_tasks = completed_tasks + 1,
            updated_at = NOW()
        WHERE id = NEW.supplier_id;
    END IF;
END$$
DELIMITER ;

-- ==================== 查詢優化函數 ====================

-- 獲取用戶任務概覽的優化查詢
-- 這個查詢整合了用戶、任務、申請等多個表的資訊
/*
SELECT
    u.id,
    u.username,
    u.email,
    u.role,
    u.is_active,
    COUNT(DISTINCT t.id) as created_tasks,
    COUNT(DISTINCT ta.id) as applied_tasks,
    COUNT(DISTINCT ma.id) as media_assets,
    AVG(tr.rating) as average_rating
FROM users u
LEFT JOIN tasks t ON u.id = t.supplier_id
LEFT JOIN task_applications ta ON u.id = ta.creator_id
LEFT JOIN media_assets ma ON u.id = ma.creator_id
LEFT JOIN task_ratings tr ON u.id = tr.to_user_id
WHERE u.is_active = TRUE
GROUP BY u.id
ORDER BY u.created_at DESC;
*/

-- 任務推薦查詢優化
-- 基於用戶偏好、地理位置、技能匹配的智能推薦
/*
SELECT
    t.*,
    u.username as supplier_name,
    (
        -- 技能匹配分數
        CASE WHEN JSON_OVERLAPS(t.content_types, c.content_types) THEN 0.4 ELSE 0 END +
        -- 地理位置分數
        CASE WHEN t.location IS NOT NULL AND c.location IS NOT NULL
             THEN (1 - LEAST(ST_Distance(t.location, c.location) / 100000, 1)) * 0.3
             ELSE 0 END +
        -- 預算匹配分數
        CASE WHEN t.budget_min <= c.preferred_budget AND t.budget_max >= c.preferred_budget
             THEN 0.3
             ELSE 0 END
    ) as match_score
FROM tasks t
JOIN users u ON t.supplier_id = u.id
JOIN creator_profiles c ON c.user_id = :creator_id
WHERE t.status IN ('open', 'collecting')
  AND t.deadline > NOW()
  AND NOT EXISTS (
      SELECT 1 FROM task_applications ta
      WHERE ta.task_id = t.id AND ta.creator_id = :creator_id
  )
ORDER BY match_score DESC, t.created_at DESC
LIMIT 10;
*/
