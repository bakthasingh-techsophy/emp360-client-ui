/**
 * Expense Line Item Service
 * Handles all API operations for expense line item management
 *
 * Endpoints:
 * - POST /emp-user-management/v1/expense-line-items - Create expense line item
 * - GET /emp-user-management/v1/expense-line-items/{id} - Get expense line item by ID
 * - PATCH /emp-user-management/v1/expense-line-items/{id} - Update expense line item
 * - POST /emp-user-management/v1/expense-line-items/search - Search expense line items
 * - DELETE /emp-user-management/v1/expense-line-items/{id} - Delete expense line item
 * - DELETE /emp-user-management/v1/expense-line-items/bulk-delete - Bulk delete line items
 * - PATCH /emp-user-management/v1/expense-line-items/bulk-update - Bulk update line items
 *
 * All responses follow ApiResponse<T> wrapper format
 */

import { ExpenseLineItem, ExpenseLineItemCarrier } from "@/modules/expenses-assets/types/expense.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/expense-line-items";

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
 * Create Expense Line Item
 * POST /emp-user-management/v1/expense-line-items
 *
 * @param carrier - Expense line item data
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseLineItem>>
 */
export const apiCreateExpenseLineItem = async (
  carrier: ExpenseLineItemCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseLineItem>> => {
  return apiRequest<ExpenseLineItem>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Expense Line Item by ID
 * GET /emp-user-management/v1/expense-line-items/{id}
 *
 * @param id - Expense line item ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseLineItem>>
 */
export const apiGetExpenseLineItemById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseLineItem>> => {
  return apiRequest<ExpenseLineItem>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Expense Line Item
 * PATCH /emp-user-management/v1/expense-line-items/{id}
 *
 * Partial update - only provided fields are updated
 *
 * @param id - Expense line item ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseLineItem>>
 */
export const apiUpdateExpenseLineItem = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseLineItem>> => {
  return apiRequest<ExpenseLineItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Expense Line Items
 * POST /emp-user-management/v1/expense-line-items/search
 *
 * @param searchRequest - UniversalSearchRequest with filters and pagination
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<ExpenseLineItem>>>
 */
export const apiSearchExpenseLineItems = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<ExpenseLineItem>>> => {
  return apiRequest<Pagination<ExpenseLineItem>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Expense Line Item
 * DELETE /emp-user-management/v1/expense-line-items/{id}
 *
 * @param id - Expense line item ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteExpenseLineItem = async (
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
 * Bulk Delete Expense Line Items
 * DELETE /emp-user-management/v1/expense-line-items/bulk-delete
 *
 * @param ids - Array of expense line item IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteExpenseLineItems = async (
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
 * Bulk Update Expense Line Items
 * PATCH /emp-user-management/v1/expense-line-items/bulk-update
 *
 * Updates multiple expense line items with the same fields
 *
 * @param payload - Object containing ids array and updates object
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseLineItem[]>>
 */
export const apiBulkUpdateExpenseLineItems = async (
  payload: BulkUpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseLineItem[]>> => {
  return apiRequest<ExpenseLineItem[]>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: payload,
  });
};
