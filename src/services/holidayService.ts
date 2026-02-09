/**
 * Holiday Service
 * Handles all holiday-related API operations
 */

import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  Holiday,
  HolidayCarrier,
} from "@/modules/time-attendance/holiday-management/types";
import { apiRequest } from "./utils";

const BASE_PATH = "/emp-user-management/v1/holidays";

/**
 * Create a new holiday
 */
export const apiCreateHoliday = async (
  carrier: HolidayCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Holiday>> => {
  return apiRequest<Holiday>({
    method: "POST",
    endpoint: BASE_PATH,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get holiday by ID
 */
export const apiGetHolidayById = async (
  id: string,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Holiday>> => {
  return apiRequest<Holiday>({
    method: "GET",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update holiday
 */
export const apiUpdateHoliday = async (
  id: string,
  payload: Record<string, any>,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Holiday>> => {
  return apiRequest<Holiday>({
    method: "PATCH",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search holidays with pagination
 */
export const apiSearchHolidays = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Pagination<Holiday>>> => {
  return apiRequest<Pagination<Holiday>>({
    method: "POST",
    endpoint: `${BASE_PATH}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete holiday by ID
 */
export const apiDeleteHolidayById = async (
  id: string,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Bulk delete holidays by IDs
 */
export const apiBulkDeleteHolidays = async (
  ids: string[],
  tenant: string,
  accessToken: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_PATH}/bulk-delete`,
    tenant,
    accessToken,
    body: ids,
  });
};

/**
 * Bulk update holidays
 */
export const apiBulkUpdateHolidays = async (
  ids: string[],
  updates: Record<string, any>,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "PATCH",
    endpoint: `${BASE_PATH}/bulk-update`,
    tenant,
    accessToken,
    body: { ids, updates },
  });
};
