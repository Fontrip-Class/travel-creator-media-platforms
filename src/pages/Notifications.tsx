import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Check, Trash2, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  by_type: {
    task: number;
    system: number;
    matching: number;
  };
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    by_type: { task: 0, system: 0, matching: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();
  }, []);

  const fetchNotifications = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications(page);
      
      if (response.success && response.data) {
        if (page === 1) {
          setNotifications(response.data.notifications || []);
        } else {
          setNotifications(prev => [...prev, ...(response.data.notifications || [])]);
        }
        
        setHasMore(response.data.pagination?.current_page < response.data.pagination?.total_pages);
        setCurrentPage(page);
      }
    } catch (error: any) {
      toast({
        title: "載入失敗",
        description: error.message || "無法載入通知",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await apiService.getNotificationStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
        
        // 更新統計
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
        
        toast({
          title: "已標記為已讀",
          description: "通知已標記為已讀"
        });
      }
    } catch (error: any) {
      toast({
        title: "操作失敗",
        description: error.message || "無法標記通知為已讀",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        
        setStats(prev => ({
          ...prev,
          unread: 0
        }));
        
        toast({
          title: "全部標記為已讀",
          description: "所有通知已標記為已讀"
        });
      }
    } catch (error: any) {
      toast({
        title: "操作失敗",
        description: error.message || "無法標記所有通知為已讀",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await apiService.deleteNotification(notificationId);
      if (response.success) {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // 更新統計
        setStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          unread: deletedNotification?.is_read ? prev.unread : Math.max(0, prev.unread - 1)
        }));
        
        toast({
          title: "刪除成功",
          description: "通知已刪除"
        });
      }
    } catch (error: any) {
      toast({
        title: "刪除失敗",
        description: error.message || "無法刪除通知",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.startsWith('task')) return <Bell className="h-4 w-4" />;
    if (type.startsWith('system')) return <Eye className="h-4 w-4" />;
    if (type.startsWith('matching')) return <Eye className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const getNotificationTypeLabel = (type: string) => {
    if (type.startsWith('task')) return '任務';
    if (type.startsWith('system')) return '系統';
    if (type.startsWith('matching')) return '媒合';
    return '其他';
  };

  const getNotificationTypeColor = (type: string) => {
    if (type.startsWith('task')) return 'bg-blue-100 text-blue-800';
    if (type.startsWith('system')) return 'bg-yellow-100 text-yellow-800';
    if (type.startsWith('matching')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '剛剛';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小時前`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString('zh-TW');
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="通知中心 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="查看和管理您的所有通知"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">通知中心</h1>
          <p className="text-muted-foreground">
            管理您的任務、系統和媒合相關通知
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">總通知數</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">未讀通知</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                </div>
                <EyeOff className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">任務通知</p>
                  <p className="text-2xl font-bold text-green-600">{stats.by_type.task}</p>
                </div>
                <Bell className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">系統通知</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.by_type.system}</p>
                </div>
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              全部標記為已讀
            </Button>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="space-y-4">
          {notifications.length === 0 && !isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暫無通知</h3>
                <p className="text-muted-foreground">
                  您目前沒有任何通知
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getNotificationTypeColor(notification.type)}>
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              未讀
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-900 mb-2">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          title="標記為已讀"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="刪除通知"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 載入更多 */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? "載入中..." : "載入更多"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}