<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\UserRoleService;
use App\Services\ApiResponseService;
use Respect\Validation\Validator as v;

class UserRoleController
{
    private UserRoleService $userRoleService;
    private ApiResponseService $apiResponse;

    public function __construct(UserRoleService $userRoleService, ApiResponseService $apiResponse)
    {
        $this->userRoleService = $userRoleService;
        $this->apiResponse = $apiResponse;
    }

    /**
     * 為用戶分配角色
     */
    public function assignRole(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // 驗證資料
            $this->validateAssignRoleData($data);
            
            $result = $this->userRoleService->assignRole($data['user_id'], $data['role_name']);
            
            if (!$result) {
                return $this->apiResponse->error($response, '角色分配失敗', 400);
            }
            
            return $this->apiResponse->created($response, $result, '角色分配成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取用戶的角色列表
     */
    public function getUserRoles(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $args['id'];
            
            if (!v::uuid()->validate($userId)) {
                return $this->apiResponse->error($response, '無效的用戶ID', 400);
            }
            
            $result = $this->userRoleService->getUserRoles($userId);
            
            return $this->apiResponse->success($response, $result, '獲取用戶角色成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 移除用戶角色
     */
    public function removeRole(Request $request, Response $response, array $args): Response
    {
        try {
            $userRoleId = $args['id'];
            
            if (!v::uuid()->validate($userRoleId)) {
                return $this->apiResponse->error($response, '無效的用戶角色ID', 400);
            }
            
            $result = $this->userRoleService->removeRole($userRoleId);
            
            if (!$result) {
                return $this->apiResponse->error($response, '角色移除失敗', 400);
            }
            
            return $this->apiResponse->success($response, null, '角色移除成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取所有角色定義
     */
    public function getRoles(Request $request, Response $response): Response
    {
        try {
            $result = $this->userRoleService->getAllRoles();
            
            return $this->apiResponse->success($response, $result, '獲取角色列表成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取用戶角色摘要
     */
    public function getUserRolesSummary(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $args['id'];
            
            if (!v::uuid()->validate($userId)) {
                return $this->apiResponse->error($response, '無效的用戶ID', 400);
            }
            
            $result = $this->userRoleService->getUserRolesSummary($userId);
            
            return $this->apiResponse->success($response, $result, '獲取用戶角色摘要成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 批量分配角色
     */
    public function batchAssignRoles(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (empty($data['user_id']) || empty($data['role_names']) || !is_array($data['role_names'])) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($data['user_id'])) {
                return $this->apiResponse->error($response, '無效的用戶ID', 400);
            }
            
            $result = $this->userRoleService->batchAssignRoles($data['user_id'], $data['role_names']);
            
            return $this->apiResponse->success($response, $result, '批量角色分配成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 檢查用戶是否擁有特定角色
     */
    public function checkUserRole(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $roleName = $queryParams['role_name'] ?? null;
            
            if (!$userId || !$roleName) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId)) {
                return $this->apiResponse->error($response, '無效的用戶ID', 400);
            }
            
            $hasRole = $this->userRoleService->userHasRole($userId, $roleName);
            
            $result = [
                'user_id' => $userId,
                'role_name' => $roleName,
                'has_role' => $hasRole
            ];
            
            return $this->apiResponse->success($response, $result, '角色檢查完成');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取角色統計資訊
     */
    public function getRoleStats(Request $request, Response $response): Response
    {
        try {
            $result = $this->userRoleService->getRoleStats();
            
            return $this->apiResponse->success($response, $result, '獲取角色統計成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 驗證分配角色資料
     */
    private function validateAssignRoleData(array $data): void
    {
        if (empty($data['user_id'])) {
            throw new \InvalidArgumentException('用戶ID不能為空');
        }
        
        if (empty($data['role_name'])) {
            throw new \InvalidArgumentException('角色名稱不能為空');
        }
        
        if (!v::uuid()->validate($data['user_id'])) {
            throw new \InvalidArgumentException('無效的用戶ID格式');
        }
        
        // 驗證角色名稱是否有效
        $validRoles = ['supplier', 'creator', 'media', 'admin'];
        if (!in_array($data['role_name'], $validRoles)) {
            throw new \InvalidArgumentException('無效的角色名稱');
        }
    }
}
