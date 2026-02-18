/**
 * Leave Details Service
 * Handles all API operations for employee leave details and balances management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/leave-details - Create leave details
 * - GET /emp-user-management/v1/leave-details/{id} - Get leave details by employee ID
 * - PATCH /emp-user-management/v1/leave-details/{id} - Update leave details
 * - POST /emp-user-management/v1/leave-details/search - Search leave details
 * - DELETE /emp-user-management/v1/leave-details/{id} - Delete leave details
 * - DELETE /emp-user-management/v1/leave-details/bulk-delete - Bulk delete by IDs
 * - PATCH /emp-user-management/v1/leave-details/bulk-update - Bulk update by IDs
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { apiRequest } from "./utils";
import { LeaveDetails, LeaveDetailsCarrier } from "@/modules/leave-management-system/types/leaveConfiguration.types";

const BASE_ENDPOINT = "/emp-user-management/v1/leave-details";

/**
 * Update payload - Map of field names to values
 * Example: { email: "updated@company.com", lastName: "UpdatedName" }
 */
export type UpdateLeaveDetailsPayload = Record<string, any>;

/**
 * Bulk Update Request
 */
export interface BulkUpdateLeaveDetailsRequest {
  ids: string[];
  updates: UpdateLeaveDetailsPayload;
}

/**
 * Bulk Operation Response Interface
 */
export interface BulkOperationResponse {
  affected: number;
}

/**
 * Create Leave Details
 * POST /emp-user-management/v1/leave-details
 * 
 * Creates new leave details for an employee with initial balances.
 * 
 * @param carrier - LeaveDetailsCarrier with employee data and balances
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveDetails>>
 * 
 * @example
 * const response = await apiCreateLeaveDetails(
 *   {
 *     email: 'john.doe@company.com',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     assignedLeaveTypes: ['AL', 'SL'],
 *     balances: {
 *       'AL': {
 *         leaveCode: 'AL',
 *         availableBalance: 10.5,
 *         usedBalance: 2.5,
 *         totalBalance: 13,
 *         carryForward: 1.5,
 *         lastUpdated: '2026-02-17T10:00:00Z'
 *       }
 *     },
 *     createdAt: '2026-02-17T10:00:00Z'
 *   },
 *   'tenant-001'
 * );
 */
export const apiCreateLeaveDetails = async (
  carrier: LeaveDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveDetails>> => {
  return apiRequest<LeaveDetails>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Leave Details by Employee ID
 * GET /emp-user-management/v1/leave-details/{id}
 * 
 * Retrieves leave details for a specific employee.
 * 
 * @param employeeId - Employee ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveDetails>>
 */
export const apiGetLeaveDetailsById = async (
  employeeId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveDetails>> => {
  return apiRequest<LeaveDetails>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Leave Details
 * PATCH /emp-user-management/v1/leave-details/{id}
 * 
 * Partial update - only provided fields are updated.
 * 
 * @param employeeId - Employee ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveDetails>>
 * 
 * @example
 * const response = await apiUpdateLeaveDetails(
 *   'emp-001',
 *   {
 *     email: 'john.doe.updated@company.com',
 *     balances: {
 *       'AL': {
 *         leaveCode: 'AL',
 *         availableBalance: 9.5,
 *         usedBalance: 3.5,
 *         totalBalance: 13,
 *         carryForward: 1.5,
 *         lastUpdated: '2026-02-17T11:00:00Z'
 *       }
 *     }
 *   },
 *   'tenant-001'
 * );
 */
export const apiUpdateLeaveDetails = async (
  employeeId: string,
  payload: UpdateLeaveDetailsPayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveDetails>> => {
  return apiRequest<LeaveDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Leave Details
 * POST /emp-user-management/v1/leave-details/search
 * 
 * Searches for leave details based on universal search criteria with pagination.
 * 
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<LeaveDetails>>>
 * 
 * @example
 * const response = await apiSearchLeaveDetails(
 *   {
 *     searchText: 'john',
 *     searchFields: ['firstName', 'lastName', 'email'],
 *     sort: { createdAt: -1 }
 *   },
 *   0,
 *   10,
 *   'tenant-001'
 * );
 */
export const apiSearchLeaveDetails = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<LeaveDetails>>> => {
  return apiRequest<Pagination<LeaveDetails>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Leave Details by Employee ID
 * DELETE /emp-user-management/v1/leave-details/{id}
 * 
 * Deletes leave details for a specific employee.
 * 
 * @param employeeId - Employee ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteLeaveDetailsById = async (
  employeeId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
  });
};

/**
 * Bulk Delete Leave Details by IDs
 * DELETE /emp-user-management/v1/leave-details/bulk-delete
 * 
 * Deletes multiple leave details by employee IDs.
 * 
 * @param employeeIds - Array of employee IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BulkOperationResponse>>
 * 
 * @example
 * const response = await apiBulkDeleteLeaveDetails(
 *   ['emp-001', 'emp-002', 'emp-003'],
 *   'tenant-001'
 * );
 */
export const apiBulkDeleteLeaveDetails = async (
  employeeIds: string[],
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<BulkOperationResponse>> => {
  return apiRequest<BulkOperationResponse>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/bulk-delete`,
    tenant,
    accessToken,
    body: employeeIds,
  });
};

/**
 * Bulk Update Leave Details
 * PATCH /emp-user-management/v1/leave-details/bulk-update
 * 
 * Updates multiple leave details with the same updates.
 * 
 * @param request - BulkUpdateLeaveDetailsRequest with IDs and updates
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BulkOperationResponse>>
 * 
 * @example
 * const response = await apiBulkUpdateLeaveDetails(
 *   {
 *     ids: ['emp-001', 'emp-002'],
 *     updates: {
 *       email: 'updated@company.com',
 *       lastName: 'UpdatedLastName'
 *     }
 *   },
 *   'tenant-001'
 * );
 */
export const apiBulkUpdateLeaveDetails = async (
  request: BulkUpdateLeaveDetailsRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<BulkOperationResponse>> => {
  return apiRequest<BulkOperationResponse>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: request,
  });
};
