<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Controllers\AuthController;
use App\Controllers\TaskController;
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
            $group->post('/refresh', [AuthController::class, 'refreshToken']);
            $group->post('/forgot-password', [AuthController::class, 'requestPasswordReset']);
            $group->post('/reset-password', [AuthController::class, 'resetPassword']);
            $group->post('/validate-token', [AuthController::class, 'validateToken']);
        });
        
        // 任務相關路由 - 將所有任務路由放在一起避免衝突
        $group->group('/tasks', function (RouteCollectorProxy $group) {
            // 靜態路由優先
            $group->get('/public', [TaskController::class, 'getPublicTasks']);
            $group->get('/recommendations', [TaskController::class, 'getTaskRecommendations']);
            $group->get('', [TaskController::class, 'getTasks']);
            $group->post('', [TaskController::class, 'createTask']);
            
            // 草稿相關路由
            $group->group('/drafts', function (RouteCollectorProxy $group) {
                $group->get('', [TaskController::class, 'getTaskDrafts']);
                $group->post('', [TaskController::class, 'saveTaskDraft']);
                $group->get('/{id}', [TaskController::class, 'getTaskDraft']);
                $group->put('/{id}', [TaskController::class, 'updateTaskDraft']);
                $group->delete('/{id}', [TaskController::class, 'deleteTaskDraft']);
                $group->post('/{id}/publish', [TaskController::class, 'publishTaskDraft']);
            });
            
            // 變數路由放在最後
            $group->get('/{id}', [TaskController::class, 'getTaskById']);
            $group->put('/{id}', [TaskController::class, 'updateTask']);
            $group->delete('/{id}', [TaskController::class, 'deleteTask']);
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
        // 用戶管理
        $group->group('/users', function (RouteCollectorProxy $group) {
            $group->get('/profile', [AuthController::class, 'getProfile']);
            $group->put('/profile', [AuthController::class, 'updateProfile']);
            $group->get('/{id}', [AuthController::class, 'getUserById']);
            
            // 用戶評分
            $group->group('/{id}/ratings', function (RouteCollectorProxy $group) {
                $group->get('', [TaskController::class, 'getUserRatings']);
            });
        });
        
        // 統計和報表
        $group->group('/stats', function (RouteCollectorProxy $group) {
            $group->get('/dashboard', [TaskController::class, 'getDashboardStats']);
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
