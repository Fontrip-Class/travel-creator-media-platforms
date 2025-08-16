<?php

namespace App\Services;

class NotificationService
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    public function createNotification(string $userId, string $type, string $title, string $message, array $data = []): string
    {
        $notificationData = [
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => json_encode($data),
            'is_read' => false
        ];

        return $this->db->insert('notifications', $notificationData);
    }

    public function getUserNotifications(string $userId, int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        
        return $this->db->fetchAll($sql, [
            'user_id' => $userId,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    public function markAsRead(string $notificationId): bool
    {
        $this->db->update('notifications', ['is_read' => true], 'id = :id', ['id' => $notificationId]);
        return true;
    }

    public function markAllAsRead(string $userId): bool
    {
        $this->db->update('notifications', ['is_read' => true], 'user_id = :user_id', ['user_id' => $userId]);
        return true;
    }

    public function getUnreadCount(string $userId): int
    {
        return $this->db->count('notifications', 'user_id = :user_id AND is_read = false', ['user_id' => $userId]);
    }

    public function deleteNotification(string $notificationId): bool
    {
        $this->db->delete('notifications', 'id = :id', ['id' => $notificationId]);
        return true;
    }

    // 特定類型的通知方法
    public function notifyTaskApplication(string $supplierId, string $taskId, string $creatorName): string
    {
        return $this->createNotification(
            $supplierId,
            'task_application',
            '新的任務申請',
            "創作者 {$creatorName} 申請了您的任務",
            ['task_id' => $taskId, 'creator_name' => $creatorName]
        );
    }

    public function notifyTaskAccepted(string $creatorId, string $taskId, string $taskTitle): string
    {
        return $this->createNotification(
            $creatorId,
            'task_accepted',
            '任務申請已接受',
            "您的任務申請 '{$taskTitle}' 已被接受",
            ['task_id' => $taskId, 'task_title' => $taskTitle]
        );
    }

    public function notifyTaskRejected(string $creatorId, string $taskId, string $taskTitle, string $reason = ''): string
    {
        return $this->createNotification(
            $creatorId,
            'task_rejected',
            '任務申請被拒絕',
            "您的任務申請 '{$taskTitle}' 被拒絕" . ($reason ? ": {$reason}" : ''),
            ['task_id' => $taskId, 'task_title' => $taskTitle, 'reason' => $reason]
        );
    }

    public function notifyNewTask(string $creatorId, string $taskId, string $taskTitle): string
    {
        return $this->createNotification(
            $creatorId,
            'new_task',
            '新的任務機會',
            "有新的任務 '{$taskTitle}' 符合您的專長",
            ['task_id' => $taskId, 'task_title' => $taskTitle]
        );
    }
}
