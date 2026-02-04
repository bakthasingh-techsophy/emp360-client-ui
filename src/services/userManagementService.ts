/**
 * User Management Service
 * Handles all API operations for user management - onboarding and user lifecycle
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/users/onboard - Onboard a new user
 * - PATCH /emp-user-management/v1/users/{employeeId} - Update user details
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { UserDetails, UserDetailsCarrier } from "@/modules/user-management/types/onboarding.types";

const BASE_ENDPOINT = "/emp-user-management/v1/users";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Onboard New User
 * POST /emp-user-management/v1/users/onboard
 * 
 * Creates a new user in the system with basic user details.
 * This is the entry point for employee onboarding.
 * 
 * @param carrier - UserDetailsCarrier with user information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserDetails>>
 * 
 * @example
 * const response = await apiOnboardUser({
 *   employeeId: 'EMP001',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john.doe@company.com',
 *   phone: '+91-9876543210',
 *   status: UserStatus.ACTIVE
 * }, 'test-realm');
 */
export const apiOnboardUser = async (
  carrier: UserDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserDetails>> => {
  return apiRequest<UserDetails>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/onboard`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Update User Details
 * PATCH /emp-user-management/v1/users/{employeeId}
 * 
 * Partially updates user details - only provided fields are updated
 * 
 * @param employeeId - Employee ID
 * @param payload - Map of fields to update (e.g., { firstName: "Jane", phone: "+91-9876543220" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserDetails>>
 * 
 * @example
 * const response = await apiUpdateUser('EMP001', {
 *   firstName: 'Jane',
 *   phone: '+91-9876543220',
 *   status: UserStatus.INACTIVE
 * }, 'test-realm');
 */
export const apiUpdateUser = async (
  employeeId: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserDetails>> => {
  return apiRequest<UserDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search User Snapshots
 * POST /emp-user-management/v1/users/snapshots/search
 *
 * Performs a universal search across user snapshots with pagination.
 * Returns: ApiResponse<Pagination<any>> (snapshot shape is dynamic)
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 */
export const apiSearchUserSnapshots = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<any>>> => {
  return apiRequest<Pagination<any>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/snapshots/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete User
 * DELETE /emp-user-management/v1/users/{employeeId}
 * 
 * Deletes a user from the system by employee ID.
 * Returns void wrapped in ApiResponse.
 * 
 * @param employeeId - Employee ID to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteUser('EMP-001', 'tenant-001');
 */
export const apiDeleteUser = async (
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
 * Export all service functions as default object for easier importing
 */
export const userManagementService = {
  apiOnboardUser,
  apiUpdateUser,
  apiSearchUserSnapshots,
  apiDeleteUser,
};
