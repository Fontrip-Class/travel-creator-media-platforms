<?php

use Slim\App;
use App\Controllers\AuthController;
use App\Controllers\UserManagementController;
use App\Controllers\AuditController;
use App\Controllers\TaskController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\JsonBodyParserMiddleware;

return function (App $app) {
    // 全局中間件
    $app->add(CorsMiddleware::class);
    $app->add(JsonBodyParserMiddleware::class);

    // 認證相關路由（無需認證）
    $app->group('/api/auth', function ($group) {
        $group->post('/register', [AuthController::class, 'register']);
        $group->post('/login', [AuthController::class, 'login']);
        $group->post('/refresh', [AuthController::class, 'refresh']);
        $group->post('/forgot-password', [AuthController::class, 'forgotPassword']);
        $group->post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // 需要認證的路由
    $app->group('/api', function ($group) {
        // 用戶管理相關路由
        $group->group('/users', function ($subGroup) {
            // 獲取當前用戶資料
            $subGroup->get('/me', [UserManagementController::class, 'getCurrentUserPermissions']);
            
            // 獲取特定用戶資料
            $subGroup->get('/{id}', [UserManagementController::class, 'getUser']);
            
            // 編輯用戶資料
            $subGroup->put('/{id}', [UserManagementController::class, 'editUser']);
            
            // 停用用戶帳戶
            $subGroup->post('/{id}/suspend', [UserManagementController::class, 'suspendUser']);
            
            // 啟用用戶帳戶
            $subGroup->post('/{id}/activate', [UserManagementController::class, 'activateUser']);
            
            // 變更用戶角色
            $subGroup->put('/{id}/role', [UserManagementController::class, 'changeUserRole']);
            
            // 獲取用戶權限
            $subGroup->get('/{id}/permissions', [UserManagementController::class, 'getUserPermissions']);
            
            // 檢查權限
            $subGroup->post('/check-permission', [UserManagementController::class, 'checkPermission']);
        })->add(AuthMiddleware::class);

        // 管理員專用路由
        $group->group('/admin', function ($subGroup) {
            // 獲取用戶列表
            $subGroup->get('/users', [UserManagementController::class, 'getUsers']);
            
            // 獲取用戶統計
            $subGroup->get('/users/stats', [UserManagementController::class, 'getUserStats']);
            
            // 獲取角色權限
            $subGroup->get('/roles/{role}/permissions', [UserManagementController::class, 'getRolePermissions']);
        })->add(AuthMiddleware::class);

        // 審計日誌相關路由
        $group->group('/audit', function ($subGroup) {
            // 獲取用戶審計日誌
            $subGroup->get('/users/{id}', [AuditController::class, 'getUserAuditLogs']);
            
            // 獲取記錄審計日誌
            $subGroup->get('/records/{table}/{id}', [AuditController::class, 'getRecordAuditLogs']);
            
            // 獲取操作審計日誌
            $subGroup->get('/actions/{action}', [AuditController::class, 'getActionAuditLogs']);
            
            // 獲取審計日誌統計
            $subGroup->get('/stats', [AuditController::class, 'getAuditLogStats']);
            
            // 獲取審計日誌建議
            $subGroup->get('/suggestions', [AuditController::class, 'getAuditLogSuggestions']);
        })->add(AuthMiddleware::class);

        // 管理員專用審計路由
        $group->group('/admin/audit', function ($subGroup) {
            // 獲取所有審計日誌
            $subGroup->get('', [AuditController::class, 'getAllAuditLogs']);
            
            // 清理舊的審計日誌
            $subGroup->post('/cleanup', [AuditController::class, 'cleanupOldLogs']);
            
            // 導出審計日誌
            $subGroup->get('/export', [AuditController::class, 'exportAuditLogs']);
        })->add(AuthMiddleware::class);

        // 任務相關路由
        $group->group('/tasks', function ($subGroup) {
            // 獲取任務列表
            $subGroup->get('', [TaskController::class, 'getTasks']);
            
            // 創建任務
            $subGroup->post('', [TaskController::class, 'createTask']);
            
            // 獲取特定任務
            $subGroup->get('/{id}', [TaskController::class, 'getTask']);
            
            // 更新任務
            $subGroup->put('/{id}', [TaskController::class, 'updateTask']);
            
            // 刪除任務
            $subGroup->delete('/{id}', [TaskController::class, 'deleteTask']);
            
            // 申請任務
            $subGroup->post('/{id}/apply', [TaskController::class, 'applyForTask']);
            
            // 獲取任務申請
            $subGroup->get('/{id}/applications', [TaskController::class, 'getTaskApplications']);
        })->add(AuthMiddleware::class);

        // 任務申請相關路由
        $group->group('/applications', function ($subGroup) {
            // 獲取用戶的申請
            $subGroup->get('', [TaskController::class, 'getUserApplications']);
            
            // 更新申請狀態
            $subGroup->put('/{id}', [TaskController::class, 'updateApplication']);
            
            // 撤回申請
            $subGroup->delete('/{id}', [TaskController::class, 'withdrawApplication']);
        })->add(AuthMiddleware::class);

        // 媒體素材相關路由
        $group->group('/media', function ($subGroup) {
            // 上傳媒體素材
            $subGroup->post('/upload', [TaskController::class, 'uploadMedia']);
            
            // 獲取媒體素材
            $subGroup->get('/{id}', [TaskController::class, 'getMedia']);
            
            // 更新媒體素材
            $subGroup->put('/{id}', [TaskController::class, 'updateMedia']);
            
            // 刪除媒體素材
            $subGroup->delete('/{id}', [TaskController::class, 'deleteMedia']);
            
            // 審核媒體素材
            $subGroup->post('/{id}/review', [TaskController::class, 'reviewMedia']);
        })->add(AuthMiddleware::class);

        // 登出路由
        $group->post('/logout', [AuthController::class, 'logout']);
    })->add(AuthMiddleware::class);

    // 健康檢查路由
    $app->get('/health', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '3.0.0'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // 404 處理
    $app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'error' => 'Not Found',
            'message' => '請求的路由不存在',
            'path' => $request->getUri()->getPath()
        ]));
        return $response
            ->withStatus(404)
            ->withHeader('Content-Type', 'application/json');
    });
};
