/**
 * Performance Management Context
 * Manages all performance template, column, and row operations with centralized API access
 *
 * Features:
 * - Performance Template CRUD operations
 * - Template Column CRUD operations
 * - Template Row CRUD operations
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

// Performance Template Service
import {
  apiCreatePerformanceTemplate,
  apiGetPerformanceTemplate,
  apiUpdatePerformanceTemplate,
  apiDeletePerformanceTemplate,
  apiSearchPerformanceTemplates,
} from "@/services/performanceTemplateService";

// Template Column Service
import {
  apiCreateTemplateColumn,
  apiGetTemplateColumn,
  apiUpdateTemplateColumn,
  apiDeleteTemplateColumn,
  apiSearchTemplateColumns,
} from "@/services/templateColumnService";

// Template Row Service
import {
  apiCreateTemplateRow,
  apiGetTemplateRow,
  apiUpdateTemplateRow,
  apiDeleteTemplateRow,
  apiSearchTemplateRows,
} from "@/services/templateRowService";

// Performance Management Service
import {
  apiAddRowToTemplate,
  apiAddColumnToTemplate,
  apiRemoveRowFromTemplate,
  apiRemoveColumnFromTemplate,
} from "@/services/performanceManagementService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  PerformanceTemplate,
  PerformanceTemplateCarrier,
  TemplateColumn,
  TemplateColumnCarrier,
  TemplateRow,
  TemplateRowCarrier,
} from "@/modules/performance/types";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * Performance Management Context Type Definition
 */
interface PerformanceContextType {
  // Performance Template Methods
  createPerformanceTemplate: (
    carrier: PerformanceTemplateCarrier,
  ) => Promise<PerformanceTemplate | null>;
  getPerformanceTemplateById: (id: string) => Promise<PerformanceTemplate | null>;
  updatePerformanceTemplate: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<PerformanceTemplate | null>;
  refreshPerformanceTemplates: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<PerformanceTemplate> | null>;
  deletePerformanceTemplateById: (id: string) => Promise<boolean>;

  // Template Column Methods
  createTemplateColumn: (
    carrier: TemplateColumnCarrier,
  ) => Promise<TemplateColumn | null>;
  getTemplateColumnById: (id: string) => Promise<TemplateColumn | null>;
  updateTemplateColumn: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<TemplateColumn | null>;
  refreshTemplateColumns: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<TemplateColumn> | null>;
  deleteTemplateColumnById: (id: string) => Promise<boolean>;
  addColumnToTemplate: (
    templateId: string,
    carrier: TemplateColumnCarrier,
  ) => Promise<TemplateColumn | null>;
  removeColumnFromTemplate: (
    templateId: string,
    columnId: string,
  ) => Promise<PerformanceTemplate | null>;

  // Template Row Methods
  createTemplateRow: (carrier: TemplateRowCarrier) => Promise<TemplateRow | null>;
  getTemplateRowById: (id: string) => Promise<TemplateRow | null>;
  updateTemplateRow: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<TemplateRow | null>;
  refreshTemplateRows: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<TemplateRow> | null>;
  deleteTemplateRowById: (id: string) => Promise<boolean>;
  addRowToTemplate: (
    templateId: string,
    carrier: TemplateRowCarrier,
  ) => Promise<TemplateRow | null>;
  removeRowFromTemplate: (
    templateId: string,
    rowId: string,
  ) => Promise<PerformanceTemplate | null>;

  // Loading State
  isLoading: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined,
);

/**
 * Performance Management Provider Component
 */
