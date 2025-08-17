<?php

namespace App\Services;

use App\Services\DatabaseService;
use App\Services\PermissionService;
use App\Services\AuditService;

class UserManagementService
{
    private DatabaseService $db;
    private PermissionService $permissionService;
    private AuditService $auditService;

    public function __construct(
        DatabaseService $db,
        PermissionService $permissionService,
        AuditService $auditService
    ) {
        $this->db = $db;
        $this->permissionService = $permissionService;
        $this->auditService = $auditService;
    }

    /**
     * 編輯用戶資料
     */
    public function editUser(
        string $currentUserId,
        string $targetUserId,
        array $userData,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        // 檢查權限
        if (!$this->permissionService->canEditUser($currentUserId, $targetUserId)) {
            throw new \Exception('您沒有權限編輯此用戶的資料');
        }

        // 獲取舊值用於審計
        $oldValues = $this->getUserById($targetUserId);
        if (!$oldValues) {
            throw new \Exception('用戶不存在');
        }

        // 開始事務
        $this->db->beginTransaction();
        
        try {
            // 分離基本用戶資料和角色特定資料
            $basicUserData = array_intersect_key($userData, array_flip([
                'first_name', 'last_name', 'phone', 'avatar_url', 'bio', 'location', 'address', 'skills'
            ]));
            
            $roleSpecificData = array_diff_key($userData, $basicUserData);
            
            // 更新基本用戶資料
            if (!empty($basicUserData)) {
                $basicUserData['updated_by'] = $currentUserId;
                $this->db->update('users', $basicUserData, 'id = :id', ['id' => $targetUserId]);
            }
            
            // 更新角色特定資料
            if (!empty($roleSpecificData)) {
                $this->updateRoleProfile($targetUserId, $oldValues['role'], $roleSpecificData);
            }
            
            $this->db->commit();
            
            // 記錄審計日誌
            $newValues = array_merge($oldValues, $userData);
            $this->auditService->logUserEdit(
                $currentUserId,
                $targetUserId,
                $oldValues,
                $newValues,
                $ipAddress,
                $userAgent
            );
            
            return $this->getUserById($targetUserId);
            
        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 停用用戶帳戶
     */
    public function suspendUser(
        string $currentUserId,
        string $targetUserId,
        string $reason,
        ?string $suspensionUntil = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        // 檢查權限
        if (!$this->permissionService->canSuspendUser($currentUserId, $targetUserId)) {
            throw new \Exception('您沒有權限停用此用戶帳戶');
        }

        // 獲取舊值用於審計
        $oldValues = $this->getUserById($targetUserId);
        if (!$oldValues) {
            throw new \Exception('用戶不存在');
        }

        // 檢查是否已經是停用狀態
        if ($oldValues['is_suspended']) {
            throw new \Exception('用戶帳戶已經是停用狀態');
        }

        // 開始事務
        $this->db->beginTransaction();
        
        try {
            $updateData = [
                'is_suspended' => true,
                'suspension_reason' => $reason,
                'suspension_until' => $suspensionUntil,
                'updated_by' => $currentUserId
            ];
            
            $this->db->update('users', $updateData, 'id = :id', ['id' => $targetUserId]);
            
            $this->db->commit();
            
            // 記錄審計日誌
            $newValues = array_merge($oldValues, $updateData);
            $this->auditService->logUserSuspension(
                $currentUserId,
                $targetUserId,
                $oldValues,
                $newValues,
                $ipAddress,
                $userAgent
            );
            
            return $this->getUserById($targetUserId);
            
        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 啟用用戶帳戶
     */
    public function activateUser(
        string $currentUserId,
        string $targetUserId,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        // 檢查權限
        if (!$this->permissionService->canActivateUser($currentUserId)) {
            throw new \Exception('您沒有權限啟用用戶帳戶');
        }

        // 獲取舊值用於審計
        $oldValues = $this->getUserById($targetUserId);
        if (!$oldValues) {
            throw new \Exception('用戶不存在');
        }

        // 檢查是否已經是啟用狀態
        if (!$oldValues['is_suspended']) {
            throw new \Exception('用戶帳戶已經是啟用狀態');
        }

        // 開始事務
        $this->db->beginTransaction();
        
        try {
            $updateData = [
                'is_suspended' => false,
                'suspension_reason' => null,
                'suspension_until' => null,
                'updated_by' => $currentUserId
            ];
            
            $this->db->update('users', $updateData, 'id = :id', ['id' => $targetUserId]);
            
            $this->db->commit();
            
            // 記錄審計日誌
            $newValues = array_merge($oldValues, $updateData);
            $this->auditService->logUserActivation(
                $currentUserId,
                $targetUserId,
                $oldValues,
                $newValues,
                $ipAddress,
                $userAgent
            );
            
            return $this->getUserById($targetUserId);
            
        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 變更用戶角色
     */
    public function changeUserRole(
        string $currentUserId,
        string $targetUserId,
        string $newRole,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        // 檢查權限
        if (!$this->permissionService->isAdmin($currentUserId)) {
            throw new \Exception('只有管理員可以變更用戶角色');
        }

        // 獲取舊值用於審計
        $oldValues = $this->getUserById($targetUserId);
        if (!$oldValues) {
            throw new \Exception('用戶不存在');
        }

        // 檢查新角色是否有效
        $validRoles = ['supplier', 'creator', 'media', 'admin'];
        if (!in_array($newRole, $validRoles)) {
            throw new \Exception('無效的角色');
        }

        // 檢查是否已經是該角色
        if ($oldValues['role'] === $newRole) {
            throw new \Exception('用戶已經是該角色');
        }

        // 開始事務
        $this->db->beginTransaction();
        
        try {
            $updateData = [
                'role' => $newRole,
                'updated_by' => $currentUserId
            ];
            
            $this->db->update('users', $updateData, 'id = :id', ['id' => $targetUserId]);
            
            // 更新角色特定資料表
            $this->updateRoleProfileStructure($targetUserId, $oldValues['role'], $newRole);
            
            $this->db->commit();
            
            // 記錄審計日誌
            $newValues = array_merge($oldValues, $updateData);
            $this->auditService->logRoleChange(
                $currentUserId,
                $targetUserId,
                $oldValues,
                $newValues,
                $ipAddress,
                $userAgent
            );
            
            return $this->getUserById($targetUserId);
            
        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * 獲取用戶資料
     */
    public function getUserById(string $userId): ?array
    {
        $sql = "SELECT u.*, 
                       sp.company_name, sp.business_type, sp.verification_status as supplier_verification_status,
                       cp.portfolio_url, cp.verification_status as creator_verification_status,
                       mp.media_type, mp.verification_status as media_verification_status
                FROM users u
                LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
                LEFT JOIN creator_profiles cp ON u.id = cp.user_id
                LEFT JOIN media_profiles mp ON u.id = mp.user_id
                WHERE u.id = :user_id";
        
        $result = $this->db->fetchOne($sql, ['user_id' => $userId]);
        
        return $result ?: null;
    }

    /**
     * 獲取用戶列表（管理員用）
     */
    public function getUsers(
        int $limit = 50,
        int $offset = 0,
        ?string $role = null,
        ?string $status = null,
        ?string $search = null
    ): array {
        $whereConditions = [];
        $params = ['limit' => $limit, 'offset' => $offset];

        if ($role) {
            $whereConditions[] = "u.role = :role";
            $params['role'] = $role;
        }

        if ($status) {
            if ($status === 'active') {
                $whereConditions[] = "u.is_active = true AND u.is_suspended = false";
            } elseif ($status === 'suspended') {
                $whereConditions[] = "u.is_suspended = true";
            } elseif ($status === 'inactive') {
                $whereConditions[] = "u.is_active = false";
            }
        }

        if ($search) {
            $whereConditions[] = "(u.username ILIKE :search OR u.email ILIKE :search OR u.first_name ILIKE :search OR u.last_name ILIKE :search)";
            $params['search'] = "%$search%";
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        $sql = "SELECT u.*, 
                       sp.company_name, sp.business_type, sp.verification_status as supplier_verification_status,
                       cp.portfolio_url, cp.verification_status as creator_verification_status,
                       mp.media_type, mp.verification_status as media_verification_status
                FROM users u
                LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
                LEFT JOIN creator_profiles cp ON u.id = cp.user_id
                LEFT JOIN media_profiles mp ON u.id = mp.user_id
                $whereClause
                ORDER BY u.created_at DESC
                LIMIT :limit OFFSET :offset";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * 獲取用戶統計
     */
    public function getUserStats(): array
    {
        $sql = "SELECT 
                    role,
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_active = true AND is_suspended = false THEN 1 END) as active,
                    COUNT(CASE WHEN is_suspended = true THEN 1 END) as suspended,
                    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
                    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified
                FROM users
                GROUP BY role
                ORDER BY role";

        return $this->db->fetchAll($sql);
    }

    /**
     * 更新角色特定資料
     */
    private function updateRoleProfile(string $userId, string $role, array $data): void
    {
        $tableName = $role . '_profiles';
        
        // 檢查記錄是否存在
        $existing = $this->db->fetchOne(
            "SELECT id FROM $tableName WHERE user_id = :user_id",
            ['user_id' => $userId]
        );
        
        if ($existing) {
            // 更新現有記錄
            $this->db->update($tableName, $data, 'user_id = :user_id', ['user_id' => $userId]);
        } else {
            // 創建新記錄
            $data['user_id'] = $userId;
            $this->db->insert($tableName, $data);
        }
    }

    /**
     * 更新角色資料表結構
     */
    private function updateRoleProfileStructure(string $userId, string $oldRole, string $newRole): void
    {
        // 這裡可以添加角色變更時的資料遷移邏輯
        // 例如：從供應商變更為創作者時，需要遷移相關資料
        
        // 暫時只記錄角色變更，實際的資料遷移可以根據需求實現
    }

    /**
     * 檢查用戶是否可以執行特定操作
     */
    public function canPerformAction(string $userId, string $action, ?string $targetUserId = null): bool
    {
        switch ($action) {
            case 'edit_own':
                return $this->permissionService->hasPermission($userId, 'user.edit_own');
            
            case 'edit_others':
                return $this->permissionService->hasPermission($userId, 'user.edit_others');
            
            case 'suspend_own':
                return $this->permissionService->hasPermission($userId, 'user.suspend_own');
            
            case 'suspend_others':
                return $this->permissionService->hasPermission($userId, 'user.suspend_others');
            
            case 'activate':
                return $this->permissionService->hasPermission($userId, 'user.activate');
            
            case 'view_audit_logs':
                return $this->permissionService->hasPermission($userId, 'user.view_audit_logs');
            
            default:
                return false;
        }
    }
}
