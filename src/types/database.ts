/**
 * 旅遊平台統一資料庫類型定義 v5.0
 * 確保前端、後端、資料庫三個層面的資料結構一致性
 * 新增：用戶-角色-業務實體分離模型
 */

// ==================== 基礎類型 ====================

export type UUID = string;
export type Timestamp = string; // ISO 8601 格式
export type DateString = string; // YYYY-MM-DD 格式

// ==================== 用戶相關類型 ====================

// 用戶帳號（身份驗證層）
export interface User {
  id: UUID;
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  
  // 安全相關
  login_attempts: number;
  locked_until?: Timestamp;
  last_login?: Timestamp;
  reset_token?: string;
  reset_token_expires?: Timestamp;
  
  // 審計欄位
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// 系統角色定義
export interface Role {
  id: UUID;
  name: string; // 'admin', 'supplier', 'creator', 'media'
  display_name: string;
  description?: string;
  permissions: Record<string, any>; // JSONB 權限配置
  is_system_role: boolean;
  created_at: Timestamp;
}

// 用戶角色關聯
export interface UserRole {
  id: UUID;
  user_id: UUID;
  role_id: UUID;
  is_active: boolean;
  granted_at: Timestamp;
  granted_by: UUID;
  expires_at?: Timestamp;
}

// 業務實體類型
export type BusinessType = 'supplier' | 'koc' | 'media' | 'agency';

// 業務實體狀態
export type BusinessStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// 驗證狀態
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// 業務實體
export interface BusinessEntity {
  id: UUID;
  name: string; // 如"九族文化村"、"趙致緯"
  business_type: BusinessType;
  description?: string;
  
  // 聯絡資訊
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  
  // 地理位置
  location?: GeoLocation;
  address?: AddressInfo;
  
  // 業務相關
  business_license?: string;
  tax_id?: string;
  industry?: string;
  specialties?: string[]; // 專長領域
  
  // 社交媒體
  social_media?: SocialMediaLinks;
  
  // 狀態
  status: BusinessStatus;
  verification_status: VerificationStatus;
  
  // 審計欄位
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: UUID;
  updated_by?: UUID;
}

// 用戶業務實體管理權限 - 簡化為兩種等級
export type PermissionLevel = 'manager' | 'user';

export interface UserBusinessPermission {
  id: UUID;
  user_id: UUID;
  business_entity_id: UUID;
  role_id: UUID;
  
  // 權限級別：簡化為兩種
  permission_level: PermissionLevel;
  
  // 權限範圍（管理者擁有所有權限，一般使用者只有基本權限）
  can_manage_users: boolean; // 是否可以管理其他用戶權限
  can_manage_content: boolean; // 是否可以管理內容
  can_manage_finance: boolean; // 是否可以管理財務
  can_view_analytics: boolean; // 是否可以查看分析數據
  can_edit_profile: boolean; // 是否可以編輯基本資料（所有用戶都有）
  
  // 狀態
  is_active: boolean;
  granted_at: Timestamp;
  granted_by: UUID;
  expires_at?: Timestamp;
}

// 供應商詳細資訊
export interface SupplierProfile {
  id: UUID;
  business_entity_id: UUID;
  
  // 業務資訊
  company_name?: string;
  business_type?: string;
  license_number?: string;
  service_areas?: string[];
  business_hours?: BusinessHours;
  payment_methods?: string[];
  
  // 服務相關
  service_categories?: string[];
  pricing_info?: PricingInfo;
  availability_schedule?: AvailabilitySchedule;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// KOC/創作者詳細資訊
export interface CreatorProfile {
  id: UUID;
  business_entity_id: UUID;
  
  // 創作者資訊
  portfolio_url?: string;
  content_types?: string[]; // video, photo, article, live
  target_audience?: string[]; // travel_enthusiasts, taiwan_tourists
  content_categories?: string[]; // travel, food, lifestyle
  
