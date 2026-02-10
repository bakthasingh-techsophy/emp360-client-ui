/**
 * Expense Category Service
 * Handles all API operations for expense category management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/expense-categories - Create expense category
 * - GET /emp-user-management/v1/expense-categories/{id} - Get expense category by ID
 * - PATCH /emp-user-management/v1/expense-categories/{id} - Update expense category
 * - GET /emp-user-management/v1/expense-categories - List all expense categories
 * - POST /emp-user-management/v1/expense-categories/search - Search expense categories
 * - DELETE /emp-user-management/v1/expense-categories/{id} - Delete expense category
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { ExpenseCategoryConfig } from "@/modules/expenses-assets/types/settings.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/expense-categories";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Expense Category
 * POST /emp-user-management/v1/expense-categories
 * 
 * @param carrier - Expense category data (category, description)
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseCategoryConfig>>
 */
export const apiCreateExpenseCategory = async (
  carrier: Omit<ExpenseCategoryConfig, "id">,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseCategoryConfig>> => {
  return apiRequest<ExpenseCategoryConfig>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Expense Category by ID
 * GET /emp-user-management/v1/expense-categories/{id}
 * 
 * @param id - Expense category ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseCategoryConfig>>
 */
export const apiGetExpenseCategoryById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseCategoryConfig>> => {
  return apiRequest<ExpenseCategoryConfig>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * List All Expense Categories
 * GET /emp-user-management/v1/expense-categories
 * 
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseCategoryConfig[]>>
 */
export const apiListExpenseCategories = async (
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseCategoryConfig[]>> => {
  return apiRequest<ExpenseCategoryConfig[]>({
    method: "GET",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
  });
};

/**
 * Update Expense Category
 * PATCH /emp-user-management/v1/expense-categories/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Expense category ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseCategoryConfig>>
 */
export const apiUpdateExpenseCategory = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseCategoryConfig>> => {
  return apiRequest<ExpenseCategoryConfig>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Expense Categories
 * POST /emp-user-management/v1/expense-categories/search
 * 
 * @param searchRequest - UniversalSearchRequest with filters and pagination
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<ExpenseCategoryConfig>>>
 */
export const apiSearchExpenseCategories = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<ExpenseCategoryConfig>>> => {
  return apiRequest<Pagination<ExpenseCategoryConfig>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Expense Category
 * DELETE /emp-user-management/v1/expense-categories/{id}
 * 
 * @param id - Expense category ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteExpenseCategory = async (
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
