/**
 * Expense Service
 * Handles all API operations for expense management
 *
 * Endpoints:
 * - POST /emp-user-management/v1/expenses - Create expense
 * - GET /emp-user-management/v1/expenses/{id} - Get expense by ID
 * - PATCH /emp-user-management/v1/expenses/{id} - Update expense
 * - POST /emp-user-management/v1/expenses/search - Search expenses
 * - DELETE /emp-user-management/v1/expenses/{id} - Delete expense
 * - DELETE /emp-user-management/v1/expenses/bulk-delete - Bulk delete expenses
 * - PATCH /emp-user-management/v1/expenses/bulk-update - Bulk update expenses
 *
 * All responses follow ApiResponse<T> wrapper format
 */

import { Expense, ExpenseCarrier } from "@/modules/expenses-assets/types/expense.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/expenses";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Bulk update payload - Contains list of IDs and updates to apply
 */
export interface BulkUpdatePayload {
  ids: string[];
  updates: UpdatePayload;
}

/**
 * Create Expense
 * POST /emp-user-management/v1/expenses
 *
 * @param carrier - Expense data
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense>>
 */
export const apiCreateExpense = async (
  carrier: ExpenseCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense>> => {
  return apiRequest<Expense>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Expense by ID
 * GET /emp-user-management/v1/expenses/{id}
 *
 * @param id - Expense ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense>>
 */
export const apiGetExpenseById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense>> => {
  return apiRequest<Expense>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Expense
 * PATCH /emp-user-management/v1/expenses/{id}
 *
 * Partial update - only provided fields are updated
 *
 * @param id - Expense ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense>>
 */
export const apiUpdateExpense = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense>> => {
  return apiRequest<Expense>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Expenses
 * POST /emp-user-management/v1/expenses/search
 *
 * @param searchRequest - UniversalSearchRequest with filters and pagination
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Expense>>>
 */
export const apiSearchExpenses = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Expense>>> => {
  return apiRequest<Pagination<Expense>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Expense
 * DELETE /emp-user-management/v1/expenses/{id}
 *
 * @param id - Expense ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteExpense = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Bulk Delete Expenses
 * DELETE /emp-user-management/v1/expenses/bulk-delete
 *
 * @param ids - Array of expense IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteExpenses = async (
  ids: string[],
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/bulk-delete`,
    tenant,
    accessToken,
    body: ids,
  });
};

/**
 * Bulk Update Expenses
 * PATCH /emp-user-management/v1/expenses/bulk-update
 *
 * Updates multiple expenses with the same fields
 *
 * @param payload - Object containing ids array and updates object
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense[]>>
 */
export const apiBulkUpdateExpenses = async (
  payload: BulkUpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense[]>> => {
  return apiRequest<Expense[]>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: payload,
  });
};
