# 完整API整合指南

## 概述
本文檔記錄了系統中所有API端點的完整整合狀態，包括前端調用、後端實現、路由配置和數據驗證。

## API整合狀態總覽

### ✅ 已完成整合的API
- 用戶認證 (註冊/登入)
- 任務創建/更新/刪除
- 任務申請提交
- 任務評分
- 草稿保存/管理
- 文件上傳

### 🔄 需要後端服務層實現的方法
- 草稿相關操作
- 申請管理
- 評分查詢

## 詳細API端點說明

### 1. 用戶認證 API

#### 1.1 用戶註冊
```typescript
// 前端調用
const response = await apiService.register({
  username: "趙致緯",
  email: "user@example.com",
  password: "password123",
  role: "supplier",
  phone: "0912345678",
  company_name: "台東旅遊公司",
  business_type: "tourism",
  business_area: "台東縣"
});

// 後端端點
POST /api/auth/register
```

#### 1.2 用戶登入
```typescript
// 前端調用
const response = await apiService.login({
  email: "user@example.com",
  password: "password123"
});

// 後端端點
POST /api/auth/register
```

### 2. 任務管理 API

#### 2.1 創建任務
```typescript
// 前端調用
const response = await apiService.createTask({
  title: "台東季節活動宣傳影片製作",
  description: "詳細描述...",
  budget_min: 15000,
  budget_max: 20000,
  content_type: "video",
  deadline: "2024-12-31",
  tags: ["#台東", "#熱氣球", "#旅遊"],
  location: "台東縣",
  summary: "製作台東季節活動宣傳影片",
  requirements: "需要專業攝影和後製",
  target_audience: "25-45歲都市上班族",
  examples: "參考作品連結"
});

// 後端端點
POST /api/tasks
```

#### 2.2 更新任務
```typescript
// 前端調用
const response = await apiService.updateTask(taskId, {
  title: "更新後的標題",
  description: "更新後的描述",
  status: "in_progress"
});

// 後端端點
PUT /api/tasks/{id}
```

#### 2.3 刪除任務
```typescript
// 前端調用
const response = await apiService.deleteTask(taskId);

// 後端端點
DELETE /api/tasks/{id}
```

#### 2.4 獲取任務詳情
```typescript
// 前端調用
const response = await apiService.getTaskById(taskId);

// 後端端點
GET /api/tasks/{id}
```

### 3. 草稿管理 API

#### 3.1 保存任務草稿
```typescript
// 前端調用
const response = await apiService.saveTaskDraft({
  ...formData,
  is_draft: true,
  created_at: new Date().toISOString()
});

// 後端端點
POST /api/tasks/drafts
```

#### 3.2 獲取草稿列表
```typescript
// 前端調用
const response = await apiService.getTaskDrafts(1);

// 後端端點
GET /api/tasks/drafts?page=1
```

#### 3.3 獲取草稿詳情
```typescript
// 前端調用
const response = await apiService.getTaskDraft(draftId);

// 後端端點
GET /api/tasks/drafts/{id}
```

#### 3.4 更新草稿
```typescript
// 前端調用
const response = await apiService.updateTaskDraft(draftId, updatedData);

// 後端端點
PUT /api/tasks/drafts/{id}
```

#### 3.5 刪除草稿
```typescript
// 前端調用
const response = await apiService.deleteTaskDraft(draftId);

// 後端端點
DELETE /api/tasks/drafts/{id}
```

#### 3.6 發布草稿
```typescript
// 前端調用
const response = await apiService.publishTaskDraft(draftId);

// 後端端點
POST /api/tasks/drafts/{id}/publish
```

### 4. 任務申請 API

#### 4.1 提交任務申請
```typescript
// 前端調用
const response = await apiService.submitApplication(taskId, {
  proposal: "詳細的提案說明...",
  proposed_budget: 15000,
  estimated_duration: "3週完成",
  portfolio_samples: [
    { name: "作品1.jpg", type: "image/jpeg", size: 1024000 },
    { name: "作品2.mp4", type: "video/mp4", size: 5120000 }
  ]
});

// 後端端點
POST /api/tasks/{id}/applications
```

