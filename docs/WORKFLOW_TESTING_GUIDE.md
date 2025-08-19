# 完整工作流程測試指南

## 🎯 測試目標

驗證從供應商發案到創作者接案再到結案的完整業務流程，確保前後台與資料庫的正確性。

## 📋 測試場景

**場景**: 台北101觀景台宣傳影片委託案
- **供應商**: 台北101觀光公司
- **創作者**: 專業攝影工作室
- **媒體**: 社群媒體平台
- **任務類型**: 影片製作 + 攝影
- **預算**: NT$ 15,000 - 25,000

## 🔄 完整流程測試步驟

### 準備階段

```bash
# 1. 啟動後端服務
cd backend
php -S localhost:8000 -t public

# 2. 啟動前端服務
npm run dev

# 3. 初始化資料庫（如果需要）
php backend/database/init_database_fixed.php

# 4. 執行工作流程資料表創建
mysql -u username -p database_name < backend/database/workflow_tables.sql
```

### 自動化測試

```bash
# 執行完整工作流程測試
node test_complete_workflow.js
```

### 手動測試檢查點

#### 🏢 供應商流程測試

1. **登入供應商帳戶**
   - [ ] 訪問 `http://localhost:3000/login`
   - [ ] 使用供應商帳戶登入
   - [ ] 確認跳轉到供應商儀表板

2. **創建行銷委託案**
   - [ ] 點擊「創建新任務」
   - [ ] 填寫任務資訊：
     ```
     標題: 台北101觀景台宣傳影片
     描述: 製作台北101觀景台宣傳影片，突出台北地標特色和觀景體驗
     內容類型: 影片、照片
     預算: NT$ 15,000 - 25,000
     截止日期: 2024-03-15
     ```
   - [ ] 確認任務創建成功
   - [ ] 檢查任務狀態為「草稿」

3. **發布任務**
   - [ ] 在任務詳情頁點擊「發布任務」
   - [ ] 確認任務狀態變更為「開放申請」
   - [ ] 檢查工作流程進度更新

#### 🎨 創作者流程測試

4. **瀏覽可申請任務**
   - [ ] 登入創作者帳戶
   - [ ] 訪問創作者儀表板
   - [ ] 點擊「瀏覽任務」
   - [ ] 確認可以看到剛發布的任務

5. **申請任務**
   - [ ] 點擊任務詳情
   - [ ] 點擊「申請此任務」
   - [ ] 填寫申請表單：
     ```
     提案: 詳細的執行計劃和創作理念
     預算報價: NT$ 20,000
     預估時間: 10個工作天
     作品集: 相關作品連結
     ```
   - [ ] 提交申請
   - [ ] 確認申請狀態為「待審核」

#### 🔍 審核流程測試

6. **供應商審核申請**
   - [ ] 供應商收到申請通知
   - [ ] 在任務詳情頁查看申請列表
   - [ ] 審核申請內容
   - [ ] 點擊「接受申請」
   - [ ] 確認任務狀態變更為「進行中」
   - [ ] 確認創作者收到接受通知

#### 📤 作品提交測試

7. **創作者提交作品**
   - [ ] 創作者在任務詳情頁點擊「提交作品」
   - [ ] 填寫作品資訊：
     ```
     標題: 台北101觀景台宣傳影片 - 最終版本
     描述: 包含日景、夕陽和夜景的完整宣傳影片
     檔案類型: 影片
     檔案連結: Google Drive 分享連結
     標籤: 台北101, 觀景台, 宣傳影片
     ```
   - [ ] 提交作品
   - [ ] 確認任務狀態變更為「審核中」

8. **供應商審核作品**
   - [ ] 供應商收到作品提交通知
   - [ ] 在任務詳情頁查看提交的作品
   - [ ] 預覽作品內容
   - [ ] 選擇「批准作品」
   - [ ] 確認任務狀態變更為「發布中」

#### ⭐ 評分結案測試

9. **任務完成確認**
   - [ ] 供應商點擊「確認完成」
   - [ ] 確認任務狀態變更為「已完成」
   - [ ] 檢查工作流程進度達到100%

10. **雙方互評**
    - [ ] 供應商為創作者評分（1-5星）
    - [ ] 創作者為供應商評分（1-5星）
    - [ ] 確認評分記錄正確保存
    - [ ] 檢查用戶平均評分更新

#### 📺 媒體發布測試

