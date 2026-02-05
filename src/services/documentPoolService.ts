/**
 * Document Pool Service
 * Handles all API operations for document management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/documents - Create document
 * - GET /emp-user-management/v1/documents/{id} - Get document by ID
 * - PATCH /emp-user-management/v1/documents/{id} - Update document
 * - POST /emp-user-management/v1/documents/search - Search documents
 * - DELETE /emp-user-management/v1/documents/{id} - Delete document
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { DocumentItemCarrier } from "@/modules/user-management/types/onboarding.types";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/documents";

/**
 * Document Item
 * Represents a single document record
 */
export interface DocumentItem {
  id?: string;
  employeeId: string;
  name: string;
  type: "URL" | "FILE";
  url?: string;
  fileName?: string;
  uploadedDate: string;
  fileSize?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Document
 * POST /emp-user-management/v1/documents
 * 
 * @param carrier - DocumentItemCarrier with document information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<DocumentItem>>
 */
export const apiCreateDocument = async (
  carrier: DocumentItemCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<DocumentItem>> => {
  return apiRequest<DocumentItem>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Document by ID
 * GET /emp-user-management/v1/documents/{id}
 * 
 * @param id - Document ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<DocumentItem>>
 */
export const apiGetDocumentById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<DocumentItem>> => {
  return apiRequest<DocumentItem>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Document
 * PATCH /emp-user-management/v1/documents/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Document ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<DocumentItem>>
 */
export const apiUpdateDocument = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<DocumentItem>> => {
  return apiRequest<DocumentItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Document
 * DELETE /emp-user-management/v1/documents/{id}
 * 
 * @param id - Document ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteDocument = async (
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
 * Search Documents
 * POST /emp-user-management/v1/documents/search
 * 
 * Universal search with filtering, sorting, and pagination
 * 
 * @param searchRequest - Universal search request with filters
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<DocumentItem>>>
 */
export const apiSearchDocuments = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<DocumentItem>>> => {
  return apiRequest<Pagination<DocumentItem>>({
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
export const documentPoolService = {
  apiCreateDocument,
  apiGetDocumentById,
  apiUpdateDocument,
  apiDeleteDocument,
  apiSearchDocuments,
};
