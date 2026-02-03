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

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";

const BASE_ENDPOINT = "/emp-user-management/v1/job-details";

/**
 * Job Details Item
 * Professional and employment information
 */
export interface JobDetailsItem {
  id?: string;
  designation: string;
  employeeType: "PERMANENT" | "CONTRACT" | "TEMPORARY" | "INTERN";
  workLocation: string;
  reportingManager: string;
  joiningDate: string;
  shift: string;
  department?: string;
  dateOfBirth?: string;
  probationPeriod?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Job Details
 * POST /emp-user-management/v1/job-details
 * 
 * @param item - JobDetailsItem with employment information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<JobDetailsItem>>
 */
export const apiCreateJobDetails = async (
  item: JobDetailsItem,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetailsItem>> => {
  return apiRequest<JobDetailsItem>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: item,
  });
};

/**
 * Get Job Details by ID
 * GET /emp-user-management/v1/job-details/{id}
 * 
 * @param id - Job details ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<JobDetailsItem>>
 */
export const apiGetJobDetailsById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetailsItem>> => {
  return apiRequest<JobDetailsItem>({
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
 * @returns Promise<ApiResponse<JobDetailsItem>>
 */
export const apiUpdateJobDetails = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetailsItem>> => {
  return apiRequest<JobDetailsItem>({
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
