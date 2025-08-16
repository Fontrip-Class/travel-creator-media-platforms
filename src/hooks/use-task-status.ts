export const taskStatusConfig = {
  draft: { label: "草稿", color: "draft" },
  open: { label: "公開招募", color: "open" },
  review: { label: "審核中", color: "review" },
  doing: { label: "進行中", color: "doing" },
  done: { label: "已完成", color: "done" },
  cancelled: { label: "已取消", color: "cancelled" },
  paused: { label: "暫停招募", color: "paused" },
  "re-recruiting": { label: "重新招募", color: "re-recruiting" },
  expired: { label: "已過期", color: "expired" },
  rejected: { label: "申請被拒", color: "rejected" },
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