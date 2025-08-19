<?php

namespace App\Services;

use App\Services\DatabaseService;

class AuditService
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    /**
     * 記錄審計日誌
     */
    public function log(
        string $userId,
        string $action,
        string $tableName,
        ?string $recordId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $logData = [
            'user_id' => $userId,
            'action' => $action,
            'table_name' => $tableName,
            'record_id' => $recordId,
            'old_values' => $oldValues ? json_encode($oldValues) : null,
            'new_values' => $newValues ? json_encode($newValues) : null,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent
        ];

        $this->db->insert('audit_logs', $logData);
    }

    /**
     * 記錄用戶註冊
     */
    public function logUserRegistration(string $userId, array $userData, ?string $ipAddress = null, ?string $userAgent = null): void
    {
        $this->log(
            $userId,
            'user_registered',
            'users',
            $userId,
            null,
            $userData,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄用戶登入
     */
    public function logUserLogin(string $userId, ?string $ipAddress = null, ?string $userAgent = null): void
    {
        $this->log(
            $userId,
            'user_login',
            'users',
            $userId,
            null,
            ['login_time' => date('Y-m-d H:i:s')],
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄用戶資料編輯
     */
    public function logUserEdit(
        string $userId,
        string $targetUserId,
        array $oldValues,
        array $newValues,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'user_edited',
            'users',
            $targetUserId,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄用戶停用
     */
    public function logUserSuspension(
        string $userId,
        string $targetUserId,
        array $oldValues,
        array $newValues,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'user_suspended',
            'users',
            $targetUserId,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄用戶啟用
     */
    public function logUserActivation(
        string $userId,
        string $targetUserId,
        array $oldValues,
        array $newValues,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'user_activated',
            'users',
            $targetUserId,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄用戶角色變更
     */
    public function logRoleChange(
        string $userId,
        string $targetUserId,
        array $oldValues,
        array $newValues,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'role_changed',
            'users',
            $targetUserId,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄權限變更
     */
    public function logPermissionChange(
        string $userId,
        string $targetUserId,
        array $oldValues,
        array $newValues,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'permissions_changed',
            'role_permissions',
            $targetUserId,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄任務創建
     */
    public function logTaskCreation(
        string $userId,
        string $taskId,
        array $taskData,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'task_created',
            'tasks',
            $taskId,
            null,
            $taskData,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄任務狀態變更
     */
    public function logTaskStatusChange(
        string $userId,
        string $taskId,
        array $oldValues,
        array $newValues,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'task_status_changed',
            'tasks',
            $taskId,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄任務申請
     */
    public function logTaskApplication(
        string $userId,
        string $applicationId,
        array $applicationData,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'task_applied',
            'task_applications',
            $applicationId,
            null,
            $applicationData,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄媒體素材上傳
     */
    public function logMediaUpload(
        string $userId,
        string $assetId,
        array $assetData,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'media_uploaded',
            'media_assets',
            $assetId,
            null,
            $assetData,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 記錄媒體素材審核
     */
    public function logMediaReview(
        string $userId,
        string $assetId,
        array $oldValues,
        array $newValues,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $this->log(
            $userId,
            'media_reviewed',
            'media_assets',
            $assetId,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent
        );
    }

    /**
     * 獲取用戶的審計日誌
     */
    public function getUserAuditLogs(string $userId, int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT al.*, u.username, u.email
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE al.user_id = :user_id
                ORDER BY al.created_at DESC
                LIMIT :limit OFFSET :offset";

        return $this->db->fetchAll($sql, [
            'user_id' => $userId,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * 獲取特定記錄的審計日誌
     */
    public function getRecordAuditLogs(string $tableName, string $recordId, int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT al.*, u.username, u.email
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE al.table_name = :table_name AND al.record_id = :record_id
                ORDER BY al.created_at DESC
                LIMIT :limit OFFSET :offset";

        return $this->db->fetchAll($sql, [
            'table_name' => $tableName,
            'record_id' => $recordId,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * 獲取特定操作的審計日誌
     */
    public function getActionAuditLogs(string $action, int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT al.*, u.username, u.email
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE al.action = :action
                ORDER BY al.created_at DESC
                LIMIT :limit OFFSET :offset";

        return $this->db->fetchAll($sql, [
            'action' => $action,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * 獲取所有審計日誌（管理員用）
     */
    public function getAllAuditLogs(int $limit = 100, int $offset = 0, ?string $action = null, ?string $tableName = null): array
    {
        $whereConditions = [];
        $params = ['limit' => $limit, 'offset' => $offset];

        if ($action) {
            $whereConditions[] = "al.action = :action";
            $params['action'] = $action;
        }

        if ($tableName) {
            $whereConditions[] = "al.table_name = :table_name";
            $params['table_name'] = $tableName;
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        $sql = "SELECT al.*, u.username, u.email
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                $whereClause
                ORDER BY al.created_at DESC
                LIMIT :limit OFFSET :offset";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * 獲取審計日誌統計
     */
    public function getAuditLogStats(): array
    {
        $sql = "SELECT
                    action,
                    COUNT(*) as count,
                    MIN(created_at) as first_occurrence,
                    MAX(created_at) as last_occurrence
                FROM audit_logs
                GROUP BY action
                ORDER BY count DESC";

        return $this->db->fetchAll($sql);
    }

    /**
     * 清理舊的審計日誌（保留最近90天）
     */
    public function cleanupOldLogs(int $daysToKeep = 90): int
    {
        $sql = "DELETE FROM audit_logs
                WHERE created_at < datetime('now', '-' || :days || ' days')";

        $this->db->execute($sql, ['days' => $daysToKeep]);

        return $this->db->getAffectedRows();
    }
}
