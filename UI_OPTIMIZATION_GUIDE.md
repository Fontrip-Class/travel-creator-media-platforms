# 旅遊創作者媒體平台 - UI優化使用說明

## 🎯 優化概述

本次優化主要針對任務階段管理、用戶體驗和角色分流導航進行了全面改進，讓用戶能夠更直觀地了解任務進度，快速執行相關操作。

## 🚀 新增功能

### 1. 任務階段進度列系統

#### 功能特點
- **視覺化進度**: 8個階段的清晰進度指示器
- **互動式設計**: 可點擊的階段圖標，支持階段切換
- **進度百分比**: 實時顯示任務完成進度
- **狀態顏色**: 每個階段都有獨特的顏色和圖標

#### 階段定義
| 階段 | 名稱 | 圖標 | 顏色 | 描述 |
|------|------|------|------|------|
| draft | 草稿 | 📝 | #6B7280 | 任務創建階段 |
| published | 已發布 | 🚀 | #3B82F6 | 任務公開階段 |
| collecting | 徵集中 | 🔍 | #F59E0B | 收集創作者提案 |
| evaluating | 評估中 | 📊 | #8B5CF6 | 評估提案階段 |
| in_progress | 創作中 | 🎨 | #10B981 | 內容創作階段 |
| reviewing | 審核中 | 📋 | #EF4444 | 內容審核階段 |
| publishing | 發布中 | 📡 | #06B6D4 | 內容發布階段 |
| completed | 已完成 | 🏁 | #059669 | 任務完成階段 |

### 2. 智能任務卡片

#### 卡片功能
- **狀態顯示**: 清晰的任務狀態標籤和圖標
- **進度追蹤**: 內嵌進度條顯示完成百分比
- **操作按鈕**: 根據用戶角色和任務階段動態顯示
- **可收合區域**: 進度說明、溝通記錄、里程碑信息

#### 角色特定操作
- **供應商**: 查看提案、評估提案、審核內容
- **創作者**: 立即提案、上傳內容、查看狀態
- **媒體**: 下載素材、發布內容、追蹤效果

### 3. 角色分流導航

#### 首頁設計
- **三大角色選擇**: 供應商、創作者、媒體
- **功能介紹**: 每個角色的主要功能和優勢
- **統計數據**: 平台活躍用戶和完成任務數量
- **快速導航**: 一鍵進入對應角色儀表板

### 4. 角色專屬儀表板

#### 供應商儀表板
- **統計概覽**: 總任務數、進行中任務、總預算、滿意度
- **快速操作**: 發布新任務、查看提案、審核內容、效果追蹤
- **階段統計**: 各階段任務數量分布
- **任務列表**: 按階段篩選的任務卡片
- **進度追蹤**: 整體完成率和關鍵指標

#### 創作者儀表板 (待實現)
- **申請統計**: 總申請數、進行中任務、完成任務
- **推薦任務**: 基於專長的任務推薦
- **作品管理**: 上傳內容、查看反饋

#### 媒體儀表板 (待實現)
- **發布統計**: 總發布數、進行中發布、完成發布
- **素材下載**: 可下載的內容素材
- **效果追蹤**: 發布效果數據分析

## 🛠️ 技術實現

### 後端服務

#### TaskStageService
```php
// 主要功能
- 任務階段轉換管理
- 進度計算和追蹤
- 階段歷史記錄
- 角色特定儀表板數據

// 核心方法
- transitionTask(): 轉換任務階段
- getTaskProgress(): 獲取任務進度
- getTaskDashboard(): 獲取儀表板數據
- getTasksByStage(): 按階段獲取任務
```

#### TaskStageController
```php
// API端點
- GET /api/tasks/{id}/progress - 獲取任務進度
- POST /api/tasks/{id}/transition - 轉換任務階段
- GET /api/dashboard - 獲取儀表板數據
- GET /api/tasks/by-stage - 按階段獲取任務
- GET /api/stages - 獲取所有階段配置
```

#### NotificationService
```php
// 自動通知
- 階段轉換通知
- 截止日期提醒
- 提案評估提醒
- 內容審核提醒
```

### 前端組件

