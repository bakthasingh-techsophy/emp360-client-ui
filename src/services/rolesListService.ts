/**
 * Roles List Service
 * Handles all API operations for role management (RolesList collection)
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/roles-list - Create a new role
 * - GET /emp-user-management/v1/roles-list/{id} - Get a specific role
 * - PATCH /emp-user-management/v1/roles-list/{id} - Update a role
 * - POST /emp-user-management/v1/roles-list/search - Search roles (paginated)
 * - DELETE /emp-user-management/v1/roles-list/{id} - Delete a role
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  RoleModel,
  RoleModelCarrier,
  UpdatePayload,
} from "@/modules/role-management/types";

const BASE_ENDPOINT = "/emp-user-management/v1/roles-list";

/**
 * Create a New Role
 * POST /emp-user-management/v1/roles-list
 * 
 * @param carrier - RoleModelCarrier with role details
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<RoleModel>>
 */
export const apiCreateRole = async (
  carrier: RoleModelCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<RoleModel>> => {
  return apiRequest<RoleModel>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get a Specific Role by ID
 * GET /emp-user-management/v1/roles-list/{id}
 * 
 * @param id - Role ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<RoleModel>>
 */
export const apiGetRoleById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<RoleModel>> => {
  return apiRequest<RoleModel>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update a Role
 * PATCH /emp-user-management/v1/roles-list/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Role ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<RoleModel>>
 */
export const apiUpdateRole = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<RoleModel>> => {
  return apiRequest<RoleModel>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Roles
 * POST /emp-user-management/v1/roles-list/search
 * 
 * @param searchRequest - UniversalSearchRequest with filters
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<RoleModel>>>
 */
export const apiSearchRoles = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<RoleModel>>> => {
  return apiRequest<Pagination<RoleModel>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete a Role by ID
 * DELETE /emp-user-management/v1/roles-list/{id}
 * 
 * @param id - Role ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteRoleById = async (
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
