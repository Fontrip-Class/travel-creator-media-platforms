import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  RefreshCw,
  MoreHorizontal,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Task, TaskStatus } from "@/types/database";
import apiService from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// 任務狀態配置
const taskStatuses: { value: TaskStatus; label: string; color: string; description: string }[] = [
  { value: "draft", label: "草稿", color: "bg-gray-500", description: "任務草稿狀態" },
  { value: "open", label: "開放申請", color: "bg-blue-500", description: "接受創作者申請" },
  { value: "collecting", label: "收集中", color: "bg-yellow-500", description: "收集創作者提案" },
  { value: "evaluating", label: "評估中", color: "bg-orange-500", description: "評估創作者提案" },
  { value: "in_progress", label: "進行中", color: "bg-green-500", description: "任務執行中" },
  { value: "reviewing", label: "審核中", color: "bg-purple-500", description: "內容審核中" },
  { value: "publishing", label: "發布中", color: "bg-indigo-500", description: "內容發布中" },
  { value: "completed", label: "已完成", color: "bg-green-600", description: "任務已完成" },
  { value: "cancelled", label: "已取消", color: "bg-red-500", description: "任務已取消" },
  { value: "expired", label: "已過期", color: "bg-gray-400", description: "任務已過期" },
];

// 內容類型選項
const contentTypes = [
  { value: "article", label: "文章" },
  { value: "video", label: "影片" },
  { value: "photo", label: "照片" },
  { value: "live", label: "直播" },
  { value: "podcast", label: "播客" },
];

// 預算類型選項
const budgetTypes = [
  { value: "fixed", label: "固定預算" },
  { value: "range", label: "預算範圍" },
  { value: "negotiable", label: "可議價" },
];

