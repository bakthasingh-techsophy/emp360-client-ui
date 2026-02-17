/**
 * Leave Configuration Basic Details Service
 * Handles all API operations for leave configuration basic details management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/leave-configuration-basic-details - Create basic details
 * - GET /emp-user-management/v1/leave-configuration-basic-details/{id} - Get basic details by ID
 * - PATCH /emp-user-management/v1/leave-configuration-basic-details/{id} - Update basic details
 * - POST /emp-user-management/v1/leave-configuration-basic-details/search - Search basic details with pagination
 * - DELETE /emp-user-management/v1/leave-configuration-basic-details/{id} - Delete basic details by ID
 * - DELETE /emp-user-management/v1/leave-configuration-basic-details/bulk-delete - Bulk delete by IDs
 * - PATCH /emp-user-management/v1/leave-configuration-basic-details/bulk-update - Bulk update basic details
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { apiRequest } from "./utils";

const BASE_ENDPOINT = "/emp-user-management/v1/leave-configuration-basic-details";

/**
 * Leave Configuration Basic Details Model
 */
export interface LeaveConfigurationBasicDetails {
  id: string;
  name: string;
  code: string;
  tagline: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Leave Configuration Basic Details Carrier (for creation)
 */
export interface LeaveConfigurationBasicDetailsCarrier {
  name: string;
  code: string;
  tagline: string;
  description: string;
  createdAt: string;
}

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Bulk update request body
 */
export interface BulkUpdateRequest {
  ids: string[];
  updates: UpdatePayload;
}

/**
 * Create Leave Configuration Basic Details
 * POST /emp-user-management/v1/leave-configuration-basic-details
 * 
 * @param carrier - LeaveConfigurationBasicDetailsCarrier with basic information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveConfigurationBasicDetails>>
 */
export const apiCreateLeaveConfigurationBasicDetails = async (
  carrier: LeaveConfigurationBasicDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveConfigurationBasicDetails>> => {
  return apiRequest<LeaveConfigurationBasicDetails>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Leave Configuration Basic Details by ID
 * GET /emp-user-management/v1/leave-configuration-basic-details/{id}
 * 
 * @param id - Basic Details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveConfigurationBasicDetails>>
 */
export const apiGetLeaveConfigurationBasicDetailsById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveConfigurationBasicDetails>> => {
  return apiRequest<LeaveConfigurationBasicDetails>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Leave Configuration Basic Details
 * PATCH /emp-user-management/v1/leave-configuration-basic-details/{id}
 * 
 * @param id - Basic Details ID
 * @param updates - Partial updates for basic details
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveConfigurationBasicDetails>>
 */
export const apiUpdateLeaveConfigurationBasicDetails = async (
  id: string,
  updates: Partial<LeaveConfigurationBasicDetailsCarrier>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveConfigurationBasicDetails>> => {
  return apiRequest<LeaveConfigurationBasicDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: updates,
  });
};

/**
 * Search Leave Configuration Basic Details with Pagination
 * POST /emp-user-management/v1/leave-configuration-basic-details/search
 * 
 * @param filters - Universal search request filters
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<LeaveConfigurationBasicDetails>>>
 */
export const apiSearchLeaveConfigurationBasicDetails = async (
  filters: UniversalSearchRequest,
  page: number,
  size: number,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<LeaveConfigurationBasicDetails>>> => {
  return apiRequest<Pagination<LeaveConfigurationBasicDetails>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${size}`,
    tenant,
    accessToken,
    body: filters,
  });
};

/**
 * Delete Leave Configuration Basic Details by ID
 * DELETE /emp-user-management/v1/leave-configuration-basic-details/{id}
 * 
 * @param id - Basic Details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteLeaveConfigurationBasicDetailsById = async (
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
 * Bulk Delete Leave Configuration Basic Details by IDs
 * DELETE /emp-user-management/v1/leave-configuration-basic-details/bulk-delete
 * 
 * @param ids - Array of basic details IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteLeaveConfigurationBasicDetailsByIds = async (
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
 * Bulk Update Leave Configuration Basic Details
 * PATCH /emp-user-management/v1/leave-configuration-basic-details/bulk-update
 * 
 * @param request - Bulk update request containing IDs and updates
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkUpdateLeaveConfigurationBasicDetails = async (
  request: BulkUpdateRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: request,
  });
};
