-- 工作流程支援資料表
-- 確保資料庫完整支援任務工作流程

-- 任務階段表（如果不存在）
CREATE TABLE IF NOT EXISTS task_stages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    stage_name VARCHAR(50) NOT NULL,
    stage_order INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    stage_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stage_completed_at TIMESTAMP NULL,
    stage_duration_hours INTEGER NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task_stages_task_id (task_id),
    INDEX idx_task_stages_order (stage_order)
);

-- 任務活動記錄表（如果不存在）
CREATE TABLE IF NOT EXISTS task_activities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_activities_task_id (task_id),
    INDEX idx_task_activities_user_id (user_id),
    INDEX idx_task_activities_type (activity_type),
    INDEX idx_task_activities_created_at (created_at)
);

-- 任務溝通記錄表（如果不存在）
CREATE TABLE IF NOT EXISTS task_communications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    from_user_id VARCHAR(36) NOT NULL,
    to_user_id VARCHAR(36) NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_communications_task_id (task_id),
    INDEX idx_task_communications_users (from_user_id, to_user_id),
    INDEX idx_task_communications_read (is_read),
    INDEX idx_task_communications_created_at (created_at)
);

-- 任務里程碑表（如果不存在）
CREATE TABLE IF NOT EXISTS task_milestones (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    due_date DATE NULL,
    completed_at TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_task_milestones_task_id (task_id),
    INDEX idx_task_milestones_status (status),
    INDEX idx_task_milestones_due_date (due_date)
);

-- 任務檔案表（如果不存在）
CREATE TABLE IF NOT EXISTS task_files (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NULL,
    file_category VARCHAR(50) NULL,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_files_task_id (task_id),
    INDEX idx_task_files_uploaded_by (uploaded_by),
    INDEX idx_task_files_category (file_category)
);

-- 工作流程狀態記錄表
CREATE TABLE IF NOT EXISTS workflow_state_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id VARCHAR(36) NOT NULL,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(36) NOT NULL,
    reason TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workflow_history_task_id (task_id),
    INDEX idx_workflow_history_status (from_status, to_status),
    INDEX idx_workflow_history_created_at (created_at)
);

-- 更新現有的 tasks 表，確保支援工作流程
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_creator_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS actual_budget DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS workflow_stage VARCHAR(50) DEFAULT 'draft',
ADD FOREIGN KEY (assigned_creator_id) REFERENCES users(id) ON DELETE SET NULL;

-- 更新現有的 task_applications 表
ALTER TABLE task_applications
ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS portfolio_samples JSON NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(36) NULL,
ADD FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- 更新現有的 media_assets 表
ALTER TABLE media_assets
ADD COLUMN IF NOT EXISTS approval_notes TEXT NULL,
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0,
ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- 創建工作流程觸發器

-- 自動記錄狀態變更
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS workflow_status_change_log
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO workflow_state_history (
            task_id, from_status, to_status, changed_by, created_at
        ) VALUES (
            NEW.id, OLD.status, NEW.status, NEW.updated_by, NOW()
        );
    END IF;
END$$
DELIMITER ;

-- 自動更新任務階段進度
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_task_stage_progress
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        UPDATE task_stages
        SET
            progress_percentage = CASE NEW.status
                WHEN 'draft' THEN 5
                WHEN 'open' THEN 10
                WHEN 'collecting' THEN 25
                WHEN 'evaluating' THEN 40
                WHEN 'in_progress' THEN 50
                WHEN 'reviewing' THEN 75
                WHEN 'publishing' THEN 90
                WHEN 'completed' THEN 100
                ELSE progress_percentage
            END,
            stage_completed_at = CASE
                WHEN NEW.status = 'completed' THEN NOW()
                ELSE stage_completed_at
            END,
            updated_at = NOW()
        WHERE task_id = NEW.id AND stage_name = NEW.status;
    END IF;
END$$
DELIMITER ;

-- 自動記錄任務活動
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS log_task_activity_on_status_change
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO task_activities (
            task_id, user_id, activity_type, description, created_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.updated_by, NEW.supplier_id),
            CONCAT('status_changed_to_', NEW.status),
            CONCAT('任務狀態已變更為：', NEW.status),
            NOW()
        );
    END IF;
