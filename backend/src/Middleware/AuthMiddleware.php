<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use App\Services\AuthService;
use App\Services\ApiResponseService;

class AuthMiddleware implements MiddlewareInterface
{
    private AuthService $authService;
    private ApiResponseService $apiResponse;

    public function __construct(AuthService $authService, ApiResponseService $apiResponse)
    {
        $this->authService = $authService;
        $this->apiResponse = $apiResponse;
    }

    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        $authorization = $request->getHeaderLine('Authorization');

        if (empty($authorization)) {
            return $this->unauthorizedResponse('Authorization header is required');
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $this->unauthorizedResponse('Invalid authorization header format');
        }

        $token = $matches[1];

        try {
            $user = $this->authService->validateToken($token);

            // 將用戶資訊添加到請求屬性中
            $request = $request->withAttribute('user', $user);
            $request = $request->withAttribute('user_id', $user['user_id'] ?? $user['id'] ?? null);
            $request = $request->withAttribute('user_role', $user['role'] ?? null);

            return $handler->handle($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse($e->getMessage());
        }
    }

    private function unauthorizedResponse(string $message): Response
    {
        $response = new \Slim\Psr7\Response();
        return $this->apiResponse->unauthorized($response, $message);
    }
}
