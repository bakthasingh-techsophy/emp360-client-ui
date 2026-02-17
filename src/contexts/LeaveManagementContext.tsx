/**
 * Leave Management Context
 * Manages all leave configuration operations with centralized API access
 *
 * Features:
 * - Leave Configuration CRUD operations
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

// Leave Configuration Service
import {
  apiCreateLeaveConfiguration,
  apiGetLeaveConfigurationById,
  apiUpdateLeaveConfiguration,
  apiSearchLeaveConfigurations,
  apiDeleteLeaveConfigurationById,
  apiBulkUpdateLeaveConfigurations,
  apiBulkDeleteLeaveConfigurationsByIds,
  apiBulkDeleteLeaveConfigurationsByFilters,
} from "@/services/leaveConfigurationService";

// Leave Configuration Basic Details Service
import {
  apiCreateLeaveConfigurationBasicDetails,
  apiGetLeaveConfigurationBasicDetailsById,
  apiUpdateLeaveConfigurationBasicDetails,
  apiSearchLeaveConfigurationBasicDetails,
  apiDeleteLeaveConfigurationBasicDetailsById,
  apiBulkDeleteLeaveConfigurationBasicDetailsByIds,
  apiBulkUpdateLeaveConfigurationBasicDetails,
  LeaveConfigurationBasicDetails,
  LeaveConfigurationBasicDetailsCarrier,
} from "@/services/leaveConfigurationBasicDetailsService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  LeaveConfiguration,
  LeaveConfigurationCarrier,
} from "@/modules/leave-management-system/types/leaveConfiguration.types";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * Bulk update request
 */
export interface BulkUpdateRequest {
  filters: UniversalSearchRequest;
  updates: UpdatePayload;
}

/**
 * Bulk delete by filters request
 */
export interface BulkDeleteByFiltersRequest {
  filters: UniversalSearchRequest;
}

/**
 * Leave Management Context Type Definition
 */
interface LeaveManagementContextType {
  // Leave Configuration Methods
  createLeaveConfiguration: (
    carrier: LeaveConfigurationCarrier
  ) => Promise<LeaveConfiguration | null>;
  getLeaveConfigurationById: (id: string) => Promise<LeaveConfiguration | null>;
  updateLeaveConfiguration: (
    id: string,
    payload: UpdatePayload
  ) => Promise<LeaveConfiguration | null>;
  searchLeaveConfigurations: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<LeaveConfiguration> | null>;
  deleteLeaveConfigurationById: (id: string) => Promise<boolean>;
  bulkUpdateLeaveConfigurations: (
    request: BulkUpdateRequest
  ) => Promise<boolean>;
  bulkDeleteLeaveConfigurationsByIds: (ids: string[]) => Promise<boolean>;
  bulkDeleteLeaveConfigurationsByFilters: (
    request: BulkDeleteByFiltersRequest
  ) => Promise<boolean>;

  // Leave Configuration Basic Details Methods
  createLeaveConfigurationBasicDetails: (
    carrier: LeaveConfigurationBasicDetailsCarrier
  ) => Promise<LeaveConfigurationBasicDetails | null>;
  getLeaveConfigurationBasicDetailsById: (
    id: string
  ) => Promise<LeaveConfigurationBasicDetails | null>;
  updateLeaveConfigurationBasicDetails: (
    id: string,
    payload: Partial<LeaveConfigurationBasicDetailsCarrier>
  ) => Promise<LeaveConfigurationBasicDetails | null>;
  searchLeaveConfigurationBasicDetails: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<LeaveConfigurationBasicDetails> | null>;
  deleteLeaveConfigurationBasicDetailsById: (id: string) => Promise<boolean>;
  bulkDeleteLeaveConfigurationBasicDetailsByIds: (
    ids: string[]
  ) => Promise<boolean>;
  bulkUpdateLeaveConfigurationBasicDetails: (
    request: { ids: string[]; updates: UpdatePayload }
  ) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const LeaveManagementContext = createContext<
  LeaveManagementContextType | undefined
>(undefined);

/**
 * Leave Management Provider Component
 */
export function LeaveManagementProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
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

  // ==================== LEAVE CONFIGURATION METHODS ====================

