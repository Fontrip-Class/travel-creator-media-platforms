import type {
  ApiResponse,
  User,
  Task,
  TaskApplication,
  TaskFilters,
  UserFilters,
  DashboardStats,
  Notification,
  Pagination,
  MediaAsset,
  TaskStage,
  TaskActivity,
  TaskCommunication,
  TaskMilestone,
  TaskFile,
  TaskRating,
  // 新增的類型
  Role,
  UserRole,
  BusinessEntity,
  UserBusinessPermission,
  SupplierProfile,
  CreatorProfile,
  MediaProfile,
  UserRolesSummary,
  BusinessManagementSummary,
  BusinessFilters
} from '../types/database';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ==================== 用戶認證相關 ====================
  
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile');
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
  
  async getMediaAssets(businessId: string): Promise<ApiResponse<MediaAsset[]>> {
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
  
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/admin/dashboard/stats');
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
