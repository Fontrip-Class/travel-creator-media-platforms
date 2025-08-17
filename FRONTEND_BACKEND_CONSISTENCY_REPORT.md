# 前後端一致性檢查報告

## 概述
本文檔記錄了前端頁面與後端API和資料庫欄位的一致性檢查結果，以及相應的修復措施。

## 檢查範圍
- 用戶註冊/登入
- 任務創建/管理
- 用戶資料更新
- 通知系統

## 發現的問題及修復狀態

### 1. 用戶註冊 (Register.tsx) ✅ 已修復

**問題描述**：
- 前端發送 `businessType`，後端期望 `business_type`
- 前端發送 `region`，後端期望 `business_area`
- 前端發送 `mediaType`，後端期望 `media_type`
- 缺少 `company_name` 字段

**修復措施**：
- 統一字段命名為 snake_case
- 添加 `company_name` 字段
- 添加密碼強度驗證
- 實現數據保留功能

**字段對應關係**：
| 前端字段 | 後端字段 | 資料庫欄位 | 狀態 |
|---------|---------|-----------|------|
| username | username | users.username | ✅ |
| email | email | users.email | ✅ |
| password | password | users.password_hash | ✅ |
| role | role | users.role | ✅ |
| phone | phone | users.phone | ✅ |
| companyName | company_name | supplier_profiles.company_name | ✅ |
| businessType | business_type | supplier_profiles.business_type | ✅ |
| region | business_area | supplier_profiles.service_areas | ✅ |
| mediaType | media_type | media_profiles.media_type | ✅ |

### 2. 管理員任務創建 (Tasks.tsx) ✅ 已修復

**問題描述**：
- 前端發送 `reward`，後端期望 `budget_min` 和 `budget_max`
- 前端發送 `content_types`，後端期望 `content_type`
- 前端發送 `status`，後端不需要

**修復措施**：
- 將 `reward` 映射為 `budget_min` 和 `budget_max`
- 將 `content_types` 改為 `content_type`
- 移除不需要的 `status` 字段
- 實現數據保留功能

**字段對應關係**：
| 前端字段 | 後端字段 | 資料庫欄位 | 狀態 |
|---------|---------|-----------|------|
| title | title | tasks.title | ✅ |
| description | description | tasks.description | ✅ |
| reward | budget_min/budget_max | tasks.budget_min/tasks.budget_max | ✅ |
| deadline | deadline | tasks.deadline | ✅ |
| contentTypes | content_type | tasks.content_type | ✅ |

### 3. 用戶登入 (Login.tsx) ✅ 已檢查

**檢查結果**：字段完全一致，無需修復

**字段對應關係**：
| 前端字段 | 後端字段 | 資料庫欄位 | 狀態 |
|---------|---------|-----------|------|
| email | email | users.email | ✅ |
| password | password | users.password_hash | ✅ |

### 4. 供應商任務創建 (CreateTask.tsx) ⚠️ 需要後端連接

**當前狀態**：僅模擬API調用，未實際連接後端

**建議**：
- 實現實際的API調用
- 確保字段名稱與後端一致
- 添加數據保留功能

## 數據保留功能實現

### 已實現的頁面
1. **Register.tsx** ✅
   - 註冊失敗時保留所有表單數據
   - 密碼強度錯誤時重新檢查密碼強度

2. **Tasks.tsx** ✅
   - 任務創建失敗時保留表單數據

### 待實現的頁面
1. **CreateTask.tsx** - 供應商任務創建
2. **EditTask.tsx** - 任務編輯
3. **其他表單頁面**

## 密碼強度驗證

### 實現功能
- 即時密碼強度檢查
- 4級強度指示器（紅色、黃色、綠色）
- 提交前驗證
- 用戶友好的錯誤訊息

### 密碼要求
- 最少6個字符
- 必須包含字母和數字
- 特殊字符可選（額外加分）

## 建議和後續工作

### 短期目標
1. 完成所有頁面的數據保留功能
2. 統一所有API調用的錯誤處理
3. 添加表單驗證的一致性檢查

### 長期目標
1. 建立前後端字段命名規範
2. 實現自動化的一致性檢查
3. 建立API文檔和測試用例

## 總結

目前已完成主要頁面的前後端一致性修復，包括：
- 用戶註冊系統的完整修復
- 管理員任務創建的一致性修復
- 密碼強度驗證功能
- 數據保留功能

建議繼續檢查其他頁面，確保整個系統的一致性。
