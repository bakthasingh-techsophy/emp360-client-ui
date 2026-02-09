/**
 * Visitor Management Context
 * Manages all visitor operations with centralized API access
 *
 * Features:
 * - Visitor CRUD operations
 * - Automatic error toast notifications for all operations
 * - Success toast notifications for create, update, delete operations
 * - Single unified loading state for async operations
 * - Auto token validation and tenant resolution
 * - Company scope filtering support
 */

import { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  isTokenExpired,
  removeStorageItem,
} from "@/store/localStorage";
import StorageKeys from "@/constants/storageConstants";
import { useLayoutContext } from "@/contexts/LayoutContext";

// Visitor Service
import {
  createVisitor as apiCreateVisitor,
  updateVisitor as apiUpdateVisitor,
  deleteVisitor as apiDeleteVisitor,
  searchVisitorSnapshots,
} from "@/services/visitorManagementMain";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { VisitorCarrier, VisitorSnapshot } from "@/modules/visitor-management/types";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * Visitor Management Context Type Definition
 */
interface VisitorManagementContextType {
  // Visitor Methods
  createVisitor: (carrier: VisitorCarrier) => Promise<VisitorSnapshot | null>;
  getVisitorById: (id: string) => Promise<VisitorSnapshot | null>;
  updateVisitor: (id: string, payload: UpdatePayload) => Promise<VisitorSnapshot | null>;
  refreshVisitors: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<VisitorSnapshot> | null>;
  deleteVisitorById: (id: string) => Promise<boolean>;
  bulkDeleteVisitors: (ids: string[]) => Promise<boolean>;
  bulkUpdateVisitors: (
    ids: string[],
    updates: UpdatePayload,
  ) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const VisitorManagementContext = createContext<VisitorManagementContextType | undefined>(undefined);

/**
 * Visitor Management Provider Component
 */
export function VisitorManagementProvider({ children }: { children: ReactNode }) {
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
    defaultMessage: string,
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
   * Uses new API service with built-in authentication
   */
  const executeApiCall = async <T,>(
    apiCall: () => Promise<any>,
    operationName: string,
    successMessage: string,
    returnOnSuccess: boolean = false,
  ): Promise<T | boolean | null> => {
    if (!validateToken()) return returnOnSuccess ? false : null;

    setIsLoading(true);
    try {
      const response = await apiCall();

      if (!response.success) {
        handleError(
          response.message,
          `${operationName} Failed`,
          response.message || `Failed to ${operationName}`,
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

  // ==================== VISITOR METHODS ====================

  const createVisitor = async (
    carrier: VisitorCarrier,
  ): Promise<VisitorSnapshot | null> => {
    return executeApiCall(
      () => apiCreateVisitor(carrier),
      "Create Visitor",
      "Visitor registered successfully",
    ) as Promise<VisitorSnapshot | null>;
  };

  const getVisitorById = async (id: string): Promise<VisitorSnapshot | null> => {
    // Note: GET by ID endpoint not in new API spec, using search with ID filter
    return executeApiCall(
      () => searchVisitorSnapshots({ 
        filters: { 
          and: { 
            id: id 
          } 
        } 
      }, 0, 1).then(res => {
        if (res.success && res.data?.content && res.data.content.length > 0) {
          return { success: true, data: res.data.content[0] };
        }
        return { success: false, message: "Visitor not found" };
      }),
      "Fetch Visitor",
      "",
    ) as Promise<VisitorSnapshot | null>;
  };

  const updateVisitor = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<VisitorSnapshot | null> => {
    return executeApiCall(
      () => apiUpdateVisitor(id, payload),
      "Update Visitor",
      "Visitor updated successfully",
    ) as Promise<VisitorSnapshot | null>;
  };

  const refreshVisitors = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<VisitorSnapshot> | null> => {
    // Add company ID filter if a specific company is selected (not 'all')
    let enhancedSearchRequest = { ...searchRequest };

    if (selectedCompanyScope && selectedCompanyScope !== "all") {
      enhancedSearchRequest.filters = {
        ...enhancedSearchRequest.filters,
        and: {
          ...enhancedSearchRequest.filters?.and,
          companyId: [selectedCompanyScope, ""],
        },
      };
    }

    return executeApiCall(
      () => searchVisitorSnapshots(enhancedSearchRequest, page, pageSize),
      "Search Visitors",
      "",
    ) as Promise<Pagination<VisitorSnapshot> | null>;
  };

  const deleteVisitorById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      () => apiDeleteVisitor(id),
      "Delete Visitor",
      "Visitor deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeleteVisitors = async (ids: string[]): Promise<boolean> => {
    // Note: Bulk delete not in new API spec, implementing as sequential deletes
    const result = await executeApiCall(
      async () => {
        const results = await Promise.all(ids.map(id => apiDeleteVisitor(id)));
        const allSuccess = results.every(r => r.success);
        return {
          success: allSuccess,
          message: allSuccess ? "All visitors deleted" : "Some deletions failed",
          data: null
        };
      },
      "Bulk Delete Visitors",
      `${ids.length} visitor(s) deleted successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkUpdateVisitors = async (
    ids: string[],
    updates: UpdatePayload,
  ): Promise<boolean> => {
    // Note: Bulk update not in new API spec, implementing as sequential updates
    const result = await executeApiCall(
      async () => {
        const results = await Promise.all(ids.map(id => apiUpdateVisitor(id, updates)));
        const allSuccess = results.every(r => r.success);
        return {
          success: allSuccess,
          message: allSuccess ? "All visitors updated" : "Some updates failed",
          data: null
        };
      },
      "Bulk Update Visitors",
      `${ids.length} visitor(s) updated successfully`,
      true,
    );
    return result as boolean;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: VisitorManagementContextType = {
    // Visitor Methods
    createVisitor,
    getVisitorById,
    updateVisitor,
    refreshVisitors,
    deleteVisitorById,
    bulkDeleteVisitors,
    bulkUpdateVisitors,

    // Loading State
    isLoading,
  };

  return (
    <VisitorManagementContext.Provider value={contextValue}>
      {children}
    </VisitorManagementContext.Provider>
  );
}

/**
 * Hook to use Visitor Management Context
 *
 * Usage:
 * const { createVisitor, refreshVisitors, updateVisitor, isLoading } = useVisitorManagement();
 */
export function useVisitorManagement() {
  const context = useContext(VisitorManagementContext);
  if (!context) {
    throw new Error("useVisitorManagement must be used within VisitorManagementProvider");
  }
  return context;
}
