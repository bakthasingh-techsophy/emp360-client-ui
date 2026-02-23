/**
 * Role Management Context
 * Manages all role-related operations and provides centralized API access with built-in error/success notifications
 *
 * Features:
 * - Client and Role CRUD operations
 * - User role assignment and revocation
 * - Automatic error toast notifications for all operations
 * - Success toast notifications for create, update, delete operations
 * - Single unified loading state for async operations
 * - Auto token validation and tenant resolution
 */

import { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  resolveAuth,
  removeStorageItem,
} from "@/store/localStorage";
import StorageKeys from "@/constants/storageConstants";

// Role Management Service
import {
  apiGetClientsAndRoles,
  apiCreateClient,
  apiDeleteClient,
  apiCreateRole,
  apiDeleteRole,
  apiAssignRoles,
  apiRevokeRoles,
  apiGetUserClientRoles,
} from "@/services/roleManagementService";

// Types
import {
  ClientsAndRolesResponse,
  CreateClientRequest,
  CreateRoleRequest,
  DeleteClientRequest,
  DeleteRoleRequest,
  UserClientRolesRequest,
  UserClientRolesInfo,
} from "@/modules/role-management/types";

/**
 * Role Management Context Type Definition
 */
interface RoleManagementContextType {
  // Client Methods
  getClientsAndRoles: () => Promise<ClientsAndRolesResponse | null>;
  createClient: (request: CreateClientRequest) => Promise<boolean>;
  deleteClient: (request: DeleteClientRequest) => Promise<boolean>;
  
  // Role Methods
  createRole: (request: CreateRoleRequest) => Promise<boolean>;
  deleteRole: (request: DeleteRoleRequest) => Promise<boolean>;
  
  // User Role Assignment Methods
  assignRoles: (request: UserClientRolesRequest) => Promise<UserClientRolesInfo | null>;
  revokeRoles: (request: UserClientRolesRequest) => Promise<UserClientRolesInfo | null>;
  getUserClientRoles: (userId: string, clientId: string) => Promise<UserClientRolesInfo | null>;
  
  // Loading State
  isLoading: boolean;
}

const RoleManagementContext = createContext<
  RoleManagementContextType | undefined
>(undefined);