END$$
DELIMITER ;

-- 創建工作流程視圖
CREATE OR REPLACE VIEW v_task_workflow_overview AS
SELECT
    t.id as task_id,
    t.title,
    t.status,
    t.created_at,
    t.deadline,
    t.budget_min,
    t.budget_max,
    supplier.username as supplier_name,
    supplier.email as supplier_email,
    creator.username as creator_name,
    creator.email as creator_email,
    COUNT(DISTINCT ta.id) as total_applications,
    COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.id END) as pending_applications,
    COUNT(DISTINCT CASE WHEN ta.status = 'accepted' THEN ta.id END) as accepted_applications,
    COUNT(DISTINCT ma.id) as submitted_assets,
    COUNT(DISTINCT CASE WHEN ma.status = 'approved' THEN ma.id END) as approved_assets,
    AVG(tr.rating) as average_rating,
    COUNT(DISTINCT tr.id) as total_ratings,
    MAX(tact.created_at) as last_activity_at
FROM tasks t
LEFT JOIN users supplier ON t.supplier_id = supplier.id
LEFT JOIN users creator ON t.assigned_creator_id = creator.id
LEFT JOIN task_applications ta ON t.id = ta.task_id
LEFT JOIN media_assets ma ON t.id = ma.task_id
LEFT JOIN task_ratings tr ON t.id = tr.task_id
LEFT JOIN task_activities tact ON t.id = tact.task_id
GROUP BY t.id, supplier.id, creator.id;

-- 創建工作流程統計視圖
CREATE OR REPLACE VIEW v_workflow_statistics AS
SELECT
    DATE(t.created_at) as date,
    COUNT(*) as tasks_created,
    COUNT(CASE WHEN t.status = 'open' THEN 1 END) as tasks_opened,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as tasks_in_progress,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed,
    AVG(CASE WHEN t.status = 'completed' THEN DATEDIFF(t.completed_at, t.created_at) END) as avg_completion_days,
    SUM(t.budget_min) as total_budget_allocated
FROM tasks t
WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(t.created_at)
ORDER BY date DESC;

-- 插入預設的任務階段數據（如果表為空）
INSERT IGNORE INTO task_stages (task_id, stage_name, stage_order, progress_percentage)
SELECT
    t.id,
    stage_info.stage_name,
    stage_info.stage_order,
    CASE
        WHEN t.status = stage_info.stage_name THEN
            CASE stage_info.stage_name
                WHEN 'draft' THEN 5
                WHEN 'open' THEN 10
                WHEN 'collecting' THEN 25
                WHEN 'evaluating' THEN 40
                WHEN 'in_progress' THEN 50
                WHEN 'reviewing' THEN 75
                WHEN 'publishing' THEN 90
                WHEN 'completed' THEN 100
                ELSE 0
            END
        ELSE 0
    END
FROM tasks t
CROSS JOIN (
    SELECT 'draft' as stage_name, 1 as stage_order
    UNION SELECT 'open', 2
    UNION SELECT 'collecting', 3
    UNION SELECT 'evaluating', 4
    UNION SELECT 'in_progress', 5
    UNION SELECT 'reviewing', 6
    UNION SELECT 'publishing', 7
    UNION SELECT 'completed', 8
) as stage_info;

