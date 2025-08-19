# 用戶管理與任務管理整合指南

## 📋 概述

本指南描述了用戶管理與任務管理系統的整合優化，包括新增的服務、API端點、權限系統和前端整合。

## 🏗️ 架構變更

### 新增的後端服務

1. **UserService** (`backend/src/Services/UserService.php`)
   - 統一的用戶管理邏輯
   - 支援用戶CRUD操作
   - 整合業務實體關聯
   - 用戶統計和分析

2. **PermissionService** (`backend/src/Services/PermissionService.php`)
   - 統一的權限檢查機制
   - 支援細粒度權限控制
   - 角色基礎權限管理
   - 資源級別權限檢查

3. **NotificationService** (`backend/src/Services/NotificationService.php`)
   - 系統通知管理
   - 支援批量通知
   - 通知優先級管理
   - 自動清理機制

### 優化的控制器

1. **UserController** (`backend/src/Controllers/UserController.php`)
   - 專用的用戶管理控制器
   - 整合權限檢查
   - 支援用戶統計和詳情

2. **TaskController** (優化版)
   - 新增角色專用儀表板端點
   - 整合用戶權限檢查
   - 優化查詢效能

### 前端整合

1. **useUserTaskManagement Hook** (`src/hooks/use-user-task-management.ts`)
   - 統一的用戶任務管理邏輯
   - 根據角色提供不同功能
   - 自動錯誤處理和模擬數據後備

2. **PermissionGuard 組件** (`src/components/auth/PermissionGuard.tsx`)
   - 客戶端權限檢查
   - 條件式組件渲染
   - 友好的權限錯誤提示

## 🚀 部署步驟

### 1. 後端部署

```bash
# 1. 更新依賴
cd backend
composer install

# 2. 初始化資料庫
php database/init_database_fixed.php

# 3. 執行查詢優化
# 如果使用 MySQL/PostgreSQL，執行優化腳本
mysql -u username -p database_name < database/optimize_queries.sql

# 4. 啟動服務
php -S localhost:8000 -t public
```

### 2. 前端部署

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發服務
npm run dev

# 3. 建置生產版本
npm run build
```

### 3. 整合測試

```bash
# 執行整合測試
node test_user_task_integration.js
```

## 📝 API 端點變更

### 新增的用戶管理端點

```
GET    /api/users                    # 獲取用戶列表（管理員）
POST   /api/users                    # 創建用戶（管理員）
GET    /api/users/{id}               # 獲取用戶詳情
PUT    /api/users/{id}               # 更新用戶資料
DELETE /api/users/{id}               # 刪除用戶（管理員）
POST   /api/users/{id}/suspend       # 暫停用戶（管理員）
POST   /api/users/{id}/activate      # 啟用用戶（管理員）
GET    /api/users/{id}/stats         # 獲取用戶統計
GET    /api/users/{id}/permissions   # 獲取用戶權限
```

### 新增的角色專用儀表板端點

```
# 供應商
GET    /api/supplier/dashboard       # 供應商儀表板
GET    /api/supplier/tasks           # 供應商任務列表
GET    /api/supplier/stats           # 供應商統計
GET    /api/supplier/analytics       # 供應商分析
GET    /api/supplier/notifications   # 供應商通知

# 創作者
GET    /api/creator/dashboard        # 創作者儀表板
GET    /api/creator/tasks            # 可申請任務
GET    /api/creator/applications     # 申請記錄
GET    /api/creator/stats            # 創作者統計
GET    /api/creator/recommendations  # 任務推薦

