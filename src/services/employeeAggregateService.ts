/**
 * Employee Aggregate Service
 * Handles all API operations for employee aggregate management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/employee-aggregate - Create employee aggregate
 * - GET /emp-user-management/v1/employee-aggregate/{employeeId} - Get employee aggregate
 * - PATCH /emp-user-management/v1/employee-aggregate/{employeeId} - Update employee aggregate
 * - DELETE /emp-user-management/v1/employee-aggregate/{employeeId} - Delete employee aggregate
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";

const BASE_ENDPOINT = "/emp-user-management/v1/employee-aggregate";

/**
 * Employee Aggregate Payload
 * Data structure for creating/updating employee aggregate
 */
export interface EmployeeAggregatePayload {
  employeeId: string;
  bankingDetailsIds?: string[];
  documentIds?: string[];
  employmentHistoryIds?: string[];
  eventHistoryIds?: string[];
  skillIds?: string[];
}

/**
 * Employee Aggregate Response
 * Complete employee aggregate data
 */
export interface EmployeeAggregate extends EmployeeAggregatePayload {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Bulk Operation Response Interface
 */
export interface BulkOperationResponse {
  affected: number;
}

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Employee Aggregate
 * POST /emp-user-management/v1/employee-aggregate
 * 
 * Creates a new employee aggregate linking all related employee data
 * 
 * @param payload - EmployeeAggregatePayload with aggregate data
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmployeeAggregate>>
 */
export const apiCreateEmployeeAggregate = async (
  payload: EmployeeAggregatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmployeeAggregate>> => {
  return apiRequest<EmployeeAggregate>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Get Employee Aggregate by Employee ID
 * GET /emp-user-management/v1/employee-aggregate/{employeeId}
 * 
 * Retrieves the complete aggregate for an employee
 * 
 * @param employeeId - Employee ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmployeeAggregate>>
 */
export const apiGetEmployeeAggregate = async (
  employeeId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmployeeAggregate>> => {
  return apiRequest<EmployeeAggregate>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Employee Aggregate
 * PATCH /emp-user-management/v1/employee-aggregate/{employeeId}
 * 
 * Partially updates employee aggregate - only provided fields are updated
 * 
 * @param employeeId - Employee ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmployeeAggregate>>
 */
export const apiUpdateEmployeeAggregate = async (
  employeeId: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmployeeAggregate>> => {
  return apiRequest<EmployeeAggregate>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Employee Aggregate
 * DELETE /emp-user-management/v1/employee-aggregate/{employeeId}
 * 
 * Deletes the employee aggregate record
 * 
 * @param employeeId - Employee ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteEmployeeAggregate = async (
  employeeId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const employeeAggregateService = {
  apiCreateEmployeeAggregate,
  apiGetEmployeeAggregate,
  apiUpdateEmployeeAggregate,
  apiDeleteEmployeeAggregate,
};
