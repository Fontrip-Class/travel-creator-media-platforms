const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
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

  // 健康檢查
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // 測試端點
  async test(): Promise<ApiResponse> {
    return this.request('/test');
  }

  // 用戶註冊
  async register(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    contact?: string;
    businessType?: string;
    region?: string;
    specialties?: string;
    followers?: string;
    platform?: string;
    mediaType?: string;
    website?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // 用戶登入
  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // 獲取用戶資料
  async getProfile(): Promise<ApiResponse> {
    return this.request('/users/profile');
  }

  // 更新用戶資料
  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // 獲取任務列表
  async getTasks(filters: any = {}, page: number = 1): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });
    return this.request(`/tasks?${params}`);
  }

  // 創建任務
  async createTask(taskData: any): Promise<ApiResponse> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // 獲取任務詳情
  async getTaskById(taskId: string): Promise<ApiResponse> {
    return this.request(`/tasks/${taskId}`);
  }

  // 申請任務
  async applyForTask(taskId: string, applicationData: any): Promise<ApiResponse> {
    return this.request(`/tasks/${taskId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  // 獲取公開任務
  async getPublicTasks(filters: any = {}, page: number = 1): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });
    return this.request(`/tasks/public?${params}`);
  }

  // 獲取任務推薦
  async getTaskRecommendations(limit: number = 10): Promise<ApiResponse> {
    return this.request(`/tasks/recommendations?limit=${limit}`);
  }

  // 獲取媒合建議
  async getMatchingSuggestions(taskId: string): Promise<ApiResponse> {
    return this.request(`/matching/suggestions?task_id=${taskId}`);
  }

  // 獲取儀表板統計
  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/stats/dashboard');
  }

  // 獲取管理員儀表板
  async getAdminDashboard(): Promise<ApiResponse> {
    return this.request('/admin/dashboard');
  }

  // 獲取用戶列表
  async getUsers(page: number = 1, filters: any = {}): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });
    return this.request(`/admin/users?${params}`);
  }

  // 獲取管理員任務列表
  async getAdminTasks(page: number = 1, filters: any = {}): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });
    return this.request(`/admin/tasks?${params}`);
  }

  // 獲取通知列表
  async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/notifications?${params}`);
  }

  // 獲取通知統計
  async getNotificationStats(): Promise<ApiResponse> {
    return this.request('/notifications/stats');
  }

  // 標記通知為已讀
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // 標記所有通知為已讀
  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  // 刪除通知
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // 上傳圖片
  async uploadImage(file: File, options: any = {}): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    // 添加選項
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    return this.request('/upload/image', {
      method: 'POST',
      headers: {}, // 不設置Content-Type，讓瀏覽器自動設置
      body: formData,
    });
  }

  // 上傳文件
  async uploadDocument(file: File, options: any = {}): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('document', file);
    
    // 添加選項
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    return this.request('/upload/document', {
      method: 'POST',
      headers: {}, // 不設置Content-Type，讓瀏覽器自動設置
      body: formData,
    });
  }

  // 搜索任務
  async searchTasks(query: string, filters: any = {}, page: number = 1): Promise<ApiResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...filters,
    });
    return this.request(`/search/tasks?${params}`);
  }

  // 搜索創作者
  async searchCreators(query: string, filters: any = {}, page: number = 1): Promise<ApiResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...filters,
    });
    return this.request(`/search/creators?${params}`);
  }

  // 搜索供應商
  async searchSuppliers(query: string, filters: any = {}, page: number = 1): Promise<ApiResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...filters,
    });
    return this.request(`/search/suppliers?${params}`);
  }

  // 獲取支付歷史
  async getPaymentHistory(page: number = 1): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
    });
    return this.request(`/payments/history?${params}`);
  }

  // 申請提現
  async requestWithdrawal(withdrawalData: any): Promise<ApiResponse> {
    return this.request('/payments/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    });
  }

  // 獲取用戶設置
  async getUserSettings(): Promise<ApiResponse> {
    return this.request('/settings');
  }

  // 更新用戶設置
  async updateUserSettings(settingsData: any): Promise<ApiResponse> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // 提交媒合反饋
  async submitMatchingFeedback(feedbackData: any): Promise<ApiResponse> {
    return this.request('/matching/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  // 評分任務
  async rateTask(taskId: string, ratingData: any): Promise<ApiResponse> {
    return this.request(`/tasks/${taskId}/rate`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }
}

export const apiService = new ApiService();
