import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  CheckCircle2, 
  Calendar, 
  User, 
  Star, 
  AlertTriangle,
  MessageSquare,
  Settings
} from "lucide-react";

interface Notification {
  id: string;
  type: "task" | "application" | "message" | "rating" | "system";
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  isImportant?: boolean;
  actionUrl?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "task",
      title: "新任務媒合通知",
      content: "有一個符合您專長的新任務「台東季節活動宣傳」，快來查看詳情！",
      time: "2小時前",
      isRead: false,
      isImportant: true,
      actionUrl: "/tasks/1"
    },
    {
      id: "2",
      type: "application",
      title: "申請狀態更新",
      content: "您申請的「花蓮海岸風景攝影」任務已被接受，請準備開始執行。",
      time: "5小時前",
      isRead: false,
      actionUrl: "/dashboard/tasks"
    },
    {
      id: "3",
      type: "message",
      title: "新訊息",
      content: "台東縣政府觀光處向您發送了任務相關訊息。",
      time: "1天前",
      isRead: true,
      actionUrl: "/messages/3"
    },
    {
      id: "4",
      type: "rating",
      title: "收到新評價",
      content: "您的合作夥伴對「南投山區美食探索」任務給了您5星評價！",
      time: "2天前",
      isRead: true,
      actionUrl: "/profile/ratings"
    },
    {
      id: "5",
      type: "system",
      title: "系統維護通知",
      content: "平台將於本週日凌晨2:00-4:00進行系統維護，期間服務可能暫時中斷。",
      time: "3天前",
      isRead: true,
      isImportant: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task": return <Calendar className="w-4 h-4" />;
      case "application": return <CheckCircle2 className="w-4 h-4" />;
      case "message": return <MessageSquare className="w-4 h-4" />;
      case "rating": return <Star className="w-4 h-4" />;
      case "system": return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task": return "text-blue-600";
      case "application": return "text-green-600";
      case "message": return "text-purple-600";
      case "rating": return "text-yellow-600";
      case "system": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div 
      className={`p-4 border rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
        !notification.isRead ? "bg-blue-50 border-blue-200" : ""
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
              {notification.title}
            </h4>
            {notification.isImportant && (
              <Badge variant="destructive" className="text-xs">重要</Badge>
            )}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          <p className={`text-sm mb-2 ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
            {notification.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{notification.time}</span>
            {notification.actionUrl && (
              <Button size="sm" variant="outline">查看詳情</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO 
        title="通知中心"
        description="查看所有通知訊息"
      />

      <div className="space-y-6">
        {/* 標題與操作 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h1 className="text-2xl font-bold">通知中心</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} 則未讀</Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              通知設定
            </Button>
            {unreadCount > 0 && (
              <Button size="sm" onClick={markAllAsRead}>
                <Mail className="w-4 h-4 mr-2" />
                全部標為已讀
              </Button>
            )}
          </div>
        </div>

        {/* 通知列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">訊息列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  全部 ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  未讀 ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  已讀 ({readNotifications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    目前沒有通知訊息
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="space-y-4 mt-6">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    沒有未讀通知
                  </div>
                )}
              </TabsContent>

              <TabsContent value="read" className="space-y-4 mt-6">
                {readNotifications.length > 0 ? (
                  readNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    沒有已讀通知
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 通知設定說明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">通知設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">任務相關通知</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 新任務媒合推薦</li>
                  <li>• 申請狀態更新</li>
                  <li>• 任務進度提醒</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">互動通知</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 新訊息提醒</li>
                  <li>• 評價與評分</li>
                  <li>• 系統公告</li>
                </ul>
              </div>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              您可以在設定中調整各類通知的接收偏好，包括郵件通知和推送通知。
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}