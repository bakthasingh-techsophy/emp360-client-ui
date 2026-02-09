/**
 * Visitor Management Main Service
 * Handles all visitor-related API operations
 * 
 * API Endpoints:
 * - POST /visitors - Create visitor
 * - PATCH /visitors/:id - Update visitor
 * - DELETE /visitors/:id - Delete visitor
 * - POST /visitors/search - Search visitor snapshots (returns VisitorSnapshot[])
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { VisitorCarrier, VisitorSnapshot } from "@/modules/visitor-management/types";
import { resolveAuth } from "@/store/localStorage";

const BASE_URL = "/emp-user-management/v1/visitor-management";

/**
 * Get authentication credentials
 */
const getAuth = (): { tenant: string; accessToken: string } => {
  const auth = resolveAuth();
  if (!auth.tenant || !auth.accessToken) {
    throw new Error("Authentication credentials not found");
  }
  return {
    tenant: auth.tenant,
    accessToken: auth.accessToken,
  };
};

/**
 * Create Visitor
 * POST /visitors
 * 
 * Request body uses API field names:
 * - name, email, phone, companyId, photoUrl
 * - purpose, hostEmployeeId
 * - expectedArrivalDate (ISO UTC), expectedArrivalTime (12hr format)
 * - notes, status, createdAt
 */
export const createVisitor = async (
  visitorData: VisitorCarrier
): Promise<ApiResponse<VisitorSnapshot>> => {
  const { tenant, accessToken } = getAuth();
  return apiRequest<VisitorSnapshot>({
    method: "POST",
    endpoint: BASE_URL,
    tenant,
    accessToken,
    body: visitorData,
  });
};

/**
 * Update Visitor
 * PATCH /visitors/:id
 * 
 * Supports partial updates (any subset of visitor fields)
 */
export const updateVisitor = async (
  id: string,
  updates: Partial<VisitorCarrier>
): Promise<ApiResponse<VisitorSnapshot>> => {
  const { tenant, accessToken } = getAuth();
  return apiRequest<VisitorSnapshot>({
    method: "PATCH",
    endpoint: `${BASE_URL}/${id}`,
    tenant,
    accessToken,
    body: updates,
  });
};

/**
 * Delete Visitor
 * DELETE /visitors/:id
 */
export const deleteVisitor = async (
  id: string
): Promise<ApiResponse<void>> => {
  const { tenant, accessToken } = getAuth();
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_URL}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Search Visitor Snapshots
 * POST /visitors/search?page=0&size=20
 * 
 * Returns VisitorSnapshot[] with enriched host information:
 * - visitorName, visitorEmail, visitorPhone (visitor fields)
 * - firstName, lastName, email, department (host fields from employeeId)
 * 
 * Supports:
 * - Universal search filters
 * - Pagination
 * - Company scope filtering (via X-Tenant-ID header)
 */
export const searchVisitorSnapshots = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<Pagination<VisitorSnapshot>>> => {
  const { tenant, accessToken } = getAuth();
  return apiRequest<Pagination<VisitorSnapshot>>({
    method: "POST",
    endpoint: `${BASE_URL}/search?page=${page}&size=${size}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Search All Visitor Snapshots (no filters)
 * POST /visitors/search?page=0&size=20
 * Body: {}
 */
export const searchAllVisitorSnapshots = async (
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<Pagination<VisitorSnapshot>>> => {
  const { tenant, accessToken } = getAuth();
  return apiRequest<Pagination<VisitorSnapshot>>({
    method: "POST",
    endpoint: `${BASE_URL}/search?page=${page}&size=${size}`,
    tenant,
    accessToken,
    body: {},
  });
};

/**
 * Search Visitors by Status
 * Convenience function for filtering by status
 */
export const searchVisitorsByStatus = async (
  status: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<Pagination<VisitorSnapshot>>> => {
  const searchRequest: UniversalSearchRequest = {
    filters: {
      and: {
        status: status,
      },
    },
  };
  return searchVisitorSnapshots(searchRequest, page, size);
};

/**
 * Search Visitors by Company
 * Convenience function for filtering by companyId
 */
export const searchVisitorsByCompany = async (
  companyId: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<Pagination<VisitorSnapshot>>> => {
  const searchRequest: UniversalSearchRequest = {
    filters: {
      and: {
        companyId: companyId,
      },
    },
  };
  return searchVisitorSnapshots(searchRequest, page, size);
};

/**
 * Search Visitors by Purpose
 * Convenience function for filtering by purpose
 */
export const searchVisitorsByPurpose = async (
  purpose: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<Pagination<VisitorSnapshot>>> => {
  const searchRequest: UniversalSearchRequest = {
    filters: {
      and: {
        purpose: purpose,
      },
    },
  };
  return searchVisitorSnapshots(searchRequest, page, size);
};
