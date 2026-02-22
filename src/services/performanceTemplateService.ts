/**
 * Performance Template Service
 * Handles API operations for performance template management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/performance-templates - Create a new performance template
 * - GET /emp-user-management/v1/performance-templates/{id} - Get template by ID
 * - PUT /emp-user-management/v1/performance-templates/{id} - Update template
 * - DELETE /emp-user-management/v1/performance-templates/{id} - Delete template
 * - POST /emp-user-management/v1/performance-templates/search - Search templates
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import { Pagination } from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { PerformanceTemplate, PerformanceTemplateCarrier } from "@/modules/performance/types";

const BASE_ENDPOINT = "/emp-user-management/v1/performance-templates";

/**
 * Create Performance Template
 * POST /emp-user-management/v1/performance-templates
 * 
 * Creates a new performance template in the system.
 * 
 * @param carrier - PerformanceTemplateCarrier with title, description, and department
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<PerformanceTemplate>>
 * 
 * @example
 * const response = await apiCreatePerformanceTemplate({
 *   title: 'Annual Performance Review',
 *   description: 'Standard template for annual reviews',
 *   department: 'DEPT_ENG'
 * }, 'tenant-001');
 */
export const apiCreatePerformanceTemplate = async (
  carrier: PerformanceTemplateCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<PerformanceTemplate>> => {
  return apiRequest<PerformanceTemplate>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Performance Template
 * GET /emp-user-management/v1/performance-templates/{id}
 * 
 * Retrieves a specific performance template by ID.
 * 
 * @param id - Performance Template ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<PerformanceTemplate>>
 * 
 * @example
 * const response = await apiGetPerformanceTemplate('TEMPLATE-123', 'tenant-001');
 */
export const apiGetPerformanceTemplate = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<PerformanceTemplate>> => {
  return apiRequest<PerformanceTemplate>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Performance Template
 * PUT /emp-user-management/v1/performance-templates/{id}
 * 
 * Updates an existing performance template.
 * 
 * @param id - Performance Template ID
 * @param carrier - PerformanceTemplateCarrier with updated fields
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<PerformanceTemplate>>
 * 
 * @example
 * const response = await apiUpdatePerformanceTemplate('TEMPLATE-123', {
 *   title: 'Updated Title'
 * }, 'tenant-001');
 */
export const apiUpdatePerformanceTemplate = async (
  id: string,
  carrier: Partial<PerformanceTemplateCarrier>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<PerformanceTemplate>> => {
  return apiRequest<PerformanceTemplate>({
    method: "PUT",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Delete Performance Template
 * DELETE /emp-user-management/v1/performance-templates/{id}
 * 
 * Deletes a performance template from the system.
 * 
 * @param id - Performance Template ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeletePerformanceTemplate('TEMPLATE-123', 'tenant-001');
 */
export const apiDeletePerformanceTemplate = async (
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
 * Search Performance Templates
 * POST /emp-user-management/v1/performance-templates/search
 *
 * Performs a universal search across performance templates with pagination.
 * Returns: ApiResponse<Pagination<PerformanceTemplate>>
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<PerformanceTemplate>>>
 * 
 * @example
 * const response = await apiSearchPerformanceTemplates(
 *   { searchText: 'Annual', searchFields: ['title', 'description'] },
 *   0,
 *   20,
 *   'tenant-001'
 * );
 */
export const apiSearchPerformanceTemplates = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<PerformanceTemplate>>> => {
  return apiRequest<Pagination<PerformanceTemplate>>({
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
export const performanceTemplateService = {
  apiCreatePerformanceTemplate,
  apiGetPerformanceTemplate,
  apiUpdatePerformanceTemplate,
  apiDeletePerformanceTemplate,
  apiSearchPerformanceTemplates,
};
