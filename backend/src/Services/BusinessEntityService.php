<?php

namespace App\Services;

use PDO;
use App\Repositories\BusinessEntityRepository;
use App\Repositories\SupplierProfileRepository;
use App\Repositories\CreatorProfileRepository;
use App\Repositories\MediaProfileRepository;

/**
 * 業務實體服務
 * 處理業務實體的創建、更新、刪除和查詢邏輯
 */
class BusinessEntityService
{
    private PDO $pdo;
    private BusinessEntityRepository $businessEntityRepository;
    private SupplierProfileRepository $supplierProfileRepository;
    private CreatorProfileRepository $creatorProfileRepository;
    private MediaProfileRepository $mediaProfileRepository;

    public function __construct(
        PDO $pdo,
        BusinessEntityRepository $businessEntityRepository,
        SupplierProfileRepository $supplierProfileRepository,
        CreatorProfileRepository $creatorProfileRepository,
        MediaProfileRepository $mediaProfileRepository
    ) {
        $this->pdo = $pdo;
        $this->businessEntityRepository = $businessEntityRepository;
        $this->supplierProfileRepository = $supplierProfileRepository;
        $this->creatorProfileRepository = $creatorProfileRepository;
        $this->mediaProfileRepository = $mediaProfileRepository;
    }

