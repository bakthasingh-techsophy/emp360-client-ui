/**
 * Leave Management Service
 * Handles leave management operations for managers/leads viewing team applications and credits
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/leave-management/team/absences - Get team absence applications
 * - POST /emp-user-management/v1/leave-management/team/credits - Get team credit requests
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { AbsenceApplication, Credit } from "@/modules/leave-management-system/types/leave.types";

const BASE_ENDPOINT = "/emp-user-management/v1/leave-management";

/**
 * Get Team Absence Applications
 * POST /emp-user-management/v1/leave-management/team/absences
 * 
 * Manager/Lead retrieves absence applications of their team members.
 * Email is automatically extracted from JWT token and used to filter team members.
 * Only shows applications from direct reports.
 * Supports filtering by status, absence type, and other criteria.
 * 
 * Requires LEAD role in employee-360 resource.
 * 
 * @param searchRequest - UniversalSearchRequest with filters and search text
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (email extracted from token)
 * @returns Promise<ApiResponse<Pagination<AbsenceApplication>>>
 * 
 * @example
 * const response = await apiGetTeamAbsenceApplications({
 *   searchText: '',
 *   searchFields: ['absenceType', 'reason'],
 *   filters: { and: { status: 'PENDING' } },
 *   sort: { fromDate: -1 }
 * }, 0, 20, 'tenant-001', accessToken);
 */
export const apiGetTeamAbsenceApplications = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 20,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<AbsenceApplication>>> => {
  return apiRequest<Pagination<AbsenceApplication>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/team/absences?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Get Team Credit Requests
 * POST /emp-user-management/v1/leave-management/team/credits
 * 
 * Manager/Lead retrieves credit requests of their team members.
 * Email is automatically extracted from JWT token and used to filter team members.
 * Only shows credit requests from direct reports.
 * Supports filtering by status, credit type, and other criteria.
 * 
 * Requires LEAD role in employee-360 resource.
 * 
 * @param searchRequest - UniversalSearchRequest with filters and search text
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (email extracted from token)
 * @returns Promise<ApiResponse<Pagination<Credit>>>
 * 
 * @example
 * const response = await apiGetTeamCreditRequests({
 *   searchText: '',
 *   searchFields: ['creditType', 'reason'],
 *   filters: { and: { status: 'PENDING' } },
 *   sort: { createdAt: -1 }
 * }, 0, 20, 'tenant-001', accessToken);
 */
export const apiGetTeamCreditRequests = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 20,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Credit>>> => {
  return apiRequest<Pagination<Credit>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/team/credits?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Approve or Reject Absence Application
 * PUT /emp-user-management/v1/leave-management/absences/{id}?status=approve|reject
 * 
 * Manager/Lead approves or rejects an absence application from their direct report.
 * Email is automatically extracted from JWT token and validated against reportingTo field.
 * If rejected, leave balance is automatically credited back.
 * 
 * Requires LEAD role in employee-360 resource.
 * 
 * @param applicationId - Absence application ID (e.g., "APP-123")
 * @param status - Status: "approve" or "reject"
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (email extracted from token)
 * @returns Promise<ApiResponse<AbsenceApplication>>
 * 
 * @example
 * const response = await apiApproveRejectAbsenceApplication(
 *   "APP-123",
 *   "approve",
 *   "tenant-001",
 *   accessToken
 * );
 */
export const apiApproveRejectAbsenceApplication = async (
  applicationId: string,
  status: "approve" | "reject",
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<AbsenceApplication>> => {
  return apiRequest<AbsenceApplication>({
    method: "PUT",
    endpoint: `${BASE_ENDPOINT}/absences/${applicationId}?status=${status}`,
    tenant,
    accessToken,
  });
};

/**
 * Approve or Reject Credit Request
 * PUT /emp-user-management/v1/leave-management/credits/{id}?status=approve|reject
 * 
 * Manager/Lead approves or rejects a credit request from their direct report.
 * Email is automatically extracted from JWT token and validated against reportingTo field.
 * When approved, available credits are set to total credits.
 * 
 * Requires LEAD role in employee-360 resource.
 * 
 * @param creditId - Credit request ID (e.g., "CREDIT-123")
 * @param status - Status: "approve" or "reject"
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (email extracted from token)
 * @returns Promise<ApiResponse<Credit>>
 * 
 * @example
 * const response = await apiApproveRejectCreditRequest(
 *   "CREDIT-123",
 *   "approve",
 *   "tenant-001",
 *   accessToken
 * );
 */
export const apiApproveRejectCreditRequest = async (
  creditId: string,
  status: "approve" | "reject",
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Credit>> => {
  return apiRequest<Credit>({
    method: "PUT",
    endpoint: `${BASE_ENDPOINT}/credits/${creditId}?status=${status}`,
    tenant,
    accessToken,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const leaveManagementService = {
  apiGetTeamAbsenceApplications,
  apiGetTeamCreditRequests,
  apiApproveRejectAbsenceApplication,
  apiApproveRejectCreditRequest,
};
