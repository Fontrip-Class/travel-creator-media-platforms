<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TestController
{
    public function health(Request $request, Response $response): Response
    {
        $data = [
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION,
            'server_time' => time(),
            'environment' => $_ENV['APP_ENV'] ?? 'development'
        ];
        
        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function test(Request $request, Response $response): Response
    {
        $data = [
            'message' => '旅遊創作者媒體平台後端API運行正常！',
            'endpoints' => [
                'health' => '/api/health',
                'register' => '/api/auth/register',
                'login' => '/api/auth/login',
                'test' => '/api/test'
            ],
            'features' => [
                'authentication' => 'JWT認證系統',
                'database' => 'PostgreSQL + PostGIS',
                'file_upload' => '檔案上傳與圖片處理',
                'matching' => '智能媒合系統',
                'notifications' => '即時通知系統'
            ]
        ];
        
        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
