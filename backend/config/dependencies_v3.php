<?php

use DI\ContainerBuilder;
use App\Services\DatabaseService;
use App\Services\ApiResponseService;
use App\Services\AuthService;
use App\Services\PermissionService;
use App\Services\AuditService;
use App\Services\UserManagementService;
use App\Controllers\AuthController;
use App\Controllers\UserManagementController;
use App\Controllers\AuditController;
use App\Controllers\TaskController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\JsonBodyParserMiddleware;

return function (ContainerBuilder $containerBuilder) {
    $containerBuilder->addDefinitions([
        // 服務層
        DatabaseService::class => \DI\autowire(DatabaseService::class),
        ApiResponseService::class => \DI\autowire(ApiResponseService::class),
        AuthService::class => \DI\autowire(AuthService::class),
        PermissionService::class => \DI\autowire(PermissionService::class),
        AuditService::class => \DI\autowire(AuditService::class),
        UserManagementService::class => \DI\autowire(UserManagementService::class),

        // 控制器層
        AuthController::class => \DI\autowire(AuthController::class),
        UserManagementController::class => \DI\autowire(UserManagementController::class),
        AuditController::class => \DI\autowire(AuditController::class),
        TaskController::class => \DI\autowire(TaskController::class),

        // 中間件
        AuthMiddleware::class => \DI\autowire(AuthMiddleware::class),
        CorsMiddleware::class => \DI\autowire(CorsMiddleware::class),
        JsonBodyParserMiddleware::class => \DI\autowire(JsonBodyParserMiddleware::class),
    ]);
};
