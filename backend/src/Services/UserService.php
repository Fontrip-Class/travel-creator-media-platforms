<?php

namespace App\Services;

use App\Services\DatabaseService;
use App\Services\NotificationService;
use Exception;

/**
 * 用戶管理服務
 * 處理用戶相關的業務邏輯，包括用戶資料管理、權限檢查、業務實體關聯等
 */
class UserService
{
    private DatabaseService $db;
    private NotificationService $notificationService;

    public function __construct(DatabaseService $db, NotificationService $notificationService)
    {
        $this->db = $db;
        $this->notificationService = $notificationService;
    }

    /**
     * 獲取用戶詳細資訊（包含業務實體）
     */
    public function getUserWithEntities(string $userId): ?array
    {
        $sql = "SELECT
                    u.*,
                    GROUP_CONCAT(
                        JSON_OBJECT(
                            'id', be.id,
                            'name', be.name,
                            'business_type', be.business_type,
                            'description', be.description,
                            'contact_person', be.contact_person,
                            'contact_phone', be.contact_phone,
                            'contact_email', be.contact_email,
                            'website', be.website,
                            'address', be.address,
                            'business_hours', be.business_hours,
                            'tags', be.tags,
                            'verification_status', be.verification_status,
                            'created_at', be.created_at,
                            'updated_at', be.updated_at
                        )
                    ) as business_entities_json
                FROM users u
                LEFT JOIN user_business_permissions ubp ON u.id = ubp.user_id
                LEFT JOIN business_entities be ON ubp.business_entity_id = be.id
                WHERE u.id = :user_id
                GROUP BY u.id";

        $result = $this->db->fetchOne($sql, ['user_id' => $userId]);

        if (!$result) {
            return null;
        }

        // 解析業務實體JSON
        if ($result['business_entities_json']) {
            $result['business_entities'] = json_decode('[' . $result['business_entities_json'] . ']', true);
        } else {
            $result['business_entities'] = [];
        }
        unset($result['business_entities_json']);

        return $result;
    }

