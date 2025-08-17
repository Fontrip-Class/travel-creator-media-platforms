<?php

namespace App\Services;

use PDO;

/**
 * 權限檢查服務
 * 實現簡化後的manager和user兩種權限等級的檢查邏輯
 */
class PermissionService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * 檢查用戶是否有權限管理特定業務實體
     */
    public function canManageBusinessEntity(
        string $userId, 
        string $businessEntityId, 
        string $permission
    ): bool {
        $stmt = $this->pdo->prepare("
            SELECT permission_level, can_manage_users, can_manage_content, 
                   can_manage_finance, can_view_analytics, can_edit_profile
            FROM user_business_permissions
            WHERE user_id = ? AND business_entity_id = ? AND is_active = TRUE
        ");
        
        $stmt->execute([$userId, $businessEntityId]);
        $permissions = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$permissions) {
            return false;
        }
        
        // 管理者擁有所有權限
        if ($permissions['permission_level'] === 'manager') {
            return true;
        }
        
        // 一般使用者根據具體權限進行檢查
        switch ($permission) {
            case 'manage_users':
                return $permissions['can_manage_users'];
            case 'manage_content':
                return $permissions['can_manage_content'];
            case 'manage_finance':
                return $permissions['can_manage_finance'];
            case 'view_analytics':
                return $permissions['can_view_analytics'];
            case 'edit_profile':
                return $permissions['can_edit_profile'];
            default:
                return false;
        }
    }

    /**
     * 獲取用戶在特定業務實體中的權限等級和詳細權限
     */
    public function getUserPermissionLevel(string $userId, string $businessEntityId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT permission_level, can_manage_users, can_manage_content, 
                   can_manage_finance, can_view_analytics, can_edit_profile
            FROM user_business_permissions
            WHERE user_id = ? AND business_entity_id = ? AND is_active = TRUE
        ");
        
        $stmt->execute([$userId, $businessEntityId]);
        $permissions = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$permissions) {
            return null;
        }
        
        return [
            'permission_level' => $permissions['permission_level'],
            'permissions' => [
                'can_manage_users' => $permissions['can_manage_users'],
                'can_manage_content' => $permissions['can_manage_content'],
                'can_manage_finance' => $permissions['can_manage_finance'],
                'can_view_analytics' => $permissions['can_view_analytics'],
                'can_edit_profile' => $permissions['can_edit_profile']
            ]
        ];
    }

    /**
     * 獲取用戶在特定業務實體中的所有權限
     */
    public function getUserPermissions(string $userId, string $businessEntityId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM user_business_permissions
            WHERE user_id = ? AND business_entity_id = ? AND is_active = TRUE
        ");
        
        $stmt->execute([$userId, $businessEntityId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * 檢查用戶是否可以編輯業務實體資料
     */
    public function canEditBusinessEntityProfile(string $userId, string $businessEntityId): bool
    {
        return $this->canManageBusinessEntity($userId, $businessEntityId, 'edit_profile');
    }

    /**
     * 檢查用戶是否可以管理其他用戶
     */
    public function canManageUsers(string $userId, string $businessEntityId): bool
    {
        return $this->canManageBusinessEntity($userId, $businessEntityId, 'manage_users');
    }

    /**
     * 檢查用戶是否可以管理內容
     */
    public function canManageContent(string $userId, string $businessEntityId): bool
    {
        return $this->canManageBusinessEntity($userId, $businessEntityId, 'manage_content');
    }

    /**
     * 檢查用戶是否可以管理財務
     */
    public function canManageFinance(string $userId, string $businessEntityId): bool
    {
        return $this->canManageBusinessEntity($userId, $businessEntityId, 'manage_finance');
    }

    /**
     * 檢查用戶是否可以查看分析數據
     */
    public function canViewAnalytics(string $userId, string $businessEntityId): bool
    {
        return $this->canManageBusinessEntity($userId, $businessEntityId, 'view_analytics');
    }

    /**
     * 檢查用戶是否為業務實體的管理者
     */
    public function isBusinessEntityManager(string $userId, string $businessEntityId): bool
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM user_business_permissions
            WHERE user_id = ? AND business_entity_id = ? 
            AND permission_level = 'manager' AND is_active = TRUE
        ");
        
        $stmt->execute([$userId, $businessEntityId]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * 檢查用戶是否為業務實體的一般使用者
     */
    public function isBusinessEntityUser(string $userId, string $businessEntityId): bool
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM user_business_permissions
            WHERE user_id = ? AND business_entity_id = ? 
            AND permission_level = 'user' AND is_active = TRUE
        ");
        
        $stmt->execute([$userId, $businessEntityId]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * 獲取用戶管理的所有業務實體
     */
    public function getUserManagedBusinessEntities(string $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT be.id, be.name, be.business_type, be.status,
                   ubp.permission_level, ubp.can_manage_users, ubp.can_manage_content,
                   ubp.can_manage_finance, ubp.can_view_analytics, ubp.can_edit_profile
            FROM business_entities be
            JOIN user_business_permissions ubp ON be.id = ubp.business_entity_id
            WHERE ubp.user_id = ? AND ubp.is_active = TRUE
            ORDER BY be.name
        ");
        
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * 獲取業務實體的所有管理者和使用者
     */
    public function getBusinessEntityUsers(string $businessEntityId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name,
                   r.name as role_name, r.display_name as role_display_name,
                   ubp.permission_level, ubp.can_manage_users, ubp.can_manage_content,
                   ubp.can_manage_finance, ubp.can_view_analytics, ubp.can_edit_profile,
                   ubp.granted_at, ubp.is_active
            FROM user_business_permissions ubp
            JOIN users u ON ubp.user_id = u.id
            JOIN roles r ON ubp.role_id = r.id
            WHERE ubp.business_entity_id = ? AND ubp.is_active = TRUE
            ORDER BY ubp.permission_level DESC, u.username
        ");
        
        $stmt->execute([$businessEntityId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * 分配業務實體權限
     */
    public function assignBusinessEntityPermission(array $permissionData): bool
    {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO user_business_permissions 
                (user_id, business_entity_id, role_id, permission_level,
                 can_manage_users, can_manage_content, can_manage_finance,
                 can_view_analytics, can_edit_profile, is_active, granted_at, granted_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP, ?)
            ");
            
            return $stmt->execute([
                $permissionData['user_id'],
                $permissionData['business_entity_id'],
                $permissionData['role_id'],
                $permissionData['permission_level'],
                $permissionData['can_manage_users'] ?? false,
                $permissionData['can_manage_content'] ?? false,
                $permissionData['can_manage_finance'] ?? false,
                $permissionData['can_view_analytics'] ?? false,
                $permissionData['can_edit_profile'] ?? true,
                $permissionData['granted_by']
            ]);
        } catch (\Exception $e) {
            error_log("分配業務實體權限失敗: " . $e->getMessage());
            return false;
        }
    }

    /**
     * 更新業務實體權限
     */
    public function updateBusinessEntityPermission(string $permissionId, array $permissionData): bool
    {
        try {
            $stmt = $this->pdo->prepare("
                UPDATE user_business_permissions 
                SET permission_level = ?, can_manage_users = ?, can_manage_content = ?,
                    can_manage_finance = ?, can_view_analytics = ?, can_edit_profile = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            
            return $stmt->execute([
                $permissionData['permission_level'],
                $permissionData['can_manage_users'] ?? false,
                $permissionData['can_manage_content'] ?? false,
                $permissionData['can_manage_finance'] ?? false,
                $permissionData['can_view_analytics'] ?? false,
                $permissionData['can_edit_profile'] ?? true,
                $permissionId
            ]);
        } catch (\Exception $e) {
            error_log("更新業務實體權限失敗: " . $e->getMessage());
            return false;
        }
    }

    /**
     * 移除業務實體權限
     */
    public function removeBusinessEntityPermission(string $permissionId): bool
    {
        try {
            $stmt = $this->pdo->prepare("
                DELETE FROM user_business_permissions WHERE id = ?
            ");
            
            return $stmt->execute([$permissionId]);
        } catch (\Exception $e) {
            error_log("移除業務實體權限失敗: " . $e->getMessage());
            return false;
        }
    }
}
