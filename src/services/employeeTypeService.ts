/**
 * Employee Type Service
 * Handles all API operations for employee types management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/employee-types - Create a new employee type
 * - GET /emp-user-management/v1/employee-types/{id} - Get employee type by ID
 * - PATCH /emp-user-management/v1/employee-types/{id} - Update employee type
 * - POST /emp-user-management/v1/employee-types/search - Search employee types
 * - DELETE /emp-user-management/v1/employee-types/{id} - Delete employee type
 * - DELETE /emp-user-management/v1/employee-types/bulk-delete-by-ids - Bulk delete by IDs
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { EmployeeType, EmployeeTypeCarrier } from "@/modules/user-management/types/settings.types";

const BASE_ENDPOINT = "/emp-user-management/v1/employee-types";

/**
 * Update payload - Map of field names to values
 */
export type UpdateEmployeeTypePayload = Partial<Omit<EmployeeType, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Create Employee Type
 * POST /emp-user-management/v1/employee-types
 * 
 * Creates a new employee type in the system.
 * 
 * @param carrier - EmployeeTypeCarrier with id and description
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmployeeType>>
 * 
 * @example
 * const response = await apiCreateEmployeeType({
 *   id: 'FULL_TIME',
 *   description: 'Full-time Employee'
 * }, 'tenant-001');
 */
export const apiCreateEmployeeType = async (
  carrier: EmployeeTypeCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmployeeType>> => {
  return apiRequest<EmployeeType>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Employee Type
 * GET /emp-user-management/v1/employee-types/{id}
 * 
 * Retrieves a specific employee type by ID.
 * 
 * @param id - Employee type ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmployeeType>>
 * 
 * @example
 * const response = await apiGetEmployeeType('FULL_TIME', 'tenant-001');
 */
export const apiGetEmployeeType = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmployeeType>> => {
  return apiRequest<EmployeeType>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Search Employee Types
 * POST /emp-user-management/v1/employee-types/search
 *
 * Performs a universal search across employee types with pagination.
 * Returns: ApiResponse<Pagination<EmployeeType>>
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<EmployeeType>>>
 * 
 * @example
 * const response = await apiSearchEmployeeTypes(
 *   { filters: { and: { description: "Full" } } },
 *   0,
 *   10,
 *   'tenant-001'
 * );
 */
export const apiSearchEmployeeTypes = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<EmployeeType>>> => {
  return apiRequest<Pagination<EmployeeType>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Employee Type
 * DELETE /emp-user-management/v1/employee-types/{id}
 * 
 * Deletes an employee type from the system by ID.
 * Returns void wrapped in ApiResponse.
 * 
 * @param id - Employee type ID to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteEmployeeType('CONTRACTOR', 'tenant-001');
 */
export const apiDeleteEmployeeType = async (
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
 * Bulk Delete Employee Types by IDs
 * DELETE /emp-user-management/v1/employee-types/bulk-delete-by-ids
 * 
 * Deletes multiple employee types by their IDs.
 * The request body is an array of employee type IDs.
 * 
 * @param ids - Array of employee type IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiBulkDeleteEmployeeTypes(
 *   ['CONTRACTOR', 'TEMP'],
 *   'tenant-001'
 * );
 */
export const apiBulkDeleteEmployeeTypes = async (
  ids: string[],
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/bulk-delete-by-ids`,
    tenant,
    accessToken,
    body: ids,
  });
};

// Export all functions as default
export default {
  apiCreateEmployeeType,
  apiGetEmployeeType,
  apiSearchEmployeeTypes,
  apiDeleteEmployeeType,
  apiBulkDeleteEmployeeTypes,
};
