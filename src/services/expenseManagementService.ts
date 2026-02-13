/**
 * Expense Management Service
 * Service for expense lifecycle management with approval workflow support
 * 
 * This is the central service for expense management operations.
 * For basic CRUD operations, see expenseService.ts
 * 
 * Available Endpoints (from Postman API):
 * - POST /emp-user-management/v1/expenses/create - Create a new expense/advance
 * - GET /emp-user-management/v1/expenses/{id} - Get full expense details
 * - GET /emp-user-management/v1/expenses/{id}/snapshot - Get expense snapshot (optimized)
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import {
  Expense,
  ExpenseCarrier,
  ExpenseSnapshot,
} from "@/modules/expenses-assets/types/expense.types";
import {
  Intimation,
  IntimationCarrier,
  IntimationSnapshot,
} from "@/modules/expenses-assets/types/intimation.types";
import { UniversalSearchRequest } from "@/types/search";
import { Pagination } from "@/types/pagination";

const BASE_ENDPOINT = "/emp-user-management/v1/expense-management";

/**
 * Create Expense
 * POST /emp-user-management/v1/expenses/create
 * 
 * Creates a new expense claim or advance request in the system.
 * Can be for a regular employee or a temporary person.
 * 
 * @param carrier - ExpenseCarrier with expense information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense>>
 * 
 * @example
 * const response = await apiCreateExpense({
 *   type: 'expense',
 *   companyId: 'company-001',
 *   employeeId: 'EMP-001',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john.doe@company.com',
 *   description: 'Business trip to Mumbai for client meeting',
 *   lineItemIds: ['LI-001', 'LI-002'],
 *   status: 'pending',
 *   currentApprovalLevel: 1,
 *   createdAt: new Date().toISOString()
 * }, 'tenant-001');
 */
export const apiCreateExpense = async (
  carrier: ExpenseCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense>> => {
  return apiRequest<Expense>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/create`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Expense By ID
 * GET /emp-user-management/v1/expenses/{id}
 * 
 * Retrieves full expense details by ID.
 * Returns complete expense object with all approval history and line items.
 * 
 * @param expenseId - Expense ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense>>
 * 
 * @example
 * const response = await apiGetExpenseDetails('EXP-2026-12345', 'tenant-001');
 */
export const apiGetExpenseDetails = async (
  expenseId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense>> => {
  return apiRequest<Expense>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${expenseId}`,
    tenant,
    accessToken,
  });
};

/**
 * Get Expense Snapshot By ID
 * GET /emp-user-management/v1/expenses/{id}/snapshot
 * 
 * Retrieves optimized expense snapshot for rendering in lists/tables.
 * Includes cached computed fields like lineItemCount for better performance.
 * 
 * @param expenseId - Expense ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ExpenseSnapshot>>
 * 
 * @example
 * const response = await apiGetExpenseSnapshot('EXP-2026-12345', 'tenant-001');
 */
export const apiGetExpenseSnapshot = async (
  expenseId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ExpenseSnapshot>> => {
  return apiRequest<ExpenseSnapshot>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${expenseId}/snapshot`,
    tenant,
    accessToken,
  });
};

/**
 * Search Expense Snapshots
 * POST /emp-user-management/v1/expenses/snapshots/search
 * 
 * Searches expense snapshots with filters and pagination.
 * Optimized for table rendering with search, filtering, and sorting.
 * 
 * @param searchRequest - UniversalSearchRequest with searchText, searchFields, filters, sort
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<ExpenseSnapshot>>>
 * 
 * @example
 * const response = await apiSearchExpenseSnapshots({
 *   searchText: 'travel',
 *   searchFields: ['description', 'type', 'firstName', 'lastName'],
 *   filters: { and: { status: 'PENDING' } },
 *   sort: { createdAt: -1 }
 * }, 0, 20, 'tenant-001');
 */
export const apiSearchExpenseSnapshots = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  size: number = 20,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<ExpenseSnapshot>>> => {
  const endpoint = `${BASE_ENDPOINT}/snapshots/search?page=${page}&size=${size}`;
  
  return apiRequest<Pagination<ExpenseSnapshot>>({
    method: "POST",
    endpoint,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Add Expense Line Item
 * POST /emp-user-management/v1/expense-management/{expenseId}/line-items/add
 * 
 * Adds a new line item to an existing expense.
 * 
 * @param expenseId - Expense ID to add line item to
 * @param lineItem - Line item data (includes id, category, description, amount, dates, attachments)
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense>>
 * 
 * @example
 * const response = await apiAddExpenseLineItem('EXP-2026-12345', {
 *   id: 'LI-004',
 *   category: 'TRAVEL',
 *   expenseId: 'EXP-2026-12345',
 *   description: 'Flight ticket to Mumbai',
 *   amount: 25000.00,
 *   fromDate: '2026-02-12',
 *   toDate: '2026-02-14',
 *   attachments: [],
 *   createdAt: new Date().toISOString()
 * }, 'tenant-001');
 */
export const apiAddExpenseLineItem = async (
  expenseId: string,
  lineItem: any,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense>> => {
  return apiRequest<Expense>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/${expenseId}/line-items/add`,
    tenant,
    accessToken,
    body: lineItem,
  });
};

