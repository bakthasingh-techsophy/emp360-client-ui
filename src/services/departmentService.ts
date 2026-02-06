/**
 * Department Service
 * Handles API operations for department management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/departments - Create a new department
 * - GET /emp-user-management/v1/departments/{id} - Get department by ID
 * - POST /emp-user-management/v1/departments/search - Search departments
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { Department, DepartmentCarrier } from "@/modules/user-management/types/settings.types";

const BASE_ENDPOINT = "/emp-user-management/v1/departments";

/**
 * Create Department
 * POST /emp-user-management/v1/departments
 * 
 * Creates a new department in the system.
 * 
 * @param carrier - DepartmentCarrier with id and description
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Department>>
 * 
 * @example
 * const response = await apiCreateDepartment({
 *   id: 'DEPT_ENG',
 *   department: 'Engineering',
 *   description: 'Engineering Department'
 * }, 'tenant-001');
 */
export const apiCreateDepartment = async (
  carrier: DepartmentCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Department>> => {
  return apiRequest<Department>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Department
 * GET /emp-user-management/v1/departments/{id}
 * 
 * Retrieves a specific department by ID.
 * 
 * @param id - Department ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Department>>
 * 
 * @example
 * const response = await apiGetDepartment('DEPT_ENG', 'tenant-001');
 */
export const apiGetDepartment = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Department>> => {
  return apiRequest<Department>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Search Departments
 * POST /emp-user-management/v1/departments/search
 *
 * Performs a universal search across departments with pagination.
 * Returns: ApiResponse<Pagination<Department>>
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Department>>>
 * 
 * @example
 * const response = await apiSearchDepartments(
 *   { filters: { and: { description: "Engineering" } } },
 *   0,
 *   10,
 *   'tenant-001'
 * );
 */
export const apiSearchDepartments = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Department>>> => {
  return apiRequest<Pagination<Department>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const departmentService = {
  apiCreateDepartment,
  apiGetDepartment,
  apiSearchDepartments,
};