export function PerformanceProvider({ children }: { children: ReactNode }) {
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
   */
  const executeApiCall = async <T,>(
    apiCall: (tenant: string, accessToken: string) => Promise<any>,
    operationName: string,
    successMessage: string,
    returnOnSuccess: boolean = false,
  ): Promise<T | boolean | null> => {
    if (!validateToken()) return returnOnSuccess ? false : null;

    const auth = resolveAuth();
    if (!auth.tenant || !auth.accessToken) {
      handleError(
        new Error("Missing auth"),
        "Error",
        "Authentication information is missing",
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

  // ==================== PERFORMANCE TEMPLATE METHODS ====================

  const createPerformanceTemplate = async (
    carrier: PerformanceTemplateCarrier,
  ): Promise<PerformanceTemplate | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreatePerformanceTemplate(carrier, tenant, accessToken),
      "Create Performance Template",
      "Performance template created successfully",
    ) as Promise<PerformanceTemplate | null>;
  };

  const getPerformanceTemplateById = async (
    id: string,
  ): Promise<PerformanceTemplate | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetPerformanceTemplate(id, tenant, accessToken),
      "Fetch Performance Template",
      "",
    ) as Promise<PerformanceTemplate | null>;
  };

  const updatePerformanceTemplate = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<PerformanceTemplate | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdatePerformanceTemplate(id, payload, tenant, accessToken),
      "Update Performance Template",
      "Performance template updated successfully",
    ) as Promise<PerformanceTemplate | null>;
  };

  const refreshPerformanceTemplates = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<PerformanceTemplate> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchPerformanceTemplates(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Search Performance Templates",
      "",
    ) as Promise<Pagination<PerformanceTemplate> | null>;
  };

  const deletePerformanceTemplateById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeletePerformanceTemplate(id, tenant, accessToken),
      "Delete Performance Template",
      "Performance template deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== TEMPLATE COLUMN METHODS ====================

  const createTemplateColumn = async (
    carrier: TemplateColumnCarrier,
  ): Promise<TemplateColumn | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateTemplateColumn(carrier, tenant, accessToken),
      "Create Template Column",
      "Template column created successfully",
    ) as Promise<TemplateColumn | null>;
  };

  const getTemplateColumnById = async (
    id: string,
  ): Promise<TemplateColumn | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetTemplateColumn(id, tenant, accessToken),
      "Fetch Template Column",
      "",
    ) as Promise<TemplateColumn | null>;
  };

  const updateTemplateColumn = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<TemplateColumn | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateTemplateColumn(id, payload, tenant, accessToken),
      "Update Template Column",
      "Template column updated successfully",
    ) as Promise<TemplateColumn | null>;
  };

  const refreshTemplateColumns = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<TemplateColumn> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchTemplateColumns(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Search Template Columns",
      "",
    ) as Promise<Pagination<TemplateColumn> | null>;
  };

  const deleteTemplateColumnById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteTemplateColumn(id, tenant, accessToken),
      "Delete Template Column",
      "Template column deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== TEMPLATE ROW METHODS ====================

  const createTemplateRow = async (
    carrier: TemplateRowCarrier,
  ): Promise<TemplateRow | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiCreateTemplateRow(carrier, tenant, accessToken),
      "Create Template Row",
      "Template row created successfully",
    ) as Promise<TemplateRow | null>;
  };

  const getTemplateRowById = async (id: string): Promise<TemplateRow | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetTemplateRow(id, tenant, accessToken),
      "Fetch Template Row",
      "",
    ) as Promise<TemplateRow | null>;
  };

  const updateTemplateRow = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<TemplateRow | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateTemplateRow(id, payload, tenant, accessToken),
      "Update Template Row",
      "Template row updated successfully",
    ) as Promise<TemplateRow | null>;
  };

  const refreshTemplateRows = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<TemplateRow> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchTemplateRows(searchRequest, page, pageSize, tenant, accessToken),
      "Search Template Rows",
      "",
    ) as Promise<Pagination<TemplateRow> | null>;
  };

  const deleteTemplateRowById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteTemplateRow(id, tenant, accessToken),
      "Delete Template Row",
      "Template row deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== TEMPLATE MANAGEMENT METHODS ====================
  // Add/Remove Columns and Rows to/from Templates

  const addColumnToTemplate = async (
    templateId: string,
    carrier: TemplateColumnCarrier,
  ): Promise<TemplateColumn | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiAddColumnToTemplate(templateId, carrier, tenant, accessToken),
      "Add Column to Template",
      "Column added to template successfully",
    ) as Promise<TemplateColumn | null>;
  };

  const removeColumnFromTemplate = async (
    templateId: string,
    columnId: string,
  ): Promise<PerformanceTemplate | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiRemoveColumnFromTemplate(templateId, columnId, tenant, accessToken),
      "Remove Column from Template",
      "Column removed from template successfully",
    ) as Promise<PerformanceTemplate | null>;
  };

  const addRowToTemplate = async (
    templateId: string,
    carrier: TemplateRowCarrier,
  ): Promise<TemplateRow | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiAddRowToTemplate(templateId, carrier, tenant, accessToken),
      "Add Row to Template",
      "Row added to template successfully",
    ) as Promise<TemplateRow | null>;
  };

  const removeRowFromTemplate = async (
    templateId: string,
    rowId: string,
  ): Promise<PerformanceTemplate | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiRemoveRowFromTemplate(templateId, rowId, tenant, accessToken),
      "Remove Row from Template",
      "Row removed from template successfully",
    ) as Promise<PerformanceTemplate | null>;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: PerformanceContextType = {
    // Performance Template Methods
    createPerformanceTemplate,
    getPerformanceTemplateById,
    updatePerformanceTemplate,
    refreshPerformanceTemplates,
    deletePerformanceTemplateById,

    // Template Column Methods
    createTemplateColumn,
    getTemplateColumnById,
    updateTemplateColumn,
    refreshTemplateColumns,
    deleteTemplateColumnById,
    addColumnToTemplate,
    removeColumnFromTemplate,

    // Template Row Methods
    createTemplateRow,
    getTemplateRowById,
    updateTemplateRow,
    refreshTemplateRows,
    deleteTemplateRowById,
    addRowToTemplate,
    removeRowFromTemplate,

    // Loading State
    isLoading,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * Hook to use Performance Context
 *
 * Usage:
 * const { createPerformanceTemplate, updatePerformanceTemplate, deletePerformanceTemplateById } = usePerformance();
 */
export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within PerformanceProvider");
  }
  return context;
}
