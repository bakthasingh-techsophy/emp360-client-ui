/**
 * User Management Service
 * Handles all API operations for user management - onboarding, user lifecycle, and settings management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/users/onboard - Onboard a new user
 * - PATCH /emp-user-management/v1/users/{employeeId} - Update user details
 * - PATCH /emp-user-management/v1/users/employee-types/{id} - Update employee type
 * - PATCH /emp-user-management/v1/users/departments/{id} - Update department
 * - PATCH /emp-user-management/v1/users/designations/{id} - Update designation
 * - PATCH /emp-user-management/v1/users/work-locations/{id} - Update work location
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { 
  UserDetails, 
  UserDetailsCarrier, 
  SkillItem, 
  SkillItemCarrier,
  GeneralDetailsSnapshot,
  JobDetailsSnapshot 
} from "@/modules/user-management/types/onboarding.types";
import { EmployeeType, Department, Designation, WorkLocation } from "@/modules/user-management/types/settings.types";

const BASE_ENDPOINT = "/emp-user-management/v1/users";

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Onboard New User
 * POST /emp-user-management/v1/users/onboard
 * 
 * Creates a new user in the system with basic user details.
 * This is the entry point for employee onboarding.
 * 
 * @param carrier - UserDetailsCarrier with user information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserDetails>>
 * 
 * @example
 * const response = await apiOnboardUser({
 *   employeeId: 'EMP001',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john.doe@company.com',
 *   phone: '+91-9876543210',
 *   status: UserStatus.ACTIVE
 * }, 'test-realm');
 */
export const apiOnboardUser = async (
  carrier: UserDetailsCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserDetails>> => {
  return apiRequest<UserDetails>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/onboard`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Update User Details
 * PATCH /emp-user-management/v1/users/{employeeId}
 * 
 * Partially updates user details - only provided fields are updated
 * 
 * @param employeeId - Employee ID
 * @param payload - Map of fields to update (e.g., { firstName: "Jane", phone: "+91-9876543220" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserDetails>>
 * 
 * @example
 * const response = await apiUpdateUser('EMP001', {
 *   firstName: 'Jane',
 *   phone: '+91-9876543220',
 *   status: UserStatus.INACTIVE
 * }, 'test-realm');
 */
export const apiUpdateUser = async (
  employeeId: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserDetails>> => {
  return apiRequest<UserDetails>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${employeeId}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search User Snapshots
 * POST /emp-user-management/v1/users/snapshots/search
 *
 * Performs a universal search across user snapshots with pagination.
 * Returns: ApiResponse<Pagination<any>> (snapshot shape is dynamic)
 *
 * @param searchRequest - UniversalSearchRequest with filters, search text, etc.
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of results per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 */
export const apiSearchUserSnapshots = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 10,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<any>>> => {
  return apiRequest<Pagination<any>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/snapshots/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete User
 * DELETE /emp-user-management/v1/users/{employeeId}
 * 
 * Deletes a user from the system by employee ID.
 * Returns void wrapped in ApiResponse.
 * 
 * @param employeeId - Employee ID to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteUser('EMP-001', 'tenant-001');
 */
export const apiDeleteUser = async (
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
 * Create Skill
 * POST /emp-user-management/v1/users/skills
 * 
 * Creates a new skill entry for an employee.
 * 
 * @param carrier - SkillItemCarrier with skill information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<SkillItem>>
 * 
 * @example
 * const response = await apiCreateSkill({
 *   employeeId: 'EMP-001',
 *   name: 'Java',
 *   certificationType: CertificationType.NONE,
 *   createdAt: new Date().toISOString()
 * }, 'tenant-001');
 */
export const apiCreateSkill = async (
  carrier: SkillItemCarrier,
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
 * Update Skill
 * PATCH /emp-user-management/v1/users/skills/{skillId}?employeeId={employeeId}
 * 
 * Partially updates a skill entry - only provided fields are updated.
 * Requires both skillId (path param) and employeeId (query param).
 * 
 * @param skillId - Skill ID to update
 * @param employeeId - Employee ID (query parameter)
 * @param payload - Map of fields to update (e.g., { name: "Advanced Java" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<SkillItem>>
 * 
 * @example
 * const response = await apiUpdateSkill('SKILL-123', 'EMP-001', {
 *   name: 'Advanced Java',
 *   updatedAt: new Date().toISOString()
 * }, 'tenant-001');
 */
export const apiUpdateSkill = async (
  skillId: string,
  employeeId: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<SkillItem>> => {
  return apiRequest<SkillItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/skills/${skillId}?employeeId=${employeeId}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Skill
 * DELETE /emp-user-management/v1/users/skills/{skillId}?employeeId={employeeId}
 * 
 * Deletes a skill from an employee's skills list.
 * Requires both skillId (path param) and employeeId (query param).
 * Returns void wrapped in ApiResponse.
 * 
 * @param skillId - Skill ID to delete
 * @param employeeId - Employee ID (query parameter)
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteSkill('SKILL-123', 'EMP-001', 'tenant-001');
 */
export const apiDeleteSkill = async (
  skillId: string,
  employeeId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/skills/${skillId}?employeeId=${employeeId}`,
    tenant,
    accessToken,
  });
};

