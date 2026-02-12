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
  apiDeleteExpenseType,
} from "@/services/expenseTypeService";

// Expense Category Service
import {
  apiCreateExpenseCategory,
  apiGetExpenseCategoryById,
  apiUpdateExpenseCategory,
  apiSearchExpenseCategories,
  apiDeleteExpenseCategory,
} from "@/services/expenseCategoryService";

// Expense Service
import {
  apiUpdateExpense,
  apiSearchExpenses,
  apiDeleteExpense,
  apiBulkDeleteExpenses,
  apiBulkUpdateExpenses,
  BulkUpdatePayload,
} from "@/services/expenseService";

// Expense Management Service
import * as expenseManagementService from "@/services/expenseManagementService";

// Expense Line Item Service (only update function)
import {
  apiGetExpenseLineItemById,
  apiUpdateExpenseLineItem,
  apiSearchExpenseLineItems,
  apiBulkDeleteExpenseLineItems,
  apiBulkUpdateExpenseLineItems,
  BulkUpdatePayload as LineItemBulkUpdatePayload,
} from "@/services/expenseLineItemService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  ExpenseTypeConfig,
  ExpenseCategoryConfig,
} from "@/modules/expenses-assets/types/settings.types";
import {
  Expense,
  ExpenseCarrier,
  ExpenseLineItem,
  ExpenseLineItemCarrier,
} from "@/modules/expenses-assets/types/expense.types";

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
  searchExpenseCategories: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<ExpenseCategoryConfig> | null>;
  deleteExpenseCategory: (id: string) => Promise<boolean>;

  // Expense Methods
  createExpenseMain: (
    carrier: ExpenseCarrier
  ) => Promise<Expense | null>;
  updateExpense: (
    id: string,
    payload: UpdatePayload
  ) => Promise<Expense | null>;
  searchExpenses: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<Expense> | null>;
  deleteExpense: (id: string) => Promise<boolean>;
  bulkDeleteExpenses: (ids: string[]) => Promise<boolean>;
  bulkUpdateExpenses: (payload: BulkUpdatePayload) => Promise<Expense[] | null>;

  // Expense Management Service Methods (from expenseManagementService)
  // Note: These methods handle token validation, error handling, and loading states
  getExpenseDetailsMain: (id: string) => Promise<Expense | null>;
  getExpenseSnapshotMain: (id: string) => Promise<any | null>;
  searchExpenseSnapshotsMain: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<any> | null>;
  deleteExpenseMain: (expenseId: string) => Promise<boolean>;

  // Expense Line Item Methods
  addExpenseLineItemMain: (
    expenseId: string,
    lineItem: ExpenseLineItemCarrier
  ) => Promise<Expense | null>;
  deleteExpenseLineItemMain: (
    expenseId: string,
    lineItemId: string
  ) => Promise<Expense | null>;
  getExpenseLineItemById: (id: string) => Promise<ExpenseLineItem | null>;
  updateExpenseLineItem: (
    id: string,
    payload: UpdatePayload
  ) => Promise<ExpenseLineItem | null>;
  searchExpenseLineItems: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<ExpenseLineItem> | null>;
  bulkDeleteExpenseLineItems: (ids: string[]) => Promise<boolean>;
  bulkUpdateExpenseLineItems: (
    payload: LineItemBulkUpdatePayload
  ) => Promise<ExpenseLineItem[] | null>;

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

  // ==================== EXPENSE METHODS ====================

  const createExpenseMain = async (
    carrier: ExpenseCarrier
  ): Promise<Expense | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        expenseManagementService.apiCreateExpense(carrier, tenant, accessToken),
      "Create Expense",
      "Expense created successfully"
    ) as Promise<Expense | null>;
  };

  const updateExpense = async (
    id: string,
    payload: UpdatePayload
  ): Promise<Expense | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateExpense(id, payload, tenant, accessToken),
      "Update Expense",
      "Expense updated successfully"
    ) as Promise<Expense | null>;
  };

  const searchExpenses = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<Expense> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchExpenses(searchRequest, page, pageSize, tenant, accessToken),
      "Search Expenses",
      ""
    ) as Promise<Pagination<Expense> | null>;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiDeleteExpense(id, tenant, accessToken),
      "Delete Expense",
      "Expense deleted successfully",
      true
    ) as Promise<boolean>;
  };

  const bulkDeleteExpenses = async (ids: string[]): Promise<boolean> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteExpenses(ids, tenant, accessToken),
      "Bulk Delete Expenses",
      "Expenses deleted successfully",
      true
    ) as Promise<boolean>;
  };

  const bulkUpdateExpenses = async (
    payload: BulkUpdatePayload
  ): Promise<Expense[] | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateExpenses(payload, tenant, accessToken),
      "Bulk Update Expenses",
      "Expenses updated successfully"
    ) as Promise<Expense[] | null>;
  };

  // ==================== EXPENSE MANAGEMENT SERVICE METHODS ====================

  const getExpenseDetailsMain = async (
    id: string
  ): Promise<Expense | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        expenseManagementService.apiGetExpenseDetails(id, tenant, accessToken),
      "Fetch Expense Details",
      ""
    ) as Promise<Expense | null>;
  };

  const getExpenseSnapshotMain = async (
    id: string
  ): Promise<any | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        expenseManagementService.apiGetExpenseSnapshot(id, tenant, accessToken),
      "Fetch Expense Snapshot",
      ""
    ) as Promise<any | null>;
  };

  const searchExpenseSnapshotsMain = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<any | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        expenseManagementService.apiSearchExpenseSnapshots(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken
        ),
      "Fetch Expense Snapshots",
      ""
    ) as Promise<any | null>;
  };

  // ==================== EXPENSE LINE ITEM METHODS ====================

  const addExpenseLineItemMain = async (
    expenseId: string,
    lineItem: ExpenseLineItemCarrier
  ): Promise<Expense | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        expenseManagementService.apiAddExpenseLineItem(
          expenseId,
          lineItem,
          tenant,
          accessToken
        ),
      "Add Expense Line Item",
      "Expense line item added successfully"
    ) as Promise<Expense | null>;
  };

  const deleteExpenseLineItemMain = async (
    expenseId: string,
    lineItemId: string
  ): Promise<Expense | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        expenseManagementService.apiDeleteExpenseLineItem(
          expenseId,
          lineItemId,
          tenant,
          accessToken
        ),
      "Delete Expense Line Item",
      "Expense line item deleted successfully"
    ) as Promise<Expense | null>;
  };

  const deleteExpenseMain = async (
    expenseId: string
  ): Promise<boolean> => {
    return executeApiCall(
      (tenant, accessToken) =>
        expenseManagementService.apiDeleteExpense(
          expenseId,
          tenant,
          accessToken
        ),
      "Delete Expense",
      "Expense deleted successfully",
      true
    ) as Promise<boolean>;
  };

  const getExpenseLineItemById = async (
    id: string
  ): Promise<ExpenseLineItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetExpenseLineItemById(id, tenant, accessToken),
      "Fetch Expense Line Item",
      ""
    ) as Promise<ExpenseLineItem | null>;
  };

  const updateExpenseLineItem = async (
    id: string,
    payload: UpdatePayload
  ): Promise<ExpenseLineItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateExpenseLineItem(id, payload, tenant, accessToken),
      "Update Expense Line Item",
      "Expense line item updated successfully"
    ) as Promise<ExpenseLineItem | null>;
  };

  const searchExpenseLineItems = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<ExpenseLineItem> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchExpenseLineItems(searchRequest, page, pageSize, tenant, accessToken),
      "Search Expense Line Items",
      ""
    ) as Promise<Pagination<ExpenseLineItem> | null>;
  };

  const bulkDeleteExpenseLineItems = async (ids: string[]): Promise<boolean> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteExpenseLineItems(ids, tenant, accessToken),
      "Bulk Delete Expense Line Items",
      "Expense line items deleted successfully",
      true
    ) as Promise<boolean>;
  };

  const bulkUpdateExpenseLineItems = async (
    payload: LineItemBulkUpdatePayload
  ): Promise<ExpenseLineItem[] | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateExpenseLineItems(payload, tenant, accessToken),
      "Bulk Update Expense Line Items",
      "Expense line items updated successfully"
    ) as Promise<ExpenseLineItem[] | null>;
  };

  // ==================== CONTEXT VALUE ====================

  const value: ExpenseManagementContextType = {
    // Expense Type Methods
    createExpenseType,
    getExpenseTypeById,
    updateExpenseType,
    searchExpenseTypes,
    deleteExpenseType,

    // Expense Category Methods
    createExpenseCategory,
    getExpenseCategoryById,
    updateExpenseCategory,
    searchExpenseCategories,
    deleteExpenseCategory,

    // Expense Methods
    createExpenseMain,
    updateExpense,
    searchExpenses,
    deleteExpense,
    bulkDeleteExpenses,
    bulkUpdateExpenses,

    // Expense Management Service Methods
    getExpenseDetailsMain,
    getExpenseSnapshotMain,
    searchExpenseSnapshotsMain,
    deleteExpenseMain,

    // Expense Line Item Methods
    addExpenseLineItemMain,
    deleteExpenseLineItemMain,
    getExpenseLineItemById,
    updateExpenseLineItem,
    searchExpenseLineItems,
    bulkDeleteExpenseLineItems,
    bulkUpdateExpenseLineItems,

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
