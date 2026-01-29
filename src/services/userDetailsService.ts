/**
 * User Details Service
 * Handles all API operations for user details management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/user-details - Create user details
 * - GET /emp-user-management/v1/user-details/{id} - Get user details by ID
 * - PATCH /emp-user-management/v1/user-details/{id} - Update user details
 * - POST /emp-user-management/v1/user-details/search - Search user details
 * - PATCH /emp-user-management/v1/user-details/bulk-update - Bulk update
 * - DELETE /emp-user-management/v1/user-details/{id} - Delete user details
 * - DELETE /emp-user-management/v1/user-details/bulk-delete-by-ids - Bulk delete by IDs
 * - POST /emp-user-management/v1/user-details/bulk-delete-by-filters - Bulk delete by filters
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { UserDetails, UserDetailsCarrier } from "@/modules/user-management/types/onboarding.types";

const BASE_ENDPOINT = "/emp-user-management/v1/user-details";

/**
 * Bulk Operation Response Interface
 */
export interface BulkOperationResponse {
  affected: number;
}

/**
 * Update payload - Map of field names to values
 * Example: { phone: "+91-9876543220", status: "INACTIVE" }
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create User Details
 * POST /emp-user-management/v1/user-details
 * 
 * @param carrier - UserDetailsCarrier with user data
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserDetailsResponse>>
 */
export const apiCreateUserDetails = async (
  carrier: UserDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserDetails>> => {
  return apiRequest<UserDetails>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get User Details by ID
 * GET /emp-user-management/v1/user-details/{id}
 * 
 * @param id - User details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserDetailsResponse>>
 */
export const apiGetUserDetailsById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserDetails>> => {
  return apiRequest<UserDetails>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update User Details
 * PATCH /emp-user-management/v1/user-details/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - User details ID
 * @param payload - Map of fields to update (e.g., { phone: "+91-9876543220", status: "INACTIVE" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserDetails>>
 */
export const apiUpdateUserDetails = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserDetails>> => {
  return apiRequest<UserDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search User Details
 * POST /emp-user-management/v1/user-details/search
 * 
 * Searches for user details based on universal search criteria with pagination
 * Returns: ApiResponse<Pagination<UserDetails>>
 * 
 * @param searchRequest - UniversalSearchRequest with filters, search text, date filters, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<UserDetails>>>
 */
export const apiSearchUserDetails = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<UserDetails>>> => {
  return apiRequest<Pagination<UserDetails>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Bulk Update User Details
 * PATCH /emp-user-management/v1/user-details/bulk-update
 * 
 * Updates multiple user details matching the filter criteria
 * Returns: ApiResponse<BulkOperationResponse>
 * 
 * @param filters - Universal search filters to select users
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BulkOperationResponse>>
 */
export const apiBulkUpdateUserDetails = async (
  filters: UniversalSearchRequest,
  updates: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<BulkOperationResponse>> => {
  return apiRequest<BulkOperationResponse>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: {
      filters,
      updates,
    },
  });
};

/**
 * Delete User Details by ID
 * DELETE /emp-user-management/v1/user-details/{id}
 * 
 * Deletes a single user details record
 * Returns: ApiResponse<void>
 * 
 * @param id - User details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteUserDetailsById = async (
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
 * Bulk Delete User Details by IDs
 * DELETE /emp-user-management/v1/user-details/bulk-delete-by-ids
 * 
 * Deletes multiple user details records by their IDs
 * Returns: ApiResponse<void>
 * 
 * @param ids - Array of user details IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteUserDetailsByIds = async (
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

/**
 * Bulk Delete User Details by Filters
 * POST /emp-user-management/v1/user-details/bulk-delete-by-filters
 * 
 * Deletes multiple user details records matching the filter criteria
 * Returns: ApiResponse<void>
 * 
 * @param filters - Universal search filters to select users for deletion
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteUserDetailsByFilters = async (
  filters: UniversalSearchRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/bulk-delete-by-filters`,
    tenant,
    accessToken,
    body: filters,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const userDetailsService = {
  apiCreateUserDetails,
  apiGetUserDetailsById,
  apiUpdateUserDetails,
  apiSearchUserDetails,
  apiBulkUpdateUserDetails,
  apiDeleteUserDetailsById,
  apiBulkDeleteUserDetailsByIds,
  apiBulkDeleteUserDetailsByFilters,
};
