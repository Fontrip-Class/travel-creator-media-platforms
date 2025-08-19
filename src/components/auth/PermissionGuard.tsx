import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Shield } from 'lucide-react';
import React from 'react';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: 'user' | 'task' | 'business_entity' | 'media_asset' | 'admin';
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  resourceId?: string;
  fallback?: React.ReactNode;
  showError?: boolean;
}

/**
 * 權限守衛組件
 * 根據用戶權限控制組件的顯示
 */
export function PermissionGuard({
  children,
  resource,
  action,
  resourceId,
  fallback,
  showError = true
}: PermissionGuardProps) {
  const { user, isAuthenticated } = useAuth();

  // 未登入用戶
  if (!isAuthenticated || !user) {
    if (showError) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            請先登入以查看此內容
          </AlertDescription>
        </Alert>
      );
    }
    return fallback ? <>{fallback}</> : null;
  }

  // 檢查權限
  const hasPermission = checkPermission(user, resource, action, resourceId);

  if (!hasPermission) {
    if (showError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <Shield className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            您沒有權限執行此操作
          </AlertDescription>
        </Alert>
      );
    }
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * 權限檢查 Hook
 */
export function usePermission(resource: string, action: string, resourceId?: string) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  return checkPermission(user, resource, action, resourceId);
}

/**
 * 權限檢查邏輯（客戶端版本）
 */
function checkPermission(user: any, resource: string, action: string, resourceId?: string): boolean {
  // 管理員有所有權限
  if (user.role === 'admin') {
    return true;
  }

  // 停用或暫停的用戶無權限
  if (user.is_suspended || !user.is_active) {
    return false;
  }

  switch (resource) {
    case 'user':
      return checkUserPermission(user, action, resourceId);

    case 'task':
      return checkTaskPermission(user, action, resourceId);

    case 'business_entity':
      return checkBusinessEntityPermission(user, action, resourceId);

    case 'media_asset':
      return checkMediaAssetPermission(user, action, resourceId);

    case 'admin':
      return user.role === 'admin';

    default:
      return false;
  }
}

/**
 * 用戶權限檢查
 */
function checkUserPermission(user: any, action: string, resourceId?: string): boolean {
  switch (action) {
    case 'view':
    case 'edit':
      // 用戶可以查看/編輯自己的資料
      return !resourceId || resourceId === user.id || user.role === 'admin';

    case 'create':
    case 'delete':
    case 'manage':
      // 只有管理員可以創建/刪除/管理用戶
      return user.role === 'admin';

    default:
      return false;
  }
}

/**
 * 任務權限檢查
 */
function checkTaskPermission(user: any, action: string, resourceId?: string): boolean {
  switch (action) {
    case 'view':
      // 所有用戶都可以查看公開任務
      return true;

    case 'create':
      // 供應商和管理員可以創建任務
      return user.role === 'supplier' || user.role === 'admin';

    case 'edit':
    case 'delete':
      // 需要檢查是否是任務擁有者（這裡簡化處理）
      return user.role === 'supplier' || user.role === 'admin';

    case 'apply':
      // 創作者可以申請任務
      return user.role === 'creator';

    case 'manage':
      // 只有管理員可以管理所有任務
      return user.role === 'admin';

    default:
      return false;
  }
}

/**
 * 業務實體權限檢查
 */
function checkBusinessEntityPermission(user: any, action: string, resourceId?: string): boolean {
  switch (action) {
    case 'view':
      // 所有用戶都可以查看公開業務實體
      return true;

    case 'create':
      // 所有註冊用戶都可以創建業務實體
      return true;

    case 'edit':
    case 'delete':
      // 需要檢查是否是業務實體管理者（這裡簡化處理）
      return user.role === 'admin';

    case 'manage':
      // 只有管理員可以管理所有業務實體
      return user.role === 'admin';

    default:
      return false;
  }
}

/**
 * 媒體資源權限檢查
 */
function checkMediaAssetPermission(user: any, action: string, resourceId?: string): boolean {
  switch (action) {
    case 'view':
      // 根據資源可見性（這裡簡化處理）
      return true;

    case 'create':
      // 創作者和媒體用戶可以創建媒體資源
      return user.role === 'creator' || user.role === 'media' || user.role === 'admin';

    case 'edit':
    case 'delete':
      // 需要檢查是否是資源擁有者（這裡簡化處理）
      return user.role === 'creator' || user.role === 'media' || user.role === 'admin';

    case 'publish':
      // 媒體用戶可以發布內容
      return user.role === 'media' || user.role === 'admin';

    case 'manage':
      // 只有管理員可以管理所有媒體資源
      return user.role === 'admin';

    default:
      return false;
  }
}
