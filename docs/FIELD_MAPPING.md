# 欄位對照表文檔

## 概述

本文檔提供了旅遊創作者平台的前端、API、後端和資料庫欄位的完整對照表，確保各層級之間的資料結構一致性。

## 編碼規範

- **統一使用**: UTF-8 編碼
- **語言**: 繁體中文 (zh-TW)
- **日期格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **數字格式**: 標準十進制
- **布林值**: true/false

## 用戶相關欄位對照

### 用戶基本資料 (users 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 用戶名 | username | username | username | string | ✓ | 用戶登入名稱 |
| 電子郵件 | email | email | email | string | ✓ | 用戶電子郵件 |
| 電話號碼 | phone | phone | phone | string | ✗ | 聯絡電話 |
| 密碼 | password | password | password_hash | string | ✓ | 加密後的密碼 |
| 角色 | role | role | role | enum | ✓ | 用戶角色 |
| 狀態 | status | status | status | enum | ✓ | 帳戶狀態 |
| 創建時間 | created_at | created_at | created_at | timestamp | ✓ | 帳戶創建時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 最後更新時間 |

**角色枚舉值**:
- `user`: 一般用戶
- `supplier`: 供應商
- `creator`: 創作者
- `media`: 媒體
- `admin`: 管理員

**狀態枚舉值**:
- `active`: 啟用
- `suspended`: 暫停
- `pending`: 待審核

## 業務實體相關欄位對照

### 業務實體基本資料 (business_entities 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 實體名稱 | name | name | name | string | ✓ | 業務實體名稱 |
| 業務類型 | business_type | business_type | business_type | enum | ✓ | 業務實體類型 |
| 描述 | description | description | description | text | ✓ | 業務實體描述 |
| 聯絡人 | contact_person | contact_person | contact_person | string | ✓ | 主要聯絡人 |
| 聯絡電話 | contact_phone | contact_phone | contact_phone | string | ✗ | 聯絡電話 |
| 聯絡郵箱 | contact_email | contact_email | contact_email | string | ✓ | 聯絡電子郵件 |
| 官方網站 | website | website | website | string | ✗ | 官方網站URL |
| 地址 | address | address | address | text | ✗ | 營業地址 |
| 營業時間 | business_hours | business_hours | business_hours | string | ✗ | 營業時間 |
| 標籤 | tags | tags | tags | json | ✗ | 業務標籤陣列 |
| 驗證狀態 | verification_status | verification_status | verification_status | enum | ✓ | 驗證狀態 |
| 創建時間 | created_at | created_at | created_at | timestamp | ✓ | 創建時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 更新時間 |

**業務類型枚舉值**:
- `supplier`: 供應商
- `creator`: 創作者
- `media`: 媒體

**驗證狀態枚舉值**:
- `pending`: 待驗證
- `verified`: 已驗證
- `rejected`: 已拒絕

## 任務相關欄位對照

### 任務基本資料 (tasks 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 任務標題 | title | title | title | string | ✓ | 任務標題 |
| 任務描述 | description | description | description | text | ✓ | 任務詳細描述 |
| 預算 | budget | budget | budget | decimal | ✓ | 任務預算金額 |
| 截止日期 | deadline | deadline | deadline | timestamp | ✓ | 任務截止時間 |
| 需求 | requirements | requirements | requirements | json | ✗ | 任務需求陣列 |
| 標籤 | tags | tags | tags | json | ✗ | 任務標籤陣列 |
| 狀態 | status | status | status | enum | ✓ | 任務狀態 |
| 創建者ID | creator_id | creator_id | creator_id | uuid | ✓ | 任務創建者 |
| 創建時間 | created_at | created_at | created_at | timestamp | ✓ | 創建時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 更新時間 |

**任務狀態枚舉值**:
- `draft`: 草稿
- `published`: 已發布
- `in_progress`: 進行中
- `completed`: 已完成
- `cancelled`: 已取消
- `pending_review`: 待審核
- `approved`: 已審核通過
- `rejected`: 已拒絕

## 任務申請相關欄位對照

