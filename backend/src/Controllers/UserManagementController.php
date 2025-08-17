<?php

namespace App\Controllers;

use App\Services\ApiResponseService;
use App\Services\UserManagementService;
use App\Services\PermissionService;
use App\Services\AuditService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserManagementController
{
    private ApiResponseService $apiResponse;
    private UserManagementService $userManagementService;
    private PermissionService $permissionService;
    private AuditService $auditService;

    public function __construct(
        ApiResponseService $apiResponse,
        UserManagementService $userManagementService,
        PermissionService $permissionService,
        AuditService $auditService
    ) {
        $this->apiResponse = $apiResponse;
        $this->userManagementService = $userManagementService;
        $this->permissionService = $permissionService;
        $this->auditService = $auditService;
    }

    /**
     * 編輯用戶資料
     */
    public function editUser(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'] ?? $currentUserId;
            $data = $request->getParsedBody();

            // 獲取客戶端IP和User-Agent
            $ipAddress = $request->getServerParams()['REMOTE_ADDR'] ?? null;
            $userAgent = $request->getServerParams()['HTTP_USER_AGENT'] ?? null;

            // 驗證必要欄位
            if (empty($data)) {
                return $this->apiResponse->badRequest($response, '請提供要更新的資料');
            }

            // 執行編輯操作
            $result = $this->userManagementService->editUser(
                $currentUserId,
                $targetUserId,
                $data,
                $ipAddress,
                $userAgent
            );

            return $this->apiResponse->success($response, $result, '用戶資料更新成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 停用用戶帳戶
     */
    public function suspendUser(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'] ?? $currentUserId;
            $data = $request->getParsedBody();

            // 獲取客戶端IP和User-Agent
            $ipAddress = $request->getServerParams()['REMOTE_ADDR'] ?? null;
            $userAgent = $request->getServerParams()['HTTP_USER_AGENT'] ?? null;

            // 驗證必要欄位
            if (empty($data['reason'])) {
                return $this->apiResponse->badRequest($response, '請提供停用原因');
            }

            $reason = $data['reason'];
            $suspensionUntil = $data['suspension_until'] ?? null;

            // 執行停用操作
            $result = $this->userManagementService->suspendUser(
                $currentUserId,
                $targetUserId,
                $reason,
                $suspensionUntil,
                $ipAddress,
                $userAgent
            );

            return $this->apiResponse->success($response, $result, '用戶帳戶已停用');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 啟用用戶帳戶
     */
    public function activateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            if (empty($targetUserId)) {
                return $this->apiResponse->badRequest($response, '請提供要啟用的用戶ID');
            }

            // 獲取客戶端IP和User-Agent
            $ipAddress = $request->getServerParams()['REMOTE_ADDR'] ?? null;
            $userAgent = $request->getServerParams()['HTTP_USER_AGENT'] ?? null;

            // 執行啟用操作
            $result = $this->userManagementService->activateUser(
                $currentUserId,
                $targetUserId,
                $ipAddress,
                $userAgent
            );

            return $this->apiResponse->success($response, $result, '用戶帳戶已啟用');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 變更用戶角色
     */
    public function changeUserRole(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];
            $data = $request->getParsedBody();

            // 獲取客戶端IP和User-Agent
            $ipAddress = $request->getServerParams()['REMOTE_ADDR'] ?? null;
            $userAgent = $request->getServerParams()['HTTP_USER_AGENT'] ?? null;

            // 驗證必要欄位
            if (empty($data['role'])) {
                return $this->apiResponse->badRequest($response, '請提供新的角色');
            }

            $newRole = $data['role'];

            // 執行角色變更操作
            $result = $this->userManagementService->changeUserRole(
                $currentUserId,
                $targetUserId,
                $newRole,
                $ipAddress,
                $userAgent
            );

            return $this->apiResponse->success($response, $result, '用戶角色變更成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取用戶資料
     */
    public function getUser(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'] ?? $currentUserId;

            // 檢查權限
            if ($targetUserId !== $currentUserId && !$this->permissionService->canEditUser($currentUserId, $targetUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看此用戶的資料');
            }

            $user = $this->userManagementService->getUserById($targetUserId);
            if (!$user) {
                return $this->apiResponse->notFound($response, '用戶不存在');
            }

            return $this->apiResponse->success($response, $user, '用戶資料獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取用戶列表（管理員用）
     */
    public function getUsers(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看用戶列表');
            }

            // 獲取查詢參數
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 50);
            $offset = (int) ($queryParams['offset'] ?? 0);
            $role = $queryParams['role'] ?? null;
            $status = $queryParams['status'] ?? null;
            $search = $queryParams['search'] ?? null;

            // 限制查詢範圍
            $limit = min(max($limit, 1), 100);
            $offset = max($offset, 0);

            $users = $this->userManagementService->getUsers($limit, $offset, $role, $status, $search);

            return $this->apiResponse->success($response, $users, '用戶列表獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取用戶統計（管理員用）
     */
    public function getUserStats(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看用戶統計');
            }

            $stats = $this->userManagementService->getUserStats();

            return $this->apiResponse->success($response, $stats, '用戶統計獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取用戶權限
     */
    public function getUserPermissions(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'] ?? $currentUserId;

            // 檢查權限
            if ($targetUserId !== $currentUserId && !$this->permissionService->canEditUser($currentUserId, $targetUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看此用戶的權限');
            }

            $permissions = $this->permissionService->getUserPermissions($targetUserId);

            return $this->apiResponse->success($response, $permissions, '用戶權限獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取角色權限
     */
    public function getRolePermissions(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $role = $args['role'];

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看角色權限');
            }

            $permissions = $this->permissionService->getRolePermissions($role);

            return $this->apiResponse->success($response, $permissions, '角色權限獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 檢查用戶權限
     */
    public function checkPermission(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();

            if (empty($data['permission'])) {
                return $this->apiResponse->badRequest($response, '請提供要檢查的權限');
            }

            $permission = $data['permission'];
            $hasPermission = $this->permissionService->hasPermission($currentUserId, $permission);

            return $this->apiResponse->success($response, [
                'permission' => $permission,
                'has_permission' => $hasPermission
            ], '權限檢查完成');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取當前用戶的權限摘要
     */
    public function getCurrentUserPermissions(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            $permissions = $this->permissionService->getUserPermissions($currentUserId);
            $user = $this->userManagementService->getUserById($currentUserId);

            $result = [
                'user' => $user,
                'permissions' => $permissions,
                'can_edit_own' => $this->permissionService->hasPermission($currentUserId, 'user.edit_own'),
                'can_edit_others' => $this->permissionService->hasPermission($currentUserId, 'user.edit_others'),
                'can_suspend_own' => $this->permissionService->hasPermission($currentUserId, 'user.suspend_own'),
                'can_suspend_others' => $this->permissionService->hasPermission($currentUserId, 'user.suspend_others'),
                'can_activate' => $this->permissionService->hasPermission($currentUserId, 'user.activate'),
                'can_view_audit_logs' => $this->permissionService->hasPermission($currentUserId, 'user.view_audit_logs'),
                'is_admin' => $this->permissionService->isAdmin($currentUserId)
            ];

            return $this->apiResponse->success($response, $result, '用戶權限摘要獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }
}
