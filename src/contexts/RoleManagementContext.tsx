/**
 * Role Management Context
 * Manages all role-related operations and provides centralized API access with built-in error/success notifications
 *
 * Features:
 * - Resource CRUD operations via Role Management Service
 * - Role CRUD operations (search + detail operations)
 * - Automatic error/success toast notifications
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

// Resource Service Imports (Detail operations)
import {
  apiGetResourceById,
  apiSearchResources,
} from "@/services/resourceService";

// Roles List Service Imports (Detail operations)
import {
  apiGetRoleById,
  apiSearchRoles,
} from "@/services/rolesListService";

// Role Management Service Imports
import {
  apiCreateResourceViaRoleManagement,
  apiUpdateResourceViaRoleManagement,
  apiDeleteResourceViaRoleManagement,
  apiCreateRoleViaRoleManagement,
  apiUpdateRoleViaRoleManagement,
  apiDeleteRoleViaRoleManagement,
} from "@/services/roleManagementService";

// Type Imports
import {
  Resource,
  ResourceCarrier,
  RoleModel,
  RoleModelCarrier,
  UpdatePayload,
} from "@/modules/role-management/types";
import UniversalSearchRequest from "@/types/search";
import Pagination from "@/types/pagination";

/**
 * Role Management Context Type Definition
 */
interface RoleManagementContextType {
  // Resource Methods (Detail operations)
  getResourceById: (id: string) => Promise<Resource | null>;
  refreshResources: (searchRequest: UniversalSearchRequest, page?: number, pageSize?: number) => Promise<Pagination<Resource> | null>;

  // Resource Methods (Via Role Management Service)
  createResourceViaRoleManagement: (carrier: ResourceCarrier) => Promise<Resource | null>;
  updateResourceViaRoleManagement: (id: string, payload: UpdatePayload) => Promise<Resource | null>;
  deleteResourceViaRoleManagement: (id: string) => Promise<boolean>;

  // Role Methods (Detail operations)
  getRoleById: (id: string) => Promise<RoleModel | null>;
  refreshRoles: (searchRequest: UniversalSearchRequest, page?: number, pageSize?: number) => Promise<Pagination<RoleModel> | null>;

  // Role Methods (Via Role Management Service)
  createRoleViaRoleManagement: (resourceId: string, carrier: RoleModelCarrier) => Promise<RoleModel | null>;
  updateRoleViaRoleManagement: (id: string, payload: UpdatePayload) => Promise<RoleModel | null>;
  deleteRoleViaRoleManagement: (id: string) => Promise<boolean>;

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
        "Authentication Failed"
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
    apiCall: () => Promise<T>
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

  // ============= RESOURCE METHODS (VIA ROLE MANAGEMENT SERVICE) =============

