export const taskStatusConfig = {
  draft: { label: "草稿", color: "draft" as const },
  open: { label: "公開招募", color: "open" as const },
  review: { label: "審核中", color: "review" as const },
  doing: { label: "進行中", color: "doing" as const },
  done: { label: "已完成", color: "done" as const },
  cancelled: { label: "已取消", color: "cancelled" as const },
  paused: { label: "暫停招募", color: "paused" as const },
  "re-recruiting": { label: "重新招募", color: "re-recruiting" as const },
  expired: { label: "已過期", color: "expired" as const },
  rejected: { label: "申請被拒", color: "rejected" as const },
} as const;

export type TaskStatus = keyof typeof taskStatusConfig;

export function useTaskStatus() {
  const getStatusLabel = (status: TaskStatus) => {
    return taskStatusConfig[status]?.label || status;
  };

  const getStatusColor = (status: TaskStatus) => {
    return taskStatusConfig[status]?.color || "draft";
  };

  const getAvailableActions = (status: TaskStatus) => {
    const actionMap: Record<TaskStatus, string[]> = {
      draft: ["publish", "delete"],
      open: ["pause", "cancel"],
      review: ["cancel"],
      doing: ["cancel"],
      paused: ["resume", "cancel"],
      cancelled: ["re-recruit", "delete"],
      expired: ["re-recruit", "delete"],
      rejected: ["re-recruit", "delete"],
      done: ["re-recruit"],
      "re-recruiting": ["pause", "cancel"],
    };

    return actionMap[status] || [];
  };

  return {
    getStatusLabel,
    getStatusColor,
    getAvailableActions,
    statusConfig: taskStatusConfig,
  };
}