<?php

namespace App\Services;

/**
 * 通知服務
 * 處理系統通知的創建、發送和管理
 */
class NotificationService
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    /**
     * 創建通知
     */
    public function createNotification(string $userId, string $type, string $message, array $data = []): string
    {
        $notificationData = [
            'user_id' => $userId,
            'type' => $type,
            'title' => $this->getNotificationTitle($type),
            'message' => $message,
            'data' => json_encode($data),
            'is_read' => false,
            'priority' => $this->getNotificationPriority($type),
            'created_at' => date('Y-m-d H:i:s')
        ];

        return $this->db->insert('notifications', $notificationData);
    }

    /**
     * 獲取用戶通知
     */
    public function getUserNotifications(string $userId, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;

        $sql = "SELECT * FROM notifications
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset";

        $notifications = $this->db->fetchAll($sql, [
            'user_id' => $userId,
            'limit' => $limit,
            'offset' => $offset
        ]);

        // 獲取總數
        $total = $this->db->count('notifications', 'user_id = :user_id', ['user_id' => $userId]);

        return [
            'notifications' => $notifications,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ];
    }

    /**
     * 標記通知為已讀
     */
    public function markAsRead(string $notificationId): bool
    {
        return $this->db->update('notifications', [
            'is_read' => true,
            'read_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $notificationId]) > 0;
    }

    /**
     * 標記所有通知為已讀
     */
    public function markAllAsRead(string $userId): bool
    {
        return $this->db->update('notifications', [
            'is_read' => true,
            'read_at' => date('Y-m-d H:i:s')
        ], 'user_id = :user_id AND is_read = FALSE', ['user_id' => $userId]) > 0;
    }

    /**
     * 刪除通知
     */
    public function deleteNotification(string $notificationId): bool
    {
        return $this->db->delete('notifications', 'id = :id', ['id' => $notificationId]) > 0;
    }

    /**
     * 獲取通知標題
     */
    private function getNotificationTitle(string $type): string
    {
        $titles = [
            'welcome' => '歡迎加入',
            'new_task_match' => '新任務推薦',
            'task_application' => '任務申請',
            'task_update' => '任務更新',
            'account_suspended' => '帳戶暫停',
            'account_activated' => '帳戶啟用',
            'system' => '系統通知',
            'reminder' => '提醒',
            'new_application' => '新申請'
        ];

        return $titles[$type] ?? '系統通知';
    }

    /**
     * 獲取通知優先級
     */
    private function getNotificationPriority(string $type): string
    {
        $priorities = [
            'account_suspended' => 'high',
            'account_activated' => 'high',
            'task_application' => 'medium',
            'task_update' => 'medium',
            'new_task_match' => 'low',
            'welcome' => 'low',
            'system' => 'medium',
            'reminder' => 'medium'
        ];

        return $priorities[$type] ?? 'normal';
    }

    /**
     * 批量創建通知
     */
    public function createBulkNotifications(array $userIds, string $type, string $message, array $data = []): array
    {
        $notifications = [];

        foreach ($userIds as $userId) {
            try {
                $notificationId = $this->createNotification($userId, $type, $message, $data);
                $notifications[] = $notificationId;
            } catch (\Exception $e) {
                // 記錄錯誤但繼續處理其他通知
                error_log("Failed to create notification for user {$userId}: " . $e->getMessage());
            }
        }

        return $notifications;
    }

    /**
     * 清理過期通知
     */
    public function cleanupOldNotifications(int $daysOld = 30): int
    {
        $cutoffDate = date('Y-m-d H:i:s', strtotime("-{$daysOld} days"));

        return $this->db->delete('notifications',
            'created_at < :cutoff_date AND is_read = TRUE',
            ['cutoff_date' => $cutoffDate]
        );
    }
}
