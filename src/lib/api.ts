const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 添加認證token
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

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
  }): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // 用戶登入
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // 獲取用戶資料
  async getProfile(): Promise<ApiResponse> {
    return this.request('/auth/profile');
  }

  // 更新用戶資料
  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // 獲取任務列表
  async getTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    content_type?: string;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    
    return this.request(endpoint);
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
  async getPublicTasks(): Promise<ApiResponse> {
    return this.request('/tasks/public');
  }

  // 獲取任務推薦
  async getTaskRecommendations(): Promise<ApiResponse> {
    return this.request('/tasks/recommendations');
  }

  // 獲取媒合建議
  async getMatchingSuggestions(): Promise<ApiResponse> {
    return this.request('/matching/suggestions');
  }

  // 獲取儀表板統計
  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/stats/dashboard');
  }

  // 獲取管理員儀表板數據
  async getAdminDashboard(): Promise<ApiResponse> {
    return this.request('/admin/dashboard');
  }

  // 獲取用戶列表（管理員）
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    return this.request(endpoint);
  }

  // 獲取任務列表（管理員）
  async getAdminTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/tasks?${queryString}` : '/admin/tasks';
    
    return this.request(endpoint);
  }
}

export const apiService = new ApiService();
export type { ApiResponse };
