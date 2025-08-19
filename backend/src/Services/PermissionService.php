<?php

namespace App\Services;

/**
 * 權限管理服務 - 統一處理用戶權限檢查
 */
class PermissionService
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    /**
     * 檢查用戶是否有特定權限
     */
    public function hasPermission(string $userId, string $resource, string $action, ?string $resourceId = null): bool
    {
        $user = $this->db->fetchOne('SELECT * FROM users WHERE id = :id', ['id' => $userId]);
        if (!$user || !$user['is_active']) {
            return false;
        }

        // 檢查用戶是否被暫停（如果欄位存在）
        if (isset($user['is_suspended']) && $user['is_suspended']) {
            return false;
        }

        // 管理員有所有權限
        if ($user['role'] === 'admin') {
            return true;
        }

        return $this->checkResourcePermission($userId, $user['role'], $resource, $action, $resourceId);
    }

    /**
     * 檢查資源權限
     */
    private function checkResourcePermission(string $userId, string $userRole, string $resource, string $action, ?string $resourceId): bool
    {
        switch ($resource) {
            case 'user':
                return $this->checkUserPermission($userId, $userRole, $action, $resourceId);
            case 'task':
                return $this->checkTaskPermission($userId, $userRole, $action, $resourceId);
            case 'business_entity':
                return $this->checkBusinessEntityPermission($userId, $userRole, $action, $resourceId);
            default:
                return false;
        }
    }

    /**
     * 檢查用戶權限
     */
    private function checkUserPermission(string $userId, string $userRole, string $action, ?string $targetUserId): bool
    {
        switch ($action) {
            case 'view':
                // 允許查看自己的資料，或者管理員查看所有，或者供應商查看基本用戶列表
                if ($targetUserId === null) {
                    // 查看用戶列表 - 放寬權限讓供應商也能查看
                    return in_array($userRole, ['admin', 'supplier', 'creator', 'media']);
                }
                return $targetUserId === $userId || $userRole === 'admin';
            case 'edit':
                return $targetUserId === $userId || $userRole === 'admin';
            case 'create':
                // 放寬創建權限，讓供應商也能創建用戶（例如邀請創作者）
                return in_array($userRole, ['admin', 'supplier']);
            case 'delete':
            case 'manage':
                return $userRole === 'admin';
            default:
                return false;
        }
    }

    /**
     * 檢查任務權限
     */
    private function checkTaskPermission(string $userId, string $userRole, string $action, ?string $taskId): bool
    {
        switch ($action) {
            case 'view':
                return !$taskId || $this->isTaskParticipant($userId, $taskId);
            case 'create':
                return in_array($userRole, ['supplier', 'admin']);
            case 'edit':
            case 'delete':
                return !$taskId || $this->isTaskOwner($userId, $taskId) || $userRole === 'admin';
            default:
                return false;
        }
    }

    /**
     * 檢查業務實體權限
     */
    private function checkBusinessEntityPermission(string $userId, string $userRole, string $action, ?string $businessEntityId): bool
    {
        switch ($action) {
            case 'view':
                return !$businessEntityId || $this->hasBusinessEntityAccess($userId, $businessEntityId);
            case 'create':
                return true;
            case 'edit':
            case 'delete':
                return !$businessEntityId || $this->isBusinessEntityManager($userId, $businessEntityId) || $userRole === 'admin';
            default:
                return false;
        }
    }

    /**
     * 輔助方法
     */
    private function isTaskParticipant(string $userId, string $taskId): bool
    {
        return $this->db->exists('tasks', 'id = :task_id AND (supplier_id = :user_id)', [
            'task_id' => $taskId, 'user_id' => $userId
        ]) || $this->db->exists('task_applications', 'task_id = :task_id AND creator_id = :user_id', [
            'task_id' => $taskId, 'user_id' => $userId
        ]);
    }

    private function isTaskOwner(string $userId, string $taskId): bool
    {
        return $this->db->exists('tasks', 'id = :task_id AND supplier_id = :user_id', [
            'task_id' => $taskId, 'user_id' => $userId
        ]);
    }

    private function hasBusinessEntityAccess(string $userId, string $businessEntityId): bool
    {
        return $this->db->exists('user_business_permissions',
            'user_id = :user_id AND business_entity_id = :business_entity_id', [
            'user_id' => $userId, 'business_entity_id' => $businessEntityId
        ]);
    }

    private function isBusinessEntityManager(string $userId, string $businessEntityId): bool
    {
        return $this->db->exists('user_business_permissions',
            'user_id = :user_id AND business_entity_id = :business_entity_id AND permission_level = :level', [
            'user_id' => $userId, 'business_entity_id' => $businessEntityId, 'level' => 'manager'
        ]);
    }
}
