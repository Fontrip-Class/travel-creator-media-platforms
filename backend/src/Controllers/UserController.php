<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\UserService;
use App\Services\PermissionService;
use App\Services\ApiResponseService;

/**
 * 用戶管理控制器
 * 處理用戶CRUD操作、權限管理等功能
 */
class UserController
{
    private UserService $userService;
    private PermissionService $permissionService;
    private ApiResponseService $apiResponse;

    public function __construct(
        UserService $userService,
        PermissionService $permissionService,
        ApiResponseService $apiResponse
    ) {
        $this->userService = $userService;
        $this->permissionService = $permissionService;
        $this->apiResponse = $apiResponse;
    }

    /**
     * 獲取用戶列表（管理員功能）
     */
    public function getUsers(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');

            // 權限檢查
            if (!$this->permissionService->hasPermission($userId, 'user', 'view')) {
                return $this->apiResponse->forbidden($response, '無權限查看用戶列表');
            }

            $queryParams = $request->getQueryParams();

            // 解析篩選參數
            $filters = [
                'role' => $queryParams['role'] ?? '',
                'status' => $queryParams['status'] ?? '',
                'search' => $queryParams['search'] ?? '',
                'location' => $queryParams['location'] ?? ''
            ];

            // 解析分頁參數
            $page = max(1, (int) ($queryParams['page'] ?? 1));
            $limit = min(100, max(1, (int) ($queryParams['limit'] ?? 20)));

            $result = $this->userService->getUsers($filters, $page, $limit);

            return $this->apiResponse->paginated($response, $result['users'], $result['pagination']);

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取單個用戶詳情
     */
    public function getUserById(Request $request, Response $response, array $args): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'view', $targetUserId)) {
                return $this->apiResponse->forbidden($response, '無權限查看該用戶資料');
            }

            $user = $this->userService->getUserWithEntities($targetUserId);

            if (!$user) {
                return $this->apiResponse->notFound($response, '用戶不存在');
            }

            // 移除敏感資訊
            unset($user['password_hash']);
            unset($user['reset_token']);

            return $this->apiResponse->success($response, $user, '用戶資料獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 創建新用戶（管理員功能）
     */
    public function createUser(Request $request, Response $response): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'create')) {
                return $this->apiResponse->forbidden($response, '無權限創建用戶');
            }

            $data = $request->getParsedBody();

            $userId = $this->userService->createUser($data);

            return $this->apiResponse->created($response, [
                'user_id' => $userId
            ], '用戶創建成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 更新用戶資料
     */
    public function updateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'edit', $targetUserId)) {
                return $this->apiResponse->forbidden($response, '無權限編輯該用戶資料');
            }

            $data = $request->getParsedBody();

            $success = $this->userService->updateUser($targetUserId, $data);

            if ($success) {
                return $this->apiResponse->success($response, null, '用戶資料更新成功');
            } else {
                return $this->apiResponse->error($response, '用戶資料更新失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 刪除用戶（管理員功能）
     */
    public function deleteUser(Request $request, Response $response, array $args): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'delete', $targetUserId)) {
                return $this->apiResponse->forbidden($response, '無權限刪除該用戶');
            }

            // 防止刪除自己
            if ($requestUserId === $targetUserId) {
                return $this->apiResponse->error($response, '無法刪除自己的帳戶', 400);
            }

            $success = $this->userService->deleteUser($targetUserId);

            if ($success) {
                return $this->apiResponse->noContent($response);
            } else {
                return $this->apiResponse->error($response, '用戶刪除失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 暫停用戶
     */
    public function suspendUser(Request $request, Response $response, array $args): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'manage', $targetUserId)) {
                return $this->apiResponse->forbidden($response, '無權限暫停該用戶');
            }

            $data = $request->getParsedBody();
            $reason = $data['reason'] ?? '管理員暫停';
            $suspensionUntil = $data['suspension_until'] ?? null;

            $success = $this->userService->suspendUser($targetUserId, $reason, $suspensionUntil);

            if ($success) {
                return $this->apiResponse->success($response, null, '用戶已被暫停');
            } else {
                return $this->apiResponse->error($response, '用戶暫停失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 啟用用戶
     */
    public function activateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'manage', $targetUserId)) {
                return $this->apiResponse->forbidden($response, '無權限啟用該用戶');
            }

            $success = $this->userService->activateUser($targetUserId);

            if ($success) {
                return $this->apiResponse->success($response, null, '用戶已被啟用');
            } else {
                return $this->apiResponse->error($response, '用戶啟用失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取用戶統計資料
     */
    public function getUserStats(Request $request, Response $response, array $args): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'view', $targetUserId)) {
                return $this->apiResponse->forbidden($response, '無權限查看該用戶統計');
            }

            $stats = $this->userService->getUserStats($targetUserId);

            return $this->apiResponse->success($response, $stats, '用戶統計獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取用戶權限
     */
    public function getUserPermissions(Request $request, Response $response, array $args): Response
    {
        try {
            $requestUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'];

            // 權限檢查
            if (!$this->permissionService->hasPermission($requestUserId, 'user', 'view', $targetUserId)) {
                return $this->apiResponse->forbidden($response, '無權限查看該用戶權限');
            }

            $permissions = $this->permissionService->getUserPermissions($targetUserId);

            return $this->apiResponse->success($response, $permissions, '用戶權限獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }
}