  // 影響力數據
  follower_count: number;
  engagement_rate: number;
  avg_views: number;
  avg_likes: number;
  
  // 合作相關
  collaboration_history?: CollaborationHistory;
  equipment?: EquipmentInfo;
  availability?: AvailabilityInfo;
  rate_card?: RateCard;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// 媒體詳細資訊
export interface MediaProfile {
  id: UUID;
  business_entity_id: UUID;
  
  // 媒體資訊
  media_type?: string; // TV, radio, newspaper, digital
  platform_name?: string;
  audience_size: number;
  content_categories?: string[];
  
  // 數據指標
  engagement_rate: number;
  demographics?: DemographicsInfo;
  reach_coverage?: ReachCoverage;
  
  // 合作相關
  advertising_rates?: AdvertisingRates;
  content_guidelines?: string;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ==================== 任務相關類型 ====================

export type TaskStatus =
  | 'draft'           // 草稿
  | 'published'       // 已發布
  | 'collecting'      // 收集中
  | 'evaluating'      // 評估中
  | 'in_progress'     // 進行中
  | 'reviewing'       // 審核中
  | 'publishing'      // 發布中
  | 'completed'       // 已完成
  | 'cancelled'       // 已取消
  | 'expired';        // 已過期

export interface Task {
  id: UUID;
  business_entity_id: UUID; // 改為關聯業務實體
  title: string;
  description: string;
  requirements?: string;
  
  // 任務詳情
  category?: string;
  tags?: string[];
  budget_range?: BudgetRange;
  
  // 時間相關
  deadline?: DateString;
  estimated_duration_hours?: number;
  
  // 狀態管理
  status: TaskStatus;
  
  // 地理位置
  location?: GeoLocation;
  location_description?: string;
  
