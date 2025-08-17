<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\AuthService;
use App\Services\ApiResponseService;
use Respect\Validation\Validator as v;

class AuthController
{
    private AuthService $authService;
    private ApiResponseService $apiResponse;

    public function __construct(AuthService $authService, ApiResponseService $apiResponse)
    {
        $this->authService = $authService;
        $this->apiResponse = $apiResponse;
    }

    public function register(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // 註冊資料驗證由AuthService處理
            $result = $this->authService->register($data);
            
            return $this->apiResponse->created($response, $result, '用戶註冊成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function login(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // 驗證登入資料
            $this->validateLoginData($data);
            
            $result = $this->authService->login($data['email'], $data['password']);
            
            return $this->apiResponse->success($response, $result, '登入成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function refreshToken(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (empty($data['token'])) {
                return $this->apiResponse->error($response, 'Token is required', 400);
            }
            
            $newToken = $this->authService->refreshToken($data['token']);
            
            return $this->apiResponse->success($response, [
                'token' => $newToken,
                'expires_in' => 3600
            ], 'Token refreshed successfully');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function changePassword(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            $userId = $request->getAttribute('user_id');
            
            // 驗證密碼變更資料
            $this->validatePasswordChangeData($data);
            
            $this->authService->changePassword(
                $userId,
                $data['current_password'],
                $data['new_password']
            );
            
            return $this->apiResponse->success($response, null, '密碼變更成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function requestPasswordReset(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (empty($data['email'])) {
                return $this->apiResponse->error($response, 'Email is required', 400);
            }
            
            if (!v::email()->validate($data['email'])) {
                return $this->apiResponse->error($response, 'Invalid email format', 400);
            }
            
            $this->authService->requestPasswordReset($data['email']);
            
            return $this->apiResponse->success($response, null, '密碼重置請求已發送，請檢查您的郵箱');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function resetPassword(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // 驗證密碼重置資料
            $this->validatePasswordResetData($data);
            
            $this->authService->resetPassword($data['token'], $data['new_password']);
            
            return $this->apiResponse->success($response, null, '密碼重置成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function validateToken(Request $request, Response $response): Response
    {
        try {
            $token = $request->getHeaderLine('Authorization');
            
            if (empty($token) || !str_starts_with($token, 'Bearer ')) {
                return $this->apiResponse->unauthorized($response, 'Invalid authorization header');
            }
            
            $token = substr($token, 7); // 移除 'Bearer ' 前綴
            
            $userData = $this->authService->validateToken($token);
            
            return $this->apiResponse->success($response, $userData, 'Token is valid');
            
        } catch (\Exception $e) {
            return $this->apiResponse->unauthorized($response, 'Invalid token');
        }
    }

    public function logout(Request $request, Response $response): Response
    {
        try {
            // 在實際應用中，這裡應該將token加入黑名單
            // 或者更新用戶會話狀態
            
            return $this->apiResponse->success($response, null, '登出成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function getProfile(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            
            // 這裡應該調用UserService獲取用戶資料
            // 暫時返回基本信息
            $profile = [
                'user_id' => $userId,
                'message' => 'Profile endpoint - implement user data retrieval'
            ];
            
            return $this->apiResponse->success($response, $profile, '用戶資料獲取成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    public function updateProfile(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            $userId = $request->getAttribute('user_id');
            
            // 驗證資料更新
            $this->validateProfileUpdateData($data);
            
            // 這裡應該調用UserService更新用戶資料
            // 暫時返回成功訊息
            
            return $this->apiResponse->success($response, null, '用戶資料更新成功');
            
        } catch (\Exception $e) {
            return $this->apiResponse->handleException($response, $e);
        }
    }

    private function validateRegistrationData(array $data): void
    {
        $validator = v::key('username', v::stringType()->length(3, 50)->alnum('_'))
                     ->key('email', v::email())
                     ->key('password', v::stringType()->length(8, 255))
                     ->key('role', v::in(['supplier', 'creator', 'media']))
                     ->key('first_name', v::optional(v::stringType()->length(1, 50)))
                     ->key('last_name', v::optional(v::stringType()->length(1, 50)))
                     ->key('phone', v::optional(v::stringType()->length(8, 20)))
                     ->key('bio', v::optional(v::stringType()->length(0, 500)));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('註冊資料驗證失敗: ' . $e->getMessage());
        }

        // 額外驗證
        if (isset($data['phone']) && !preg_match('/^[\d\-\+\s\(\)]+$/', $data['phone'])) {
            throw new \InvalidArgumentException('電話號碼格式不正確');
        }
    }

    private function validateLoginData(array $data): void
    {
        $validator = v::key('email', v::email())
                     ->key('password', v::stringType()->notEmpty());

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('登入資料驗證失敗: ' . $e->getMessage());
        }
    }

    private function validatePasswordChangeData(array $data): void
    {
        $validator = v::key('current_password', v::stringType()->notEmpty())
                     ->key('new_password', v::stringType()->length(8, 255));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('密碼變更資料驗證失敗: ' . $e->getMessage());
        }
    }

    private function validatePasswordResetData(array $data): void
    {
        $validator = v::key('token', v::stringType()->notEmpty())
                     ->key('new_password', v::stringType()->length(8, 255));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('密碼重置資料驗證失敗: ' . $e->getMessage());
        }
    }

    private function validateProfileUpdateData(array $data): void
    {
        $validator = v::key('first_name', v::optional(v::stringType()->length(1, 50)))
                     ->key('last_name', v::optional(v::stringType()->length(1, 50)))
                     ->key('phone', v::optional(v::stringType()->length(8, 20)))
                     ->key('bio', v::optional(v::stringType()->length(0, 500)))
                     ->key('avatar_url', v::optional(v::url()));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('資料更新驗證失敗: ' . $e->getMessage());
        }

        // 額外驗證
        if (isset($data['phone']) && !preg_match('/^[\d\-\+\s\(\)]+$/', $data['phone'])) {
            throw new \InvalidArgumentException('電話號碼格式不正確');
        }
    }
}