### 任務申請資料 (task_applications 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 申請者ID | applicant_id | applicant_id | applicant_id | uuid | ✓ | 申請者用戶ID |
| 任務ID | task_id | task_id | task_id | uuid | ✓ | 申請的任務ID |
| 提案 | proposal | proposal | proposal | text | ✓ | 申請提案 |
| 預估時長 | estimated_duration | estimated_duration | estimated_duration | string | ✓ | 預估完成時間 |
| 作品集連結 | portfolio_links | portfolio_links | portfolio_links | json | ✗ | 作品集連結陣列 |
| 狀態 | status | status | status | enum | ✓ | 申請狀態 |
| 申請時間 | applied_at | applied_at | applied_at | timestamp | ✓ | 申請時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 更新時間 |

**申請狀態枚舉值**:
- `pending`: 待審核
- `approved`: 已通過
- `rejected`: 已拒絕
- `withdrawn`: 已撤回

## 用戶角色關聯欄位對照

### 用戶角色關聯 (user_roles 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 用戶ID | user_id | user_id | user_id | uuid | ✓ | 用戶ID |
| 角色ID | role_id | role_id | role_id | uuid | ✓ | 角色ID |
| 分配時間 | assigned_at | assigned_at | assigned_at | timestamp | ✓ | 角色分配時間 |

## 用戶業務權限欄位對照

### 用戶業務權限 (user_business_permissions 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 用戶ID | user_id | user_id | user_id | uuid | ✓ | 用戶ID |
| 業務實體ID | business_entity_id | business_entity_id | business_entity_id | uuid | ✓ | 業務實體ID |
| 權限等級 | permission_level | permission_level | permission_level | enum | ✓ | 權限等級 |
| 可編輯資料 | can_edit_profile | can_edit_profile | can_edit_profile | boolean | ✓ | 是否可編輯資料 |
| 可管理用戶 | can_manage_users | can_manage_users | can_manage_users | boolean | ✓ | 是否可管理用戶 |
| 可管理內容 | can_manage_content | can_manage_content | can_manage_content | boolean | ✓ | 是否可管理內容 |
| 分配時間 | assigned_at | assigned_at | assigned_at | timestamp | ✓ | 權限分配時間 |

**權限等級枚舉值**:
- `manager`: 管理者
- `user`: 一般用戶

## 供應商檔案欄位對照

### 供應商檔案 (supplier_profiles 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 業務實體ID | business_entity_id | business_entity_id | business_entity_id | uuid | ✓ | 關聯的業務實體ID |
| 業務類別 | business_category | business_category | business_category | enum | ✓ | 業務類別 |
| 營業執照 | business_license | business_license | business_license | string | ✗ | 營業執照號碼 |
| 成立年份 | established_year | established_year | established_year | integer | ✗ | 成立年份 |
| 服務範圍 | service_areas | service_areas | service_areas | json | ✓ | 服務地區陣列 |
| 目標客群 | target_audience | target_audience | target_audience | json | ✓ | 目標客群陣列 |
| 特色服務 | special_services | special_services | special_services | json | ✗ | 特色服務陣列 |
| 獎項認證 | awards_certifications | awards_certifications | awards_certifications | json | ✗ | 獎項認證陣列 |
| 合作偏好 | collaboration_preferences | collaboration_preferences | collaboration_preferences | json | ✗ | 合作偏好陣列 |
| 佣金比例 | commission_rate | commission_rate | commission_rate | decimal | ✗ | 佣金比例 |
| 創建時間 | created_at | created_at | created_at | timestamp | ✓ | 創建時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 更新時間 |

**業務類別枚舉值**:
- `attraction`: 景點
- `accommodation`: 住宿
- `travel_agency`: 旅行社
- `restaurant`: 餐廳
- `retail`: 零售
- `experience`: 體驗活動

## 創作者檔案欄位對照

