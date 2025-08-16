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

        // 地點篩選
        if (!empty($filters['location'])) {
            $whereConditions[] = 'ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :radius)';
            $params['lng'] = $filters['location']['lng'];
            $params['lat'] = $filters['location']['lat'];
            $params['radius'] = $filters['location']['radius'] ?? 50000;
        }

        // 標籤篩選
        if (!empty($filters['tags'])) {
            $whereConditions[] = 'tags && :tags';
            $params['tags'] = $filters['tags'];
        }

        // 搜尋關鍵字
        if (!empty($filters['search'])) {
            $whereConditions[] = 'to_tsvector(\'chinese\', title || \' \' || COALESCE(description, \'\')) @@ plainto_tsquery(\'chinese\', :search)';
            $params['search'] = $filters['search'];
        }

        $whereClause = implode(' AND ', $whereConditions);
        
        $sql = "SELECT t.*, u.username as supplier_name, u.avatar_url as supplier_avatar
                FROM tasks t
                JOIN users u ON t.supplier_id = u.id
                WHERE {$whereClause}
                ORDER BY 
                    CASE WHEN t.is_urgent = true THEN 0 ELSE 1 END,
                    CASE WHEN t.is_featured = true THEN 0 ELSE 1 END,
                    t.created_at DESC
                LIMIT :limit OFFSET :offset";

        $tasks = $this->db->fetchAll($sql, $params);

        // 獲取總數
        $countSql = "SELECT COUNT(*) as total FROM tasks t WHERE {$whereClause}";
        $total = $this->db->fetchColumn($countSql, array_diff_key($params, ['limit' => '', 'offset' => '']));

        return [
            'tasks' => $tasks,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ];
    }

    public function getTaskById(string $taskId): ?array
    {
        $sql = "SELECT t.*, u.username as supplier_name, u.avatar_url as supplier_avatar,
                       u.rating as supplier_rating, u.completed_tasks as supplier_completed_tasks
                FROM tasks t
                JOIN users u ON t.supplier_id = u.id
                WHERE t.id = :id";

        $task = $this->db->fetchOne($sql, ['id' => $taskId]);

        if ($task) {
            // 增加瀏覽次數
            $this->incrementViewCount($taskId);
            
            // 獲取申請者數量
            $task['applications_count'] = $this->getApplicationsCount($taskId);
        }

        return $task;
    }

    public function updateTask(string $taskId, array $updateData): bool
    {
        // 檢查任務是否存在
        $existingTask = $this->db->fetchOne('SELECT supplier_id FROM tasks WHERE id = :id', ['id' => $taskId]);
        if (!$existingTask) {
            throw new \Exception('Task not found');
        }

        // 更新任務
        $this->db->update('tasks', $updateData, 'id = :id', ['id' => $taskId]);

        return true;
    }

    public function deleteTask(string $taskId, string $userId): bool
    {
        // 檢查權限
        $task = $this->db->fetchOne('SELECT supplier_id FROM tasks WHERE id = :id', ['id' => $taskId]);
        if (!$task || $task['supplier_id'] !== $userId) {
            throw new \Exception('Permission denied');
        }

        // 刪除任務
        $this->db->delete('tasks', 'id = :id', ['id' => $taskId]);

        return true;
    }

    public function applyForTask(string $taskId, string $creatorId, array $applicationData): string
    {
        // 檢查任務狀態
        $task = $this->db->fetchOne(
            'SELECT status, supplier_id FROM tasks WHERE id = :id',
            ['id' => $taskId]
        );

        if (!$task) {
            throw new \Exception('Task not found');
        }

        if ($task['status'] !== 'open') {
            throw new \Exception('Task is not open for applications');
        }

        // 檢查是否已經申請過
        if ($this->db->exists('task_applications', 'task_id = :task_id AND creator_id = :creator_id', [
            'task_id' => $taskId,
            'creator_id' => $creatorId
        ])) {
            throw new \Exception('You have already applied for this task');
        }

        // 創建申請
        $applicationData['task_id'] = $taskId;
        $applicationData['creator_id'] = $creatorId;
        $applicationData['status'] = 'pending';

        $applicationId = $this->db->insert('task_applications', $applicationData);

        // 更新任務申請數量
        $this->incrementApplicationsCount($taskId);

        // 通知供應商
        $creator = $this->db->fetchOne('SELECT username FROM users WHERE id = :id', ['id' => $creatorId]);
        $this->notificationService->notifyTaskApplication($task['supplier_id'], $taskId, $creator['username']);

        return $applicationId;
    }

    public function findMatchingCreators(string $taskId, int $limit = 10): array
    {
        $task = $this->db->fetchOne(
            'SELECT content_type, location, budget_min, budget_max, tags FROM tasks WHERE id = :id',
            ['id' => $taskId]
        );

        if (!$task) {
            throw new \Exception('Task not found');
        }

        $whereConditions = ['u.role = :role', 'u.is_active = true'];
        $params = ['role' => 'creator', 'limit' => $limit];

        // 技能匹配
        if (!empty($task['tags'])) {
            $whereConditions[] = 'u.skills && :tags';
            $params['tags'] = $task['tags'];
        }

        // 地點匹配
        if (!empty($task['location'])) {
            $whereConditions[] = 'ST_DWithin(u.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :radius)';
            $params['lng'] = $task['location']['lng'];
            $params['lat'] = $task['location']['lat'];
            $params['radius'] = 100000; // 100公里範圍
        }

        $whereClause = implode(' AND ', $whereConditions);

        $sql = "SELECT u.*, cp.content_types, cp.portfolio_url,
                       (u.rating * 0.4 + 
                        CASE WHEN u.skills && :task_tags THEN 0.3 ELSE 0 END +
                        CASE WHEN u.location IS NOT NULL AND :task_location IS NOT NULL 
                             THEN 0.2 ELSE 0 END +
                        CASE WHEN u.completed_tasks > 0 THEN 0.1 ELSE 0 END) as match_score
                FROM users u
                LEFT JOIN creator_profiles cp ON u.id = cp.user_id
                WHERE {$whereClause}
                ORDER BY match_score DESC, u.rating DESC
                LIMIT :limit";

        $params['task_tags'] = $task['tags'] ?? [];
        $params['task_location'] = $task['location'] ?? null;

        return $this->db->fetchAll($sql, $params);
    }

    public function getTaskRecommendations(string $userId, int $limit = 10): array
    {
        $user = $this->db->fetchOne(
            'SELECT role, skills, location FROM users WHERE id = :id',
            ['id' => $userId]
        );

        if (!$user || $user['role'] !== 'creator') {
            return [];
        }

        $whereConditions = ['t.status = :status'];
        $params = ['status' => 'open', 'limit' => $limit];

        // 技能匹配
        if (!empty($user['skills'])) {
            $whereConditions[] = 't.tags && :skills';
            $params['skills'] = $user['skills'];
        }

        // 地點匹配
        if (!empty($user['location'])) {
            $whereConditions[] = 'ST_DWithin(t.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :radius)';
            $params['lng'] = $user['location']['lng'];
            $params['lat'] = $user['location']['lat'];
            $params['radius'] = 50000; // 50公里範圍
        }

        $whereClause = implode(' AND ', $whereConditions);

        $sql = "SELECT t.*, u.username as supplier_name, u.rating as supplier_rating,
                       (CASE WHEN t.tags && :user_skills THEN 0.4 ELSE 0 END +
                        CASE WHEN t.location IS NOT NULL AND :user_location IS NOT NULL 
                             THEN 0.3 ELSE 0 END +
                        CASE WHEN t.budget_min >= 1000 THEN 0.2 ELSE 0 END +
                        CASE WHEN t.is_urgent = true THEN 0.1 ELSE 0 END) as relevance_score
                FROM tasks t
                JOIN users u ON t.supplier_id = u.id
                WHERE {$whereClause}
                ORDER BY relevance_score DESC, t.created_at DESC
                LIMIT :limit";

        $params['user_skills'] = $user['skills'] ?? [];
        $params['user_location'] = $user['location'] ?? null;

        return $this->db->fetchAll($sql, $params);
    }

    public function rateTaskApplication(string $applicationId, string $raterId, int $rating, string $feedback = ''): bool
    {
        $application = $this->db->fetchOne(
            'SELECT ta.*, t.supplier_id FROM task_applications ta
             JOIN tasks t ON ta.task_id = t.id
             WHERE ta.id = :id',
            ['id' => $applicationId]
        );

        if (!$application) {
            throw new \Exception('Application not found');
        }

        // 檢查評分權限
        if ($raterId === $application['supplier_id']) {
            $updateData = [
                'supplier_rating' => $rating,
                'supplier_feedback' => $feedback
            ];
        } elseif ($raterId === $application['creator_id']) {
            $updateData = [
                'creator_rating' => $rating,
                'creator_feedback' => $feedback
            ];
        } else {
            throw new \Exception('Permission denied');
        }

        $this->db->update('task_applications', $updateData, 'id = :id', ['id' => $applicationId]);

        // 更新用戶評分
        $this->updateUserRating($raterId === $application['supplier_id'] ? $application['creator_id'] : $application['supplier_id']);

        return true;
    }

    private function validateTaskData(array $data): void
    {
        $required = ['title', 'description', 'supplier_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \Exception("Field '{$field}' is required");
            }
        }

        if (isset($data['budget_min']) && isset($data['budget_max'])) {
            if ($data['budget_min'] > $data['budget_max']) {
                throw new \Exception('Minimum budget cannot be greater than maximum budget');
            }
        }
    }

    private function incrementViewCount(string $taskId): void
    {
        $this->db->query(
            'UPDATE tasks SET views_count = views_count + 1 WHERE id = :id',
            ['id' => $taskId]
        );
    }

    private function incrementApplicationsCount(string $taskId): void
    {
        $this->db->query(
            'UPDATE tasks SET applications_count = applications_count + 1 WHERE id = :id',
            ['id' => $taskId]
        );
    }

    private function getApplicationsCount(string $taskId): int
    {
        return $this->db->count('task_applications', 'task_id = :task_id', ['task_id' => $taskId]);
    }

    private function notifyRelevantCreators(string $taskId, array $taskData): void
    {
        $matchingCreators = $this->findMatchingCreators($taskId, 20);
        
        foreach ($matchingCreators as $creator) {
            $this->notificationService->notifyNewTask(
                $creator['id'],
                $taskId,
                $taskData['title']
            );
        }
    }

    private function updateUserRating(string $userId): void
    {
        $sql = "SELECT AVG(rating) as avg_rating 
                FROM (
                    SELECT supplier_rating as rating FROM task_applications 
                    WHERE creator_id = :user_id AND supplier_rating IS NOT NULL
                    UNION ALL
                    SELECT creator_rating as rating FROM task_applications 
                    WHERE supplier_id = :user_id AND creator_rating IS NOT NULL
                ) ratings";
        
        $result = $this->db->fetchOne($sql, ['user_id' => $userId]);
        
        if ($result && $result['avg_rating']) {
            $this->db->update('users', ['rating' => round($result['avg_rating'], 2)], 'id = :id', ['id' => $userId]);
        }
    }
}
