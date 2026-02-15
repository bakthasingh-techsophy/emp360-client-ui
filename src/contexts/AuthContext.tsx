// src/contexts/AuthContext.tsx
import StorageKeys from "@/constants/storageConstants";
import { useToast } from "@/hooks/use-toast";
import { apiLogin } from "@/services/authService";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/store/localStorage";
import { DemoUser, demoUsers } from "@/types/mockData";
import type { ApiResponse } from "@/types/responses";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { hasResourceAccess, getResourceRoles, hasResourceRole, getAvailableResources, decodeJWT } from "@/lib/tokenUtils";

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
  employeeId?: string;
  orgId?: string;
  companyId?: string;
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
  token: string | null;
  employeeId: string | null;
  login: (username: string, password: string) => Promise<ApiResponse<any>>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  getPermissions: () => Permission[];
  getRolePermissions: (role: UserRole) => Permission[];
  getDemoUsers: () => DemoUser[];
  createDemoUser: (userData: Omit<DemoUser, "id" | "createdAt">) => DemoUser;
  updateDemoUserPassword: (userId: string) => string;
  // Resource access methods based on JWT token
  hasResourceAccess: (resource: string) => boolean;
  getResourceRoles: (resource: string) => string[];
  hasResourceRole: (resource: string, role: string) => boolean;
  getAvailableResources: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // token state
  const [token, setToken] = useState<string | null>(() => {
    try {
      const session = getStorageItem<SessionPayload>(StorageKeys.SESSION);
      return session?.token || null;
    } catch {
      return null;
    }
  });

  // employeeId state
  const [employeeId, setEmployeeId] = useState<string | null>(() => {
    try {
      const stored = getStorageItem<string>(StorageKeys.EMPLOYEE_ID);
      return stored || null;
    } catch {
      return null;
    }
  });
  
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

  // Authenticate user with Keycloak
  const login = async (username: string, password: string): Promise<ApiResponse<any>> => {
    try {
      // ============ REAL API LOGIN - Keycloak Integration ============
      // Call Keycloak authentication endpoint
      const response = await apiLogin(username, password, "test-realm");
      
      if (!response.success) {
        // Show error toast with descriptive message
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: response.message,
        });
        return response;
      }

      // Extract auth payload from Keycloak response
      const authData = response.data;

      // Decode JWT to extract additional claims
      const decodedToken = decodeJWT(authData.access_token);
      const tokenEmployeeId = decodedToken?.employeeId || "";

      // Create authenticated user object
      // Note: Username is used as ID (can be enhanced to fetch full user details from backend later)
      const authenticatedUser: User = {
        id: username,
        name: username,
        email: `${username}@company.com`, // Can be fetched from backend user service
        role: "org-admin", // Default role; should be fetched from backend
        employeeId: tokenEmployeeId,
      };

      // Save user to state
      setUser(authenticatedUser);

      // Persist encrypted user to localStorage
      setStorageItem(StorageKeys.USER, authenticatedUser);

      // Save employeeId to state and localStorage
      setEmployeeId(tokenEmployeeId);
      setStorageItem(StorageKeys.EMPLOYEE_ID, tokenEmployeeId);

      // Create session payload with token and expiry information
      const sessionPayload: SessionPayload = {
        token: authData.access_token,
        tokenType: authData.token_type,
        expiresAt: Date.now() + authData.expires_in * 1000, // Convert seconds to milliseconds
        refreshToken: authData.refresh_token,
        refreshExpiresAt: Date.now() + authData.refresh_expires_in * 1000, // Convert seconds to milliseconds
        userId: username,
      };

      // Persist encrypted session to localStorage
      setStorageItem(StorageKeys.SESSION, sessionPayload);
      
      // Set token in state
      setToken(authData.access_token);

      // Persist realm/tenant to localStorage (hardcoded as 'test-realm' for now)
      setStorageItem(StorageKeys.TENANT, 'test-realm');

      return {
        success: true,
        message: "Login successful",
        data: sessionPayload,
        code: "SUCCESS",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Login Error",
        description: errorMessage,
      });
      
      return { 
        success: false, 
        message: errorMessage, 
        data: null, 
        code: "ERROR" 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEmployeeId(null);
    removeStorageItem(StorageKeys.USER);
    removeStorageItem(StorageKeys.SESSION);
    removeStorageItem(StorageKeys.EMPLOYEE_ID);
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
        token,
        employeeId,
        login,
        logout,
        can,
        hasRole,
        getPermissions,
        getRolePermissions,
        getDemoUsers,
        createDemoUser,
        updateDemoUserPassword,
        // Resource access methods
        hasResourceAccess: (resource: string) => token ? hasResourceAccess(token, resource) : false,
        getResourceRoles: (resource: string) => token ? getResourceRoles(token, resource) : [],
        hasResourceRole: (resource: string, role: string) => token ? hasResourceRole(token, resource, role) : false,
        getAvailableResources: () => token ? getAvailableResources(token) : [],
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
