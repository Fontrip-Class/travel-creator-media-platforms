import { cn } from '@/lib/utils';
import { Task } from '@/types/database';
import { AlertCircle, CheckCircle, Clock, Download, Edit, Eye, FileText, Star, Trash2, Upload, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';

interface TaskCardProps {
  task: Task;
  userRole?: 'supplier' | 'creator' | 'media' | 'admin';
  className?: string;
  onAction?: (action: string, taskId: string) => void;
  showProgress?: boolean;
  compact?: boolean;
}

export function TaskCard({
  task,
  userRole,
  className,
  onAction,
  showProgress = true,
  compact = false,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 根據任務狀態和用戶角色生成操作按鈕
  const getActionButtons = () => {
    const buttons = [];

    switch (userRole) {
      case "supplier":
        if (task.status === "collecting") {
          buttons.push({
            action: "view_proposals",
            label: "查看申請",
            variant: "default" as const,
            icon: <Eye className="w-4 h-4" />,
          });
        } else if (task.status === "evaluating") {
          buttons.push({
            action: "evaluate_proposals",
            label: "評估申請",
            variant: "default" as const,
            icon: <Star className="w-4 h-4" />,
          });
        } else if (task.status === "reviewing") {
          buttons.push({
            action: "review_content",
            label: "審核內容",
            variant: "default" as const,
            icon: <FileText className="w-4 h-4" />,
          });
        }
        break;

      case "creator":
        if (task.status === "collecting") {
          buttons.push({
            action: "submit_proposal",
            label: "立即申請",
            variant: "default" as const,
            icon: <Users className="w-4 h-4" />,
          });
        } else if (task.status === "in_progress") {
          buttons.push({
            action: "upload_content",
            label: "上傳內容",
            variant: "default" as const,
            icon: <Upload className="w-4 h-4" />,
          });
        }
        break;

      case "media":
        if (task.status === "publishing") {
          buttons.push({
            action: "download_assets",
            label: "下載素材",
            variant: "default" as const,
            icon: <Download className="w-4 h-4" />,
          });
          buttons.push({
            action: "publish_content",
            label: "發布內容",
            variant: "outline" as const,
            icon: <Upload className="w-4 h-4" />,
          });
        }
        break;
    }

    // 通用按鈕
    buttons.push({
      action: "view_details",
      label: "查看詳情",
      variant: "outline" as const,
      icon: <Eye className="w-4 h-4" />,
    });

    return buttons;
  };

  // 獲取狀態配置
  const getStatusConfig = (status: string) => {
    const configs = {
      draft: { color: "bg-gray-100 text-gray-800", icon: <FileText className="w-4 h-4" />, label: "草稿" },
      published: { color: "bg-blue-100 text-blue-800", icon: <Eye className="w-4 h-4" />, label: "已發布" },
      collecting: { color: "bg-orange-100 text-orange-800", icon: <Users className="w-4 h-4" />, label: "徵集申請" },
      evaluating: { color: "bg-purple-100 text-purple-800", icon: <Star className="w-4 h-4" />, label: "評估申請" },
      in_progress: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" />, label: "進行中" },
      reviewing: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" />, label: "審核中" },
      publishing: { color: "bg-cyan-100 text-cyan-800", icon: <Upload className="w-4 h-4" />, label: "發布中" },
      completed: { color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="w-4 h-4" />, label: "已完成" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: <Clock className="w-4 h-4" />, label: "已取消" },
    };

    return configs[status as keyof typeof configs] || configs.draft;
  };

  const statusConfig = getStatusConfig(task.status);
  const actionButtons = getActionButtons();

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusConfig.color}>
                <span className="mr-1">{statusConfig.icon}</span>
                {statusConfig.label}
              </Badge>
              {task.reward_type === 'gift' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  贈品報酬
                </Badge>
              )}
            </div>
          </div>
          {userRole === 'supplier' && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAction?.('edit', task.id)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAction?.('delete', task.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 任務描述 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">任務描述</h4>
          <p className="text-sm text-gray-600 line-clamp-3">
            {task.description}
          </p>
        </div>

        {/* 任務進度 */}
        {showProgress && task.progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">任務進度</span>
              <span className="text-gray-500">{task.progress.completion_percentage}%</span>
            </div>
            <Progress value={task.progress.completion_percentage} className="h-2" />
            <div className="text-xs text-gray-500">
              當前階段：{task.progress.current_step}
            </div>
          </div>
        )}

        {/* 供應商信息 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">供應商</span>
          <span className="text-gray-700 font-medium">供應商名稱</span>
        </div>

        {/* 統計信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{task.applications_count}</div>
            <div className="text-xs text-gray-500">申請數量</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{task.views_count}</div>
            <div className="text-xs text-gray-500">瀏覽次數</div>
          </div>
        </div>

        {/* 任務進度 */}
        {showProgress && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">任務進度</span>
            <div className="text-sm text-gray-600">
              任務目前處於{statusConfig.label}階段
            </div>
          </div>
        )}

        {/* 溝通記錄 */}
        {isExpanded && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">溝通記錄</h4>
            <div className="text-sm text-gray-600">
              暫無溝通記錄
            </div>
          </div>
        )}

        {/* 里程碑信息 */}
        {isExpanded && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">里程碑信息</h4>
            <div className="text-sm text-gray-600">
              <span className="text-gray-600">任務創建</span>
              <span className="text-gray-400 text-xs">已完成</span>
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex flex-wrap gap-2 pt-2">
          {actionButtons.map((button, index) => (
            <Button
              key={index}
              size="sm"
              variant={button.variant}
              onClick={() => onAction?.(button.action, task.id)}
              className="flex items-center gap-1"
            >
              {button.icon}
              {button.label}
            </Button>
          ))}
        </div>

        {/* 展開/收起按鈕 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs"
        >
          {isExpanded ? '收起詳情' : '展開詳情'}
        </Button>
      </CardContent>
    </Card>
  );
}

// 任務階段描述
const getStageDescription = (status: string) => {
  const descriptions = {
    draft: "您可以編輯任務內容和要求",
    published: "任務已發布，創作者可以查看和申請",
    collecting: "正在收集創作者申請，請耐心等待",
    evaluating: "正在評估收到的申請，將盡快做出選擇",
    in_progress: "內容創作正在進行中，請關注進度",
    reviewing: "內容創作完成，正在審核中",
    publishing: "內容已通過審核，正在進行發布",
    completed: "任務已完成，所有內容已發布完成",
    cancelled: "任務已取消，如有疑問請聯繫客服",
  };

  return descriptions[status as keyof typeof descriptions] || "未知狀態";
};

// 工具函數：格式化進度顯示
const formatProgress = (stages: any[]) => {
  const completedCount = stages.filter(stage => stage.isCompleted).length;
  const totalCount = stages.length;
  return `${completedCount}/${totalCount}`;
};

// 工具函數：計算剩餘天數
const calculateRemainingDays = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
