<?php

namespace App\Services;

class TaskService
{
    private DatabaseService $db;
    private NotificationService $notificationService;

    public function __construct(DatabaseService $db, NotificationService $notificationService)
    {
        $this->db = $db;
        $this->notificationService = $notificationService;
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

    public function getTasks(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        $whereConditions = ['1=1'];
        $params = ['limit' => $limit, 'offset' => $offset];

        // 狀態篩選
        if (!empty($filters['status'])) {
            $whereConditions[] = 'status = :status';
            $params['status'] = $filters['status'];
        }

        // 內容類型篩選
        if (!empty($filters['content_type'])) {
            $whereConditions[] = 'content_type = :content_type';
            $params['content_type'] = $filters['content_type'];
        }

        // 預算範圍篩選
        if (!empty($filters['budget_min'])) {
            $whereConditions[] = 'budget_max >= :budget_min';
            $params['budget_min'] = $filters['budget_min'];
        }

        if (!empty($filters['budget_max'])) {
            $whereConditions[] = 'budget_min <= :budget_max';
            $params['budget_max'] = $filters['budget_max'];
        }

        // 標籤篩選
        if (!empty($filters['tags'])) {
            $tags = explode(',', $filters['tags']);
            $tagConditions = [];
            foreach ($tags as $i => $tag) {
                $tagConditions[] = "tags @> :tag{$i}";
                $params["tag{$i}"] = json_encode([trim($tag)]);
            }
            $whereConditions[] = '(' . implode(' OR ', $tagConditions) . ')';
        }

        // 地理位置篩選
        if (!empty($filters['location']) && !empty($filters['radius'])) {
            $whereConditions[] = "ST_DWithin(location, ST_GeomFromText(:location), :radius)";
            $params['location'] = "POINT({$filters['location']})";
            $params['radius'] = $filters['radius'];
        }

        // 全文搜索
        if (!empty($filters['search'])) {
            $whereConditions[] = "to_tsvector('chinese', title || ' ' || description) @@ plainto_tsquery('chinese', :search)";
            $params['search'] = $filters['search'];
        }

        $whereClause = implode(' AND ', $whereConditions);
        
        $sql = "SELECT * FROM tasks WHERE {$whereClause} ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        
        return $this->db->query($sql, $params);
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
        $required = ['title', 'description', 'creator_id'];
        foreach ($required as $field) {
            if (empty($taskData[$field])) {
                throw new \Exception("必填字段 {$field} 不能為空");
            }
        }

        if (isset($taskData['budget_min']) && isset($taskData['budget_max'])) {
            if ($taskData['budget_min'] > $taskData['budget_max']) {
                throw new \Exception('最低預算不能高於最高預算');
            }
        }

        if (isset($taskData['deadline'])) {
            if (strtotime($taskData['deadline']) <= time()) {
                throw new \Exception('截止日期必須在未來');
            }
        }
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
