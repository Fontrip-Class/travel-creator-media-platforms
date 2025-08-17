<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\PermissionService;
use App\Services\ApiResponseService;
use Respect\Validation\Validator as v;

class PermissionController
{
    private PermissionService $permissionService;
    private ApiResponseService $apiResponse;

    public function __construct(PermissionService $permissionService, ApiResponseService $apiResponse)
    {
        $this->permissionService = $permissionService;
        $this->apiResponse = $apiResponse;
    }

    /**
     * 檢查用戶權限
     */
    public function checkPermission(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            $permission = $queryParams['permission'] ?? null;
            
            if (!$userId || !$businessEntityId || !$permission) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            // 驗證權限類型
            $validPermissions = ['manage_users', 'manage_content', 'manage_finance', 'view_analytics', 'edit_profile'];
            if (!in_array($permission, $validPermissions)) {
                return $this->apiResponse->error($response, '無效的權限類型', 400);
            }
            
            $hasPermission = $this->permissionService->canManageBusinessEntity(
                $userId, 
                $businessEntityId, 
                $permission
            );
            
            $permissionLevel = $this->permissionService->getUserPermissionLevel($userId, $businessEntityId);
            
            $result = [
                'hasPermission' => $hasPermission,
                'permissionLevel' => $permissionLevel ? $permissionLevel['permission_level'] : 'none',
                'permissions' => $permissionLevel ? $permissionLevel['permissions'] : null
            ];
            
            return $this->apiResponse->success($response, $result, '權限檢查完成');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取用戶權限等級
     */
    public function getUserPermissionLevel(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $result = $this->permissionService->getUserPermissionLevel($userId, $businessEntityId);
            
            if (!$result) {
                return $this->apiResponse->error($response, '用戶沒有該業務實體的權限', 404);
            }
            
            return $this->apiResponse->success($response, $result, '獲取權限等級成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取用戶在業務實體中的所有權限
     */
    public function getUserPermissions(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $result = $this->permissionService->getUserPermissions($userId, $businessEntityId);
            
            return $this->apiResponse->success($response, $result, '獲取用戶權限成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 檢查用戶是否可以編輯業務實體資料
     */
    public function canEditProfile(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $canEdit = $this->permissionService->canEditBusinessEntityProfile($userId, $businessEntityId);
            
            $result = [
                'canEdit' => $canEdit,
                'message' => $canEdit ? '用戶可以編輯業務實體資料' : '用戶無權編輯業務實體資料'
            ];
            
            return $this->apiResponse->success($response, $result, '權限檢查完成');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 檢查用戶是否可以管理其他用戶
     */
    public function canManageUsers(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $canManage = $this->permissionService->canManageUsers($userId, $businessEntityId);
            
            $result = [
                'canManage' => $canManage,
                'message' => $canManage ? '用戶可以管理其他用戶' : '用戶無權管理其他用戶'
            ];
            
            return $this->apiResponse->success($response, $result, '權限檢查完成');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 檢查用戶是否可以管理內容
     */
    public function canManageContent(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $canManage = $this->permissionService->canManageContent($userId, $businessEntityId);
            
            $result = [
                'canManage' => $canManage,
                'message' => $canManage ? '用戶可以管理內容' : '用戶無權管理內容'
            ];
            
            return $this->apiResponse->success($response, $result, '權限檢查完成');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 檢查用戶是否可以管理財務
     */
    public function canManageFinance(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $canManage = $this->permissionService->canManageFinance($userId, $businessEntityId);
            
            $result = [
                'canManage' => $canManage,
                'message' => $canManage ? '用戶可以管理財務' : '用戶無權管理財務'
            ];
            
            return $this->apiResponse->success($response, $result, '權限檢查完成');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 檢查用戶是否可以查看分析數據
     */
    public function canViewAnalytics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $canView = $this->permissionService->canViewAnalytics($userId, $businessEntityId);
            
            $result = [
                'canView' => $canView,
                'message' => $canView ? '用戶可以查看分析數據' : '用戶無權查看分析數據'
            ];
            
            return $this->apiResponse->success($response, $result, '權限檢查完成');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取用戶權限摘要
     */
    public function getUserPermissionSummary(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $userId = $queryParams['user_id'] ?? null;
            $businessEntityId = $queryParams['business_entity_id'] ?? null;
            
            if (!$userId || !$businessEntityId) {
                return $this->apiResponse->error($response, '缺少必要參數', 400);
            }
            
            if (!v::uuid()->validate($userId) || !v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的ID格式', 400);
            }
            
            $permissionLevel = $this->permissionService->getUserPermissionLevel($userId, $businessEntityId);
            
            if (!$permissionLevel) {
                return $this->apiResponse->error($response, '用戶沒有該業務實體的權限', 404);
            }
            
            $summary = [
                'permission_level' => $permissionLevel['permission_level'],
                'permissions' => $permissionLevel['permissions'],
                'summary' => $this->generatePermissionSummary($permissionLevel['permissions'])
            ];
            
            return $this->apiResponse->success($response, $summary, '獲取權限摘要成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 生成權限摘要
     */
    private function generatePermissionSummary(array $permissions): array
    {
        $summary = [];
        
        if ($permissions['can_manage_users']) {
            $summary[] = '管理用戶權限';
        }
        
        if ($permissions['can_manage_content']) {
            $summary[] = '管理內容';
        }
        
        if ($permissions['can_manage_finance']) {
            $summary[] = '管理財務';
        }
        
        if ($permissions['can_view_analytics']) {
            $summary[] = '查看分析數據';
        }
        
        if ($permissions['can_edit_profile']) {
            $summary[] = '編輯基本資料';
        }
        
        if (empty($summary)) {
            $summary[] = '僅查看權限';
        }
        
        return $summary;
    }
}
