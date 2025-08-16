<?php

use App\Services\DatabaseService;
use App\Services\AuthService;
use App\Services\FileUploadService;
use App\Services\NotificationService;
use App\Repositories\UserRepository;
use App\Repositories\TaskRepository;
use App\Repositories\MediaRepository;

// 資料庫服務
$container->set(DatabaseService::class, function () {
    $config = require __DIR__ . '/database.php';
    return new DatabaseService($config);
});

// 認證服務
$container->set(AuthService::class, function () use ($container) {
    return new AuthService($container->get(DatabaseService::class));
});

// 檔案上傳服務
$container->set(FileUploadService::class, function () {
    return new FileUploadService();
});

// 通知服務
$container->set(NotificationService::class, function () use ($container) {
    return new NotificationService($container->get(DatabaseService::class));
});

// 儲存庫
$container->set(UserRepository::class, function () use ($container) {
    return new UserRepository($container->get(DatabaseService::class));
});

$container->set(TaskRepository::class, function () use ($container) {
    return new TaskRepository($container->get(DatabaseService::class));
});

$container->set(MediaRepository::class, function () use ($container) {
    return new MediaRepository($container->get(DatabaseService::class));
});
