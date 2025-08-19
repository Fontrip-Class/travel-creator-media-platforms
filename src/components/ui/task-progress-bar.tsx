import { cn } from '@/lib/utils';
import { Check, Clock, Eye, FileText, Flag, Star, Target, Users, Zap } from 'lucide-react';
import React from 'react';

export interface TaskStage {
  id: string;
  name: string;
  color: string;
  icon: string | React.ReactNode;
  order: number;
  isCompleted: boolean;
  isCurrent: boolean;
  canInteract: boolean;
  description?: string;
}

interface TaskProgressBarProps {
  stages: TaskStage[];
  progress: number;
  compact?: boolean;
  showLabels?: boolean;
  onStageClick?: (stageId: string) => void;
  className?: string;
}

// 圖標映射
const iconMap: Record<string, React.ReactNode> = {
  draft: <FileText className="w-5 h-5" />,
  published: <Eye className="w-5 h-5" />,
  collecting: <Users className="w-5 h-5" />,
  evaluating: <Star className="w-5 h-5" />,
  in_progress: <Zap className="w-5 h-5" />,
  reviewing: <Target className="w-5 h-5" />,
  publishing: <Flag className="w-5 h-5" />,
  completed: <Check className="w-5 h-5" />,
  cancelled: <Clock className="w-5 h-5" />,
};

export function TaskProgressBar({
  stages,
  progress,
  compact = false,
  showLabels = true,
  onStageClick,
  className = ''
}: TaskProgressBarProps) {
  // 按順序排序階段
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("relative", className)}>
      {/* 進度條背景 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 階段顯示器 */}
      <div className="flex items-center justify-between">
        {sortedStages.map((stage, index) => (
          <div
            key={stage.id}
            className={cn(
              "flex flex-col items-center transition-all duration-300",
              compact ? "flex-1" : "min-w-0 flex-1"
            )}
          >
            {/* 階段按鈕 */}
            <button
              onClick={() => onStageClick?.(stage.id)}
              disabled={!stage.canInteract}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-300 mb-2",
                stage.isCompleted
                  ? "bg-green-100 text-green-600 border-2 border-green-500"
                  : stage.isCurrent
                  ? "bg-blue-100 text-blue-600 border-2 border-blue-500 shadow-lg scale-110"
                  : "bg-gray-100 text-gray-400 border-2 border-gray-300",
                stage.canInteract && !stage.isCurrent
                  ? "hover:bg-gray-200 hover:text-gray-600 cursor-pointer"
                  : "cursor-default",
                !stage.canInteract && "opacity-50 cursor-not-allowed"
              )}
            >
              {typeof stage.icon === 'string' ? iconMap[stage.icon] || stage.icon : stage.icon}
            </button>

            {/* 階段標籤 */}
            {showLabels && (
              <div className="text-center">
                <div
                  className={cn(
                    "text-xs font-medium mb-1",
                    stage.isCompleted
                      ? "text-green-600"
                      : stage.isCurrent
                      ? "text-blue-600"
                      : "text-gray-500"
                  )}
                >
                  {stage.name}
                </div>
                {stage.isCurrent && (
                  <div className="text-xs text-blue-500 font-medium">
                    進行中
                  </div>
                )}
              </div>
            )}

            {/* 連接線 */}
            {index < sortedStages.length - 1 && (
              <div
                className={cn(
                  "absolute h-0.5 transition-all duration-300",
                  stage.isCompleted
                    ? "bg-green-500"
                    : "bg-gray-300",
                  compact ? "w-8" : "w-16"
                )}
                style={{
                  left: `calc(${((index + 1) / sortedStages.length) * 100}% - 2rem)`,
                  top: "2.5rem",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 進度百分比 */}
      <div className="text-center mt-4">
        <div className="text-2xl font-bold text-blue-600">{progress}%</div>
        <div className="text-sm text-gray-500">任務完成進度</div>
      </div>
    </div>
  );
}

// 預設階段設置
export const DEFAULT_TASK_STAGES: TaskStage[] = [
  {
    id: "draft",
    name: "草稿",
    color: "#6B7280",
    icon: "draft",
    order: 1,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "published",
    name: "已發布",
    color: "#3B82F6",
    icon: "published",
    order: 2,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "collecting",
    name: "徵集申請",
    color: "#F59E0B",
    icon: "collecting",
    order: 3,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "evaluating",
    name: "評估申請",
    color: "#8B5CF6",
    icon: "evaluating",
    order: 4,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "in_progress",
    name: "進行中",
    color: "#10B981",
    icon: "in_progress",
    order: 5,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "reviewing",
    name: "審核中",
    color: "#EF4444",
    icon: "reviewing",
    order: 6,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "publishing",
    name: "發布中",
    color: "#06B6D4",
    icon: "publishing",
    order: 7,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "completed",
    name: "已完成",
    color: "#059669",
    icon: "completed",
    order: 8,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "cancelled",
    name: "已取消",
    color: "#6B7280",
    icon: "cancelled",
    order: 9,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
];

// 工具函數：根據階段創建階段數組
export function createTaskStages(
  currentStage: string,
  completedStages: string[] = []
): TaskStage[] {
  return DEFAULT_TASK_STAGES.map(stage => ({
    ...stage,
    isCompleted: completedStages.includes(stage.id),
    isCurrent: stage.id === currentStage,
    canInteract: stage.order <= DEFAULT_TASK_STAGES.find(s => s.id === currentStage)?.order || 1,
  }));
}

// 工具函數：格式化進度顯示
export function formatProgress(stages: TaskStage[]): string {
  const completedCount = stages.filter(stage => stage.isCompleted).length;
  const totalCount = stages.length;
  return `${completedCount}/${totalCount}`;
}

// 工具函數：計算剩餘天數
export function calculateRemainingDays(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
