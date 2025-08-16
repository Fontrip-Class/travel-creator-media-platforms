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
    // 全局中間件
    $app->add(CorsMiddleware::class);
    $app->add(JsonBodyParserMiddleware::class);

    // 公開路由
    $app->group('/api', function (RouteCollectorProxy $group) {
        // 健康檢查和測試
        $group->get('/health', [TestController::class, 'health']);
        $group->get('/test', [TestController::class, 'test']);
        
        // 認證相關（公開）
        $group->post('/auth/register', [AuthController::class, 'register']);
        $group->post('/auth/login', [AuthController::class, 'login']);
        $group->post('/auth/refresh', [AuthController::class, 'refreshToken']);
        $group->post('/auth/forgot-password', [AuthController::class, 'requestPasswordReset']);
        $group->post('/auth/reset-password', [AuthController::class, 'resetPassword']);
        $group->post('/auth/validate-token', [AuthController::class, 'validateToken']);
        
        // 公開任務查詢
        $group->get('/tasks/public', [TaskController::class, 'getPublicTasks']);
        $group->get('/tasks/{id}', [TaskController::class, 'getTaskById']);
    });

    // 需要認證的路由
    $app->group('/api', function (RouteCollectorProxy $group) {
        // 認證相關（需要登入）
        $group->post('/auth/logout', [AuthController::class, 'logout']);
        $group->get('/auth/profile', [AuthController::class, 'getProfile']);
        $group->put('/auth/profile', [AuthController::class, 'updateProfile']);
        $group->post('/auth/change-password', [AuthController::class, 'changePassword']);
        
        // 任務管理
        $group->group('/tasks', function (RouteCollectorProxy $group) {
            $group->post('', [TaskController::class, 'createTask']);
            $group->get('', [TaskController::class, 'getTasks']);
            $group->put('/{id}', [TaskController::class, 'updateTask']);
            $group->delete('/{id}', [TaskController::class, 'deleteTask']);
            $group->post('/{id}/apply', [TaskController::class, 'applyForTask']);
            $group->get('/{id}/matching-creators', [TaskController::class, 'getMatchingCreators']);
            $group->get('/recommendations', [TaskController::class, 'getTaskRecommendations']);
        });
        
        // 任務申請管理
        $group->group('/applications', function (RouteCollectorProxy $group) {
            $group->post('/{id}/rate', [TaskController::class, 'rateApplication']);
        });
        
        // 用戶相關
        $group->group('/users', function (RouteCollectorProxy $group) {
            $group->get('/me', [AuthController::class, 'getProfile']);
            $group->put('/me', [AuthController::class, 'updateProfile']);
            $group->get('/me/tasks', [TaskController::class, 'getTasks']);
            $group->get('/me/applications', [TaskController::class, 'getTasks']); // 需要實現
        });
        
        // 統計和報表
        $group->group('/stats', function (RouteCollectorProxy $group) {
            $group->get('/dashboard', function ($request, $response) {
                // 實現儀表板統計
                return $response->withJson([
                    'success' => true,
                    'message' => 'Dashboard stats endpoint - implement statistics',
                    'data' => [
                        'total_tasks' => 0,
                        'completed_tasks' => 0,
                        'pending_applications' => 0,
                        'total_earnings' => 0
                    ]
                ]);
            });
        });
        
        // 文件上傳
        $group->group('/upload', function (RouteCollectorProxy $group) {
            $group->post('/image', function ($request, $response) {
                // 實現圖片上傳
                return $response->withJson([
                    'success' => true,
                    'message' => 'Image upload endpoint - implement file upload',
                    'data' => ['file_id' => 'temp_id']
                ]);
            });
            
            $group->post('/document', function ($request, $response) {
                // 實現文件上傳
                return $response->withJson([
                    'success' => true,
                    'message' => 'Document upload endpoint - implement file upload',
                    'data' => ['file_id' => 'temp_id']
                ]);
            });
        });
        
        // 通知管理
        $group->group('/notifications', function (RouteCollectorProxy $group) {
            $group->get('', function ($request, $response) {
                // 實現通知列表
                return $response->withJson([
                    'success' => true,
                    'message' => 'Notifications endpoint - implement notification list',
                    'data' => []
                ]);
            });
            
            $group->put('/{id}/read', function ($request, $response, $args) {
                // 實現標記已讀
                return $response->withJson([
                    'success' => true,
                    'message' => 'Notification marked as read'
                ]);
            });
            
            $group->delete('/{id}', function ($request, $response, $args) {
                // 實現刪除通知
                return $response->withJson([
                    'success' => true,
                    'message' => 'Notification deleted'
                ]);
            });
        });
        
        // 搜索功能
        $group->group('/search', function (RouteCollectorProxy $group) {
            $group->get('/tasks', [TaskController::class, 'getTasks']);
            $group->get('/creators', function ($request, $response) {
                // 實現創作者搜索
                return $response->withJson([
                    'success' => true,
                    'message' => 'Creator search endpoint - implement creator search',
                    'data' => []
                ]);
            });
            
            $group->get('/suppliers', function ($request, $response) {
                // 實現供應商搜索
                return $response->withJson([
                    'success' => true,
                    'message' => 'Supplier search endpoint - implement supplier search',
                    'data' => []
                ]);
            });
        });
        
        // 媒合系統
        $group->group('/matching', function (RouteCollectorProxy $group) {
            $group->get('/suggestions', function ($request, $response) {
                // 實現媒合建議
                return $response->withJson([
                    'success' => true,
                    'message' => 'Matching suggestions endpoint - implement matching algorithm',
                    'data' => []
                ]);
            });
            
            $group->post('/feedback', function ($request, $response) {
                // 實現媒合反饋
                return $response->withJson([
                    'success' => true,
                    'message' => 'Matching feedback submitted'
                ]);
            });
        });
        
        // 支付和財務
        $group->group('/payments', function (RouteCollectorProxy $group) {
            $group->get('/history', function ($request, $response) {
                // 實現支付歷史
                return $response->withJson([
                    'success' => true,
                    'message' => 'Payment history endpoint - implement payment tracking',
                    'data' => []
                ]);
            });
            
            $group->post('/withdraw', function ($request, $response) {
                // 實現提現
                return $response->withJson([
                    'success' => true,
                    'message' => 'Withdrawal request submitted'
                ]);
            });
        });
        
        // 設置和偏好
        $group->group('/settings', function (RouteCollectorProxy $group) {
            $group->get('', function ($request, $response) {
                // 實現用戶設置
                return $response->withJson([
                    'success' => true,
                    'message' => 'User settings endpoint - implement user preferences',
                    'data' => []
                ]);
            });
            
            $group->put('', function ($request, $response) {
                // 實現更新設置
                return $response->withJson([
                    'success' => true,
                    'message' => 'Settings updated successfully'
                ]);
            });
        });
        
    })->add(AuthMiddleware::class);

    // 管理員路由（需要管理員權限）
    $app->group('/api/admin', function (RouteCollectorProxy $group) {
        $group->get('/dashboard', function ($request, $response) {
            // 實現管理員儀表板
            return $response->withJson([
                'success' => true,
                'message' => 'Admin dashboard endpoint - implement admin statistics',
                'data' => [
                    'total_users' => 0,
                    'total_tasks' => 0,
                    'total_revenue' => 0,
                    'system_health' => 'healthy'
                ]
            ]);
        });
        
        $group->group('/users', function (RouteCollectorProxy $group) {
            $group->get('', function ($request, $response) {
                // 實現用戶管理列表
                return $response->withJson([
                    'success' => true,
                    'message' => 'User management endpoint - implement user list',
                    'data' => []
                ]);
            });
            
            $group->put('/{id}/status', function ($request, $response, $args) {
                // 實現用戶狀態管理
                return $response->withJson([
                    'success' => true,
                    'message' => 'User status updated'
                ]);
            });
        });
        
        $group->group('/tasks', function (RouteCollectorProxy $group) {
            $group->get('', function ($request, $response) {
                // 實現任務管理列表
                return $response->withJson([
                    'success' => true,
                    'message' => 'Task management endpoint - implement task list',
                    'data' => []
                ]);
            });
            
            $group->put('/{id}/feature', function ($request, $response, $args) {
                // 實現任務特色管理
                return $response->withJson([
                    'success' => true,
                    'message' => 'Task featured status updated'
                ]);
            });
        });
        
        $group->group('/reports', function (RouteCollectorProxy $group) {
            $group->get('/users', function ($request, $response) {
                // 實現用戶報表
                return $response->withJson([
                    'success' => true,
                    'message' => 'User reports endpoint - implement user analytics',
                    'data' => []
                ]);
            });
            
            $group->get('/tasks', function ($request, $response) {
                // 實現任務報表
                return $response->withJson([
                    'success' => true,
                    'message' => 'Task reports endpoint - implement task analytics',
                    'data' => []
                ]);
            });
            
            $group->get('/financial', function ($request, $response) {
                // 實現財務報表
                return $response->withJson([
                    'success' => true,
                    'message' => 'Financial reports endpoint - implement financial analytics',
                    'data' => []
                ]);
            });
        });
        
    })->add(AuthMiddleware::class)->add(function ($request, $handler) {
        // 檢查管理員權限
        $user = $request->getAttribute('user');
        if ($user['role'] !== 'admin') {
            return $response->withStatus(403)->withJson([
                'success' => false,
                'message' => 'Admin access required'
            ]);
        }
        return $handler->handle($request);
    });

    // 錯誤處理
    $app->addErrorMiddleware(true, true, true);
};
