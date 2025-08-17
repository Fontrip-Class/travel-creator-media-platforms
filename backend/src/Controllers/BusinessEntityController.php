<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\BusinessEntityService;
use App\Services\PermissionService;
use App\Services\ApiResponseService;
use Respect\Validation\Validator as v;

class BusinessEntityController
{
    private BusinessEntityService $businessEntityService;
    private PermissionService $permissionService;
    private ApiResponseService $apiResponse;

    public function __construct(
        BusinessEntityService $businessEntityService,
        PermissionService $permissionService,
        ApiResponseService $apiResponse
    ) {
        $this->businessEntityService = $businessEntityService;
        $this->permissionService = $permissionService;
        $this->apiResponse = $apiResponse;
    }

    /**
     * 創建業務實體
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // 驗證必填欄位
            $this->validateBusinessEntityData($data);
            
            $result = $this->businessEntityService->createBusinessEntity($data);
            
            return $this->apiResponse->created($response, $result, '業務實體創建成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取業務實體列表
     */
    public function index(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $filters = $this->parseFilters($queryParams);
            
            $result = $this->businessEntityService->getBusinessEntities($filters);
            
            return $this->apiResponse->success($response, $result, '獲取業務實體列表成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取單個業務實體
     */
    public function show(Request $request, Response $response, array $args): Response
    {
        try {
            $id = $args['id'];
            
            if (!v::uuid()->validate($id)) {
                return $this->apiResponse->error($response, '無效的業務實體ID', 400);
            }
            
            $result = $this->businessEntityService->getBusinessEntity($id);
            
            if (!$result) {
                return $this->apiResponse->error($response, '業務實體不存在', 404);
            }
            
            return $this->apiResponse->success($response, $result, '獲取業務實體成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 更新業務實體
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $id = $args['id'];
            $data = $request->getParsedBody();
            
            if (!v::uuid()->validate($id)) {
                return $this->apiResponse->error($response, '無效的業務實體ID', 400);
            }
            
            // 驗證更新資料
            $this->validateBusinessEntityUpdateData($data);
            
            $result = $this->businessEntityService->updateBusinessEntity($id, $data);
            
            if (!$result) {
                return $this->apiResponse->error($response, '業務實體不存在或更新失敗', 404);
            }
            
            return $this->apiResponse->success($response, $result, '業務實體更新成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 刪除業務實體
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $id = $args['id'];
            
            if (!v::uuid()->validate($id)) {
                return $this->apiResponse->error($response, '無效的業務實體ID', 400);
            }
            
            $result = $this->businessEntityService->deleteBusinessEntity($id);
            
            if (!$result) {
                return $this->apiResponse->error($response, '業務實體不存在或刪除失敗', 404);
            }
            
            return $this->apiResponse->success($response, null, '業務實體刪除成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取業務實體權限列表
     */
    public function getPermissions(Request $request, Response $response, array $args): Response
    {
        try {
            $businessEntityId = $args['id'];
            
            if (!v::uuid()->validate($businessEntityId)) {
                return $this->apiResponse->error($response, '無效的業務實體ID', 400);
            }
            
            $result = $this->permissionService->getBusinessEntityPermissions($businessEntityId);
            
            return $this->apiResponse->success($response, $result, '獲取權限列表成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 分配業務實體權限
     */
    public function assignPermission(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // 驗證權限資料
            $this->validatePermissionData($data);
            
            $result = $this->permissionService->assignBusinessEntityPermission($data);
            
            if (!$result) {
                return $this->apiResponse->error($response, '權限分配失敗', 400);
            }
            
            return $this->apiResponse->created($response, $result, '權限分配成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 更新業務實體權限
     */
    public function updatePermission(Request $request, Response $response, array $args): Response
    {
        try {
            $permissionId = $args['id'];
            $data = $request->getParsedBody();
            
            if (!v::uuid()->validate($permissionId)) {
                return $this->apiResponse->error($response, '無效的權限ID', 400);
            }
            
            // 驗證權限更新資料
            $this->validatePermissionUpdateData($data);
            
            $result = $this->permissionService->updateBusinessEntityPermission($permissionId, $data);
            
            if (!$result) {
                return $this->apiResponse->error($response, '權限更新失敗', 400);
            }
            
            return $this->apiResponse->success($response, $result, '權限更新成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 移除業務實體權限
     */
    public function removePermission(Request $request, Response $response, array $args): Response
    {
        try {
            $permissionId = $args['id'];
            
            if (!v::uuid()->validate($permissionId)) {
                return $this->apiResponse->error($response, '無效的權限ID', 400);
            }
            
            $result = $this->permissionService->removeBusinessEntityPermission($permissionId);
            
            if (!$result) {
                return $this->apiResponse->error($response, '權限移除失敗', 400);
            }
            
            return $this->apiResponse->success($response, null, '權限移除成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
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
            
            $hasPermission = $this->permissionService->canManageBusinessEntity(
                $userId, 
                $businessEntityId, 
                $permission
            );
            
            $permissionLevel = $this->permissionService->getUserPermissionLevel($userId, $businessEntityId);
            
            $result = [
                'hasPermission' => $hasPermission,
                'permissionLevel' => $permissionLevel ? $permissionLevel['permission_level'] : 'none'
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
     * 驗證業務實體創建資料
     */
    private function validateBusinessEntityData(array $data): void
    {
        if (empty($data['name'])) {
            throw new \InvalidArgumentException('業務實體名稱不能為空');
        }
        
        if (empty($data['type'])) {
            throw new \InvalidArgumentException('業務實體類型不能為空');
        }
        
        if (empty($data['description'])) {
            throw new \InvalidArgumentException('業務實體描述不能為空');
        }
        
        // 驗證類型是否有效
        $validTypes = ['supplier', 'koc', 'media'];
        if (!in_array($data['type'], $validTypes)) {
            throw new \InvalidArgumentException('無效的業務實體類型');
        }
    }

    /**
     * 驗證業務實體更新資料
     */
    private function validateBusinessEntityUpdateData(array $data): void
    {
        if (isset($data['name']) && empty($data['name'])) {
            throw new \InvalidArgumentException('業務實體名稱不能為空');
        }
        
        if (isset($data['type'])) {
            $validTypes = ['supplier', 'koc', 'media'];
            if (!in_array($data['type'], $validTypes)) {
                throw new \InvalidArgumentException('無效的業務實體類型');
            }
        }
        
        if (isset($data['status'])) {
            $validStatuses = ['active', 'inactive', 'pending'];
            if (!in_array($data['status'], $validStatuses)) {
                throw new \InvalidArgumentException('無效的狀態值');
            }
        }
    }

    /**
     * 驗證權限資料
     */
    private function validatePermissionData(array $data): void
    {
        $requiredFields = ['user_id', 'business_entity_id', 'role_id', 'permission_level'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("缺少必要欄位: {$field}");
            }
        }
        
        if (!v::uuid()->validate($data['user_id'])) {
            throw new \InvalidArgumentException('無效的用戶ID');
        }
        
        if (!v::uuid()->validate($data['business_entity_id'])) {
            throw new \InvalidArgumentException('無效的業務實體ID');
        }
        
        if (!v::uuid()->validate($data['role_id'])) {
            throw new \InvalidArgumentException('無效的角色ID');
        }
        
        $validPermissionLevels = ['manager', 'user'];
        if (!in_array($data['permission_level'], $validPermissionLevels)) {
            throw new \InvalidArgumentException('無效的權限等級');
        }
    }

    /**
     * 驗證權限更新資料
     */
    private function validatePermissionUpdateData(array $data): void
    {
        if (isset($data['permission_level'])) {
            $validPermissionLevels = ['manager', 'user'];
            if (!in_array($data['permission_level'], $validPermissionLevels)) {
                throw new \InvalidArgumentException('無效的權限等級');
            }
        }
        
        // 驗證布林值欄位
        $booleanFields = ['can_manage_users', 'can_manage_content', 'can_manage_finance', 'can_view_analytics', 'can_edit_profile'];
        foreach ($booleanFields as $field) {
            if (isset($data[$field]) && !is_bool($data[$field])) {
                throw new \InvalidArgumentException("欄位 {$field} 必須是布林值");
            }
        }
    }

    /**
     * 解析過濾器參數
     */
    private function parseFilters(array $queryParams): array
    {
        $filters = [];
        
        if (isset($queryParams['type'])) {
            $filters['type'] = $queryParams['type'];
        }
        
        if (isset($queryParams['status'])) {
            $filters['status'] = $queryParams['status'];
        }
        
        if (isset($queryParams['search'])) {
            $filters['search'] = $queryParams['search'];
        }
        
        if (isset($queryParams['limit'])) {
            $filters['limit'] = (int) $queryParams['limit'];
        }
        
        if (isset($queryParams['offset'])) {
            $filters['offset'] = (int) $queryParams['offset'];
        }
        
        return $filters;
    }
}
