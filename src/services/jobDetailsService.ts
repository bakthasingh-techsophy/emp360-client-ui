/**
 * Job Details Service
 * Handles all API operations for job details management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/job-details - Create job details
 * - GET /emp-user-management/v1/job-details/{id} - Get job details by ID
 * - PATCH /emp-user-management/v1/job-details/{id} - Update job details
 * - DELETE /emp-user-management/v1/job-details/{id} - Delete job details
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { JobDetails, JobDetailsCarrier } from "@/modules/user-management/types/onboarding.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";

const BASE_ENDPOINT = "/emp-user-management/v1/job-details";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Job Details
 * POST /emp-user-management/v1/job-details
 * 
 * @param carrier - JobDetailsCarrier with employment information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<JobDetails>>
 */
export const apiCreateJobDetails = async (
  carrier: JobDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetails>> => {
  return apiRequest<JobDetails>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Job Details by ID
 * GET /emp-user-management/v1/job-details/{id}
 * 
 * @param id - Job details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<JobDetails>>
 */
export const apiGetJobDetailsById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetails>> => {
  return apiRequest<JobDetails>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Job Details
 * PATCH /emp-user-management/v1/job-details/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Job details ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<JobDetails>>
 */
export const apiUpdateJobDetails = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetails>> => {
  return apiRequest<JobDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Job Details
 * DELETE /emp-user-management/v1/job-details/{id}
 * 
 * @param id - Job details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteJobDetails = async (
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
export const jobDetailsService = {
  apiCreateJobDetails,
  apiGetJobDetailsById,
  apiUpdateJobDetails,
  apiDeleteJobDetails,
};
