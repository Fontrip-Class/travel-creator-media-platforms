import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  MapPin,
  Gift,
  FileText,
  Image,
  Video,
  Music,
  Eye,
  Download,
  Share2
} from "lucide-react";
import { Task, TaskStatus } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// 模擬任務數據
const MOCK_TASK: Task = {
  id: "1",
  title: "台北101觀景台宣傳影片",
  description: "製作台北101觀景台宣傳影片，突出台北地標特色和觀景體驗。需要高品質的影片和照片，突出觀景台的視野和體驗。影片時長約2-3分鐘，包含日景和夜景，展現台北101的壯觀和美麗。",
  business_entity_id: "supplier1",
  status: "collecting",
  content_types: ["video", "photo"],
  requirements: "需要高品質的影片和照片，突出觀景台的視野和體驗。影片時長約2-3分鐘，包含日景和夜景，展現台北101的壯觀和美麗。照片需要高解析度，適合用於宣傳材料和社群媒體。",
  deliverables: ["宣傳影片", "宣傳照片", "社群媒體素材"],
  budget: { min: 15000, max: 25000, type: "fixed", rewardType: "per_project" },
  reward_type: "money",
  gift_details: "",
  deadline: "2024-02-15",
  location: { lat: 25.0330, lng: 121.5654 },
  applications_count: 8,
  views_count: 156,
  progress: {
    current_step: "collecting",
    completion_percentage: 25,
    estimated_completion: "2024-02-15"
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-18T00:00:00Z"
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTaskData(id);
    }
  }, [id]);

  const loadTaskData = async (taskId: string) => {
    setIsLoading(true);
    try {
      // 這裡會調用真實的 API
      // const response = await apiService.getTaskById(taskId);
      // setTask(response.data);
      
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 500));
      setTask(MOCK_TASK);
    } catch (error) {
      console.error('加載任務數據失敗:', error);
      toast({
        title: "加載失敗",
        description: "無法加載任務數據，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "open": return "bg-blue-500";
      case "collecting": return "bg-yellow-500";
      case "evaluating": return "bg-purple-500";
      case "in_progress": return "bg-orange-500";
      case "reviewing": return "bg-indigo-500";
      case "publishing": return "bg-pink-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      case "expired": return "bg-gray-400";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case "draft": return "草稿";
      case "open": return "開放中";
      case "collecting": return "收集中";
      case "evaluating": return "評估中";
      case "in_progress": return "進行中";
      case "reviewing": return "審核中";
      case "publishing": return "發布中";
      case "completed": return "已完成";
      case "cancelled": return "已取消";
      case "expired": return "已過期";
      default: return status;
    }
  };

  const getRewardTypeIcon = (rewardType: string) => {
    switch (rewardType) {
      case "money": return <DollarSign className="h-5 w-5 text-green-600" />;
      case "gift": return <Gift className="h-5 w-5 text-blue-600" />;
      case "experience": return <MapPin className="h-5 w-5 text-purple-600" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getRewardTypeText = (rewardType: string) => {
    switch (rewardType) {
      case "money": return "金錢報酬";
      case "gift": return "贈品報酬";
      case "experience": return "體驗報酬";
      default: return rewardType;
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在驗證身份...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加載任務數據...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">任務不存在</h2>
          <p className="text-gray-600 mb-4">您要查看的任務可能已被刪除或不存在</p>
          <Button onClick={() => navigate("/supplier/dashboard")}>
            返回儀表板
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${task.title} | 觀光署旅遊服務與行銷創作資源管理與媒合平台`}
        description={task.description}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 頁面標題和操作欄 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/supplier/dashboard")}
            className="mb-4 p-0 h-auto font-normal text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回儀表板
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Badge>
                <div className="flex items-center gap-1">
                  {getRewardTypeIcon(task.reward_type)}
                  <span className="text-sm text-gray-600">
                    {getRewardTypeText(task.reward_type)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  創建於 {new Date(task.created_at).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                下載詳情
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/supplier/edit-task/${task.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                編輯
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 任務描述 */}
            <Card>
              <CardHeader>
                <CardTitle>任務描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              </CardContent>
            </Card>

            {/* 具體需求 */}
            <Card>
              <CardHeader>
                <CardTitle>具體需求</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {task.requirements}
                </p>
              </CardContent>
            </Card>

            {/* 交付物 */}
            <Card>
              <CardHeader>
                <CardTitle>交付物</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 內容類型 */}
            <Card>
              <CardHeader>
                <CardTitle>內容類型</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.content_types.map((type) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      {getContentTypeIcon(type)}
                      {type === "image" ? "攝影設計" : 
                       type === "video" ? "影片製作" : 
                       type === "text" ? "文章撰寫" : 
                       type === "audio" ? "音頻製作" : type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 任務概覽 */}
            <Card>
              <CardHeader>
                <CardTitle>任務概覽</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">狀態</span>
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">截止日期</span>
                  <span className="text-sm font-medium">{task.deadline}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">瀏覽次數</span>
                  <span className="text-sm font-medium">{task.views_count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">申請數量</span>
                  <span className="text-sm font-medium">{task.applications_count}</span>
                </div>
              </CardContent>
            </Card>

            {/* 報酬信息 */}
            <Card>
              <CardHeader>
                <CardTitle>報酬信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getRewardTypeIcon(task.reward_type)}
                  <span className="font-medium">{getRewardTypeText(task.reward_type)}</span>
                </div>
                
                {task.reward_type === 'money' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">預算範圍</span>
                      <span className="text-sm font-medium">
                        NT$ {task.budget.min.toLocaleString()} - {task.budget.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">預算類型</span>
                      <span className="text-sm font-medium">
                        {task.budget.type === "fixed" ? "固定預算" : 
                         task.budget.type === "range" ? "預算範圍" : "可議價"}
                      </span>
                    </div>
                  </div>
                )}
                
                {(task.reward_type === 'gift' || task.reward_type === 'experience') && task.gift_details && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">詳情描述</div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {task.gift_details}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 進度追蹤 */}
            <Card>
              <CardHeader>
                <CardTitle>進度追蹤</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">完成進度</span>
                  <span className="font-medium">{task.progress.completion_percentage}%</span>
                </div>
                <Progress value={task.progress.completion_percentage} className="h-2" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">當前階段</span>
                    <span className="font-medium">{task.progress.current_step}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">預計完成</span>
                    <span className="font-medium">{task.progress.estimated_completion}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 位置信息 */}
            {task.location && (
              <Card>
                <CardHeader>
                  <CardTitle>位置信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>緯度: {task.location.lat}</span>
                    <span>經度: {task.location.lng}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
