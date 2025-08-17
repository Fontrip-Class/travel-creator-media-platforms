import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { ChevronDown, ChevronRight, Clock, DollarSign, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStage, createTaskStages, calculateProgress } from "./task-progress-bar";

export interface Task {
  id: string;
  title: string;
  summary: string;
  status: string;
  budget: {
    min: number;
    max: number;
    type: string;
  };
  deadline: string;
  location?: string;
  supplier: {
    id: string;
    name: string;
    avatar?: string;
  };
  progress: {
    currentStage: string;
    progressPercentage: number;
    completedStages: string[];
  };
  stats: {
    applications: number;
    views: number;
    daysLeft: number;
  };
}

interface TaskCardProps {
  task: Task;
  userRole: "supplier" | "creator" | "media";
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

  // 根據任務狀態和用戶角色獲取操作按鈕
  const getActionButtons = () => {
    const buttons = [];

    switch (userRole) {
      case "supplier":
        if (task.status === "collecting") {
          buttons.push({
            action: "view_proposals",
            label: "查看提案",
            variant: "default" as const,
            icon: "📋",
          });
        } else if (task.status === "evaluating") {
          buttons.push({
            action: "evaluate_proposals",
            label: "評估提案",
            variant: "default" as const,
            icon: "📊",
          });
        } else if (task.status === "reviewing") {
          buttons.push({
            action: "review_content",
            label: "審核內容",
            variant: "default" as const,
            icon: "✅",
          });
        }
        break;

      case "creator":
        if (task.status === "collecting") {
          buttons.push({
            action: "submit_proposal",
            label: "立即提案",
            variant: "default" as const,
            icon: "📝",
          });
        } else if (task.status === "in_progress") {
          buttons.push({
            action: "upload_content",
            label: "上傳內容",
            variant: "default" as const,
            icon: "📤",
          });
        }
        break;

      case "media":
        if (task.status === "publishing") {
          buttons.push({
            action: "download_assets",
            label: "下載素材",
            variant: "default" as const,
            icon: "⬇️",
          });
          buttons.push({
            action: "publish_content",
            label: "發布內容",
            variant: "outline" as const,
            icon: "📡",
          });
        }
        break;
    }

    // 通用操作
    buttons.push({
      action: "view_details",
      label: "查看詳情",
      variant: "outline" as const,
      icon: "👁️",
    });

    return buttons;
  };

  // 獲取狀態配置
  const getStatusConfig = (status: string) => {
    const configs = {
      draft: { color: "bg-gray-100 text-gray-800", icon: "📝", label: "草稿" },
      published: { color: "bg-blue-100 text-blue-800", icon: "🚀", label: "已發布" },
      collecting: { color: "bg-orange-100 text-orange-800", icon: "🔍", label: "徵集中" },
      evaluating: { color: "bg-purple-100 text-purple-800", icon: "📊", label: "評估中" },
      in_progress: { color: "bg-green-100 text-green-800", icon: "🎨", label: "創作中" },
      reviewing: { color: "bg-red-100 text-red-800", icon: "📋", label: "審核中" },
      publishing: { color: "bg-cyan-100 text-cyan-800", icon: "📡", label: "發布中" },
      completed: { color: "bg-emerald-100 text-emerald-800", icon: "🏁", label: "已完成" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: "❌", label: "已取消" },
    };

    return configs[status as keyof typeof configs] || configs.draft;
  };

  const statusConfig = getStatusConfig(task.status);
  const actionButtons = getActionButtons();
  const stages = createTaskStages(task.progress.currentStage, task.progress.completedStages);

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {task.title}
            </CardTitle>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {task.summary}
            </p>

            {/* 狀態標籤 */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className={statusConfig.color}>
                <span className="mr-1">{statusConfig.icon}</span>
                {statusConfig.label}
              </Badge>
              
              {task.stats.daysLeft > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  剩餘 {task.stats.daysLeft} 天
                </Badge>
              )}
            </div>
          </div>

          {/* 供應商信息 */}
          <div className="flex items-center gap-2 ml-4">
            {task.supplier.avatar ? (
              <img
                src={task.supplier.avatar}
                alt={task.supplier.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <span className="text-sm text-gray-600">{task.supplier.name}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 任務統計信息 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {task.budget.min.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">預算 (NT$)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {task.stats.applications}
            </div>
            <div className="text-xs text-gray-500">提案數</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {task.stats.views}
            </div>
            <div className="text-xs text-gray-500">瀏覽數</div>
          </div>
        </div>

        {/* 進度條 (可選) */}
        {showProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">任務進度</span>
              <span className="text-sm text-gray-500">
                {task.progress.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {actionButtons.map((button) => (
            <Button
              key={button.action}
              variant={button.variant}
              size="sm"
              onClick={() => onAction?.(button.action, task.id)}
              className="flex items-center gap-1"
            >
              <span>{button.icon}</span>
              {button.label}
            </Button>
          ))}
        </div>

        {/* 可收合區域 */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-gray-500 hover:text-gray-700"
            >
              <span>進度說明與溝通</span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3">
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              {/* 進度說明 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">當前階段說明</h4>
                <p className="text-sm text-gray-600">
                  任務目前處於「{statusConfig.label}」階段，
                  {getStageDescription(task.status)}
                </p>
              </div>

              {/* 溝通區域 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">最新溝通</h4>
                <div className="text-sm text-gray-500">
                  暫無溝通記錄
                </div>
              </div>

              {/* 里程碑 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">重要里程碑</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-600">任務發布</span>
                    <span className="text-gray-400 text-xs">已完成</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-600">內容創作</span>
                    <span className="text-gray-400 text-xs">進行中</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// 獲取階段描述
function getStageDescription(status: string): string {
  const descriptions = {
    draft: "您可以編輯任務內容和需求。",
    published: "任務已公開，創作者可以查看和申請。",
    collecting: "正在收集創作者提案，請耐心等待。",
    evaluating: "正在評估收到的提案，將盡快做出選擇。",
    in_progress: "創作者正在進行內容創作，請關注進度。",
    reviewing: "內容創作完成，請及時審核。",
    publishing: "內容已通過審核，正在進行發布。",
    completed: "任務已完成，感謝您的參與！",
    cancelled: "任務已取消，如有疑問請聯繫客服。",
  };

  return descriptions[status as keyof typeof descriptions] || "任務正在進行中。";
}

// 工具函數：格式化預算顯示
export function formatBudget(budget: Task["budget"]): string {
  if (budget.min === budget.max) {
    return `NT$ ${budget.min.toLocaleString()}`;
  }
  return `NT$ ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}`;
}

// 工具函數：計算剩餘天數
export function calculateDaysLeft(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
