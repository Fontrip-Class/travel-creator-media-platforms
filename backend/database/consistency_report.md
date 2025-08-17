# 旅遊平台資料庫字段一致性檢查報告

## 概述
本報告檢查了旅遊平台前後台程式與資料庫schema之間的字段定義一致性，並提供了解決方案。

## 檢查結果摘要

### ✅ 一致的字段
- **用戶角色 (role)**: 前後台都使用 `'supplier', 'creator', 'media', 'admin'`
- **用戶基本字段**: `id`, `username`, `email`, `password_hash`, `first_name`, `last_name`
- **任務基本字段**: `id`, `title`, `description`, `budget_min`, `budget_max`, `deadline`

### ❌ 不一致的字段

#### 1. 任務狀態字段 (tasks.status)
**問題描述**: 前後台對任務狀態的定義不一致

**資料庫schema_v4定義**:
```sql
status VARCHAR(20) DEFAULT 'open' CHECK (
    status IN ('draft', 'published', 'collecting', 'evaluating', 
               'in_progress', 'reviewing', 'publishing', 'completed')
)
```

**前端API期望**:
```typescript
// 前端期望的狀態值
status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
```

**後端TaskService使用**:
```php
// 後端使用 'open' 作為默認狀態
$taskData['status'] = 'open';
```

**解決方案**: 
- 統一使用擴展的狀態值，包含所有狀態
- 更新前端API類型定義
- 確保後端支援所有狀態值

#### 2. 任務表結構不一致
**問題描述**: schema_v4新增了多個任務相關表，但前端API仍使用舊結構

**新增的表**:
- `task_stages` - 任務階段進度
- `task_activities` - 任務活動記錄
- `task_communications` - 任務溝通記錄
- `task_milestones` - 任務里程碑
- `task_files` - 任務文件
- `task_ratings` - 任務評價

**前端API缺失**:
- 任務階段管理API
- 任務活動記錄API
- 任務溝通API
- 任務里程碑API

**解決方案**:
- 更新前端API以支援新的任務管理功能
- 創建對應的API端點和類型定義

#### 3. 地理位置字段類型不一致
**問題描述**: 不同schema版本對地理位置字段的定義不同

**schema_v2/v3**: 使用PostGIS的`POINT`類型
**schema_v4**: 使用PostGIS的`POINT`類型
**前端**: 期望`{lat: number, lng: number}`格式

**解決方案**:
- 統一使用PostGIS的`POINT`類型
- 在API層面處理座標轉換

## 建議的統一Schema

### 任務狀態統一
```sql
-- 建議的任務狀態定義
status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN (
        'draft',           -- 草稿
        'open',            -- 開放申請
        'collecting',      -- 收集中
        'evaluating',      -- 評估中
        'in_progress',     -- 進行中
        'reviewing',       -- 審核中
        'publishing',      -- 發布中
        'completed',       -- 已完成
        'cancelled',       -- 已取消
        'expired'          -- 已過期
    )
)
```

### 前端類型定義更新
```typescript
// 建議的任務狀態類型
export type TaskStatus = 
  | 'draft' 
  | 'open' 
  | 'collecting' 
  | 'evaluating' 
  | 'in_progress' 
  | 'reviewing' 
  | 'publishing' 
  | 'completed' 
  | 'cancelled' 
  | 'expired';

// 建議的任務介面
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  // ... 其他字段
}
```

## 實施計劃

### 第一階段：資料庫統一
1. 使用`init_database.php`腳本創建統一的資料庫結構
2. 遷移現有數據到新結構
3. 驗證所有表結構和約束

### 第二階段：後端API更新
1. 更新TaskService以支援所有任務狀態
2. 創建新的任務管理API端點
3. 更新數據驗證規則

### 第三階段：前端更新
1. 更新TypeScript類型定義
2. 更新API調用以支援新功能
3. 更新UI組件以顯示新狀態

### 第四階段：測試和驗證
1. 單元測試所有API端點
2. 整合測試前後台功能
3. 用戶驗收測試

## 風險評估

### 低風險
- 用戶角色字段統一
- 基本用戶信息字段

### 中風險
- 任務狀態字段擴展
- 新增任務管理表

### 高風險
- 數據遷移過程
- 前端API兼容性

## 建議

1. **立即執行**: 使用`init_database.php`腳本創建統一的資料庫結構
2. **分階段實施**: 按照實施計劃逐步更新前後台程式
3. **充分測試**: 每個階段都要進行充分的測試
4. **備份數據**: 在實施前備份所有現有數據
5. **文檔更新**: 更新API文檔和開發者指南

## 結論

雖然發現了一些字段定義不一致的問題，但這些問題都是可以解決的。通過使用統一的資料庫初始化腳本和分階段的前後台更新，可以確保整個系統的一致性和穩定性。

建議優先執行資料庫初始化腳本，然後按照實施計劃逐步更新前後台程式。