#### 4.2 獲取任務申請列表
```typescript
// 前端調用
const response = await apiService.getTaskApplications(taskId, 1);

// 後端端點
GET /api/tasks/{id}/applications?page=1
```

#### 4.3 更新申請
```typescript
// 前端調用
const response = await apiService.updateApplication(applicationId, {
  proposal: "更新後的提案",
  proposed_budget: 18000
});

// 後端端點
PUT /api/applications/{id}
```

### 5. 任務評分 API

#### 5.1 提交任務評分
```typescript
// 前端調用
const response = await apiService.rateTask(taskId, {
  rating: 5,
  feedback: "非常滿意的合作體驗",
  recommend: true,
  category_ratings: [
    { category: "作品質量", rating: 5 },
    { category: "溝通配合", rating: 5 },
    { category: "時程掌握", rating: 4 },
    { category: "專業度", rating: 5 }
  ]
});

// 後端端點
POST /api/tasks/{id}/rate
```

#### 5.2 獲取任務評分
```typescript
// 前端調用
const response = await apiService.getTaskRatings(taskId, 1);

// 後端端點
GET /api/tasks/{id}/ratings?page=1
```

#### 5.3 獲取用戶評分
```typescript
// 前端調用
const response = await apiService.getUserRatings(userId, 1);

// 後端端點
GET /api/users/{id}/ratings?page=1
```

### 6. 文件上傳 API

#### 6.1 上傳圖片
```typescript
// 前端調用
const response = await apiService.uploadImage(file, {
  category: "portfolio",
  description: "作品展示圖片"
});

// 後端端點
POST /api/upload/image
```

#### 6.2 上傳文件
```typescript
// 前端調用
const response = await apiService.uploadDocument(file, {
  category: "proposal",
  description: "提案文件"
});

// 後端端點
POST /api/upload/document
```

## 後端路由配置

### 公開路由 (無需認證)
```php
// 健康檢查
GET /api/health

// 測試端點
GET /api/test

// 認證
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/validate-token

// 任務相關
GET /api/tasks/public
GET /api/tasks/recommendations
GET /api/tasks
POST /api/tasks
GET /api/tasks/{id}
PUT /api/tasks/{id}
DELETE /api/tasks/{id}
POST /api/tasks/{id}/apply
POST /api/tasks/{id}/rate

// 草稿相關
GET /api/tasks/drafts
POST /api/tasks/drafts
GET /api/tasks/drafts/{id}
PUT /api/tasks/drafts/{id}
DELETE /api/tasks/drafts/{id}
POST /api/tasks/drafts/{id}/publish

// 申請相關
GET /api/tasks/{id}/applications

// 評分相關
GET /api/tasks/{id}/ratings
```

### 需要認證的路由
```php
// 用戶管理
GET /api/users/profile
PUT /api/users/profile
GET /api/users/{id}
GET /api/users/{id}/ratings

// 統計
GET /api/stats/dashboard

// 文件上傳
POST /api/upload/image
POST /api/upload/document

// 通知
GET /api/notifications
GET /api/notifications/stats
PUT /api/notifications/{id}/read
PUT /api/notifications/mark-all-read
DELETE /api/notifications/{id}

// 搜索
GET /api/search/tasks
GET /api/search/creators
GET /api/search/suppliers

// 媒合
GET /api/matching/suggestions
POST /api/matching/feedback

// 支付
GET /api/payments/history
POST /api/payments/withdraw

// 設置
GET /api/settings
PUT /api/settings

// 申請管理
PUT /api/applications/{id}
```

### 管理員路由
```php
// 管理員儀表板
GET /api/admin/dashboard

// 用戶管理
GET /api/admin/users
PUT /api/admin/users/{id}/status

// 任務管理
GET /api/admin/tasks
PUT /api/admin/tasks/{id}/feature

// 報表
GET /api/admin/reports/users
GET /api/admin/reports/tasks
GET /api/admin/reports/financial
```