    /**
     * 創建業務實體
     */
    public function createBusinessEntity(array $data): array
    {
        try {
            $this->pdo->beginTransaction();

            // 創建業務實體
            $businessEntityId = $this->businessEntityRepository->create([
                'name' => $data['name'],
                'type' => $data['type'],
                'description' => $data['description'],
                'website' => $data['website'] ?? null,
                'status' => $data['status'] ?? 'active'
            ]);

            // 根據類型創建對應的詳細資訊
            if ($businessEntityId) {
                $this->createProfileByType($businessEntityId, $data['type'], $data);
            }

            $this->pdo->commit();

            // 返回創建的業務實體
            return $this->businessEntityRepository->findById($businessEntityId);

        } catch (\Exception $e) {
            $this->pdo->rollBack();
            error_log("創建業務實體失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 獲取業務實體列表
     */
    public function getBusinessEntities(array $filters = []): array
    {
        return $this->businessEntityRepository->findAll($filters);
    }

    /**
     * 獲取單個業務實體
     */
    public function getBusinessEntity(string $id): ?array
    {
        return $this->businessEntityRepository->findById($id);
    }

    /**
     * 更新業務實體
     */
    public function updateBusinessEntity(string $id, array $data): ?array
    {
        try {
            $this->pdo->beginTransaction();

            // 更新業務實體基本資訊
            $updated = $this->businessEntityRepository->update($id, $data);

            if ($updated) {
                // 如果有類型變更，需要處理詳細資訊的遷移
                if (isset($data['type'])) {
                    $this->handleTypeChange($id, $data['type'], $data);
                }
            }

            $this->pdo->commit();

            return $updated ? $this->businessEntityRepository->findById($id) : null;

        } catch (\Exception $e) {
            $this->pdo->rollBack();
            error_log("更新業務實體失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 刪除業務實體
     */
    public function deleteBusinessEntity(string $id): bool
    {
        try {
            $this->pdo->beginTransaction();

            // 刪除相關的詳細資訊
            $this->deleteProfilesByBusinessEntityId($id);

            // 刪除業務實體
            $deleted = $this->businessEntityRepository->delete($id);

            $this->pdo->commit();

            return $deleted;

        } catch (\Exception $e) {
            $this->pdo->rollBack();
            error_log("刪除業務實體失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 根據類型創建對應的詳細資訊
     */
    private function createProfileByType(string $businessEntityId, string $type, array $data): void
    {
        switch ($type) {
            case 'supplier':
                $this->supplierProfileRepository->create([
                    'business_entity_id' => $businessEntityId,
                    'company_name' => $data['company_name'] ?? null,
                    'business_type' => $data['business_type'] ?? null,
                    'license_number' => $data['license_number'] ?? null,
                    'service_areas' => $data['service_areas'] ?? null,
                    'specialties' => $data['specialties'] ?? null
                ]);
                break;

            case 'koc':
                $this->creatorProfileRepository->create([
                    'business_entity_id' => $businessEntityId,
                    'portfolio_url' => $data['portfolio_url'] ?? null,
                    'content_types' => $data['content_types'] ?? null,
                    'target_audience' => $data['target_audience'] ?? null,
                    'follower_count' => $data['follower_count'] ?? null
                ]);
                break;

            case 'media':
                $this->mediaProfileRepository->create([
                    'business_entity_id' => $businessEntityId,
                    'media_type' => $data['media_type'] ?? null,
                    'platform_name' => $data['platform_name'] ?? null,
                    'audience_size' => $data['audience_size'] ?? null,
                    'content_categories' => $data['content_categories'] ?? null
                ]);
                break;
        }
    }

    /**
     * 處理類型變更
     */
    private function handleTypeChange(string $businessEntityId, string $newType, array $data): void
    {
        // 獲取當前業務實體資訊
        $currentEntity = $this->businessEntityRepository->findById($businessEntityId);
        if (!$currentEntity) {
            return;
        }

        $oldType = $currentEntity['type'];

        // 如果類型沒有變更，不需要處理
        if ($oldType === $newType) {
            return;
        }

        // 刪除舊的詳細資訊
        $this->deleteProfilesByBusinessEntityId($businessEntityId);

        // 創建新的詳細資訊
        $this->createProfileByType($businessEntityId, $newType, $data);
    }

    /**
     * 刪除業務實體相關的所有詳細資訊
     */
    private function deleteProfilesByBusinessEntityId(string $businessEntityId): void
    {
        // 刪除供應商詳細資訊
        $this->supplierProfileRepository->deleteByBusinessEntityId($businessEntityId);

        // 刪除創作者詳細資訊
        $this->creatorProfileRepository->deleteByBusinessEntityId($businessEntityId);

        // 刪除媒體詳細資訊
        $this->mediaProfileRepository->deleteByBusinessEntityId($businessEntityId);
    }

    /**
     * 獲取業務實體的完整資訊（包括詳細資訊）
     */
    public function getBusinessEntityWithProfile(string $id): ?array
    {
        $businessEntity = $this->businessEntityRepository->findById($id);
        if (!$businessEntity) {
            return null;
        }

        // 根據類型獲取對應的詳細資訊
        switch ($businessEntity['type']) {
            case 'supplier':
                $profile = $this->supplierProfileRepository->findByBusinessEntityId($id);
                if ($profile) {
                    $businessEntity['supplier_profile'] = $profile;
                }
                break;

            case 'koc':
                $profile = $this->creatorProfileRepository->findByBusinessEntityId($id);
                if ($profile) {
                    $businessEntity['creator_profile'] = $profile;
                }
                break;

            case 'media':
                $profile = $this->mediaProfileRepository->findByBusinessEntityId($id);
                if ($profile) {
                    $businessEntity['media_profile'] = $profile;
                }
                break;
        }

        return $businessEntity;
    }

    /**
     * 搜索業務實體
     */
    public function searchBusinessEntities(string $query, array $filters = []): array
    {
        return $this->businessEntityRepository->search($query, $filters);
    }

    /**
     * 獲取業務實體統計資訊
     */
    public function getBusinessEntityStats(): array
    {
        return $this->businessEntityRepository->getStats();
    }

    /**
     * 批量更新業務實體狀態
     */
    public function batchUpdateStatus(array $ids, string $status): int
    {
        try {
            $this->pdo->beginTransaction();

            $updatedCount = 0;
            foreach ($ids as $id) {
                if ($this->businessEntityRepository->update($id, ['status' => $status])) {
                    $updatedCount++;
                }
            }

            $this->pdo->commit();
            return $updatedCount;

        } catch (\Exception $e) {
            $this->pdo->rollBack();
            error_log("批量更新業務實體狀態失敗: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 驗證業務實體資料
     */
    public function validateBusinessEntityData(array $data): array
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors[] = '業務實體名稱不能為空';
        }

        if (empty($data['type'])) {
            $errors[] = '業務實體類型不能為空';
        } elseif (!in_array($data['type'], ['supplier', 'koc', 'media'])) {
            $errors[] = '無效的業務實體類型';
        }

        if (empty($data['description'])) {
            $errors[] = '業務實體描述不能為空';
        }

        if (isset($data['website']) && !empty($data['website'])) {
            if (!filter_var($data['website'], FILTER_VALIDATE_URL)) {
                $errors[] = '無效的網站URL格式';
            }
        }

        return $errors;
    }

    /**
     * 檢查業務實體名稱是否已存在
     */
    public function isNameExists(string $name, ?string $excludeId = null): bool
    {
        return $this->businessEntityRepository->isNameExists($name, $excludeId);
    }

    /**
     * 獲取業務實體類型統計
     */
    public function getTypeStats(): array
    {
        return $this->businessEntityRepository->getTypeStats();
    }

    /**
     * 獲取活躍業務實體列表
     */
    public function getActiveBusinessEntities(array $filters = []): array
    {
        $filters['status'] = 'active';
        return $this->businessEntityRepository->findAll($filters);
    }

    /**
     * 獲取待審核業務實體列表
     */
    public function getPendingBusinessEntities(): array
    {
        return $this->businessEntityRepository->findAll(['status' => 'pending']);
    }
}
