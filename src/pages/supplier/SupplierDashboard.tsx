import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users,
  Calendar,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { TaskCard, Task } from "@/components/ui/task-card";
import { TaskProgressBar, createTaskStages } from "@/components/ui/task-progress-bar";

// 模擬數據
const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "台北101觀景台旅遊宣傳影片",
    summary: "製作台北101觀景台的宣傳影片，突出其作為台北地標的特色和觀景體驗",
    status: "collecting",
    budget: { min: 15000, max: 25000, type: "fixed" },
    deadline: "2024-02-15",
    location: "台北市",
    supplier: { id: "supplier1", name: "台北101", avatar: "" },
    progress: {
      currentStage: "collecting",
      progressPercentage: 25,
      completedStages: ["draft", "published"]
    },
    stats: {
      applications: 8,
      views: 156,
      daysLeft: 12
    }
  },
  {
    id: "2",
    title: "九份老街美食文化推廣",
    summary: "創作九份老街的美食文化內容，包括圖文和短影片，展現當地特色小吃",
    status: "in_progress",
    budget: { min: 8000, max: 12000, type: "fixed" },
    deadline: "2024-01-30",
    location: "新北市",
    supplier: { id: "supplier1", name: "台北101", avatar: "" },
    progress: {
      currentStage: "in_progress",
      progressPercentage: 50,
      completedStages: ["draft", "published", "collecting", "evaluating"]
    },
    stats: {
      applications: 15,
      views: 234,
      daysLeft: 5
    }
  },
  {
    id: "3",
    title: "阿里山日出攝影作品集",
    summary: "拍攝阿里山日出的高品質攝影作品，用於旅遊宣傳和紀念品製作",
    status: "reviewing",
    budget: { min: 20000, max: 30000, type: "fixed" },
    deadline: "2024-02-20",
    location: "嘉義縣",
    supplier: { id: "supplier1", name: "台北101", avatar: "" },
    progress: {
      currentStage: "reviewing",
      progressPercentage: 62.5,
      completedStages: ["draft", "published", "collecting", "evaluating", "in_progress"]
    },
    stats: {
      applications: 12,
      views: 189,
      daysLeft: 18
    }
  }
];

const MOCK_STATS = {
  totalTasks: 15,
  activeTasks: 8,
  completedTasks: 6,
  cancelledTasks: 1,
  totalBudget: 450000,
  totalApplications: 89,
  avgCompletionTime: 18,
  satisfactionRate: 4.6
};

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const filteredTasks = selectedStage === "all" 
    ? tasks 
    : tasks.filter(task => task.status === selectedStage);

  const getStageStats = () => {
    const stats = {
      collecting: 0,
      evaluating: 0,
      in_progress: 0,
      reviewing: 0,
      publishing: 0,
      completed: 0
    };

    tasks.forEach(task => {
      if (stats.hasOwnProperty(task.status)) {
        stats[task.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const stageStats = getStageStats();

  const handleTaskAction = (action: string, taskId: string) => {
    console.log(`執行操作: ${action} 任務: ${taskId}`);
    
    switch (action) {
      case "create_task":
        navigate("/supplier/create-task");
        break;
      case "view_proposals":
        navigate("/supplier/proposals");
        break;
      case "review_content":
        navigate("/supplier/reviews");
        break;
      case "track_performance":
        navigate("/supplier/analytics");
        break;
      default:
        console.log(`未處理的操作: ${action}`);
    }
  };

  const quickActions = [
    {
      title: "發布新任務",
      description: "創建新的行銷任務",
      icon: Plus,
      action: "create_task",
      color: "bg-blue-500",
      href: "/supplier/create-task"
    },
    {
      title: "查看提案",
      description: "審核創作者提案",
      icon: FileText,
      action: "view_proposals",
      color: "bg-green-500",
      href: "/supplier/proposals"
    },
    {
      title: "審核內容",
      description: "審核創作內容",
      icon: CheckCircle,
      action: "review_content",
      color: "bg-purple-500",
      href: "/supplier/reviews"
    },
    {
      title: "效果追蹤",
      description: "查看任務效果數據",
      icon: TrendingUp,
      action: "track_performance",
      color: "bg-orange-500",
      href: "/supplier/analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">供應商儀表板</h1>
          <p className="text-gray-600 mt-2">管理您的行銷任務，追蹤進度和效果</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總任務數</p>
                  <p className="text-2xl font-bold text-gray-900">{MOCK_STATS.totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">進行中任務</p>
                  <p className="text-2xl font-bold text-gray-900">{MOCK_STATS.activeTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總預算</p>
                  <p className="text-2xl font-bold text-gray-900">
                    NT$ {(MOCK_STATS.totalBudget / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">滿意度</p>
                  <p className="text-2xl font-bold text-gray-900">{MOCK_STATS.satisfactionRate}/5.0</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all duration-200"
                  onClick={() => handleTaskAction(action.action, "")}
                >
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 任務階段統計 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              任務階段統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(stageStats).map(([stage, count]) => (
                <div key={stage} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">
                    {stage.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 任務列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">我的任務</h2>
            
            {/* 階段篩選 */}
            <div className="flex gap-2">
              <Button
                variant={selectedStage === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStage("all")}
              >
                全部
              </Button>
              <Button
                variant={selectedStage === "collecting" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStage("collecting")}
              >
                徵集中
              </Button>
              <Button
                variant={selectedStage === "evaluating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStage("evaluating")}
              >
                評估中
              </Button>
              <Button
                variant={selectedStage === "in_progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStage("in_progress")}
              >
                進行中
              </Button>
              <Button
                variant={selectedStage === "reviewing" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStage("reviewing")}
              >
                審核中
              </Button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 mb-4">暫無任務</div>
                <Button onClick={() => handleTaskAction("create_task", "")}>
                  <Plus className="w-4 h-4 mr-2" />
                  發布第一個任務
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userRole="supplier"
                  onAction={handleTaskAction}
                  showProgress={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* 進度追蹤 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              整體進度追蹤
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">任務完成率</span>
                <span className="text-sm text-gray-500">
                  {MOCK_STATS.completedTasks}/{MOCK_STATS.totalTasks}
                </span>
              </div>
              <Progress 
                value={(MOCK_STATS.completedTasks / MOCK_STATS.totalTasks) * 100} 
                className="h-2"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {MOCK_STATS.avgCompletionTime}
                  </div>
                  <div className="text-sm text-gray-600">平均完成天數</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {MOCK_STATS.totalApplications}
                  </div>
                  <div className="text-sm text-gray-600">總提案數</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {((MOCK_STATS.completedTasks / MOCK_STATS.totalTasks) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">成功率</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
