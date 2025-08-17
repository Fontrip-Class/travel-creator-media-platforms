<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\TaskService;
use App\Services\ApiResponseService;
use Respect\Validation\Validator as v;

class TaskController
{
    private TaskService $taskService;
    private ApiResponseService $apiResponse;

    public function __construct(TaskService $taskService, ApiResponseService $apiResponse)
    {
        $this->taskService = $taskService;
        $this->apiResponse = $apiResponse;
    }

    public function createTask(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // 驗證輸入資料
            $this->validateCreateTaskData($data);
            
            // 從JWT獲取用戶ID
            $userId = $request->getAttribute('user_id');
            $data['supplier_id'] = $userId;
            
            $taskId = $this->taskService->createTask($data);
            
            return $this->apiResponse->created($response, [
                'task_id' => $taskId
            ], '任務創建成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getTasks(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            // 解析分頁參數
            $page = max(1, (int) ($queryParams['page'] ?? 1));
            $limit = min(100, max(1, (int) ($queryParams['limit'] ?? 20)));
            
            // 解析篩選參數
            $filters = [];
            
            if (!empty($queryParams['status'])) {
                $filters['status'] = $queryParams['status'];
            }
            
            if (!empty($queryParams['content_type'])) {
                $filters['content_type'] = $queryParams['content_type'];
            }
            
            if (!empty($queryParams['budget_min'])) {
                $filters['budget_min'] = (float) $queryParams['budget_min'];
            }
            
            if (!empty($queryParams['budget_max'])) {
                $filters['budget_max'] = (float) $queryParams['budget_max'];
            }
            
            if (!empty($queryParams['tags'])) {
                $filters['tags'] = explode(',', $queryParams['tags']);
            }
            
            if (!empty($queryParams['search'])) {
                $filters['search'] = trim($queryParams['search']);
            }
            
            // 地點篩選
            if (!empty($queryParams['lat']) && !empty($queryParams['lng'])) {
                $filters['location'] = [
                    'lat' => (float) $queryParams['lat'],
                    'lng' => (float) $queryParams['lng'],
                    'radius' => (int) ($queryParams['radius'] ?? 50000)
                ];
            }
            
            $result = $this->taskService->getTasks($filters, $page, $limit);
            
            return $this->apiResponse->paginated($response, $result['tasks'], $result['pagination']);
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getTaskById(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];
            
            if (!v::uuid()->validate($taskId)) {
                return $this->apiResponse->error($response, '無效的任務ID', 400);
            }
            
            $task = $this->taskService->getTaskById($taskId);
            
            if (!$task) {
                return $this->apiResponse->notFound($response, '任務不存在');
            }
            
            return $this->apiResponse->success($response, $task, '任務獲取成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function updateTask(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];
            $data = $request->getParsedBody();
            
            if (!v::uuid()->validate($taskId)) {
                return $this->apiResponse->error($response, '無效的任務ID', 400);
            }
            
            // 驗證更新資料
            $this->validateUpdateTaskData($data);
            
            $this->taskService->updateTask($taskId, $data);
            
            return $this->apiResponse->success($response, null, '任務更新成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function deleteTask(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];
            
            if (!v::uuid()->validate($taskId)) {
                return $this->apiResponse->error($response, '無效的任務ID', 400);
            }
            
            $userId = $request->getAttribute('user_id');
            $this->taskService->deleteTask($taskId, $userId);
            
            return $this->apiResponse->noContent($response);
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function applyForTask(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];
            $data = $request->getParsedBody();
            
            if (!v::uuid()->validate($taskId)) {
                return $this->apiResponse->error($response, '無效的任務ID', 400);
            }
            
            // 驗證申請資料
            $this->validateApplicationData($data);
            
            $creatorId = $request->getAttribute('user_id');
            $applicationId = $this->taskService->applyForTask($taskId, $creatorId, $data);
            
            return $this->apiResponse->created($response, [
                'application_id' => $applicationId
            ], '任務申請提交成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getMatchingCreators(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];
            $queryParams = $request->getQueryParams();
            
            if (!v::uuid()->validate($taskId)) {
                return $this->apiResponse->error($response, '無效的任務ID', 400);
            }
            
            $limit = min(50, max(1, (int) ($queryParams['limit'] ?? 10)));
            
            $creators = $this->taskService->findMatchingCreators($taskId, $limit);
            
            return $this->apiResponse->success($response, $creators, '匹配創作者獲取成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getTaskRecommendations(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $userId = $request->getAttribute('user_id');
            
            $limit = min(50, max(1, (int) ($queryParams['limit'] ?? 10)));
            
            $recommendations = $this->taskService->getTaskRecommendations($userId, $limit);
            
            return $this->apiResponse->success($response, $recommendations, '任務推薦獲取成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function rateApplication(Request $request, Response $response, array $args): Response
    {
        try {
            $applicationId = $args['id'];
            $data = $request->getParsedBody();
            
            if (!v::uuid()->validate($applicationId)) {
                return $this->apiResponse->error($response, '無效的申請ID', 400);
            }
            
            // 驗證評分資料
            $this->validateRatingData($data);
            
            $raterId = $request->getAttribute('user_id');
            $this->taskService->rateTaskApplication(
                $applicationId,
                $raterId,
                $data['rating'],
                $data['feedback'] ?? ''
            );
            
            return $this->apiResponse->success($response, null, '評分提交成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getPublicTasks(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $page = max(1, (int) ($queryParams['page'] ?? 1));
            $limit = min(50, max(1, (int) ($queryParams['limit'] ?? 20)));
            
            $filters = ['status' => 'open'];
            
            if (!empty($queryParams['content_type'])) {
                $filters['content_type'] = $queryParams['content_type'];
            }
            
            if (!empty($queryParams['search'])) {
                $filters['search'] = trim($queryParams['search']);
            }
            
            $result = $this->taskService->getTasks($filters, $page, $limit);
            
            return $this->apiResponse->paginated($response, $result['tasks'], $result['pagination']);
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    private function validateCreateTaskData(array $data): void
    {
        $validator = v::key('title', v::stringType()->length(5, 200))
                     ->key('description', v::stringType()->length(10, 2000))
                     ->key('requirements', v::optional(v::stringType()->length(0, 1000)))
                     ->key('budget_min', v::optional(v::numeric()->positive()))
                     ->key('budget_max', v::optional(v::numeric()->positive()))
                     ->key('content_type', v::optional(v::stringType()->length(1, 50)))
                     ->key('deadline', v::optional(v::date()))
                     ->key('tags', v::optional(v::arrayType()->each(v::stringType())))
                     ->key('location', v::optional(v::arrayType()->key('lat', v::numeric())->key('lng', v::numeric())));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('任務資料驗證失敗: ' . $e->getMessage());
        }

        // 額外驗證
        if (isset($data['budget_min']) && isset($data['budget_max'])) {
            if ($data['budget_min'] > $data['budget_max']) {
                throw new \InvalidArgumentException('最低預算不能高於最高預算');
            }
        }

        if (isset($data['deadline'])) {
            $deadline = strtotime($data['deadline']);
            if ($deadline < time()) {
                throw new \InvalidArgumentException('截止日期不能是過去時間');
            }
        }
    }

    private function validateUpdateTaskData(array $data): void
    {
        $validator = v::key('title', v::optional(v::stringType()->length(5, 200)))
                     ->key('description', v::optional(v::stringType()->length(10, 2000)))
                     ->key('requirements', v::optional(v::stringType()->length(0, 1000)))
                     ->key('budget_min', v::optional(v::numeric()->positive()))
                     ->key('budget_max', v::optional(v::numeric()->positive()))
                     ->key('content_type', v::optional(v::stringType()->length(1, 50)))
                     ->key('deadline', v::optional(v::date()))
                     ->key('tags', v::optional(v::arrayType()->each(v::stringType())))
                     ->key('status', v::optional(v::in(['open', 'in_progress', 'completed', 'cancelled'])));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('更新資料驗證失敗: ' . $e->getMessage());
        }
    }

    private function validateApplicationData(array $data): void
    {
        $validator = v::key('proposal', v::stringType()->length(10, 2000))
                     ->key('proposed_budget', v::optional(v::numeric()->positive()))
                     ->key('estimated_duration', v::optional(v::stringType()->length(1, 100)))
                     ->key('portfolio_samples', v::optional(v::arrayType()));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('申請資料驗證失敗: ' . $e->getMessage());
        }
    }

    private function validateRatingData(array $data): void
    {
        $validator = v::key('rating', v::intVal()->between(1, 5))
                     ->key('feedback', v::optional(v::stringType()->length(0, 500)));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('評分資料驗證失敗: ' . $e->getMessage());
        }
    }

    // 草稿相關方法
    public function saveTaskDraft(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            $data['user_id'] = $request->getAttribute('user')['user_id'];
            $data['is_draft'] = true;
            
            $result = $this->taskService->saveTaskDraft($data);
            return $this->apiResponse->success($response, '草稿保存成功', $result);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getTaskDrafts(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user')['user_id'];
            $page = (int) ($request->getQueryParams()['page'] ?? 1);
            $limit = min(50, max(1, (int) ($request->getQueryParams()['limit'] ?? 20)));
            
            $result = $this->taskService->getTaskDrafts($userId, $page, $limit);
            return $this->apiResponse->paginated($response, $result['drafts'], $result['pagination']);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getTaskDraft(Request $request, Response $response, array $args): Response
    {
        try {
            $draftId = $args['id'];
            $userId = $request->getAttribute('user')['user_id'];
            
            $draft = $this->taskService->getTaskDraft($draftId, $userId);
            return $this->apiResponse->success($response, '草稿獲取成功', $draft);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function updateTaskDraft(Request $request, Response $response, array $args): Response
    {
        try {
            $draftId = $args['id'];
            $data = $request->getParsedBody();
            $userId = $request->getAttribute('user')['user_id'];
            
            $result = $this->taskService->updateTaskDraft($draftId, $data, $userId);
            return $this->apiResponse->success($response, '草稿更新成功', $result);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function deleteTaskDraft(Request $request, Response $response, array $args): Response
    {
        try {
            $draftId = $args['id'];
            $userId = $request->getAttribute('user')['user_id'];
            
            $this->taskService->deleteTaskDraft($draftId, $userId);
            return $this->apiResponse->success($response, '草稿刪除成功');
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function publishTaskDraft(Request $request, Response $response, array $args): Response
    {
        try {
            $draftId = $args['id'];
            $userId = $request->getAttribute('user')['user_id'];
            
            $result = $this->taskService->publishTaskDraft($draftId, $userId);
            return $this->apiResponse->success($response, '草稿發布成功', $result);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    // 申請相關方法
    public function getTaskApplications(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];
            $page = (int) ($request->getQueryParams()['page'] ?? 1);
            $limit = min(50, max(1, (int) ($request->getQueryParams()['limit'] ?? 20)));
            
            $result = $this->taskService->getTaskApplications($taskId, $page, $limit);
            return $this->apiResponse->paginated($response, $result['applications'], $result['pagination']);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function updateApplication(Request $request, Response $response, array $args): Response
    {
        try {
            $applicationId = $args['id'];
            $data = $request->getParsedBody();
            $userId = $request->getAttribute('user')['user_id'];
            
            $result = $this->taskService->updateApplication($applicationId, $data, $userId);
            return $this->apiResponse->success($response, '申請更新成功', $result);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    // 評分相關方法
    public function getTaskRatings(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];
            $page = (int) ($request->getQueryParams()['page'] ?? 1);
            $limit = min(50, max(1, (int) ($request->getQueryParams()['limit'] ?? 20)));
            
            $result = $this->taskService->getTaskRatings($taskId, $page, $limit);
            return $this->apiResponse->paginated($response, $result['ratings'], $result['pagination']);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getUserRatings(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $args['id'];
            $page = (int) ($request->getQueryParams()['page'] ?? 1);
            $limit = min(50, max(1, (int) ($request->getQueryParams()['limit'] ?? 20)));
            
            $result = $this->taskService->getUserRatings($userId, $page, $limit);
            return $this->apiResponse->paginated($response, $result['ratings'], $result['pagination']);
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }
}
