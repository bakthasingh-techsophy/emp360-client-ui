/**
 * Member Reference Service
 * Handles all API operations for member reference management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/members - Create member reference
 * - GET /emp-user-management/v1/members/{id} - Get member by ID
 * - PATCH /emp-user-management/v1/members/{id} - Update member
 * - POST /emp-user-management/v1/members/search - Search members
 * - DELETE /emp-user-management/v1/members/{id} - Delete member
 * - DELETE /emp-user-management/v1/members/bulk-delete - Bulk delete members
 * - PATCH /emp-user-management/v1/members/bulk-update - Bulk update members
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { MemberReference } from "@/modules/space-management/spaceTypes";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/members";

/**
 * Member Reference Carrier - Input type for creation
 */
export interface MemberReferenceCarrier {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  contactInfo?: string;
  joinedDate: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Update payload - Map of field names to values
 */
export type MemberUpdatePayload = Record<string, any>;

/**
 * Create Member Reference
 * POST /emp-user-management/v1/members
 * 
 * @param carrier - MemberReferenceCarrier with member information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<MemberReference>>
 */
export const apiCreateMemberReference = async (
  carrier: MemberReferenceCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<MemberReference>> => {
  return apiRequest<MemberReference>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Member Reference by ID
 * GET /emp-user-management/v1/members/{id}
 * 
 * @param id - Member ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<MemberReference>>
 */
export const apiGetMemberReferenceById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<MemberReference>> => {
  return apiRequest<MemberReference>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Member Reference
 * PATCH /emp-user-management/v1/members/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Member ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<MemberReference>>
 */
export const apiUpdateMemberReference = async (
  id: string,
  payload: MemberUpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<MemberReference>> => {
  return apiRequest<MemberReference>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Member References with pagination
 * POST /emp-user-management/v1/members/search
 * 
 * @param searchRequest - Search criteria and filters
 * @param page - Page number (0-based)
 * @param pageSize - Number of items per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<MemberReference>>>
 */
export const apiSearchMemberReferences = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<MemberReference>>> => {
  return apiRequest<Pagination<MemberReference>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Member Reference
 * DELETE /emp-user-management/v1/members/{id}
 * 
 * @param id - Member ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteMemberReference = async (
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
 * Bulk Delete Member References
 * DELETE /emp-user-management/v1/members/bulk-delete
 * 
 * @param ids - Array of member IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteMemberReferences = async (
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
 * Bulk Update Member References
 * PATCH /emp-user-management/v1/members/bulk-update
 * 
 * @param ids - Array of member IDs to update
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkUpdateMemberReferences = async (
  ids: string[],
  updates: MemberUpdatePayload,
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
export const memberReferenceService = {
  apiCreateMemberReference,
  apiGetMemberReferenceById,
  apiUpdateMemberReference,
  apiSearchMemberReferences,
  apiDeleteMemberReference,
  apiBulkDeleteMemberReferences,
  apiBulkUpdateMemberReferences,
};
