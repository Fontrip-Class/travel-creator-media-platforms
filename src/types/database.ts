/**
 * 旅遊平台統一資料庫類型定義 v5.0
 * 確保前端、後端、資料庫三個層面的資料結構一致性
 * 新增：用戶-角色-業務實體分離模型
 */

// API 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

// 基礎類型
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

// 業務實體類型
export interface BusinessEntity {
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

// 供應商檔案
export interface SupplierProfile {
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
  
  created_at: string;
  updated_at: string;
}

// 創作者檔案
export interface CreatorProfile {
  id: string;
  business_entity_id: string;
  
  // 創作資訊
  content_types: ('article' | 'video' | 'photo' | 'live' | 'podcast')[];
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
  
  created_at: string;
  updated_at: string;
}

// 媒體檔案
export interface MediaProfile {
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
  
  created_at: string;
  updated_at: string;
}

// 用戶業務權限
export interface UserBusinessPermission {
  id: string;
  user_id: string;
  business_entity_id: string;
  role_id: string;
  permission_level: 'manager' | 'user';
  
  // 具體權限
  can_edit_profile: boolean;
  can_manage_users: boolean;
  can_manage_content: boolean;
  can_manage_finance: boolean;
  can_view_analytics: boolean;
  can_collaborate: boolean;
  
  created_at: string;
  updated_at: string;
}

// 任務相關類型
export type TaskStatus = 
  | 'draft'           // 草稿
  | 'open'            // 開放申請
  | 'collecting'      // 收集中
  | 'evaluating'      // 評估中
  | 'in_progress'     // 進行中
  | 'reviewing'       // 審核中
  | 'publishing'      // 發布中
  | 'completed'       // 已完成
  | 'cancelled'       // 已取消
  | 'expired';        // 已過期

export interface Task {
  id: string;
  title: string;
  description: string;
  business_entity_id: string;
  status: TaskStatus;
  
  // 任務詳情
  content_types: string[];
  requirements: string;
  deliverables: string[];
  
  // 預算和報酬
  budget: {
    min: number;
    max: number;
    type: string;
    rewardType: string;
  };
  reward_type: 'money' | 'gift' | 'experience';
  gift_details?: string;
  deadline: string;
  
  // 位置資訊
  location?: GeoLocation;
  
  // 統計資訊
  applications_count: number;
  views_count: number;
  
  // 進度追蹤
  progress: {
    current_step: string;
    completion_percentage: number;
    estimated_completion: string;
  };
  
  // 系統資訊
  created_at: string;
  updated_at: string;
}

// 地理位置
export interface GeoLocation {
  lat: number;
  lng: number;
}

// 任務申請
export interface TaskApplication {
  id: string;
  task_id: string;
  creator_id: string;
  business_entity_id: string;
  
  // 申請內容
  proposal: string;
  portfolio_links: string[];
  estimated_duration: string;
  price_quote: number;
  
  // 申請狀態
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  
  // 系統資訊
  created_at: string;
  updated_at: string;
}

// 內容類型
export interface Content {
  id: string;
  title: string;
  content_type: 'article' | 'video' | 'photo' | 'live' | 'podcast';
  creator_id: string;
  business_entity_id: string;
  
  // 內容資訊
  description: string;
  content_url: string;
  thumbnail_url?: string;
  tags: string[];
  
  // 發布資訊
  publish_date: string;
  platform: string;
  
  // 統計資訊
  views_count: number;
  likes_count: number;
  shares_count: number;
  
  // 系統資訊
  created_at: string;
  updated_at: string;
}

// 合作關係
export interface Collaboration {
  id: string;
  supplier_id: string;
  creator_id: string;
  task_id?: string;
  
  // 合作詳情
  collaboration_type: 'one_time' | 'ongoing' | 'campaign';
  description: string;
  terms: string;
  
  // 財務資訊
  budget: number;
  commission_rate: number;
  
  // 合作狀態
  status: 'proposed' | 'active' | 'completed' | 'cancelled';
  
  // 時間資訊
  start_date: string;
  end_date?: string;
  
  // 系統資訊
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: string;
  category?: string;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  search?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  location?: string;
}

export interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalBudget: number;
  totalApplications: number;
  avgCompletionTime: number;
  satisfactionRate: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task_application' | 'task_update' | 'system' | 'reminder';
  is_read: boolean;
  created_at: string;
  data?: any;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface MediaAsset {
  id: string;
  task_id: string;
  creator_id: string;
  file_url: string;
  file_type: string;
  file_size: number;
  title: string;
  description?: string;
  tags: string[];
  created_at: string;
}

export interface TaskStage {
  id: string;
  task_id: string;
  stage_name: string;
  stage_order: number;
  is_completed: boolean;
  completed_at?: string;
  requirements: string[];
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface TaskCommunication {
  id: string;
  task_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: 'text' | 'file' | 'system';
  created_at: string;
  is_read: boolean;
}

export interface TaskMilestone {
  id: string;
  task_id: string;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string;
  deliverables: string[];
}
