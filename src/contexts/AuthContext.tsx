import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { AuthAPI, Farm, FarmAPI, TokenManager, User } from "../lib/api";

interface AuthContextType {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Farm state
  farms: Farm[];
  selectedFarm: Farm | null;
  farmsLoading: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Farm methods
  refreshFarms: () => Promise<void>;
  selectFarm: (farm: Farm) => void;
  createFarm: (farmData: any) => Promise<Farm | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [farmsLoading, setFarmsLoading] = useState<boolean>(false);

  const loadFarms = useCallback(async (userId: number) => {
    try {
      setFarmsLoading(true);
      const userFarms = await FarmAPI.getFarmsByUserId(userId);
      setFarms(userFarms);

      // Auto-select first farm if no farm is selected
      if (userFarms.length > 0 && !selectedFarm) {
        setSelectedFarm(userFarms[0]);
      }
    } catch (error) {
      console.error("Error loading farms:", error);
      // Don't show alert for farm loading errors, as user might not have farms yet
    } finally {
      setFarmsLoading(false);
    }
  }, [selectedFarm]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await AuthAPI.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // For now, we don't have a user profile endpoint, so we'll set basic user data
        const userId = await TokenManager.getUserId();
        if (userId) {
          setUser({
            userId,
            email: "", // Will be filled when we have profile endpoint
            name: "",
            firstName: null,
            lastName: null,
            nickname: null,
            thumbURL: null,
            photoURL: null,
            birthDay: null,
            provider: null,
            gender: null,
            phone: null,
            verified: null,
            createdAt: "",
            updatedAt: "",
            deletedAt: null,
            isAdmin: false,
            isExpert: false,
            access_token: (await TokenManager.getToken()) || "",
          });
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load farms when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      loadFarms(user.userId);
    }
  }, [isAuthenticated, user?.userId, loadFarms]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await AuthAPI.login({ email, password });
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await AuthAPI.signup({ email, password, name });
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert(
        "สมัครสมาชิกไม่สำเร็จ",
        "ไม่สามารถสมัครสมาชิกได้ กรุณาตรวจสอบข้อมูลและลองอีกครั้ง"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      setFarms([]);
      setSelectedFarm(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshFarms = async (): Promise<void> => {
    if (user?.userId) {
      await loadFarms(user.userId);
    }
  };

  const selectFarm = (farm: Farm): void => {
    setSelectedFarm(farm);
  };

  const createFarm = async (farmData: any): Promise<Farm | null> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const farmRequest = {
        ...farmData,
        userId: user.userId,
      };

      const response = await FarmAPI.createFarm(farmRequest);
      const newFarm = response.createdFarm;

      // Add new farm to the list
      setFarms((prev) => [...prev, newFarm]);

      // Auto-select the new farm if it's the first one
      if (farms.length === 0) {
        setSelectedFarm(newFarm);
      }

      return newFarm;
    } catch (error) {
      console.error("Error creating farm:", error);
      Alert.alert(
        "ไม่สามารถสร้างฟาร์มได้",
        "เกิดข้อผิดพลาดในการสร้างฟาร์ม กรุณาลองอีกครั้ง"
      );
      return null;
    }
  };

  const value: AuthContextType = {
    // User state
    user,
    isAuthenticated,
    isLoading,

    // Farm state
    farms,
    selectedFarm,
    farmsLoading,

    // Auth methods
    login,
    signup,
    logout,

    // Farm methods
    refreshFarms,
    selectFarm,
    createFarm,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