  const createLeaveConfiguration = async (
    carrier: LeaveConfigurationCarrier
  ): Promise<LeaveConfiguration | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateLeaveConfiguration(carrier, tenant, accessToken),
      "Create Leave Configuration",
      "Leave configuration created successfully"
    ) as Promise<LeaveConfiguration | null>;
  };

  const getLeaveConfigurationById = async (
    id: string
  ): Promise<LeaveConfiguration | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetLeaveConfigurationById(id, tenant, accessToken),
      "Fetch Leave Configuration",
      ""
    ) as Promise<LeaveConfiguration | null>;
  };

  const updateLeaveConfiguration = async (
    id: string,
    payload: UpdatePayload
  ): Promise<LeaveConfiguration | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateLeaveConfiguration(id, payload, tenant, accessToken),
      "Update Leave Configuration",
      "Leave configuration updated successfully"
    ) as Promise<LeaveConfiguration | null>;
  };

  const searchLeaveConfigurations = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 12
  ): Promise<Pagination<LeaveConfiguration> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchLeaveConfigurations(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken
        ),
      "Search Leave Configurations",
      ""
    ) as Promise<Pagination<LeaveConfiguration> | null>;
  };

  const deleteLeaveConfigurationById = async (
    id: string
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteLeaveConfigurationById(id, tenant, accessToken),
      "Delete Leave Configuration",
      "Leave configuration deleted successfully",
      true
    );
    return result as boolean;
  };

  const bulkUpdateLeaveConfigurations = async (
    request: BulkUpdateRequest
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateLeaveConfigurations(request, tenant, accessToken),
      "Bulk Update Leave Configurations",
      "Leave configurations updated successfully",
      true
    );
    return result as boolean;
  };

  const bulkDeleteLeaveConfigurationsByIds = async (
    ids: string[]
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteLeaveConfigurationsByIds(ids, tenant, accessToken),
      "Bulk Delete Leave Configurations",
      `${ids.length} leave configuration(s) deleted successfully`,
      true
    );
    return result as boolean;
  };

  const bulkDeleteLeaveConfigurationsByFilters = async (
    request: BulkDeleteByFiltersRequest
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteLeaveConfigurationsByFilters(
          request,
          tenant,
          accessToken
        ),
      "Bulk Delete Leave Configurations",
      "Leave configurations deleted successfully",
      true
    );
    return result as boolean;
  };

  // ==================== LEAVE CONFIGURATION BASIC DETAILS METHODS ====================

  const createLeaveConfigurationBasicDetails = async (
    carrier: LeaveConfigurationBasicDetailsCarrier
  ): Promise<LeaveConfigurationBasicDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateLeaveConfigurationBasicDetails(carrier, tenant, accessToken),
      "Create Leave Configuration",
      "Leave configuration created successfully"
    ) as Promise<LeaveConfigurationBasicDetails | null>;
  };

  const getLeaveConfigurationBasicDetailsById = async (
    id: string
  ): Promise<LeaveConfigurationBasicDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetLeaveConfigurationBasicDetailsById(id, tenant, accessToken),
      "Fetch Leave Configuration",
      ""
    ) as Promise<LeaveConfigurationBasicDetails | null>;
  };

  const updateLeaveConfigurationBasicDetails = async (
    id: string,
    payload: Partial<LeaveConfigurationBasicDetailsCarrier>
  ): Promise<LeaveConfigurationBasicDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateLeaveConfigurationBasicDetails(
          id,
          payload,
          tenant,
          accessToken
        ),
      "Update Leave Configuration",
      "Leave configuration updated successfully"
    ) as Promise<LeaveConfigurationBasicDetails | null>;
  };

  const searchLeaveConfigurationBasicDetails = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 12
  ): Promise<Pagination<LeaveConfigurationBasicDetails> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchLeaveConfigurationBasicDetails(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken
        ),
      "Search Leave Configurations",
      ""
    ) as Promise<Pagination<LeaveConfigurationBasicDetails> | null>;
  };

  const deleteLeaveConfigurationBasicDetailsById = async (
    id: string
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteLeaveConfigurationBasicDetailsById(id, tenant, accessToken),
      "Delete Leave Configuration",
      "Leave configuration deleted successfully",
      true
    );
    return result as boolean;
  };

  const bulkDeleteLeaveConfigurationBasicDetailsByIds = async (
    ids: string[]
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteLeaveConfigurationBasicDetailsByIds(
          ids,
          tenant,
          accessToken
        ),
      "Bulk Delete Leave Configurations",
      `${ids.length} leave configuration(s) deleted successfully`,
      true
    );
    return result as boolean;
  };

  const bulkUpdateLeaveConfigurationBasicDetails = async (
    request: { ids: string[]; updates: UpdatePayload }
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateLeaveConfigurationBasicDetails(
          request,
          tenant,
          accessToken
        ),
      "Bulk Update Leave Configurations",
      "Leave configurations updated successfully",
      true
    );
    return result as boolean;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: LeaveManagementContextType = {
    // Leave Configuration Methods
    createLeaveConfiguration,
    getLeaveConfigurationById,
    updateLeaveConfiguration,
    searchLeaveConfigurations,
    deleteLeaveConfigurationById,
    bulkUpdateLeaveConfigurations,
    bulkDeleteLeaveConfigurationsByIds,
    bulkDeleteLeaveConfigurationsByFilters,

    // Leave Configuration Basic Details Methods
    createLeaveConfigurationBasicDetails,
    getLeaveConfigurationBasicDetailsById,
    updateLeaveConfigurationBasicDetails,
    searchLeaveConfigurationBasicDetails,
    deleteLeaveConfigurationBasicDetailsById,
    bulkDeleteLeaveConfigurationBasicDetailsByIds,
    bulkUpdateLeaveConfigurationBasicDetails,

    // Loading State
    isLoading,
  };

  return (
    <LeaveManagementContext.Provider value={contextValue}>
      {children}
    </LeaveManagementContext.Provider>
  );
}

/**
 * Hook to use Leave Management Context
 *
 * Usage:
 * const { createLeaveConfiguration, searchLeaveConfigurations, deleteLeaveConfigurationById, isLoading } = useLeaveManagement();
 */
export function useLeaveManagement() {
  const context = useContext(LeaveManagementContext);
  if (!context) {
    throw new Error(
      "useLeaveManagement must be used within LeaveManagementProvider"
    );
  }
  return context;
}
