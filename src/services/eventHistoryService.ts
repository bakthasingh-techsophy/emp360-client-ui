/**
 * Event History Service
 * Handles all API operations for event history management (promotions, transfers, etc.)
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/event-history - Create event history
 * - GET /emp-user-management/v1/event-history/{id} - Get event history by ID
 * - PATCH /emp-user-management/v1/event-history/{id} - Update event history
 * - POST /emp-user-management/v1/event-history/search - Search event history
 * - PATCH /emp-user-management/v1/event-history/bulk-update - Bulk update
 * - DELETE /emp-user-management/v1/event-history/{id} - Delete event history
 * - DELETE /emp-user-management/v1/event-history/bulk-delete-by-ids - Bulk delete by IDs
 * - POST /emp-user-management/v1/event-history/bulk-delete-by-filters - Bulk delete by filters
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/event-history";

/**
 * Event History Item
 * Represents career events like promotions, transfers, etc.
 */
export interface EventHistoryItem {
  id?: string;
  employeeId: string;
  date: string;
  type: "PROMOTION" | "TRANSFER" | "DEMOTION" | "SALARY_REVISION" | "OTHER";
  oldRole?: string;
  newRole?: string;
  oldDepartment?: string;
  newDepartment?: string;
  reason?: string;
  effectiveDate?: string;
  order?: number;
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
 * Create Event History
 * POST /emp-user-management/v1/event-history
 * 
 * @param item - EventHistoryItem with event data
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EventHistoryItem>>
 */
export const apiCreateEventHistory = async (
  item: EventHistoryItem,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EventHistoryItem>> => {
  return apiRequest<EventHistoryItem>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: item,
  });
};

/**
 * Get Event History by ID
 * GET /emp-user-management/v1/event-history/{id}
 * 
 * @param id - Event history ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EventHistoryItem>>
 */
export const apiGetEventHistoryById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EventHistoryItem>> => {
  return apiRequest<EventHistoryItem>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Event History
 * PATCH /emp-user-management/v1/event-history/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Event history ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EventHistoryItem>>
 */
export const apiUpdateEventHistory = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EventHistoryItem>> => {
  return apiRequest<EventHistoryItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Event History
 * POST /emp-user-management/v1/event-history/search
 * 
 * @param searchRequest - UniversalSearchRequest with filters
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<EventHistoryItem>>>
 */
export const apiSearchEventHistory = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<EventHistoryItem>>> => {
  return apiRequest<Pagination<EventHistoryItem>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Bulk Update Event History
 * PATCH /emp-user-management/v1/event-history/bulk-update
 * 
 * Updates multiple event history records matching the filter criteria
 * 
 * @param filters - Universal search filters to select records
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BulkOperationResponse>>
 */
export const apiBulkUpdateEventHistory = async (
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
 * Delete Event History by ID
 * DELETE /emp-user-management/v1/event-history/{id}
 * 
 * @param id - Event history ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteEventHistoryById = async (
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
 * Bulk Delete Event History by IDs
 * DELETE /emp-user-management/v1/event-history/bulk-delete-by-ids
 * 
 * @param ids - Array of event history IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteEventHistoryByIds = async (
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
 * Bulk Delete Event History by Filters
 * POST /emp-user-management/v1/event-history/bulk-delete-by-filters
 * 
 * @param filters - Universal search filters to select records for deletion
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteEventHistoryByFilters = async (
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
export const eventHistoryService = {
  apiCreateEventHistory,
  apiGetEventHistoryById,
  apiUpdateEventHistory,
  apiSearchEventHistory,
  apiBulkUpdateEventHistory,
  apiDeleteEventHistoryById,
  apiBulkDeleteEventHistoryByIds,
  apiBulkDeleteEventHistoryByFilters,
};
