// src/contexts/AuthContext.tsx
import StorageKeys from "@/constants/storageConstants";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/store/localStorage";
import { DemoUser, demoUsers } from "@/types/mockData";
import type { ApiResponse } from "@/types/responses";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// REMOVED: 'superadmin' role - platform admin features moved to separate platform admin app
export type UserRole =
  | "org-owner"
  | "org-admin"

export type Permission =
  | "dashboard.view"

// REMOVED: superadmin role permissions - platform admin features moved to platform admin app
const rolePermissions: Record<UserRole, Permission[]> = {
  "org-owner": [
    "dashboard.view",
  ],
  "org-admin": [
    "dashboard.view",
  ],
 
};

export { demoUsers, rolePermissions };

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: string;
}

interface SessionPayload {
  token: string;
  tokenType?: string;
  expiresAt?: number;
  refreshToken?: string;
  refreshExpiresAt?: number;
  userId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<ApiResponse<any>>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  getPermissions: () => Permission[];
  getRolePermissions: (role: UserRole) => Permission[];
  getDemoUsers: () => DemoUser[];
  createDemoUser: (userData: Omit<DemoUser, "id" | "createdAt">) => DemoUser;
  updateDemoUserPassword: (userId: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // demo users (encrypted)
  const [users, setUsers] = useState<DemoUser[]>(() => {
    try {
      const stored = getStorageItem<DemoUser[]>(StorageKeys.DEMO_USERS);
      return stored && Array.isArray(stored) ? stored : demoUsers;
    } catch {
      return demoUsers;
    }
  });

  // user (encrypted)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = getStorageItem<User>(StorageKeys.USER);
      if (stored && typeof stored.id === "string") {
        return stored;
      }
    } catch (e) {
      // ignore
      // console.error("Failed to parse stored user", e);
    }
    return null;
  });

  // Authenticate user - TODO: Replace with real API when available
  const login = async (username: string, password: string): Promise<ApiResponse<any>> => {
    try {
      // ============ REAL API LOGIN (commented out for now) ============
      // Uncomment this section when backend API is ready
      /*
      const response = await apiLogin(username, password, "default");
      if (!response.success) {
        return response;
      }

      // Extract auth payload
      const authData = response.data;

      // Decode or build user info (you might replace with real user info from backend)
      const authenticatedUser: User = {
        id: username,
        name: username,
        email: username,
        role: "org-admin", // default role; replace when backend gives role
      };

      // Save to state
      setUser(authenticatedUser);

      // Persist encrypted user and session
      setStorageItem(StorageKeys.USER, authenticatedUser);
      const sessionPayload: SessionPayload = {
        token: authData.access_token,
        tokenType: authData.token_type,
        expiresAt: Date.now() + authData.expires_in * 1000,
        refreshToken: authData.refresh_token,
        refreshExpiresAt: Date.now() + authData.refresh_expires_in * 1000,
        userId: username,
      };
      setStorageItem(StorageKeys.SESSION, sessionPayload);

      return response;
      */

      // ============ DUMMY LOGIN (for development/testing) ============
      // Remove this section when switching to real API
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Basic validation (accept any non-empty username/password)
      if (!username || !password) {
        return { 
          success: false, 
          message: "Username and password are required", 
          data: null, 
          code: "VALIDATION_ERROR" 
        };
      }

      // Create dummy user
      const authenticatedUser: User = {
        id: `user-${Date.now()}`,
        name: username,
        email: `${username}@example.com`,
        role: "org-admin", // Change role as needed: "org-owner" | "org-admin"
      };

      // Create dummy session with fake tokens
      const sessionPayload: SessionPayload = {
        token: `dummy_access_token_${Date.now()}`,
        tokenType: "Bearer",
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
        refreshToken: `dummy_refresh_token_${Date.now()}`,
        refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        userId: authenticatedUser.id,
      };

      // Save to state
      setUser(authenticatedUser);

      // Persist encrypted user and session to localStorage
      setStorageItem(StorageKeys.USER, authenticatedUser);
      setStorageItem(StorageKeys.SESSION, sessionPayload);

      return { 
        success: true, 
        message: "Login successful", 
        data: sessionPayload, 
        code: "SUCCESS" 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      return { success: false, message: errorMessage, data: null, code: "ERROR" };
    }
  };

  const logout = () => {
    setUser(null);
    removeStorageItem(StorageKeys.USER);
    removeStorageItem(StorageKeys.SESSION);
  };

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) ?? false;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const getPermissions = (): Permission[] => {
    if (!user) return [];
    return rolePermissions[user.role] || [];
  };

  const getRolePermissions = (role: UserRole): Permission[] => {
    return rolePermissions[role] || [];
  };

  const getDemoUsers = (): DemoUser[] => {
    return users;
  };

  // TODO: Replace with real API to create users in database
  const createDemoUser = (userData: Omit<DemoUser, "id" | "createdAt">): DemoUser => {
    const newUser: DemoUser = {
      ...userData,
      id: "user-" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setStorageItem(StorageKeys.DEMO_USERS, updatedUsers);

    return newUser;
  };

  // TODO: Replace with real password reset flow (email, secure tokens, etc.)
  const updateDemoUserPassword = (userId: string): string => {
    const newPassword = Math.random().toString(36).slice(-8);
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u));

    setUsers(updatedUsers);
    setStorageItem(StorageKeys.DEMO_USERS, updatedUsers);

    return newPassword;
  };

  const isAuthenticated = user !== null;

  // On mount, validate stored session (encrypted). If expired, clear stored values and sign out.
  useEffect(() => {
    try {
      const session = getStorageItem<SessionPayload>(StorageKeys.SESSION);
      if (session?.expiresAt && Date.now() > session.expiresAt) {
        // Session expired: clear stored values and local state
        removeStorageItem(StorageKeys.USER);
        removeStorageItem(StorageKeys.SESSION);
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to validate stored session", e);
      // In case of corruption, clear to avoid inconsistent state
      removeStorageItem(StorageKeys.USER);
      removeStorageItem(StorageKeys.SESSION);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        can,
        hasRole,
        getPermissions,
        getRolePermissions,
        getDemoUsers,
        createDemoUser,
        updateDemoUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