#### TaskProgressBar
```tsx
// 主要屬性
interface TaskProgressBarProps {
  stages: TaskStage[];
  currentStage: string;
  progress: number;
  onStageClick?: (stageId: string) => void;
  showLabels?: boolean;
  compact?: boolean;
}

// 使用示例
<TaskProgressBar
  stages={taskStages}
  currentStage="collecting"
  progress={25}
  onStageClick={handleStageClick}
  showLabels={true}
/>
```

#### TaskCard
```tsx
// 主要屬性
interface TaskCardProps {
  task: Task;
  userRole: "supplier" | "creator" | "media";
  onAction?: (action: string, taskId: string) => void;
  showProgress?: boolean;
  compact?: boolean;
}

// 使用示例
<TaskCard
  task={taskData}
  userRole="supplier"
  onAction={handleTaskAction}
  showProgress={true}
/>
```

## 📱 使用方法

### 1. 訪問角色選擇頁面
```
URL: /role-selection
功能: 選擇用戶角色，進入對應儀表板
```

### 2. 供應商使用流程
```
1. 選擇「旅遊服務供應商」角色
2. 進入供應商儀表板
3. 查看任務統計和進度
4. 使用快速操作按鈕
5. 按階段篩選和管理任務
```

### 3. 創作者使用流程
```
1. 選擇「內容創作者」角色
2. 瀏覽推薦任務
3. 提交創意提案
4. 創作和上傳內容
5. 追蹤任務進度
```

### 4. 媒體使用流程
```
1. 選擇「媒體通路」角色
2. 查看可發布內容
3. 下載高品質素材
4. 多平台發布內容
5. 追蹤發布效果
```

## 🔧 配置說明

### 階段配置自定義
```php
// 在 TaskStageService 中修改 STAGES 常量
const STAGES = [
    'custom_stage' => [
        'name' => '自定義階段',
        'color' => '#FF0000',
        'icon' => '🎯',
        'order' => 10,
        'can_edit' => ['supplier'],
        'next_stages' => ['next_stage']
    ]
];
```

### 通知配置
```php
// 在 NotificationService 中配置通知觸發條件
public function sendStageTransitionNotifications(array $task, string $oldStage, string $newStage): void
{
    // 自定義通知邏輯
    switch ($newStage) {
        case 'custom_stage':
            $this->sendCustomNotification($task);
            break;
    }
}
```

### 前端樣式自定義
```css
/* 自定義階段顏色 */
.task-stage-custom {
    background-color: var(--custom-color);
    color: white;
}

/* 自定義進度條樣式 */
.task-progress-custom {
    background: linear-gradient(to right, var(--start-color), var(--end-color));
}
```

## 📊 數據庫結構

### 新增表
- `task_stage_history`: 任務階段變更歷史
- `task_activities`: 任務活動記錄
- `task_stages`: 任務階段進度
- `task_communications`: 任務溝通記錄
- `task_milestones`: 任務里程碑
- `task_files`: 任務文件管理
- `task_ratings`: 任務評價系統
- `task_notification_settings`: 通知設置

### 視圖和函數
- `task_progress_summary`: 任務進度摘要視圖
- `user_task_stats`: 用戶任務統計視圖
- `get_task_stage_stats()`: 階段統計函數
- `check_task_deadline()`: 截止日期檢查函數

## 🚨 注意事項

### 1. 權限控制
- 階段轉換需要相應權限
- 不同角色只能執行對應操作
- 敏感操作需要二次確認

### 2. 數據一致性
- 階段轉換使用事務處理
- 進度計算自動更新
- 歷史記錄完整保存

### 3. 性能優化
- 大量數據使用分頁
- 緩存常用配置數據
- 異步處理通知發送

## 🔮 未來擴展

### 1. 智能推薦
- 基於用戶行為的任務推薦
- 創作者能力匹配算法
- 供應商需求預測

### 2. 自動化流程
- 智能階段轉換
- 自動截止日期提醒
- 批量任務處理

### 3. 數據分析
- 任務完成率分析
- 用戶行為分析
- 平台效率優化

## 📞 技術支持

如有技術問題或需要進一步優化，請聯繫開發團隊或查看相關文檔。

---

**版本**: v1.0  
**更新日期**: 2024年1月  
**維護團隊**: 旅遊創作者媒體平台開發組
