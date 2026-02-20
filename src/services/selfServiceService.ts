/**
 * Self-Service API Service
 * Handles all self-service operations where employeeId is extracted from JWT token
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/self-service/skills - Create skill (employeeId from JWT)
 * - PATCH /emp-user-management/v1/self-service/skills/{skillId} - Update skill (employeeId from JWT)
 * - DELETE /emp-user-management/v1/self-service/skills/{skillId} - Delete skill (employeeId from JWT)
 * - POST /emp-user-management/v1/self-service/skills/search - Search own skills (employeeId from JWT)
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { SkillItem, SkillItemCarrier, GeneralDetailsSnapshot, JobDetailsSnapshot } from "@/modules/user-management/types/onboarding.types";
import { EmployeeLeavesInformation, AbsenceCarrier } from "@/modules/leave-management-system/types/leaveConfiguration.types";
import { AbsenceApplication } from "@/modules/leave-management-system/types/leave.types";

const BASE_ENDPOINT = "/emp-user-management/v1/self-service";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Self-Service Create Skill
 * POST /emp-user-management/v1/self-service/skills
 * 
 * Employee creates their own skill.
 * EmployeeId is automatically extracted from JWT token.
 * No need to provide employeeId in request body.
 * 
 * @param carrier - SkillItemCarrier with skill information (without employeeId)
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<SkillItem>>
 * 
 * @example
 * const response = await apiCreateSkillSelfService({
 *   name: 'Java',
 *   certificationType: CertificationType.NONE,
 *   createdAt: new Date().toISOString()
 * }, 'tenant-001', accessToken);
 */
export const apiCreateSkillSelfService = async (
  carrier: Omit<SkillItemCarrier, 'employeeId'>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<SkillItem>> => {
  return apiRequest<SkillItem>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/skills`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Self-Service Update Skill
 * PATCH /emp-user-management/v1/self-service/skills/{skillId}
 * 
 * Employee updates their own skill.
 * EmployeeId is automatically extracted from JWT token.
 * Only the skill owner can update their skill.
 * 
 * @param skillId - Skill ID to update
 * @param payload - Map of fields to update (e.g., { name: "Advanced Java" })
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<SkillItem>>
 * 
 * @example
 * const response = await apiUpdateSkillSelfService('SKILL-123', {
 *   name: 'Advanced Java',
 *   updatedAt: new Date().toISOString()
 * }, 'tenant-001', accessToken);
 */
export const apiUpdateSkillSelfService = async (
  skillId: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<SkillItem>> => {
  return apiRequest<SkillItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/skills/${skillId}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Self-Service Delete Skill
 * DELETE /emp-user-management/v1/self-service/skills/{skillId}
 * 
 * Employee deletes their own skill.
 * EmployeeId is automatically extracted from JWT token.
 * Skill is removed from employee's skills list and deleted from database.
 * Only the skill owner can delete their skill.
 * 
 * @param skillId - Skill ID to delete
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteSkillSelfService('SKILL-123', 'tenant-001', accessToken);
 */
export const apiDeleteSkillSelfService = async (
  skillId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/skills/${skillId}`,
    tenant,
    accessToken,
  });
};

/**
 * Self-Service Search Skills
 * POST /emp-user-management/v1/self-service/skills/search
 * 
 * Employee searches their own skills.
 * EmployeeId is automatically extracted from JWT token and added to filters.
 * User can only see their own skills.
 * 
 * @param searchRequest - UniversalSearchRequest with filters and search text
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<Pagination<SkillItem>>>
 * 
 * @example
 * const response = await apiSearchSkillsSelfService({
 *   searchText: 'Java',
 *   searchFields: ['name'],
 *   filters: { and: { certificationType: 'CERTIFIED' } }
 * }, 0, 20, 'tenant-001', accessToken);
 */
