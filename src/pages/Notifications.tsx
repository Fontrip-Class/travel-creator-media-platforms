import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { Bell, Eye, EyeOff, Trash2, Check, Clock, Filter, MoreHorizontal } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationStats {
  total: number;
  unread: number;
  task: number;
  system: number;
  matching: number;
}

export default function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    task: 0,
    system: 0,
    matching: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchNotifications(1);
    fetchStats();
  }, []);

  const fetchNotifications = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await apiService.getNotifications(page);
      if (response.success) {
        if (page === 1) {
          setNotifications(response.data.notifications || []);
        } else {
          setNotifications(prev => [...prev, ...(response.data.notifications || [])]);
        }
        setHasMore(response.data.has_more || false);
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

  const fetchStats = async () => {
    try {
      const response = await apiService.getNotificationStats();
      if (response.success) {
        setStats(response.data || {
          total: 0,
          unread: 0,
          task: 0,
          system: 0,
          matching: 0
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch notification stats:", error);
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
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (error: any) {
      toast({
        title: "標記失敗",
        description: error.message || "無法標記為已讀",
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
        setStats(prev => ({ ...prev, unread: 0 }));
        toast({
          title: "標記成功",
          description: "所有通知已標記為已讀"
        });
      }
    } catch (error: any) {
      toast({
        title: "標記失敗",
        description: error.message || "無法標記所有通知",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await apiService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        );
        setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        
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

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => n.type.startsWith(filter));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="通知中心 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="管理您的所有通知"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">通知中心</h1>
          <p className="text-muted-foreground">
            管理任務、系統和媒合相關通知
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
                  <p className="text-2xl font-bold text-green-600">{stats.task}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{stats.system}</p>
                </div>
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              全部
            </Button>
            <Button
              variant={filter === "task" ? "default" : "outline"}
              onClick={() => setFilter("task")}
            >
              任務
            </Button>
            <Button
              variant={filter === "system" ? "default" : "outline"}
              onClick={() => setFilter("system")}
            >
              系統
            </Button>
            <Button
              variant={filter === "matching" ? "default" : "outline"}
              onClick={() => setFilter("matching")}
            >
              媒合
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              全部標記為已讀
            </Button>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">目前沒有通知</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={notification.is_read ? "opacity-75" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          <Badge 
                            variant="secondary" 
                            className={getNotificationTypeColor(notification.type)}
                          >
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="default" className="bg-blue-600">
                              新
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
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
