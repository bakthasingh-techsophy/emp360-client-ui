/**
 * Resource Service
 * Handles all API operations for resource management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/resources - Create a new resource
 * - GET /emp-user-management/v1/resources/{id} - Get a specific resource
 * - PATCH /emp-user-management/v1/resources/{id} - Update a resource
 * - POST /emp-user-management/v1/resources/search - Search resources (paginated)
 * - DELETE /emp-user-management/v1/resources/{id} - Delete a resource
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  Resource,
  ResourceCarrier,
  UpdatePayload,
} from "@/modules/role-management/types";

const BASE_ENDPOINT = "/emp-user-management/v1/resources";

/**
 * Create a New Resource
 * POST /emp-user-management/v1/resources
 * 
 * @param carrier - ResourceCarrier with resource details
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Resource>>
 */
export const apiCreateResource = async (
  carrier: ResourceCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Resource>> => {
  return apiRequest<Resource>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get a Specific Resource by ID
 * GET /emp-user-management/v1/resources/{id}
 * 
 * @param id - Resource ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Resource>>
 */
export const apiGetResourceById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Resource>> => {
  return apiRequest<Resource>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update a Resource
 * PATCH /emp-user-management/v1/resources/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Resource ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Resource>>
 */
export const apiUpdateResource = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Resource>> => {
  return apiRequest<Resource>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Resources
 * POST /emp-user-management/v1/resources/search
 * 
 * @param searchRequest - UniversalSearchRequest with filters
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Resource>>>
 */
export const apiSearchResources = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Resource>>> => {
  return apiRequest<Pagination<Resource>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete a Resource by ID
 * DELETE /emp-user-management/v1/resources/{id}
 * 
 * @param id - Resource ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteResourceById = async (
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