# 媒體
GET    /api/media/dashboard          # 媒體儀表板
GET    /api/media/assets             # 媒體資源
GET    /api/media/publications       # 發布記錄
GET    /api/media/stats              # 媒體統計
```

## 🔧 使用方式

### 1. 前端組件使用

```tsx
import { useUserTaskManagement } from '@/hooks/use-user-task-management';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function MyComponent() {
  const {
    isLoading,
    dashboardStats,
    tasks,
    loadDashboardData,
    createTask
  } = useUserTaskManagement();

  return (
    <div>
      {/* 權限控制的內容 */}
      <PermissionGuard resource="task" action="create">
        <Button onClick={() => createTask(taskData)}>
          創建任務
        </Button>
      </PermissionGuard>

      {/* 儀表板統計 */}
      {dashboardStats && (
        <div>總任務數: {dashboardStats.basic?.total_tasks}</div>
      )}
    </div>
  );
}
```

### 2. 後端服務使用

```php
// 在控制器中使用新的服務
class MyController {
    public function __construct(
        private UserService $userService,
        private PermissionService $permissionService,
        private TaskService $taskService
    ) {}

    public function someAction(Request $request, Response $response): Response {
        $userId = $request->getAttribute('user_id');

        // 權限檢查
        if (!$this->permissionService->hasPermission($userId, 'task', 'create')) {
            return $this->apiResponse->forbidden($response, '無權限');
        }

        // 獲取用戶統計
        $stats = $this->userService->getUserStats($userId);

        return $this->apiResponse->success($response, $stats);
    }
}
```

## 🎯 效能優化

### 資料庫優化
- ✅ 新增多個複合索引
- ✅ 創建視圖簡化複雜查詢
- ✅ 添加觸發器自動更新統計
- ✅ 儲存程序提升查詢效能

### API 優化
- ✅ 統一的響應格式
- ✅ 分頁支援
- ✅ 錯誤處理機制
- ✅ 權限檢查中間件

### 前端優化
- ✅ 統一的狀態管理
- ✅ 自動錯誤處理
- ✅ 模擬數據後備機制
- ✅ 權限基礎的UI控制

## 🧪 測試指南

### 執行整合測試

```bash
# 1. 確保後端服務運行
cd backend
php -S localhost:8000 -t public

# 2. 執行測試腳本
node test_user_task_integration.js

# 3. 檢查測試結果
# 成功率應該達到 80% 以上
```

### 手動測試檢查點

1. **用戶管理**
   - [ ] 管理員可以查看用戶列表
   - [ ] 管理員可以創建/編輯/刪除用戶
   - [ ] 用戶可以查看自己的資料
   - [ ] 權限檢查正常運作

2. **任務管理**
   - [ ] 供應商可以創建和管理任務
   - [ ] 創作者可以查看和申請任務
   - [ ] 媒體用戶可以管理媒體資源
   - [ ] 任務狀態流程正常

3. **儀表板整合**
   - [ ] 各角色儀表板顯示正確數據
   - [ ] 統計數據準確
   - [ ] 實時數據更新
   - [ ] 錯誤處理機制有效

## 🔍 故障排除

### 常見問題

1. **API 調用失敗**
   - 檢查後端服務是否啟動
   - 確認資料庫連接正常
   - 檢查認證令牌是否有效

2. **權限錯誤**
   - 確認用戶角色設置正確
   - 檢查權限配置
   - 驗證業務實體關聯

3. **數據不一致**
   - 執行資料庫初始化腳本
   - 檢查索引是否創建成功
   - 驗證觸發器運作正常

### 日誌檢查

```bash
# 後端錯誤日誌
tail -f backend/logs/api_errors.log
tail -f backend/logs/database.log

# 系統錯誤日誌
tail -f backend/logs/detailed_errors.log
```

## 📈 後續發展

### 短期目標
- [ ] 完成所有 API 端點實作
- [ ] 添加單元測試覆蓋
- [ ] 優化前端載入效能
- [ ] 完善錯誤處理機制

### 中期目標
- [ ] 實作即時通知系統
- [ ] 添加快取機制
- [ ] 實作檔案上傳功能
- [ ] 添加數據分析功能

### 長期目標
- [ ] 微服務架構遷移
- [ ] 實作搜尋引擎整合
- [ ] 添加機器學習推薦
- [ ] 實作多語言支援

---

**維護者**: 開發團隊
**最後更新**: 2024年1月
**版本**: 2.0.0