-- 創建工作流程效能索引
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_status ON tasks(status, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_creator ON tasks(assigned_creator_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline_status ON tasks(deadline, status);
CREATE INDEX IF NOT EXISTS idx_task_applications_task_status ON task_applications(task_id, status);
CREATE INDEX IF NOT EXISTS idx_media_assets_task_status ON media_assets(task_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_history_task_date ON workflow_state_history(task_id, created_at);

-- 創建工作流程統計函數
DELIMITER $$
CREATE FUNCTION IF NOT EXISTS GetTaskWorkflowProgress(task_id VARCHAR(36))
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE progress DECIMAL(5,2) DEFAULT 0.00;

    SELECT
        CASE status
            WHEN 'draft' THEN 5.00
            WHEN 'open' THEN 10.00
            WHEN 'collecting' THEN 25.00
            WHEN 'evaluating' THEN 40.00
            WHEN 'in_progress' THEN 50.00
            WHEN 'reviewing' THEN 75.00
            WHEN 'publishing' THEN 90.00
            WHEN 'completed' THEN 100.00
            ELSE 0.00
        END INTO progress
    FROM tasks
    WHERE id = task_id;

    RETURN progress;
END$$
DELIMITER ;

-- 創建工作流程完整性檢查程序
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS CheckWorkflowIntegrity()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE task_id VARCHAR(36);
    DECLARE task_status VARCHAR(50);
    DECLARE cur CURSOR FOR SELECT id, status FROM tasks;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- 臨時表存儲檢查結果
    CREATE TEMPORARY TABLE IF NOT EXISTS workflow_check_results (
        task_id VARCHAR(36),
        issue_type VARCHAR(100),
        description TEXT,
        severity ENUM('info', 'warning', 'error')
    );

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO task_id, task_status;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 檢查任務階段是否存在
        IF NOT EXISTS (SELECT 1 FROM task_stages WHERE task_id = task_id) THEN
            INSERT INTO workflow_check_results VALUES (
                task_id, 'missing_stages', '缺少任務階段記錄', 'error'
            );
        END IF;

        -- 檢查已完成任務是否有評分
        IF task_status = 'completed' AND NOT EXISTS (
            SELECT 1 FROM task_ratings WHERE task_id = task_id
        ) THEN
            INSERT INTO workflow_check_results VALUES (
                task_id, 'missing_ratings', '已完成任務缺少評分', 'warning'
            );
        END IF;

        -- 檢查進行中任務是否有指派創作者
        IF task_status = 'in_progress' AND NOT EXISTS (
            SELECT 1 FROM tasks WHERE id = task_id AND assigned_creator_id IS NOT NULL
        ) THEN
            INSERT INTO workflow_check_results VALUES (
                task_id, 'missing_assignment', '進行中任務未指派創作者', 'error'
            );
        END IF;

    END LOOP;
    CLOSE cur;

    -- 返回檢查結果
    SELECT * FROM workflow_check_results ORDER BY severity DESC, task_id;

    DROP TEMPORARY TABLE workflow_check_results;
END$$
DELIMITER ;

-- 創建工作流程數據初始化程序
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS InitializeTaskWorkflow(IN p_task_id VARCHAR(36))
BEGIN
    DECLARE task_exists INT DEFAULT 0;

    -- 檢查任務是否存在
    SELECT COUNT(*) INTO task_exists FROM tasks WHERE id = p_task_id;

    IF task_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '任務不存在';
    END IF;

    -- 創建任務階段
    INSERT IGNORE INTO task_stages (task_id, stage_name, stage_order, progress_percentage) VALUES
    (p_task_id, 'draft', 1, 5),
    (p_task_id, 'open', 2, 0),
    (p_task_id, 'collecting', 3, 0),
    (p_task_id, 'evaluating', 4, 0),
    (p_task_id, 'in_progress', 5, 0),
    (p_task_id, 'reviewing', 6, 0),
    (p_task_id, 'publishing', 7, 0),
    (p_task_id, 'completed', 8, 0);

    -- 記錄初始化活動
    INSERT INTO task_activities (task_id, user_id, activity_type, description)
    SELECT p_task_id, supplier_id, 'workflow_initialized', '工作流程已初始化'
    FROM tasks WHERE id = p_task_id;

END$$
DELIMITER ;

-- 創建清理程序
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS CleanupOldWorkflowData(IN days_old INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 清理舊的活動記錄（保留重要活動）
    DELETE FROM task_activities
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_old DAY)
    AND activity_type NOT IN ('task_created', 'task_published', 'application_accepted', 'task_completed');

    -- 清理舊的工作流程狀態記錄
    DELETE FROM workflow_state_history
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_old DAY);

    -- 清理舊的溝通記錄（保留最近的）
    DELETE tc1 FROM task_communications tc1
    WHERE tc1.created_at < DATE_SUB(NOW(), INTERVAL days_old DAY)
    AND EXISTS (
        SELECT 1 FROM task_communications tc2
        WHERE tc2.task_id = tc1.task_id
        AND tc2.created_at > tc1.created_at
        LIMIT 10
    );

    COMMIT;
END$$
DELIMITER ;
