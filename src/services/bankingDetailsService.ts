/**
 * Banking Details Service
 * Handles all API operations for banking details management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/banking-details - Create banking details
 * - GET /emp-user-management/v1/banking-details/{id} - Get banking details by ID
 * - PATCH /emp-user-management/v1/banking-details/{id} - Update banking details
 * - POST /emp-user-management/v1/banking-details/search - Search banking details
 * - DELETE /emp-user-management/v1/banking-details/{id} - Delete banking details
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { BankingDetails, BankingDetailsCarrier } from "@/modules/user-management/types/onboarding.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/banking-details";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Banking Details
 * POST /emp-user-management/v1/banking-details
 * 
 * @param carrier - BankingDetailsCarrier with bank account information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BankingDetails>>
 */
export const apiCreateBankingDetails = async (
  carrier: BankingDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<BankingDetails>> => {
  return apiRequest<BankingDetails>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Banking Details by ID
 * GET /emp-user-management/v1/banking-details/{id}
 * 
 * @param id - Banking details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BankingDetails>>
 */
export const apiGetBankingDetailsById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<BankingDetails>> => {
  return apiRequest<BankingDetails>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Banking Details
 * PATCH /emp-user-management/v1/banking-details/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Banking details ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<BankingDetails>>
 */
export const apiUpdateBankingDetails = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<BankingDetails>> => {
  return apiRequest<BankingDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Banking Details
 * POST /emp-user-management/v1/banking-details/search
 * 
 * @param searchRequest - UniversalSearchRequest with filters
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<BankingDetails>>>
 */
export const apiSearchBankingDetails = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<BankingDetails>>> => {
  return apiRequest<Pagination<BankingDetails>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Banking Details
 * DELETE /emp-user-management/v1/banking-details/{id}
 * 
 * @param id - Banking details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteBankingDetails = async (
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
