import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserTaskManagement } from "@/hooks/use-user-task-management";
import { Task, TaskStatus } from "@/types/database";
import {
  BarChart3,
  CheckCircle,
  Edit,
  Eye,
  FileText,
  Image,
  Music,
  Plus,
  Star,
  TrendingUp,
  Video
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Proposal {
  id: string;
  taskTitle: string;
  status: string;
  submittedAt: string;
  budget: number;
}

// 模擬數據
const MOCK_TASKS: Task[] = [
  {
    id: "task_001",
    title: "台東秋季活動宣傳影片製作",
    description: "製作台東秋季活動宣傳影片，突出地方特色和活動亮點",
    business_entity_id: "supplier1",
    status: "collecting" as TaskStatus,
    content_types: ["video"],
    requirements: "製作高品質宣傳影片",
    deliverables: ["宣傳影片"],
    budget: { min: 15000, max: 25000, type: "fixed", rewardType: "per_project" },
    reward_type: "money" as const,
    deadline: "2024-02-15",
    location: { lat: 22.7972, lng: 121.1444 },
    applications_count: 5,
    views_count: 120,
    progress: {
      current_step: "collecting",
      completion_percentage: 25,
      estimated_completion: "2024-02-15"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z"
  },
  {
    id: "task_002",
    title: "花蓮海岸線攝影推廣",
    description: "推廣花蓮海岸線自然風景，製作高品質攝影作品",
    business_entity_id: "supplier2",
    status: "collecting" as TaskStatus,
    content_types: ["photo"],
    requirements: "高品質攝影作品",
    deliverables: ["攝影作品集"],
    budget: { min: 8000, max: 15000, type: "fixed", rewardType: "per_project" },
    reward_type: "money" as const,
    deadline: "2024-03-01",
    location: { lat: 23.9739, lng: 121.6015 },
    applications_count: 8,
    views_count: 95,
    progress: {
      current_step: "collecting",
      completion_percentage: 30,
      estimated_completion: "2024-03-01"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z"
  }
];

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop_001",
    taskTitle: "台東秋季活動宣傳影片製作",
    status: "pending",
    submittedAt: "2024-01-15",
    budget: 20000
  },
  {
    id: "prop_002",
    taskTitle: "花蓮海岸線攝影推廣",
    status: "accepted",
    submittedAt: "2024-01-10",
    budget: 12000
  }
];

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  // 使用統一的用戶任務管理 Hook
  const {
    isLoading,
    error,
    dashboardStats,
    tasks,
    applications,
    loadDashboardData,
    loadTasks,
    applyForTask
  } = useUserTaskManagement();

  // 本地狀態
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);

  const handleTaskAction = (action: string, taskId: string) => {
    console.log(`執行動作: ${action} 任務: ${taskId}`);

    switch (action) {
      case "browse_tasks":
        navigate("/creator/tasks");
        break;
      case "submit_proposal":
        navigate(`/creator/submit-proposal/${taskId}`);
        break;
      case "manage_portfolio":
        navigate("/creator/portfolio");
        break;
      case "view_analytics":
        navigate("/creator/analytics");
        break;
      default:
        console.log(`未知動作: ${action}`);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "collecting": return "bg-blue-500";
      case "evaluating": return "bg-yellow-500";
      case "in_progress": return "bg-green-500";
      case "completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case "collecting": return "徵集中";
      case "evaluating": return "評估中";
      case "in_progress": return "進行中";
      case "completed": return "已完成";
      default: return status;
    }
  };

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getProposalStatusText = (status: string) => {
    switch (status) {
      case "pending": return "待審核";
      case "accepted": return "已接受";
      case "rejected": return "已拒絕";
      default: return status;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "text": return <FileText className="h-4 w-4" />;
      case "audio": return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="創作者儀表板 | 觀光署旅遊服務與行銷創作資源管理與媒合平台"
        description="管理您的創作任務和作品集"
      />

      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">創作者儀表板</h1>
          <p className="text-gray-600 mt-2">管理您的創作任務和作品集</p>
        </div>

        {/* 統計概覽（整合真實數據）*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">可申請任務</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats?.available_tasks_count ?? tasks.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已提交申請</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats?.applications?.total_applications ?? proposals.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已接受申請</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardStats?.applications?.accepted_applications ??
                     tasks.filter(task => task.status === "in_progress").length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均預算</p>
                  <p className="text-2xl font-bold text-purple-600">
                    NT$ {(dashboardStats?.applications?.avg_proposed_budget ?? 15000).toLocaleString()}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要內容區域 */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概覽</TabsTrigger>
            <TabsTrigger value="tasks">任務瀏覽</TabsTrigger>
            <TabsTrigger value="proposals">我的提案</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6">
              {/* 最近任務 */}
              <Card>
                <CardHeader>
                  <CardTitle>最近任務</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(tasks.length > 0 ? tasks : MOCK_TASKS).slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getContentTypeIcon("video")}
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">
                              {typeof task.location === 'string' ? task.location : '台灣'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            NT$ {task.budget.min.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleTaskAction("browse_tasks", "")}>
                      <Eye className="h-6 w-6" />
                      <span>瀏覽任務</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleTaskAction("manage_portfolio", "")}>
                      <Edit className="h-6 w-6" />
                      <span>管理作品集</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleTaskAction("view_analytics", "")}>
                      <BarChart3 className="h-6 w-6" />
                      <span>查看分析</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>可申請任務</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(tasks.length > 0 ? tasks : MOCK_TASKS).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon("video")}
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="flex gap-2 mt-1">
                            {task.content_types.slice(0, 3).map((type, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">預算: NT$ {task.budget.min.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">截止: {task.deadline}</p>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </Button>
                          <Button size="sm" onClick={() => handleTaskAction("submit_proposal", task.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            申請
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>我的提案</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{proposal.taskTitle}</p>
                        <p className="text-sm text-gray-600">提交時間: {proposal.submittedAt}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">預算: NT$ {proposal.budget.toLocaleString()}</p>
                          <Badge className={getProposalStatusColor(proposal.status)}>
                            {getProposalStatusText(proposal.status)}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          查看
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