/**
 * Bulk Delete Users by Filters
 * POST /emp-user-management/v1/users/bulk/delete
 * 
 * Deletes multiple users matching the provided filter criteria.
 * The request body contains UniversalSearchRequest with filters.
 * Backend handles pagination internally during execution.
 * 
 * @param searchRequest - UniversalSearchRequest with filters (e.g., { filters: { and: { status: "inactive" } } })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiBulkDeleteUsers(
 *   { filters: { and: { status: "inactive", department: "IT" } } },
 *   'tenant-001'
 * );
 */
export const apiBulkDeleteUsers = async (
  searchRequest: UniversalSearchRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/bulk/delete`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Bulk Deactivate Users
 * POST /emp-user-management/v1/users/bulk/deactivate
 * 
 * Deactivates multiple users matching the provided filter criteria.
 * The request body contains UniversalSearchRequest with filters.
 * Backend handles the selection and deactivation internally.
 * 
 * @param searchRequest - UniversalSearchRequest with filters (e.g., { filters: { and: { status: "active" } } })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiBulkDeactivateUsers(
 *   { filters: { and: { status: "active", department: "IT" } } },
 *   'tenant-001'
 * );
 */
export const apiBulkDeactivateUsers = async (
  searchRequest: UniversalSearchRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/bulk/deactivate`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Bulk Enable Users
 * POST /emp-user-management/v1/users/bulk/enable
 * 
 * Enables/activates multiple users matching the provided filter criteria.
 * The request body contains UniversalSearchRequest with filters.
 * Backend handles the selection and activation internally.
 * 
 * @param searchRequest - UniversalSearchRequest with filters (e.g., { filters: { and: { status: "inactive" } } })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiBulkEnableUsers(
 *   { filters: { and: { status: "inactive", department: "IT" } } },
 *   'tenant-001'
 * );
 */
export const apiBulkEnableUsers = async (
  searchRequest: UniversalSearchRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/bulk/enable`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Update Employee Type (via Users Endpoint)
 * PATCH /emp-user-management/v1/users/employee-types/{id}
 * 
 * Updates an existing employee type via the users management endpoint.
 * Partially updates employee type details - only provided fields are updated.
 * 
 * @param id - Employee type ID
 * @param payload - Object with fields to update (e.g., { employeeType: "FULL_TIME", description: "Full-time Employee" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<EmployeeType>>
 * 
 * @example
 * const response = await apiUpdateEmployeeTypeViaUsers('FULL_TIME', {
 *   employeeType: 'FULL_TIME',
 *   description: 'Full-time Permanent Employee'
 * }, 'tenant-001');
 */
export const apiUpdateEmployeeTypeViaUsers = async (
  id: string,
  payload: Partial<Pick<EmployeeType, 'employeeType' | 'description'>>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<EmployeeType>> => {
  return apiRequest<EmployeeType>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/employee-types/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Update Department (via Users Endpoint)
 * PATCH /emp-user-management/v1/users/departments/{id}
 * 
 * Updates an existing department via the users management endpoint.
 * Partially updates department details - only provided fields are updated.
 * 
 * @param id - Department ID
 * @param payload - Object with fields to update (e.g., { department: "Engineering", description: "Dept description" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Department>>
 * 
 * @example
 * const response = await apiUpdateDepartmentViaUsers('DEPT_001', {
 *   department: 'Engineering & Development',
 *   description: 'Engineering and product development department'
 * }, 'tenant-001');
 */
export const apiUpdateDepartmentViaUsers = async (
  id: string,
  payload: Partial<Pick<Department, 'department' | 'description'>>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Department>> => {
  return apiRequest<Department>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/departments/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Update Designation (via Users Endpoint)
 * PATCH /emp-user-management/v1/users/designations/{id}
 * 
 * Updates an existing designation via the users management endpoint.
 * Partially updates designation details - only provided fields are updated.
 * 
 * @param id - Designation ID
 * @param payload - Object with fields to update (e.g., { designation: "Senior Engineer", description: "Description" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Designation>>
 * 
 * @example
 * const response = await apiUpdateDesignationViaUsers('DES_001', {
 *   designation: 'Senior Software Engineer',
 *   description: 'Senior level software engineer position'
 * }, 'tenant-001');
 */
export const apiUpdateDesignationViaUsers = async (
  id: string,
  payload: Partial<Pick<Designation, 'designation' | 'description'>>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Designation>> => {
  return apiRequest<Designation>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/designations/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Update Work Location (via Users Endpoint)
 * PATCH /emp-user-management/v1/users/work-locations/{id}
 * 
 * Updates an existing work location via the users management endpoint.
 * Partially updates work location details - only provided fields are updated.
 * 
 * @param id - Work Location ID
 * @param payload - Object with fields to update (e.g., { location: "New York Office", description: "Description" })
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<WorkLocation>>
 * 
 * @example
 * const response = await apiUpdateWorkLocationViaUsers('LOC_001', {
 *   location: 'New York Headquarters',
 *   description: 'Main office location in New York, USA'
 * }, 'tenant-001');
 */
export const apiUpdateWorkLocationViaUsers = async (
  id: string,
  payload: Partial<Pick<WorkLocation, 'location' | 'description'>>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<WorkLocation>> => {
  return apiRequest<WorkLocation>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/work-locations/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Employee Type (via Users Endpoint)
 * DELETE /emp-user-management/v1/users/employee-types/{id}
 * 
 * Deletes an existing employee type via the users management endpoint.
 * 
 * @param id - Employee Type ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteEmployeeTypeViaUsers('EMP_TYPE_001', 'tenant-001');
 */
export const apiDeleteEmployeeTypeViaUsers = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/employee-types/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Delete Designation (via Users Endpoint)
 * DELETE /emp-user-management/v1/users/designations/{id}
 * 
 * Deletes an existing designation via the users management endpoint.
 * 
 * @param id - Designation ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteDesignationViaUsers('DES_001', 'tenant-001');
 */
export const apiDeleteDesignationViaUsers = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/designations/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Delete Department (via Users Endpoint)
 * DELETE /emp-user-management/v1/users/departments/{id}
 * 
 * Deletes an existing department via the users management endpoint.
 * 
 * @param id - Department ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteDepartmentViaUsers('DEPT_001', 'tenant-001');
 */
export const apiDeleteDepartmentViaUsers = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/departments/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Delete Work Location (via Users Endpoint)
 * DELETE /emp-user-management/v1/users/work-locations/{id}
 * 
 * Deletes an existing work location via the users management endpoint.
 * 
 * @param id - Work Location ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteWorkLocationViaUsers('LOC_001', 'tenant-001');
 */
export const apiDeleteWorkLocationViaUsers = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/work-locations/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Get GeneralDetailsSnapshot By UserId
 * GET /emp-user-management/v1/users/{employeeId}/general-details-snapshot
 *
 * Retrieves a lightweight snapshot of general details for a user.
 * Optimized for table rendering and display purposes.
 *
 * @param employeeId - Employee ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<GeneralDetailsSnapshot>>
 *
 * @example
 * const response = await apiGetGeneralDetailsSnapshot('EMP-001', 'tenant-001');
 */
export const apiGetGeneralDetailsSnapshot = async (
  employeeId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<GeneralDetailsSnapshot>> => {
  return apiRequest<GeneralDetailsSnapshot>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${employeeId}/general-details-snapshot`,
    tenant,
    accessToken,
  });
};

