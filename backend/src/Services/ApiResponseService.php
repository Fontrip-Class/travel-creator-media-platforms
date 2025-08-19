<?php

namespace App\Services;

use Psr\Http\Message\ResponseInterface as Response;

class ApiResponseService
{
    public function success(Response $response, $data = null, string $message = 'Success', int $statusCode = 200): Response
    {
        $responseData = [
            'success' => true,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s'),
            'data' => $data
        ];

        $response->getBody()->write(json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $response
            ->withStatus($statusCode)
            ->withHeader('Content-Type', 'application/json');
    }

    public function error(Response $response, string $message, int $statusCode = 400, $errors = null): Response
    {
        $responseData = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s'),
            'error_code' => $this->getErrorCode($statusCode)
        ];

        if ($errors !== null) {
            $responseData['errors'] = $errors;
        }

        $response->getBody()->write(json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $response
            ->withStatus($statusCode)
            ->withHeader('Content-Type', 'application/json');
    }

    public function validationError(Response $response, array $errors): Response
    {
        return $this->error($response, 'Validation failed', 422, $errors);
    }

    public function notFound(Response $response, string $message = 'Resource not found'): Response
    {
        return $this->error($response, $message, 404);
    }

    public function unauthorized(Response $response, string $message = 'Unauthorized'): Response
    {
        return $this->error($response, $message, 401);
    }

    public function forbidden(Response $response, string $message = 'Forbidden'): Response
    {
        return $this->error($response, $message, 403);
    }

    public function serverError(Response $response, string $message = 'Internal server error'): Response
    {
        return $this->error($response, $message, 500);
    }

    public function paginated(Response $response, array $data, array $pagination): Response
    {
        $responseData = [
            'success' => true,
            'message' => 'Data retrieved successfully',
            'timestamp' => date('Y-m-d H:i:s'),
            'data' => $data,
            'pagination' => $pagination
        ];

        $response->getBody()->write(json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    }

    public function created(Response $response, $data = null, string $message = 'Resource created successfully'): Response
    {
        return $this->success($response, $data, $message, 201);
    }

    public function noContent(Response $response): Response
    {
        return $response->withStatus(204);
    }

    public function download(Response $response, string $filePath, string $filename): Response
    {
        if (!file_exists($filePath)) {
            return $this->notFound($response, 'File not found');
        }

        $fileSize = filesize($filePath);
        $mimeType = mime_content_type($filePath);

        $response = $response
            ->withHeader('Content-Type', $mimeType)
            ->withHeader('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->withHeader('Content-Length', $fileSize)
            ->withHeader('Cache-Control', 'no-cache, must-revalidate')
            ->withHeader('Pragma', 'no-cache');

        $response->getBody()->write(file_get_contents($filePath));
        return $response;
    }

    public function stream(Response $response, $data, callable $callback = null): Response
    {
        $response = $response
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Cache-Control', 'no-cache')
            ->withHeader('Connection', 'keep-alive');

        if ($callback) {
            $callback($response, $data);
        } else {
            $response->getBody()->write(json_encode($data));
        }

        return $response;
    }

    private function getErrorCode(int $statusCode): string
    {
        $errorCodes = [
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            409 => 'CONFLICT',
            422 => 'VALIDATION_ERROR',
            429 => 'TOO_MANY_REQUESTS',
            500 => 'INTERNAL_SERVER_ERROR',
            502 => 'BAD_GATEWAY',
            503 => 'SERVICE_UNAVAILABLE'
        ];

        return $errorCodes[$statusCode] ?? 'UNKNOWN_ERROR';
    }

    public function handleException(Response $response, \Throwable $exception): Response
    {
        $statusCode = 500;
        $message = 'Internal server error';
        $errorCode = 'INTERNAL_ERROR';
        $debugInfo = [];

        // 根據異常類型設置狀態碼和錯誤代碼
        if ($exception instanceof \InvalidArgumentException) {
            $statusCode = 400;
            $message = $exception->getMessage();
            $errorCode = 'INVALID_ARGUMENT';
        } elseif ($exception instanceof \DomainException) {
            $statusCode = 422;
            $message = $exception->getMessage();
            $errorCode = 'VALIDATION_ERROR';
        } elseif ($exception instanceof \RuntimeException) {
            $statusCode = 500;
            $message = $exception->getMessage();
            $errorCode = 'RUNTIME_ERROR';
        } elseif ($exception instanceof \PDOException) {
            $statusCode = 500;
            $message = 'Database error occurred';
            $errorCode = 'DATABASE_ERROR';
            $debugInfo['sql_state'] = $exception->getCode();
            $debugInfo['database_message'] = $exception->getMessage();
        }

        // 在開發環境中提供詳細的調試信息
        if (($_ENV['APP_ENV'] ?? 'production') === 'development' || ($_ENV['APP_DEBUG'] ?? 'false') === 'true') {
            $debugInfo = array_merge($debugInfo, [
                'error_code' => $errorCode,
                'error_type' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
                'request_time' => date('Y-m-d H:i:s'),
                'memory_usage' => memory_get_usage(true),
                'peak_memory' => memory_get_peak_usage(true)
            ]);
        }

        // 記錄詳細錯誤到日誌
        $this->logDetailedError($exception, $debugInfo);

        return $this->error($response, $message, $statusCode, $debugInfo);
    }

    private function logDetailedError(\Throwable $exception, array $debugInfo): void
    {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'error_type' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'debug_info' => $debugInfo
        ];

        // 寫入錯誤日誌文件
        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/detailed_errors.log';
        $logEntry = json_encode($logData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n---\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

        // 同時寫入系統錯誤日誌
        error_log("API Error: " . $exception->getMessage() . " in " . $exception->getFile() . ":" . $exception->getLine());
    }

    public function rateLimitExceeded(Response $response, int $retryAfter = 60): Response
    {
        $response = $response
            ->withHeader('Retry-After', $retryAfter)
            ->withHeader('X-RateLimit-Reset', time() + $retryAfter);

        return $this->error($response, 'Rate limit exceeded', 429);
    }

    public function maintenanceMode(Response $response, string $message = 'Service temporarily unavailable'): Response
    {
        return $response
            ->withStatus(503)
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Retry-After', 300)
            ->withBody($response->getBody()->write(json_encode([
                'success' => false,
                'message' => $message,
                'timestamp' => date('Y-m-d H:i:s'),
                'error_code' => 'MAINTENANCE_MODE'
            ])));
    }
}
