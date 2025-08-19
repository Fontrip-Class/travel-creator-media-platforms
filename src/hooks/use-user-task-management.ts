import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/lib/api';
import type { Task, TaskApplication } from '@/types/database';
import { useCallback, useEffect, useState } from 'react';

/**
 * 統一的用戶任務管理 Hook
 * 根據用戶角色提供不同的任務管理功能
 */
export function useUserTaskManagement() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // 基本狀態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 數據狀態
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  /**
   * 根據用戶角色載入儀表板數據
   */
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let dashboardData;

      switch (user.role) {
        case 'supplier':
          dashboardData = await apiService.getSupplierDashboard();
          break;
        case 'creator':
          dashboardData = await apiService.getCreatorDashboard();
          break;
        case 'media':
          dashboardData = await apiService.getMediaDashboard();
          break;
        case 'admin':
          dashboardData = await apiService.getAdminDashboard();
          break;
        default:
          throw new Error('未知的用戶角色');
      }

      if (dashboardData.success) {
        setDashboardStats(dashboardData.data);
      } else {
        throw new Error(dashboardData.message || '載入儀表板數據失敗');
      }

    } catch (err: any) {
      console.warn('API調用失敗，使用模擬數據:', err);
      setError(err.message);

      // 使用模擬數據作為後備
      setDashboardStats(getMockDashboardData(user.role));

    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  /**
   * 根據用戶角色載入任務數據
   */
  const loadTasks = useCallback(async (filters?: any) => {
    if (!isAuthenticated || !user) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let tasksData;

      switch (user.role) {
        case 'supplier':
          tasksData = await apiService.getSupplierTasks(filters);
          break;
        case 'creator':
          tasksData = await apiService.getCreatorTasks(filters);
          break;
        case 'media':
          tasksData = await apiService.getMediaAssets(filters);
          break;
        case 'admin':
          tasksData = await apiService.getAdminTasks(filters);
          break;
        default:
          throw new Error('未知的用戶角色');
      }

      if (tasksData.success) {
        setTasks(tasksData.data || []);
      } else {
        throw new Error(tasksData.message || '載入任務數據失敗');
      }

    } catch (err: any) {
      console.warn('API調用失敗，使用模擬數據:', err);
      setError(err.message);
      setTasks(getMockTaskData(user.role));

    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * 創建任務（供應商專用）
   */
  const createTask = useCallback(async (taskData: Partial<Task>) => {
    if (!user || user.role !== 'supplier') {
      toast({
        title: '權限不足',
        description: '只有供應商可以創建任務',
        variant: 'destructive'
      });
      return false;
    }

    try {
      setIsLoading(true);
      const response = await apiService.createTask(taskData);

      if (response.success) {
        toast({
          title: '創建成功',
          description: '任務已成功創建'
        });

        // 重新載入任務列表
        await loadTasks();
        return true;
      } else {
        throw new Error(response.message || '創建任務失敗');
      }

    } catch (err: any) {
      toast({
        title: '創建失敗',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, loadTasks]);

  /**
   * 申請任務（創作者專用）
   */
  const applyForTask = useCallback(async (taskId: string, applicationData: Partial<TaskApplication>) => {
    if (!user || user.role !== 'creator') {
      toast({
        title: '權限不足',
        description: '只有創作者可以申請任務',
        variant: 'destructive'
      });
      return false;
    }

    try {
      setIsLoading(true);
      const response = await apiService.applyForTask(taskId, applicationData);

      if (response.success) {
        toast({
          title: '申請成功',
          description: '任務申請已提交'
        });

        // 重新載入相關數據
        await loadTasks();
        await loadDashboardData();
        return true;
      } else {
        throw new Error(response.message || '申請任務失敗');
      }

    } catch (err: any) {
      toast({
        title: '申請失敗',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, loadTasks, loadDashboardData]);

  /**
   * 更新任務狀態
   */
  const updateTaskStatus = useCallback(async (taskId: string, status: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.updateTask(taskId, { status });

      if (response.success) {
        toast({
          title: '更新成功',
          description: '任務狀態已更新'
        });

        // 重新載入數據
        await loadTasks();
        await loadDashboardData();
        return true;
      } else {
        throw new Error(response.message || '更新任務狀態失敗');
      }

    } catch (err: any) {
      toast({
        title: '更新失敗',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadTasks, loadDashboardData]);

  // 初始化數據載入
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
      loadTasks();
    }
  }, [isAuthenticated, user, loadDashboardData, loadTasks]);

  return {
    // 狀態
    isLoading,
    error,
    dashboardStats,
    tasks,
    applications,
    notifications,

    // 方法
    loadDashboardData,
    loadTasks,
    createTask,
    applyForTask,
    updateTaskStatus,

    // 用戶資訊
    user,
    isAuthenticated
  };
}

/**
 * 獲取模擬儀表板數據
 */
function getMockDashboardData(role: string): any {
  const baseData = {
    timestamp: new Date().toISOString(),
    role: role
  };

  switch (role) {
    case 'supplier':
      return {
        ...baseData,
        basic: {
          total_tasks: 15,
          active_tasks: 8,
          completed_tasks: 6,
          total_budget_spent: 450000,
          avg_completion_days: 18
        },
        recent_applications: []
      };

    case 'creator':
      return {
        ...baseData,
        applications: {
          total_applications: 12,
          accepted_applications: 5,
          pending_applications: 3,
          avg_proposed_budget: 15000
        },
        available_tasks_count: 25,
        recent_tasks: []
      };

    case 'media':
      return {
        ...baseData,
        assets: {
          tasks_with_assets: 8,
          total_assets: 45,
          approved_assets: 38,
          avg_file_size: 2048000
        },
        recent_assets: []
      };

    case 'admin':
      return {
        ...baseData,
        tasks: {
          total_tasks: 156,
          active_tasks: 89,
          completed_tasks: 67,
          cancelled_tasks: 12,
          total_budget: 2500000,
          avg_completion_days: 15
        },
        users: {
          total_users: 234,
          suppliers: 45,
          creators: 156,
          media_users: 33
        }
      };

    default:
      return baseData;
  }
}

/**
 * 獲取模擬任務數據
 */
function getMockTaskData(role: string): Task[] {
  // 這裡可以根據角色返回不同的模擬數據
  return [];
}
