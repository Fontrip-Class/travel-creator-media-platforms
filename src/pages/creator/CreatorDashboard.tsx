import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, Plus, FileText, Clock, CheckCircle, AlertCircle,
  TrendingUp, Users, Calendar, DollarSign, Palette, Eye
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  summary: string;
  budget: { min: number; max: number; type: string };
  deadline: string;
  location: string;
  status: string;
  progress: number;
  tags: string[];
}

interface Proposal {
  id: string;
  taskTitle: string;
  status: string;
  submittedAt: string;
  budget: number;
}

const MOCK_TASKS: Task[] = [
  {
    id: "task_001",
    title: "台東季節活動宣傳影片製作",
    summary: "製作台東季節活動的宣傳影片，突出當地特色和活動亮點",
    budget: { min: 15000, max: 25000, type: "money" },
    deadline: "2024-02-15",
    location: "台東縣",
    status: "collecting",
    progress: 0,
    tags: ["旅遊", "宣傳", "影片", "台東", "季節活動"]
  },
  {
    id: "task_002",
    title: "花蓮海岸線攝影作品集",
    summary: "拍攝花蓮海岸線的自然風光，製作高品質攝影作品集",
    budget: { min: 8000, max: 15000, type: "money" },
    deadline: "2024-03-01",
    location: "花蓮縣",
    status: "collecting",
    progress: 0,
    tags: ["攝影", "自然", "海岸", "花蓮", "風景"]
  }
];

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop_001",
    taskTitle: "台東季節活動宣傳影片製作",
    status: "pending",
    submittedAt: "2024-01-15",
    budget: 20000
  },
  {
    id: "prop_002",
    taskTitle: "花蓮海岸線攝影作品集",
    status: "accepted",
    submittedAt: "2024-01-10",
    budget: 12000
  }
];

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);

  const handleTaskAction = (action: string, taskId: string) => {
    console.log(`執行操作: ${action} 任務: ${taskId}`);
    
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
        console.log(`未處理的操作: ${action}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "collecting": return "bg-blue-100 text-blue-800";
      case "evaluating": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
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
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProposalStatusText = (status: string) => {
    switch (status) {
      case "pending": return "審核中";
      case "accepted": return "已接受";
      case "rejected": return "已拒絕";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">創作者儀表板</h1>
          <p className="text-gray-600">管理您的創作任務、提案和作品集</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活躍提案</p>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">進行中任務</p>
                  <p className="text-2xl font-bold text-green-600">2</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">完成任務</p>
                  <p className="text-2xl font-bold text-purple-600">15</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總收入</p>
                  <p className="text-2xl font-bold text-orange-600">NT$ 180K</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => handleTaskAction("browse_tasks", "")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Search className="h-6 w-6" />
                <span>瀏覽任務</span>
              </Button>
              
              <Button
                onClick={() => handleTaskAction("manage_portfolio", "")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Palette className="h-6 w-6" />
                <span>管理作品集</span>
              </Button>
              
              <Button
                onClick={() => handleTaskAction("view_analytics", "")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <TrendingUp className="h-6 w-6" />
                <span>查看分析</span>
              </Button>
              
              <Button
                onClick={() => navigate("/creator/profile")}
                className="h-20 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Users className="h-6 w-6" />
                <span>個人資料</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 標籤頁 */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {["overview", "tasks", "proposals", "portfolio"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "overview" && "總覽"}
                {tab === "tasks" && "推薦任務"}
                {tab === "proposals" && "我的提案"}
                {tab === "portfolio" && "作品集"}
              </button>
            ))}
          </div>
        </div>

        {/* 內容區域 */}
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 推薦任務 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  推薦任務
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.summary}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>預算: NT$ {task.budget.min.toLocaleString()} - {task.budget.max.toLocaleString()}</span>
                        <span>截止: {task.deadline}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleTaskAction("submit_proposal", task.id)}
                        size="sm"
                        className="w-full"
                      >
                        立即提案
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 最新提案狀態 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  最新提案狀態
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{proposal.taskTitle}</h3>
                        <Badge className={getProposalStatusColor(proposal.status)}>
                          {getProposalStatusText(proposal.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>提案金額: NT$ {proposal.budget.toLocaleString()}</span>
                        <span>提交時間: {proposal.submittedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "tasks" && (
          <Card>
            <CardHeader>
              <CardTitle>推薦任務</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.summary}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>預算: NT$ {task.budget.min.toLocaleString()} - {task.budget.max.toLocaleString()}</span>
                      <span>截止: {task.deadline}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleTaskAction("submit_proposal", task.id)}
                      size="sm"
                      className="w-full"
                    >
                      立即提案
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "proposals" && (
          <Card>
            <CardHeader>
              <CardTitle>我的提案</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{proposal.taskTitle}</h3>
                      <Badge className={getProposalStatusColor(proposal.status)}>
                        {getProposalStatusText(proposal.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>提案金額: NT$ {proposal.budget.toLocaleString()}</span>
                      <span>提交時間: {proposal.submittedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "portfolio" && (
          <Card>
            <CardHeader>
              <CardTitle>作品集</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">您還沒有上傳作品</p>
                <Button onClick={() => navigate("/creator/portfolio")}>
                  開始建立作品集
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