/**
 * Get JobDetailsSnapshot By UserId
 * GET /emp-user-management/v1/users/{employeeId}/job-details-snapshot
 *
 * Retrieves a lightweight snapshot of job details for a user.
 * Optimized for table rendering and display purposes.
 * Includes cached display names for designation, department, employee type, and work location.
 *
 * @param employeeId - Employee ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<JobDetailsSnapshot>>
 *
 * @example
 * const response = await apiGetJobDetailsSnapshot('EMP-001', 'tenant-001');
 */
export const apiGetJobDetailsSnapshot = async (
  employeeId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<JobDetailsSnapshot>> => {
  return apiRequest<JobDetailsSnapshot>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${employeeId}/job-details-snapshot`,
    tenant,
    accessToken,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const userManagementService = {
  apiOnboardUser,
  apiUpdateUser,
  apiSearchUserSnapshots,
  apiDeleteUser,
  apiCreateSkill,
  apiUpdateSkill,
  apiDeleteSkill,
  apiBulkDeleteUsers,
  apiBulkDeactivateUsers,
  apiBulkEnableUsers,
  apiUpdateEmployeeTypeViaUsers,
  apiDeleteEmployeeTypeViaUsers,
  apiUpdateDepartmentViaUsers,
  apiDeleteDepartmentViaUsers,
  apiUpdateDesignationViaUsers,
  apiDeleteDesignationViaUsers,
  apiUpdateWorkLocationViaUsers,
  apiDeleteWorkLocationViaUsers,
  apiGetGeneralDetailsSnapshot,
  apiGetJobDetailsSnapshot,
};