  // 審計欄位
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: UUID;
  updated_by?: UUID;
}

// ==================== 輔助類型定義 ====================

// 地理位置
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// 地址資訊
export interface AddressInfo {
  country: string;
  city: string;
  district?: string;
  street?: string;
  postal_code?: string;
  formatted_address?: string;
}

// 社交媒體連結
export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
}

// 營業時間
export interface BusinessHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open: string; // HH:MM
  close: string; // HH:MM
  is_closed?: boolean;
}

// 定價資訊
export interface PricingInfo {
  currency: string;
  base_price: number;
  pricing_model: 'hourly' | 'daily' | 'project' | 'subscription';
  additional_fees?: AdditionalFee[];
}

export interface AdditionalFee {
  name: string;
  amount: number;
  description?: string;
}

// 可用性排程
export interface AvailabilitySchedule {
  available_days: string[];
  available_hours: string[];
  blackout_dates?: DateString[];
  advance_booking_days: number;
}

// 合作歷史
export interface CollaborationHistory {
  total_collaborations: number;
  successful_collaborations: number;
  average_rating: number;
  previous_partners?: string[];
}

// 設備資訊
export interface EquipmentInfo {
  cameras?: string[];
  lenses?: string[];
  lighting?: string[];
  audio?: string[];
  other?: string[];
}

// 可用性資訊
export interface AvailabilityInfo {
  available_days: string[];
  available_hours: string[];
  response_time: string; // 如 "24 hours"
  booking_lead_time: number; // 提前預約天數
}

// 報價單
export interface RateCard {
  base_rate: number;
  currency: string;
  rate_type: 'per_hour' | 'per_day' | 'per_project';
  additional_services?: AdditionalService[];
}

export interface AdditionalService {
  name: string;
  rate: number;
  description?: string;
}

// 人口統計資訊
export interface DemographicsInfo {
  age_groups?: AgeGroup[];
  gender_distribution?: GenderDistribution;
  locations?: string[];
  interests?: string[];
}

export interface AgeGroup {
  range: string; // 如 "18-24", "25-34"
  percentage: number;
}

export interface GenderDistribution {
  male: number;
  female: number;
  other?: number;
}

// 覆蓋範圍
export interface ReachCoverage {
  regions: string[];
  cities: string[];
  estimated_reach: number;
  coverage_type: 'local' | 'regional' | 'national' | 'international';
}

// 廣告費率
export interface AdvertisingRates {
  base_rate: number;
  currency: string;
  rate_type: 'per_impression' | 'per_click' | 'per_engagement';
  minimum_budget: number;
  volume_discounts?: VolumeDiscount[];
}

export interface VolumeDiscount {
  threshold: number;
  discount_percentage: number;
}

// 預算範圍
export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

// ==================== 用戶角色摘要視圖類型 ====================

export interface UserRolesSummary {
  user_id: UUID;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: string[];
  role_display_names: string[];
  managed_businesses: number;
}

// 業務實體管理摘要視圖類型
export interface BusinessManagementSummary {
  business_entity_id: UUID;
  business_name: string;
  business_type: BusinessType;
  status: BusinessStatus;
  manager_username: string;
  first_name?: string;
  last_name?: string;
  role_name: string;
  permission_level: PermissionLevel;
  can_manage_users: boolean;
  can_manage_content: boolean;
  can_manage_finance: boolean;
}

// ==================== API 響應類型 ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ==================== 篩選器類型 ====================

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  category?: string;
  business_type?: BusinessType;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  deadline_from?: DateString;
  deadline_to?: DateString;
  page?: number;
  limit?: number;
}

export interface BusinessFilters {
  business_type?: BusinessType;
  status?: BusinessStatus;
  verification_status?: VerificationStatus;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== 儀表板統計類型 ====================

export interface DashboardStats {
  total_users: number;
  total_businesses: number;
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
  total_revenue: number;
  monthly_growth: number;
}

// ==================== 通知類型 ====================

export interface Notification {
  id: UUID;
  user_id: UUID;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: Timestamp;
  action_url?: string;
}

// ==================== 任務申請類型 ====================

export interface TaskApplication {
  id: UUID;
  task_id: UUID;
  creator_id: UUID;
  business_entity_id: UUID;
  proposal: string;
  budget: number;
  estimated_duration: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: Timestamp;
  reviewed_at?: Timestamp;
  reviewed_by?: UUID;
  feedback?: string;
}

// ==================== 任務階段類型 ====================

export interface TaskStage {
  id: UUID;
  task_id: UUID;
  current_stage: string;
  progress_percentage: number;
  stage_started_at: Timestamp;
  stage_completed_at?: Timestamp;
  stage_duration_hours?: number;
  updated_at: Timestamp;
}

export interface TaskActivity {
  id: UUID;
  task_id: UUID;
  user_id: UUID;
  activity_type: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: Timestamp;
}

export interface TaskCommunication {
  id: UUID;
  task_id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  message_type: 'comment' | 'feedback' | 'question' | 'answer';
  message: string;
  is_internal: boolean;
  attachments?: Record<string, any>;
  read_at?: Timestamp;
  created_at: Timestamp;
}

export interface TaskMilestone {
  id: UUID;
  task_id: UUID;
  title: string;
  description?: string;
  due_date?: DateString;
  completed_at?: Timestamp;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assigned_to?: UUID;
  created_at: Timestamp;
}

export interface TaskFile {
  id: UUID;
  task_id: UUID;
  uploaded_by: UUID;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  file_category?: 'proposal' | 'content' | 'review' | 'final';
  is_public: boolean;
  download_count: number;
  created_at: Timestamp;
}

export interface TaskRating {
  id: UUID;
  task_id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  rating: number;
  comment?: string;
  rating_type: 'quality' | 'communication' | 'timeliness' | 'overall';
  created_at: Timestamp;
}

// ==================== 媒體資產類型 ====================

export interface MediaAsset {
  id: UUID;
  business_entity_id: UUID;
  asset_type: 'image' | 'video' | 'document' | 'audio';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  metadata?: Record<string, any>;
  tags?: string[];
  is_public: boolean;
  created_at: Timestamp;
  created_by: UUID;
}
