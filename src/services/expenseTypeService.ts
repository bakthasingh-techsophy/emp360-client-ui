/**
 * Expense Type Service
 * Handles all API operations for expense type management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/expense-types - Create expense type
 * - GET /emp-user-management/v1/expense-types/{id} - Get expense type by ID
 * - PATCH /emp-user-management/v1/expense-types/{id} - Update expense type
 * - GET /emp-user-management/v1/expense-types - List all expense types
 * - POST /emp-user-management/v1/expense-types/search - Search expense types
 * - DELETE /emp-user-management/v1/expense-types/{id} - Delete expense type
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { ExpenseTypeConfig } from "@/modules/expenses-assets/types/settings.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/expense-types";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Expense Type
 * POST /emp-user-management/v1/expense-types
 * 
 * @param carrier - Expense type data (type, description)
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseTypeConfig>>
 */
export const apiCreateExpenseType = async (
  carrier: Omit<ExpenseTypeConfig, "id">,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseTypeConfig>> => {
  return apiRequest<ExpenseTypeConfig>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Expense Type by ID
 * GET /emp-user-management/v1/expense-types/{id}
 * 
 * @param id - Expense type ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseTypeConfig>>
 */
export const apiGetExpenseTypeById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseTypeConfig>> => {
  return apiRequest<ExpenseTypeConfig>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * List All Expense Types
 * GET /emp-user-management/v1/expense-types
 * 
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseTypeConfig[]>>
 */
export const apiListExpenseTypes = async (
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseTypeConfig[]>> => {
  return apiRequest<ExpenseTypeConfig[]>({
    method: "GET",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
  });
};

/**
 * Update Expense Type
 * PATCH /emp-user-management/v1/expense-types/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Expense type ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseTypeConfig>>
 */
export const apiUpdateExpenseType = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseTypeConfig>> => {
  return apiRequest<ExpenseTypeConfig>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Expense Types
 * POST /emp-user-management/v1/expense-types/search
 * 
 * @param searchRequest - UniversalSearchRequest with filters and pagination
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<ExpenseTypeConfig>>>
 */
export const apiSearchExpenseTypes = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<ExpenseTypeConfig>>> => {
  return apiRequest<Pagination<ExpenseTypeConfig>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Expense Type
 * DELETE /emp-user-management/v1/expense-types/{id}
 * 
 * @param id - Expense type ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteExpenseType = async (
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
