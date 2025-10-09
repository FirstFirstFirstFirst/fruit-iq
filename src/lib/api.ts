import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://dapi.werapun.com';

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

    // [...DEBUG] Log request details for debugging
    console.log('[...DEBUG] API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      baseURL: this.baseURL,
      endpoint,
    });

    try {
      const response = await fetch(url, config);

      // [...DEBUG] Log response status
      console.log('[...DEBUG] API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        // [...DEBUG] Log error details
        console.error('[...DEBUG] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url,
        });
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      // [...DEBUG] Log successful response
      console.log('[...DEBUG] API Success Response:', { endpoint, dataReceived: !!data });
      return data;
    } catch (error) {
      // [...DEBUG] Enhanced error logging
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('[...DEBUG] Network Request Failed:', {
          url,
          baseURL: this.baseURL,
          possibleCauses: [
            '1. No internet connection',
            '2. API server is down',
            '3. HTTPS/HTTP mismatch',
            '4. Android network security policy blocking HTTP',
            '5. CORS issues (if running in web)',
            '6. Invalid URL or DNS resolution failure',
          ],
          error: error.message,
          stack: error.stack,
        });
      } else {
        console.error('[...DEBUG] API Request Error:', {
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
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

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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

  async getFarmsByUserId(userId: number): Promise<Farm[]> {
    return apiClient.get<Farm[]>(`/farms/user/${userId}`);
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

// ============================================
// WeighPay API - Fruit Sales Management
// ============================================

// Types for WeighPay
export interface Fruit {
  fruitId: number;
  nameThai: string;
  nameEnglish?: string | null;
  emoji: string;
  pricePerKg: number;
  category?: string | null;
  description?: string | null;
  nutritionFacts?: {
    calories?: number;
    carbs?: number;
    fiber?: number;
    sugar?: number;
    protein?: number;
    fat?: number;
    vitamin_c?: number;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateFruitRequest {
  nameThai: string;
  nameEnglish?: string;
  emoji: string;
  pricePerKg: number;
  category?: string;
  description?: string;
  nutritionFacts?: {
    calories?: number;
    carbs?: number;
    fiber?: number;
    sugar?: number;
    protein?: number;
    fat?: number;
    vitamin_c?: number;
  };
}

export interface UpdateFruitRequest {
  nameThai?: string;
  nameEnglish?: string;
  emoji?: string;
  pricePerKg?: number;
  category?: string;
  description?: string;
  nutritionFacts?: {
    calories?: number;
    carbs?: number;
    fiber?: number;
    sugar?: number;
    protein?: number;
    fat?: number;
    vitamin_c?: number;
  };
}

export interface FruitTransaction {
  transactionId: number;
  fruitId: number;
  weightKg: number;
  pricePerKg: number;
  totalAmount: number;
  qrCodeData?: string | null;
  promptpayPhone?: string | null;
  photoPath?: string | null;
  isSaved: boolean;
  createdAt: string;
  userId: number;
  farmId?: number | null;
  fruit: Fruit;
}

export interface CreateTransactionRequest {
  fruitId: number;
  weightKg: number;
  pricePerKg: number;
  totalAmount: number;
  qrCodeData?: string;
  promptpayPhone?: string;
  photoPath?: string;
  farmId?: number;
}

export interface DailySummary {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  totalWeight: number;
  topFruit?: {
    fruitId: number;
    nameThai: string;
    emoji: string;
    count: number;
  };
}

export interface WeighPaySettings {
  settingsId: number;
  promptpayPhone?: string | null;
  promptpayId?: string | null;
  settings?: any;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface UpdateSettingsRequest {
  promptpayPhone?: string;
  promptpayId?: string;
  settings?: any;
}

// Fruit Management API
export const FruitAPI = {
  async getAllFruits(): Promise<Fruit[]> {
    return apiClient.get<Fruit[]>('/fruits');
  },

  async getFruitById(fruitId: number): Promise<Fruit> {
    return apiClient.get<Fruit>(`/fruits/${fruitId}`);
  },

  async createFruit(fruit: CreateFruitRequest): Promise<{ message: string; fruit: Fruit }> {
    return apiClient.post<{ message: string; fruit: Fruit }>('/fruits', fruit);
  },

  async updateFruit(fruitId: number, updates: UpdateFruitRequest): Promise<Fruit> {
    return apiClient.put<Fruit>(`/fruits/${fruitId}`, updates);
  },

  async deleteFruit(fruitId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/fruits/${fruitId}`);
  }
};

// Transaction Management API
export const TransactionAPI = {
  async getAllTransactions(params?: {
    startDate?: string;
    endDate?: string;
    isSaved?: boolean;
    fruitId?: number;
  }): Promise<FruitTransaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.isSaved !== undefined) queryParams.append('isSaved', params.isSaved.toString());
    if (params?.fruitId) queryParams.append('fruitId', params.fruitId.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/fruit-transactions?${queryString}` : '/fruit-transactions';

    return apiClient.get<FruitTransaction[]>(endpoint);
  },

  async getTransactionById(transactionId: number): Promise<FruitTransaction> {
    return apiClient.get<FruitTransaction>(`/fruit-transactions/${transactionId}`);
  },

  async getDailySummary(date?: string): Promise<DailySummary> {
    const queryParams = date ? `?date=${date}` : '';
    return apiClient.get<DailySummary>(`/fruit-transactions/daily-summary${queryParams}`);
  },

  async createTransaction(transaction: CreateTransactionRequest): Promise<{ message: string; transaction: FruitTransaction }> {
    return apiClient.post<{ message: string; transaction: FruitTransaction }>(
      '/fruit-transactions',
      transaction
    );
  },

  async markAsSaved(transactionId: number): Promise<{ message: string; transaction: FruitTransaction }> {
    return apiClient.patch<{ message: string; transaction: FruitTransaction }>(
      `/fruit-transactions/${transactionId}/save`
    );
  }
};

// Settings Management API
export const SettingsAPI = {
  async getSettings(): Promise<WeighPaySettings | null> {
    try {
      return await apiClient.get<WeighPaySettings>('/weighpay-settings');
    } catch (error) {
      // Return null if settings don't exist yet
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async updateSettings(settings: UpdateSettingsRequest): Promise<{ message: string; settings: WeighPaySettings }> {
    return apiClient.put<{ message: string; settings: WeighPaySettings }>(
      '/weighpay-settings',
      settings
    );
  }
};

// ============================================
// Weight Detection API - Scale Image Processing
// ============================================

export interface WeightDetectionResult {
  weight: number;
}

export interface ProcessImageRequest {
  imageBase64?: string;
  imageUrl?: string;
}

// Weight Detection API
export const WeightDetectionAPI = {
  async processImage(imageBase64: string): Promise<WeightDetectionResult> {
    return apiClient.post<WeightDetectionResult>('/weight-detection/process', {
      imageBase64,
    });
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return apiClient.get<{ success: boolean; message: string }>('/weight-detection/test');
  },

  async getStatus(): Promise<{ configured: boolean; available: boolean }> {
    return apiClient.get<{ configured: boolean; available: boolean }>('/weight-detection/status');
  }
};