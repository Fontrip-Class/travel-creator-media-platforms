import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, RotateCcw, Pause, Play, X } from "lucide-react";

const statuses = [
  { value: "draft", label: "草稿", color: "bg-gray-500" },
  { value: "open", label: "公開招募", color: "bg-green-500" },
  { value: "review", label: "審核中", color: "bg-yellow-500" },
  { value: "doing", label: "進行中", color: "bg-blue-500" },
  { value: "done", label: "已完成", color: "bg-purple-500" },
  { value: "cancelled", label: "已取消", color: "bg-red-500" },
  { value: "paused", label: "暫停招募", color: "bg-orange-500" },
  { value: "re-recruiting", label: "重新招募", color: "bg-cyan-500" },
  { value: "expired", label: "已過期", color: "bg-gray-400" },
  { value: "rejected", label: "申請被拒", color: "bg-pink-500" },
];

const mockTasks = [
  {
    id: "1",
    title: "台東季節活動宣傳",
    status: "open",
    budget: 50000,
    applications: 8,
    deadline: "2024-02-28",
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    title: "花蓮民宿推廣",
    status: "doing",
    budget: 30000,
    applications: 3,
    deadline: "2024-03-15",
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    title: "台南美食之旅",
    status: "cancelled",
    budget: 25000,
    applications: 12,
    deadline: "2024-02-20",
    createdAt: "2024-01-10"
  }
];

export default function SupplierTaskManagement() {
  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return statuses.find(s => s.value === status)?.label || status;
  };

  const getAvailableActions = (status: string) => {
    const actions = [];
    
    switch (status) {
      case "draft":
        actions.push({ type: "publish", label: "發布", icon: Play });
        actions.push({ type: "delete", label: "刪除", icon: Trash2 });
        break;
      case "open":
        actions.push({ type: "pause", label: "暫停", icon: Pause });
        actions.push({ type: "cancel", label: "取消", icon: X });
        break;
      case "review":
        actions.push({ type: "cancel", label: "取消", icon: X });
        break;
      case "doing":
        actions.push({ type: "cancel", label: "取消", icon: X });
        break;
      case "paused":
        actions.push({ type: "resume", label: "恢復招募", icon: Play });
        actions.push({ type: "cancel", label: "取消", icon: X });
        break;
      case "cancelled":
      case "expired":
      case "rejected":
        actions.push({ type: "re-recruit", label: "重新招募", icon: RotateCcw });
        actions.push({ type: "delete", label: "刪除", icon: Trash2 });
        break;
      case "done":
        actions.push({ type: "re-recruit", label: "重新招募", icon: RotateCcw });
        break;
    }
    
    return actions;
  };

  const handleStatusChange = (taskId: string, newStatus: string, reason?: string) => {
    console.log(`Changing task ${taskId} to status ${newStatus}`, reason ? `Reason: ${reason}` : '');
    // TODO: Implement status change logic with Supabase
  };

  return (
    <div className="grid gap-6">
      <SEO title="我的委託任務管理" description="管理供應商發布的委託任務" />

      {/* 任務統計概覽 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總任務數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總申請數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
      </div>

      {/* 任務搜尋與篩選 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">任務搜尋與篩選</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="搜尋任務標題" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="狀態篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" placeholder="截止日期" />
            <Button>搜尋</Button>
          </div>
        </CardContent>
      </Card>

      {/* 任務列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">我的任務列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任務標題</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>預算</TableHead>
                  <TableHead>申請數</TableHead>
                  <TableHead>截止日期</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(task.status)} text-white`}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>NT$ {task.budget.toLocaleString()}</TableCell>
                    <TableCell>{task.applications} 個申請</TableCell>
                    <TableCell>{task.deadline}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* 動態顯示可用操作 */}
                        {getAvailableActions(task.status).map((action) => {
                          const Icon = action.icon;
                          return (
                            <AlertDialog key={action.type}>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant={action.type === 'delete' ? 'destructive' : 'outline'} 
                                  size="sm"
                                >
                                  <Icon className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>確認{action.label}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    您確定要{action.label}任務「{task.title}」嗎？
                                    {action.type === 'cancel' && '此操作會通知所有申請者任務已取消。'}
                                    {action.type === 'delete' && '此操作無法復原。'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                {(action.type === 'cancel' || action.type === 're-recruit') && (
                                  <div className="space-y-2">
                                    <Label htmlFor="reason">原因說明（選填）</Label>
                                    <Textarea id="reason" placeholder="請說明原因..." />
                                  </div>
                                )}
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => {
                                      let newStatus = task.status;
                                      switch (action.type) {
                                        case 'publish': newStatus = 'open'; break;
                                        case 'pause': newStatus = 'paused'; break;
                                        case 'cancel': newStatus = 'cancelled'; break;
                                        case 'resume': newStatus = 'open'; break;
                                        case 're-recruit': newStatus = 're-recruiting'; break;
                                        case 'delete': 
                                          console.log('Deleting task:', task.id);
                                          return;
                                      }
                                      handleStatusChange(task.id, newStatus);
                                    }}
                                  >
                                    確認{action.label}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 狀態變更歷史 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">狀態變更歷史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">台南美食之旅 - 任務已取消</div>
                <div className="text-sm text-muted-foreground">原因：預算調整，暫時取消此專案</div>
                <div className="text-xs text-muted-foreground">2024-01-25 14:30</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">台東季節活動宣傳 - 暫停招募</div>
                <div className="text-sm text-muted-foreground">原因：需要調整任務需求</div>
                <div className="text-xs text-muted-foreground">2024-01-22 09:15</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}