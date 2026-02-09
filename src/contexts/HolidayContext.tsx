/**
 * Holiday Management Context
 * Manages all holiday operations with centralized API access
 *
 * Features:
 * - Holiday CRUD operations
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

// Holiday Service
import {
  apiCreateHoliday,
  apiGetHolidayById,
  apiUpdateHoliday,
  apiSearchHolidays,
  apiDeleteHolidayById,
  apiBulkDeleteHolidays,
  apiBulkUpdateHolidays,
} from "@/services/holidayService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  Holiday,
  HolidayCarrier,
} from "@/modules/time-attendance/holiday-management/types";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * Holiday Management Context Type Definition
 */
interface HolidayContextType {
  // Holiday Methods
  createHoliday: (carrier: HolidayCarrier) => Promise<Holiday | null>;
  getHolidayById: (id: string) => Promise<Holiday | null>;
  updateHoliday: (
    id: string,
    payload: UpdatePayload
  ) => Promise<Holiday | null>;
  refreshHolidays: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<Holiday> | null>;
  deleteHolidayById: (id: string) => Promise<boolean>;
  bulkDeleteHolidays: (ids: string[]) => Promise<boolean>;
  bulkUpdateHolidays: (
    ids: string[],
    updates: UpdatePayload
  ) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

/**
 * Holiday Management Provider Component
 */
export function HolidayProvider({ children }: { children: ReactNode }) {
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

  // ==================== HOLIDAY METHODS ====================

  const createHoliday = async (
    carrier: HolidayCarrier
  ): Promise<Holiday | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateHoliday(carrier, tenant, accessToken),
      "Create Holiday",
      "Holiday created successfully"
    ) as Promise<Holiday | null>;
  };

  const getHolidayById = async (id: string): Promise<Holiday | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetHolidayById(id, tenant, accessToken),
      "Fetch Holiday",
      ""
    ) as Promise<Holiday | null>;
  };

  const updateHoliday = async (
    id: string,
    payload: UpdatePayload
  ): Promise<Holiday | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateHoliday(id, payload, tenant, accessToken),
      "Update Holiday",
      "Holiday updated successfully"
    ) as Promise<Holiday | null>;
  };

  const refreshHolidays = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 12
  ): Promise<Pagination<Holiday> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchHolidays(searchRequest, page, pageSize, tenant, accessToken),
      "Search Holidays",
      ""
    ) as Promise<Pagination<Holiday> | null>;
  };

  const deleteHolidayById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteHolidayById(id, tenant, accessToken),
      "Delete Holiday",
      "Holiday deleted successfully",
      true
    );
    return result as boolean;
  };

  const bulkDeleteHolidays = async (ids: string[]): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteHolidays(ids, tenant, accessToken),
      "Bulk Delete Holidays",
      `${ids.length} holiday(ies) deleted successfully`,
      true
    );
    return result as boolean;
  };

  const bulkUpdateHolidays = async (
    ids: string[],
    updates: UpdatePayload
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateHolidays(ids, updates, tenant, accessToken),
      "Bulk Update Holidays",
      `${ids.length} holiday(ies) updated successfully`,
      true
    );
    return result as boolean;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: HolidayContextType = {
    // Holiday Methods
    createHoliday,
    getHolidayById,
    updateHoliday,
    refreshHolidays,
    deleteHolidayById,
    bulkDeleteHolidays,
    bulkUpdateHolidays,

    // Loading State
    isLoading,
  };

  return (
    <HolidayContext.Provider value={contextValue}>
      {children}
    </HolidayContext.Provider>
  );
}

/**
 * Hook to use Holiday Management Context
 *
 * Usage:
 * const { createHoliday, refreshHolidays, deleteHolidayById, isLoading } = useHoliday();
 */
export function useHoliday() {
  const context = useContext(HolidayContext);
  if (!context) {
    throw new Error("useHoliday must be used within HolidayProvider");
  }
  return context;
}
