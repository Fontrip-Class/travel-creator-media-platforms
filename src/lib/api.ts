import type {
    ApiResponse,
    BusinessEntity,
    BusinessFilters,
    BusinessManagementSummary,
    CreatorProfile,
    DashboardStats,
    MediaAsset,
    MediaProfile,
    Notification,
    // 新增的類型
    Role,
    SupplierProfile,
    Task,
    TaskActivity,
    TaskApplication,
    TaskCommunication,
    TaskFile,
    TaskFilters,
    TaskMilestone,
    TaskRating,
    TaskStage,
    User,
    UserBusinessPermission,
    UserFilters,
    UserRole,
    UserRolesSummary
} from '../types/database';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth_token');
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    console.log(`🌐 API請求: ${options.method || 'GET'} ${fullUrl}`);
    console.log('請求選項:', options);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('發送請求...');
      const response = await fetch(fullUrl, config);
      console.log('收到響應:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('響應數據:', data);
      } else {
        const textData = await response.text();
        console.log('響應文本:', textData);
        throw new Error(`預期JSON響應，但收到: ${textData}`);
      }

      if (!response.ok) {
        console.error('HTTP錯誤:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ API請求成功');
      return data;
    } catch (error) {
      console.error('❌ API請求失敗:', error);

      // 詳細的錯誤分析
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (error.message.includes('Failed to fetch')) {
          console.error('🔴 網路錯誤: 無法連接到後端服務');
          console.error('💡 請檢查:');
          console.error('   1. 後端服務是否啟動 (http://localhost:8000)');
          console.error('   2. 網路連接是否正常');
          console.error('   3. 防火牆是否阻擋連接');
        }
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('🔴 JSON解析錯誤: 後端響應格式不正確');
        console.error('💡 請檢查後端服務是否正常運行');
      }

      throw error;
    }
  }

  // ==================== 用戶認證相關 ====================

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{
    user_id: string;
    username: string;
    email: string;
    role: string;
    token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>> {
    return this.request<{
      user_id: string;
      username: string;
      email: string;
      role: string;
      token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // 用戶註冊
  async register(userData: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // 獲取當前用戶資料
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile');
  }

  // 登出
  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // 獲取用戶權限
  async getUserPermissions(userId: string): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(`/users/${userId}/permissions`);
  }

  // 檢查用戶名可用性
  async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.request('/auth/check-username', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
  }

  // 檢查郵箱可用性
  async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.request('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // ==================== 角色專用儀表板API（優化版）====================

  // 供應商儀表板相關 API
  async getSupplierDashboard(): Promise<ApiResponse<any>> {
    return this.request('/supplier/dashboard');
  }

  async getSupplierTasks(filters?: any): Promise<ApiResponse<Task[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/supplier/tasks${queryParams}`);
  }

  async getSupplierStats(): Promise<ApiResponse<any>> {
    return this.request('/supplier/stats');
  }

  async getSupplierAnalytics(timeRange?: string): Promise<ApiResponse<any>> {
    const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
    return this.request(`/supplier/analytics${queryParams}`);
  }

  async getSupplierNotifications(): Promise<ApiResponse<any>> {
    return this.request('/supplier/notifications');
  }

  // 創作者儀表板相關 API
  async getCreatorDashboard(): Promise<ApiResponse<any>> {
    return this.request('/creator/dashboard');
  }

  async getCreatorTasks(filters?: any): Promise<ApiResponse<Task[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/creator/tasks${queryParams}`);
  }

  async getCreatorApplications(filters?: any): Promise<ApiResponse<TaskApplication[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/creator/applications${queryParams}`);
  }

  async getCreatorStats(): Promise<ApiResponse<any>> {
    return this.request('/creator/stats');
  }

  async getCreatorRecommendations(): Promise<ApiResponse<Task[]>> {
    return this.request('/creator/recommendations');
  }

  // 媒體儀表板相關 API
  async getMediaDashboard(): Promise<ApiResponse<any>> {
    return this.request('/media/dashboard');
  }

  async getMediaAssets(filters?: any): Promise<ApiResponse<MediaAsset[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/media/assets${queryParams}`);
  }

  async getMediaPublications(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/media/publications${queryParams}`);
  }

  async getMediaStats(): Promise<ApiResponse<any>> {
    return this.request('/media/stats');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // ==================== 用戶角色管理 ====================

  async assignUserRole(userRoleData: { user_id: string; role_name: string }): Promise<ApiResponse<UserRole>> {
    return this.request<UserRole>('/users/roles', {
      method: 'POST',
      body: JSON.stringify(userRoleData),
    });
  }

  async getUserRoles(userId: string): Promise<ApiResponse<UserRole[]>> {
    return this.request<UserRole[]>(`/users/${userId}/roles`);
  }

  async removeUserRole(userRoleId: string): Promise<ApiResponse> {
    return this.request(`/users/roles/${userRoleId}`, {
      method: 'DELETE',
    });
  }

  async getRoles(): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>('/roles');
  }

  // ==================== 業務實體管理 ====================

  async createBusinessEntity(businessEntityData: Partial<BusinessEntity>): Promise<ApiResponse<BusinessEntity>> {
    return this.request<BusinessEntity>('/business-entities', {
      method: 'POST',
      body: JSON.stringify(businessEntityData),
    });
  }

  async getBusinessEntities(filters?: BusinessFilters): Promise<ApiResponse<BusinessEntity[]>> {
    const queryParams = filters ? new URLSearchParams(filters as any).toString() : '';
    const endpoint = queryParams ? `/business-entities?${queryParams}` : '/business-entities';
    return this.request<BusinessEntity[]>(endpoint);
  }

  async getBusinessEntity(id: string): Promise<ApiResponse<BusinessEntity>> {
    return this.request<BusinessEntity>(`/business-entities/${id}`);
  }

  async updateBusinessEntity(id: string, businessEntityData: Partial<BusinessEntity>): Promise<ApiResponse<BusinessEntity>> {
    return this.request<BusinessEntity>(`/business-entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(businessEntityData),
    });
  }

  async deleteBusinessEntity(id: string): Promise<ApiResponse> {
    return this.request(`/business-entities/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== 業務實體權限管理 ====================

  async assignBusinessEntityPermission(permissionData: {
    user_id: string;
    business_entity_id: string;
    role_id: string;
    permission_level: 'manager' | 'user';
    can_manage_users?: boolean;
    can_manage_content?: boolean;
    can_manage_finance?: boolean;
    can_view_analytics?: boolean;
    can_edit_profile?: boolean;
  }): Promise<ApiResponse<UserBusinessPermission>> {
    return this.request<UserBusinessPermission>('/business-entities/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  }

  async getBusinessEntityPermissions(businessEntityId: string): Promise<ApiResponse<UserBusinessPermission[]>> {
    return this.request<UserBusinessPermission[]>(`/business-entities/${businessEntityId}/permissions`);
  }

  async updateBusinessEntityPermission(
    permissionId: string,
    permissionData: Partial<UserBusinessPermission>
  ): Promise<ApiResponse<UserBusinessPermission>> {
    return this.request<UserBusinessPermission>(`/business-entities/permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  }

  async removeBusinessEntityPermission(permissionId: string): Promise<ApiResponse> {
    return this.request(`/business-entities/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 權限檢查方法 ====================

  // 檢查用戶是否有權限管理特定業務實體
  async checkBusinessEntityPermission(
    userId: string,
    businessEntityId: string,
    permission: 'manage_users' | 'manage_content' | 'manage_finance' | 'view_analytics' | 'edit_profile'
  ): Promise<ApiResponse<{ hasPermission: boolean; permissionLevel: string }>> {
    return this.request<{ hasPermission: boolean; permissionLevel: string }>(
      `/permissions/check?user_id=${userId}&business_entity_id=${businessEntityId}&permission=${permission}`
    );
  }

  // 檢查用戶在特定業務實體中的權限等級
  async getUserPermissionLevel(userId: string, businessEntityId: string): Promise<ApiResponse<{ permissionLevel: string; permissions: any }>> {
    return this.request<{ permissionLevel: string; permissions: any }>(
      `/permissions/user-level?user_id=${userId}&business_entity_id=${businessEntityId}`
    );
  }

  // ==================== 業務實體詳細資訊管理 ====================

  async createSupplierProfile(profileData: Partial<SupplierProfile>): Promise<ApiResponse<SupplierProfile>> {
    return this.request<SupplierProfile>('/supplier-profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async createCreatorProfile(profileData: Partial<CreatorProfile>): Promise<ApiResponse<CreatorProfile>> {
    return this.request<CreatorProfile>('/creator-profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async createMediaProfile(profileData: Partial<MediaProfile>): Promise<ApiResponse<MediaProfile>> {
    return this.request<MediaProfile>('/media-profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getSupplierProfile(businessEntityId: string): Promise<ApiResponse<SupplierProfile>> {
    return this.request<SupplierProfile>(`/supplier-profiles/business-entity/${businessEntityId}`);
  }

  async getCreatorProfile(businessEntityId: string): Promise<ApiResponse<CreatorProfile>> {
    return this.request<CreatorProfile>(`/creator-profiles/business-entity/${businessEntityId}`);
  }

  async getMediaProfile(businessEntityId: string): Promise<ApiResponse<MediaProfile>> {
    return this.request<MediaProfile>(`/media-profiles/business-entity/${businessEntityId}`);
  }

  // ==================== 任務管理 ====================

  async getTasks(filters?: TaskFilters): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return this.request<Task[]>(endpoint);
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}`);
  }

  async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse> {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 任務申請管理 ====================

  async getTaskApplications(taskId: string): Promise<ApiResponse<TaskApplication[]>> {
    return this.request<TaskApplication[]>(`/tasks/${taskId}/applications`);
  }

  async applyForTask(taskId: string, applicationData: Partial<TaskApplication>): Promise<ApiResponse<TaskApplication>> {
    return this.request<TaskApplication>(`/tasks/${taskId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateTaskApplication(applicationId: string, applicationData: Partial<TaskApplication>): Promise<ApiResponse<TaskApplication>> {
    return this.request<TaskApplication>(`/task-applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    });
  }

  async withdrawTaskApplication(applicationId: string): Promise<ApiResponse> {
    return this.request(`/task-applications/${applicationId}/withdraw`, {
      method: 'POST',
    });
  }

  // ==================== 任務階段管理 ====================

  async getTaskStages(taskId: string): Promise<ApiResponse<TaskStage[]>> {
    return this.request<TaskStage[]>(`/tasks/${taskId}/stages`);
  }

  async updateTaskStage(taskId: string, stageData: Partial<TaskStage>): Promise<ApiResponse<TaskStage>> {
    return this.request<TaskStage>(`/tasks/${taskId}/stages`, {
      method: 'PUT',
      body: JSON.stringify(stageData),
    });
  }

  async getTaskActivities(taskId: string): Promise<ApiResponse<TaskActivity[]>> {
    return this.request<TaskActivity[]>(`/tasks/${taskId}/activities`);
  }

  async createTaskActivity(taskId: string, activityData: Partial<TaskActivity>): Promise<ApiResponse<TaskActivity>> {
    return this.request<TaskActivity>(`/tasks/${taskId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // ==================== 任務溝通管理 ====================

  async getTaskCommunications(taskId: string): Promise<ApiResponse<TaskCommunication[]>> {
    return this.request<TaskCommunication[]>(`/tasks/${taskId}/communications`);
  }

  async sendTaskMessage(taskId: string, messageData: Partial<TaskCommunication>): Promise<ApiResponse<TaskCommunication>> {
    return this.request<TaskCommunication>(`/tasks/${taskId}/communications`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse> {
    return this.request(`/task-communications/${messageId}/read`, {
      method: 'POST',
    });
  }

  // ==================== 任務里程碑管理 ====================

  async getTaskMilestones(taskId: string): Promise<ApiResponse<TaskMilestone[]>> {
    return this.request<TaskMilestone[]>(`/tasks/${taskId}/milestones`);
  }

  async createTaskMilestone(taskId: string, milestoneData: Partial<TaskMilestone>): Promise<ApiResponse<TaskMilestone>> {
    return this.request<TaskMilestone>(`/tasks/${taskId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  }

  async updateTaskMilestone(milestoneId: string, milestoneData: Partial<TaskMilestone>): Promise<ApiResponse<TaskMilestone>> {
    return this.request<TaskMilestone>(`/task-milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(milestoneData),
    });
  }

  async completeTaskMilestone(milestoneId: string): Promise<ApiResponse<TaskMilestone>> {
    return this.request<TaskMilestone>(`/task-milestones/${milestoneId}/complete`, {
      method: 'POST',
    });
  }

  // ==================== 任務文件管理 ====================

  async getTaskFiles(taskId: string): Promise<ApiResponse<TaskFile[]>> {
    return this.request<TaskFile[]>(`/tasks/${taskId}/files`);
  }

  async uploadTaskFile(taskId: string, file: File, category?: string): Promise<ApiResponse<TaskFile>> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }

    return this.request<TaskFile>(`/tasks/${taskId}/files`, {
      method: 'POST',
      headers: {}, // 讓瀏覽器自動設置 multipart/form-data
      body: formData,
    });
  }

  async deleteTaskFile(fileId: string): Promise<ApiResponse> {
    return this.request(`/task-files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 任務評價管理 ====================

  async getTaskRatings(taskId: string): Promise<ApiResponse<TaskRating[]>> {
    return this.request<TaskRating[]>(`/tasks/${taskId}/ratings`);
  }

  async submitTaskRating(taskId: string, ratingData: Partial<TaskRating>): Promise<ApiResponse<TaskRating>> {
    return this.request<TaskRating>(`/tasks/${taskId}/ratings`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  // ==================== 媒體資產管理 ====================

  async getBusinessMediaAssets(businessId: string): Promise<ApiResponse<MediaAsset[]>> {
    return this.request<MediaAsset[]>(`/business-entities/${businessId}/media-assets`);
  }

  async uploadMediaAsset(businessId: string, file: File, assetType: string, tags?: string[]): Promise<ApiResponse<MediaAsset>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asset_type', assetType);
    if (tags) {
      tags.forEach(tag => formData.append('tags[]', tag));
    }

    return this.request<MediaAsset>(`/business-entities/${businessId}/media-assets`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async deleteMediaAsset(assetId: string): Promise<ApiResponse> {
    return this.request(`/media-assets/${assetId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 通知設置管理 ====================

  async getNotificationSettings(taskId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/tasks/${taskId}/notification-settings`);
  }

  async updateNotificationSettings(taskId: string, settings: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/tasks/${taskId}/notification-settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ==================== 用戶管理 ====================

  async getUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return this.request<User[]>(endpoint);
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 管理員功能 ====================

  async getAdminDashboard(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/admin/dashboard');
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/admin/dashboard/stats');
  }

  // 用戶管理
  async getAdminUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.request<User[]>(endpoint);
  }

  async createAdminUser(userData: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(userId: string): Promise<ApiResponse> {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async suspendUser(userId: string, reason: string, suspensionUntil?: string): Promise<ApiResponse> {
    return this.request(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason, suspension_until: suspensionUntil }),
    });
  }

  async activateUser(userId: string): Promise<ApiResponse> {
    return this.request(`/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  // 業務實體管理
  async getAdminBusinessEntities(filters?: BusinessFilters): Promise<ApiResponse<BusinessEntity[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/business-entities?${queryString}` : '/admin/business-entities';
    return this.request<BusinessEntity[]>(endpoint);
  }

  async updateAdminBusinessEntity(entityId: string, entityData: Partial<BusinessEntity>): Promise<ApiResponse<BusinessEntity>> {
    return this.request<BusinessEntity>(`/admin/business-entities/${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(entityData),
    });
  }

  async deleteAdminBusinessEntity(entityId: string): Promise<ApiResponse> {
    return this.request(`/admin/business-entities/${entityId}`, {
      method: 'DELETE',
    });
  }

  async verifyBusinessEntity(entityId: string, status: 'verified' | 'rejected', reason?: string): Promise<ApiResponse> {
    return this.request(`/admin/business-entities/${entityId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  }

  // 任務管理
  async getAdminTasks(filters?: TaskFilters): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/tasks?${queryString}` : '/admin/tasks';
    return this.request<Task[]>(endpoint);
  }

  async updateAdminTask(taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/admin/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteAdminTask(taskId: string): Promise<ApiResponse> {
    return this.request(`/admin/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async approveTask(taskId: string, reason?: string): Promise<ApiResponse> {
    return this.request(`/admin/tasks/${taskId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectTask(taskId: string, reason: string): Promise<ApiResponse> {
    return this.request(`/admin/tasks/${taskId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // 系統統計
  async getSystemStats(): Promise<ApiResponse<{
    total_users: number;
    total_business_entities: number;
    total_tasks: number;
    total_revenue: number;
    system_health: string;
    recent_activities: any[];
  }>> {
    return this.request('/admin/system/stats');
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 用戶業務實體摘要 ====================

  async getUserRolesSummary(userId: string): Promise<ApiResponse<UserRolesSummary[]>> {
    return this.request<UserRolesSummary[]>(`/users/${userId}/roles-summary`);
  }

  async getBusinessManagementSummary(userId: string): Promise<ApiResponse<BusinessManagementSummary[]>> {
    return this.request<BusinessManagementSummary[]>(`/users/${userId}/business-management-summary`);
  }
}

export default new ApiService();
