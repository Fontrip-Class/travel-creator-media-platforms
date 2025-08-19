import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { Task, TaskStatus } from "@/types/database";

// 模擬數據
const mockTasks: Task[] = [
  {
    id: "1",
    title: "台北101觀景台宣傳影片",
    description: "製作台北101觀景台宣傳影片，突出台北地標特色和觀景體驗",
    status: "collecting",
    budget: { min: 15000, max: 25000, type: "fixed" },
    deadline: "2024-02-15",
    location: "台北市",
    supplier: { id: "supplier1", name: "台北101", avatar: "" },
    applications: 8,
    views: 156,
    daysLeft: 12
  },
  {
    id: "2",
    title: "九份老街美食推廣",
    description: "推廣九份老街美食內容，包括圖文和短影片，突出當地特色",
    status: "in_progress",
    budget: { min: 8000, max: 12000, type: "fixed" },
    deadline: "2024-01-30",
    location: "新北市",
    supplier: { id: "supplier1", name: "台北101", avatar: "" },
    applications: 15,
    views: 234,
    daysLeft: 5
  },
  {
    id: "3",
    title: "阿里山日出攝影推廣",
    description: "推廣阿里山日出高品質攝影作品，適用於旅遊紀念品製作",
    status: "reviewing",
    budget: { min: 20000, max: 30000, type: "fixed" },
    deadline: "2024-02-20",
    location: "嘉義縣",
    supplier: { id: "supplier1", name: "台北101", avatar: "" },
    applications: 12,
    views: 189,
    daysLeft: 18
  }
];

const statusConfig = {
  draft: { label: "草稿", color: "bg-gray-500" },
  open: { label: "開放中", color: "bg-blue-500" },
  collecting: { label: "收集中", color: "bg-yellow-500" },
  evaluating: { label: "評估中", color: "bg-purple-500" },
  in_progress: { label: "進行中", color: "bg-orange-500" },
  reviewing: { label: "審核中", color: "bg-indigo-500" },
  publishing: { label: "發布中", color: "bg-pink-500" },
  completed: { label: "已完成", color: "bg-green-500" },
  cancelled: { label: "已取消", color: "bg-red-500" },
  expired: { label: "已過期", color: "bg-gray-400" }
};

const actionConfig = {
  view: { label: "查看", icon: Eye, variant: "outline" },
  edit: { label: "編輯", icon: Edit, variant: "outline" },
  delete: { label: "刪除", icon: Trash2, variant: "outline", className: "text-red-600 hover:text-red-700" }
};

export default function SupplierTaskManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesDate = !dateFilter || task.deadline === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: TaskStatus) => {
    return statusConfig[status]?.color || "bg-gray-500";
  };

  const getStatusLabel = (status: TaskStatus) => {
    return statusConfig[status]?.label || status;
  };

  const getAvailableActions = (status: TaskStatus) => {
    const actions = ["view"];
    
    if (["draft", "open", "collecting"].includes(status)) {
      actions.push("edit");
    }
    
    if (["draft"].includes(status)) {
      actions.push("delete");
    }
    
    return actions;
  };

  const getActionConfig = (actionType: string) => {
    return actionConfig[actionType as keyof typeof actionConfig];
  };

  const handleDeleteTask = (taskId: string) => {
    console.log("刪除任務:", taskId);
    // 這裡應該調用API刪除任務
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="任務管理 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="管理您的行銷任務"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">任務管理</h1>
          <p className="text-gray-600 mt-2">管理您的行銷任務和創作者合作</p>
        </div>

        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總任務數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活躍任務</CardTitle>
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

        {/* 任務篩選 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">任務篩選</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Input placeholder="搜尋任務標題" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="狀態篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" placeholder="截止日期" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              <Button>
                <Search className="h-4 w-4 mr-2" />
                搜尋
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 任務列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">任務列表</CardTitle>
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
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>NT$ {task.budget.min.toLocaleString()}</TableCell>
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
                          
                          {/* 根據狀態顯示可用操作 */}
                          {getAvailableActions(task.status).map((actionType) => {
                            const action = getActionConfig(actionType);
                            const Icon = action?.icon;
                            if (!action) return null;
                            
                            if (actionType === "delete") {
                              return (
                                <AlertDialog key={actionType}>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant={action.variant as any} 
                                      size="sm"
                                      className={action.className}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>確認刪除</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        您確定要刪除任務「{task.title}」嗎？此操作無法撤銷。
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>取消</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        刪除
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              );
                            }
                            
                            return (
                              <Button 
                                key={actionType}
                                variant={action.variant as any} 
                                size="sm"
                                className={action.className}
                              >
                                <Icon className="h-4 w-4" />
                              </Button>
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

        {/* 快速操作 */}
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate("/supplier/create-task")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            創建新任務
          </Button>
        </div>
      </div>
    </div>
  );
}
