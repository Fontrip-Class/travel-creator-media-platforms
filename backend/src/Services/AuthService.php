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
        $this->jwtExpiration = (int) ($_ENV['JWT_EXPIRATION'] ?? 86400); // 默认24小时
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

    public function isUsernameAvailable(string $username): bool
    {
        return !$this->db->exists('users', 'username = :username', ['username' => $username]);
    }

    public function isEmailAvailable(string $email): bool
    {
        return !$this->db->exists('users', 'email = :email', ['email' => $email]);
    }

    public function login(string $email, string $password): array
    {
        // 檢查帳戶是否被鎖定
        $this->checkAccountLockout($email);

        // 查找用戶 - 適配資料庫結構
        $user = $this->db->fetchOne(
            'SELECT id, username, email, password_hash, role, is_active,
                    COALESCE(login_attempts, 0) as login_attempts,
                    locked_until FROM users WHERE email = :email',
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

        // 生成JWT token和refresh token
        $token = $this->generateToken($user['id'], $user['role']);
        $refreshToken = $this->generateRefreshToken($user['id']);

        // 儲存refresh token到資料庫
        $this->storeRefreshToken($user['id'], $refreshToken);

        return [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'token' => $token,
            'refresh_token' => $refreshToken,
            'expires_in' => $this->jwtExpiration,
            'token_type' => 'Bearer'
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

    public function refreshToken(string $refreshToken): array
    {
        try {
            $decoded = JWT::decode($refreshToken, new Key($this->jwtSecret, 'HS256'));

            // 验证这是refresh token
            if (!isset($decoded->type) || $decoded->type !== 'refresh') {
                throw new \Exception('Invalid token type');
            }

            // 检查refresh token是否在数据库中
            $session = $this->db->fetchOne(
                'SELECT user_id, expires_at FROM user_sessions WHERE refresh_token = :refresh_token',
                ['refresh_token' => $refreshToken]
            );

            if (!$session) {
                throw new \Exception('Refresh token not found');
            }

            if (strtotime($session['expires_at']) < time()) {
                // 删除过期的refresh token
                $this->db->delete('user_sessions', 'refresh_token = :refresh_token', ['refresh_token' => $refreshToken]);
                throw new \Exception('Refresh token expired');
            }

            // 获取用户信息
            $user = $this->db->fetchOne(
                'SELECT id, username, email, role, is_active FROM users WHERE id = :id',
                ['id' => $session['user_id']]
            );

            if (!$user || !$user['is_active']) {
                throw new \Exception('User not found or inactive');
            }

            // 生成新的access token和refresh token
            $newToken = $this->generateToken($user['id'], $user['role']);
            $newRefreshToken = $this->generateRefreshToken($user['id']);

            // 更新数据库中的refresh token
            $this->storeRefreshToken($user['id'], $newRefreshToken);

            return [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'token' => $newToken,
                'refresh_token' => $newRefreshToken,
                'expires_in' => $this->jwtExpiration,
                'token_type' => 'Bearer'
            ];
        } catch (\Exception $e) {
            throw new \Exception('Invalid refresh token: ' . $e->getMessage());
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
            "SELECT id FROM users WHERE reset_token = :token AND reset_token_expires > datetime('now')",
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
        // 使用更簡單的驗證邏輯，避免 Respect\Validation 的複雜性
        $errors = [];

        // 用戶名驗證
        if (empty($data['username']) || !is_string($data['username'])) {
            $errors[] = '用戶名不能為空且必須是字符串';
        } elseif (mb_strlen($data['username']) < 3 || mb_strlen($data['username']) > 50) {
            $errors[] = '用戶名長度必須在3-50字符之間';
        } elseif (!preg_match('/^[\p{Han}a-zA-Z0-9_\s]+$/u', $data['username'])) {
            $errors[] = '用戶名格式不正確：只能包含中文、英文字母、數字、底線和空格';
        }

        // 郵箱驗證
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = '郵箱格式不正確';
        }

        // 密碼驗證
        if (empty($data['password']) || !is_string($data['password'])) {
            $errors[] = '密碼不能為空且必須是字符串';
        } elseif (strlen($data['password']) < 6 || strlen($data['password']) > 255) {
            $errors[] = '密碼長度必須在6-255字符之間';
        }

        // 角色驗證
        $validRoles = ['supplier', 'creator', 'media'];
        if (empty($data['role']) || !in_array($data['role'], $validRoles)) {
            $errors[] = '角色必須是以下之一：' . implode(', ', $validRoles);
        }

        // 如果有錯誤，拋出異常
        if (!empty($errors)) {
            throw new \Exception('資料驗證失敗：' . implode('; ', $errors));
        }
    }

    private function validatePasswordStrength(string $password): void
    {
        if (strlen($password) < 6) {
            throw new \Exception('密碼長度至少需要6個字符');
        }

        // 簡化密碼強度要求：至少包含數字和字母
        $hasLetter = preg_match('/[a-zA-Z]/', $password);
        $hasNumber = preg_match('/[0-9]/', $password);

        if (!$hasLetter || !$hasNumber) {
            throw new \Exception('密碼必須至少包含字母和數字');
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
        // 檢查欄位是否存在，如果不存在則跳過
        try {
            $this->db->update('users', [
                'last_login_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $userId]);
        } catch (\Exception $e) {
            // 如果欄位不存在，使用替代欄位或跳過
            if (strpos($e->getMessage(), 'no such column') !== false) {
                error_log("Warning: last_login_at column not found, skipping update");
            } else {
                throw $e;
            }
        }
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

    private function generateRefreshToken(string $userId): string
    {
        $refreshExpiration = (int) ($_ENV['JWT_REFRESH_EXPIRATION'] ?? 604800); // 默认7天
        $payload = [
            'user_id' => $userId,
            'type' => 'refresh',
            'iat' => time(),
            'exp' => time() + $refreshExpiration,
            'jti' => bin2hex(random_bytes(16))
        ];

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
    }

    private function storeRefreshToken(string $userId, string $refreshToken): void
    {
        try {
            // 先删除旧的refresh token
            $this->db->delete('user_sessions', 'user_id = :user_id', ['user_id' => $userId]);

            // 存储新的refresh token - 適配現有資料庫結構
            $sessionData = [
                'user_id' => $userId,
                'token' => $refreshToken,
                'created_at' => date('Y-m-d H:i:s'),
                'expires_at' => date('Y-m-d H:i:s', time() + (int) ($_ENV['JWT_REFRESH_EXPIRATION'] ?? 604800))
            ];

            // 如果 refresh_token 欄位存在，則添加
            $columns = $this->db->rawQuery("PRAGMA table_info(user_sessions)")->fetchAll();
            $hasRefreshTokenColumn = false;
            foreach ($columns as $column) {
                if ($column['name'] === 'refresh_token') {
                    $hasRefreshTokenColumn = true;
                    break;
                }
            }

            if ($hasRefreshTokenColumn) {
                $sessionData['refresh_token'] = $refreshToken;
            }

            $this->db->insert('user_sessions', $sessionData);

        } catch (\Exception $e) {
            error_log("Warning: Failed to store refresh token: " . $e->getMessage());
            // 不拋出異常，避免影響登入流程
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
                $profileData['specialties'] = $data['specialties'] ?? null;
                $profileData['followers_count'] = $data['followers'] ?? 0;
                $profileData['platform'] = $data['platform'] ?? null;
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
