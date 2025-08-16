<?php

namespace App\Services;

class NotificationService
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    public function createNotification(string $userId, string $type, string $message, array $data = []): string
    {
        $notificationData = [
            'user_id' => $userId,
            'type' => $type,
            'message' => $message,
            'data' => json_encode($data),
            'is_read' => false,
            'created_at' => date('Y-m-d H:i:s')
        ];

        return $this->db->insert('notifications', $notificationData);
    }

    public function getUserNotifications(string $userId, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT * FROM notifications 
                WHERE user_id = :user_id 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        $notifications = $this->db->query($sql, [
            'user_id' => $userId,
            'limit' => $limit,
            'offset' => $offset
        ]);

        // 獲取總數
        $countSql = "SELECT COUNT(*) as total FROM notifications WHERE user_id = :user_id";
        $total = $this->db->query($countSql, ['user_id' => $userId])[0]['total'] ?? 0;

        return [
            'notifications' => $notifications,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ];
    }

    public function getUnreadCount(string $userId): int
    {
        $sql = "SELECT COUNT(*) as count FROM notifications WHERE user_id = :user_id AND is_read = false";
        $result = $this->db->query($sql, ['user_id' => $userId]);
        return $result[0]['count'] ?? 0;
    }

    public function markAsRead(string $notificationId, string $userId): bool
    {
        $sql = "UPDATE notifications SET is_read = true, read_at = NOW() 
                WHERE id = :id AND user_id = :user_id";
        
        return $this->db->query($sql, [
            'id' => $notificationId,
            'user_id' => $userId
        ]) !== false;
    }

    public function markAllAsRead(string $userId): bool
    {
        $sql = "UPDATE notifications SET is_read = true, read_at = NOW() 
                WHERE user_id = :user_id AND is_read = false";
        
        return $this->db->query($sql, ['user_id' => $userId]) !== false;
    }

    public function deleteNotification(string $notificationId, string $userId): bool
    {
        $sql = "DELETE FROM notifications WHERE id = :id AND user_id = :user_id";
        
        return $this->db->query($sql, [
            'id' => $notificationId,
            'user_id' => $userId
        ]) !== false;
    }

    public function deleteOldNotifications(string $userId, int $daysOld = 30): bool
    {
        $sql = "DELETE FROM notifications 
                WHERE user_id = :user_id 
                AND created_at < NOW() - INTERVAL :days DAY";
        
        return $this->db->query($sql, [
            'user_id' => $userId,
            'days' => $daysOld
        ]) !== false;
    }

    public function createTaskNotification(string $userId, string $taskId, string $type, array $data = []): string
    {
        $messages = [
            'new_application' => '有新的任務申請',
            'application_accepted' => '您的任務申請已被接受',
            'application_rejected' => '您的任務申請未被接受',
            'task_completed' => '任務已完成',
            'task_cancelled' => '任務已被取消',
            'payment_received' => '收到任務報酬',
            'deadline_reminder' => '任務截止日期提醒'
        ];

        $message = $messages[$type] ?? '任務相關通知';
        
        return $this->createNotification($userId, $type, $message, array_merge($data, ['task_id' => $taskId]));
    }

    public function createSystemNotification(string $userId, string $type, string $message, array $data = []): string
    {
        return $this->createNotification($userId, 'system_' . $type, $message, $data);
    }

    public function createBatchNotifications(array $userIds, string $type, string $message, array $data = []): array
    {
        $notificationIds = [];
        
        foreach ($userIds as $userId) {
            $notificationIds[] = $this->createNotification($userId, $type, $message, $data);
        }
        
        return $notificationIds;
    }

    public function getNotificationTypes(): array
    {
        return [
            'task' => [
                'new_application' => '新任務申請',
                'application_accepted' => '申請被接受',
                'application_rejected' => '申請被拒絕',
                'task_completed' => '任務完成',
                'task_cancelled' => '任務取消',
                'payment_received' => '收到報酬',
                'deadline_reminder' => '截止提醒'
            ],
            'system' => [
                'welcome' => '歡迎通知',
                'profile_update' => '資料更新',
                'security_alert' => '安全提醒',
                'maintenance' => '系統維護'
            ],
            'matching' => [
                'new_task_match' => '新任務匹配',
                'creator_suggestion' => '創作者推薦',
                'supplier_suggestion' => '供應商推薦'
            ]
        ];
    }

    public function getNotificationStats(string $userId): array
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
                    COUNT(CASE WHEN type LIKE 'task%' THEN 1 END) as task_notifications,
                    COUNT(CASE WHEN type LIKE 'system%' THEN 1 END) as system_notifications,
                    COUNT(CASE WHEN type LIKE 'matching%' THEN 1 END) as matching_notifications
                FROM notifications 
                WHERE user_id = :user_id";
        
        $result = $this->db->query($sql, ['user_id' => $userId])[0] ?? [];
        
        return [
            'total' => $result['total'] ?? 0,
            'unread' => $result['unread'] ?? 0,
            'by_type' => [
                'task' => $result['task_notifications'] ?? 0,
                'system' => $result['system_notifications'] ?? 0,
                'matching' => $result['matching_notifications'] ?? 0
            ]
        ];
    }
}
