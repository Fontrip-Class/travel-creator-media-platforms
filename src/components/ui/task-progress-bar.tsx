import React from "react";
import { cn } from "@/lib/utils";

export interface TaskStage {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  isCompleted: boolean;
  isCurrent: boolean;
  canInteract: boolean;
}

interface TaskProgressBarProps {
  stages: TaskStage[];
  currentStage: string;
  progress: number;
  className?: string;
  onStageClick?: (stageId: string) => void;
  showLabels?: boolean;
  compact?: boolean;
}

export function TaskProgressBar({
  stages,
  currentStage,
  progress,
  className,
  onStageClick,
  showLabels = true,
  compact = false,
}: TaskProgressBarProps) {
  const sortedStages = stages.sort((a, b) => a.order - b.order);

  return (
    <div className={cn("w-full", className)}>
      {/* 進度條 */}
      <div className="relative mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-2">
          {sortedStages.map((stage, index) => (
            <div
              key={stage.id}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-300",
                stage.isCompleted
                  ? "bg-green-500 border-green-500"
                  : stage.isCurrent
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* 階段指示器 */}
      <div className="flex items-center justify-between">
        {sortedStages.map((stage, index) => (
          <div
            key={stage.id}
            className={cn(
              "flex flex-col items-center transition-all duration-300",
              compact ? "flex-1" : "min-w-0 flex-1"
            )}
          >
            {/* 階段圖標 */}
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
              {stage.icon}
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

// 預設階段配置
export const DEFAULT_TASK_STAGES: TaskStage[] = [
  {
    id: "draft",
    name: "草稿",
    color: "#6B7280",
    icon: "📝",
    order: 1,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "published",
    name: "已發布",
    color: "#3B82F6",
    icon: "🚀",
    order: 2,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "collecting",
    name: "徵集中",
    color: "#F59E0B",
    icon: "🔍",
    order: 3,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "evaluating",
    name: "評估中",
    color: "#8B5CF6",
    icon: "📊",
    order: 4,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "in_progress",
    name: "創作中",
    color: "#10B981",
    icon: "🎨",
    order: 5,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "reviewing",
    name: "審核中",
    color: "#EF4444",
    icon: "📋",
    order: 6,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "publishing",
    name: "發布中",
    color: "#06B6D4",
    icon: "📡",
    order: 7,
    isCompleted: false,
    isCurrent: false,
    canInteract: true,
  },
  {
    id: "completed",
    name: "已完成",
    color: "#059669",
    icon: "🏁",
    order: 8,
    isCompleted: false,
    isCurrent: false,
    canInteract: false,
  },
];

// 工具函數：根據階段狀態創建階段數組
export function createTaskStages(
  currentStage: string,
  completedStages: string[] = []
): TaskStage[] {
  return DEFAULT_TASK_STAGES.map((stage) => ({
    ...stage,
    isCurrent: stage.id === currentStage,
    isCompleted: completedStages.includes(stage.id),
    canInteract: stage.id === currentStage || completedStages.includes(stage.id),
  }));
}

// 工具函數：計算進度百分比
export function calculateProgress(
  currentStage: string,
  completedStages: string[] = []
): number {
  const currentStageData = DEFAULT_TASK_STAGES.find(
    (stage) => stage.id === currentStage
  );
  
  if (!currentStageData) return 0;
  
  const totalStages = DEFAULT_TASK_STAGES.length;
  const completedCount = completedStages.length;
  
  if (currentStageData.id === "completed") return 100;
  
  return Math.round(((currentStageData.order - 1) / (totalStages - 1)) * 100);
}
