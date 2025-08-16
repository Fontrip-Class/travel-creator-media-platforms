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
    private int $maxLoginAttempts = 5;
    private int $lockoutDuration = 900; // 15分鐘

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

        // 檢查密碼強度
        $this->validatePasswordStrength($userData['password']);

        // 密碼加密
        $userData['password_hash'] = password_hash($userData['password'], PASSWORD_ARGON2ID);
        unset($userData['password']);

        // 開始事務
        $this->db->beginTransaction();
        
        try {
            // 插入用戶資料
            $userId = $this->db->insert('users', $userData);

            // 根據角色創建詳細資料
            $this->createRoleProfile($userId, $userData['role'], $userData);

            // 創建用戶設置
            $this->createUserSettings($userId);

            $this->db->commit();

            // 生成JWT token
            $token = $this->generateToken($userId, $userData['role']);

            return [
                'user_id' => $userId,
                'token' => $token,
                'role' => $userData['role'],
                'message' => 'User registered successfully'
            ];
        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    public function login(string $email, string $password): array
    {
        // 檢查帳戶是否被鎖定
        $this->checkAccountLockout($email);

        // 查找用戶
        $user = $this->db->fetchOne(
            'SELECT id, username, email, password_hash, role, is_active, login_attempts, locked_until FROM users WHERE email = :email',
            ['email' => $email]
        );

        if (!$user) {
            $this->incrementLoginAttempts($email);
            throw new \Exception('Invalid credentials');
        }

        if (!$user['is_active']) {
            throw new \Exception('Account is deactivated');
        }

        // 檢查帳戶鎖定
        if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
            $remainingTime = strtotime($user['locked_until']) - time();
            throw new \Exception("Account is locked. Please try again in " . ceil($remainingTime / 60) . " minutes");
        }

        // 驗證密碼
        if (!password_verify($password, $user['password_hash'])) {
            $this->incrementLoginAttempts($email);
            throw new \Exception('Invalid credentials');
        }

        // 登入成功，重置登入嘗試次數
        $this->resetLoginAttempts($user['id']);

        // 更新最後登入時間
        $this->updateLastLogin($user['id']);

        // 生成JWT token
        $token = $this->generateToken($user['id'], $user['role']);

        return [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'token' => $token,
            'expires_in' => $this->jwtExpiration
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

        // 驗證新密碼強度
        $this->validatePasswordStrength($newPassword);

        // 檢查新密碼是否與舊密碼相同
        if (password_verify($newPassword, $user['password_hash'])) {
            throw new \Exception('New password must be different from current password');
        }

        // 更新密碼
        $newPasswordHash = password_hash($newPassword, PASSWORD_ARGON2ID);
        $this->db->update('users', ['password_hash' => $newPasswordHash], 'id = :id', ['id' => $userId]);

        return true;
    }

    public function requestPasswordReset(string $email): bool
    {
        $user = $this->db->fetchOne(
            'SELECT id FROM users WHERE email = :email AND is_active = true',
            ['email' => $email]
        );

        if (!$user) {
            // 為了安全，不透露用戶是否存在
            return true;
        }

        // 生成重置token
        $resetToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1小時後過期

        $this->db->update('users', [
            'reset_token' => $resetToken,
            'reset_token_expires' => $expiresAt
        ], 'id = :id', ['id' => $user['id']]);

        // 這裡應該發送郵件，暫時返回true
        return true;
    }

    public function resetPassword(string $token, string $newPassword): bool
    {
        $user = $this->db->fetchOne(
            'SELECT id FROM users WHERE reset_token = :token AND reset_token_expires > NOW()',
            ['token' => $token]
        );

        if (!$user) {
            throw new \Exception('Invalid or expired reset token');
        }

        // 驗證新密碼強度
        $this->validatePasswordStrength($newPassword);

        // 更新密碼並清除重置token
        $newPasswordHash = password_hash($newPassword, PASSWORD_ARGON2ID);
        $this->db->update('users', [
            'password_hash' => $newPasswordHash,
            'reset_token' => null,
            'reset_token_expires' => null
        ], 'id = :id', ['id' => $user['id']]);

        return true;
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

    private function validatePasswordStrength(string $password): void
    {
        if (strlen($password) < 8) {
            throw new \Exception('Password must be at least 8 characters long');
        }

        if (!preg_match('/[A-Z]/', $password)) {
            throw new \Exception('Password must contain at least one uppercase letter');
        }

        if (!preg_match('/[a-z]/', $password)) {
            throw new \Exception('Password must contain at least one lowercase letter');
        }

        if (!preg_match('/[0-9]/', $password)) {
            throw new \Exception('Password must contain at least one number');
        }

        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            throw new \Exception('Password must contain at least one special character');
        }
    }

    private function checkAccountLockout(string $email): void
    {
        $user = $this->db->fetchOne(
            'SELECT locked_until FROM users WHERE email = :email',
            ['email' => $email]
        );

        if ($user && $user['locked_until'] && strtotime($user['locked_until']) > time()) {
            $remainingTime = strtotime($user['locked_until']) - time();
            throw new \Exception("Account is locked. Please try again in " . ceil($remainingTime / 60) . " minutes");
        }
    }

    private function incrementLoginAttempts(string $email): void
    {
        $user = $this->db->fetchOne(
            'SELECT id, login_attempts FROM users WHERE email = :email',
            ['email' => $email]
        );

        if ($user) {
            $newAttempts = $user['login_attempts'] + 1;
            $updateData = ['login_attempts' => $newAttempts];

            // 如果達到最大嘗試次數，鎖定帳戶
            if ($newAttempts >= $this->maxLoginAttempts) {
                $updateData['locked_until'] = date('Y-m-d H:i:s', time() + $this->lockoutDuration);
            }

            $this->db->update('users', $updateData, 'id = :id', ['id' => $user['id']]);
        }
    }

    private function resetLoginAttempts(string $userId): void
    {
        $this->db->update('users', [
            'login_attempts' => 0,
            'locked_until' => null
        ], 'id = :id', ['id' => $userId]);
    }

    private function updateLastLogin(string $userId): void
    {
        $this->db->update('users', [
            'last_login' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $userId]);
    }

    private function generateToken(string $userId, string $role): string
    {
        $payload = [
            'user_id' => $userId,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + $this->jwtExpiration,
            'jti' => bin2hex(random_bytes(16)) // JWT ID for uniqueness
        ];

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
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

    private function createUserSettings(string $userId): void
    {
        $defaultSettings = [
            'user_id' => $userId,
            'email_notifications' => true,
            'push_notifications' => true,
            'language' => 'zh-TW',
            'timezone' => 'Asia/Taipei',
            'theme' => 'light'
        ];

        $this->db->insert('user_settings', $defaultSettings);
    }
}
