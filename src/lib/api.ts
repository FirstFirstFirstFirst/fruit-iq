import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://dapi.werapun.com';

// Types
export interface User {
  userId: number;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  thumbURL: string | null;
  photoURL: string | null;
  birthDay: string | null;
  provider: string | null;
  gender: string | null;
  phone: string | null;
  verified: boolean | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isAdmin: boolean;
  isExpert: boolean;
  access_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface Farm {
  farmId: number;
  farmName: string;
  farmLocation: string | null;
  farmProvince: string;
  farmDurianSpecies: string | null;
  farmPhoto: string | null;
  farmStatus: string | null;
  farmPollinationDate: string | null;
  farmTree: number | null;
  farmSpace: number;
  latitude: number;
  longitude: number;
  durianAmount: number | null;
  userId: number;
}

export interface CreateFarmRequest {
  farmName: string;
  farmLocation?: string;
  farmProvince: string;
  farmDurianSpecies?: string;
  farmSpace: number;
  latitude: number;
  longitude: number;
  userId: number;
  farmPhoto?: File;
}

export interface Activity {
  activityType: string;
  date: string;
  notes: string;
  cost: number;
  revenue: number;
  cropId?: number;
}

// Token management
export const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('access_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('access_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  async getUserId(): Promise<number | null> {
    try {
      const userIdStr = await SecureStore.getItemAsync('user_id');
      return userIdStr ? parseInt(userIdStr, 10) : null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  async setUserId(userId: number): Promise<void> {
    try {
      await SecureStore.setItemAsync('user_id', userId.toString());
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  },

  async removeUserId(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('user_id');
    } catch (error) {
      console.error('Error removing user ID:', error);
    }
  }
};

// API client with automatic token handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await TokenManager.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await TokenManager.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API FormData request failed:', error);
      throw error;
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const AuthAPI = {
  async login(credentials: LoginRequest): Promise<User> {
    const user = await apiClient.post<User>('/auth/login', credentials);

    // Store token and user ID securely
    await TokenManager.setToken(user.access_token);
    await TokenManager.setUserId(user.userId);

    return user;
  },

  async signup(userData: SignupRequest): Promise<User> {
    const user = await apiClient.post<User>('/auth/signup', userData);

    // Store token and user ID securely
    await TokenManager.setToken(user.access_token);
    await TokenManager.setUserId(user.userId);

    return user;
  },

  async logout(): Promise<void> {
    await TokenManager.removeToken();
    await TokenManager.removeUserId();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    return !!token;
  }
};

// Farm API
export const FarmAPI = {
  async createFarm(farmData: CreateFarmRequest): Promise<{ message: string; createdFarm: Farm }> {
    const formData = new FormData();

    // Add farm data as JSON string
    const { farmPhoto, ...farmDetails } = farmData;
    formData.append('createFarmDto', JSON.stringify(farmDetails));

    // Add photo if provided
    if (farmPhoto) {
      formData.append('file', farmPhoto as any);
    }

    return apiClient.postFormData<{ message: string; createdFarm: Farm }>('/farms', formData);
  },

  async getFarms(): Promise<Farm[]> {
    return apiClient.get<Farm[]>('/farms');
  },

  async getFarm(farmId: number): Promise<Farm> {
    return apiClient.get<Farm>(`/farms/${farmId}`);
  }
};

// Activity API
export const ActivityAPI = {
  async addActivity(farmId: number, activity: Activity): Promise<any> {
    return apiClient.post(`/farms/addActivity/${farmId}`, activity);
  }
};

// Utility function to create fruit sale activity
export const createFruitSaleActivity = async (
  farmId: number,
  fruitName: string,
  weight: number,
  revenue: number,
  notes?: string
): Promise<void> => {
  const activity: Activity = {
    activityType: 'sale', // or 'harvest' depending on your activity types
    date: new Date().toISOString(),
    notes: notes || `ขายผลไม้ ${fruitName} น้ำหนัก ${weight} กก.`,
    cost: 0,
    revenue: revenue,
  };

  await ActivityAPI.addActivity(farmId, activity);
};