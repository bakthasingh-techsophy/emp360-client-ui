/**
 * Space Management Context
 * Manages all space operations for visitor management with centralized API access
 *
 * Features:
 * - Space CRUD operations
 * - Automatic error toast notifications for all operations
 * - Success toast notifications for create, update, delete operations
 * - Single unified loading state for async operations
 * - Auto token validation and tenant resolution
 */

import { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  resolveAuth,
  isTokenExpired,
  removeStorageItem,
} from "@/store/localStorage";
import StorageKeys from "@/constants/storageConstants";
import { useLayoutContext } from "@/contexts/LayoutContext";

// Space Service
import {
  apiCreateSpace,
  apiGetSpaceById,
  apiUpdateSpace,
  apiSearchSpaces,
  apiDeleteSpace,
  apiBulkDeleteSpaces,
  apiBulkUpdateSpaces,
  SpaceCarrier,
  SpaceUpdatePayload,
} from "@/services/spaceService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { Space } from "@/modules/space-management/spaceTypes";

/**
 * Space Management Context Type Definition
 */
interface SpaceContextType {
  // Space Methods
  createSpace: (carrier: SpaceCarrier) => Promise<Space | null>;
  getSpaceById: (id: string) => Promise<Space | null>;
  updateSpace: (
    id: string,
    payload: SpaceUpdatePayload
  ) => Promise<Space | null>;
  refreshSpaces: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<Space> | null>;
  deleteSpace: (id: string) => Promise<boolean>;
  bulkDeleteSpaces: (ids: string[]) => Promise<boolean>;
  bulkUpdateSpaces: (
    ids: string[],
    updates: SpaceUpdatePayload
  ) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

/**
 * Space Management Provider Component
 * Should only be used within visitor management module
 */
export function SpaceProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { selectedCompanyScope } = useLayoutContext();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check if token is still valid
   */
  const validateToken = (): boolean => {
    if (isTokenExpired()) {
      removeStorageItem(StorageKeys.USER);
      removeStorageItem(StorageKeys.SESSION);
      removeStorageItem(StorageKeys.TENANT);

      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });

      window.location.href = "/auth/login";
      return false;
    }
    return true;
  };

  /**
   * Generic error handler
   */
  const handleError = (
    error: unknown,
    title: string,
    defaultMessage: string
  ) => {
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;
    toast({
      variant: "destructive",
      title,
      description: errorMessage,
    });
  };

  /**
   * Generic success handler
   */
  const handleSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  /**
   * Generic async operation wrapper with token validation and loading state
   */
  const executeApiCall = async <T,>(
    apiCall: (tenant: string, accessToken: string) => Promise<any>,
    operationName: string,
    successMessage: string,
    returnOnSuccess: boolean = false
  ): Promise<T | boolean | null> => {
    if (!validateToken()) return returnOnSuccess ? false : null;

    const auth = resolveAuth();
    if (!auth.tenant || !auth.accessToken) {
      handleError(
        new Error("Missing auth"),
        "Error",
        "Authentication information is missing"
      );
      return returnOnSuccess ? false : null;
    }

    setIsLoading(true);
    try {
      const response = await apiCall(auth.tenant, auth.accessToken);

      if (!response.success) {
        handleError(
          response.message,
          `${operationName} Failed`,
          response.message || `Failed to ${operationName}`
        );
        return returnOnSuccess ? false : null;
      }

      if (successMessage) {
        handleSuccess(successMessage);
      }

      return returnOnSuccess ? true : response.data;
    } catch (error) {
      handleError(error, "Error", `An error occurred during ${operationName}`);
      return returnOnSuccess ? false : null;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== SPACE METHODS ====================

  const createSpace = async (carrier: SpaceCarrier): Promise<Space | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiCreateSpace(carrier, tenant, accessToken),
      "Create Space",
      "Space created successfully"
    ) as Promise<Space | null>;
  };

  const getSpaceById = async (id: string): Promise<Space | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetSpaceById(id, tenant, accessToken),
      "Fetch Space",
      ""
    ) as Promise<Space | null>;
  };

  const updateSpace = async (
    id: string,
    payload: SpaceUpdatePayload
  ): Promise<Space | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateSpace(id, payload, tenant, accessToken),
      "Update Space",
      "Space updated successfully"
    ) as Promise<Space | null>;
  };

  const refreshSpaces = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<Space> | null> => {
    // Add company ID filter if a specific company is selected (not 'all')
    let enhancedSearchRequest = { ...searchRequest };

    if (selectedCompanyScope && selectedCompanyScope !== "all") {
      enhancedSearchRequest.filters = {
        ...enhancedSearchRequest.filters,
        and: {
          ...enhancedSearchRequest.filters?.and,
          ownerId: [selectedCompanyScope, ""],
        },
      };
    }

    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchSpaces(
          enhancedSearchRequest,
          page,
          pageSize,
          tenant,
          accessToken
        ),
      "Search Spaces",
      ""
    ) as Promise<Pagination<Space> | null>;
  };

  const deleteSpace = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteSpace(id, tenant, accessToken),
      "Delete Space",
      "Space deleted successfully",
      true
    );
    return result as boolean;
  };

  const bulkDeleteSpaces = async (ids: string[]): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiBulkDeleteSpaces(ids, tenant, accessToken),
      "Bulk Delete Spaces",
      `${ids.length} space(s) deleted successfully`,
      true
    );
    return result as boolean;
  };

  const bulkUpdateSpaces = async (
    ids: string[],
    updates: SpaceUpdatePayload
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateSpaces(ids, updates, tenant, accessToken),
      "Bulk Update Spaces",
      `${ids.length} space(s) updated successfully`,
      true
    );
    return result as boolean;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: SpaceContextType = {
    // Space Methods
    createSpace,
    getSpaceById,
    updateSpace,
    refreshSpaces,
    deleteSpace,
    bulkDeleteSpaces,
    bulkUpdateSpaces,

    // Loading State
    isLoading,
  };

  return (
    <SpaceContext.Provider value={contextValue}>
      {children}
    </SpaceContext.Provider>
  );
}

/**
 * Hook to use Space Management Context
 *
 * Usage:
 * const { createSpace, refreshSpaces, updateSpace, isLoading } = useSpace();
 */
export function useSpace() {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error("useSpace must be used within SpaceProvider");
  }
  return context;
}
