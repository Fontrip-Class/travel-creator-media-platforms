<?php

namespace App\Services;

use Exception;

/**
 * 工作流程服務
 * 管理從任務創建到結案的完整業務流程
 */
class WorkflowService
{
    private DatabaseService $db;
    private NotificationService $notificationService;
    private PermissionService $permissionService;

    public function __construct(
        DatabaseService $db,
        NotificationService $notificationService,
        PermissionService $permissionService
    ) {
        $this->db = $db;
        $this->notificationService = $notificationService;
        $this->permissionService = $permissionService;
    }

    /**
     * 步驟1: 供應商創建任務
     */
    public function createMarketingTask(string $supplierId, array $taskData): string
    {
        // 驗證供應商權限
        if (!$this->permissionService->hasPermission($supplierId, 'task', 'create')) {
            throw new Exception('無權限創建任務');
        }

        $this->db->beginTransaction();

        try {
            // 創建任務
            $taskData['supplier_id'] = $supplierId;
            $taskData['status'] = 'draft';
            $taskData['created_at'] = date('Y-m-d H:i:s');
            $taskData['updated_at'] = date('Y-m-d H:i:s');

            $taskId = $this->db->insert('tasks', $taskData);

            // 創建任務階段記錄
            $this->createTaskStages($taskId);

            // 記錄任務活動
            $this->logTaskActivity($taskId, $supplierId, 'task_created', '任務已創建');

            $this->db->commit();

            return $taskId;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 步驟2: 發布任務（開放申請）
     */
    public function publishTask(string $taskId, string $supplierId): bool
    {
        // 權限檢查
        if (!$this->isTaskOwner($supplierId, $taskId)) {
            throw new Exception('無權限發布此任務');
        }

        $this->db->beginTransaction();

        try {
            // 更新任務狀態
            $this->db->update('tasks', [
                'status' => 'open',
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $taskId]);

            // 更新任務階段
            $this->updateTaskStage($taskId, 'open', 10);

            // 記錄活動
            $this->logTaskActivity($taskId, $supplierId, 'task_published', '任務已發布，開放申請');

            // 通知相關創作者
            $this->notifyMatchingCreators($taskId);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 步驟3: 創作者申請任務
     */
    public function submitApplication(string $taskId, string $creatorId, array $applicationData): string
    {
        // 檢查任務狀態
        $task = $this->db->fetchOne('SELECT * FROM tasks WHERE id = :id', ['id' => $taskId]);
        if (!$task || !in_array($task['status'], ['open', 'collecting'])) {
            throw new Exception('任務不接受申請');
        }

        // 檢查是否已申請過
        if ($this->db->exists('task_applications', 'task_id = :task_id AND creator_id = :creator_id', [
            'task_id' => $taskId, 'creator_id' => $creatorId
        ])) {
            throw new Exception('您已經申請過此任務');
        }

        $this->db->beginTransaction();

        try {
            // 創建申請記錄
            $applicationData['task_id'] = $taskId;
            $applicationData['creator_id'] = $creatorId;
            $applicationData['status'] = 'pending';
            $applicationData['created_at'] = date('Y-m-d H:i:s');

            $applicationId = $this->db->insert('task_applications', $applicationData);

            // 更新任務申請計數
            $this->db->query(
                'UPDATE tasks SET applications_count = applications_count + 1 WHERE id = :id',
                ['id' => $taskId]
            );

            // 如果是第一個申請，更新任務狀態為收集中
            $applicationCount = $this->db->fetchColumn(
                'SELECT COUNT(*) FROM task_applications WHERE task_id = :task_id',
                ['task_id' => $taskId]
            );

            if ($applicationCount == 1) {
                $this->db->update('tasks', [
                    'status' => 'collecting',
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'id = :id', ['id' => $taskId]);

                $this->updateTaskStage($taskId, 'collecting', 25);
            }

            // 記錄活動
            $this->logTaskActivity($taskId, $creatorId, 'application_submitted', '創作者提交申請');

            // 通知供應商
            $this->notificationService->createNotification(
                $task['supplier_id'],
                'new_application',
                "您的任務「{$task['title']}」收到新的申請",
                ['task_id' => $taskId, 'application_id' => $applicationId, 'creator_id' => $creatorId]
            );

            $this->db->commit();
            return $applicationId;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 步驟4: 供應商審核申請
     */
    public function reviewApplication(string $applicationId, string $supplierId, string $decision, ?string $notes = null): bool
    {
        // 獲取申請資訊
        $application = $this->db->fetchOne(
            'SELECT ta.*, t.supplier_id, t.title as task_title
             FROM task_applications ta
             JOIN tasks t ON ta.task_id = t.id
             WHERE ta.id = :id',
            ['id' => $applicationId]
        );

        if (!$application) {
            throw new Exception('申請不存在');
        }

        // 權限檢查
        if ($application['supplier_id'] !== $supplierId) {
            throw new Exception('無權限審核此申請');
        }

        if (!in_array($decision, ['accepted', 'rejected'])) {
            throw new Exception('無效的審核決定');
        }

        $this->db->beginTransaction();

        try {
            // 更新申請狀態
            $this->db->update('task_applications', [
                'status' => $decision,
                'supplier_notes' => $notes,
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $applicationId]);

            if ($decision === 'accepted') {
                // 接受申請：更新任務狀態為進行中
                $this->db->update('tasks', [
                    'status' => 'in_progress',
                    'assigned_creator_id' => $application['creator_id'],
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'id = :id', ['id' => $application['task_id']]);

                // 更新任務階段
                $this->updateTaskStage($application['task_id'], 'in_progress', 50);

                // 拒絕其他申請
                $this->db->update('task_applications', [
                    'status' => 'rejected',
                    'supplier_notes' => '任務已分配給其他創作者',
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'task_id = :task_id AND id != :application_id AND status = :status', [
                    'task_id' => $application['task_id'],
                    'application_id' => $applicationId,
                    'status' => 'pending'
                ]);

                // 記錄活動
                $this->logTaskActivity($application['task_id'], $supplierId, 'application_accepted', '申請已接受，任務開始執行');

                // 通知創作者
                $this->notificationService->createNotification(
                    $application['creator_id'],
                    'application_accepted',
                    "恭喜！您的申請「{$application['task_title']}」已被接受",
                    ['task_id' => $application['task_id'], 'application_id' => $applicationId]
                );

            } else {
                // 拒絕申請
                $this->logTaskActivity($application['task_id'], $supplierId, 'application_rejected', '申請已拒絕');

                // 通知創作者
                $this->notificationService->createNotification(
                    $application['creator_id'],
                    'application_rejected',
                    "很抱歉，您的申請「{$application['task_title']}」未被接受",
                    ['task_id' => $application['task_id'], 'reason' => $notes]
                );
            }

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 步驟5: 創作者提交作品
     */
    public function submitWork(string $taskId, string $creatorId, array $workData): string
    {
        // 檢查任務狀態和權限
        $task = $this->db->fetchOne(
            'SELECT * FROM tasks WHERE id = :id AND assigned_creator_id = :creator_id AND status = :status',
            ['id' => $taskId, 'creator_id' => $creatorId, 'status' => 'in_progress']
        );

        if (!$task) {
            throw new Exception('無權限提交作品或任務狀態不正確');
        }

        $this->db->beginTransaction();

        try {
            // 創建媒體資源記錄
            $assetData = [
                'task_id' => $taskId,
                'creator_id' => $creatorId,
                'title' => $workData['title'],
                'description' => $workData['description'] ?? '',
                'asset_type' => $workData['asset_type'],
                'file_url' => $workData['file_url'],
                'thumbnail_url' => $workData['thumbnail_url'] ?? '',
                'file_size' => $workData['file_size'] ?? 0,
                'tags' => json_encode($workData['tags'] ?? []),
                'status' => 'pending_review',
                'created_at' => date('Y-m-d H:i:s')
            ];

            $assetId = $this->db->insert('media_assets', $assetData);

            // 更新任務狀態為審核中
            $this->db->update('tasks', [
                'status' => 'reviewing',
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $taskId]);

            // 更新任務階段
            $this->updateTaskStage($taskId, 'reviewing', 75);

            // 記錄活動
            $this->logTaskActivity($taskId, $creatorId, 'work_submitted', '創作者已提交作品');

            // 通知供應商
            $this->notificationService->createNotification(
                $task['supplier_id'],
                'work_submitted',
                "創作者已提交「{$task['title']}」的作品，請審核",
                ['task_id' => $taskId, 'asset_id' => $assetId]
            );

            $this->db->commit();
            return $assetId;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 步驟6: 供應商審核作品
     */
    public function reviewWork(string $taskId, string $supplierId, string $assetId, string $decision, ?string $feedback = null): bool
    {
        // 權限檢查
        if (!$this->isTaskOwner($supplierId, $taskId)) {
            throw new Exception('無權限審核此作品');
        }

        $task = $this->db->fetchOne('SELECT * FROM tasks WHERE id = :id', ['id' => $taskId]);
        $asset = $this->db->fetchOne('SELECT * FROM media_assets WHERE id = :id AND task_id = :task_id', [
            'id' => $assetId, 'task_id' => $taskId
        ]);

        if (!$task || !$asset) {
            throw new Exception('任務或作品不存在');
        }

        $this->db->beginTransaction();

        try {
            if ($decision === 'approved') {
                // 批准作品
                $this->db->update('media_assets', [
                    'status' => 'approved',
                    'approval_notes' => $feedback,
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'id = :id', ['id' => $assetId]);

                // 更新任務狀態為發布中
                $this->db->update('tasks', [
                    'status' => 'publishing',
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'id = :id', ['id' => $taskId]);

                $this->updateTaskStage($taskId, 'publishing', 90);

                // 記錄活動
                $this->logTaskActivity($taskId, $supplierId, 'work_approved', '作品已批准');

                // 通知創作者
                $this->notificationService->createNotification(
                    $asset['creator_id'],
                    'work_approved',
                    "您的作品「{$task['title']}」已通過審核！",
                    ['task_id' => $taskId, 'asset_id' => $assetId]
                );

                // 通知媒體平台
                $this->notifyMediaPlatforms($taskId, $assetId);

            } else {
                // 要求修改
                $this->db->update('media_assets', [
                    'status' => 'revision_required',
                    'approval_notes' => $feedback,
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'id = :id', ['id' => $assetId]);

                // 任務狀態回到進行中
                $this->db->update('tasks', [
                    'status' => 'in_progress',
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'id = :id', ['id' => $taskId]);

                $this->updateTaskStage($taskId, 'in_progress', 60);

                // 記錄活動
                $this->logTaskActivity($taskId, $supplierId, 'revision_requested', '要求修改作品');

                // 通知創作者
                $this->notificationService->createNotification(
                    $asset['creator_id'],
                    'revision_requested',
                    "您的作品「{$task['title']}」需要修改",
                    ['task_id' => $taskId, 'asset_id' => $assetId, 'feedback' => $feedback]
                );
            }

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 步驟7: 完成任務
     */
    public function completeTask(string $taskId, string $userId): bool
    {
        $task = $this->db->fetchOne('SELECT * FROM tasks WHERE id = :id', ['id' => $taskId]);
        if (!$task) {
            throw new Exception('任務不存在');
        }

        // 檢查權限（供應商或創作者都可以標記完成）
        $canComplete = $task['supplier_id'] === $userId || $task['assigned_creator_id'] === $userId;
        if (!$canComplete) {
            throw new Exception('無權限完成此任務');
        }

        $this->db->beginTransaction();

        try {
            // 更新任務狀態
            $this->db->update('tasks', [
                'status' => 'completed',
                'completed_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $taskId]);

            // 更新任務階段
            $this->updateTaskStage($taskId, 'completed', 100);

            // 記錄活動
            $this->logTaskActivity($taskId, $userId, 'task_completed', '任務已完成');

            // 更新用戶統計
            $this->updateUserTaskStats($task['supplier_id'], $task['assigned_creator_id']);

            // 通知相關用戶
            $this->notifyTaskCompletion($taskId, $task);

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 步驟8: 評分系統
     */
    public function submitRating(string $taskId, string $fromUserId, string $toUserId, float $rating, ?string $comment = null): string
    {
        // 驗證評分範圍
        if ($rating < 1 || $rating > 5) {
            throw new Exception('評分必須在1-5之間');
        }

        // 檢查是否已評分過
        if ($this->db->exists('task_ratings',
            'task_id = :task_id AND from_user_id = :from_user_id AND to_user_id = :to_user_id', [
            'task_id' => $taskId, 'from_user_id' => $fromUserId, 'to_user_id' => $toUserId
        ])) {
            throw new Exception('您已經評分過了');
        }

        $ratingData = [
            'task_id' => $taskId,
            'from_user_id' => $fromUserId,
            'to_user_id' => $toUserId,
            'rating' => $rating,
            'comment' => $comment,
            'rating_type' => 'task_completion',
            'created_at' => date('Y-m-d H:i:s')
        ];

        $ratingId = $this->db->insert('task_ratings', $ratingData);

        // 更新用戶平均評分
        $this->updateUserRating($toUserId);

        // 記錄活動
        $this->logTaskActivity($taskId, $fromUserId, 'rating_submitted', "給用戶評分: {$rating}星");

        return $ratingId;
    }

    /**
     * 獲取任務完整流程狀態
     */
    public function getTaskWorkflowStatus(string $taskId): array
    {
        // 獲取任務基本資訊
        $task = $this->db->fetchOne(
            'SELECT t.*, u.username as supplier_name, c.username as creator_name
             FROM tasks t
             LEFT JOIN users u ON t.supplier_id = u.id
             LEFT JOIN users c ON t.assigned_creator_id = c.id
             WHERE t.id = :id',
            ['id' => $taskId]
        );

        if (!$task) {
            return [];
        }

        // 獲取任務階段
        $stages = $this->db->fetchAll(
            'SELECT * FROM task_stages WHERE task_id = :task_id ORDER BY stage_order',
            ['task_id' => $taskId]
        );

        // 獲取申請列表
        $applications = $this->db->fetchAll(
            'SELECT ta.*, u.username as creator_name, u.avatar_url as creator_avatar
             FROM task_applications ta
             JOIN users u ON ta.creator_id = u.id
             WHERE ta.task_id = :task_id
             ORDER BY ta.created_at DESC',
            ['task_id' => $taskId]
        );

        // 獲取作品列表
        $assets = $this->db->fetchAll(
            'SELECT * FROM media_assets WHERE task_id = :task_id ORDER BY created_at DESC',
            ['task_id' => $taskId]
        );

        // 獲取活動記錄
        $activities = $this->db->fetchAll(
            'SELECT ta.*, u.username as user_name
             FROM task_activities ta
             JOIN users u ON ta.user_id = u.id
             WHERE ta.task_id = :task_id
             ORDER BY ta.created_at DESC
             LIMIT 20',
            ['task_id' => $taskId]
        );

        // 獲取評分
        $ratings = $this->db->fetchAll(
            'SELECT tr.*, fu.username as from_user_name, tu.username as to_user_name
             FROM task_ratings tr
             JOIN users fu ON tr.from_user_id = fu.id
             JOIN users tu ON tr.to_user_id = tu.id
             WHERE tr.task_id = :task_id',
            ['task_id' => $taskId]
        );

        return [
            'task' => $task,
            'stages' => $stages,
            'applications' => $applications,
            'assets' => $assets,
            'activities' => $activities,
            'ratings' => $ratings
        ];
    }

    // ==================== 輔助方法 ====================

    /**
     * 創建任務階段
     */
    private function createTaskStages(string $taskId): void
    {
        $stages = [
            ['stage_name' => 'draft', 'stage_order' => 1, 'progress_percentage' => 0],
            ['stage_name' => 'open', 'stage_order' => 2, 'progress_percentage' => 0],
            ['stage_name' => 'collecting', 'stage_order' => 3, 'progress_percentage' => 0],
            ['stage_name' => 'in_progress', 'stage_order' => 4, 'progress_percentage' => 0],
            ['stage_name' => 'reviewing', 'stage_order' => 5, 'progress_percentage' => 0],
            ['stage_name' => 'publishing', 'stage_order' => 6, 'progress_percentage' => 0],
            ['stage_name' => 'completed', 'stage_order' => 7, 'progress_percentage' => 0]
        ];

        foreach ($stages as $stage) {
            $stage['task_id'] = $taskId;
            $stage['created_at'] = date('Y-m-d H:i:s');
            $this->db->insert('task_stages', $stage);
        }
    }

    /**
     * 更新任務階段
     */
    private function updateTaskStage(string $taskId, string $stageName, float $percentage): void
    {
        $this->db->update('task_stages', [
            'progress_percentage' => $percentage,
            'stage_completed_at' => $percentage >= 100 ? date('Y-m-d H:i:s') : null,
            'updated_at' => date('Y-m-d H:i:s')
        ], 'task_id = :task_id AND stage_name = :stage_name', [
            'task_id' => $taskId,
            'stage_name' => $stageName
        ]);
    }

    /**
     * 記錄任務活動
     */
    private function logTaskActivity(string $taskId, string $userId, string $activityType, string $description): void
    {
        $activityData = [
            'task_id' => $taskId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'description' => $description,
            'created_at' => date('Y-m-d H:i:s')
        ];

        $this->db->insert('task_activities', $activityData);
    }

    /**
     * 檢查是否是任務擁有者
     */
    private function isTaskOwner(string $userId, string $taskId): bool
    {
        return $this->db->exists('tasks', 'id = :task_id AND supplier_id = :user_id', [
            'task_id' => $taskId, 'user_id' => $userId
        ]);
    }

    /**
     * 通知匹配的創作者
     */
    private function notifyMatchingCreators(string $taskId): void
    {
        // 獲取任務資訊
        $task = $this->db->fetchOne('SELECT * FROM tasks WHERE id = :id', ['id' => $taskId]);

        // 找到匹配的創作者（簡化版）
        $creators = $this->db->fetchAll(
            'SELECT id FROM users WHERE role = :role AND is_active = TRUE LIMIT 10',
            ['role' => 'creator']
        );

        foreach ($creators as $creator) {
            $this->notificationService->createNotification(
                $creator['id'],
                'new_task_available',
                "有新的任務可能適合您：{$task['title']}",
                ['task_id' => $taskId]
            );
        }
    }

    /**
     * 通知媒體平台
     */
    private function notifyMediaPlatforms(string $taskId, string $assetId): void
    {
        $mediaUsers = $this->db->fetchAll(
            'SELECT id FROM users WHERE role = :role AND is_active = TRUE',
            ['role' => 'media']
        );

        $task = $this->db->fetchOne('SELECT title FROM tasks WHERE id = :id', ['id' => $taskId]);

        foreach ($mediaUsers as $mediaUser) {
            $this->notificationService->createNotification(
                $mediaUser['id'],
                'new_content_available',
                "有新的內容可供發布：{$task['title']}",
                ['task_id' => $taskId, 'asset_id' => $assetId]
            );
        }
    }

    /**
     * 通知任務完成
     */
    private function notifyTaskCompletion(string $taskId, array $task): void
    {
        // 通知供應商
        $this->notificationService->createNotification(
            $task['supplier_id'],
            'task_completed',
            "任務「{$task['title']}」已完成，請進行評分",
            ['task_id' => $taskId]
        );

        // 通知創作者
        if ($task['assigned_creator_id']) {
            $this->notificationService->createNotification(
                $task['assigned_creator_id'],
                'task_completed',
                "任務「{$task['title']}」已完成，請進行評分",
                ['task_id' => $taskId]
            );
        }
    }

    /**
     * 更新用戶任務統計
     */
    private function updateUserTaskStats(string $supplierId, ?string $creatorId): void
    {
        // 更新供應商統計
        $this->db->query(
            "UPDATE users SET completed_tasks = completed_tasks + 1, updated_at = datetime('now') WHERE id = :id",
            ['id' => $supplierId]
        );

        // 更新創作者統計
        if ($creatorId) {
            $this->db->query(
                "UPDATE users SET completed_tasks = completed_tasks + 1, updated_at = datetime('now') WHERE id = :id",
                ['id' => $creatorId]
            );
        }
    }

    /**
     * 更新用戶評分
     */
    private function updateUserRating(string $userId): void
    {
        $avgRating = $this->db->fetchColumn(
            'SELECT AVG(rating) FROM task_ratings WHERE to_user_id = :user_id',
            ['user_id' => $userId]
        );

        if ($avgRating !== null) {
            $this->db->update('users', [
                'rating' => round($avgRating, 2),
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $userId]);
        }
    }
}
