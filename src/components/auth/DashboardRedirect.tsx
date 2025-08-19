import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 智能儀表板重定向組件
 * 根據用戶角色自動導向適當的儀表板
 */
export default function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    } else if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'supplier':
        return '/supplier/dashboard';
      case 'creator':
        return '/creator/dashboard';
      case 'media':
        return '/media/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  // 顯示載入狀態
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">正在載入您的工作台...</h2>
        <p className="text-sm text-gray-600">
          {user?.role && `正在為您準備${getRoleLabel(user.role)}專屬功能`}
        </p>
      </div>
    </div>
  );
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'supplier':
      return '供應商';
    case 'creator':
      return '創作者';
    case 'media':
      return '媒體';
    case 'admin':
      return '管理員';
    default:
      return '用戶';
  }
}