    /**
     * 獲取用戶列表（支援篩選和分頁）
     */
    public function getUsers(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        $whereConditions = ['u.id IS NOT NULL'];
        $params = ['limit' => $limit, 'offset' => $offset];

        // 角色篩選
        if (!empty($filters['role'])) {
            $whereConditions[] = 'u.role = :role';
            $params['role'] = $filters['role'];
        }

        // 狀態篩選
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'active') {
                $whereConditions[] = 'u.is_active = TRUE AND u.is_suspended = FALSE';
            } elseif ($filters['status'] === 'suspended') {
                $whereConditions[] = 'u.is_suspended = TRUE';
            } elseif ($filters['status'] === 'pending') {
                $whereConditions[] = 'u.is_verified = FALSE';
            }
        }

        // 搜尋篩選
        if (!empty($filters['search'])) {
            $whereConditions[] = "(u.username LIKE :search OR u.email LIKE :search OR u.phone LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $whereClause = implode(' AND ', $whereConditions);

        // 主查詢 - 獲取用戶基本資訊（簡化版）
        $sql = "SELECT
                    u.id,
                    u.username,
                    u.email,
                    u.role,
                    u.phone,
                    u.contact,
                    u.is_active,
                    u.is_verified,
                    u.avatar_url,
                    u.created_at,
                    u.updated_at
                FROM users u
                WHERE {$whereClause}
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT :limit OFFSET :offset";

        $users = $this->db->fetchAll($sql, $params);

        // 獲取總數
        $countSql = "SELECT COUNT(DISTINCT u.id) as total
                     FROM users u
                     LEFT JOIN user_business_permissions ubp ON u.id = ubp.user_id
                     LEFT JOIN business_entities be ON ubp.business_entity_id = be.id
                     WHERE {$whereClause}";

        $countParams = array_diff_key($params, array_flip(['limit', 'offset']));
        $totalResult = $this->db->fetchOne($countSql, $countParams);
        $total = $totalResult['total'] ?? 0;

        // 為每個用戶獲取詳細的業務實體資訊
        foreach ($users as &$user) {
            if ($user['business_entities_count'] > 0) {
                $user['business_entities'] = $this->getUserBusinessEntities($user['id']);
            } else {
                $user['business_entities'] = [];
            }
        }

        return [
            'users' => $users,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ];
    }

    /**
     * 創建新用戶
     */
    public function createUser(array $userData): string
    {
        // 驗證用戶資料
        $this->validateUserData($userData, true);

        // 檢查用戶是否已存在
        if ($this->db->exists('users', 'email = :email', ['email' => $userData['email']])) {
            throw new Exception('郵箱已被註冊');
        }

        if ($this->db->exists('users', 'username = :username', ['username' => $userData['username']])) {
            throw new Exception('用戶名已被使用');
        }

        // 密碼加密
        if (isset($userData['password'])) {
            $userData['password_hash'] = password_hash($userData['password'], PASSWORD_ARGON2ID);
            unset($userData['password']);
        }

        // 設置預設值
        $userData['is_active'] = $userData['is_active'] ?? true;
        $userData['is_verified'] = $userData['is_verified'] ?? false;
        $userData['created_at'] = date('Y-m-d H:i:s');
        $userData['updated_at'] = date('Y-m-d H:i:s');

        // 開始事務
        $this->db->beginTransaction();

        try {
            // 插入用戶資料
            $userId = $this->db->insert('users', $userData);

            // 創建用戶設置
            $this->createUserSettings($userId);

            // 根據角色創建相應的資料表記錄
            if (isset($userData['role'])) {
                $this->createRoleSpecificData($userId, $userData['role'], $userData);
            }

            $this->db->commit();

            // 發送歡迎通知
            $this->notificationService->createNotification(
                $userId,
                'welcome',
                '歡迎加入旅遊創作者平台！',
                ['user_id' => $userId]
            );

            return $userId;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 更新用戶資料
     */
    public function updateUser(string $userId, array $userData): bool
    {
        // 驗證用戶資料
        $this->validateUserData($userData, false);

        // 檢查用戶是否存在
        $existingUser = $this->db->fetchOne('SELECT * FROM users WHERE id = :id', ['id' => $userId]);
        if (!$existingUser) {
            throw new Exception('用戶不存在');
        }

        // 檢查郵箱和用戶名唯一性（排除當前用戶）
        if (isset($userData['email']) && $userData['email'] !== $existingUser['email']) {
            if ($this->db->exists('users', 'email = :email AND id != :id', ['email' => $userData['email'], 'id' => $userId])) {
                throw new Exception('郵箱已被其他用戶使用');
            }
        }

        if (isset($userData['username']) && $userData['username'] !== $existingUser['username']) {
            if ($this->db->exists('users', 'username = :username AND id != :id', ['username' => $userData['username'], 'id' => $userId])) {
                throw new Exception('用戶名已被其他用戶使用');
            }
        }

        // 處理密碼更新
        if (isset($userData['password']) && !empty($userData['password'])) {
            $userData['password_hash'] = password_hash($userData['password'], PASSWORD_ARGON2ID);
            unset($userData['password']);
        }

        $userData['updated_at'] = date('Y-m-d H:i:s');

        // 更新用戶資料
        $affected = $this->db->update('users', $userData, 'id = :id', ['id' => $userId]);

        if ($affected > 0) {
            // 記錄用戶資料變更
            $this->logUserChange($userId, 'update', $userData);
        }

        return $affected > 0;
    }

    /**
     * 刪除用戶（軟刪除）
     */
    public function deleteUser(string $userId): bool
    {
        // 檢查用戶是否存在
        $user = $this->db->fetchOne('SELECT * FROM users WHERE id = :id', ['id' => $userId]);
        if (!$user) {
            throw new Exception('用戶不存在');
        }

        // 檢查是否有關聯的任務
        $hasActiveTasks = $this->db->exists(
            'tasks',
            'supplier_id = :user_id AND status NOT IN (\'completed\', \'cancelled\')',
            ['user_id' => $userId]
        );

        if ($hasActiveTasks) {
            throw new Exception('該用戶有進行中的任務，無法刪除');
        }

        // 軟刪除：停用用戶而不是物理刪除
        $updateData = [
            'is_active' => false,
            'is_suspended' => true,
            'suspension_reason' => '管理員刪除用戶',
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $affected = $this->db->update('users', $updateData, 'id = :id', ['id' => $userId]);

        if ($affected > 0) {
            // 記錄用戶刪除
            $this->logUserChange($userId, 'delete', $updateData);

            // 發送通知
            $this->notificationService->createNotification(
                $userId,
                'account_suspended',
                '您的帳戶已被管理員停用',
                ['reason' => '管理員刪除用戶']
            );
        }

        return $affected > 0;
    }

    /**
     * 暫停/啟用用戶
     */
    public function suspendUser(string $userId, string $reason, ?string $suspensionUntil = null): bool
    {
        $updateData = [
            'is_suspended' => true,
            'suspension_reason' => $reason,
            'suspension_until' => $suspensionUntil,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $affected = $this->db->update('users', $updateData, 'id = :id', ['id' => $userId]);

        if ($affected > 0) {
            $this->logUserChange($userId, 'suspend', $updateData);

            $this->notificationService->createNotification(
                $userId,
                'account_suspended',
                '您的帳戶已被暫停',
                ['reason' => $reason, 'until' => $suspensionUntil]
            );
        }

        return $affected > 0;
    }

    public function activateUser(string $userId): bool
    {
        $updateData = [
            'is_active' => true,
            'is_suspended' => false,
            'suspension_reason' => null,
            'suspension_until' => null,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $affected = $this->db->update('users', $updateData, 'id = :id', ['id' => $userId]);

        if ($affected > 0) {
            $this->logUserChange($userId, 'activate', $updateData);

            $this->notificationService->createNotification(
                $userId,
                'account_activated',
                '您的帳戶已被重新啟用',
                []
            );
        }

        return $affected > 0;
    }

    /**
     * 獲取用戶的業務實體
     */
    public function getUserBusinessEntities(string $userId): array
    {
        $sql = "SELECT be.*, ubp.permission_level, ubp.can_edit_profile, ubp.can_manage_users,
                       ubp.can_manage_content, ubp.can_manage_finance, ubp.can_view_analytics
                FROM business_entities be
                JOIN user_business_permissions ubp ON be.id = ubp.business_entity_id
                WHERE ubp.user_id = :user_id
                ORDER BY be.created_at DESC";

        return $this->db->fetchAll($sql, ['user_id' => $userId]);
    }

    /**
     * 檢查用戶權限
     */
    public function checkUserPermission(string $userId, string $businessEntityId, string $permission): bool
    {
        $sql = "SELECT ubp.permission_level, ubp.can_edit_profile, ubp.can_manage_users,
                       ubp.can_manage_content, ubp.can_manage_finance, ubp.can_view_analytics
                FROM user_business_permissions ubp
                WHERE ubp.user_id = :user_id AND ubp.business_entity_id = :business_entity_id";

        $result = $this->db->fetchOne($sql, [
            'user_id' => $userId,
            'business_entity_id' => $businessEntityId
        ]);

        if (!$result) {
            return false;
        }

        // 管理員有所有權限
        if ($result['permission_level'] === 'manager') {
            return true;
        }

        // 檢查具體權限
        $permissionMap = [
            'edit_profile' => 'can_edit_profile',
            'manage_users' => 'can_manage_users',
            'manage_content' => 'can_manage_content',
            'manage_finance' => 'can_manage_finance',
            'view_analytics' => 'can_view_analytics'
        ];

        if (isset($permissionMap[$permission])) {
            return (bool) $result[$permissionMap[$permission]];
        }

        return false;
    }

    /**
     * 獲取用戶統計資料
     */
    public function getUserStats(string $userId): array
    {
        // 基本統計
        $basicStats = $this->db->fetchOne(
            "SELECT
                u.rating,
                u.total_tasks,
                u.completed_tasks,
                (SELECT COUNT(*) FROM business_entities be
                 JOIN user_business_permissions ubp ON be.id = ubp.business_entity_id
                 WHERE ubp.user_id = u.id) as business_entities_count
             FROM users u WHERE u.id = :user_id",
            ['user_id' => $userId]
        );

        // 任務統計
        $taskStats = $this->db->fetchOne(
            "SELECT
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tasks,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                AVG(CASE WHEN status = 'completed' AND budget_min > 0 THEN budget_min END) as avg_budget
             FROM tasks WHERE supplier_id = :user_id",
            ['user_id' => $userId]
        );

        // 最近活動
        $recentActivities = $this->db->fetchAll(
            "SELECT activity_type, description, created_at
             FROM task_activities
             WHERE user_id = :user_id
             ORDER BY created_at DESC
             LIMIT 10",
            ['user_id' => $userId]
        );

        return [
            'basic' => $basicStats ?: [],
            'tasks' => $taskStats ?: [],
            'recent_activities' => $recentActivities
        ];
    }

    /**
     * 驗證用戶資料
     */
    private function validateUserData(array $data, bool $isCreate = false): void
    {
        $errors = [];

        // 必填欄位檢查（創建時）
        if ($isCreate) {
            $required = ['username', 'email'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $errors[] = "必填欄位 {$field} 不能為空";
                }
            }
        }

        // 用戶名驗證
        if (isset($data['username'])) {
            if (mb_strlen($data['username']) < 3 || mb_strlen($data['username']) > 50) {
                $errors[] = '用戶名長度必須在3-50字符之間';
            }
            if (!preg_match('/^[\p{Han}a-zA-Z0-9_\s]+$/u', $data['username'])) {
                $errors[] = '用戶名格式不正確：只能包含中文、英文字母、數字、底線和空格';
            }
        }

        // 郵箱驗證
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = '郵箱格式不正確';
        }

        // 密碼驗證（創建時或更新密碼時）
        if ((isset($data['password']) && !empty($data['password'])) || $isCreate) {
            $password = $data['password'] ?? '';
            if (strlen($password) < 6) {
                $errors[] = '密碼長度至少需要6個字符';
            }
        }

        // 角色驗證
        if (isset($data['role'])) {
            $validRoles = ['supplier', 'creator', 'media', 'admin'];
            if (!in_array($data['role'], $validRoles)) {
                $errors[] = '角色必須是以下之一：' . implode(', ', $validRoles);
            }
        }

        // 電話驗證
        if (isset($data['phone']) && !empty($data['phone'])) {
            if (!preg_match('/^[\d\-\+\s\(\)]+$/', $data['phone'])) {
                $errors[] = '電話號碼格式不正確';
            }
        }

        if (!empty($errors)) {
            throw new Exception('資料驗證失敗：' . implode('; ', $errors));
        }
    }

    /**
     * 創建用戶設置
     */
    private function createUserSettings(string $userId): void
    {
        $defaultSettings = [
            'user_id' => $userId,
            'email_notifications' => true,
            'push_notifications' => true,
            'language' => 'zh-TW',
            'timezone' => 'Asia/Taipei',
            'theme' => 'light',
            'currency' => 'TWD',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $this->db->insert('user_settings', $defaultSettings);
    }

    /**
     * 根據角色創建特定資料
     */
    private function createRoleSpecificData(string $userId, string $role, array $userData): void
    {
        $profileData = ['user_id' => $userId];

        switch ($role) {
            case 'supplier':
                $profileData['company_name'] = $userData['company_name'] ?? null;
                $profileData['business_type'] = $userData['business_type'] ?? null;
                $profileData['verification_status'] = 'pending';
                $profileData['created_at'] = date('Y-m-d H:i:s');
                $profileData['updated_at'] = date('Y-m-d H:i:s');
                $this->db->insert('supplier_profiles', $profileData);
                break;

            case 'creator':
                $profileData['specialties'] = $userData['specialties'] ?? null;
                $profileData['content_types'] = $userData['content_types'] ?? null;
                $profileData['verification_status'] = 'pending';
                $profileData['created_at'] = date('Y-m-d H:i:s');
                $profileData['updated_at'] = date('Y-m-d H:i:s');
                $this->db->insert('creator_profiles', $profileData);
                break;

            case 'media':
                $profileData['media_type'] = $userData['media_type'] ?? null;
                $profileData['platform_name'] = $userData['platform_name'] ?? null;
                $profileData['verification_status'] = 'pending';
                $profileData['created_at'] = date('Y-m-d H:i:s');
                $profileData['updated_at'] = date('Y-m-d H:i:s');
                $this->db->insert('media_profiles', $profileData);
                break;
        }
    }

    /**
     * 記錄用戶變更
     */
    private function logUserChange(string $userId, string $action, array $data): void
    {
        $logData = [
            'user_id' => $userId,
            'action' => "user_{$action}",
            'table_name' => 'users',
            'record_id' => $userId,
            'new_values' => json_encode($data),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'created_at' => date('Y-m-d H:i:s')
        ];

        $this->db->insert('audit_logs', $logData);
    }
}
