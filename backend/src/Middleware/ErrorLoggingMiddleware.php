<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;

class ErrorLoggingMiddleware implements MiddlewareInterface
{
    private Logger $logger;

    public function __construct()
    {
        $this->setupLogger();
    }

    private function setupLogger(): void
    {
        $this->logger = new Logger('api_errors');
        
        // 創建日誌目錄
        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $handler = new StreamHandler($logDir . '/api_errors.log', Logger::DEBUG);
        $formatter = new LineFormatter("[%datetime%] %channel%.%level_name%: %message% %context%\n");
        $handler->setFormatter($formatter);
        
        $this->logger->pushHandler($handler);
    }

    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        try {
            $response = $handler->handle($request);
            return $response;
        } catch (\Throwable $e) {
            // 記錄詳細的錯誤信息
            $this->logError($request, $e);
            
            // 重新拋出異常，讓錯誤處理中間件處理
            throw $e;
        }
    }

    private function logError(Request $request, \Throwable $e): void
    {
        $errorData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'error_type' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'request_method' => $request->getMethod(),
            'request_uri' => (string) $request->getUri(),
            'request_headers' => $request->getHeaders(),
            'request_body' => $request->getParsedBody(),
            'user_agent' => $request->getHeaderLine('User-Agent'),
            'ip_address' => $this->getClientIP($request)
        ];

        $this->logger->error('API Error occurred', $errorData);
    }

    private function getClientIP(Request $request): string
    {
        $serverParams = $request->getServerParams();
        
        // 檢查各種可能的IP地址來源
        $ipSources = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        ];

        foreach ($ipSources as $source) {
            if (isset($serverParams[$source])) {
                $ip = $serverParams[$source];
                // 如果是逗號分隔的多個IP，取第一個
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return 'unknown';
    }
}
