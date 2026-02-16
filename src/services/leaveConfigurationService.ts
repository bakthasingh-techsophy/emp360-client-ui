/**
 * Leave Configuration Service
 * Handles all API operations for leave configuration management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/leave-configurations - Create leave configuration
 * - GET /emp-user-management/v1/leave-configurations/{id} - Get leave configuration by ID
 * - PATCH /emp-user-management/v1/leave-configurations/{id} - Update leave configuration
 * - POST /emp-user-management/v1/leave-configurations/search - Search leave configurations with pagination
 * - DELETE /emp-user-management/v1/leave-configurations/{id} - Delete leave configuration by ID
 * - PATCH /emp-user-management/v1/leave-configurations/bulk-update - Bulk update leave configurations
 * - DELETE /emp-user-management/v1/leave-configurations/bulk-delete-by-ids - Bulk delete by IDs
 * - POST /emp-user-management/v1/leave-configurations/bulk-delete-by-filters - Bulk delete by filters
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  LeaveConfiguration,
  LeaveConfigurationCarrier,
} from "@/modules/leave-management-system/types/leaveConfiguration.types";
import { apiRequest } from "./utils";

const BASE_ENDPOINT = "/emp-user-management/v1/leave-configurations";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Bulk update request body
 */
export interface BulkUpdateRequest {
  filters: {
    and?: Record<string, any>;
    or?: Record<string, any>;
  };
  updates: UpdatePayload;
}

/**
 * Bulk delete by filters request body
 */
export interface BulkDeleteByFiltersRequest {
  filters: {
    and?: Record<string, any>;
    or?: Record<string, any>;
  };
}

/**
 * Create Leave Configuration
 * POST /emp-user-management/v1/leave-configurations
 * 
 * @param carrier - LeaveConfigurationCarrier with configuration information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveConfiguration>>
 */
export const apiCreateLeaveConfiguration = async (
  carrier: LeaveConfigurationCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveConfiguration>> => {
  return apiRequest<LeaveConfiguration>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Leave Configuration by ID
 * GET /emp-user-management/v1/leave-configurations/{id}
 * 
 * @param id - Leave Configuration ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveConfiguration>>
 */
export const apiGetLeaveConfigurationById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveConfiguration>> => {
  return apiRequest<LeaveConfiguration>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Leave Configuration
 * PATCH /emp-user-management/v1/leave-configurations/{id}
 * 
 * Partial update - only provided fields are updated
 * Supports nested field updates using dot notation (e.g., "creditPolicy.value")
 * 
 * @param id - Leave Configuration ID
 * @param payload - Map of fields to update (supports dot notation for nested fields)
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<LeaveConfiguration>>
 */
export const apiUpdateLeaveConfiguration = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<LeaveConfiguration>> => {
  return apiRequest<LeaveConfiguration>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Leave Configurations with Pagination
 * POST /emp-user-management/v1/leave-configurations/search?page={page}&size={size}
 * 
 * @param searchRequest - UniversalSearchRequest for filtering
 * @param page - Page number (0-based)
 * @param pageSize - Number of items per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<LeaveConfiguration>>>
 */
export const apiSearchLeaveConfigurations = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<LeaveConfiguration>>> => {
  return apiRequest<Pagination<LeaveConfiguration>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Leave Configuration by ID
 * DELETE /emp-user-management/v1/leave-configurations/{id}
 * 
 * @param id - Leave Configuration ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteLeaveConfigurationById = async (
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
 * Bulk Update Leave Configurations
 * PATCH /emp-user-management/v1/leave-configurations/bulk-update
 * 
 * Update multiple leave configurations matching the filters
 * 
 * @param request - BulkUpdateRequest with filters and updates
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkUpdateLeaveConfigurations = async (
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

/**
 * Bulk Delete Leave Configurations by IDs
 * DELETE /emp-user-management/v1/leave-configurations/bulk-delete-by-ids
 * 
 * @param ids - Array of leave configuration IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteLeaveConfigurationsByIds = async (
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
 * Bulk Delete Leave Configurations by Filters
 * POST /emp-user-management/v1/leave-configurations/bulk-delete-by-filters
 * 
 * Delete multiple leave configurations matching the filters
 * 
 * @param request - BulkDeleteByFiltersRequest with filters
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteLeaveConfigurationsByFilters = async (
  request: BulkDeleteByFiltersRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/bulk-delete-by-filters`,
    tenant,
    accessToken,
    body: request,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const leaveConfigurationService = {
  apiCreateLeaveConfiguration,
  apiGetLeaveConfigurationById,
  apiUpdateLeaveConfiguration,
  apiSearchLeaveConfigurations,
  apiDeleteLeaveConfigurationById,
  apiBulkUpdateLeaveConfigurations,
  apiBulkDeleteLeaveConfigurationsByIds,
  apiBulkDeleteLeaveConfigurationsByFilters,
};