export function RoleManagementProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate Token
   * Checks if token exists and is not expired, shows error toast if invalid
   */
  const validateToken = (): { tenant: string; token: string } | null => {
    const auth = resolveAuth();

    if (!auth.accessToken) {
      handleError(
        new Error("Session expired. Please login again."),
        "Authentication Failed",
      );
      removeStorageItem(StorageKeys.SESSION);
      return null;
    }

    return { tenant: auth.tenant || "", token: auth.accessToken };
  };

  /**
   * Handle Error
   * Shows error toast notification
   */
  const handleError = (error: any, title: string = "Operation Failed") => {
    console.error(`[RoleManagement] ${title}:`, error);

    let description = "An unexpected error occurred";
    if (error?.response?.data?.message) {
      description = error.response.data.message;
    } else if (error?.message) {
      description = error.message;
    }

    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  /**
   * Handle Success
   * Shows success toast notification
   */
  const handleSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };

  /**
   * Execute API Call
   * Wrapper for all API calls with loading state management
   */
  const executeApiCall = async <T,>(
    apiCall: () => Promise<T>,
  ): Promise<T | null> => {
    setIsLoading(true);

    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error("[RoleManagement] API call failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ============= CLIENT METHODS =============

  /**
   * Get All Clients and Their Roles
   * Fetches all Keycloak clients and their associated roles
   */
  const getClientsAndRoles = async (): Promise<ClientsAndRolesResponse | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(
        () => apiGetClientsAndRoles(auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to fetch clients and roles"), "Fetch Failed");
        return null;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to fetch clients and roles"), "Fetch Failed");
        return null;
      }

      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Fetch Clients and Roles");
      return null;
    }
  };

  /**
   * Create a New Client
   * Creates a new Keycloak client
   */
  const createClient = async (request: CreateClientRequest): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    try {
      const result = await executeApiCall(
        () => apiCreateClient(request, auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to create client"), "Create Failed");
        return false;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to create client"), "Create Failed");
        return false;
      }

      handleSuccess("Client Created", `Client "${request.clientId}" has been created successfully.`);
      return true;
    } catch (error) {
      handleError(error, "Failed to Create Client");
      return false;
    }
  };

  /**
   * Delete Client
   * Deletes a Keycloak client
   */
  const deleteClient = async (request: DeleteClientRequest): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    try {
      const result = await executeApiCall(
        () => apiDeleteClient(request, auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to delete client"), "Delete Failed");
        return false;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to delete client"), "Delete Failed");
        return false;
      }

      handleSuccess("Client Deleted", "Client has been deleted successfully.");
      return true;
    } catch (error) {
      handleError(error, "Failed to Delete Client");
      return false;
    }
  };

  // ============= ROLE METHODS =============

  /**
   * Create a New Role
   * Creates a new role within a specific client
   */
  const createRole = async (request: CreateRoleRequest): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    try {
      const result = await executeApiCall(
        () => apiCreateRole(request, auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to create role"), "Create Failed");
        return false;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to create role"), "Create Failed");
        return false;
      }

      handleSuccess("Role Created", `Role "${request.roleName}" has been created successfully.`);
      return true;
    } catch (error) {
      handleError(error, "Failed to Create Role");
      return false;
    }
  };

  /**
   * Delete Role
   * Deletes a role from a client
   */
  const deleteRole = async (request: DeleteRoleRequest): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    try {
      const result = await executeApiCall(
        () => apiDeleteRole(request, auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to delete role"), "Delete Failed");
        return false;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to delete role"), "Delete Failed");
        return false;
      }

      handleSuccess("Role Deleted", "Role has been deleted successfully.");
      return true;
    } catch (error) {
      handleError(error, "Failed to Delete Role");
      return false;
    }
  };

  // ============= USER ROLE ASSIGNMENT METHODS =============

  /**
   * Assign Roles to User
   * Assigns one or more roles from a client to a user
   * Returns the updated user role information
   */
  const assignRoles = async (assignment: UserClientRolesRequest): Promise<UserClientRolesInfo | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(
        () => apiAssignRoles(assignment, auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to assign roles"), "Assignment Failed");
        return null;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to assign roles"), "Assignment Failed");
        return null;
      }

      handleSuccess(
        "Roles Assigned",
        `${assignment.roleNames.length} role(s) have been assigned successfully.`
      );
      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Assign Roles");
      return null;
    }
  };

  /**
   * Revoke Roles from User
   * Revokes one or more roles from a user
   * Returns the updated user role information
   */
  const revokeRoles = async (assignment: UserClientRolesRequest): Promise<UserClientRolesInfo | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(
        () => apiRevokeRoles(assignment, auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to revoke roles"), "Revocation Failed");
        return null;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to revoke roles"), "Revocation Failed");
        return null;
      }

      handleSuccess(
        "Roles Revoked",
        `${assignment.roleNames.length} role(s) have been revoked successfully.`
      );
      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Revoke Roles");
      return null;
    }
  };

  /**
   * Get User Client Roles
   * Fetches all roles assigned to a specific user for a specific client
   */
  const getUserClientRoles = async (userId: string, clientId: string): Promise<UserClientRolesInfo | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(
        () => apiGetUserClientRoles(userId, clientId, auth.tenant, auth.token),
      );

      if (!result) {
        handleError(new Error("Failed to fetch user roles"), "Fetch Failed");
        return null;
      }

      if (!result.success) {
        handleError(new Error(result.message || "Failed to fetch user roles"), "Fetch Failed");
        return null;
      }

      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Fetch User Roles");
      return null;
    }
  };

  // ============= CONTEXT VALUE =============

  const value: RoleManagementContextType = {
    // Client Methods
    getClientsAndRoles,
    createClient,
    deleteClient,
    
    // Role Methods
    createRole,
    deleteRole,
    
    // User Role Assignment Methods
    assignRoles,
    revokeRoles,
    getUserClientRoles,
    
    // Loading State
    isLoading,
  };

  return (
    <RoleManagementContext.Provider value={value}>
      {children}
    </RoleManagementContext.Provider>
  );
}

/**
 * Custom hook to use Role Management Context
 */
export function useRoleManagement() {
  const context = useContext(RoleManagementContext);
  if (context === undefined) {
    throw new Error(
      "useRoleManagement must be used within a RoleManagementProvider",
    );
  }
  return context;
}
