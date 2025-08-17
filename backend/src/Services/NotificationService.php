<?php

namespace App\Services;

use App\Services\DatabaseService;

class NotificationService
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    /**
     * 通知創作者有新任務
     */
    public function notifyCreatorsForNewTask(array $task): void
    {
        try {
            // 獲取符合條件的創作者
            $creators = $this->getEligibleCreators($task);
            
            foreach ($creators as $creator) {
                $this->createNotification([
                    'user_id' => $creator['id'],
                    'type' => 'new_task_available',
                    'title' => '新任務發布',
                    'message' => "有新的任務「{$task['title']}」符合您的專長領域，立即查看並提交提案！",
                    'data' => [
                        'task_id' => $task['id'],
                        'task_title' => $task['title'],
                        'budget' => $task['budget'],
                        'deadline' => $task['deadline']
                    ],
                    'priority' => 'high',
                    'created_at' => date('Y-m-d H:i:s')
                ]);
            }
        } catch (\Exception $e) {
            // 記錄錯誤但不中斷流程
            error_log("通知創作者失敗: " . $e->getMessage());
        }
    }

    /**
     * 通知供應商有提案需要評估
     */
    public function notifySupplierForProposals(array $task): void
    {
        try {
            $this->createNotification([
                'user_id' => $task['supplier_id'],
                'type' => 'proposals_ready_for_review',
                'title' => '提案待評估',
                'message' => "任務「{$task['title']}」已收到多個創作者提案，請及時評估選擇。",
                'data' => [
                    'task_id' => $task['id'],
                    'task_title' => $task['title'],
                    'proposal_count' => $this->getProposalCount($task['id'])
                ],
                'priority' => 'medium',
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            error_log("通知供應商失敗: " . $e->getMessage());
        }
    }

    /**
     * 通知選中的創作者開始創作
     */
    public function notifyCreatorToStartWork(array $task): void
    {
        try {
            // 獲取選中的創作者
            $selectedCreator = $this->getSelectedCreator($task['id']);
            
            if ($selectedCreator) {
                $this->createNotification([
                    'user_id' => $selectedCreator['creator_id'],
                    'type' => 'proposal_selected',
                    'title' => '提案被選中',
                    'message' => "恭喜！您的提案「{$task['title']}」已被選中，請立即開始創作。",
                    'data' => [
                        'task_id' => $task['id'],
                        'task_title' => $task['title'],
                        'deadline' => $task['deadline'],
                        'budget' => $task['budget']
                    ],
                    'priority' => 'high',
                    'created_at' => date('Y-m-d H:i:s')
                ]);
            }
        } catch (\Exception $e) {
            error_log("通知創作者開始創作失敗: " . $e->getMessage());
        }
    }

    /**
     * 通知供應商審核內容
     */
    public function notifySupplierForReview(array $task): void
    {
        try {
            $this->createNotification([
                'user_id' => $task['supplier_id'],
                'type' => 'content_ready_for_review',
                'title' => '內容待審核',
                'message' => "任務「{$task['title']}」的內容創作已完成，請在3日內審核，逾期將自動通過。",
                'data' => [
                    'task_id' => $task['id'],
                    'task_title' => $task['title'],
                    'deadline' => date('Y-m-d', strtotime('+3 days')),
                    'auto_approve' => true
                ],
                'priority' => 'high',
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            error_log("通知供應商審核失敗: " . $e->getMessage());
        }
    }

    /**
     * 通知媒體通路準備發布
     */
    public function notifyMediaForPublishing(array $task): void
    {
        try {
            // 獲取所有媒體通路用戶
            $mediaUsers = $this->getMediaUsers();
            
            foreach ($mediaUsers as $mediaUser) {
                $this->createNotification([
                    'user_id' => $mediaUser['id'],
                    'type' => 'content_ready_for_publishing',
                    'title' => '內容可發布',
                    'message' => "新內容「{$task['title']}」已通過審核，可下載素材進行發布。",
                    'data' => [
                        'task_id' => $task['id'],
                        'task_title' => $task['title'],
                        'content_type' => $task['content_type'] ?? 'mixed',
                        'available_assets' => $this->getAvailableAssets($task['id'])
                    ],
                    'priority' => 'medium',
                    'created_at' => date('Y-m-d H:i:s')
                ]);
            }
        } catch (\Exception $e) {
            error_log("通知媒體通路失敗: " . $e->getMessage());
        }
    }

    /**
     * 創建通知記錄
     */
    private function createNotification(array $data): void
    {
        try {
            $this->db->insert('notifications', $data);
        } catch (\Exception $e) {
            error_log("創建通知記錄失敗: " . $e->getMessage());
        }
    }

    /**
     * 獲取符合條件的創作者
     */
    private function getEligibleCreators(array $task): array
    {
        // 這裡應該實現基於任務需求和創作者專長的匹配算法
        // 暫時返回所有創作者
        return $this->db->fetchAll(
            'SELECT id FROM users WHERE role = "creator" AND status = "active"'
        );
    }

    /**
     * 獲取提案數量
     */
    private function getProposalCount(string $taskId): int
    {
        $result = $this->db->fetchOne(
            'SELECT COUNT(*) as count FROM task_applications WHERE task_id = :task_id',
            ['task_id' => $taskId]
        );
        
        return $result['count'] ?? 0;
    }

    /**
     * 獲取選中的創作者
     */
    private function getSelectedCreator(string $taskId): ?array
    {
        return $this->db->fetchOne(
            'SELECT creator_id FROM task_applications WHERE task_id = :task_id AND status = "selected"',
            ['task_id' => $taskId]
        );
    }

    /**
     * 獲取媒體通路用戶
     */
    private function getMediaUsers(): array
    {
        return $this->db->fetchAll(
            'SELECT id FROM users WHERE role = "media" AND status = "active"'
        );
    }

    /**
     * 獲取可用素材
     */
    private function getAvailableAssets(string $taskId): array
    {
        return $this->db->fetchAll(
            'SELECT id, file_name, file_type, file_category FROM task_files WHERE task_id = :task_id AND is_public = TRUE',
            ['task_id' => $taskId]
        );
    }

    /**
     * 發送郵件通知
     */
    public function sendEmailNotification(string $userId, string $type, array $data): bool
    {
        try {
            // 獲取用戶郵箱
            $user = $this->db->fetchOne(
                'SELECT email, username FROM users WHERE id = :user_id',
                ['user_id' => $userId]
            );

            if (!$user || !$user['email']) {
                return false;
            }

            // 這裡應該實現實際的郵件發送邏輯
            // 暫時記錄到日誌
            error_log("發送郵件到 {$user['email']}: {$type}");
            
            return true;
        } catch (\Exception $e) {
            error_log("發送郵件通知失敗: " . $e->getMessage());
            return false;
        }
    }

    /**
     * 發送推送通知
     */
    public function sendPushNotification(string $userId, string $type, array $data): bool
    {
        try {
            // 這裡應該實現實際的推送通知邏輯
            // 暫時記錄到日誌
            error_log("發送推送通知到用戶 {$userId}: {$type}");
            
            return true;
        } catch (\Exception $e) {
            error_log("發送推送通知失敗: " . $e->getMessage());
            return false;
        }
    }

    /**
     * 標記通知為已讀
     */
    public function markAsRead(string $notificationId, string $userId): bool
    {
        try {
            $this->db->update('notifications', 
                ['id' => $notificationId],
                [
                    'read_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]
            );
            
            return true;
        } catch (\Exception $e) {
            error_log("標記通知為已讀失敗: " . $e->getMessage());
            return false;
        }
    }

    /**
     * 獲取用戶未讀通知
     */
    public function getUnreadNotifications(string $userId): array
    {
        try {
            return $this->db->fetchAll(
                'SELECT * FROM notifications WHERE user_id = :user_id AND read_at IS NULL ORDER BY created_at DESC',
                ['user_id' => $userId]
            );
        } catch (\Exception $e) {
            error_log("獲取未讀通知失敗: " . $e->getMessage());
            return [];
        }
    }

    /**
     * 獲取用戶所有通知
     */
    public function getUserNotifications(string $userId, int $limit = 50, int $offset = 0): array
    {
        try {
            return $this->db->fetchAll(
                'SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset',
                [
                    'user_id' => $userId,
                    'limit' => $limit,
                    'offset' => $offset
                ]
            );
        } catch (\Exception $e) {
            error_log("獲取用戶通知失敗: " . $e->getMessage());
            return [];
        }
    }

    /**
     * 刪除舊通知
     */
    public function cleanupOldNotifications(int $daysOld = 90): int
    {
        try {
            $cutoffDate = date('Y-m-d H:i:s', strtotime("-{$daysOld} days"));
            
            $result = $this->db->execute(
                'DELETE FROM notifications WHERE created_at < :cutoff_date AND read_at IS NOT NULL',
                ['cutoff_date' => $cutoffDate]
            );
            
            return $result;
        } catch (\Exception $e) {
            error_log("清理舊通知失敗: " . $e->getMessage());
            return 0;
        }
    }
}
