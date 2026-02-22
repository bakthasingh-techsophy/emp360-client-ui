/**
 * Template Column Service
 * Handles API operations for template column management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/template-columns - Create a new template column
 * - GET /emp-user-management/v1/template-columns/{id} - Get column by ID
 * - PUT /emp-user-management/v1/template-columns/{id} - Update column
 * - DELETE /emp-user-management/v1/template-columns/{id} - Delete column
 * - POST /emp-user-management/v1/template-columns/search - Search columns
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import { Pagination } from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { TemplateColumn, TemplateColumnCarrier } from "@/modules/performance/types";

const BASE_ENDPOINT = "/emp-user-management/v1/template-columns";

/**
 * Create Template Column
 * POST /emp-user-management/v1/template-columns
 * 
 * Creates a new template column in the system.
 * 
 * @param carrier - TemplateColumnCarrier with name, type, mandatory, and other properties
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateColumn>>
 * 
 * @example
 * const response = await apiCreateTemplateColumn({
 *   name: 'Technical Skills',
 *   type: 'RATING',
 *   mandatory: true,
 *   ratingRange: { min: 1, max: 5 },
 *   displayOrder: 1
 * }, 'tenant-001');
 */
export const apiCreateTemplateColumn = async (
  carrier: TemplateColumnCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateColumn>> => {
  return apiRequest<TemplateColumn>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Template Column
 * GET /emp-user-management/v1/template-columns/{id}
 * 
 * Retrieves a specific template column by ID.
 * 
 * @param id - Template Column ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateColumn>>
 * 
 * @example
 * const response = await apiGetTemplateColumn('COLUMN-123', 'tenant-001');
 */
export const apiGetTemplateColumn = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateColumn>> => {
  return apiRequest<TemplateColumn>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Template Column
 * PUT /emp-user-management/v1/template-columns/{id}
 * 
 * Updates an existing template column.
 * 
 * @param id - Template Column ID
 * @param carrier - TemplateColumnCarrier with updated fields
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateColumn>>
 * 
 * @example
 * const response = await apiUpdateTemplateColumn('COLUMN-123', {
 *   name: 'Updated Technical Skills'
 * }, 'tenant-001');
 */
export const apiUpdateTemplateColumn = async (
  id: string,
  carrier: Partial<TemplateColumnCarrier>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateColumn>> => {
  return apiRequest<TemplateColumn>({
    method: "PUT",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Delete Template Column
 * DELETE /emp-user-management/v1/template-columns/{id}
 * 
 * Deletes a template column from the system.
 * 
 * @param id - Template Column ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteTemplateColumn('COLUMN-123', 'tenant-001');
 */
export const apiDeleteTemplateColumn = async (
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
 * Search Template Columns
 * POST /emp-user-management/v1/template-columns/search
 *
 * Performs a universal search across template columns with pagination.
 * Returns: ApiResponse<Pagination<TemplateColumn>>
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<TemplateColumn>>>
 * 
 * @example
 * const response = await apiSearchTemplateColumns(
 *   { searchText: 'Technical', searchFields: ['name'] },
 *   0,
 *   20,
 *   'tenant-001'
 * );
 */
export const apiSearchTemplateColumns = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<TemplateColumn>>> => {
  return apiRequest<Pagination<TemplateColumn>>({
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
export const templateColumnService = {
  apiCreateTemplateColumn,
  apiGetTemplateColumn,
  apiUpdateTemplateColumn,
  apiDeleteTemplateColumn,
  apiSearchTemplateColumns,
};
