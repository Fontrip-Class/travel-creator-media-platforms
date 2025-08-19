<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\TaskController;
use App\Controllers\WorkflowController;
use App\Controllers\TestController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\JsonBodyParserMiddleware;

return function (App $app) {
    // 添加中間件
    $app->add(CorsMiddleware::class);
    $app->add(JsonBodyParserMiddleware::class);

    // 公開路由
    $app->group('/api', function (RouteCollectorProxy $group) {
        // 健康檢查
        $group->get('/health', [TestController::class, 'health']);

        // 測試端點
        $group->get('/test', [TestController::class, 'test']);

        // 認證路由
        $group->group('/auth', function (RouteCollectorProxy $group) {
            $group->post('/register', [AuthController::class, 'register']);
            $group->post('/login', [AuthController::class, 'login']);
            $group->post('/logout', [AuthController::class, 'logout']);
            $group->post('/refresh', [AuthController::class, 'refreshToken']);
            $group->post('/forgot-password', [AuthController::class, 'requestPasswordReset']);
            $group->post('/reset-password', [AuthController::class, 'resetPassword']);
            $group->post('/validate-token', [AuthController::class, 'validateToken']);

            // 檢查用戶名和郵箱可用性
            $group->post('/check-username', [AuthController::class, 'checkUsernameAvailability']);
            $group->post('/check-email', [AuthController::class, 'checkEmailAvailability']);
        });

        // 任務相關路由 - 公開部分
        $group->group('/tasks', function (RouteCollectorProxy $group) {
            $group->get('/public', [TaskController::class, 'getPublicTasks']);
            $group->get('/recommendations', [TaskController::class, 'getTaskRecommendations']);
            $group->get('', [TaskController::class, 'getTasks']);
            $group->get('/{id}', [TaskController::class, 'getTaskById']);
            $group->post('/{id}/apply', [TaskController::class, 'applyForTask']);
            $group->post('/{id}/rate', [TaskController::class, 'rateTask']);

            // 申請相關路由
            $group->group('/{id}/applications', function (RouteCollectorProxy $group) {
                $group->get('', [TaskController::class, 'getTaskApplications']);
            });

            // 評分相關路由
            $group->group('/{id}/ratings', function (RouteCollectorProxy $group) {
                $group->get('', [TaskController::class, 'getTaskRatings']);
            });
        });
    });

    // 需要認證的路由
    $app->group('/api', function (RouteCollectorProxy $group) {
        // 用戶管理（優化版）
        $group->group('/users', function (RouteCollectorProxy $group) {
            $group->get('', [UserController::class, 'getUsers']);
            $group->post('', [UserController::class, 'createUser']);
            $group->get('/profile', [AuthController::class, 'getProfile']);
            $group->put('/profile', [AuthController::class, 'updateProfile']);
            $group->get('/{id}', [UserController::class, 'getUserById']);
            $group->put('/{id}', [UserController::class, 'updateUser']);
            $group->delete('/{id}', [UserController::class, 'deleteUser']);
            $group->post('/{id}/suspend', [UserController::class, 'suspendUser']);
            $group->post('/{id}/activate', [UserController::class, 'activateUser']);
            $group->get('/{id}/stats', [UserController::class, 'getUserStats']);
            $group->get('/{id}/permissions', [UserController::class, 'getUserPermissions']);

            // 用戶評分
            $group->group('/{id}/ratings', function (RouteCollectorProxy $group) {
                $group->get('', [TaskController::class, 'getUserRatings']);
            });
        });

        // 統計和報表
        $group->group('/stats', function (RouteCollectorProxy $group) {
            $group->get('/dashboard', [TaskController::class, 'getDashboardStats']);
        });

        // 角色專用儀表板API
        $group->group('/supplier', function (RouteCollectorProxy $group) {
            $group->get('/dashboard', [TaskController::class, 'getSupplierDashboard']);
            $group->get('/tasks', [TaskController::class, 'getSupplierTasks']);
            $group->get('/stats', [TaskController::class, 'getSupplierStats']);
            $group->get('/analytics', [TaskController::class, 'getSupplierAnalytics']);
            $group->get('/notifications', [TaskController::class, 'getSupplierNotifications']);
        });

        $group->group('/creator', function (RouteCollectorProxy $group) {
            $group->get('/dashboard', [TaskController::class, 'getCreatorDashboard']);
            $group->get('/tasks', [TaskController::class, 'getCreatorTasks']);
            $group->get('/applications', [TaskController::class, 'getCreatorApplications']);
            $group->get('/stats', [TaskController::class, 'getCreatorStats']);
            $group->get('/recommendations', [TaskController::class, 'getCreatorRecommendations']);
        });

        $group->group('/media', function (RouteCollectorProxy $group) {
            $group->get('/dashboard', [TaskController::class, 'getMediaDashboard']);
            $group->get('/assets', [TaskController::class, 'getMediaAssets']);
            $group->get('/publications', [TaskController::class, 'getMediaPublications']);
            $group->get('/stats', [TaskController::class, 'getMediaStats']);
        });

        // 文件上傳
        $group->group('/upload', function (RouteCollectorProxy $group) {
            $group->post('/image', [TaskController::class, 'uploadImage']);
            $group->post('/document', [TaskController::class, 'uploadDocument']);
        });

        // 通知管理
        $group->group('/notifications', function (RouteCollectorProxy $group) {
            $group->get('', [TaskController::class, 'getNotifications']);
            $group->get('/stats', [TaskController::class, 'getNotificationStats']);
            $group->put('/{id}/read', [TaskController::class, 'markNotificationAsRead']);
            $group->put('/mark-all-read', [TaskController::class, 'markAllNotificationsAsRead']);
            $group->delete('/{id}', [TaskController::class, 'deleteNotification']);
        });

        // 搜索功能
        $group->group('/search', function (RouteCollectorProxy $group) {
            $group->get('/tasks', [TaskController::class, 'searchTasks']);
            $group->get('/creators', [TaskController::class, 'searchCreators']);
            $group->get('/suppliers', [TaskController::class, 'searchSuppliers']);
        });

        // 媒合系統
        $group->group('/matching', function (RouteCollectorProxy $group) {
            $group->get('/suggestions', [TaskController::class, 'getMatchingSuggestions']);
            $group->post('/feedback', [TaskController::class, 'submitMatchingFeedback']);
        });

                // 任務管理（認證用戶） - 使用不同的路由名稱避免衝突
        $group->group('/task-management', function (RouteCollectorProxy $group) {
            $group->get('', [TaskController::class, 'getTasks']);
            $group->post('', [TaskController::class, 'createTask']);
            $group->get('/{id}', [TaskController::class, 'getTaskById']);
            $group->put('/{id}', [TaskController::class, 'updateTask']);
            $group->delete('/{id}', [TaskController::class, 'deleteTask']);

            // 任務申請
            $group->post('/{id}/apply', [TaskController::class, 'applyForTask']);
            $group->get('/{id}/applications', [TaskController::class, 'getTaskApplications']);

            // 任務評分
            $group->post('/{id}/rate', [TaskController::class, 'rateTask']);
            $group->get('/{id}/ratings', [TaskController::class, 'getTaskRatings']);
        });

        // 工作流程管理
        $group->group('/workflow', function (RouteCollectorProxy $group) {
            // 任務創建和發布
            $group->post('/tasks', [WorkflowController::class, 'createMarketingTask']);
            $group->post('/tasks/{id}/publish', [WorkflowController::class, 'publishTask']);

            // 申請管理
            $group->post('/tasks/{id}/apply', [WorkflowController::class, 'submitApplication']);
            $group->post('/applications/{id}/review', [WorkflowController::class, 'reviewApplication']);

            // 作品管理
            $group->post('/tasks/{id}/submit-work', [WorkflowController::class, 'submitWork']);
            $group->post('/tasks/{task_id}/assets/{asset_id}/review', [WorkflowController::class, 'reviewWork']);

            // 任務完成和評分
            $group->post('/tasks/{id}/complete', [WorkflowController::class, 'completeTask']);
            $group->post('/tasks/{task_id}/rating/{user_id}', [WorkflowController::class, 'submitRating']);

            // 工作流程狀態
            $group->get('/tasks/{id}/workflow', [WorkflowController::class, 'getTaskWorkflow']);
        });

        // 支付和財務
        $group->group('/payments', function (RouteCollectorProxy $group) {
            $group->get('/history', [TaskController::class, 'getPaymentHistory']);
            $group->post('/withdraw', [TaskController::class, 'requestWithdrawal']);
        });

        // 設置和偏好
        $group->group('/settings', function (RouteCollectorProxy $group) {
            $group->get('', [AuthController::class, 'getUserSettings']);
            $group->put('', [AuthController::class, 'updateUserSettings']);
        });

        // 草稿管理
        $group->group('/drafts', function (RouteCollectorProxy $group) {
            $group->get('', [TaskController::class, 'getTaskDrafts']);
            $group->post('', [TaskController::class, 'saveTaskDraft']);
            $group->get('/{id}', [TaskController::class, 'getTaskDraft']);
            $group->put('/{id}', [TaskController::class, 'updateTaskDraft']);
            $group->delete('/{id}', [TaskController::class, 'deleteTaskDraft']);
            $group->post('/{id}/publish', [TaskController::class, 'publishTaskDraft']);
        });

        // 申請管理
        $group->group('/applications', function (RouteCollectorProxy $group) {
            $group->put('/{id}', [TaskController::class, 'updateApplication']);
        });

      })->add(AuthMiddleware::class);

    // 管理員路由（需要管理員權限）
    $app->group('/api/admin', function (RouteCollectorProxy $group) {
        $group->get('/dashboard', [TaskController::class, 'getAdminDashboard']);

        $group->group('/users', function (RouteCollectorProxy $group) {
            $group->get('', [TaskController::class, 'getAdminUsers']);
            $group->put('/{id}/status', [TaskController::class, 'updateUserStatus']);
        });

        $group->group('/tasks', function (RouteCollectorProxy $group) {
            $group->get('', [TaskController::class, 'getAdminTasks']);
            $group->put('/{id}/feature', [TaskController::class, 'updateTaskFeature']);
        });

        $group->group('/reports', function (RouteCollectorProxy $group) {
            $group->get('/users', [TaskController::class, 'getUserReports']);
            $group->get('/tasks', [TaskController::class, 'getTaskReports']);
            $group->get('/financial', [TaskController::class, 'getFinancialReports']);
        });

    })->add(AuthMiddleware::class)->add(function ($request, $handler) {
        // 檢查是否為管理員
        $user = $request->getAttribute('user');
        if (!$user || $user['role'] !== 'admin') {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => '需要管理員權限'
            ]));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request);
    });
};
