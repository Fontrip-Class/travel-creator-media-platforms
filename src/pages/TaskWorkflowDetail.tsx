import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskApplicationForm } from '@/components/workflow/TaskApplicationForm';
import { TaskRatingForm } from '@/components/workflow/TaskRatingForm';
import { TaskWorkflowTracker } from '@/components/workflow/TaskWorkflowTracker';
import { WorkSubmissionForm } from '@/components/workflow/WorkSubmissionForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/lib/api';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText,
    MapPin,
    MessageSquare,
    Star,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * 任務工作流程詳情頁面
 * 展示完整的任務流程狀態和操作界面
 */
export default function TaskWorkflowDetail() {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('workflow');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showWorkSubmission, setShowWorkSubmission] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTaskData();
    }
  }, [taskId]);

  const loadTaskData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTask(taskId!);

      if (response.success && response.data) {
        setTask(response.data);
      } else {
        throw new Error(response.message || '載入任務失敗');
      }
    } catch (error: any) {
      console.warn('API調用失敗，使用模擬數據:', error);
      // 使用模擬數據
      setTask({
        id: taskId,
        title: '台北101觀景台宣傳影片',
        description: '製作台北101觀景台宣傳影片，突出台北地標特色和觀景體驗',
        status: 'in_progress',
        content_types: ['video', 'photo'],
        requirements: '需要高品質的影片和照片，突出觀景台的視野和體驗',
        deliverables: ['宣傳影片', '宣傳照片', '社群媒體素材'],
        budget: { min: 15000, max: 25000, type: 'fixed' },
        reward_type: 'money',
        deadline: '2024-02-15',
        location: { lat: 25.0330, lng: 121.5654 },
        supplier_id: 'supplier_001',
        assigned_creator_id: 'creator_001',
        applications_count: 8,
        views_count: 156,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-18T00:00:00Z'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (task) {
      setTask(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleApplicationSubmitted = () => {
    setShowApplicationForm(false);
    loadTaskData();
    toast({
      title: '申請成功',
      description: '您的申請已提交，請等待供應商審核'
    });
  };

  const handleWorkSubmitted = () => {
    setShowWorkSubmission(false);
    loadTaskData();
    toast({
      title: '作品提交成功',
      description: '作品已提交，請等待供應商審核'
    });
  };

  const handleRatingSubmitted = () => {
    setShowRatingForm(false);
    loadTaskData();
  };

  const getRewardTypeLabel = (rewardType: string) => {
    const labels = {
      money: '金錢報酬',
      gift: '贈品報酬',
      experience: '體驗報酬'
    };
    return labels[rewardType as keyof typeof labels] || rewardType;
  };

  const canApplyForTask = () => {
    return user?.role === 'creator' &&
           task?.status === 'open' &&
           task?.supplier_id !== user?.id;
  };

  const canSubmitWork = () => {
    return user?.role === 'creator' &&
           task?.status === 'in_progress' &&
           task?.assigned_creator_id === user?.id;
  };

  const canRateTask = () => {
    return task?.status === 'completed' &&
           (user?.id === task?.supplier_id || user?.id === task?.assigned_creator_id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入任務詳情...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">任務不存在或載入失敗</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${task.title} | 任務詳情`}
        description={task.description}
      />

      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600 mt-1">任務詳情與工作流程</p>
          </div>
        </div>

        {/* 任務基本資訊 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">預算</p>
                  <p className="font-medium">NT$ {task.budget.min.toLocaleString()} - {task.budget.max.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">截止日期</p>
                  <p className="font-medium">{new Date(task.deadline).toLocaleDateString('zh-TW')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">申請數</p>
                  <p className="font-medium">{task.applications_count}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">報酬類型</p>
                  <p className="font-medium">{getRewardTypeLabel(task.reward_type)}</p>
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              {canApplyForTask() && (
                <Button onClick={() => setShowApplicationForm(true)}>
                  申請此任務
                </Button>
              )}

              {canSubmitWork() && (
                <Button onClick={() => setShowWorkSubmission(true)}>
                  提交作品
                </Button>
              )}

              {canRateTask() && (
                <Button variant="outline" onClick={() => setShowRatingForm(true)}>
                  <Star className="h-4 w-4 mr-2" />
                  評分
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 主要內容 */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflow">工作流程</TabsTrigger>
            <TabsTrigger value="details">任務詳情</TabsTrigger>
            <TabsTrigger value="communication">溝通記錄</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="mt-6">
            <TaskWorkflowTracker
              taskId={taskId!}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>任務描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{task.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>具體要求</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{task.requirements}</p>

                  {task.deliverables && task.deliverables.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">交付物件：</h4>
                      <div className="flex flex-wrap gap-2">
                        {task.deliverables.map((deliverable: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {task.location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      拍攝地點
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      緯度: {task.location.lat}, 經度: {task.location.lng}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="communication" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  溝通記錄
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">溝通功能開發中...</p>
                  <p className="text-sm text-gray-400 mt-1">
                    未來將支援即時訊息、檔案分享等功能
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 申請表單對話框 */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <TaskApplicationForm
                task={task}
                onApplicationSubmitted={handleApplicationSubmitted}
                onCancel={() => setShowApplicationForm(false)}
              />
            </div>
          </div>
        )}

        {/* 作品提交表單對話框 */}
        {showWorkSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <WorkSubmissionForm
                taskId={taskId!}
                task={task}
                onWorkSubmitted={handleWorkSubmitted}
                onCancel={() => setShowWorkSubmission(false)}
              />
            </div>
          </div>
        )}

        {/* 評分表單對話框 */}
        {showRatingForm && task && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-lg w-full">
              <TaskRatingForm
                taskId={taskId!}
                targetUser={{
                  id: user?.id === task.supplier_id ? task.assigned_creator_id : task.supplier_id,
                  username: user?.id === task.supplier_id ? '創作者' : '供應商',
                  role: user?.id === task.supplier_id ? 'creator' : 'supplier'
                }}
                onRatingSubmitted={handleRatingSubmitted}
                onCancel={() => setShowRatingForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