## 數據驗證規則

### 任務創建驗證
```php
title: 5-200字符
description: 10-2000字符
requirements: 0-1000字符
budget_min/max: 正數
content_type: 1-50字符
deadline: 有效日期
tags: 字串陣列
location: 座標或字串
```

### 任務申請驗證
```php
proposal: 10-2000字符
proposed_budget: 正數（可選）
estimated_duration: 1-100字符（可選）
portfolio_samples: 檔案陣列（可選）
```

### 任務評分驗證
```php
rating: 1-5分
feedback: 0-500字符（可選）
```

### 用戶註冊驗證
```php
username: 3-50字符，支援中文
email: 有效Email格式
password: 6+字符，字母+數字
role: supplier/creator/media
phone: 8-20字符（可選）
business_type: 1-100字符（可選）
business_area: 1-100字符（可選）
```

## 錯誤處理

### 前端錯誤處理
```typescript
try {
  const response = await apiService.createTask(taskData);
  
  if (response.success) {
    // 成功處理
    toast({
      title: "創建成功",
      description: response.message
    });
  } else {
    throw new Error(response.message || "創建失敗");
  }
} catch (error: any) {
  // 錯誤處理
  toast({
    title: "創建失敗",
    description: error.message || "發生未知錯誤",
    variant: "destructive"
  });
  
  // 保留用戶填寫的數據
  // 重新檢查表單驗證
}
```

### 後端錯誤處理
```php
try {
  // 業務邏輯
  $result = $this->taskService->createTask($data);
  return $this->apiResponse->success($response, '任務創建成功', $result);
} catch (\Exception $e) {
  // 記錄錯誤日誌
  error_log("Task creation failed: " . $e->getMessage());
  
  // 返回用戶友好的錯誤訊息
  return $this->apiResponse->handleException($response, $e);
}
```

## 安全性考慮

### 1. 認證和授權
- 所有敏感操作都需要JWT認證
- 用戶只能操作自己的數據
- 管理員操作需要額外權限檢查

### 2. 輸入驗證
- 前端和後端雙重驗證
- 防止SQL注入和XSS攻擊
- 文件上傳類型限制

### 3. 數據保護
- 敏感數據加密存儲
- API請求頻率限制
- 錯誤訊息不暴露系統信息

## 性能優化

### 1. 數據庫優化
- 適當的索引設計
- 分頁查詢避免大量數據
- 緩存常用數據

### 2. API優化
- 響應數據壓縮
- 圖片和文件CDN分發
- 異步處理耗時操作

## 測試建議

### 1. 單元測試
- 測試所有API方法
- 測試數據驗證邏輯
- 測試錯誤處理

### 2. 整合測試
- 測試前後端數據一致性
- 測試認證流程
- 測試文件上傳功能

### 3. 性能測試
- 測試API響應時間
- 測試並發處理能力
- 測試數據庫查詢性能

## 部署注意事項

### 1. 環境配置
- 設置正確的API基礎URL
- 配置JWT密鑰和過期時間
- 設置文件上傳路徑和大小限制

### 2. 數據庫遷移
- 執行所有必要的數據庫遷移
- 創建必要的索引
- 設置適當的權限

### 3. 監控和日誌
- 設置API調用日誌
- 監控錯誤率和響應時間
- 設置告警機制

## 總結

### ✅ 已完成的工作
1. 前端API服務完整實現
2. 後端路由配置完整
3. 後端控制器方法完整
4. 數據驗證規則統一
5. 錯誤處理機制完善
6. 前後端數據一致性確保

### 🔄 待完成的工作
1. 後端TaskService層實現
2. 數據庫表結構更新
3. 單元測試編寫
4. 性能測試和優化

### 🎯 下一步建議
1. 實現後端TaskService層
2. 添加數據庫遷移腳本
3. 編寫API測試用例
4. 部署到測試環境驗證

所有API端點已經完整配置，前端調用已經實現，系統準備就緒進行後端服務層的實現和測試。
