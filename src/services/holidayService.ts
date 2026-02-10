/**
 * Holiday Service
 * Handles all API operations for holiday management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/holidays - Create holiday
 * - GET /emp-user-management/v1/holidays/{id} - Get holiday by ID
 * - PATCH /emp-user-management/v1/holidays/{id} - Update holiday
 * - POST /emp-user-management/v1/holidays/search - Search holidays with pagination
 * - DELETE /emp-user-management/v1/holidays/{id} - Delete holiday by ID
 * - DELETE /emp-user-management/v1/holidays/bulk-delete - Bulk delete holidays
 * - PATCH /emp-user-management/v1/holidays/bulk-update - Bulk update holidays
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  Holiday,
  HolidayCarrier,
} from "@/modules/time-attendance/holiday-management/types";
import { apiRequest } from "./utils";

const BASE_ENDPOINT = "/emp-user-management/v1/holidays";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Holiday
 * POST /emp-user-management/v1/holidays
 * 
 * @param carrier - HolidayCarrier with holiday information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Holiday>>
 */
export const apiCreateHoliday = async (
  carrier: HolidayCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Holiday>> => {
  return apiRequest<Holiday>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Holiday by ID
 * GET /emp-user-management/v1/holidays/{id}
 * 
 * @param id - Holiday ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Holiday>>
 */
export const apiGetHolidayById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Holiday>> => {
  return apiRequest<Holiday>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Holiday
 * PATCH /emp-user-management/v1/holidays/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Holiday ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Holiday>>
 */
export const apiUpdateHoliday = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Holiday>> => {
  return apiRequest<Holiday>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Holidays with Pagination
 * POST /emp-user-management/v1/holidays/search?page={page}&size={size}
 * 
 * @param searchRequest - UniversalSearchRequest for filtering
 * @param page - Page number (0-based)
 * @param pageSize - Number of items per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Holiday>>>
 */
export const apiSearchHolidays = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Holiday>>> => {
  return apiRequest<Pagination<Holiday>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Holiday by ID
 * DELETE /emp-user-management/v1/holidays/{id}
 * 
 * @param id - Holiday ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteHolidayById = async (
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
 * Bulk Delete Holidays
 * DELETE /emp-user-management/v1/holidays/bulk-delete
 * 
 * @param ids - Array of holiday IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteHolidays = async (
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
 * Bulk Update Holidays
 * PATCH /emp-user-management/v1/holidays/bulk-update
 * 
 * Bulk update multiple holidays with the same fields
 * 
 * @param ids - Array of holiday IDs to update
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkUpdateHolidays = async (
  ids: string[],
  updates: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: { ids, updates },
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const holidayService = {
  apiCreateHoliday,
  apiGetHolidayById,
  apiUpdateHoliday,
  apiSearchHolidays,
  apiDeleteHolidayById,
  apiBulkDeleteHolidays,
  apiBulkUpdateHolidays,
};