11. **媒體平台內容管理**
    - [ ] 媒體用戶登入
    - [ ] 查看可用的媒體資源
    - [ ] 下載作品檔案
    - [ ] 排程內容發布

## 🔍 資料庫驗證

### 檢查關鍵資料表

```sql
-- 檢查任務創建
SELECT * FROM tasks WHERE title LIKE '%台北101%' ORDER BY created_at DESC LIMIT 1;

-- 檢查任務階段
SELECT * FROM task_stages WHERE task_id = 'YOUR_TASK_ID' ORDER BY stage_order;

-- 檢查申請記錄
SELECT * FROM task_applications WHERE task_id = 'YOUR_TASK_ID';

-- 檢查活動記錄
SELECT * FROM task_activities WHERE task_id = 'YOUR_TASK_ID' ORDER BY created_at;

-- 檢查媒體資源
SELECT * FROM media_assets WHERE task_id = 'YOUR_TASK_ID';

-- 檢查評分記錄
SELECT * FROM task_ratings WHERE task_id = 'YOUR_TASK_ID';

-- 檢查工作流程狀態歷史
SELECT * FROM workflow_state_history WHERE task_id = 'YOUR_TASK_ID' ORDER BY created_at;
```

### 資料一致性檢查

```sql
-- 檢查任務統計一致性
SELECT
    t.id,
    t.applications_count,
    (SELECT COUNT(*) FROM task_applications WHERE task_id = t.id) as actual_applications,
    t.views_count
FROM tasks t
WHERE t.title LIKE '%台北101%';

-- 檢查用戶評分一致性
SELECT
    u.id,
    u.rating as stored_rating,
    AVG(tr.rating) as calculated_rating
FROM users u
LEFT JOIN task_ratings tr ON u.id = tr.to_user_id
WHERE u.username LIKE '%test%'
GROUP BY u.id;
```

## 📊 效能測試

### API 響應時間測試

```javascript
// 測試關鍵API的響應時間
const performanceTests = [
    { name: '任務列表載入', endpoint: '/creator/tasks' },
    { name: '任務詳情載入', endpoint: '/tasks/{id}' },
    { name: '工作流程狀態', endpoint: '/workflow/tasks/{id}/workflow' },
    { name: '儀表板統計', endpoint: '/supplier/dashboard' }
];

for (const test of performanceTests) {
    const startTime = Date.now();
    await makeRequest(test.endpoint);
    const responseTime = Date.now() - startTime;
    console.log(`${test.name}: ${responseTime}ms`);
}
```

## 🚨 常見問題排除

### 1. 任務創建失敗
**可能原因:**
- 用戶權限不足
- 必填欄位缺失
- 資料庫連接問題

**檢查方法:**
```bash
# 檢查後端日誌
tail -f backend/logs/api_errors.log

# 檢查資料庫連接
php backend/check_db_structure.php
```

### 2. 申請提交失敗
**可能原因:**
- 任務狀態不正確
- 重複申請
- 驗證失敗

**檢查方法:**
```sql
-- 檢查任務狀態
SELECT status FROM tasks WHERE id = 'TASK_ID';

-- 檢查是否已申請
SELECT * FROM task_applications WHERE task_id = 'TASK_ID' AND creator_id = 'USER_ID';
```

### 3. 工作流程狀態不同步
**可能原因:**
- 觸發器未正常執行
- 事務回滾
- 併發更新衝突

**解決方法:**
```sql
-- 手動同步任務階段
CALL InitializeTaskWorkflow('TASK_ID');

-- 檢查工作流程完整性
CALL CheckWorkflowIntegrity();
```

## 📈 測試成功標準

### 基本標準 (必須達成)
- [ ] 所有API端點正常響應
- [ ] 資料庫操作無錯誤
- [ ] 工作流程狀態正確轉換
- [ ] 通知系統正常運作

### 進階標準 (建議達成)
- [ ] API響應時間 < 500ms
- [ ] 前端載入時間 < 2秒
- [ ] 錯誤處理機制完善
- [ ] 用戶體驗流暢

### 優化標準 (最佳實踐)
- [ ] 支援併發操作
- [ ] 資料一致性保證
- [ ] 完整的審計追蹤
- [ ] 自動化測試覆蓋率 > 80%

---

**測試負責人**: 開發團隊
**測試環境**: 本地開發環境
**最後更新**: 2024年1月