### 創作者檔案 (creator_profiles 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 業務實體ID | business_entity_id | business_entity_id | business_entity_id | uuid | ✓ | 關聯的業務實體ID |
| 內容類型 | content_types | content_types | content_types | json | ✓ | 創作內容類型陣列 |
| 專長領域 | niches | niches | niches | json | ✓ | 專長領域陣列 |
| 粉絲數量 | audience_size | audience_size | audience_size | integer | ✓ | 粉絲/追蹤者數量 |
| 作品集連結 | portfolio_url | portfolio_url | portfolio_url | string | ✗ | 作品集網站連結 |
| 社群媒體連結 | social_media_links | social_media_links | social_media_links | json | ✗ | 社群媒體連結陣列 |
| 創建時間 | created_at | created_at | created_at | timestamp | ✓ | 創建時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 更新時間 |

**內容類型枚舉值**:
- `article`: 文章
- `video`: 影片
- `photo`: 照片
- `live`: 直播
- `podcast`: 播客

## 媒體檔案欄位對照

### 媒體檔案 (media_profiles 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 業務實體ID | business_entity_id | business_entity_id | business_entity_id | uuid | ✓ | 關聯的業務實體ID |
| 媒體類型 | media_type | media_type | media_type | enum | ✓ | 媒體類型 |
| 受眾規模 | audience_size | audience_size | audience_size | integer | ✓ | 受眾規模 |
| 覆蓋地區 | coverage_areas | coverage_areas | coverage_areas | json | ✓ | 覆蓋地區陣列 |
| 合作模式 | collaboration_models | collaboration_models | collaboration_models | json | ✓ | 合作模式陣列 |
| 創建時間 | created_at | created_at | created_at | timestamp | ✓ | 創建時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 更新時間 |

**媒體類型枚舉值**:
- `social_media`: 社群媒體
- `news_media`: 新聞媒體
- `influencer`: 網紅/KOL
- `advertising`: 廣告媒體

## 通知相關欄位對照

### 通知資料 (notifications 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 用戶ID | user_id | user_id | user_id | uuid | ✓ | 接收通知的用戶ID |
| 標題 | title | title | title | string | ✓ | 通知標題 |
| 內容 | content | content | content | text | ✓ | 通知內容 |
| 類型 | type | type | type | enum | ✓ | 通知類型 |
| 已讀狀態 | is_read | is_read | is_read | boolean | ✓ | 是否已讀 |
| 相關連結 | related_link | related_link | related_link | string | ✗ | 相關頁面連結 |
| 創建時間 | created_at | created_at | created_at | timestamp | ✓ | 通知創建時間 |
| 更新時間 | updated_at | updated_at | updated_at | timestamp | ✓ | 更新時間 |

**通知類型枚舉值**:
- `system`: 系統通知
- `task`: 任務相關
- `application`: 申請相關
- `verification`: 驗證相關
- `reminder`: 提醒通知

## 審計日誌欄位對照

### 審計日誌 (audit_logs 表)

| 前端顯示 | API 欄位 | 後端欄位 | 資料庫欄位 | 類型 | 必填 | 說明 |
|---------|---------|---------|-----------|------|------|------|
| 用戶ID | user_id | user_id | user_id | uuid | ✓ | 執行操作的用戶ID |
| 操作類型 | action_type | action_type | action_type | enum | ✓ | 操作類型 |
| 操作對象 | target_type | target_type | target_type | string | ✓ | 操作對象類型 |
| 對象ID | target_id | target_id | target_id | uuid | ✓ | 操作對象ID |
| 操作描述 | description | description | description | text | ✓ | 操作描述 |
| 舊值 | old_values | old_values | old_values | json | ✗ | 操作前的值 |
| 新值 | new_values | new_values | new_values | json | ✗ | 操作後的值 |
| IP地址 | ip_address | ip_address | ip_address | string | ✗ | 操作者IP地址 |
| 用戶代理 | user_agent | user_agent | user_agent | string | ✗ | 瀏覽器資訊 |
| 操作時間 | created_at | created_at | created_at | timestamp | ✓ | 操作時間 |

**操作類型枚舉值**:
- `create`: 創建
- `update`: 更新
- `delete`: 刪除
- `login`: 登入
- `logout`: 登出
- `verify`: 驗證
- `approve`: 審核通過
- `reject`: 拒絕

## 資料類型對照

### 基本資料類型