export const apiSearchSkillsSelfService = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<SkillItem>>> => {
  return apiRequest<Pagination<SkillItem>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/skills/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Self-Service Get General Details Snapshot
 * GET /emp-user-management/v1/self-service/general-details-snapshot
 *
 * Employee retrieves their own general details snapshot.
 * EmployeeId is automatically extracted from JWT token.
 * Lightweight snapshot optimized for display purposes.
 *
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<GeneralDetailsSnapshot>>
 *
 * @example
 * const response = await apiGetGeneralDetailsSnapshotSelfService('tenant-001', accessToken);
 */
export const apiGetGeneralDetailsSnapshotSelfService = async (
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<GeneralDetailsSnapshot>> => {
  return apiRequest<GeneralDetailsSnapshot>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/general-details-snapshot`,
    tenant,
    accessToken,
  });
};

/**
 * Self-Service Get Job Details Snapshot
 * GET /emp-user-management/v1/self-service/job-details-snapshot
 *
 * Employee retrieves their own job details snapshot.
 * EmployeeId is automatically extracted from JWT token.
 * Lightweight snapshot optimized for display purposes.
 *
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<JobDetailsSnapshot>>
 *
 * @example
 * const response = await apiGetJobDetailsSnapshotSelfService('tenant-001', accessToken);
 */
export const apiGetJobDetailsSnapshotSelfService = async (
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetailsSnapshot>> => {
  return apiRequest<JobDetailsSnapshot>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/job-details-snapshot`,
    tenant,
    accessToken,
  });
};

/**
 * Get Employee Leaves Information
 * GET /emp-user-management/v1/self-service/leaves-information
 * 
 * Employee retrieves combined leave information including balances and configurations 
 * for all assigned leave types. This API provides a complete view of leave balances 
 * mapped to their full configurations.
 * 
 * EmployeeId is automatically extracted from JWT token.
 * Requires SSV (Self-Service Viewer) role.
 * 
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<EmployeeLeavesInformation>>
 * 
 * @example
 * const response = await apiGetEmployeeLeavesInformation('tenant-001', accessToken);
 * // Returns: {
 * //   balances: {
 * //     'AL': { leaveCode: 'AL', balance: 12, usedDays: 8, ... },
 * //     'SL': { leaveCode: 'SL', balance: 5, usedDays: 2, ... }
 * //   },
 * //   configurations: {
 * //     'AL': { id: '...', name: 'Annual Leave', code: 'AL', ... },
 * //     'SL': { id: '...', name: 'Sick Leave', code: 'SL', ... }
 * //   }
 * // }
 */
export const apiGetEmployeeLeavesInformation = async (
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmployeeLeavesInformation>> => {
  return apiRequest<EmployeeLeavesInformation>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/leaves-information`,
    tenant,
    accessToken,
  });
};

/**
 * Self-Service Raise Absence Request
 * POST /emp-user-management/v1/self-service/leaves/apply
 * 
 * Employee applies for leave/absence. Handles absence application with validation including:
 * - Credit management for comp-off leaves
 * - Leave balance deduction
 * - Encashment calculation
 * - Auto-approval scheduling based on configuration
 * - Email notifications
 * 
 * EmployeeId is automatically extracted from JWT token.
 * Username and realm are automatically extracted from JWT token.
 * Requires SSV (Self-Service Viewer) role.
 * 
 * @param carrier - AbsenceCarrier with absence application details
 * @param tenant - Tenant ID
 * @param accessToken - Access token with JWT (employeeId extracted from token)
 * @returns Promise<ApiResponse<AbsenceApplication>>
 * 
 * @example
 * const response = await apiRaiseAbsenceRequest({
 *   fromDate: '2026-03-01T00:00:00.000Z',
 *   toDate: '2026-03-05T00:00:00.000Z',
 *   absenceType: 'PL',
 *   absenceCategory: 'fullDay',
 *   reason: 'Personal leave for family matters',
 *   informTo: ['manager@mailinator.com', 'hr@mailinator.com'],
 *   createdAt: new Date().toISOString()
 * }, 'tenant-001', accessToken);
 */
export const apiRaiseAbsenceRequest = async (
  carrier: AbsenceCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<AbsenceApplication>> => {
  return apiRequest<AbsenceApplication>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/leaves/apply`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const selfServiceService = {
  apiCreateSkillSelfService,
  apiUpdateSkillSelfService,
  apiDeleteSkillSelfService,
  apiSearchSkillsSelfService,
  apiGetGeneralDetailsSnapshotSelfService,
  apiGetJobDetailsSnapshotSelfService,
  apiGetEmployeeLeavesInformation,
  apiRaiseAbsenceRequest,
};
