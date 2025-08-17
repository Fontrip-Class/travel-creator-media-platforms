<?php

namespace App\Services;

use PDO;
use App\Repositories\UserRoleRepository;
use App\Repositories\RoleRepository;

/**
 * 用戶角色服務
 * 處理用戶角色的分配、移除和查詢邏輯
 */
class UserRoleService
{
    private PDO $pdo;
    private UserRoleRepository $userRoleRepository;
    private RoleRepository $roleRepository;

    public function __construct(
        PDO $pdo,
        UserRoleRepository $userRoleRepository,
        RoleRepository $roleRepository
    ) {
        $this->pdo = $pdo;
        $this->userRoleRepository = $userRoleRepository;
        $this->roleRepository = $roleRepository;
    }

    /**
     * 為用戶分配角色
     */
    public function assignRole(string $userId, string $roleName): ?array
    {
        try {
            // 檢查用戶是否已經擁有該角色
            if ($this->userHasRole($userId, $roleName)) {
                throw new \InvalidArgumentException('用戶已經擁有該角色');
            }

            // 獲取角色ID
            $role = $this->roleRepository->findByName($roleName);
            if (!$role) {
                throw new \InvalidArgumentException('角色不存在');
            }

            // 分配角色
            $userRoleId = $this->userRoleRepository->create([
                'user_id' => $userId,
                'role_id' => $role['id']
            ]);

            if ($userRoleId) {
                return $this->userRoleRepository->findById($userRoleId);
            }

            return null;

        } catch (\Exception $e) {
            error_log("分配角色失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 批量為用戶分配角色
     */
    public function batchAssignRoles(string $userId, array $roleNames): array
    {
        try {
            $this->pdo->beginTransaction();

            $results = [];
            foreach ($roleNames as $roleName) {
                try {
                    $result = $this->assignRole($userId, $roleName);
                    if ($result) {
                        $results[] = [
                            'role_name' => $roleName,
                            'success' => true,
                            'data' => $result
                        ];
                    } else {
                        $results[] = [
                            'role_name' => $roleName,
                            'success' => false,
                            'error' => '分配失敗'
                        ];
                    }
                } catch (\Exception $e) {
                    $results[] = [
                        'role_name' => $roleName,
                        'success' => false,
                        'error' => $e->getMessage()
                    ];
                }
            }

            $this->pdo->commit();
            return $results;

        } catch (\Exception $e) {
            $this->pdo->rollBack();
            error_log("批量分配角色失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 移除用戶角色
     */
    public function removeRole(string $userRoleId): bool
    {
        try {
            return $this->userRoleRepository->delete($userRoleId);
        } catch (\Exception $e) {
            error_log("移除角色失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 獲取用戶的所有角色
     */
    public function getUserRoles(string $userId): array
    {
        try {
            return $this->userRoleRepository->findByUserId($userId);
        } catch (\Exception $e) {
            error_log("獲取用戶角色失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 獲取所有角色定義
     */
    public function getAllRoles(): array
    {
        try {
            return $this->roleRepository->findAll();
        } catch (\Exception $e) {
            error_log("獲取角色列表失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 檢查用戶是否擁有特定角色
     */
    public function userHasRole(string $userId, string $roleName): bool
    {
        try {
            $userRoles = $this->getUserRoles($userId);
            
            foreach ($userRoles as $userRole) {
                if ($userRole['role_name'] === $roleName) {
                    return true;
                }
            }
            
            return false;

        } catch (\Exception $e) {
            error_log("檢查用戶角色失敗: " . $e->getMessage());
            return false;
        }
    }

    /**
     * 獲取用戶角色摘要
     */
    public function getUserRolesSummary(string $userId): array
    {
        try {
            $userRoles = $this->getUserRoles($userId);
            $summary = [];

            foreach ($userRoles as $userRole) {
                $summary[] = [
                    'user_role_id' => $userRole['id'],
                    'role_id' => $userRole['role_id'],
                    'role_name' => $userRole['role_name'],
                    'role_description' => $userRole['role_description'],
                    'assigned_at' => $userRole['created_at'],
                    'is_active' => $userRole['is_active']
                ];
            }

            return $summary;

        } catch (\Exception $e) {
            error_log("獲取用戶角色摘要失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 獲取角色統計資訊
     */
    public function getRoleStats(): array
    {
        try {
            $stats = [];
            $allRoles = $this->getAllRoles();

            foreach ($allRoles as $role) {
                $userCount = $this->userRoleRepository->countByRoleId($role['id']);
                $stats[] = [
                    'role_id' => $role['id'],
                    'role_name' => $role['name'],
                    'role_description' => $role['description'],
                    'user_count' => $userCount
                ];
            }

            return $stats;

        } catch (\Exception $e) {
            error_log("獲取角色統計失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 更新用戶角色狀態
     */
    public function updateUserRoleStatus(string $userRoleId, bool $isActive): bool
    {
        try {
            return $this->userRoleRepository->update($userRoleId, ['is_active' => $isActive]);
        } catch (\Exception $e) {
            error_log("更新用戶角色狀態失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 獲取擁有特定角色的所有用戶
     */
    public function getUsersByRole(string $roleName): array
    {
        try {
            $role = $this->roleRepository->findByName($roleName);
            if (!$role) {
                return [];
            }

            return $this->userRoleRepository->findUsersByRoleId($role['id']);

        } catch (\Exception $e) {
            error_log("獲取角色用戶列表失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 檢查用戶是否擁有管理員權限
     */
    public function userIsAdmin(string $userId): bool
    {
        return $this->userHasRole($userId, 'admin');
    }

    /**
     * 檢查用戶是否擁有供應商角色
     */
    public function userIsSupplier(string $userId): bool
    {
        return $this->userHasRole($userId, 'supplier');
    }

    /**
     * 檢查用戶是否擁有創作者角色
     */
    public function userIsCreator(string $userId): bool
    {
        return $this->userHasRole($userId, 'creator');
    }

    /**
     * 檢查用戶是否擁有媒體角色
     */
    public function userIsMedia(string $userId): bool
    {
        return $this->userHasRole($userId, 'media');
    }

    /**
     * 獲取用戶的主要角色（第一個分配的角色）
     */
    public function getUserPrimaryRole(string $userId): ?array
    {
        try {
            $userRoles = $this->getUserRoles($userId);
            return !empty($userRoles) ? $userRoles[0] : null;

        } catch (\Exception $e) {
            error_log("獲取用戶主要角色失敗: " . $e->getMessage());
            return null;
        }
    }

    /**
     * 驗證角色分配資料
     */
    public function validateRoleAssignment(string $userId, string $roleName): array
    {
        $errors = [];

        if (empty($userId)) {
            $errors[] = '用戶ID不能為空';
        }

        if (empty($roleName)) {
            $errors[] = '角色名稱不能為空';
        }

        if (!empty($userId) && !$this->isValidUuid($userId)) {
            $errors[] = '無效的用戶ID格式';
        }

        if (!empty($roleName) && !in_array($roleName, ['supplier', 'creator', 'media', 'admin'])) {
            $errors[] = '無效的角色名稱';
        }

        return $errors;
    }

    /**
     * 檢查UUID格式是否有效
     */
    private function isValidUuid(string $uuid): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $uuid);
    }
}
