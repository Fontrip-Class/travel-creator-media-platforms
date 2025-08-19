<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\WorkflowService;
use App\Services\ApiResponseService;

/**
 * 工作流程控制器
 * 處理完整的任務工作流程API
 */
class WorkflowController
{
    private WorkflowService $workflowService;
    private ApiResponseService $apiResponse;

    public function __construct(WorkflowService $workflowService, ApiResponseService $apiResponse)
    {
        $this->workflowService = $workflowService;
        $this->apiResponse = $apiResponse;
    }

    /**
     * 創建行銷委託案
     */
    public function createMarketingTask(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();

            $taskId = $this->workflowService->createMarketingTask($userId, $data);

            return $this->apiResponse->created($response, [
                'task_id' => $taskId
            ], '行銷委託案創建成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 發布任務
     */
    public function publishTask(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $taskId = $args['id'];

            $success = $this->workflowService->publishTask($taskId, $userId);

            if ($success) {
                return $this->apiResponse->success($response, null, '任務已發布');
            } else {
                return $this->apiResponse->error($response, '任務發布失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 提交申請
     */
    public function submitApplication(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $taskId = $args['id'];
            $data = $request->getParsedBody();

            $applicationId = $this->workflowService->submitApplication($taskId, $userId, $data);

            return $this->apiResponse->created($response, [
                'application_id' => $applicationId
            ], '申請提交成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 審核申請
     */
    public function reviewApplication(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $applicationId = $args['id'];
            $data = $request->getParsedBody();

            $decision = $data['decision'] ?? '';
            $notes = $data['notes'] ?? null;

            $success = $this->workflowService->reviewApplication($applicationId, $userId, $decision, $notes);

            if ($success) {
                return $this->apiResponse->success($response, null, '申請審核完成');
            } else {
                return $this->apiResponse->error($response, '申請審核失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 提交作品
     */
    public function submitWork(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $taskId = $args['id'];
            $data = $request->getParsedBody();

            $assetId = $this->workflowService->submitWork($taskId, $userId, $data);

            return $this->apiResponse->created($response, [
                'asset_id' => $assetId
            ], '作品提交成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 審核作品
     */
    public function reviewWork(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $taskId = $args['task_id'];
            $assetId = $args['asset_id'];
            $data = $request->getParsedBody();

            $decision = $data['decision'] ?? '';
            $feedback = $data['feedback'] ?? null;

            $success = $this->workflowService->reviewWork($taskId, $userId, $assetId, $decision, $feedback);

            if ($success) {
                return $this->apiResponse->success($response, null, '作品審核完成');
            } else {
                return $this->apiResponse->error($response, '作品審核失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 完成任務
     */
    public function completeTask(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $taskId = $args['id'];

            $success = $this->workflowService->completeTask($taskId, $userId);

            if ($success) {
                return $this->apiResponse->success($response, null, '任務已完成');
            } else {
                return $this->apiResponse->error($response, '任務完成失敗', 400);
            }

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 提交評分
     */
    public function submitRating(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $taskId = $args['task_id'];
            $targetUserId = $args['user_id'];
            $data = $request->getParsedBody();

            $rating = $data['rating'] ?? 0;
            $comment = $data['comment'] ?? null;

            $ratingId = $this->workflowService->submitRating($taskId, $userId, $targetUserId, $rating, $comment);

            return $this->apiResponse->created($response, [
                'rating_id' => $ratingId
            ], '評分提交成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    /**
     * 獲取任務工作流程狀態
     */
    public function getTaskWorkflow(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'];

            $workflow = $this->workflowService->getTaskWorkflowStatus($taskId);

            return $this->apiResponse->success($response, $workflow, '工作流程狀態獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }
}
