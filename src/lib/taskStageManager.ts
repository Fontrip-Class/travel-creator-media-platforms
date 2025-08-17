/**
 * 任務階段管理器
 * 負責驗證和管理任務階段的轉換邏輯
 */

export interface TaskStage {
  id: string;
  name: string;
  order: number;
  canEdit: string[];
  canTransitionTo: string[];
  requiredFields: string[];
  estimatedDuration: string;
}

export interface StageTransition {
  from: string;
  to: string;
  reason: string;
  trigger: string;
  allowed: boolean;
  validationMessage?: string;
}

// 任務階段定義
export const taskStages: Record<string, TaskStage> = {
  draft: { 
    id: 'draft',
    name: '草稿', 
    order: 1, 
    canEdit: ['supplier'],
    canTransitionTo: ['published', 'cancelled'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location'],
    estimatedDuration: '1-2天'
  },
  published: { 
    id: 'published',
    name: '已發布', 
    order: 2, 
    canEdit: ['supplier'],
    canTransitionTo: ['collecting', 'draft', 'cancelled'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: '1-3天'
  },
  collecting: { 
    id: 'collecting',
    name: '徵集中', 
    order: 3, 
    canEdit: ['supplier'],
    canTransitionTo: ['evaluating', 'draft', 'cancelled'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: '7-14天'
  },
  evaluating: { 
    id: 'evaluating',
    name: '評估中', 
    order: 4, 
    canEdit: ['supplier'],
    canTransitionTo: ['in_progress', 'collecting', 'draft', 'cancelled'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: '3-5天'
  },
  in_progress: { 
    id: 'in_progress',
    name: '創作中', 
    order: 5, 
    canEdit: ['creator', 'supplier'],
    canTransitionTo: ['reviewing', 'evaluating', 'draft', 'cancelled'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: '14-30天'
  },
  reviewing: { 
    id: 'reviewing',
    name: '審核中', 
    order: 6, 
    canEdit: ['supplier'],
    canTransitionTo: ['publishing', 'in_progress', 'evaluating', 'draft', 'cancelled'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: '2-3天'
  },
  publishing: { 
    id: 'publishing',
    name: '發布中', 
    order: 7, 
    canEdit: ['media', 'supplier'],
    canTransitionTo: ['completed', 'reviewing', 'evaluating', 'draft', 'cancelled'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: '1-2天'
  },
  completed: { 
    id: 'completed',
    name: '已完成', 
    order: 8, 
    canEdit: ['supplier'],
    canTransitionTo: ['archived'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: '持續'
  },
  cancelled: {
    id: 'cancelled',
    name: '已取消',
    order: 9,
    canEdit: ['supplier'],
    canTransitionTo: ['draft'],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location'],
    estimatedDuration: 'N/A'
  },
  archived: {
    id: 'archived',
    name: '已歸檔',
    order: 10,
    canEdit: ['supplier'],
    canTransitionTo: [],
    requiredFields: ['title', 'summary', 'description', 'budget', 'deadline', 'location', 'contentTypes'],
    estimatedDuration: 'N/A'
  }
};

/**
 * 驗證階段轉換是否有效
 */
export function validateStageTransition(
  fromStage: string, 
  toStage: string, 
  userRole: string,
  taskData?: any
): StageTransition {
  const from = taskStages[fromStage];
  const to = taskStages[toStage];
  
  if (!from || !to) {
    return {
      from: fromStage,
      to: toStage,
      reason: '無效的階段',
      trigger: 'system',
      allowed: false,
      validationMessage: '指定的階段不存在'
    };
  }

  // 檢查用戶是否有權限進行此轉換
  if (!from.canEdit.includes(userRole)) {
    return {
      from: fromStage,
      to: toStage,
      reason: '權限不足',
      trigger: userRole,
      allowed: false,
      validationMessage: `用戶角色 ${userRole} 無法從 ${from.name} 階段轉換`
    };
  }

  // 檢查目標階段是否在允許的轉換列表中
  if (!from.canTransitionTo.includes(toStage)) {
    return {
      from: fromStage,
      to: toStage,
      reason: '不允許的階段轉換',
      trigger: userRole,
      allowed: false,
      validationMessage: `不允許從 ${from.name} 轉換到 ${to.name}`
    };
  }

  // 檢查是否跳過中間階段（業務邏輯驗證）
  const isSkippingStages = Math.abs(to.order - from.order) > 1;
  if (isSkippingStages && !isValidStageSkip(fromStage, toStage, userRole, taskData)) {
    return {
      from: fromStage,
      to: toStage,
      reason: '跳過中間階段需要特殊權限或條件',
      trigger: userRole,
      allowed: false,
      validationMessage: `從 ${from.name} 跳過到 ${to.name} 需要管理員權限或特殊條件`
    };
  }

  // 檢查反向轉換（業務邏輯驗證）
  if (to.order < from.order && !isValidReverseTransition(fromStage, toStage, userRole, taskData)) {
    return {
      from: fromStage,
      to: toStage,
      reason: '反向階段轉換需要特殊權限或條件',
      trigger: userRole,
      allowed: false,
      validationMessage: `從 ${from.name} 返回到 ${to.name} 需要管理員權限或特殊條件`
    };
  }

  // 檢查必填字段
  if (taskData && !validateRequiredFields(toStage, taskData)) {
    return {
      from: fromStage,
      to: toStage,
      reason: '必填字段不完整',
      trigger: userRole,
      allowed: false,
      validationMessage: `轉換到 ${to.name} 階段需要完成所有必填字段`
    };
  }

  return {
    from: fromStage,
    to: toStage,
    reason: '階段轉換驗證通過',
    trigger: userRole,
    allowed: true
  };
}

/**
 * 驗證跳過中間階段是否有效
 */
function isValidStageSkip(
  fromStage: string, 
  toStage: string, 
  userRole: string, 
  taskData?: any
): boolean {
  // 管理員可以跳過階段
  if (userRole === 'admin') {
    return true;
  }

  // 特殊情況：從草稿直接到創作中（緊急任務）
  if (fromStage === 'draft' && toStage === 'in_progress') {
    return taskData?.isEmergency === true && userRole === 'supplier';
  }

  // 特殊情況：從草稿直接到發布中（預先審核的內容）
  if (fromStage === 'draft' && toStage === 'publishing') {
    return taskData?.isPreApproved === true && userRole === 'supplier';
  }

  return false;
}

/**
 * 驗證反向階段轉換是否有效
 */
function isValidReverseTransition(
  fromStage: string, 
  toStage: string, 
  userRole: string, 
  taskData?: any
): boolean {
  // 管理員可以進行反向轉換
  if (userRole === 'admin') {
    return true;
  }

  // 特殊情況：從創作中返回到評估中（內容需要重新評估）
  if (fromStage === 'in_progress' && toStage === 'evaluating') {
    return taskData?.needsReevaluation === true && userRole === 'supplier';
  }

  // 特殊情況：從審核中返回到創作中（內容需要修改）
  if (fromStage === 'reviewing' && toStage === 'in_progress') {
    return taskData?.needsRevision === true && userRole === 'supplier';
  }

  // 特殊情況：從發布中返回到審核中（發布失敗）
  if (fromStage === 'publishing' && toStage === 'reviewing') {
    return taskData?.publishFailed === true && userRole === 'media';
  }

  return false;
}

/**
 * 驗證必填字段
 */
function validateRequiredFields(stage: string, taskData: any): boolean {
  const stageConfig = taskStages[stage];
  if (!stageConfig) return false;

  for (const field of stageConfig.requiredFields) {
    if (!taskData[field] || taskData[field] === '') {
      return false;
    }
  }

  return true;
}

/**
 * 獲取階段轉換建議
 */
export function getStageTransitionSuggestions(
  currentStage: string, 
  userRole: string
): string[] {
  const stage = taskStages[currentStage];
  if (!stage) return [];

  return stage.canTransitionTo.filter(targetStage => {
    const transition = validateStageTransition(currentStage, targetStage, userRole);
    return transition.allowed;
  });
}

/**
 * 檢查階段轉換是否需要特殊權限
 */
export function requiresSpecialPermission(
  fromStage: string, 
  toStage: string
): boolean {
  const from = taskStages[fromStage];
  const to = taskStages[toStage];
  
  if (!from || !to) return false;
  
  // 跳過階段或反向轉換需要特殊權限
  return Math.abs(to.order - from.order) > 1 || to.order < from.order;
}
