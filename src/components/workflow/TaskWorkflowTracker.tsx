import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/lib/api';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    MessageSquare,
    Star,
    Upload,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TaskWorkflowProps {
  taskId: string;
  onStatusChange?: (newStatus: string) => void;
}

interface WorkflowData {
  task: any;
  stages: any[];
  applications: any[];
  assets: any[];
  activities: any[];
  ratings: any[];
}

/**
 * 任務工作流程追蹤組件
 * 顯示任務從創建到完成的完整流程狀態
 */
export function TaskWorkflowTracker({ taskId, onStatusChange }: TaskWorkflowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadWorkflowData();
  }, [taskId]);

  const loadWorkflowData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/workflow/tasks/${taskId}/workflow`);

      if (response.success) {
        setWorkflowData(response.data);
      } else {
        throw new Error(response.message || '載入工作流程失敗');
      }
    } catch (error: any) {
      console.warn('API調用失敗，使用模擬數據:', error);
      // 使用模擬數據
      setWorkflowData(getMockWorkflowData());
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishTask = async () => {
    try {
      const response = await apiService.request(`/workflow/tasks/${taskId}/publish`, {
        method: 'POST'
      });

      if (response.success) {
        toast({
          title: '發布成功',
          description: '任務已發布，創作者可以開始申請'
        });
        loadWorkflowData();
        onStatusChange?.('open');
      }
    } catch (error: any) {
      toast({
        title: '發布失敗',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleReviewApplication = async (applicationId: string, decision: string, notes?: string) => {
    try {
      const response = await apiService.request(`/workflow/applications/${applicationId}/review`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes })
      });

      if (response.success) {
        toast({
          title: '審核完成',
          description: `申請已${decision === 'accepted' ? '接受' : '拒絕'}`
        });
        loadWorkflowData();
      }
    } catch (error: any) {
      toast({
        title: '審核失敗',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCompleteTask = async () => {
    try {
      const response = await apiService.request(`/workflow/tasks/${taskId}/complete`, {
        method: 'POST'
      });

      if (response.success) {
        toast({
          title: '任務完成',
          description: '任務已標記為完成'
        });
        loadWorkflowData();
        onStatusChange?.('completed');
      }
    } catch (error: any) {
      toast({
        title: '完成失敗',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStageIcon = (stageName: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }

    switch (stageName) {
      case 'draft': return <FileText className="h-5 w-5 text-gray-400" />;
      case 'open': return <Users className="h-5 w-5 text-blue-500" />;
      case 'collecting': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'reviewing': return <Eye className="h-5 w-5 text-purple-500" />;
      case 'publishing': return <Upload className="h-5 w-5 text-indigo-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageLabel = (stageName: string) => {
    const labels = {
      draft: '草稿',
      open: '開放申請',
      collecting: '收集申請',
      in_progress: '執行中',
      reviewing: '審核中',
      publishing: '發布中',
      completed: '已完成'
    };
    return labels[stageName as keyof typeof labels] || stageName;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: '已接受', color: 'bg-green-100 text-green-800' },
      rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800' },
      approved: { label: '已批准', color: 'bg-green-100 text-green-800' },
      revision_required: { label: '需修改', color: 'bg-orange-100 text-orange-800' }
    };

    const config = configs[status as keyof typeof configs] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">載入工作流程...</span>
      </div>
    );
  }

  if (!workflowData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">無法載入工作流程數據</p>
        </CardContent>
      </Card>
    );
  }

  const { task, stages, applications, assets, activities, ratings } = workflowData;
  const currentStage = stages.find(s => s.progress_percentage > 0) || stages[0];

  return (
    <div className="space-y-6">
      {/* 任務概覽 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>任務工作流程</span>
            <Badge className="bg-blue-100 text-blue-800">{getStageLabel(task.status)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 進度條 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>整體進度</span>
              <span>{currentStage?.progress_percentage || 0}%</span>
            </div>
            <Progress value={currentStage?.progress_percentage || 0} className="h-3" />
          </div>

          {/* 階段狀態 */}
          <div className="grid grid-cols-7 gap-2">
            {stages.map((stage, index) => (
              <div key={stage.stage_name} className="text-center">
                <div className="flex flex-col items-center">
                  {getStageIcon(stage.stage_name, stage.progress_percentage >= 100)}
                  <span className="text-xs mt-1">{getStageLabel(stage.stage_name)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 詳細內容 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="applications">申請 ({applications.length})</TabsTrigger>
          <TabsTrigger value="assets">作品 ({assets.length})</TabsTrigger>
          <TabsTrigger value="activities">活動記錄</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>任務資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{task.title}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-500">預算範圍</span>
                  <p className="font-medium">NT$ {task.budget_min?.toLocaleString()} - {task.budget_max?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">截止日期</span>
                  <p className="font-medium">{new Date(task.deadline).toLocaleDateString('zh-TW')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">申請數量</span>
                  <p className="font-medium">{applications.length}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">作品數量</span>
                  <p className="font-medium">{assets.length}</p>
                </div>
              </div>

              {/* 操作按鈕 */}
              {user?.id === task.supplier_id && (
                <div className="flex gap-2 pt-4 border-t">
                  {task.status === 'draft' && (
                    <Button onClick={handlePublishTask}>
                      發布任務
                    </Button>
                  )}
                  {task.status === 'reviewing' && (
                    <Button onClick={handleCompleteTask}>
                      確認完成
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{application.creator_name}</h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{application.proposal}</p>
                    <div className="text-sm text-gray-500">
                      預算報價: NT$ {application.proposed_budget?.toLocaleString()}
                    </div>
                  </div>

                  {user?.id === task.supplier_id && application.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReviewApplication(application.id, 'accepted')}
                      >
                        接受
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewApplication(application.id, 'rejected')}
                      >
                        拒絕
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {applications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">尚無申請</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{asset.title}</h4>
                      {getStatusBadge(asset.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>類型: {asset.asset_type}</span>
                      <span>大小: {(asset.file_size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>上傳時間: {new Date(asset.created_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      預覽
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      下載
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {assets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">尚無作品</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>活動時間軸</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.description}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString('zh-TW')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">操作者: {activity.user_name}</p>
                    </div>
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">尚無活動記錄</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 評分區域 */}
      {task.status === 'completed' && ratings.length < 2 && (
        <Card>
          <CardHeader>
            <CardTitle>任務評分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{rating.from_user_name} → {rating.to_user_name}</span>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < rating.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{rating.rating}/5</span>
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-gray-600 mt-1">{rating.comment}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* 評分按鈕 */}
              {((user?.id === task.supplier_id && !ratings.find(r => r.from_user_id === user.id)) ||
                (user?.id === task.assigned_creator_id && !ratings.find(r => r.from_user_id === user.id))) && (
                <Button variant="outline" className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  評分對方
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 模擬工作流程數據
 */
function getMockWorkflowData(): WorkflowData {
  return {
    task: {
      id: 'task_001',
      title: '台北101觀景台宣傳影片',
      description: '製作台北101觀景台宣傳影片，突出台北地標特色和觀景體驗',
      status: 'in_progress',
      budget_min: 15000,
      budget_max: 25000,
      deadline: '2024-02-15',
      supplier_id: 'supplier_001',
      assigned_creator_id: 'creator_001',
      supplier_name: '台北101',
      creator_name: '小明攝影工作室'
    },
    stages: [
      { stage_name: 'draft', stage_order: 1, progress_percentage: 100 },
      { stage_name: 'open', stage_order: 2, progress_percentage: 100 },
      { stage_name: 'collecting', stage_order: 3, progress_percentage: 100 },
      { stage_name: 'in_progress', stage_order: 4, progress_percentage: 75 },
      { stage_name: 'reviewing', stage_order: 5, progress_percentage: 0 },
      { stage_name: 'publishing', stage_order: 6, progress_percentage: 0 },
      { stage_name: 'completed', stage_order: 7, progress_percentage: 0 }
    ],
    applications: [
      {
        id: 'app_001',
        creator_name: '小明攝影工作室',
        proposal: '我有豐富的地標攝影經驗，可以製作高品質的宣傳影片',
        proposed_budget: 20000,
        status: 'accepted',
        created_at: '2024-01-10T10:00:00Z'
      }
    ],
    assets: [
      {
        id: 'asset_001',
        title: '台北101宣傳影片初稿',
        description: '包含日景和夜景的完整宣傳影片',
        asset_type: 'video',
        file_size: 52428800,
        status: 'pending_review',
        created_at: '2024-01-15T14:30:00Z'
      }
    ],
    activities: [
      {
        id: 'act_001',
        description: '任務已創建',
        user_name: '台北101',
        created_at: '2024-01-01T09:00:00Z'
      },
      {
        id: 'act_002',
        description: '任務已發布',
        user_name: '台北101',
        created_at: '2024-01-01T10:00:00Z'
      },
      {
        id: 'act_003',
        description: '創作者提交申請',
        user_name: '小明攝影工作室',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 'act_004',
        description: '申請已接受',
        user_name: '台北101',
        created_at: '2024-01-10T15:00:00Z'
      },
      {
        id: 'act_005',
        description: '創作者提交作品',
        user_name: '小明攝影工作室',
        created_at: '2024-01-15T14:30:00Z'
      }
    ],
    ratings: []
  };
}
