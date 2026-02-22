/**
 * Template Row Service
 * Handles API operations for template row management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/template-rows - Create a new template row
 * - GET /emp-user-management/v1/template-rows/{id} - Get row by ID
 * - PUT /emp-user-management/v1/template-rows/{id} - Update row
 * - DELETE /emp-user-management/v1/template-rows/{id} - Delete row
 * - POST /emp-user-management/v1/template-rows/search - Search rows
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import { Pagination } from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { TemplateRow, TemplateRowCarrier } from "@/modules/performance/types";

const BASE_ENDPOINT = "/emp-user-management/v1/template-rows";

/**
 * Create Template Row
 * POST /emp-user-management/v1/template-rows
 * 
 * Creates a new template row in the system.
 * 
 * @param carrier - TemplateRowCarrier with label, weightage, and displayOrder
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateRow>>
 * 
 * @example
 * const response = await apiCreateTemplateRow({
 *   label: 'Performance Metrics',
 *   weightage: 0.3,
 *   displayOrder: 1
 * }, 'tenant-001');
 */
export const apiCreateTemplateRow = async (
  carrier: TemplateRowCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateRow>> => {
  return apiRequest<TemplateRow>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Template Row
 * GET /emp-user-management/v1/template-rows/{id}
 * 
 * Retrieves a specific template row by ID.
 * 
 * @param id - Template Row ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateRow>>
 * 
 * @example
 * const response = await apiGetTemplateRow('ROW-123', 'tenant-001');
 */
export const apiGetTemplateRow = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateRow>> => {
  return apiRequest<TemplateRow>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Template Row
 * PUT /emp-user-management/v1/template-rows/{id}
 * 
 * Updates an existing template row.
 * 
 * @param id - Template Row ID
 * @param carrier - TemplateRowCarrier with updated fields
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateRow>>
 * 
 * @example
 * const response = await apiUpdateTemplateRow('ROW-123', {
 *   label: 'Updated Performance Metrics',
 *   weightage: 0.35
 * }, 'tenant-001');
 */
export const apiUpdateTemplateRow = async (
  id: string,
  carrier: Partial<TemplateRowCarrier>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateRow>> => {
  return apiRequest<TemplateRow>({
    method: "PUT",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Delete Template Row
 * DELETE /emp-user-management/v1/template-rows/{id}
 * 
 * Deletes a template row from the system.
 * 
 * @param id - Template Row ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteTemplateRow('ROW-123', 'tenant-001');
 */
export const apiDeleteTemplateRow = async (
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
 * Search Template Rows
 * POST /emp-user-management/v1/template-rows/search
 *
 * Performs a universal search across template rows with pagination.
 * Returns: ApiResponse<Pagination<TemplateRow>>
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<TemplateRow>>>
 * 
 * @example
 * const response = await apiSearchTemplateRows(
 *   { searchText: 'Performance', searchFields: ['label'] },
 *   0,
 *   20,
 *   'tenant-001'
 * );
 */
export const apiSearchTemplateRows = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<TemplateRow>>> => {
  return apiRequest<Pagination<TemplateRow>>({
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
export const templateRowService = {
  apiCreateTemplateRow,
  apiGetTemplateRow,
  apiUpdateTemplateRow,
  apiDeleteTemplateRow,
  apiSearchTemplateRows,
};
