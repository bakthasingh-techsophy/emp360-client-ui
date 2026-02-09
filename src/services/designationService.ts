/**
 * Designation Service
 * Handles API operations for designation management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/designations - Create a new designation
 * - GET /emp-user-management/v1/designations/{id} - Get designation by ID
 * - POST /emp-user-management/v1/designations/search - Search designations
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { Designation, DesignationCarrier } from "@/modules/user-management/types/settings.types";

const BASE_ENDPOINT = "/emp-user-management/v1/designations";

/**
 * Create Designation
 * POST /emp-user-management/v1/designations
 * 
 * Creates a new designation in the system.
 * 
 * @param carrier - DesignationCarrier with id and description
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Designation>>
 * 
 * @example
 * const response = await apiCreateDesignation({
 *   id: 'SW_ENG',
 *   designation: 'Software Engineer',
 *   description: 'Senior Software Engineer'
 * }, 'tenant-001');
 */
export const apiCreateDesignation = async (
  carrier: DesignationCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Designation>> => {
  return apiRequest<Designation>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Designation
 * GET /emp-user-management/v1/designations/{id}
 * 
 * Retrieves a specific designation by ID.
 * 
 * @param id - Designation ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Designation>>
 * 
 * @example
 * const response = await apiGetDesignation('SW_ENG', 'tenant-001');
 */
export const apiGetDesignation = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Designation>> => {
  return apiRequest<Designation>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Search Designations
 * POST /emp-user-management/v1/designations/search
 *
 * Performs a universal search across designations with pagination.
 * Returns: ApiResponse<Pagination<Designation>>
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Designation>>>
 * 
 * @example
 * const response = await apiSearchDesignations(
 *   { filters: { and: { description: "Engineer" } } },
 *   0,
 *   10,
 *   'tenant-001'
 * );
 */
export const apiSearchDesignations = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Designation>>> => {
  return apiRequest<Pagination<Designation>>({
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
export const designationService = {
  apiCreateDesignation,
  apiGetDesignation,
  apiSearchDesignations,
};
