/**
 * Leave Settings Service
 * Handles all API operations for leave settings management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/leave-settings/assign-employees - Assign leave types to employees
 * - POST /emp-user-management/v1/leave-settings/copy-configuration - Copy leave configuration to companies
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { ApiResponse } from "@/types/responses";
import { apiRequest } from "./utils";

const BASE_ENDPOINT = "/emp-user-management/v1/leave-settings";

/**
 * Request body for assigning leave types to employees
 */
export interface AssignEmployeesRequest {
  leaveConfigurationId: string;
  employeeIds: string[];
}

/**
 * Request body for copying leave configuration to companies
 */
export interface CopyConfigurationRequest {
  leaveConfigurationId: string;
  companyIds: string[];
}

/**
 * Response for assign employees operation
 */
export interface AssignEmployeesResponse {
  success: boolean;
  message: string;
  leaveConfigurationId: string;
  assignedEmployeeCount: number;
}

/**
 * Response for copy configuration operation
 */
export interface CopyConfigurationResponse {
  success: boolean;
  message: string;
  sourceConfigurationId: string;
  copiedConfigurationIds: string[];
  copiedCount: number;
}

/**
 * Assign Leave Types to Employees
 * POST /emp-user-management/v1/leave-settings/assign-employees
 * 
 * Assigns a leave configuration to specific employees.
 * 
 * @param request - AssignEmployeesRequest with leave configuration ID and employee IDs
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<AssignEmployeesResponse>>
 * 
 * @example
 * const response = await apiAssignLeaveTypesToEmployees(
 *   {
 *     leaveConfigurationId: 'config-001',
 *     employeeIds: ['emp-001', 'emp-002', 'emp-003']
 *   },
 *   'tenant-001'
 * );
 */
export const apiAssignLeaveTypesToEmployees = async (
  request: AssignEmployeesRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<AssignEmployeesResponse>> => {
  return apiRequest<AssignEmployeesResponse>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/assign-employees`,
    tenant,
    accessToken,
    body: request,
  });
};

/**
 * Copy Leave Configuration to Companies
 * POST /emp-user-management/v1/leave-settings/copy-configuration
 * 
 * Copies a leave configuration to one or more companies.
 * Creates new leave configurations based on the source configuration.
 * 
 * @param request - CopyConfigurationRequest with leave configuration ID and company IDs
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<CopyConfigurationResponse>>
 * 
 * @example
 * const response = await apiCopyLeaveConfigurationToCompanies(
 *   {
 *     leaveConfigurationId: 'config-001',
 *     companyIds: ['company-001', 'company-002', 'company-003']
 *   },
 *   'tenant-001'
 * );
 */
export const apiCopyLeaveConfigurationToCompanies = async (
  request: CopyConfigurationRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<CopyConfigurationResponse>> => {
  return apiRequest<CopyConfigurationResponse>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/copy-configuration`,
    tenant,
    accessToken,
    body: request,
  });
};
