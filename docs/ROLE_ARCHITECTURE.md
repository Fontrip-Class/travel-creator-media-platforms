# 旅遊創作者平台 - 角色架構設計

## 1. 系統角色定義

### 1.1 核心角色 (Core Roles)
- **admin**: 系統管理員 - 擁有所有權限
- **user**: 一般用戶 - 基礎功能權限

### 1.2 業務角色 (Business Roles)
- **supplier**: 供應商 - 提供旅遊服務、產品
- **creator**: 創作者 - 創作旅遊內容、KOL
- **media**: 媒體 - 媒體平台、行銷機構

## 2. 各角色詳細定義

### 2.1 供應商 (Supplier)
**定義**: 提供旅遊相關服務、產品、體驗的企業或個人

**使用情境**:
- 景點門票銷售
- 住宿服務提供
- 旅遊行程規劃
- 特色商品販售
- 體驗活動舉辦

**核心功能**:
- 發布旅遊產品/服務
- 管理訂單和客戶
- 查看銷售數據
- 與創作者合作

**業務實體類型**:
- 景點/主題樂園
- 飯店/民宿
- 旅行社
- 餐廳/美食
- 紀念品店
- 體驗活動

### 2.2 創作者 (Creator)
**定義**: 創作旅遊內容、分享旅遊經驗的個人或團隊

**使用情境**:
- 旅遊部落格寫作
- 旅遊影片製作
- 社群媒體經營
- 旅遊指南撰寫
- 攝影作品分享

**核心功能**:
- 發布旅遊內容
- 接案合作
- 作品集管理
- 與供應商合作

**內容類型**:
- 文章/部落格
- 影片/Vlog
- 攝影作品
- 社群貼文
- 旅遊攻略

### 2.3 媒體 (Media)
**定義**: 媒體平台、行銷機構、廣告代理商

**使用情境**:
- 內容聚合與分發
- 品牌行銷合作
- 廣告投放
- 活動策劃

**核心功能**:
- 內容聚合
- 品牌合作
- 數據分析
- 行銷策劃

## 3. 資料結構設計

### 3.1 用戶帳號 (User Account)
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
```

### 3.2 業務實體 (Business Entity)
```typescript
interface BusinessEntity {
  id: string;
  name: string;
  business_type: 'supplier' | 'creator' | 'media';
  description: string;
  
  // 基本聯絡資訊
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  
  // 業務資訊
  website?: string;
  address?: string;
  business_hours?: string;
  
  // 特色標籤
  tags: string[];
  
  // 認證狀態
  verification_status: 'pending' | 'verified' | 'rejected';
  
  created_at: string;
  updated_at: string;
}
```

### 3.3 供應商檔案 (Supplier Profile)
```typescript
interface SupplierProfile {
  id: string;
  business_entity_id: string;
  
  // 業務資訊
  business_category: 'attraction' | 'accommodation' | 'travel_agency' | 'restaurant' | 'retail' | 'experience';
  business_license?: string;
  established_year?: number;
  
  // 服務範圍
  service_areas: string[];
  target_audience: string[];
  
  // 特色服務
  special_services: string[];
  awards_certifications: string[];
  
  // 合作資訊
  collaboration_preferences: string[];
  commission_rate?: number;
}
```

### 3.4 創作者檔案 (Creator Profile)
```typescript
interface CreatorProfile {
  id: string;
  business_entity_id: string;
  
  // 創作資訊
  content_types: 'article' | 'video' | 'photo' | 'live' | 'podcast'[];
  niches: string[]; // 專長領域
  audience_size: number;
  
  // 作品集
  portfolio_url?: string;
  social_media_links: {
    platform: string;
    url: string;
    followers: number;
  }[];
  
  // 合作資訊
  collaboration_rates: {
    content_type: string;
    rate: number;
    currency: string;
  }[];
  availability: 'available' | 'busy' | 'unavailable';
}
```

### 3.5 媒體檔案 (Media Profile)
```typescript
interface MediaProfile {
  id: string;
  business_entity_id: string;
  
  // 媒體資訊
  media_type: 'platform' | 'agency' | 'publisher' | 'influencer_network';
  platform_name?: string;
  target_audience: string[];
  
  // 服務範圍
  services: string[];
  coverage_areas: string[];
  
  // 合作資訊
  collaboration_models: string[];
  pricing_structure: string;
}
```

## 4. 權限設計

### 4.1 權限等級
- **manager**: 管理者 - 完整權限
- **user**: 一般用戶 - 基本權限

### 4.2 具體權限
- **can_edit_profile**: 編輯檔案
- **can_manage_users**: 管理用戶
- **can_manage_content**: 管理內容
- **can_manage_finance**: 管理財務
- **can_view_analytics**: 查看數據
- **can_collaborate**: 合作功能

## 5. 使用流程設計

### 5.1 註冊流程
1. **帳號建立**: 基本用戶資訊
2. **角色選擇**: 選擇主要業務角色
3. **業務實體建立**: 根據角色填寫對應資訊
4. **檔案完善**: 補充詳細業務資訊
5. **認證審核**: 等待管理員審核

### 5.2 各角色主要功能頁面

#### 供應商
- 儀表板: 銷售數據、訂單管理
- 產品管理: 發布、編輯旅遊產品
- 合作管理: 與創作者的合作
- 客戶管理: 客戶資料、訂單歷史

#### 創作者
- 儀表板: 內容數據、合作機會
- 作品管理: 發布、編輯內容
- 接案管理: 查看、申請合作機會
- 收益管理: 合作收入、分成

#### 媒體
- 儀表板: 平台數據、合作統計
- 內容聚合: 管理聚合內容
- 品牌合作: 管理品牌合作
- 數據分析: 平台使用數據

## 6. 管理後台設計

### 6.1 管理員功能
- 用戶管理: 審核、啟用/停用用戶
- 業務實體驗證: 審核業務實體資訊
- 內容審核: 審核發布的內容
- 合作管理: 監控合作關係
- 系統監控: 平台健康狀態

### 6.2 數據分析
- 用戶統計: 各角色用戶數量
- 內容統計: 內容發布數量
- 合作統計: 合作達成數量
- 收益統計: 平台收益數據
