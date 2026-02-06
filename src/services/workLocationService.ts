/**
 * Work Location Service
 * Handles API operations for work location management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/work-locations - Create a new work location
 * - GET /emp-user-management/v1/work-locations/{id} - Get work location by ID
 * - POST /emp-user-management/v1/work-locations/search - Search work locations
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { WorkLocation, WorkLocationCarrier } from "@/modules/user-management/types/settings.types";

const BASE_ENDPOINT = "/emp-user-management/v1/work-locations";

/**
 * Create Work Location
 * POST /emp-user-management/v1/work-locations
 * 
 * Creates a new work location in the system.
 * 
 * @param carrier - WorkLocationCarrier with id and description
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<WorkLocation>>
 * 
 * @example
 * const response = await apiCreateWorkLocation({
 *   id: 'LOC_NY',
 *   location: 'New York Office',
 *   description: 'Headquarters - New York'
 * }, 'tenant-001');
 */
export const apiCreateWorkLocation = async (
  carrier: WorkLocationCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<WorkLocation>> => {
  return apiRequest<WorkLocation>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Work Location
 * GET /emp-user-management/v1/work-locations/{id}
 * 
 * Retrieves a specific work location by ID.
 * 
 * @param id - Work Location ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<WorkLocation>>
 * 
 * @example
 * const response = await apiGetWorkLocation('LOC_NY', 'tenant-001');
 */
export const apiGetWorkLocation = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<WorkLocation>> => {
  return apiRequest<WorkLocation>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Search Work Locations
 * POST /emp-user-management/v1/work-locations/search
 *
 * Performs a universal search across work locations with pagination.
 * Returns: ApiResponse<Pagination<WorkLocation>>
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<WorkLocation>>>
 * 
 * @example
 * const response = await apiSearchWorkLocations(
 *   { filters: { and: { description: "New York" } } },
 *   0,
 *   10,
 *   'tenant-001'
 * );
 */
export const apiSearchWorkLocations = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<WorkLocation>>> => {
  return apiRequest<Pagination<WorkLocation>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const workLocationService = {
  apiCreateWorkLocation,
  apiGetWorkLocation,
  apiSearchWorkLocations,
};
