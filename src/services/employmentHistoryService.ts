/**
 * Employment History Service
 * Handles all API operations for employment history management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/employment-history - Create employment history
 * - GET /emp-user-management/v1/employment-history/{id} - Get employment history by ID
 * - PATCH /emp-user-management/v1/employment-history/{id} - Update employment history
 * - POST /emp-user-management/v1/employment-history/search - Search employment history
 * - PATCH /emp-user-management/v1/employment-history/bulk-update - Bulk update
 * - DELETE /emp-user-management/v1/employment-history/{id} - Delete employment history
 * - DELETE /emp-user-management/v1/employment-history/bulk-delete-by-ids - Bulk delete by IDs
 * - POST /emp-user-management/v1/employment-history/bulk-delete-by-filters - Bulk delete by filters
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/employment-history";

/**
 * Employment History Item
 * Represents a single employment history record
 */
export interface EmploymentHistoryItem {
  id?: string;
  employeeId: string;
  companyName: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  tenure: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Bulk Operation Response Interface
 */
export interface BulkOperationResponse {
  affected: number;
}

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Employment History
 * POST /emp-user-management/v1/employment-history
 * 
 * @param item - EmploymentHistoryItem with employment data
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmploymentHistoryItem>>
 */
export const apiCreateEmploymentHistory = async (
  item: EmploymentHistoryItem,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmploymentHistoryItem>> => {
  return apiRequest<EmploymentHistoryItem>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: item,
  });
};

/**
 * Get Employment History by ID
 * GET /emp-user-management/v1/employment-history/{id}
 * 
 * @param id - Employment history ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmploymentHistoryItem>>
 */
export const apiGetEmploymentHistoryById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmploymentHistoryItem>> => {
  return apiRequest<EmploymentHistoryItem>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Employment History
 * PATCH /emp-user-management/v1/employment-history/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Employment history ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmploymentHistoryItem>>
 */
export const apiUpdateEmploymentHistory = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmploymentHistoryItem>> => {
  return apiRequest<EmploymentHistoryItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Employment History
 * POST /emp-user-management/v1/employment-history/search
 * 
 * @param searchRequest - UniversalSearchRequest with filters
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<EmploymentHistoryItem>>>
 */
export const apiSearchEmploymentHistory = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<EmploymentHistoryItem>>> => {
  return apiRequest<Pagination<EmploymentHistoryItem>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Bulk Update Employment History
 * PATCH /emp-user-management/v1/employment-history/bulk-update
 * 
 * Updates multiple employment history records matching the filter criteria
 * 
 * @param filters - Universal search filters to select records
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BulkOperationResponse>>
 */
export const apiBulkUpdateEmploymentHistory = async (
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
 * Delete Employment History by ID
 * DELETE /emp-user-management/v1/employment-history/{id}
 * 
 * @param id - Employment history ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteEmploymentHistoryById = async (
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
 * Bulk Delete Employment History by IDs
 * DELETE /emp-user-management/v1/employment-history/bulk-delete-by-ids
 * 
 * @param ids - Array of employment history IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteEmploymentHistoryByIds = async (
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
 * Bulk Delete Employment History by Filters
 * POST /emp-user-management/v1/employment-history/bulk-delete-by-filters
 * 
 * @param filters - Universal search filters to select records for deletion
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteEmploymentHistoryByFilters = async (
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
export const employmentHistoryService = {
  apiCreateEmploymentHistory,
  apiGetEmploymentHistoryById,
  apiUpdateEmploymentHistory,
  apiSearchEmploymentHistory,
  apiBulkUpdateEmploymentHistory,
  apiDeleteEmploymentHistoryById,
  apiBulkDeleteEmploymentHistoryByIds,
  apiBulkDeleteEmploymentHistoryByFilters,
};
