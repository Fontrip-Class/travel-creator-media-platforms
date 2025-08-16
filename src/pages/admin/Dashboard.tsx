import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  total_users: number;
  total_tasks: number;
  total_revenue: number;
  system_health: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_tasks: 0,
    total_revenue: 0,
    system_health: 'healthy'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.getAdminDashboard();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error: any) {
        toast({
          title: "載入失敗",
          description: error.message || "無法載入儀表板數據",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const statCards = [
    { label: '總用戶數', value: stats.total_users, color: 'text-blue-600' },
    { label: '總任務數', value: stats.total_tasks, color: 'text-green-600' },
    { label: '總營收', value: `$${stats.total_revenue.toLocaleString()}`, color: 'text-purple-600' },
    { label: '系統狀態', value: stats.system_health === 'healthy' ? '正常' : '異常', color: stats.system_health === 'healthy' ? 'text-green-600' : 'text-red-600' }
  ];

  return (
    <div className="grid gap-6">
      <SEO title="後台總覽" description="後台關鍵數據與捷徑" />
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-semibold ${stat.color}`}>
                {isLoading ? "載入中..." : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>系統健康狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>後端API</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  stats.system_health === 'healthy' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stats.system_health === 'healthy' ? '正常' : '異常'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>資料庫</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>檔案系統</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  正常
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                <div className="font-medium">新增用戶</div>
                <div className="text-sm text-muted-foreground">創建新用戶帳戶</div>
              </button>
              <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                <div className="font-medium">審核任務</div>
                <div className="text-sm text-muted-foreground">審核待處理任務</div>
              </button>
              <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                <div className="font-medium">系統設置</div>
                <div className="text-sm text-muted-foreground">配置系統參數</div>
              </button>
              <button className="p-edit_file
