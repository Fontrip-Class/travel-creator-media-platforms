<?php

namespace App\Services;

use App\Services\DatabaseService;
use App\Services\NotificationService;
use App\Services\AuditService;

class TaskStageService
{
    private DatabaseService $db;
    private NotificationService $notificationService;
    private AuditService $auditService;

    // 任務階段定義
    const STAGES = [
        'draft' => [
            'name' => '草稿',
            'color' => '#6B7280',
            'icon' => '📝',
            'order' => 1,
            'can_edit' => ['supplier'],
            'next_stages' => ['published']
        ],
        'published' => [
            'name' => '已發布',
            'color' => '#3B82F6',
            'icon' => '🚀',
            'order' => 2,
            'can_edit' => ['supplier'],
            'next_stages' => ['collecting']
        ],
        'collecting' => [
            'name' => '徵集中',
            'color' => '#F59E0B',
            'icon' => '🔍',
            'order' => 3,
            'can_edit' => ['supplier'],
            'next_stages' => ['evaluating', 'cancelled']
        ],
        'evaluating' => [
            'name' => '評估中',
            'color' => '#8B5CF6',
            'icon' => '📊',
            'order' => 4,
            'can_edit' => ['supplier'],
            'next_stages' => ['in_progress', 'cancelled']
        ],
        'in_progress' => [
            'name' => '創作中',
            'color' => '#10B981',
            'icon' => '🎨',
            'order' => 5,
            'can_edit' => ['creator', 'supplier'],
            'next_stages' => ['reviewing', 'cancelled']
        ],
        'reviewing' => [
            'name' => '審核中',
            'color' => '#EF4444',
            'icon' => '📋',
            'order' => 6,
            'can_edit' => ['supplier'],
            'next_stages' => ['publishing', 'revision_required']
        ],
        'revision_required' => [
            'name' => '需要修改',
            'color' => '#F97316',
            'icon' => '🔄',
            'order' => 7,
            'can_edit' => ['creator'],
            'next_stages' => ['in_progress']
        ],
        'publishing' => [
            'name' => '發布中',
            'color' => '#06B6D4',
            'icon' => '📡',
            'order' => 8,
            'can_edit' => ['media', 'supplier'],
            'next_stages' => ['completed']
        ],
        'completed' => [
            'name' => '已完成',
            'color' => '#059669',
            'icon' => '🏁',
            'order' => 9,
            'can_edit' => ['supplier'],
            'next_stages' => []
        ],
        'cancelled' => [
            'name' => '已取消',
            'color' => '#6B7280',
            'icon' => '❌',
            'order' => 0,
            'can_edit' => ['supplier'],
            'next_stages' => []
        ]
    ];

    public function __construct(
        DatabaseService $db,
        NotificationService $notificationService,
        AuditService $auditService
    ) {
        $this->db = $db;
        $this->notificationService = $notificationService;
        $this->auditService = $auditService;
    }

    /**
     * 獲取任務階段配置
     */
    public function getStageConfig(string $stage): ?array
    {
        return self::STAGES[$stage] ?? null;
    }

    /**
     * 獲取所有階段配置
     */
    public function getAllStages(): array
    {
        return self::STAGES;
    }

    /**
     * 檢查是否可以轉換到指定階段
     */
    public function canTransitionTo(string $currentStage, string $targetStage): bool
    {
        $currentConfig = $this->getStageConfig($currentStage);
        if (!$currentConfig) {
            return false;
        }

        return in_array($targetStage, $currentConfig['next_stages']);
    }

