<?php

namespace App\Services;

/**
 * 任務管理服務 - 優化版
 * 整合用戶權限檢查，提供完整的任務管理功能
 */
class TaskService
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

    public function createTask(array $taskData): string
    {
        // 驗證任務資料
        $this->validateTaskData($taskData);

        // 設置預設值
        $taskData['status'] = 'open';
        $taskData['created_at'] = date('Y-m-d H:i:s');

        // 計算過期時間
        if (isset($taskData['deadline'])) {
            $taskData['expires_at'] = date('Y-m-d H:i:s', strtotime($taskData['deadline']));
        }

        // 插入任務
        $taskId = $this->db->insert('tasks', $taskData);

        // 通知相關創作者
        $this->notifyRelevantCreators($taskId, $taskData);

        return $taskId;
    }

    /**
     * 獲取任務列表（優化版 - 包含用戶資訊和權限檢查）
     */
    public function getTasks(array $filters = [], int $page = 1, int $limit = 20, ?string $requestUserId = null): array
    {
        $offset = ($page - 1) * $limit;
        $whereConditions = ['t.id IS NOT NULL'];
        $params = ['limit' => $limit, 'offset' => $offset];

        // 根據用戶角色調整可見性
        if ($requestUserId) {
            $user = $this->db->fetchOne('SELECT role FROM users WHERE id = :id', ['id' => $requestUserId]);
            if ($user && $user['role'] !== 'admin') {
                // 非管理員只能看到公開任務或自己相關的任務
                $whereConditions[] = "(t.status IN ('open', 'collecting') OR t.supplier_id = :request_user_id OR
                                     EXISTS(SELECT 1 FROM task_applications ta WHERE ta.task_id = t.id AND ta.creator_id = :request_user_id))";
                $params['request_user_id'] = $requestUserId;
            }
        } else {
            // 未登入用戶只能看到公開任務
            $whereConditions[] = "t.status IN ('open', 'collecting')";
        }

        // 狀態篩選
        if (!empty($filters['status'])) {
            $whereConditions[] = 't.status = :status';
            $params['status'] = $filters['status'];
        }

        // 內容類型篩選
        if (!empty($filters['content_type'])) {
            $whereConditions[] = 't.content_type LIKE :content_type';
            $params['content_type'] = '%' . $filters['content_type'] . '%';
        }

        // 預算範圍篩選
        if (!empty($filters['budget_min'])) {
            $whereConditions[] = 't.budget_max >= :budget_min';
            $params['budget_min'] = $filters['budget_min'];
        }

        if (!empty($filters['budget_max'])) {
            $whereConditions[] = 't.budget_min <= :budget_max';
            $params['budget_max'] = $filters['budget_max'];
        }

        // 搜尋篩選
        if (!empty($filters['search'])) {
            $whereConditions[] = "(t.title LIKE :search OR t.description LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }

        // 供應商篩選
        if (!empty($filters['supplier_id'])) {
            $whereConditions[] = 't.supplier_id = :supplier_id';
            $params['supplier_id'] = $filters['supplier_id'];
        }

        $whereClause = implode(' AND ', $whereConditions);

        // 主查詢 - 包含用戶資訊
        $sql = "SELECT
                    t.*,
                    u.username as supplier_name,
                    u.email as supplier_email,
                    u.avatar_url as supplier_avatar,
                    (SELECT COUNT(*) FROM task_applications ta WHERE ta.task_id = t.id) as applications_count,
                    (SELECT COUNT(*) FROM media_assets ma WHERE ma.task_id = t.id) as assets_count
                FROM tasks t
                LEFT JOIN users u ON t.supplier_id = u.id
                WHERE {$whereClause}
                ORDER BY t.created_at DESC
                LIMIT :limit OFFSET :offset";

        $tasks = $this->db->fetchAll($sql, $params);

        // 獲取總數
        $countSql = "SELECT COUNT(*) as total FROM tasks t WHERE " . str_replace('t.id IS NOT NULL', '1=1', $whereClause);
        $countParams = array_diff_key($params, array_flip(['limit', 'offset']));
        $totalResult = $this->db->fetchOne($countSql, $countParams);
        $total = $totalResult['total'] ?? 0;

        return [
            'tasks' => $tasks,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ];
    }

    public function getTaskById(string $taskId): ?array
    {
        $sql = "SELECT t.*, u.username as creator_name, u.avatar as creator_avatar
                FROM tasks t
                JOIN users u ON t.creator_id = u.id
                WHERE t.id = :task_id";

        $result = $this->db->query($sql, ['task_id' => $taskId]);
        return $result ? $result[0] : null;
    }

    public function updateTask(string $taskId, array $taskData): bool
    {
        $taskData['updated_at'] = date('Y-m-d H:i:s');
        return $this->db->update('tasks', $taskId, $taskData);
    }

    public function deleteTask(string $taskId): bool
    {
        return $this->db->delete('tasks', $taskId);
    }

    public function applyForTask(string $taskId, string $userId, array $applicationData): string
    {
        // 檢查是否已經申請過
        $existing = $this->db->query(
            "SELECT id FROM task_applications WHERE task_id = :task_id AND user_id = :user_id",
            ['task_id' => $taskId, 'user_id' => $userId]
        );

        if ($existing) {
            throw new \Exception('您已經申請過這個任務');
        }

        // 檢查任務狀態
        $task = $this->getTaskById($taskId);
        if (!$task || $task['status'] !== 'open') {
            throw new \Exception('任務不可申請');
        }

        $applicationData['task_id'] = $taskId;
        $applicationData['user_id'] = $userId;
        $applicationData['status'] = 'pending';
        $applicationData['created_at'] = date('Y-m-d H:i:s');

        $applicationId = $this->db->insert('task_applications', $applicationData);

        // 通知任務創建者
        $this->notificationService->createNotification(
            $task['creator_id'],
            'new_application',
            "有新的任務申請：{$task['title']}",
            ['task_id' => $taskId, 'application_id' => $applicationId]
        );

        return $applicationId;
    }

    public function getTaskRecommendations(string $userId, int $limit = 10): array
    {
        // 獲取用戶偏好和歷史
        $user = $this->db->query("SELECT * FROM users WHERE id = :user_id", ['user_id' => $userId])[0] ?? null;
        if (!$user) {
            return [];
        }

        $recommendations = [];

        // 基於用戶角色的推薦
        if ($user['role'] === 'creator') {
            $recommendations = $this->getCreatorRecommendations($user, $limit);
        } elseif ($user['role'] === 'supplier') {
            $recommendations = $this->getSupplierRecommendations($user, $limit);
        }

        return $recommendations;
    }

    private function getCreatorRecommendations(array $user, int $limit): array
    {
        $sql = "SELECT t.*,
                       u.username as creator_name,
                       u.avatar as creator_avatar,
                       CASE
                           WHEN t.location IS NOT NULL AND u.location IS NOT NULL
                           THEN ST_Distance(t.location, u.location)
                           ELSE NULL
                       END as distance
                FROM tasks t
                JOIN users u ON t.creator_id = u.id
                WHERE t.status = 'open'
                  AND t.deadline > NOW()
                  AND t.budget_min <= :max_budget
                ORDER BY
                    CASE WHEN t.location IS NOT NULL AND u.location IS NOT NULL
                         THEN ST_Distance(t.location, u.location)
                         ELSE 999999
                    END ASC,
                    t.created_at DESC
                LIMIT :limit";

        $params = [
            'max_budget' => $user['preferences']['max_budget'] ?? 10000,
            'limit' => $limit
        ];

        return $this->db->query($sql, $params);
    }

    private function getSupplierRecommendations(array $user, int $limit): array
    {
        $sql = "SELECT c.*,
                       u.username as creator_name,
                       u.avatar as creator_avatar,
                       c.rating,
                       c.completed_tasks
                FROM creators c
                JOIN users u ON c.user_id = u.id
                WHERE c.status = 'active'
                  AND c.rating >= :min_rating
                ORDER BY c.rating DESC, c.completed_tasks DESC
                LIMIT :limit";

        $params = [
            'min_rating' => $user['preferences']['min_creator_rating'] ?? 4.0,
            'limit' => $limit
        ];

        return $this->db->query($sql, $params);
    }

    public function getMatchingSuggestions(string $taskId): array
    {
        $task = $this->getTaskById($taskId);
        if (!$task) {
            return [];
        }

        $suggestions = [];

        // 基於內容類型匹配
        if (!empty($task['content_types'])) {
            $contentTypeMatches = $this->findCreatorsByContentType($task['content_types']);
            $suggestions = array_merge($suggestions, $contentTypeMatches);
        }

        // 基於地理位置匹配
        if (!empty($task['location'])) {
            $locationMatches = $this->findCreatorsByLocation($task['location'], 50); // 50km範圍
            $suggestions = array_merge($suggestions, $locationMatches);
        }

        // 基於預算匹配
        $budgetMatches = $this->findCreatorsByBudget($task['budget_min'], $task['budget_max']);
        $suggestions = array_merge($suggestions, $budgetMatches);

        // 去重並排序
        $suggestions = $this->deduplicateAndRankSuggestions($suggestions);

        return array_slice($suggestions, 0, 20);
    }

    private function findCreatorsByContentType(array $contentTypes): array
    {
        $placeholders = implode(',', array_fill(0, count($contentTypes), '?'));
        $sql = "SELECT c.*, u.username, u.avatar, c.rating, c.specialties
                FROM creators c
                JOIN users u ON c.user_id = u.id
                WHERE c.status = 'active'
                  AND (c.specialties ?| :content_types OR c.content_types ?| :content_types)
                ORDER BY c.rating DESC";

        return $this->db->query($sql, ['content_types' => $contentTypes]);
    }

    private function findCreatorsByLocation(string $location, float $radius): array
    {
        $sql = "SELECT c.*, u.username, u.avatar, c.rating,
                       ST_Distance(c.location, ST_GeomFromText(:location)) as distance
                FROM creators c
                JOIN users u ON c.user_id = u.id
                WHERE c.status = 'active'
                  AND c.location IS NOT NULL
                  AND ST_DWithin(c.location, ST_GeomFromText(:location), :radius)
                ORDER BY distance ASC, c.rating DESC";

        return $this->db->query($sql, [
            'location' => $location,
            'radius' => $radius * 1000 // 轉換為米
        ]);
    }

    private function findCreatorsByBudget(float $minBudget, float $maxBudget): array
    {
        $sql = "SELECT c.*, u.username, u.avatar, c.rating, c.rate_range
                FROM creators c
                JOIN users u ON c.user_id = u.id
                WHERE c.status = 'active'
                  AND c.rate_range @> :budget_range
                ORDER BY c.rating DESC";

        $budgetRange = json_encode([$minBudget, $maxBudget]);
        return $this->db->query($sql, ['budget_range' => $budgetRange]);
    }

    private function deduplicateAndRankSuggestions(array $suggestions): array
    {
        $unique = [];
        $seen = [];

        foreach ($suggestions as $suggestion) {
            $key = $suggestion['user_id'] ?? $suggestion['id'];
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $unique[] = $suggestion;
            }
        }

        // 按評分和相關性排序
        usort($unique, function($a, $b) {
            $scoreA = ($a['rating'] ?? 0) * 0.7 + ($a['completed_tasks'] ?? 0) * 0.3;
            $scoreB = ($b['rating'] ?? 0) * 0.7 + ($b['completed_tasks'] ?? 0) * 0.3;
            return $scoreB <=> $scoreA;
        });

        return $unique;
    }

    public function rateTask(string $taskId, string $userId, array $ratingData): bool
    {
        // 檢查是否有權限評分
        $task = $this->getTaskById($taskId);
        if (!$task) {
            throw new \Exception('任務不存在');
        }

        if ($task['creator_id'] !== $userId && $task['assigned_user_id'] !== $userId) {
            throw new \Exception('無權限評分此任務');
        }

        $ratingData['task_id'] = $taskId;
        $ratingData['user_id'] = $userId;
        $ratingData['created_at'] = date('Y-m-d H:i:s');

        // 插入或更新評分
        $existing = $this->db->query(
            "SELECT id FROM task_ratings WHERE task_id = :task_id AND user_id = :user_id",
            ['task_id' => $taskId, 'user_id' => $userId]
        );

        if ($existing) {
            return $this->db->update('task_ratings', $existing[0]['id'], $ratingData);
        } else {
            $this->db->insert('task_ratings', $ratingData);
            return true;
        }
    }

    private function validateTaskData(array $taskData): void
    {
        $required = ['title', 'description', 'supplier_id'];
        foreach ($required as $field) {
            if (empty($taskData[$field])) {
                throw new \Exception("必填字段 {$field} 不能為空");
            }
        }

        // 驗證報酬類型
        if (isset($taskData['reward_type'])) {
            $validRewardTypes = ['money', 'gift', 'experience'];
            if (!in_array($taskData['reward_type'], $validRewardTypes)) {
                throw new \Exception('無效的報酬類型');
            }
        }

        // 根據報酬類型進行不同的驗證
        if (($taskData['reward_type'] ?? 'money') === 'money') {
            // 金錢報酬需要驗證預算
            if (isset($taskData['budget_min']) && isset($taskData['budget_max'])) {
                if ($taskData['budget_min'] > $taskData['budget_max']) {
                    throw new \Exception('最低預算不能高於最高預算');
                }
            }

            if (isset($taskData['budget_min']) && $taskData['budget_min'] <= 0) {
                throw new \Exception('預算金額必須大於0');
            }
        } else if (in_array(($taskData['reward_type'] ?? ''), ['gift', 'experience'])) {
            // 贈品或體驗報酬需要驗證詳情
            if (empty($taskData['gift_details'])) {
                throw new \Exception('贈品或體驗詳情不能為空');
            }
        }

        if (isset($taskData['deadline'])) {
            if (strtotime($taskData['deadline']) <= time()) {
                throw new \Exception('截止日期必須在未來');
            }
        }
    }

    /**
     * 獲取用戶的任務統計（供儀表板使用）
     */
    public function getUserTaskStats(string $userId, string $userRole): array
    {
        $stats = [];

        if ($userRole === 'supplier') {
            $stats = $this->getSupplierTaskStats($userId);
        } elseif ($userRole === 'creator') {
            $stats = $this->getCreatorTaskStats($userId);
        } elseif ($userRole === 'media') {
            $stats = $this->getMediaTaskStats($userId);
        } elseif ($userRole === 'admin') {
            $stats = $this->getAdminTaskStats();
        }

        return $stats;
    }

    /**
     * 獲取供應商任務統計
     */
    private function getSupplierTaskStats(string $userId): array
    {
        $sql = "SELECT
                    COUNT(*) as total_tasks,
                    COUNT(CASE WHEN status IN ('open', 'collecting', 'evaluating', 'in_progress', 'reviewing', 'publishing') THEN 1 END) as active_tasks,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                    SUM(CASE WHEN status = 'completed' THEN budget_min ELSE 0 END) as total_budget_spent,
                    AVG(CASE WHEN status = 'completed' THEN julianday(updated_at) - julianday(created_at) END) as avg_completion_days
                FROM tasks
                WHERE supplier_id = :user_id";

        $basicStats = $this->db->fetchOne($sql, ['user_id' => $userId]);

        // 獲取最近的任務申請
        $recentApplications = $this->db->fetchAll(
            "SELECT ta.*, t.title as task_title, u.username as creator_name
             FROM task_applications ta
             JOIN tasks t ON ta.task_id = t.id
             JOIN users u ON ta.creator_id = u.id
             WHERE t.supplier_id = :user_id
             ORDER BY ta.created_at DESC
             LIMIT 5",
            ['user_id' => $userId]
        );

        return [
            'basic' => $basicStats ?: [],
            'recent_applications' => $recentApplications
        ];
    }

    /**
     * 獲取創作者任務統計
     */
    private function getCreatorTaskStats(string $userId): array
    {
        $sql = "SELECT
                    COUNT(*) as total_applications,
                    COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END) as accepted_applications,
                    COUNT(CASE WHEN ta.status = 'pending' THEN 1 END) as pending_applications,
                    AVG(ta.proposed_budget) as avg_proposed_budget
                FROM task_applications ta
                WHERE ta.creator_id = :user_id";

        $applicationStats = $this->db->fetchOne($sql, ['user_id' => $userId]);

        // 獲取可申請的任務數量
        $availableTasksCount = $this->db->fetchColumn(
            "SELECT COUNT(*) FROM tasks WHERE status IN ('open', 'collecting') AND deadline > NOW()",
            []
        );

        // 獲取最近的任務機會
        $recentTasks = $this->db->fetchAll(
            "SELECT t.*, u.username as supplier_name
             FROM tasks t
             JOIN users u ON t.supplier_id = u.id
             WHERE t.status IN ('open', 'collecting') AND t.deadline > NOW()
             ORDER BY t.created_at DESC
             LIMIT 5",
            []
        );

        return [
            'applications' => $applicationStats ?: [],
            'available_tasks_count' => $availableTasksCount ?: 0,
            'recent_tasks' => $recentTasks
        ];
    }

    /**
     * 獲取媒體任務統計
     */
    private function getMediaTaskStats(string $userId): array
    {
        $sql = "SELECT
                    COUNT(DISTINCT ma.task_id) as tasks_with_assets,
                    COUNT(ma.id) as total_assets,
                    SUM(CASE WHEN ma.status = 'approved' THEN 1 ELSE 0 END) as approved_assets,
                    AVG(ma.file_size) as avg_file_size
                FROM media_assets ma
                WHERE ma.creator_id = :user_id";

        $assetStats = $this->db->fetchOne($sql, ['user_id' => $userId]);

        // 獲取最近的媒體資源
        $recentAssets = $this->db->fetchAll(
            "SELECT ma.*, t.title as task_title
             FROM media_assets ma
             JOIN tasks t ON ma.task_id = t.id
             WHERE ma.creator_id = :user_id
             ORDER BY ma.created_at DESC
             LIMIT 5",
            ['user_id' => $userId]
        );

        return [
            'assets' => $assetStats ?: [],
            'recent_assets' => $recentAssets
        ];
    }

    /**
     * 獲取管理員任務統計
     */
    private function getAdminTaskStats(): array
    {
        $sql = "SELECT
                    COUNT(*) as total_tasks,
                    COUNT(CASE WHEN status IN ('open', 'collecting', 'evaluating', 'in_progress', 'reviewing', 'publishing') THEN 1 END) as active_tasks,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks,
                    SUM(budget_min) as total_budget,
                    AVG(CASE WHEN status = 'completed' THEN julianday(updated_at) - julianday(created_at) END) as avg_completion_days
                FROM tasks";

        $basicStats = $this->db->fetchOne($sql, []);

        // 獲取用戶統計
        $userStats = $this->db->fetchOne(
            "SELECT
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'supplier' THEN 1 END) as suppliers,
                COUNT(CASE WHEN role = 'creator' THEN 1 END) as creators,
                COUNT(CASE WHEN role = 'media' THEN 1 END) as media_users
             FROM users WHERE is_active = TRUE",
            []
        );

        return [
            'tasks' => $basicStats ?: [],
            'users' => $userStats ?: []
        ];
    }

    /**
     * 檢查任務操作權限（整合版）
     */
    public function canUserAccessTask(string $userId, string $taskId, string $action = 'view'): bool
    {
        return $this->permissionService->hasPermission($userId, 'task', $action, $taskId);
    }

    /**
     * 獲取用戶相關任務（根據角色）
     */
    public function getUserRelatedTasks(string $userId, string $userRole, array $filters = [], int $page = 1, int $limit = 20): array
    {
        switch ($userRole) {
            case 'supplier':
                $filters['supplier_id'] = $userId;
                break;
            case 'creator':
                // 創作者看到已申請的任務
                return $this->getCreatorAppliedTasks($userId, $filters, $page, $limit);
            case 'media':
                // 媒體用戶看到有媒體資源的任務
                return $this->getMediaRelatedTasks($userId, $filters, $page, $limit);
            case 'admin':
                // 管理員看到所有任務
                break;
        }

        return $this->getTasks($filters, $page, $limit, $userId);
    }

    /**
     * 獲取創作者已申請的任務
     */
    private function getCreatorAppliedTasks(string $userId, array $filters, int $page, int $limit): array
    {
        $offset = ($page - 1) * $limit;
        $whereConditions = ['ta.creator_id = :user_id'];
        $params = ['user_id' => $userId, 'limit' => $limit, 'offset' => $offset];

        if (!empty($filters['status'])) {
            $whereConditions[] = 'ta.status = :status';
            $params['status'] = $filters['status'];
        }

        $whereClause = implode(' AND ', $whereConditions);

        $sql = "SELECT
                    t.*,
                    ta.status as application_status,
                    ta.proposal,
                    ta.proposed_budget,
                    ta.created_at as application_date,
                    u.username as supplier_name
                FROM task_applications ta
                JOIN tasks t ON ta.task_id = t.id
                JOIN users u ON t.supplier_id = u.id
                WHERE {$whereClause}
                ORDER BY ta.created_at DESC
                LIMIT :limit OFFSET :offset";

        $tasks = $this->db->fetchAll($sql, $params);

        // 獲取總數
        $countSql = "SELECT COUNT(*) as total FROM task_applications ta WHERE ta.creator_id = :user_id";
        $totalResult = $this->db->fetchOne($countSql, ['user_id' => $userId]);
        $total = $totalResult['total'] ?? 0;

        return [
            'tasks' => $tasks,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ];
    }

    /**
     * 獲取媒體相關任務
     */
    private function getMediaRelatedTasks(string $userId, array $filters, int $page, int $limit): array
    {
        $offset = ($page - 1) * $limit;

        $sql = "SELECT DISTINCT
                    t.*,
                    u.username as supplier_name,
                    COUNT(ma.id) as media_assets_count
                FROM tasks t
                JOIN users u ON t.supplier_id = u.id
                LEFT JOIN media_assets ma ON t.id = ma.task_id AND ma.creator_id = :user_id
                WHERE ma.id IS NOT NULL OR t.status IN ('completed', 'publishing')
                GROUP BY t.id
                ORDER BY t.updated_at DESC
                LIMIT :limit OFFSET :offset";

        $tasks = $this->db->fetchAll($sql, [
            'user_id' => $userId,
            'limit' => $limit,
            'offset' => $offset
        ]);

        return [
            'tasks' => $tasks,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => count($tasks),
                'total_pages' => 1
            ]
        ];
    }

    private function notifyRelevantCreators(string $taskId, array $taskData): void
    {
        // 獲取相關創作者
        $creators = $this->getMatchingSuggestions($taskId);

        foreach ($creators as $creator) {
            $this->notificationService->createNotification(
                $creator['user_id'],
                'new_task_match',
                "有新的任務可能適合您：{$taskData['title']}",
                ['task_id' => $taskId]
            );
        }
    }
}
