<?php

namespace App\Controllers;

use App\Services\ApiResponseService;
use App\Services\TaskStageService;
use App\Services\PermissionService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TaskStageController
{
    private ApiResponseService $apiResponse;
    private TaskStageService $taskStageService;
    private PermissionService $permissionService;

    public function __construct(
        ApiResponseService $apiResponse,
        TaskStageService $taskStageService,
        PermissionService $permissionService
    ) {
        $this->apiResponse = $apiResponse;
        $this->taskStageService = $taskStageService;
        $this->permissionService = $permissionService;
    }

    /**
     * 獲取任務進度信息
     */
    public function getTaskProgress(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'] ?? null;
            if (!$taskId) {
                return $this->apiResponse->badRequest($response, '任務ID不能為空');
            }

            $progress = $this->taskStageService->getTaskProgress($taskId);
            
            return $this->apiResponse->success($response, $progress, '任務進度獲取成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 轉換任務階段
     */
    public function transitionTask(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'] ?? null;
            if (!$taskId) {
                return $this->apiResponse->badRequest($response, '任務ID不能為空');
            }

            $data = $request->getParsedBody();
            $newStage = $data['new_stage'] ?? null;
            $reason = $data['reason'] ?? null;

            if (!$newStage) {
                return $this->apiResponse->badRequest($response, '新階段不能為空');
            }

            // 從JWT獲取用戶信息
            $user = $request->getAttribute('user');
            $userId = $user['id'] ?? null;

            if (!$userId) {
                return $this->apiResponse->unauthorized($response, '用戶未認證');
            }

            $result = $this->taskStageService->transitionTask($taskId, $newStage, $userId, $reason);
            
            return $this->apiResponse->success($response, $result, '任務階段轉換成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取任務儀表板
     */
    public function getTaskDashboard(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            $userId = $user['id'] ?? null;
            $role = $user['role'] ?? null;

            if (!$userId || !$role) {
                return $this->apiResponse->unauthorized($response, '用戶未認證或角色不明確');
            }

            $dashboard = $this->taskStageService->getTaskDashboard($userId, $role);
            
            return $this->apiResponse->success($response, $dashboard, '儀表板數據獲取成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取特定階段的任務
     */
    public function getTasksByStage(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            $userId = $user['id'] ?? null;
            $role = $user['role'] ?? null;

            if (!$userId || !$role) {
                return $this->apiResponse->unauthorized($response, '用戶未認證或角色不明確');
            }

            $stage = $request->getQueryParams()['stage'] ?? null;
            if (!$stage) {
                return $this->apiResponse->badRequest($response, '階段參數不能為空');
            }

            $tasks = $this->taskStageService->getTasksByStage($userId, $role, $stage);
            
            return $this->apiResponse->success($response, $tasks, '階段任務獲取成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取所有階段配置
     */
    public function getAllStages(Request $request, Response $response): Response
    {
        try {
            $stages = $this->taskStageService->getAllStages();
            
            return $this->apiResponse->success($response, $stages, '階段配置獲取成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 檢查任務截止日期
     */
    public function checkTaskDeadline(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'] ?? null;
            if (!$taskId) {
                return $this->apiResponse->badRequest($response, '任務ID不能為空');
            }

            $deadlineInfo = $this->taskStageService->checkTaskDeadline($taskId);
            
            return $this->apiResponse->success($response, $deadlineInfo, '截止日期檢查完成');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取任務階段歷史
     */
    public function getTaskStageHistory(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'] ?? null;
            if (!$taskId) {
                return $this->apiResponse->badRequest($response, '任務ID不能為空');
            }

            $progress = $this->taskStageService->getTaskProgress($taskId);
            $history = $progress['stage_history'] ?? [];
            
            return $this->apiResponse->success($response, $history, '階段歷史獲取成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取用戶任務統計
     */
    public function getUserTaskStats(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            $userId = $user['id'] ?? null;
            $role = $user['role'] ?? null;

            if (!$userId || !$role) {
                return $this->apiResponse->unauthorized($response, '用戶未認證或角色不明確');
            }

            $dashboard = $this->taskStageService->getTaskDashboard($userId, $role);
            $stats = [
                'total_tasks' => $dashboard['total_tasks'],
                'active_tasks' => $dashboard['active_tasks'],
                'completed_tasks' => $dashboard['completed_tasks'],
                'pending_actions' => $dashboard['pending_actions'],
                'stage_breakdown' => $dashboard['stage_breakdown']
            ];
            
            return $this->apiResponse->success($response, $stats, '任務統計獲取成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取推薦任務
     */
    public function getRecommendedTasks(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            $userId = $user['id'] ?? null;
            $role = $user['role'] ?? null;

            if (!$userId || !$role) {
                return $this->apiResponse->unauthorized($response, '用戶未認證或角色不明確');
            }

            // 根據角色獲取推薦任務
            $recommendedTasks = [];
            
            switch ($role) {
                case 'creator':
                    // 獲取符合創作者專長的任務
                    $recommendedTasks = $this->getCreatorRecommendedTasks($userId);
                    break;
                case 'supplier':
                    // 獲取供應商可能感興趣的創作者
                    $recommendedTasks = $this->getSupplierRecommendedCreators($userId);
                    break;
                case 'media':
                    // 獲取適合發布的任務
                    $recommendedTasks = $this->getMediaRecommendedTasks($userId);
                    break;
            }
            
            return $this->apiResponse->success($response, $recommendedTasks, '推薦任務獲取成功');
        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取創作者推薦任務
     */
    private function getCreatorRecommendedTasks(string $userId): array
    {
        // 這裡應該實現基於創作者專長和偏好的推薦算法
        // 暫時返回空數組，實際實現時需要複雜的推薦邏輯
        return [];
    }

    /**
     * 獲取供應商推薦創作者
     */
    private function getSupplierRecommendedCreators(string $userId): array
    {
        // 這裡應該實現基於任務需求和創作者能力的推薦算法
        return [];
    }

    /**
     * 獲取媒體推薦任務
     */
    private function getMediaRecommendedTasks(string $userId): array
    {
        // 這裡應該實現基於媒體平台特性和任務內容的推薦算法
        return [];
    }
}
