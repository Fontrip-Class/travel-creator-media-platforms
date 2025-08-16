<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Respect\Validation\Validator as v;

class AuthService
{
    private DatabaseService $db;
    private string $jwtSecret;
    private int $jwtExpiration;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'default_secret';
        $this->jwtExpiration = (int) ($_ENV['JWT_EXPIRATION'] ?? 3600);
    }

    public function register(array $userData): array
    {
        // 驗證輸入資料
        $this->validateRegistrationData($userData);

        // 檢查用戶是否已存在
        if ($this->db->exists('users', 'email = :email', ['email' => $userData['email']])) {
            throw new \Exception('Email already exists');
        }

        if ($this->db->exists('users', 'username = :username', ['username' => $userData['username']])) {
            throw new \Exception('Username already exists');
        }

        // 密碼加密
        $userData['password_hash'] = password_hash($userData['password'], PASSWORD_DEFAULT);
        unset($userData['password']);

        // 插入用戶資料
        $userId = $this->db->insert('users', $userData);

        // 根據角色創建詳細資料
        $this->createRoleProfile($userId, $userData['role'], $userData);

        // 生成JWT token
        $token = $this->generateToken($userId, $userData['role']);

        return [
            'user_id' => $userId,
            'token' => $token,
            'role' => $userData['role']
        ];
    }

    public function login(string $email, string $password): array
    {
        // 查找用戶
        $user = $this->db->fetchOne(
            'SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = :email',
            ['email' => $email]
        );

        if (!$user) {
            throw new \Exception('Invalid credentials');
        }

        if (!$user['is_active']) {
            throw new \Exception('Account is deactivated');
        }

        // 驗證密碼
        if (!password_verify($password, $user['password_hash'])) {
            throw new \Exception('Invalid credentials');
        }

        // 生成JWT token
        $token = $this->generateToken($user['id'], $user['role']);

        return [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'token' => $token
        ];
    }

    public function validateToken(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            
            // 檢查用戶是否仍然存在且活躍
            $user = $this->db->fetchOne(
                'SELECT id, username, email, role, is_active FROM users WHERE id = :id',
                ['id' => $decoded->user_id]
            );

            if (!$user || !$user['is_active']) {
                throw new \Exception('User not found or inactive');
            }

            return [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ];
        } catch (\Exception $e) {
            throw new \Exception('Invalid token: ' . $e->getMessage());
        }
    }

    public function refreshToken(string $token): string
    {
        $payload = $this->validateToken($token);
        return $this->generateToken($payload['user_id'], $payload['role']);
    }

    private function generateToken(string $userId, string $role): string
    {
        $payload = [
            'user_id' => $userId,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + $this->jwtExpiration
        ];

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
    }

    private function validateRegistrationData(array $data): void
    {
        $validator = v::key('username', v::stringType()->length(3, 50)->alnum('_'))
                     ->key('email', v::email())
                     ->key('password', v::stringType()->length(8, 255))
                     ->key('role', v::in(['supplier', 'creator', 'media']))
                     ->key('first_name', v::optional(v::stringType()->length(1, 50)))
                     ->key('last_name', v::optional(v::stringType()->length(1, 50)));

        try {
            $validator->assert($data);
        } catch (\Exception $e) {
            throw new \Exception('Validation failed: ' . $e->getMessage());
        }
    }

    private function createRoleProfile(string $userId, string $role, array $data): void
    {
        $profileData = ['user_id' => $userId];

        switch ($role) {
            case 'supplier':
                $profileData['company_name'] = $data['company_name'] ?? null;
                $profileData['business_type'] = $data['business_type'] ?? null;
                $this->db->insert('supplier_profiles', $profileData);
                break;

            case 'creator':
                $profileData['portfolio_url'] = $data['portfolio_url'] ?? null;
                $profileData['content_types'] = $data['content_types'] ?? [];
                $this->db->insert('creator_profiles', $profileData);
                break;

            case 'media':
                $profileData['media_type'] = $data['media_type'] ?? null;
                $profileData['platform_name'] = $data['platform_name'] ?? null;
                $this->db->insert('media_profiles', $profileData);
                break;
        }
    }

    public function changePassword(string $userId, string $currentPassword, string $newPassword): bool
    {
        // 驗證當前密碼
        $user = $this->db->fetchOne(
            'SELECT password_hash FROM users WHERE id = :id',
            ['id' => $userId]
        );

        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            throw new \Exception('Current password is incorrect');
        }

        // 驗證新密碼
        if (strlen($newPassword) < 8) {
            throw new \Exception('New password must be at least 8 characters long');
        }

        // 更新密碼
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->db->update('users', ['password_hash' => $newPasswordHash], 'id = :id', ['id' => $userId]);

        return true;
    }
}
