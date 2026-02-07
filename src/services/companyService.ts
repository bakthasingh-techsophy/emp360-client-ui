/**
 * Company Service
 * Handles all API operations for company management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/companies/search - Search companies with filters
 * - GET /emp-user-management/v1/companies/{id} - Get company by ID
 * - POST /emp-user-management/v1/companies - Create new company
 * - PATCH /emp-user-management/v1/companies/{id} - Update company
 * - DELETE /emp-user-management/v1/companies/{id} - Delete company
 * - DELETE /emp-user-management/v1/companies/bulk-delete - Bulk delete companies
 * - PATCH /emp-user-management/v1/companies/bulk-update - Bulk update companies
 * - GET /emp-user-management/v1/companies/my-access - Get user's accessible companies
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import UniversalSearchRequest from "@/types/search";
import Pagination from "@/types/pagination";
import { CompanyModel, CompanyCarrier } from "@/types/company";

const BASE_ENDPOINT = "/emp-user-management/v1/companies";

/**
 * Search Companies
 * POST /emp-user-management/v1/companies/search
 * 
 * Performs a universal search across companies with pagination.
 * Returns: ApiResponse<Pagination<CompanyModel>>
 * 
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<CompanyModel>>>
 * 
 * @example
 * const response = await apiSearchCompanies(
 *   { filters: { and: { name: "Acme" } } },
 *   0,
 *   10,
 *   'tenant-001'
 * );
 */
export const apiSearchCompanies = async (
  searchRequest: UniversalSearchRequest = {},
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<CompanyModel>>> => {
  return apiRequest<Pagination<CompanyModel>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Get Company
 * GET /emp-user-management/v1/companies/{id}
 * 
 * Retrieves a specific company by ID.
 * 
 * @param id - Company ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<CompanyModel>>
 * 
 * @example
 * const response = await apiGetCompanyById('COMP001', 'tenant-001');
 */
export const apiGetCompanyById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<CompanyModel>> => {
  return apiRequest<CompanyModel>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Create Company
 * POST /emp-user-management/v1/companies
 * 
 * Creates a new company in the system.
 * 
 * @param carrier - CompanyCarrier with company information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<CompanyModel>>
 * 
 * @example
 * const response = await apiCreateCompany({
 *   name: 'Acme Corp',
 *   code: 'ACME',
 *   createdAt: new Date().toISOString()
 * }, 'tenant-001');
 */
export const apiCreateCompany = async (
  carrier: CompanyCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<CompanyModel>> => {
  return apiRequest<CompanyModel>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Update Company
 * PATCH /emp-user-management/v1/companies/{id}
 * 
 * Partially updates a company - only provided fields are updated.
 * 
 * @param id - Company ID
 * @param updates - Partial updates to company fields
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<CompanyModel>>
 * 
 * @example
 * const response = await apiPatchCompany('COMP001', {
 *   name: 'New Name',
 *   description: 'Updated description'
 * }, 'tenant-001');
 */
export const apiPatchCompany = async (
  id: string,
  updates: Partial<CompanyModel>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<CompanyModel>> => {
  return apiRequest<CompanyModel>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: updates,
  });
};

/**
 * Delete Company
 * DELETE /emp-user-management/v1/companies/{id}
 * 
 * Deletes a company by ID.
 * 
 * @param id - Company ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteCompany('COMP001', 'tenant-001');
 */
export const apiDeleteCompany = async (
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
 * Bulk Delete Companies
 * DELETE /emp-user-management/v1/companies/bulk-delete
 * 
 * Deletes multiple companies by their IDs.
 * 
 * @param ids - Array of company IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiBulkDeleteCompanies(['COMP001', 'COMP002'], 'tenant-001');
 */
export const apiBulkDeleteCompanies = async (
  ids: string[],
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/bulk-delete`,
    tenant,
    accessToken,
    body: ids,
  });
};

/**
 * Bulk update payload
 */
export interface BulkUpdatePayload {
  ids: string[];
  updates: Partial<CompanyModel>;
}

/**
 * Bulk Update Companies
 * PATCH /emp-user-management/v1/companies/bulk-update
 * 
 * Updates multiple companies with the same field values.
 * 
 * @param payload - BulkUpdatePayload with IDs and updates
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<CompanyModel[]>>
 * 
 * @example
 * const response = await apiBulkUpdateCompanies({
 *   ids: ['COMP001', 'COMP002'],
 *   updates: { isActive: false }
 * }, 'tenant-001');
 */
export const apiBulkUpdateCompanies = async (
  payload: BulkUpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<CompanyModel[]>> => {
  return apiRequest<CompanyModel[]>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Get User Companies
 * GET /emp-user-management/v1/companies/my-access
 * 
 * Retrieves companies that the current user has access to (based on permissions).
 * 
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<CompanyModel[]>>
 * 
 * @example
 * const response = await apiGetUserCompanies('tenant-001', 'access-token');
 */
export const apiGetUserCompanies = async (
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<CompanyModel[]>> => {
  return apiRequest<CompanyModel[]>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/my-access`,
    tenant,
    accessToken,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const companyService = {
  apiSearchCompanies,
  apiGetCompanyById,
  apiCreateCompany,
  apiPatchCompany,
  apiDeleteCompany,
  apiBulkDeleteCompanies,
  apiBulkUpdateCompanies,
  apiGetUserCompanies,
};