  /**
   * Create a New Resource via Role Management Service
   */
  const createResourceViaRoleManagement = async (
    carrier: ResourceCarrier
  ): Promise<Resource | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiCreateResourceViaRoleManagement(carrier, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to create resource"),
          "Create Failed"
        );
        return null;
      }

      handleSuccess(
        "Resource Created",
        `Resource "${carrier.name}" has been created successfully.`
      );
      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Create Resource");
      return null;
    }
  };

  /**
   * Update a Resource via Role Management Service
   */
  const updateResourceViaRoleManagement = async (
    id: string,
    payload: UpdatePayload
  ): Promise<Resource | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiUpdateResourceViaRoleManagement(id, payload, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to update resource"),
          "Update Failed"
        );
        return null;
      }

      handleSuccess("Resource Updated", "Resource has been updated successfully.");
      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Update Resource");
      return null;
    }
  };

  /**
   * Delete a Resource via Role Management Service
   */
  const deleteResourceViaRoleManagement = async (id: string): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    try {
      const result = await executeApiCall(() =>
        apiDeleteResourceViaRoleManagement(id, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to delete resource"),
          "Delete Failed"
        );
        return false;
      }

      handleSuccess("Resource Deleted", "Resource has been deleted successfully.");
      return true;
    } catch (error) {
      handleError(error, "Failed to Delete Resource");
      return false;
    }
  };

  // ============= RESOURCE METHODS (DETAIL OPERATIONS) =============

  /**
   * Get a Specific Resource by ID
   */
  const getResourceById = async (id: string): Promise<Resource | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiGetResourceById(id, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to fetch resource"),
          "Fetch Failed"
        );
        return null;
      }

      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Fetch Resource");
      return null;
    }
  };

  /**
   * Refresh Resources with Pagination
   */
  const refreshResources = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<Resource> | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiSearchResources(searchRequest, page, pageSize, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to fetch resources"),
          "Fetch Failed"
        );
        return null;
      }

      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Fetch Resources");
      return null;
    }
  };

  // ============= ROLE METHODS (VIA ROLE MANAGEMENT SERVICE) =============

  /**
   * Create a New Role via Role Management Service
   */
  const createRoleViaRoleManagement = async (
    resourceId: string,
    carrier: RoleModelCarrier
  ): Promise<RoleModel | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiCreateRoleViaRoleManagement(resourceId, carrier, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to create role"),
          "Create Failed"
        );
        return null;
      }

      handleSuccess(
        "Role Created",
        `Role "${carrier.roleName}" has been created successfully.`
      );
      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Create Role");
      return null;
    }
  };

  /**
   * Update a Role via Role Management Service
   */
  const updateRoleViaRoleManagement = async (
    id: string,
    payload: UpdatePayload
  ): Promise<RoleModel | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiUpdateRoleViaRoleManagement(id, payload, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to update role"),
          "Update Failed"
        );
        return null;
      }

      handleSuccess("Role Updated", "Role has been updated successfully.");
      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Update Role");
      return null;
    }
  };

  /**
   * Delete a Role via Role Management Service
   */
  const deleteRoleViaRoleManagement = async (id: string): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    try {
      const result = await executeApiCall(() =>
        apiDeleteRoleViaRoleManagement(id, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to delete role"),
          "Delete Failed"
        );
        return false;
      }

      handleSuccess("Role Deleted", "Role has been deleted successfully.");
      return true;
    } catch (error) {
      handleError(error, "Failed to Delete Role");
      return false;
    }
  };

  // ============= ROLE METHODS (DETAIL OPERATIONS) =============

  /**
   * Get a Specific Role by ID
   */
  const getRoleById = async (id: string): Promise<RoleModel | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiGetRoleById(id, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to fetch role"),
          "Fetch Failed"
        );
        return null;
      }

      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Fetch Role");
      return null;
    }
  };

  /**
   * Refresh Roles with Pagination
   */
  const refreshRoles = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<RoleModel> | null> => {
    const auth = validateToken();
    if (!auth) return null;

    try {
      const result = await executeApiCall(() =>
        apiSearchRoles(searchRequest, page, pageSize, auth.tenant, auth.token)
      );

      if (!result || !result.success) {
        handleError(
          new Error(result?.message || "Failed to fetch roles"),
          "Fetch Failed"
        );
        return null;
      }

      return result.data || null;
    } catch (error) {
      handleError(error, "Failed to Fetch Roles");
      return null;
    }
  };

  // ============= CONTEXT VALUE =============

  const value: RoleManagementContextType = {
    // Resource Methods (Detail operations)
    getResourceById,
    refreshResources,

    // Resource Methods (Via Role Management Service)
    createResourceViaRoleManagement,
    updateResourceViaRoleManagement,
    deleteResourceViaRoleManagement,

    // Role Methods (Detail operations)
    getRoleById,
    refreshRoles,

    // Role Methods (Via Role Management Service)
    createRoleViaRoleManagement,
    updateRoleViaRoleManagement,
    deleteRoleViaRoleManagement,

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
      "useRoleManagement must be used within a RoleManagementProvider"
    );
  }
  return context;
}
