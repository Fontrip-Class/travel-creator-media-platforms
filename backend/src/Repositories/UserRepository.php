<?php

namespace App\Repositories;

use App\Services\DatabaseService;

class UserRepository
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    public function findById(string $userId): ?array
    {
        $sql = "SELECT u.*, 
                       sp.company_name, sp.business_type, sp.service_areas, sp.specialties,
                       cp.portfolio_url, cp.content_types, cp.target_audience,
                       mp.media_type, mp.platform_name, mp.audience_size, mp.content_categories
                FROM users u
                LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
                LEFT JOIN creator_profiles cp ON u.id = cp.user_id
                LEFT JOIN media_profiles mp ON u.id = mp.user_id
                WHERE u.id = :id";
        
        return $this->db->fetchOne($sql, ['id' => $userId]);
    }

    public function findByEmail(string $email): ?array
    {
        return $this->db->fetchOne('SELECT * FROM users WHERE email = :email', ['email' => $email]);
    }

    public function findByUsername(string $username): ?array
    {
        return $this->db->fetchOne('SELECT * FROM users WHERE username = :username', ['username' => $username]);
    }

    public function findByRole(string $role, int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT u.*, 
                       sp.company_name, sp.business_type,
                       cp.portfolio_url, cp.content_types,
                       mp.media_type, mp.platform_name
                FROM users u
                LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
                LEFT JOIN creator_profiles cp ON u.id = cp.user_id
                LEFT JOIN media_profiles mp ON u.id = mp.user_id
                WHERE u.role = :role AND u.is_active = true
                ORDER BY u.rating DESC, u.created_at DESC
                LIMIT :limit OFFSET :offset";
        
        return $this->db->fetchAll($sql, [
            'role' => $role,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    public function searchCreators(array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $whereConditions = ['u.role = :role', 'u.is_active = true'];
        $params = ['role' => 'creator', 'limit' => $limit, 'offset' => $offset];

        // 技能篩選
        if (!empty($filters['skills'])) {
            $whereConditions[] = 'u.skills && :skills';
            $params['skills'] = $filters['skills'];
        }

        // 地點篩選
        if (!empty($filters['location'])) {
            $whereConditions[] = 'ST_DWithin(u.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :radius)';
            $params['lng'] = $filters['location']['lng'];
            $params['lat'] = $filters['location']['lat'];
            $params['radius'] = $filters['location']['radius'] ?? 50000; // 預設50公里
        }

        // 評分篩選
        if (!empty($filters['min_rating'])) {
            $whereConditions[] = 'u.rating >= :min_rating';
            $params['min_rating'] = $filters['min_rating'];
        }

        $whereClause = implode(' AND ', $whereConditions);
        
        $sql = "SELECT u.*, cp.portfolio_url, cp.content_types, cp.target_audience
                FROM users u
                LEFT JOIN creator_profiles cp ON u.id = cp.user_id
                WHERE {$whereClause}
                ORDER BY u.rating DESC, u.completed_tasks DESC
                LIMIT :limit OFFSET :offset";
        
        return $this->db->fetchAll($sql, $params);
    }

    public function updateProfile(string $userId, array $data): bool
    {
        // 分離基本用戶資料和角色特定資料
        $userData = array_intersect_key($data, array_flip([
            'first_name', 'last_name', 'phone', 'avatar_url', 'bio', 'location', 'address', 'skills'
        ]));
        
        $roleData = array_diff_key($data, $userData);
        
        // 更新基本用戶資料
        if (!empty($userData)) {
            $this->db->update('users', $userData, 'id = :id', ['id' => $userId]);
        }
        
        // 更新角色特定資料
        if (!empty($roleData)) {
            $user = $this->findById($userId);
            if ($user) {
                $this->updateRoleProfile($userId, $user['role'], $roleData);
            }
        }
        
        return true;
    }

    private function updateRoleProfile(string $userId, string $role, array $data): void
    {
        switch ($role) {
            case 'supplier':
                $this->db->update('supplier_profiles', $data, 'user_id = :user_id', ['user_id' => $userId]);
                break;
            case 'creator':
                $this->db->update('creator_profiles', $data, 'user_id = :user_id', ['user_id' => $userId]);
                break;
            case 'media':
                $this->db->update('media_profiles', $data, 'user_id = :user_id', ['user_id' => $userId]);
                break;
        }
    }

    public function updateRating(string $userId, float $newRating): bool
    {
        $this->db->update('users', ['rating' => $newRating], 'id = :id', ['id' => $userId]);
        return true;
    }

    public function incrementTaskCount(string $userId): bool
    {
        $sql = "UPDATE users SET total_tasks = total_tasks + 1 WHERE id = :id";
        $this->db->query($sql, ['id' => $userId]);
        return true;
    }

    public function incrementCompletedTaskCount(string $userId): bool
    {
        $sql = "UPDATE users SET completed_tasks = completed_tasks + 1 WHERE id = :id";
        $this->db->query($sql, ['id' => $userId]);
        return true;
    }

    public function deactivateUser(string $userId): bool
    {
        $this->db->update('users', ['is_active' => false], 'id = :id', ['id' => $userId]);
        return true;
    }

    public function activateUser(string $userId): bool
    {
        $this->db->update('users', ['is_active' => true], 'id = :id', ['id' => $userId]);
        return true;
    }
}
