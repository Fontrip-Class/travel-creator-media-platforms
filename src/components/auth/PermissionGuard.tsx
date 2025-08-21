import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface PermissionGuardProps {
  requiredRole: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * 權限控制組件
 * 根據用戶角色控制內容的顯示
 */
export default function PermissionGuard({
  requiredRole,
  children,
  fallback = null,
  showFallback = false
}: PermissionGuardProps) {
  const { user, isAuthenticated } = useAuth();

  // 檢查用戶是否已登入
  if (!isAuthenticated || !user) {
    return showFallback ? fallback : null;
  }

  // 檢查用戶是否有權限
  const hasPermission = () => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role || '');
    }
    return user.role === requiredRole;
  };

  // 如果有權限，顯示內容
  if (hasPermission()) {
    return <>{children}</>;
  }

  // 如果沒有權限，顯示fallback或隱藏
  return showFallback ? fallback : null;
}

/**
 * 檢查用戶是否有特定權限的Hook
 */
export function usePermission() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (requiredRole: string | string[]) => {
    if (!isAuthenticated || !user) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role || '');
    }
    return user.role === requiredRole;
  };

  const isAdmin = () => hasRole('admin');
  const isSupplier = () => hasRole('supplier');
  const isCreator = () => hasRole('creator');
  const isMedia = () => hasRole('media');

  return {
    hasRole,
    isAdmin,
    isSupplier,
    isCreator,
    isMedia,
    user,
    isAuthenticated
  };
}
