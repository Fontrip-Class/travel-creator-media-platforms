<?php

namespace App\Controllers;

use App\Services\ApiResponseService;
use App\Services\AuditService;
use App\Services\PermissionService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuditController
{
    private ApiResponseService $apiResponse;
    private AuditService $auditService;
    private PermissionService $permissionService;

    public function __construct(
        ApiResponseService $apiResponse,
        AuditService $auditService,
        PermissionService $permissionService
    ) {
        $this->apiResponse = $apiResponse;
        $this->auditService = $auditService;
        $this->permissionService = $permissionService;
    }

    /**
     * 獲取用戶的審計日誌
     */
    public function getUserAuditLogs(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');
            $targetUserId = $args['id'] ?? $currentUserId;

            // 檢查權限
            if ($targetUserId !== $currentUserId && !$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看此用戶的審計日誌');
            }

            // 獲取查詢參數
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 50);
            $offset = (int) ($queryParams['offset'] ?? 0);

            // 限制查詢範圍
            $limit = min(max($limit, 1), 100);
            $offset = max($offset, 0);

            $logs = $this->auditService->getUserAuditLogs($targetUserId, $limit, $offset);

            return $this->apiResponse->success($response, $logs, '用戶審計日誌獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取特定記錄的審計日誌
     */
    public function getRecordAuditLogs(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看審計日誌');
            }

            $tableName = $args['table'];
            $recordId = $args['id'];

            if (empty($tableName) || empty($recordId)) {
                return $this->apiResponse->badRequest($response, '請提供表名和記錄ID');
            }

            // 獲取查詢參數
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 50);
            $offset = (int) ($queryParams['offset'] ?? 0);

            // 限制查詢範圍
            $limit = min(max($limit, 1), 100);
            $offset = max($offset, 0);

            $logs = $this->auditService->getRecordAuditLogs($tableName, $recordId, $limit, $offset);

            return $this->apiResponse->success($response, $logs, '記錄審計日誌獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取特定操作的審計日誌
     */
    public function getActionAuditLogs(Request $request, Response $response, array $args): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看審計日誌');
            }

            $action = $args['action'];

            if (empty($action)) {
                return $this->apiResponse->badRequest($response, '請提供操作類型');
            }

            // 獲取查詢參數
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 50);
            $offset = (int) ($queryParams['offset'] ?? 0);

            // 限制查詢範圍
            $limit = min(max($limit, 1), 100);
            $offset = max($offset, 0);

            $logs = $this->auditService->getActionAuditLogs($action, $limit, $offset);

            return $this->apiResponse->success($response, $logs, '操作審計日誌獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取所有審計日誌（管理員用）
     */
    public function getAllAuditLogs(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看所有審計日誌');
            }

            // 獲取查詢參數
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 100);
            $offset = (int) ($queryParams['offset'] ?? 0);
            $action = $queryParams['action'] ?? null;
            $tableName = $queryParams['table'] ?? null;

            // 限制查詢範圍
            $limit = min(max($limit, 1), 200);
            $offset = max($offset, 0);

            $logs = $this->auditService->getAllAuditLogs($limit, $offset, $action, $tableName);

            return $this->apiResponse->success($response, $logs, '所有審計日誌獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 獲取審計日誌統計
     */
    public function getAuditLogStats(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看審計日誌統計');
            }

            $stats = $this->auditService->getAuditLogStats();

            return $this->apiResponse->success($response, $stats, '審計日誌統計獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 清理舊的審計日誌
     */
    public function cleanupOldLogs(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->isAdmin($currentUserId)) {
                return $this->apiResponse->forbidden($response, '只有管理員可以清理審計日誌');
            }

            $data = $request->getParsedBody();
            $daysToKeep = (int) ($data['days_to_keep'] ?? 90);

            // 限制清理範圍
            $daysToKeep = max(min($daysToKeep, 365), 30);

            $deletedCount = $this->auditService->cleanupOldLogs($daysToKeep);

            return $this->apiResponse->success($response, [
                'deleted_count' => $deletedCount,
                'days_kept' => $daysToKeep
            ], "已清理 $deletedCount 條舊的審計日誌");

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 導出審計日誌（CSV格式）
     */
    public function exportAuditLogs(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限導出審計日誌');
            }

            // 獲取查詢參數
            $queryParams = $request->getQueryParams();
            $action = $queryParams['action'] ?? null;
            $tableName = $queryParams['table'] ?? null;
            $startDate = $queryParams['start_date'] ?? null;
            $endDate = $queryParams['end_date'] ?? null;

            // 獲取日誌數據
            $logs = $this->auditService->getAllAuditLogs(10000, 0, $action, $tableName);

            // 過濾日期範圍
            if ($startDate || $endDate) {
                $logs = array_filter($logs, function($log) use ($startDate, $endDate) {
                    $logDate = $log['created_at'];
                    if ($startDate && $logDate < $startDate) return false;
                    if ($endDate && $logDate > $endDate) return false;
                    return true;
                });
            }

            // 生成CSV內容
            $csvContent = $this->generateCsvContent($logs);

            // 設置響應頭
            $response = $response
                ->withHeader('Content-Type', 'text/csv; charset=UTF-8')
                ->withHeader('Content-Disposition', 'attachment; filename="audit_logs_' . date('Y-m-d') . '.csv"');

            $response->getBody()->write($csvContent);

            return $response;

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }

    /**
     * 生成CSV內容
     */
    private function generateCsvContent(array $logs): string
    {
        if (empty($logs)) {
            return "操作時間,用戶ID,用戶名,操作,表名,記錄ID,舊值,新值,IP地址,User-Agent\n";
        }

        $csv = "操作時間,用戶ID,用戶名,操作,表名,記錄ID,舊值,新值,IP地址,User-Agent\n";

        foreach ($logs as $log) {
            $row = [
                $log['created_at'] ?? '',
                $log['user_id'] ?? '',
                $log['username'] ?? '',
                $log['action'] ?? '',
                $log['table_name'] ?? '',
                $log['record_id'] ?? '',
                $log['old_values'] ?? '',
                $log['new_values'] ?? '',
                $log['ip_address'] ?? '',
                $log['user_agent'] ?? ''
            ];

            // 轉義CSV特殊字符
            $row = array_map(function($field) {
                if (strpos($field, ',') !== false || strpos($field, '"') !== false || strpos($field, "\n") !== false) {
                    $field = '"' . str_replace('"', '""', $field) . '"';
                }
                return $field;
            }, $row);

            $csv .= implode(',', $row) . "\n";
        }

        return $csv;
    }

    /**
     * 獲取審計日誌搜索建議
     */
    public function getAuditLogSuggestions(Request $request, Response $response): Response
    {
        try {
            $currentUserId = $request->getAttribute('user_id');

            // 檢查權限
            if (!$this->permissionService->canViewAuditLogs($currentUserId)) {
                return $this->apiResponse->forbidden($response, '您沒有權限查看審計日誌建議');
            }

            $queryParams = $request->getQueryParams();
            $type = $queryParams['type'] ?? 'action';

            $suggestions = [];

            switch ($type) {
                case 'action':
                    $suggestions = [
                        'user_registered', 'user_login', 'user_edited', 'user_suspended',
                        'user_activated', 'role_changed', 'permissions_changed',
                        'task_created', 'task_status_changed', 'task_applied',
                        'media_uploaded', 'media_reviewed'
                    ];
                    break;
                
                case 'table':
                    $suggestions = [
                        'users', 'supplier_profiles', 'creator_profiles', 'media_profiles',
                        'tasks', 'task_applications', 'media_assets', 'audit_logs'
                    ];
                    break;
                
                default:
                    $suggestions = [];
            }

            return $this->apiResponse->success($response, $suggestions, '審計日誌建議獲取成功');

        } catch (\Exception $e) {
            return $this->apiResponse->error($response, $e->getMessage());
        }
    }
}