/**
 * Delete Expense Line Item
 * DELETE /emp-user-management/v1/expense-management/{expenseId}/line-items/{lineItemId}
 * 
 * Deletes a line item from an existing expense.
 * 
 * @param expenseId - Expense ID
 * @param lineItemId - Line item ID to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Expense>>
 * 
 * @example
 * const response = await apiDeleteExpenseLineItem('EXP-2026-12345', 'LI-004', 'tenant-001');
 */
export const apiDeleteExpenseLineItem = async (
  expenseId: string,
  lineItemId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Expense>> => {
  return apiRequest<Expense>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${expenseId}/line-items/${lineItemId}`,
    tenant,
    accessToken,
  });
};

/**
 * Delete Expense
 * DELETE /emp-user-management/v1/expense-management/{expenseId}
 * 
 * Deletes an expense from the system.
 * 
 * @param expenseId - Expense ID to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteExpense('EXP-2026-12345', 'tenant-001');
 */
export const apiDeleteExpense = async (
  expenseId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${expenseId}`,
    tenant,
    accessToken,
  });
};

/**
 * Get Intimation By ID
 * GET /emp-user-management/v1/expense-management/intimations/{id}
 * 
 * Retrieves full intimation details by ID.
 * Returns complete intimation object with all journey segments and details.
 * 
 * @param intimationId - Intimation ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Intimation>>
 * 
 * @example
 * const response = await apiGetIntimationDetails('INT-2026-12345', 'tenant-001');
 */
export const apiGetIntimationDetails = async (
  intimationId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Intimation>> => {
  return apiRequest<Intimation>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/intimations/${intimationId}`,
    tenant,
    accessToken,
  });
};

/**
 * Create Intimation Request
 * POST /emp-user-management/v1/expense-management/intimations/create
 * 
 * Creates a new intimation request through the expense management service.
 * This is for intimations that may later be converted to expenses.
 * 
 * @param carrier - IntimationCarrier with intimation information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Intimation>>
 * 
 * @example
 * const response = await apiCreateIntimationRequest({
 *   type: 'travel',
 *   raisedFor: 'myself',
 *   companyId: 'company-001',
 *   employeeId: 'emp-001',
 *   additionalNotes: 'Business trip to client site',
 *   createdAt: new Date().toISOString()
 * }, 'tenant-001');
 */
export const apiCreateIntimationRequest = async (
  carrier: IntimationCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Intimation>> => {
  return apiRequest<Intimation>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/intimations/create`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Search Intimation Snapshots
 * POST /emp-user-management/v1/expense-management/intimations/snapshots/search
 * 
 * Searches intimation snapshots with filters and pagination.
 * Optimized for table rendering with search, filtering, and sorting.
 * 
 * @param searchRequest - UniversalSearchRequest with searchText, searchFields, filters, sort
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<IntimationSnapshot>>>
 * 
 * @example
 * const response = await apiSearchIntimationSnapshots({
 *   searchText: 'travel',
 *   searchFields: ['type', 'firstName', 'lastName'],
 *   filters: { and: { status: 'PENDING_APPROVAL' } },
 *   sort: { createdAt: -1 }
 * }, 0, 20, 'tenant-001');
 */
export const apiSearchIntimationSnapshots = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  size: number = 20,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<IntimationSnapshot>>> => {
  const endpoint = `${BASE_ENDPOINT}/intimations/snapshots/search?page=${page}&size=${size}`;
  
  return apiRequest<Pagination<IntimationSnapshot>>({
    method: "POST",
    endpoint,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const expenseManagementService = {
  apiCreateExpense,
  apiGetExpenseDetails,
  apiGetExpenseSnapshot,
  apiSearchExpenseSnapshots,
  apiAddExpenseLineItem,
  apiDeleteExpenseLineItem,
  apiDeleteExpense,
  apiGetIntimationDetails,
  apiCreateIntimationRequest,
  apiSearchIntimationSnapshots,
};
