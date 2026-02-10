/**
 * Expense Management Context
 * Manages all expense-related operations with centralized API access
 *
 * Features:
 * - Expense Type CRUD operations
 * - Expense Category CRUD operations
 * - Automatic error toast notifications for all operations
 * - Success toast notifications for create, update, delete operations
 * - Single unified loading state for async operations
 * - Auto token validation and tenant resolution
 * - Search capabilities for both types and categories
 */

import { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  resolveAuth,
  isTokenExpired,
  removeStorageItem,
} from "@/store/localStorage";
import StorageKeys from "@/constants/storageConstants";

// Expense Type Service
import {
  apiCreateExpenseType,
  apiGetExpenseTypeById,
  apiUpdateExpenseType,
  apiSearchExpenseTypes,
  apiListExpenseTypes,
  apiDeleteExpenseType,
} from "@/services/expenseTypeService";

// Expense Category Service
import {
  apiCreateExpenseCategory,
  apiGetExpenseCategoryById,
  apiUpdateExpenseCategory,
  apiSearchExpenseCategories,
  apiListExpenseCategories,
  apiDeleteExpenseCategory,
} from "@/services/expenseCategoryService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  ExpenseTypeConfig,
  ExpenseCategoryConfig,
} from "@/modules/expenses-assets/types/settings.types";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * Expense Management Context Type Definition
 */
interface ExpenseManagementContextType {
  // Expense Type Methods
  createExpenseType: (
    carrier: Omit<ExpenseTypeConfig, "id">
  ) => Promise<ExpenseTypeConfig | null>;
  getExpenseTypeById: (id: string) => Promise<ExpenseTypeConfig | null>;
  updateExpenseType: (
    id: string,
    payload: UpdatePayload
  ) => Promise<ExpenseTypeConfig | null>;
  listExpenseTypes: () => Promise<ExpenseTypeConfig[] | null>;
  searchExpenseTypes: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<ExpenseTypeConfig> | null>;
  deleteExpenseType: (id: string) => Promise<boolean>;

  // Expense Category Methods
  createExpenseCategory: (
    carrier: Omit<ExpenseCategoryConfig, "id">
  ) => Promise<ExpenseCategoryConfig | null>;
  getExpenseCategoryById: (id: string) => Promise<ExpenseCategoryConfig | null>;
  updateExpenseCategory: (
    id: string,
    payload: UpdatePayload
  ) => Promise<ExpenseCategoryConfig | null>;
  listExpenseCategories: () => Promise<ExpenseCategoryConfig[] | null>;
  searchExpenseCategories: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<ExpenseCategoryConfig> | null>;
  deleteExpenseCategory: (id: string) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const ExpenseManagementContext = createContext<
  ExpenseManagementContextType | undefined
>(undefined);

/**
 * Expense Management Provider Component
 */
export function ExpenseManagementProvider({ children }: { children: ReactNode }) {
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

  // ==================== EXPENSE TYPE METHODS ====================

  const createExpenseType = async (
    carrier: Omit<ExpenseTypeConfig, "id">
  ): Promise<ExpenseTypeConfig | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateExpenseType(carrier, tenant, accessToken),
      "Create Expense Type",
      "Expense type created successfully"
    ) as Promise<ExpenseTypeConfig | null>;
  };

  const getExpenseTypeById = async (
    id: string
  ): Promise<ExpenseTypeConfig | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetExpenseTypeById(id, tenant, accessToken),
      "Fetch Expense Type",
      ""
    ) as Promise<ExpenseTypeConfig | null>;
  };

  const updateExpenseType = async (
    id: string,
    payload: UpdatePayload
  ): Promise<ExpenseTypeConfig | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateExpenseType(id, payload, tenant, accessToken),
      "Update Expense Type",
      "Expense type updated successfully"
    ) as Promise<ExpenseTypeConfig | null>;
  };

  const listExpenseTypes = async (): Promise<ExpenseTypeConfig[] | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiListExpenseTypes(tenant, accessToken),
      "Fetch Expense Types",
      ""
    ) as Promise<ExpenseTypeConfig[] | null>;
  };

  const searchExpenseTypes = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<ExpenseTypeConfig> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchExpenseTypes(searchRequest, page, pageSize, tenant, accessToken),
      "Search Expense Types",
      ""
    ) as Promise<Pagination<ExpenseTypeConfig> | null>;
  };

  const deleteExpenseType = async (id: string): Promise<boolean> => {
    return executeApiCall(
      (tenant, accessToken) => apiDeleteExpenseType(id, tenant, accessToken),
      "Delete Expense Type",
      "Expense type deleted successfully",
      true
    ) as Promise<boolean>;
  };

  // ==================== EXPENSE CATEGORY METHODS ====================

  const createExpenseCategory = async (
    carrier: Omit<ExpenseCategoryConfig, "id">
  ): Promise<ExpenseCategoryConfig | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateExpenseCategory(carrier, tenant, accessToken),
      "Create Expense Category",
      "Expense category created successfully"
    ) as Promise<ExpenseCategoryConfig | null>;
  };

  const getExpenseCategoryById = async (
    id: string
  ): Promise<ExpenseCategoryConfig | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetExpenseCategoryById(id, tenant, accessToken),
      "Fetch Expense Category",
      ""
    ) as Promise<ExpenseCategoryConfig | null>;
  };

  const updateExpenseCategory = async (
    id: string,
    payload: UpdatePayload
  ): Promise<ExpenseCategoryConfig | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateExpenseCategory(id, payload, tenant, accessToken),
      "Update Expense Category",
      "Expense category updated successfully"
    ) as Promise<ExpenseCategoryConfig | null>;
  };

  const listExpenseCategories = async (): Promise<ExpenseCategoryConfig[] | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiListExpenseCategories(tenant, accessToken),
      "Fetch Expense Categories",
      ""
    ) as Promise<ExpenseCategoryConfig[] | null>;
  };

  const searchExpenseCategories = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<ExpenseCategoryConfig> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchExpenseCategories(searchRequest, page, pageSize, tenant, accessToken),
      "Search Expense Categories",
      ""
    ) as Promise<Pagination<ExpenseCategoryConfig> | null>;
  };

  const deleteExpenseCategory = async (id: string): Promise<boolean> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiDeleteExpenseCategory(id, tenant, accessToken),
      "Delete Expense Category",
      "Expense category deleted successfully",
      true
    ) as Promise<boolean>;
  };

  // ==================== CONTEXT VALUE ====================

  const value: ExpenseManagementContextType = {
    // Expense Type Methods
    createExpenseType,
    getExpenseTypeById,
    updateExpenseType,
    listExpenseTypes,
    searchExpenseTypes,
    deleteExpenseType,

    // Expense Category Methods
    createExpenseCategory,
    getExpenseCategoryById,
    updateExpenseCategory,
    listExpenseCategories,
    searchExpenseCategories,
    deleteExpenseCategory,

    // Loading State
    isLoading,
  };

  return (
    <ExpenseManagementContext.Provider value={value}>
      {children}
    </ExpenseManagementContext.Provider>
  );
}

/**
 * Hook to use Expense Management Context
 * Throws error if used outside of ExpenseManagementProvider
 */
export function useExpenseManagement(): ExpenseManagementContextType {
  const context = useContext(ExpenseManagementContext);
  if (context === undefined) {
    throw new Error(
      "useExpenseManagement must be used within an ExpenseManagementProvider"
    );
  }
  return context;
}