    /**
     * 轉換任務階段
     */
    public function transitionTask(string $taskId, string $newStage, string $userId, ?string $reason = null): array
    {
        try {
            // 獲取當前任務信息
            $task = $this->db->fetchOne(
                'SELECT * FROM tasks WHERE id = :task_id',
                ['task_id' => $taskId]
            );

            if (!$task) {
                throw new \Exception('任務不存在');
            }

            $currentStage = $task['status'];
            
            // 檢查是否可以轉換
            if (!$this->canTransitionTo($currentStage, $newStage)) {
                throw new \Exception("無法從 {$currentStage} 轉換到 {$newStage}");
            }

            // 開始事務
            $this->db->beginTransaction();

            // 更新任務狀態
            $this->db->update('tasks', 
                ['id' => $taskId],
                [
                    'status' => $newStage,
                    'updated_at' => date('Y-m-d H:i:s')
                ]
            );

            // 記錄階段變更歷史
            $this->db->insert('task_stage_history', [
                'task_id' => $taskId,
                'from_stage' => $currentStage,
                'to_stage' => $newStage,
                'changed_by' => $userId,
                'reason' => $reason,
                'changed_at' => date('Y-m-d H:i:s')
            ]);

            // 記錄審計日誌
            $this->auditService->log(
                $userId,
                'task_stage_changed',
                'tasks',
                $taskId,
                ['status' => $currentStage],
                ['status' => $newStage]
            );

            // 發送通知
            $this->sendStageTransitionNotifications($task, $currentStage, $newStage);

            $this->db->commit();

            return [
                'success' => true,
                'message' => "任務階段已從 {$currentStage} 轉換到 {$newStage}",
                'old_stage' => $currentStage,
                'new_stage' => $newStage
            ];

        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 發送階段轉換通知
     */
    private function sendStageTransitionNotifications(array $task, string $oldStage, string $newStage): void
    {
        $stageConfig = $this->getStageConfig($newStage);
        if (!$stageConfig) {
            return;
        }

        switch ($newStage) {
            case 'collecting':
                // 通知創作者有新任務
                $this->notifyCreatorsForNewTask($task);
                break;
            
            case 'evaluating':
                // 通知供應商有提案需要評估
                $this->notifySupplierForProposals($task);
                break;
            
            case 'in_progress':
                // 通知選中的創作者開始創作
                $this->notifyCreatorToStartWork($task);
                break;
            
            case 'reviewing':
                // 通知供應商審核內容
                $this->notifySupplierForReview($task);
                break;
            
            case 'publishing':
                // 通知媒體通路準備發布
                $this->notifyMediaForPublishing($task);
                break;
        }
    }

    /**
     * 獲取任務進度信息
     */
    public function getTaskProgress(string $taskId): array
    {
        $task = $this->db->fetchOne(
            'SELECT * FROM tasks WHERE id = :task_id',
            ['task_id' => $taskId]
        );

        if (!$task) {
            throw new \Exception('任務不存在');
        }

        $currentStage = $task['status'];
        $stageConfig = $this->getStageConfig($currentStage);
        
        // 計算進度百分比
        $totalStages = count(self::STAGES) - 2; // 排除 cancelled 和 draft
        $currentOrder = $stageConfig['order'] ?? 0;
        $progress = ($currentOrder / $totalStages) * 100;

        // 獲取階段歷史
        $stageHistory = $this->db->fetchAll(
            'SELECT * FROM task_stage_history WHERE task_id = :task_id ORDER BY changed_at ASC',
            ['task_id' => $taskId]
        );

        return [
            'current_stage' => $currentStage,
            'stage_config' => $stageConfig,
            'progress_percentage' => round($progress, 1),
            'current_order' => $currentOrder,
            'total_stages' => $totalStages,
            'stage_history' => $stageHistory,
            'estimated_completion' => $this->estimateCompletionDate($task),
            'next_possible_stages' => $stageConfig['next_stages'] ?? []
        ];
    }

    /**
     * 獲取用戶在特定階段的任務
     */
    public function getTasksByStage(string $userId, string $role, string $stage): array
    {
        $query = 'SELECT t.*, ts.progress_percentage, ts.current_stage 
                  FROM tasks t 
                  LEFT JOIN task_stages ts ON t.id = ts.task_id 
                  WHERE t.status = :stage';

        $params = ['stage' => $stage];

        // 根據角色過濾
        switch ($role) {
            case 'supplier':
                $query .= ' AND t.supplier_id = :user_id';
                $params['user_id'] = $userId;
                break;
            case 'creator':
                $query .= ' AND EXISTS (SELECT 1 FROM task_applications ta WHERE ta.task_id = t.id AND ta.creator_id = :user_id)';
                $params['user_id'] = $userId;
                break;
            case 'media':
                $query .= ' AND t.status IN ("publishing", "completed")';
                break;
        }

        $query .= ' ORDER BY t.updated_at DESC';

        return $this->db->fetchAll($query, $params);
    }

    /**
     * 獲取任務儀表板數據
     */
    public function getTaskDashboard(string $userId, string $role): array
    {
        $dashboard = [
            'total_tasks' => 0,
            'active_tasks' => 0,
            'completed_tasks' => 0,
            'pending_actions' => 0,
            'stage_breakdown' => [],
            'recent_activities' => [],
            'quick_actions' => []
        ];

        // 根據角色獲取不同的統計數據
        switch ($role) {
            case 'supplier':
                $dashboard = $this->getSupplierDashboard($userId);
                break;
            case 'creator':
                $dashboard = $this->getCreatorDashboard($userId);
                break;
            case 'media':
                $dashboard = $this->getMediaDashboard($userId);
                break;
        }

        return $dashboard;
    }

    /**
     * 供應商儀表板
     */
    private function getSupplierDashboard(string $userId): array
    {
        $stats = $this->db->fetchOne(
            'SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status IN ("collecting", "evaluating", "in_progress", "reviewing") THEN 1 ELSE 0 END) as active_tasks,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = "reviewing" THEN 1 ELSE 0 END) as pending_reviews
            FROM tasks 
            WHERE supplier_id = :user_id',
            ['user_id' => $userId]
        );

        $stageBreakdown = $this->db->fetchAll(
            'SELECT status, COUNT(*) as count 
             FROM tasks 
             WHERE supplier_id = :user_id 
             GROUP BY status',
            ['user_id' => $userId]
        );

        return [
            'total_tasks' => $stats['total_tasks'] ?? 0,
            'active_tasks' => $stats['active_tasks'] ?? 0,
            'completed_tasks' => $stats['completed_tasks'] ?? 0,
            'pending_actions' => $stats['pending_reviews'] ?? 0,
            'stage_breakdown' => $stageBreakdown,
            'recent_activities' => $this->getRecentActivities($userId, 'supplier'),
            'quick_actions' => [
                ['action' => 'create_task', 'label' => '發布新任務', 'icon' => '➕'],
                ['action' => 'review_proposals', 'label' => '審核提案', 'icon' => '📋'],
                ['action' => 'review_content', 'label' => '審核內容', 'icon' => '✅']
            ]
        ];
    }

    /**
     * 創作者儀表板
     */
    private function getCreatorDashboard(string $userId): array
    {
        $stats = $this->db->fetchOne(
            'SELECT 
                COUNT(DISTINCT ta.task_id) as total_applications,
                SUM(CASE WHEN t.status = "in_progress" THEN 1 ELSE 0 END) as active_tasks,
                SUM(CASE WHEN t.status = "completed" THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN ta.status = "pending" THEN 1 ELSE 0 END) as pending_applications
            FROM task_applications ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.creator_id = :user_id',
            ['user_id' => $userId]
        );

        return [
            'total_tasks' => $stats['total_applications'] ?? 0,
            'active_tasks' => $stats['active_tasks'] ?? 0,
            'completed_tasks' => $stats['completed_tasks'] ?? 0,
            'pending_actions' => $stats['pending_applications'] ?? 0,
            'stage_breakdown' => $this->getCreatorStageBreakdown($userId),
            'recent_activities' => $this->getRecentActivities($userId, 'creator'),
            'quick_actions' => [
                ['action' => 'browse_tasks', 'label' => '瀏覽任務', 'icon' => '🔍'],
                ['action' => 'submit_proposal', 'label' => '提交提案', 'icon' => '📝'],
                ['action' => 'upload_content', 'label' => '上傳內容', 'icon' => '📤']
            ]
        ];
    }

    /**
     * 媒體儀表板
     */
    private function getMediaDashboard(string $userId): array
    {
        $stats = $this->db->fetchOne(
            'SELECT 
                COUNT(*) as total_published,
                SUM(CASE WHEN status = "publishing" THEN 1 ELSE 0 END) as active_publishing,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_publishing
            FROM tasks 
            WHERE status IN ("publishing", "completed")',
            []
        );

        return [
            'total_tasks' => $stats['total_published'] ?? 0,
            'active_tasks' => $stats['active_publishing'] ?? 0,
            'completed_tasks' => $stats['completed_publishing'] ?? 0,
            'pending_actions' => 0,
            'stage_breakdown' => $this->getMediaStageBreakdown(),
            'recent_activities' => $this->getRecentActivities($userId, 'media'),
            'quick_actions' => [
                ['action' => 'download_assets', 'label' => '下載素材', 'icon' => '⬇️'],
                ['action' => 'publish_content', 'label' => '發布內容', 'icon' => '📡'],
                ['action' => 'track_performance', 'label' => '追蹤效果', 'icon' => '📊']
            ]
        ];
    }

    /**
     * 獲取最近活動
     */
    private function getRecentActivities(string $userId, string $role): array
    {
        $query = 'SELECT * FROM task_activities 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC 
                  LIMIT 10';
        
        return $this->db->fetchAll($query, ['user_id' => $userId]);
    }

    /**
     * 估算完成日期
     */
    private function estimateCompletionDate(array $task): ?string
    {
        if ($task['deadline']) {
            return $task['deadline'];
        }

        // 根據當前階段估算剩餘時間
        $stageEstimates = [
            'draft' => 0,
            'published' => 7,
            'collecting' => 7,
            'evaluating' => 3,
            'in_progress' => 14,
            'reviewing' => 3,
            'publishing' => 7
        ];

        $currentStage = $task['status'];
        $remainingDays = $stageEstimates[$currentStage] ?? 0;

        if ($remainingDays > 0) {
            return date('Y-m-d', strtotime("+{$remainingDays} days"));
        }

        return null;
    }

    /**
     * 獲取創作者階段分解
     */
    private function getCreatorStageBreakdown(string $userId): array
    {
        return $this->db->fetchAll(
            'SELECT t.status, COUNT(*) as count 
             FROM task_applications ta
             JOIN tasks t ON ta.task_id = t.id
             WHERE ta.creator_id = :user_id 
             GROUP BY t.status',
            ['user_id' => $userId]
        );
    }

    /**
     * 獲取媒體階段分解
     */
    private function getMediaStageBreakdown(): array
    {
        return $this->db->fetchAll(
            'SELECT status, COUNT(*) as count 
             FROM tasks 
             WHERE status IN ("publishing", "completed") 
             GROUP BY status'
        );
    }

    /**
     * 檢查任務是否逾期
     */
    public function checkTaskDeadline(string $taskId): array
    {
        $task = $this->db->fetchOne(
            'SELECT * FROM tasks WHERE id = :task_id',
            ['task_id' => $taskId]
        );

        if (!$task || !$task['deadline']) {
            return ['is_overdue' => false, 'days_remaining' => null];
        }

        $deadline = new \DateTime($task['deadline']);
        $now = new \DateTime();
        $diff = $now->diff($deadline);

        $isOverdue = $now > $deadline;
        $daysRemaining = $isOverdue ? -$diff->days : $diff->days;

        return [
            'is_overdue' => $isOverdue,
            'days_remaining' => $daysRemaining,
            'deadline' => $task['deadline']
        ];
    }
}
