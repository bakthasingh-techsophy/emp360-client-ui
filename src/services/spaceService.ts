/**
 * Space Service
 * Handles all API operations for space management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/spaces - Create space
 * - GET /emp-user-management/v1/spaces/{id} - Get space by ID
 * - PATCH /emp-user-management/v1/spaces/{id} - Update space
 * - POST /emp-user-management/v1/spaces/search - Search spaces
 * - DELETE /emp-user-management/v1/spaces/{id} - Delete space
 * - DELETE /emp-user-management/v1/spaces/bulk-delete - Bulk delete spaces
 * - PATCH /emp-user-management/v1/spaces/bulk-update - Bulk update spaces
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { Space } from "@/modules/space-management/spaceTypes";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/spaces";

/**
 * Space Carrier - Input type for creation
 */
export interface SpaceCarrier {
  id: string;
  spaceName: string;
  address: string;
  description?: string;
  ownerId: string;
  ownerCompany: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Update payload - Map of field names to values
 */
export type SpaceUpdatePayload = Record<string, any>;

/**
 * Create Space
 * POST /emp-user-management/v1/spaces
 * 
 * @param carrier - SpaceCarrier with space information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Space>>
 */
export const apiCreateSpace = async (
  carrier: SpaceCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Space>> => {
  return apiRequest<Space>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Space by ID
 * GET /emp-user-management/v1/spaces/{id}
 * 
 * @param id - Space ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Space>>
 */
export const apiGetSpaceById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Space>> => {
  return apiRequest<Space>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Space
 * PATCH /emp-user-management/v1/spaces/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Space ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Space>>
 */
export const apiUpdateSpace = async (
  id: string,
  payload: SpaceUpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Space>> => {
  return apiRequest<Space>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Spaces with pagination
 * POST /emp-user-management/v1/spaces/search
 * 
 * @param searchRequest - Search criteria and filters
 * @param page - Page number (0-based)
 * @param pageSize - Number of items per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Space>>>
 */
export const apiSearchSpaces = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Space>>> => {
  return apiRequest<Pagination<Space>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Space
 * DELETE /emp-user-management/v1/spaces/{id}
 * 
 * @param id - Space ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteSpace = async (
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
 * Bulk Delete Spaces
 * DELETE /emp-user-management/v1/spaces/bulk-delete
 * 
 * @param ids - Array of space IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteSpaces = async (
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
 * Bulk Update Spaces
 * PATCH /emp-user-management/v1/spaces/bulk-update
 * 
 * @param ids - Array of space IDs to update
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkUpdateSpaces = async (
  ids: string[],
  updates: SpaceUpdatePayload,
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
export const spaceService = {
  apiCreateSpace,
  apiGetSpaceById,
  apiUpdateSpace,
  apiSearchSpaces,
  apiDeleteSpace,
  apiBulkDeleteSpaces,
  apiBulkUpdateSpaces,
};
