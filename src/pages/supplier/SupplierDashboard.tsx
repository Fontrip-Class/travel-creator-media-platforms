import { SEO } from "@/components/SEO";
import WelcomeBanner from "@/components/layout/WelcomeBanner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTaskManagement } from "@/hooks/use-user-task-management";
import { DashboardStats, Notification, Task, TaskStatus } from "@/types/database";
import {
    BarChart3,
    Bell,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    Eye,
    FileText,
    Filter,
    Gift,
    MapPin,
    Plus,
    RefreshCw,
    Search,
    Settings,
    Trash2,
    TrendingUp,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 模擬數據
const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "台北101觀景台宣傳影片",
    description: "製作台北101觀景台宣傳影片，突出台北地標特色和觀景體驗",
    business_entity_id: "supplier1",
    status: "collecting",
    content_types: ["video", "photo"],
    requirements: "需要高品質的影片和照片，突出觀景台的視野和體驗",
    deliverables: ["宣傳影片", "宣傳照片", "社群媒體素材"],
    budget: { min: 15000, max: 25000, type: "fixed", rewardType: "per_project" },
    reward_type: "money",
    gift_details: "",
    deadline: "2024-02-15",
    location: { lat: 25.0330, lng: 121.5654 },
    applications_count: 8,
    views_count: 156,
    progress: {
      current_step: "collecting",
      completion_percentage: 25,
      estimated_completion: "2024-02-15"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z"
  },
  {
    id: "2",
    title: "九份老街美食推廣",
    description: "推廣九份老街美食內容，包括圖文和短影片，突出當地特色",
    business_entity_id: "supplier1",
    status: "in_progress",
    content_types: ["article", "video", "photo"],
    requirements: "需要圖文並茂的美食介紹和短影片",
    deliverables: ["美食指南文章", "美食短影片", "美食照片集"],
    budget: { min: 8000, max: 12000, type: "fixed", rewardType: "per_project" },
    reward_type: "gift",
    gift_details: "提供九份老街美食體驗券，包含知名店家品嚐券和紀念品",
    deadline: "2024-01-30",
    location: { lat: 25.1092, lng: 121.8444 },
    applications_count: 15,
    views_count: 234,
    progress: {
      current_step: "in_progress",
      completion_percentage: 50,
      estimated_completion: "2024-01-30"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z"
  },
  {
    id: "3",
    title: "阿里山日出攝影推廣",
    description: "推廣阿里山日出高品質攝影作品，適用於旅遊紀念品製作",
    business_entity_id: "supplier1",
    status: "reviewing",
    content_types: ["photo", "article"],
    requirements: "需要高品質的日出攝影作品和相關文章",
    deliverables: ["日出攝影集", "旅遊文章", "紀念品設計素材"],
    budget: { min: 20000, max: 30000, type: "fixed", rewardType: "per_project" },
    reward_type: "experience",
    gift_details: "提供阿里山住宿體驗，包含日出觀景台導覽和攝影指導",
    deadline: "2024-02-20",
    location: { lat: 23.5100, lng: 120.8000 },
    applications_count: 12,
    views_count: 189,
    progress: {
      current_step: "reviewing",
      completion_percentage: 62.5,
      estimated_completion: "2024-02-20"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z"
  }
];

const MOCK_STATS: DashboardStats = {
  totalTasks: 15,
  activeTasks: 8,
  completedTasks: 6,
  totalBudget: 450000,
  totalApplications: 89,
  avgCompletionTime: 18,
  satisfactionRate: 4.6
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    user_id: "supplier1",
    title: "新任務申請",
    message: "您的任務「台北101觀景台宣傳影片」收到了新的申請",
    type: "task_application",
    is_read: false,
    created_at: "2024-01-18T10:30:00Z"
  },
  {
    id: "2",
    user_id: "supplier1",
    title: "任務進度更新",
    message: "任務「九份老街美食推廣」已進入審核階段",
    type: "task_update",
    is_read: false,
    created_at: "2024-01-18T09:15:00Z"
  },
  {
    id: "3",
    user_id: "supplier1",
    title: "系統提醒",
    message: "您有3個任務即將到期，請及時處理",
    type: "reminder",
    is_read: true,
    created_at: "2024-01-18T08:00:00Z"
  }
];

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // 使用統一的用戶任務管理 Hook
  const {
    isLoading,
    error,
    dashboardStats,
    tasks,
    notifications,
    loadDashboardData,
    loadTasks,
    updateTaskStatus
  } = useUserTaskManagement();

  // 本地狀態
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // 刪除確認對話框狀態
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    taskId: string | null;
    taskTitle: string;
  }>({
    isOpen: false,
    taskId: null,
    taskTitle: ""
  });

  // 檢查用戶權限
  const canManageTask = (task: Task) => {
    if (!user) return false;
    // 檢查用戶是否有權限管理此任務
    return user.business_entity_id === task.business_entity_id || user.role === 'admin';
  };

  // 錯誤顯示
  useEffect(() => {
    if (error) {
      toast({
        title: "載入錯誤",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // 任務操作函數
  const handleViewTask = (taskId: string) => {
    navigate(`/supplier/tasks/${taskId}`);
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/supplier/edit-task/${taskId}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // 這裡會調用真實的 API
      // const response = await apiService.deleteTask(taskId);

      // 重新載入任務列表
      await loadTasks();

      toast({
        title: "任務刪除成功",
        description: "任務已成功刪除",
      });

      // 關閉對話框
      setDeleteDialog({
        isOpen: false,
        taskId: null,
        taskTitle: ""
      });
    } catch (error) {
      console.error('刪除任務失敗:', error);
      toast({
        title: "刪除失敗",
        description: "無法刪除任務，請稍後再試",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (taskId: string, taskTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      taskId,
      taskTitle
    });
  };

  // 任務篩選邏輯（使用來自 Hook 的真實數據）
  const currentTasks = tasks.length > 0 ? tasks : MOCK_TASKS;
  const filteredTasks = selectedStage === "all"
    ? currentTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentTasks.filter(task =>
        task.status === selectedStage && (
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  const getStageStats = () => {
    const stats = {
      collecting: 0,
      evaluating: 0,
      in_progress: 0,
      reviewing: 0,
      publishing: 0,
      completed: 0
    };

    currentTasks.forEach(task => {
      if (stats.hasOwnProperty(task.status)) {
        stats[task.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "open": return "bg-blue-500";
      case "collecting": return "bg-yellow-500";
      case "evaluating": return "bg-purple-500";
      case "in_progress": return "bg-orange-500";
      case "reviewing": return "bg-indigo-500";
      case "publishing": return "bg-pink-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      case "expired": return "bg-gray-400";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case "draft": return "草稿";
      case "open": return "開放中";
      case "collecting": return "收集中";
      case "evaluating": return "評估中";
      case "in_progress": return "進行中";
      case "reviewing": return "審核中";
      case "publishing": return "發布中";
      case "completed": return "已完成";
      case "cancelled": return "已取消";
      case "expired": return "已過期";
      default: return status;
    }
  };

  const getRewardTypeIcon = (rewardType: string) => {
    switch (rewardType) {
      case "money": return <DollarSign className="h-4 w-4 text-green-600" />;
      case "gift": return <Gift className="h-4 w-4 text-blue-600" />;
      case "experience": return <MapPin className="h-4 w-4 text-purple-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getRewardTypeText = (rewardType: string) => {
    switch (rewardType) {
      case "money": return "金錢報酬";
      case "gift": return "贈品報酬";
      case "experience": return "體驗報酬";
      default: return rewardType;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // 調用API標記通知為已讀
      // await apiService.markNotificationAsRead(notificationId);
      
      // 重新載入儀表板數據
      await loadDashboardData();
      
      toast({
        title: "通知已標記為已讀",
        description: "通知狀態已更新",
      });
    } catch (error) {
      toast({
        title: "操作失敗",
        description: "無法標記通知為已讀",
        variant: "destructive"
      });
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  // 如果用戶未登入，顯示載入狀態
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在驗證身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="供應商儀表板 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="管理您的行銷任務和創作者合作"
      />

      <div className="container mx-auto px-4 py-6">
        <WelcomeBanner />
        {/* 頁面標題和操作欄 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">供應商儀表板</h1>
            <p className="text-gray-600 mt-2">
              歡迎回來，{user?.username || '用戶'}！管理您的行銷任務和創作者合作
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              通知
              {unreadNotificationsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadNotificationsCount}
                </Badge>
              )}
            </Button>

            <Button onClick={() => navigate("/supplier/create-task")}>
              <Plus className="h-4 w-4 mr-2" />
              創建新任務
            </Button>
          </div>
        </div>

        {/* 通知面板 */}
        {showNotifications && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                最新通知
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        標記已讀
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總任務數</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats?.basic?.total_tasks ?? MOCK_STATS.totalTasks}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">較上月 +2</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活躍任務</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats?.basic?.active_tasks ?? MOCK_STATS.activeTasks}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">進行中</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總預算</p>
                  <p className="text-2xl font-bold text-gray-900">
                    NT$ {(dashboardStats?.basic?.total_budget_spent ?? MOCK_STATS.totalBudget).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">已分配</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均完成天數</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.basic?.avg_completion_days ?? MOCK_STATS.avgCompletionTime}
                    </p>
                    <span className="text-sm text-gray-500">天</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">平均週期</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 任務管理 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">任務管理</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋任務..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                篩選
              </Button>
            </div>
          </div>

          <Tabs value={selectedStage} onValueChange={setSelectedStage}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">全部 ({currentTasks.length})</TabsTrigger>
              <TabsTrigger value="collecting">收集中 ({getStageStats().collecting})</TabsTrigger>
              <TabsTrigger value="evaluating">評估中 ({getStageStats().evaluating})</TabsTrigger>
              <TabsTrigger value="in_progress">進行中 ({getStageStats().in_progress})</TabsTrigger>
              <TabsTrigger value="reviewing">審核中 ({getStageStats().reviewing})</TabsTrigger>
              <TabsTrigger value="publishing">發布中 ({getStageStats().publishing})</TabsTrigger>
              <TabsTrigger value="completed">已完成 ({getStageStats().completed})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStage} className="mt-6">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到任務</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? `沒有符合「${searchTerm}」的任務` : '目前沒有任務'}
                    </p>
                    <Button onClick={() => navigate("/supplier/create-task")}>
                      <Plus className="h-4 w-4 mr-2" />
                      創建第一個任務
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                              <Badge className={getStatusColor(task.status)}>
                                {getStatusText(task.status)}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getRewardTypeIcon(task.reward_type)}
                                <span className="text-sm text-gray-600">
                                  {getRewardTypeText(task.reward_type)}
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-600 mb-4">{task.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>截止：{task.deadline}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span>
                                  {task.reward_type === 'money'
                                    ? `預算：NT$ ${task.budget.min.toLocaleString()}`
                                    : '非金錢報酬'
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>申請：{task.applications_count}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>瀏覽：{task.views_count}</span>
                              </div>
                            </div>

                            {/* 進度條 */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>進度</span>
                                <span>{task.progress.completion_percentage}%</span>
                              </div>
                              <Progress value={task.progress.completion_percentage} className="h-2" />
                            </div>

                            {/* 統計資訊 */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>瀏覽：{task.views_count}</span>
                              <span>申請：{task.applications_count}</span>
                              <span>狀態：{getStatusText(task.status)}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTask(task.id)}
                              className="hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              查看
                            </Button>

                            {canManageTask(task) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTask(task.id)}
                                  className="hover:bg-green-50 hover:text-green-700"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  編輯
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(task.id, task.title)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  刪除
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 快速操作 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate("/supplier/create-task")}
            >
              <Plus className="h-6 w-6" />
              <span>創建新任務</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate("/supplier/tasks")}
            >
              <FileText className="h-6 w-6" />
              <span>查看所有任務</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate("/supplier/analytics")}
            >
              <BarChart3 className="h-6 w-6" />
              <span>數據分析</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate("/supplier/settings")}
            >
              <Settings className="h-6 w-6" />
              <span>設定</span>
            </Button>
          </div>
        </div>

        {/* 最近活動 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">最近活動</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">任務「台北101觀景台宣傳影片」收到新申請</span>
                  <span className="text-xs text-gray-400 ml-auto">2小時前</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">任務「九份老街美食推廣」進入審核階段</span>
                  <span className="text-xs text-gray-400 ml-auto">4小時前</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">新任務「阿里山日出攝影推廣」已發布</span>
                  <span className="text-xs text-gray-400 ml-auto">6小時前</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除任務</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除任務「{deleteDialog.taskTitle}」嗎？此操作無法撤銷，所有相關的申請和資料都將被永久刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.taskId && handleDeleteTask(deleteDialog.taskId)}
              className="bg-red-600 hover:bg-red-700"
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
