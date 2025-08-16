<?php

use Slim\App;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\TaskController;
use App\Controllers\MediaController;
use App\Controllers\MatchingController;
use App\Middleware\AuthMiddleware;

// 認證路由
$app->post('/api/auth/register', [AuthController::class, 'register']);
$app->post('/api/auth/login', [AuthController::class, 'login']);
$app->post('/api/auth/refresh', [AuthController::class, 'refresh']);

// 需要認證的路由
$app->group('/api', function ($group) {
    // 用戶管理
    $group->get('/users/profile', [UserController::class, 'getProfile']);
    $group->put('/users/profile', [UserController::class, 'updateProfile']);
    $group->get('/users/{id}', [UserController::class, 'getUser']);
    
    // 任務管理
    $group->get('/tasks', [TaskController::class, 'getTasks']);
    $group->post('/tasks', [TaskController::class, 'createTask']);
    $group->get('/tasks/{id}', [TaskController::class, 'getTask']);
    $group->put('/tasks/{id}', [TaskController::class, 'updateTask']);
    $group->delete('/tasks/{id}', [TaskController::class, 'deleteTask']);
    $group->post('/tasks/{id}/apply', [TaskController::class, 'applyTask']);
    
    // 媒體素材管理
    $group->get('/media', [MediaController::class, 'getMedia']);
    $group->post('/media', [MediaController::class, 'uploadMedia']);
    $group->get('/media/{id}', [MediaController::class, 'getMedia']);
    $group->put('/media/{id}', [MediaController::class, 'updateMedia']);
    $group->delete('/media/{id}', [MediaController::class, 'deleteMedia']);
    $group->post('/media/{id}/download', [MediaController::class, 'downloadMedia']);
    
    // 媒合系統
    $group->post('/match', [MatchingController::class, 'findMatches']);
    $group->get('/match/suggestions', [MatchingController::class, 'getSuggestions']);
    
})->add(new AuthMiddleware());

// 公開路由
$app->get('/api/tasks/public', [TaskController::class, 'getPublicTasks']);
$app->get('/api/media/public', [MediaController::class, 'getPublicMedia']);
$app->get('/api/health', [\App\Controllers\TestController::class, 'health']);
$app->get('/api/test', [\App\Controllers\TestController::class, 'test']);
