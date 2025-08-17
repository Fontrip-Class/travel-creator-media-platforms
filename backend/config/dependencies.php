<?php

use DI\ContainerBuilder;
use App\Services\DatabaseService;
use App\Services\AuthService;
use App\Services\FileUploadService;
use App\Services\NotificationService;
use App\Services\TaskService;
use App\Services\ApiResponseService;
use App\Repositories\UserRepository;
use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Controllers\TestController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\JsonBodyParserMiddleware;

return function (ContainerBuilder $containerBuilder) {
    $containerBuilder->addDefinitions([
        // 服務類
        DatabaseService::class => \DI\factory(function () {
            // 使用 SQLite 作為默認數據庫
            $config = [
                'driver' => $_ENV['DB_DRIVER'] ?? 'sqlite',
                'database' => $_ENV['DB_DATABASE'] ?? __DIR__ . '/../database/sqlite.db',
                
                // MySQL 配置（如果可用）
                'mysql' => [
                    'host' => $_ENV['DB_HOST'] ?? 'localhost',
                    'port' => $_ENV['DB_PORT'] ?? '3306',
                    'database' => $_ENV['DB_NAME'] ?? 'travel_platform',
                    'username' => $_ENV['DB_USERNAME'] ?? 'root',
                    'password' => $_ENV['DB_PASSWORD'] ?? '',
                    'charset' => 'utf8mb4',
                    'options' => [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                    ],
                ],
                
                // SQLite 配置
                'sqlite' => [
                    'driver' => 'sqlite',
                    'database' => __DIR__ . '/../database/sqlite.db',
                    'options' => [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ],
                ],
                
                // PostgreSQL 配置（如果驅動可用）
                'pgsql' => [
                    'driver' => 'pgsql',
                    'host' => $_ENV['DB_HOST'] ?? 'localhost',
                    'port' => $_ENV['DB_PORT'] ?? '5432',
                    'database' => $_ENV['DB_NAME'] ?? 'travel_platform',
                    'username' => $_ENV['DB_USERNAME'] ?? 'postgres',
                    'password' => $_ENV['DB_PASSWORD'] ?? '',
                    'charset' => 'utf8',
                    'options' => [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ],
                ],
            ];
            
            return new DatabaseService($config);
        }),

        AuthService::class => \DI\factory(function (DatabaseService $db) {
            return new AuthService($db);
        }),

        FileUploadService::class => \DI\factory(function () {
            return new FileUploadService();
        }),

        NotificationService::class => \DI\factory(function (DatabaseService $db) {
            return new NotificationService($db);
        }),

        TaskService::class => \DI\factory(function (DatabaseService $db, NotificationService $notificationService) {
            return new TaskService($db, $notificationService);
        }),

        ApiResponseService::class => \DI\factory(function () {
            return new ApiResponseService();
        }),

        // 倉儲類
        UserRepository::class => \DI\factory(function (DatabaseService $db) {
            return new UserRepository($db);
        }),

        // 控制器類
        AuthController::class => \DI\factory(function (AuthService $authService, ApiResponseService $apiResponse) {
            return new AuthController($authService, $apiResponse);
        }),

        TaskController::class => \DI\factory(function (TaskService $taskService, ApiResponseService $apiResponse) {
            return new TaskController($taskService, $apiResponse);
        }),

        TestController::class => \DI\factory(function () {
            return new TestController();
        }),

        // 中間件類
        AuthMiddleware::class => \DI\factory(function (AuthService $authService) {
            return new AuthMiddleware($authService);
        }),

        CorsMiddleware::class => \DI\factory(function () {
            return new CorsMiddleware();
        }),

        JsonBodyParserMiddleware::class => \DI\factory(function () {
            return new JsonBodyParserMiddleware();
        }),

        // 配置參數
        'app.name' => $_ENV['APP_NAME'] ?? 'Travel Creator Media Platform',
        'app.version' => $_ENV['APP_VERSION'] ?? '2.0.0',
        'app.env' => $_ENV['APP_ENV'] ?? 'development',
        'app.debug' => $_ENV['APP_DEBUG'] ?? false,
        'app.url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
        
        'jwt.secret' => $_ENV['JWT_SECRET'] ?? 'default_secret_key_change_in_production',
        'jwt.expiration' => (int) ($_ENV['JWT_EXPIRATION'] ?? 3600),
        'jwt.refresh_expiration' => (int) ($_ENV['JWT_REFRESH_EXPIRATION'] ?? 86400),
        
        'upload.max_size' => (int) ($_ENV['UPLOAD_MAX_SIZE'] ?? 10485760), // 10MB
        'upload.allowed_extensions' => explode(',', $_ENV['ALLOWED_EXTENSIONS'] ?? 'jpg,jpeg,png,gif,mp4,mov,avi'),
        'upload.path' => $_ENV['UPLOAD_PATH'] ?? 'uploads/',
        
        'mail.driver' => $_ENV['MAIL_DRIVER'] ?? 'smtp',
        'mail.host' => $_ENV['MAIL_HOST'] ?? 'localhost',
        'mail.port' => (int) ($_ENV['MAIL_PORT'] ?? 587),
        'mail.username' => $_ENV['MAIL_USERNAME'] ?? '',
        'mail.password' => $_ENV['MAIL_PASSWORD'] ?? '',
        'mail.encryption' => $_ENV['MAIL_ENCRYPTION'] ?? 'tls',
        'mail.from.address' => $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@example.com',
        'mail.from.name' => $_ENV['MAIL_FROM_NAME'] ?? 'Travel Platform',
        
        'cache.driver' => $_ENV['CACHE_DRIVER'] ?? 'file',
        'cache.ttl' => (int) ($_ENV['CACHE_TTL'] ?? 3600),
        
        'rate_limit.enabled' => $_ENV['RATE_LIMIT_ENABLED'] ?? true,
        'rate_limit.max_requests' => (int) ($_ENV['RATE_LIMIT_MAX_REQUESTS'] ?? 100),
        'rate_limit.window' => (int) ($_ENV['RATE_LIMIT_WINDOW'] ?? 3600),
        
        'security.password_min_length' => (int) ($_ENV['PASSWORD_MIN_LENGTH'] ?? 8),
        'security.max_login_attempts' => (int) ($_ENV['MAX_LOGIN_ATTEMPTS'] ?? 5),
        'security.lockout_duration' => (int) ($_ENV['LOCKOUT_DURATION'] ?? 900),
        
        'database.connection_timeout' => (int) ($_ENV['DB_CONNECTION_TIMEOUT'] ?? 30),
        'database.query_timeout' => (int) ($_ENV['DB_QUERY_TIMEOUT'] ?? 60),
        'database.max_retries' => (int) ($_ENV['DB_MAX_RETRIES'] ?? 3),
        'database.retry_delay' => (int) ($_ENV['DB_RETRY_DELAY'] ?? 1000),
    ]);
};