export default function TasksAdmin() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 搜尋和篩選狀態
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // 表單資料
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    content_types: [],
    requirements: "",
    deliverables: [],
    budget: {
      min: 0,
      max: 0,
      type: "fixed",
      rewardType: "one-time"
    },
    deadline: "",
    status: "draft"
  });
  
  // 當前操作的任務
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const { toast } = useToast();

  // 載入任務資料
  useEffect(() => {
    loadTasks();
  }, []);

  // 篩選任務
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (contentTypeFilter) {
      filtered = filtered.filter((task) =>
        task.content_types.includes(contentTypeFilter)
      );
    }

    if (dateRangeFilter) {
      const today = new Date();
      const filterDate = new Date(dateRangeFilter);
      
      switch (dateRangeFilter) {
        case "today":
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.deadline);
            return taskDate.toDateString() === today.toDateString();
          });
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.deadline);
            return taskDate >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.deadline);
            return taskDate >= monthAgo;
          });
          break;
      }
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, contentTypeFilter, dateRangeFilter]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAdminTasks();
      if (response.success) {
        setTasks(response.data || []);
      } else {
        setError(response.message || "載入任務失敗");
      }
    } catch (err) {
      setError("載入任務時發生錯誤");
      console.error("載入任務失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await apiService.createTask(formData);
      if (response.success) {
        toast({
          title: "成功",
          description: "任務創建成功",
        });
        setCreateDialogOpen(false);
        resetForm();
        loadTasks();
      } else {
        toast({
          title: "創建失敗",
          description: response.message || "任務創建失敗",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "創建失敗",
        description: err.message || "任務創建過程中發生錯誤",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!currentTask) return;

    try {
      const response = await apiService.updateAdminTask(currentTask.id, formData);
      if (response.success) {
        toast({
          title: "成功",
          description: "任務更新成功",
        });
        setEditDialogOpen(false);
        resetForm();
        loadTasks();
      } else {
        toast({
          title: "更新失敗",
          description: response.message || "任務更新失敗",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "更新失敗",
        description: err.message || "任務更新過程中發生錯誤",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;

    try {
      const response = await apiService.deleteAdminTask(currentTask.id);
      if (response.success) {
        toast({
          title: "成功",
          description: "任務刪除成功",
        });
        setDeleteDialogOpen(false);
        loadTasks();
      } else {
        toast({
          title: "刪除失敗",
          description: response.message || "任務刪除失敗",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "刪除失敗",
        description: err.message || "任務刪除過程中發生錯誤",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content_types: [],
      requirements: "",
      deliverables: [],
      budget: {
        min: 0,
        max: 0,
        type: "fixed",
        rewardType: "one-time"
      },
      deadline: "",
      status: "draft"
    });
    setCurrentTask(null);
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      content_types: task.content_types,
      requirements: task.requirements,
      deliverables: task.deliverables,
      budget: task.budget,
      deadline: task.deadline,
      status: task.status
    });
    setEditDialogOpen(true);
  };

  const openViewDialog = (task: Task) => {
    setCurrentTask(task);
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setCurrentTask(task);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = taskStatuses.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;
    
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  const formatBudget = (budget: Task['budget']) => {
    if (budget.type === 'fixed') {
      return `NT$ ${budget.min.toLocaleString()}`;
    } else if (budget.type === 'range') {
      return `NT$ ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}`;
    } else {
      return `NT$ ${budget.min.toLocaleString()}+ (可議價)`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">載入中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">任務管理</h1>
          <p className="text-muted-foreground">
            管理平台上的所有任務，包括創建、編輯、狀態管理和刪除
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增任務
        </Button>
      </div>

      {/* 搜尋和篩選 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            搜尋與篩選
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>關鍵字搜尋</Label>
              <Input
                placeholder="搜尋任務標題或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>任務狀態</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部狀態</SelectItem>
                  {taskStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>內容類型</Label>
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇內容類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部類型</SelectItem>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>日期範圍</Label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇日期範圍" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部時間</SelectItem>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="week">本週</SelectItem>
                  <SelectItem value="month">本月</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={loadTasks}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重新載入
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 錯誤提示 */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 任務列表 */}
      <Card>
        <CardHeader>
          <CardTitle>任務列表</CardTitle>
          <CardDescription>
            共 {filteredTasks.length} 個任務
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任務標題</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>內容類型</TableHead>
                  <TableHead>預算</TableHead>
                  <TableHead>截止日期</TableHead>
                  <TableHead>申請數</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          沒有找到任務
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(task.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.content_types.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {contentTypes.find(t => t.value === type)?.label || type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatBudget(task.budget)}
                      </TableCell>
                      <TableCell>
                        {new Date(task.deadline).toLocaleDateString("zh-TW")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {task.applications_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openViewDialog(task)}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看詳情
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(task)}>
                              <Edit className="mr-2 h-4 w-4" />
                              編輯任務
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(task)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              刪除任務
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 創建任務對話框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>創建新任務</DialogTitle>
            <DialogDescription>
              填寫任務的基本資訊和詳細要求
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* 基本資訊 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="createTitle">任務標題 *</Label>
                  <Input
                    id="createTitle"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="輸入任務標題"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createStatus">任務狀態 *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="createDescription">任務描述 *</Label>
                <Textarea
                  id="createDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="詳細描述任務內容、目標和要求"
                  rows={4}
                />
              </div>
            </div>

            {/* 內容類型和需求 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">內容類型和需求</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>內容類型 *</Label>
                  <div className="space-y-2">
                    {contentTypes.map((type) => (
                      <label key={type.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.content_types?.includes(type.value)}
                          onChange={(e) => {
                            const currentTypes = formData.content_types || [];
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                content_types: [...currentTypes, type.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                content_types: currentTypes.filter(t => t !== type.value)
                              });
                            }
                          }}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createRequirements">具體需求</Label>
                  <Textarea
                    id="createRequirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="描述具體的內容要求、格式標準等"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* 預算和時間 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">預算和時間</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>預算類型</Label>
                  <Select
                    value={formData.budget?.type}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      budget: { ...formData.budget!, type: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createBudgetMin">最小預算 (NT$)</Label>
                  <Input
                    id="createBudgetMin"
                    type="number"
                    value={formData.budget?.min || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget!, min: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createBudgetMax">最大預算 (NT$)</Label>
                  <Input
                    id="createBudgetMax"
                    type="number"
                    value={formData.budget?.max || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget!, max: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0"
                    disabled={formData.budget?.type === "fixed"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="createDeadline">截止日期 *</Label>
                <Input
                  id="createDeadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTask}>創建任務</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯任務對話框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯任務</DialogTitle>
            <DialogDescription>
              修改任務的資訊和設定
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* 基本資訊 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle">任務標題 *</Label>
                  <Input
                    id="editTitle"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="輸入任務標題"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">任務狀態 *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">任務描述 *</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="詳細描述任務內容、目標和要求"
                  rows={4}
                />
              </div>
            </div>

            {/* 內容類型和需求 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">內容類型和需求</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>內容類型 *</Label>
                  <div className="space-y-2">
                    {contentTypes.map((type) => (
                      <label key={type.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.content_types?.includes(type.value)}
                          onChange={(e) => {
                            const currentTypes = formData.content_types || [];
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                content_types: [...currentTypes, type.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                content_types: currentTypes.filter(t => t !== type.value)
                              });
                            }
                          }}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRequirements">具體需求</Label>
                  <Textarea
                    id="editRequirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="描述具體的內容要求、格式標準等"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* 預算和時間 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">預算和時間</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>預算類型</Label>
                  <Select
                    value={formData.budget?.type}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      budget: { ...formData.budget!, type: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBudgetMin">最小預算 (NT$)</Label>
                  <Input
                    id="editBudgetMin"
                    type="number"
                    value={formData.budget?.min || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget!, min: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBudgetMax">最大預算 (NT$)</Label>
                  <Input
                    id="editBudgetMax"
                    type="number"
                    value={formData.budget?.max || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget!, max: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0"
                    disabled={formData.budget?.type === "fixed"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDeadline">截止日期 *</Label>
                <Input
                  id="editDeadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateTask}>更新任務</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看任務詳情對話框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>任務詳情</DialogTitle>
            <DialogDescription>
              查看任務的完整資訊
            </DialogDescription>
          </DialogHeader>
          {currentTask && (
            <div className="space-y-6">
              {/* 基本資訊 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">基本資訊</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">任務標題</Label>
                    <p className="text-sm text-muted-foreground">{currentTask.title}</p>
                  </div>
                  <div>
                    <Label className="font-medium">任務狀態</Label>
                    <div className="mt-1">{getStatusBadge(currentTask.status)}</div>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">任務描述</Label>
                  <p className="text-sm text-muted-foreground mt-1">{currentTask.description}</p>
                </div>
              </div>

              {/* 內容類型和需求 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">內容類型和需求</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">內容類型</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentTask.content_types.map((type) => (
                        <Badge key={type} variant="outline">
                          {contentTypes.find(t => t.value === type)?.label || type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">具體需求</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentTask.requirements || "未指定"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 預算和時間 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">預算和時間</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-medium">預算類型</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {budgetTypes.find(t => t.value === currentTask.budget.type)?.label || currentTask.budget.type}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">預算範圍</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatBudget(currentTask.budget)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">截止日期</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(currentTask.deadline).toLocaleDateString("zh-TW")}
                    </p>
                  </div>
                </div>
              </div>

              {/* 統計資訊 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">統計資訊</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-medium">申請數量</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentTask.applications_count || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">瀏覽次數</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentTask.views_count || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">完成進度</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentTask.progress?.completion_percentage || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 系統資訊 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">系統資訊</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">創建時間</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(currentTask.created_at).toLocaleString("zh-TW")}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">更新時間</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(currentTask.updated_at).toLocaleString("zh-TW")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              確定要刪除任務 "{currentTask?.title}" 嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
