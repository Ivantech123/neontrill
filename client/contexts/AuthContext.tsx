import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api";

interface User {
  address: string;
  balance?: number;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (address: string, signature: string, payload: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized functions to prevent recreating on every render
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    apiClient.clearToken();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const profile = await apiClient.getUserProfile();
      setUser({
        address: profile.address,
        username: profile.address.slice(0, 8) + "...",
        balance: profile.totalWinnings,
      });
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  }, [token]);

  const login = useCallback(
    async (address: string, signature: string, payload: string) => {
      try {
        const response = await apiClient.verifyWallet({
          address,
          signature,
          payload,
        });

        setToken(response.token);
        setUser({ address });
        localStorage.setItem("authToken", response.token);

        // Get full user profile
        await refreshUser();
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [refreshUser],
  );

  // Initialize only once on mount
  useEffect(() => {
    if (isInitialized) return;

    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      apiClient.setToken(savedToken);

      // Load user profile silently without causing re-renders
      apiClient
        .getUserProfile()
        .then((profile) => {
          setUser({
            address: profile.address,
            username: profile.address.slice(0, 8) + "...",
            balance: profile.totalWinnings,
          });
        })
        .catch(() => {
          // Token might be expired, clear it
          setUser(null);
          setToken(null);
          localStorage.removeItem("authToken");
          apiClient.clearToken();
        });
    }

    setIsInitialized(true);
  }, [isInitialized]);

  const isAuthenticated = !!token && !!user;

  const value = React.useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      logout,
      refreshUser,
    }),
    [user, token, isAuthenticated, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
