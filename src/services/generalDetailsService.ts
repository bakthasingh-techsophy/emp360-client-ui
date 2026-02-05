/**
 * General Details Service
 * Handles all API operations for general details management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/general-details - Create general details
 * - GET /emp-user-management/v1/general-details/{id} - Get general details by ID
 * - PATCH /emp-user-management/v1/general-details/{id} - Update general details
 * - DELETE /emp-user-management/v1/general-details/{id} - Delete general details
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { GeneralDetails, GeneralDetailsCarrier } from "@/modules/user-management/types/onboarding.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";

const BASE_ENDPOINT = "/emp-user-management/v1/general-details";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create General Details
 * POST /emp-user-management/v1/general-details
 * 
 * @param carrier - GeneralDetailsCarrier with personal information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<GeneralDetails>>
 */
export const apiCreateGeneralDetails = async (
  carrier: GeneralDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<GeneralDetails>> => {
  return apiRequest<GeneralDetails>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get General Details by ID
 * GET /emp-user-management/v1/general-details/{id}
 * 
 * @param id - General details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<GeneralDetails>>
 */
export const apiGetGeneralDetailsById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<GeneralDetails>> => {
  return apiRequest<GeneralDetails>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update General Details
 * PATCH /emp-user-management/v1/general-details/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - General details ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<GeneralDetails>>
 */
export const apiUpdateGeneralDetails = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<GeneralDetails>> => {
  return apiRequest<GeneralDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete General Details
 * DELETE /emp-user-management/v1/general-details/{id}
 * 
 * @param id - General details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteGeneralDetails = async (
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
 * Export all service functions as default object for easier importing
 */
export const generalDetailsService = {
  apiCreateGeneralDetails,
  apiGetGeneralDetailsById,
  apiUpdateGeneralDetails,
  apiDeleteGeneralDetails,
};
