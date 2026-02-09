/**
 * Visitor Management Service
 * Handles all API operations for visitor management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/visitors - Create visitor
 * - GET /emp-user-management/v1/visitors/{id} - Get visitor by ID
 * - PATCH /emp-user-management/v1/visitors/{id} - Update visitor
 * - POST /emp-user-management/v1/visitors/search - Search visitors
 * - DELETE /emp-user-management/v1/visitors/{id} - Delete visitor
 * - DELETE /emp-user-management/v1/visitors/bulk-delete - Bulk delete visitors
 * - PATCH /emp-user-management/v1/visitors/bulk-update - Bulk update visitors
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { Visitor, VisitorCarrier } from "@/modules/visitor-management/types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/visitors";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Bulk update request payload
 */
export interface BulkUpdatePayload {
  ids: string[];
  updates: UpdatePayload;
}

/**
 * Create Visitor
 * POST /emp-user-management/v1/visitors
 * 
 * @param carrier - VisitorCarrier with visitor information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Visitor>>
 */
export const apiCreateVisitor = async (
  carrier: VisitorCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Visitor>> => {
  return apiRequest<Visitor>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Visitor by ID
 * GET /emp-user-management/v1/visitors/{id}
 * 
 * @param id - Visitor ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Visitor>>
 */
export const apiGetVisitorById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Visitor>> => {
  return apiRequest<Visitor>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Visitor
 * PATCH /emp-user-management/v1/visitors/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Visitor ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Visitor>>
 */
export const apiUpdateVisitor = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Visitor>> => {
  return apiRequest<Visitor>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Visitors
 * POST /emp-user-management/v1/visitors/search
 * 
 * @param searchRequest - Universal search criteria object
 * @param tenant - Tenant ID
 * @param page - Page number (0-based)
 * @param pageSize - Number of items per page
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Visitor>>>
 */
export const apiSearchVisitors = async (
  searchRequest: UniversalSearchRequest,
  tenant: string,
  page: number = 0,
  pageSize: number = 10,
  accessToken?: string
): Promise<ApiResponse<Pagination<Visitor>>> => {
  return apiRequest<Pagination<Visitor>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Visitor by ID
 * DELETE /emp-user-management/v1/visitors/{id}
 * 
 * @param id - Visitor ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteVisitorById = async (
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
 * Bulk Delete Visitors
 * DELETE /emp-user-management/v1/visitors/bulk-delete
 * 
 * @param ids - Array of visitor IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteVisitors = async (
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
 * Bulk Update Visitors
 * PATCH /emp-user-management/v1/visitors/bulk-update
 * 
 * @param ids - Array of visitor IDs to update
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkUpdateVisitors = async (
  ids: string[],
  updates: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  const payload: BulkUpdatePayload = { ids, updates };
  
  return apiRequest<void>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: payload,
  });
};