| 前端類型 | API類型 | 後端類型 | 資料庫類型 | 說明 |
|---------|---------|---------|-----------|------|
| string | string | string | VARCHAR/TEXT | 字串類型 |
| number | number | integer/float | INT/DECIMAL | 數字類型 |
| boolean | boolean | boolean | BOOLEAN | 布林類型 |
| array | array | array | JSON | 陣列類型 |
| object | object | object | JSON | 物件類型 |
| date | string | DateTime | TIMESTAMP | 日期時間類型 |

### 特殊資料類型

| 類型 | 前端處理 | API處理 | 後端處理 | 資料庫處理 |
|------|---------|---------|---------|-----------|
| UUID | string | string | string | UUID |
| Email | string | string | string | VARCHAR |
| Phone | string | string | string | VARCHAR |
| URL | string | string | string | VARCHAR |
| JSON | object | object | array/object | JSON |
| Timestamp | string | string | DateTime | TIMESTAMP |

## 驗證規則對照

### 字串長度限制

| 欄位類型 | 最小長度 | 最大長度 | 說明 |
|---------|---------|---------|------|
| 用戶名 | 3 | 50 | 用戶登入名稱 |
| 電子郵件 | 5 | 255 | 電子郵件地址 |
| 電話號碼 | 8 | 20 | 聯絡電話 |
| 密碼 | 8 | 128 | 用戶密碼 |
| 描述 | 10 | 1000 | 詳細描述 |
| 地址 | 10 | 500 | 詳細地址 |

### 格式驗證

| 欄位 | 驗證規則 | 錯誤訊息 |
|------|---------|---------|
| 電子郵件 | 標準Email格式 | 請輸入有效的電子郵件地址 |
| 電話號碼 | 數字和連字號 | 請輸入有效的電話號碼 |
| 網站URL | 標準URL格式 | 請輸入有效的網站地址 |
| 密碼 | 至少8位，包含字母和數字 | 密碼至少8位，需包含字母和數字 |

## 錯誤處理對照

### 前端錯誤處理

| 錯誤類型 | 顯示方式 | 處理方式 |
|---------|---------|---------|
| 驗證錯誤 | Toast通知 | 顯示在表單下方 |
| 網路錯誤 | Toast通知 | 重試按鈕 |
| 權限錯誤 | 頁面提示 | 跳轉到登入頁面 |
| 系統錯誤 | Toast通知 | 顯示錯誤代碼 |

### API錯誤響應

| HTTP狀態碼 | 錯誤代碼 | 前端處理 |
|-----------|---------|---------|
| 400 | VALIDATION_ERROR | 顯示驗證錯誤 |
| 401 | UNAUTHORIZED | 跳轉登入頁面 |
| 403 | FORBIDDEN | 顯示權限不足 |
| 404 | NOT_FOUND | 顯示資源不存在 |
| 500 | INTERNAL_ERROR | 顯示系統錯誤 |

## 資料轉換規則

### 日期時間轉換

| 來源格式 | 目標格式 | 轉換規則 |
|---------|---------|---------|
| 資料庫 | 前端顯示 | ISO 8601 → 本地化格式 |
| 前端輸入 | API | 本地化格式 → ISO 8601 |
| API | 資料庫 | ISO 8601 → 資料庫格式 |

### 數字格式轉換

| 來源格式 | 目標格式 | 轉換規則 |
|---------|---------|---------|
| 資料庫 | 前端顯示 | 原始值 → 千分位分隔 |
| 前端輸入 | API | 千分位分隔 → 原始值 |
| API | 資料庫 | 原始值 → 資料庫格式 |

## 維護注意事項

### 欄位命名規範
1. 使用 snake_case 命名資料庫欄位
2. 使用 camelCase 命名API和前端欄位
3. 保持命名的一致性和可讀性

### 資料類型一致性
1. 確保各層級的資料類型匹配
2. 定期檢查資料類型轉換的正確性
3. 更新API文檔時同步更新對照表

### 版本控制
1. 記錄所有欄位的變更歷史
2. 標記已棄用的欄位
3. 提供遷移指南

## 更新日誌

### v1.0.0 (2024-01-20)
- 初始版本發布
- 包含所有核心功能的欄位對照
- 完整的資料類型定義
- 詳細的驗證規則說明
