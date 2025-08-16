<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\AuthService;
use Respect\Validation\Validator as v;

class AuthController
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();

            // 基本驗證
            $validator = v::key('username', v::stringType()->length(3, 50)->alnum('_'))
                         ->key('email', v::email())
                         ->key('password', v::stringType()->length(8, 255))
                         ->key('role', v::in(['supplier', 'creator', 'media']))
                         ->key('first_name', v::optional(v::stringType()->length(1, 50)))
                         ->key('last_name', v::optional(v::stringType()->length(1, 50)));

            $validator->assert($data);

            // 根據角色驗證額外欄位
            switch ($data['role']) {
                case 'supplier':
                    $this->validateSupplierData($data);
                    break;
                case 'creator':
                    $this->validateCreatorData($data);
                    break;
                case 'media':
                    $this->validateMediaData($data);
                    break;
            }

            $result = $this->authService->register($data);

            return $response->withJson([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => $result
            ], 201);

        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function login(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();

            if (!isset($data['email']) || !isset($data['password'])) {
                throw new \Exception('Email and password are required');
            }

            $result = $this->authService->login($data['email'], $data['password']);

            return $response->withJson([
                'success' => true,
                'message' => 'Login successful',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 401);
        }
    }

    public function refresh(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();

            if (!isset($data['token'])) {
                throw new \Exception('Token is required');
            }

            $newToken = $this->authService->refreshToken($data['token']);

            return $response->withJson([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => ['token' => $newToken]
            ]);

        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 401);
        }
    }

    private function validateSupplierData(array $data): void
    {
        $validator = v::key('company_name', v::stringType()->length(1, 100))
                     ->key('business_type', v::stringType()->length(1, 50));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \Exception('Supplier validation failed: ' . $e->getMessage());
        }
    }

    private function validateCreatorData(array $data): void
    {
        $validator = v::key('portfolio_url', v::optional(v::url()))
                     ->key('content_types', v::optional(v::arrayType()));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \Exception('Creator validation failed: ' . $e->getMessage());
        }
    }

    private function validateMediaData(array $data): void
    {
        $validator = v::key('media_type', v::stringType()->length(1, 50))
                     ->key('platform_name', v::stringType()->length(1, 100));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \Exception('Media validation failed: ' . $e->getMessage());
        }
    }
}
