/**
 * User Management Context
 * Manages all user-related operations and provides centralized API access with built-in error/success notifications
 *
 * Features:
 * - User Details CRUD + Employee Onboarding
 * - General Details, Job Details, Skills, Keycloak User Management
 * - Employment & Event History Management
 * - Employee Aggregate Management
 * - Automatic error toast notifications for all operations
 * - Success toast notifications for create, update, delete operations
 * - Single unified loading state for async operations
 * - Auto token validation and tenant resolution
 */

import { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  resolveAuth,
  isTokenExpired,
  removeStorageItem,
} from "@/store/localStorage";
import StorageKeys from "@/constants/storageConstants";
import { useLayoutContext } from "./LayoutContext";

// User Details Service
import {
  apiCreateUserDetails,
  apiGetUserDetailsById,
  apiUpdateUserDetails,
  apiSearchUserDetails,
  apiBulkUpdateUserDetails,
  apiDeleteUserDetailsById,
  apiBulkDeleteUserDetailsByIds,
  apiBulkDeleteUserDetailsByFilters,
} from "@/services/userDetailsService";

// User Management Service
import {
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
} from "@/services/userManagementService";

// Employee Aggregate Service
import {
  apiCreateEmployeeAggregate,
  apiGetEmployeeAggregate,
  apiUpdateEmployeeAggregate,
  apiDeleteEmployeeAggregate,
} from "@/services/employeeAggregateService";

// Employment History Service
import {
  apiCreateEmploymentHistory,
  apiGetEmploymentHistoryById,
  apiUpdateEmploymentHistory,
  apiSearchEmploymentHistory,
  apiBulkUpdateEmploymentHistory,
  apiDeleteEmploymentHistoryById,
  apiBulkDeleteEmploymentHistoryByIds,
  apiBulkDeleteEmploymentHistoryByFilters,
  EmploymentHistoryItem,
} from "@/services/employmentHistoryService";

// Event History Service
import {
  apiCreateEventHistory,
  apiGetEventHistoryById,
  apiUpdateEventHistory,
  apiSearchEventHistory,
  apiBulkUpdateEventHistory,
  apiDeleteEventHistoryById,
  apiBulkDeleteEventHistoryByIds,
  apiBulkDeleteEventHistoryByFilters,
  EventHistoryItem,
} from "@/services/eventHistoryService";

// General Details Service
import {
  apiCreateGeneralDetails,
  apiGetGeneralDetailsById,
  apiUpdateGeneralDetails,
  apiDeleteGeneralDetails,
} from "@/services/generalDetailsService";

// Job Details Service
import {
  apiCreateJobDetails,
  apiGetJobDetailsById,
  apiUpdateJobDetails,
  apiDeleteJobDetails,
} from "@/services/jobDetailsService";

// Banking Details Service
import {
  apiCreateBankingDetails,
  apiGetBankingDetailsById,
  apiUpdateBankingDetails,
  apiSearchBankingDetails,
  apiDeleteBankingDetails,
} from "@/services/bankingDetailsService";

// Skill Items Service
import {
  apiGetSkillById,
  apiSearchSkills,
  SkillItem,
} from "@/services/skillItemsService";

// Document Pool Service
import {
  apiCreateDocument,
  apiGetDocumentById,
  apiUpdateDocument,
  apiDeleteDocument,
  apiSearchDocuments,
  DocumentItem,
} from "@/services/documentPoolService";

// Keycloak User Service
import {
  apiCreateKeycloakUser,
  apiGetKeycloakUserById,
  apiUpdateKeycloakUser,
  apiDeleteKeycloakUser,
  KeycloakUserItem,
} from "@/services/keycloakUserService";

// Employee Type Service
import {
  apiCreateEmployeeType,
  apiGetEmployeeType,
  apiSearchEmployeeTypes,
  apiBulkDeleteEmployeeTypes,
} from "@/services/employeeTypeService";

// Department Service
import {
  apiCreateDepartment,
  apiGetDepartment,
  apiSearchDepartments,
} from "@/services/departmentService";

// Designation Service
import {
  apiCreateDesignation,
  apiGetDesignation,
  apiSearchDesignations,
} from "@/services/designationService";

// Work Location Service
import {
  apiCreateWorkLocation,
  apiGetWorkLocation,
  apiSearchWorkLocations,
} from "@/services/workLocationService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  JobDetails,
  UserDetails,
  UserDetailsCarrier,
  UserDetailsSnapshot,
  GeneralDetails,
  GeneralDetailsCarrier,
  GeneralDetailsSnapshot,
  JobDetailsCarrier,
  JobDetailsSnapshot,
  EmploymentHistoryItemCarrier,
  EventHistoryItemCarrier,
  SkillItemCarrier,
  DocumentItemCarrier,
  BankingDetails,
  BankingDetailsCarrier,
} from "@/modules/user-management/types/onboarding.types";
import {
  EmployeeType,
  EmployeeTypeCarrier,
  Department,
  DepartmentCarrier,
  Designation,
  DesignationCarrier,
  WorkLocation,
  WorkLocationCarrier,
} from "@/modules/user-management/types/settings.types";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * User Management Context Type Definition
 */
interface UserManagementContextType {
  // User Details Methods
  onboardUser: (carrier: UserDetailsCarrier) => Promise<UserDetails | null>;
  createUserDetails: (
    carrier: UserDetailsCarrier,
  ) => Promise<UserDetails | null>;
  getUserDetailsById: (id: string) => Promise<UserDetails | null>;
  updateUserDetails: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<UserDetails | null>;
  updateUser: (
    employeeId: string,
    payload: UpdatePayload,
  ) => Promise<UserDetails | null>;
  deleteUser: (employeeId: string) => Promise<boolean>;
  refreshUsers: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<UserDetails> | null>;
  refreshUserDetailsSnapshots: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<UserDetailsSnapshot> | null>;
  bulkUpdateUserDetails: (
    filters: UniversalSearchRequest,
    updates: UpdatePayload,
  ) => Promise<boolean>;
  deleteUserDetailsById: (id: string) => Promise<boolean>;
  bulkDeleteUserDetailsByIds: (ids: string[]) => Promise<boolean>;
  bulkDeleteUserDetailsByFilters: (
    filters: UniversalSearchRequest,
  ) => Promise<boolean>;
  bulkDeleteUsers: (searchRequest: UniversalSearchRequest) => Promise<boolean>;
  bulkDeactivateUsers: (
    searchRequest: UniversalSearchRequest,
  ) => Promise<boolean>;
  bulkEnableUsers: (searchRequest: UniversalSearchRequest) => Promise<boolean>;

  // Employee Aggregate Methods
  createEmployeeAggregate: (payload: any) => Promise<any | null>;
  getEmployeeAggregate: (employeeId: string) => Promise<any | null>;
  updateEmployeeAggregate: (
    employeeId: string,
    payload: UpdatePayload,
  ) => Promise<any | null>;
  deleteEmployeeAggregate: (employeeId: string) => Promise<boolean>;

  // Employment History Methods
  createEmploymentHistory: (
    carrier: EmploymentHistoryItemCarrier,
  ) => Promise<EmploymentHistoryItem | null>;
  getEmploymentHistoryById: (
    id: string,
  ) => Promise<EmploymentHistoryItem | null>;
  updateEmploymentHistory: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<EmploymentHistoryItem | null>;
  refreshEmploymentHistory: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<EmploymentHistoryItem> | null>;
  bulkUpdateEmploymentHistory: (
    filters: UniversalSearchRequest,
    updates: UpdatePayload,
  ) => Promise<boolean>;
  deleteEmploymentHistoryById: (id: string) => Promise<boolean>;
  bulkDeleteEmploymentHistoryByIds: (ids: string[]) => Promise<boolean>;
  bulkDeleteEmploymentHistoryByFilters: (
    filters: UniversalSearchRequest,
  ) => Promise<boolean>;

  // Event History Methods
  createEventHistory: (
    carrier: EventHistoryItemCarrier,
  ) => Promise<EventHistoryItem | null>;
  getEventHistoryById: (id: string) => Promise<EventHistoryItem | null>;
  updateEventHistory: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<EventHistoryItem | null>;
  refreshEventHistory: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<EventHistoryItem> | null>;
  bulkUpdateEventHistory: (
    filters: UniversalSearchRequest,
    updates: UpdatePayload,
  ) => Promise<boolean>;
  deleteEventHistoryById: (id: string) => Promise<boolean>;
  bulkDeleteEventHistoryByIds: (ids: string[]) => Promise<boolean>;
  bulkDeleteEventHistoryByFilters: (
    filters: UniversalSearchRequest,
  ) => Promise<boolean>;

  // General Details Methods
  createGeneralDetails: (
    carrier: GeneralDetailsCarrier,
  ) => Promise<GeneralDetails | null>;
  getGeneralDetailsById: (id: string) => Promise<GeneralDetails | null>;
  updateGeneralDetails: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<GeneralDetails | null>;
  deleteGeneralDetails: (id: string) => Promise<boolean>;

  // Job Details Methods
  createJobDetails: (carrier: JobDetailsCarrier) => Promise<JobDetails | null>;
  getJobDetailsById: (id: string) => Promise<JobDetails | null>;
  updateJobDetails: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<JobDetails | null>;
  deleteJobDetails: (id: string) => Promise<boolean>;

  // Job Details Snapshot Methods
  getJobDetailsSnapshot: (employeeId: string) => Promise<JobDetailsSnapshot | null>;
  getGeneralDetailsSnapshot: (employeeId: string) => Promise<GeneralDetailsSnapshot | null>;

  // Banking Details Methods
  createBankingDetails: (
    carrier: BankingDetailsCarrier,
  ) => Promise<BankingDetails | null>;
  getBankingDetailsById: (id: string) => Promise<BankingDetails | null>;
  updateBankingDetails: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<BankingDetails | null>;
  refreshBankingDetails: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<BankingDetails> | null>;
  deleteBankingDetails: (id: string) => Promise<boolean>;

  // Skill Items Methods
  createSkill: (carrier: SkillItemCarrier) => Promise<SkillItem | null>;
  getSkillById: (id: string) => Promise<SkillItem | null>;
  updateSkill: (
    id: string,
    employeeId: string,
    payload: UpdatePayload,
  ) => Promise<SkillItem | null>;
  refreshSkills: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<SkillItem> | null>;
  deleteSkill: (id: string, employeeId: string) => Promise<boolean>;

  // Document Pool Methods
  createDocument: (
    carrier: DocumentItemCarrier,
  ) => Promise<DocumentItem | null>;
  getDocumentById: (id: string) => Promise<DocumentItem | null>;
  updateDocument: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<DocumentItem | null>;
  refreshDocuments: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<DocumentItem> | null>;
  deleteDocument: (id: string) => Promise<boolean>;

  // Keycloak User Methods
  createKeycloakUser: (
    item: KeycloakUserItem,
  ) => Promise<KeycloakUserItem | null>;
  getKeycloakUserById: (id: string) => Promise<KeycloakUserItem | null>;
  updateKeycloakUser: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<KeycloakUserItem | null>;
  deleteKeycloakUser: (id: string) => Promise<boolean>;

  // Employee Type Methods
  createEmployeeType: (
    carrier: EmployeeTypeCarrier,
  ) => Promise<EmployeeType | null>;
  getEmployeeType: (id: string) => Promise<EmployeeType | null>;
  updateEmployeeType: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<EmployeeType | null>;
  refreshEmployeeTypes: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<EmployeeType> | null>;
  deleteEmployeeType: (id: string) => Promise<boolean>;
  bulkDeleteEmployeeTypes: (ids: string[]) => Promise<boolean>;

  // Department Methods
  createDepartment: (carrier: DepartmentCarrier) => Promise<Department | null>;
  getDepartment: (id: string) => Promise<Department | null>;
  updateDepartment: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<Department | null>;
  refreshDepartments: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<Department> | null>;
  deleteDepartment: (id: string) => Promise<boolean>;

  // Designation Methods
  createDesignation: (
    carrier: DesignationCarrier,
  ) => Promise<Designation | null>;
  getDesignation: (id: string) => Promise<Designation | null>;
  updateDesignation: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<Designation | null>;
  refreshDesignations: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<Designation> | null>;
  deleteDesignation: (id: string) => Promise<boolean>;

  // Work Location Methods
  createWorkLocation: (
    carrier: WorkLocationCarrier,
  ) => Promise<WorkLocation | null>;
  getWorkLocation: (id: string) => Promise<WorkLocation | null>;
  updateWorkLocation: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<WorkLocation | null>;
  refreshWorkLocations: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<WorkLocation> | null>;
  deleteWorkLocation: (id: string) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const UserManagementContext = createContext<
  UserManagementContextType | undefined
>(undefined);

/**
 * User Management Provider Component
 */
export function UserManagementProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCompanyScope } = useLayoutContext();

  /**
   * Check if token is still valid
   */
  const validateToken = (): boolean => {
    if (isTokenExpired()) {
      removeStorageItem(StorageKeys.USER);
      removeStorageItem(StorageKeys.SESSION);
      removeStorageItem(StorageKeys.TENANT);

      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });

      window.location.href = "/auth/login";
      return false;
    }
    return true;
  };

  /**
   * Generic error handler
   */
  const handleError = (
    error: unknown,
    title: string,
    defaultMessage: string,
  ) => {
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;
    toast({
      variant: "destructive",
      title,
      description: errorMessage,
    });
  };

  /**
   * Generic success handler
   */
  const handleSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  /**
   * Generic async operation wrapper with token validation and loading state
   */
  const executeApiCall = async <T,>(
    apiCall: (tenant: string, accessToken: string) => Promise<any>,
    operationName: string,
    successMessage: string,
    returnOnSuccess: boolean = false,
  ): Promise<T | boolean | null> => {
    if (!validateToken()) return returnOnSuccess ? false : null;

    const auth = resolveAuth();
    if (!auth.tenant || !auth.accessToken) {
      handleError(
        new Error("Missing auth"),
        "Error",
        "Authentication information is missing",
      );
      return returnOnSuccess ? false : null;
    }

    setIsLoading(true);
    try {
      const response = await apiCall(auth.tenant, auth.accessToken);

      if (!response.success) {
        handleError(
          response.message,
          `${operationName} Failed`,
          response.message || `Failed to ${operationName}`,
        );
        return returnOnSuccess ? false : null;
      }

      if (successMessage) {
        handleSuccess(successMessage);
      }

      return returnOnSuccess ? true : response.data;
    } catch (error) {
      handleError(error, "Error", `An error occurred during ${operationName}`);
      return returnOnSuccess ? false : null;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== USER DETAILS METHODS ====================

  const onboardUser = async (
    carrier: UserDetailsCarrier,
  ): Promise<UserDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiOnboardUser(carrier, tenant, accessToken),
      "Onboarding",
      "User onboarded successfully",
    ) as Promise<UserDetails | null>;
  };

  const createUserDetails = async (
    carrier: UserDetailsCarrier,
  ): Promise<UserDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateUserDetails(carrier, tenant, accessToken),
      "Creation",
      "User details created successfully",
    ) as Promise<UserDetails | null>;
  };

  const getUserDetailsById = async (
    id: string,
  ): Promise<UserDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetUserDetailsById(id, tenant, accessToken),
      "Fetch",
      "",
    ) as Promise<UserDetails | null>;
  };

  const updateUserDetails = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<UserDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateUserDetails(id, payload, tenant, accessToken),
      "Update",
      "User details updated successfully",
    ) as Promise<UserDetails | null>;
  };

  const updateUser = async (
    employeeId: string,
    payload: UpdatePayload,
  ): Promise<UserDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateUser(employeeId, payload, tenant, accessToken),
      "Update",
      "User updated successfully",
    ) as Promise<UserDetails | null>;
  };

  const deleteUser = async (employeeId: string): Promise<boolean> => {
    return executeApiCall(
      (tenant, accessToken) => apiDeleteUser(employeeId, tenant, accessToken),
      "Delete",
      "User deleted successfully",
      true,
    ) as Promise<boolean>;
  };

  const refreshUsers = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<UserDetails> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchUserDetails(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Search",
      "",
    ) as Promise<Pagination<UserDetails> | null>;
  };

  const refreshUserDetailsSnapshots = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<UserDetailsSnapshot> | null> => {
    // Add company ID filter if a specific company is selected (not 'all')
    let enhancedSearchRequest = { ...searchRequest };

    if (selectedCompanyScope && selectedCompanyScope !== "all") {
      enhancedSearchRequest.filters = {
        ...enhancedSearchRequest.filters,
        and: {
          ...enhancedSearchRequest.filters?.and,
          companyId: [selectedCompanyScope, ""],
        },
      };
    }

    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchUserSnapshots(
          enhancedSearchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Search Snapshots",
      "",
    ) as Promise<Pagination<UserDetailsSnapshot> | null>;
  };

  const bulkUpdateUserDetails = async (
    filters: UniversalSearchRequest,
    updates: UpdatePayload,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateUserDetails(filters, updates, tenant, accessToken),
      "Bulk Update",
      "",
      true,
    );
    return result as boolean;
  };

  const deleteUserDetailsById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteUserDetailsById(id, tenant, accessToken),
      "Deletion",
      "User details deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeleteUserDetailsByIds = async (
    ids: string[],
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteUserDetailsByIds(ids, tenant, accessToken),
      "Bulk Deletion",
      `${ids.length} user(s) deleted successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkDeleteUserDetailsByFilters = async (
    filters: UniversalSearchRequest,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteUserDetailsByFilters(filters, tenant, accessToken),
      "Bulk Deletion",
      "Users deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeleteUsers = async (
    searchRequest: UniversalSearchRequest,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteUsers(searchRequest, tenant, accessToken),
      "Bulk Delete Users",
      `Users matching criteria deleted successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkDeactivateUsers = async (
    searchRequest: UniversalSearchRequest,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeactivateUsers(searchRequest, tenant, accessToken),
      "Bulk Deactivate Users",
      `Users matching criteria deactivated successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkEnableUsers = async (
    searchRequest: UniversalSearchRequest,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkEnableUsers(searchRequest, tenant, accessToken),
      "Bulk Enable Users",
      `Users matching criteria enabled successfully`,
      true,
    );
    return result as boolean;
  };

  // ==================== EMPLOYEE AGGREGATE METHODS ====================

  const createEmployeeAggregate = async (payload: any): Promise<any | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateEmployeeAggregate(payload, tenant, accessToken),
      "Create Aggregate",
      "Employee aggregate created successfully",
    ) as Promise<any | null>;
  };

  const getEmployeeAggregate = async (
    employeeId: string,
  ): Promise<any | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetEmployeeAggregate(employeeId, tenant, accessToken),
      "Fetch Aggregate",
      "",
    ) as Promise<any | null>;
  };

  const updateEmployeeAggregate = async (
    employeeId: string,
    payload: UpdatePayload,
  ): Promise<any | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateEmployeeAggregate(employeeId, payload, tenant, accessToken),
      "Update Aggregate",
      "Employee aggregate updated successfully",
    ) as Promise<any | null>;
  };

  const deleteEmployeeAggregate = async (
    employeeId: string,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteEmployeeAggregate(employeeId, tenant, accessToken),
      "Delete Aggregate",
      "Employee aggregate deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== EMPLOYMENT HISTORY METHODS ====================

  const createEmploymentHistory = async (
    carrier: EmploymentHistoryItemCarrier,
  ): Promise<EmploymentHistoryItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateEmploymentHistory(carrier, tenant, accessToken),
      "Create Employment History",
      "Employment history created successfully",
    ) as Promise<EmploymentHistoryItem | null>;
  };

  const getEmploymentHistoryById = async (
    id: string,
  ): Promise<EmploymentHistoryItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetEmploymentHistoryById(id, tenant, accessToken),
      "Fetch Employment History",
      "",
    ) as Promise<EmploymentHistoryItem | null>;
  };

  const updateEmploymentHistory = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<EmploymentHistoryItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateEmploymentHistory(id, payload, tenant, accessToken),
      "Update Employment History",
      "Employment history updated successfully",
    ) as Promise<EmploymentHistoryItem | null>;
  };

  const refreshEmploymentHistory = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<EmploymentHistoryItem> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchEmploymentHistory(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Employment History",
      "",
    ) as Promise<Pagination<EmploymentHistoryItem> | null>;
  };

  const bulkUpdateEmploymentHistory = async (
    filters: UniversalSearchRequest,
    updates: UpdatePayload,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateEmploymentHistory(filters, updates, tenant, accessToken),
      "Bulk Update Employment History",
      "",
      true,
    );
    return result as boolean;
  };

  const deleteEmploymentHistoryById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteEmploymentHistoryById(id, tenant, accessToken),
      "Delete Employment History",
      "Employment history deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeleteEmploymentHistoryByIds = async (
    ids: string[],
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteEmploymentHistoryByIds(ids, tenant, accessToken),
      "Bulk Delete Employment History",
      `${ids.length} record(s) deleted successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkDeleteEmploymentHistoryByFilters = async (
    filters: UniversalSearchRequest,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteEmploymentHistoryByFilters(filters, tenant, accessToken),
      "Bulk Delete Employment History",
      "Records deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== EVENT HISTORY METHODS ====================

  const createEventHistory = async (
    carrier: EventHistoryItemCarrier,
  ): Promise<EventHistoryItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateEventHistory(carrier, tenant, accessToken),
      "Create Event History",
      "Event history created successfully",
    ) as Promise<EventHistoryItem | null>;
  };

  const getEventHistoryById = async (
    id: string,
  ): Promise<EventHistoryItem | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetEventHistoryById(id, tenant, accessToken),
      "Fetch Event History",
      "",
    ) as Promise<EventHistoryItem | null>;
  };

  const updateEventHistory = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<EventHistoryItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateEventHistory(id, payload, tenant, accessToken),
      "Update Event History",
      "Event history updated successfully",
    ) as Promise<EventHistoryItem | null>;
  };

  const refreshEventHistory = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<EventHistoryItem> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchEventHistory(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Event History",
      "",
    ) as Promise<Pagination<EventHistoryItem> | null>;
  };

  const bulkUpdateEventHistory = async (
    filters: UniversalSearchRequest,
    updates: UpdatePayload,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateEventHistory(filters, updates, tenant, accessToken),
      "Bulk Update Event History",
      "",
      true,
    );
    return result as boolean;
  };

  const deleteEventHistoryById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteEventHistoryById(id, tenant, accessToken),
      "Delete Event History",
      "Event history deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeleteEventHistoryByIds = async (
    ids: string[],
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteEventHistoryByIds(ids, tenant, accessToken),
      "Bulk Delete Event History",
      `${ids.length} record(s) deleted successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkDeleteEventHistoryByFilters = async (
    filters: UniversalSearchRequest,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteEventHistoryByFilters(filters, tenant, accessToken),
      "Bulk Delete Event History",
      "Records deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== GENERAL DETAILS METHODS ====================

  const createGeneralDetails = async (
    carrier: GeneralDetailsCarrier,
  ): Promise<GeneralDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateGeneralDetails(carrier, tenant, accessToken),
      "Create General Details",
      "General details created successfully",
    ) as Promise<GeneralDetails | null>;
  };

  const getGeneralDetailsById = async (
    id: string,
  ): Promise<GeneralDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetGeneralDetailsById(id, tenant, accessToken),
      "Fetch General Details",
      "",
    ) as Promise<GeneralDetails | null>;
  };

  const updateGeneralDetails = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<GeneralDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateGeneralDetails(id, payload, tenant, accessToken),
      "Update General Details",
      "General details updated successfully",
    ) as Promise<GeneralDetails | null>;
  };

  const deleteGeneralDetails = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteGeneralDetails(id, tenant, accessToken),
      "Delete General Details",
      "General details deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== JOB DETAILS METHODS ====================

  const createJobDetails = async (
    carrier: JobDetailsCarrier,
  ): Promise<JobDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateJobDetails(carrier, tenant, accessToken),
      "Create Job Details",
      "Job details created successfully",
    ) as Promise<JobDetails | null>;
  };

  const getJobDetailsById = async (id: string): Promise<JobDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetJobDetailsById(id, tenant, accessToken),
      "Fetch Job Details",
      "",
    ) as Promise<JobDetails | null>;
  };

  const updateJobDetails = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<JobDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateJobDetails(id, payload, tenant, accessToken),
      "Update Job Details",
      "Job details updated successfully",
    ) as Promise<JobDetails | null>;
  };

  const deleteJobDetails = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteJobDetails(id, tenant, accessToken),
      "Delete Job Details",
      "Job details deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== SNAPSHOTS METHODS ====================

  const getJobDetailsSnapshot = async (
    employeeId: string,
  ): Promise<JobDetailsSnapshot | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetJobDetailsSnapshot(employeeId, tenant, accessToken),
      "Fetch Job Details Snapshot",
      "",
    ) as Promise<JobDetailsSnapshot | null>;
  };

  const getGeneralDetailsSnapshot = async (
    employeeId: string,
  ): Promise<GeneralDetailsSnapshot | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetGeneralDetailsSnapshot(employeeId, tenant, accessToken),
      "Fetch General Details Snapshot",
      "",
    ) as Promise<GeneralDetailsSnapshot | null>;
  };

  // ==================== BANKING DETAILS METHODS ====================

  const createBankingDetails = async (
    carrier: BankingDetailsCarrier,
  ): Promise<BankingDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateBankingDetails(carrier, tenant, accessToken),
      "Create Banking Details",
      "Banking details created successfully",
    ) as Promise<BankingDetails | null>;
  };

  const getBankingDetailsById = async (
    id: string,
  ): Promise<BankingDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetBankingDetailsById(id, tenant, accessToken),
      "Fetch Banking Details",
      "",
    ) as Promise<BankingDetails | null>;
  };

  const updateBankingDetails = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<BankingDetails | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateBankingDetails(id, payload, tenant, accessToken),
      "Update Banking Details",
      "Banking details updated successfully",
    ) as Promise<BankingDetails | null>;
  };

  const refreshBankingDetails = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<BankingDetails> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchBankingDetails(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Banking Details",
      "",
    ) as Promise<Pagination<BankingDetails> | null>;
  };

  const deleteBankingDetails = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteBankingDetails(id, tenant, accessToken),
      "Delete Banking Details",
      "Banking details deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== SKILL ITEMS METHODS ====================

  const createSkill = async (
    carrier: SkillItemCarrier,
  ): Promise<SkillItem | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiCreateSkill(carrier, tenant, accessToken),
      "Create Skill",
      "Skill created successfully",
    ) as Promise<SkillItem | null>;
  };

  const getSkillById = async (id: string): Promise<SkillItem | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetSkillById(id, tenant, accessToken),
      "Fetch Skill",
      "",
    ) as Promise<SkillItem | null>;
  };

  const updateSkill = async (
    id: string,
    employeeId: string,
    payload: UpdatePayload,
  ): Promise<SkillItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateSkill(id, employeeId, payload, tenant, accessToken),
      "Update Skill",
      "Skill updated successfully",
    ) as Promise<SkillItem | null>;
  };

  const refreshSkills = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<SkillItem> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchSkills(searchRequest, page, pageSize, tenant, accessToken),
      "Refresh Skills",
      "",
    ) as Promise<Pagination<SkillItem> | null>;
  };

  const deleteSkill = async (id: string, employeeId: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteSkill(id, employeeId, tenant, accessToken),
      "Delete Skill",
      "Skill deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== DOCUMENT POOL METHODS ====================

  const createDocument = async (
    carrier: DocumentItemCarrier,
  ): Promise<DocumentItem | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiCreateDocument(carrier, tenant, accessToken),
      "Create Document",
      "Document created successfully",
    ) as Promise<DocumentItem | null>;
  };

  const getDocumentById = async (id: string): Promise<DocumentItem | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetDocumentById(id, tenant, accessToken),
      "Fetch Document",
      "",
    ) as Promise<DocumentItem | null>;
  };

  const updateDocument = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<DocumentItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateDocument(id, payload, tenant, accessToken),
      "Update Document",
      "Document updated successfully",
    ) as Promise<DocumentItem | null>;
  };

  const refreshDocuments = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<DocumentItem> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchDocuments(searchRequest, page, pageSize, tenant, accessToken),
      "Refresh Documents",
      "",
    ) as Promise<Pagination<DocumentItem> | null>;
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteDocument(id, tenant, accessToken),
      "Delete Document",
      "Document deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== KEYCLOAK USER METHODS ====================

  const createKeycloakUser = async (
    item: KeycloakUserItem,
  ): Promise<KeycloakUserItem | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiCreateKeycloakUser(item, tenant, accessToken),
      "Create Keycloak User",
      "Keycloak user created successfully",
    ) as Promise<KeycloakUserItem | null>;
  };

  const getKeycloakUserById = async (
    id: string,
  ): Promise<KeycloakUserItem | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetKeycloakUserById(id, tenant, accessToken),
      "Fetch Keycloak User",
      "",
    ) as Promise<KeycloakUserItem | null>;
  };

  const updateKeycloakUser = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<KeycloakUserItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateKeycloakUser(id, payload, tenant, accessToken),
      "Update Keycloak User",
      "Keycloak user updated successfully",
    ) as Promise<KeycloakUserItem | null>;
  };

  const deleteKeycloakUser = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteKeycloakUser(id, tenant, accessToken),
      "Delete Keycloak User",
      "Keycloak user deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== EMPLOYEE TYPE METHODS ====================

  const createEmployeeType = async (
    carrier: EmployeeTypeCarrier,
  ): Promise<EmployeeType | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateEmployeeType(carrier, tenant, accessToken),
      "Create Employee Type",
      "Employee type created successfully",
    ) as Promise<EmployeeType | null>;
  };

  const getEmployeeType = async (id: string): Promise<EmployeeType | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetEmployeeType(id, tenant, accessToken),
      "Fetch Employee Type",
      "",
    ) as Promise<EmployeeType | null>;
  };

  const updateEmployeeType = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<EmployeeType | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateEmployeeTypeViaUsers(id, payload, tenant, accessToken),
      "Update Employee Type",
      "Employee type updated successfully",
    ) as Promise<EmployeeType | null>;
  };

  const refreshEmployeeTypes = async (
    searchRequest: UniversalSearchRequest = {},
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<EmployeeType> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchEmployeeTypes(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Employee Types",
      "",
    ) as Promise<Pagination<EmployeeType> | null>;
  };

  const deleteEmployeeType = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteEmployeeTypeViaUsers(id, tenant, accessToken),
      "Delete Employee Type",
      "Employee type deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeleteEmployeeTypes = async (ids: string[]): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteEmployeeTypes(ids, tenant, accessToken),
      "Bulk Delete Employee Types",
      `${ids.length} employee type(s) deleted successfully`,
      true,
    );
    return result as boolean;
  };

  // ==================== DEPARTMENT METHODS ====================

  const createDepartment = async (
    carrier: DepartmentCarrier,
  ): Promise<Department | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateDepartment(carrier, tenant, accessToken),
      "Create Department",
      "Department created successfully",
    ) as Promise<Department | null>;
  };

  const getDepartment = async (id: string): Promise<Department | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetDepartment(id, tenant, accessToken),
      "Fetch Department",
      "",
    ) as Promise<Department | null>;
  };

  const updateDepartment = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<Department | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateDepartmentViaUsers(id, payload, tenant, accessToken),
      "Update Department",
      "Department updated successfully",
    ) as Promise<Department | null>;
  };

  const refreshDepartments = async (
    searchRequest: UniversalSearchRequest = {},
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<Department> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchDepartments(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Departments",
      "",
    ) as Promise<Pagination<Department> | null>;
  };

  const deleteDepartment = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteDepartmentViaUsers(id, tenant, accessToken),
      "Delete Department",
      "Department deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== DESIGNATION METHODS ====================

  const createDesignation = async (
    carrier: DesignationCarrier,
  ): Promise<Designation | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateDesignation(carrier, tenant, accessToken),
      "Create Designation",
      "Designation created successfully",
    ) as Promise<Designation | null>;
  };

  const getDesignation = async (id: string): Promise<Designation | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetDesignation(id, tenant, accessToken),
      "Fetch Designation",
      "",
    ) as Promise<Designation | null>;
  };

  const updateDesignation = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<Designation | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateDesignationViaUsers(id, payload, tenant, accessToken),
      "Update Designation",
      "Designation updated successfully",
    ) as Promise<Designation | null>;
  };

  const refreshDesignations = async (
    searchRequest: UniversalSearchRequest = {},
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<Designation> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchDesignations(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Designations",
      "",
    ) as Promise<Pagination<Designation> | null>;
  };

  const deleteDesignation = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteDesignationViaUsers(id, tenant, accessToken),
      "Delete Designation",
      "Designation deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== WORK LOCATION METHODS ====================

  const createWorkLocation = async (
    carrier: WorkLocationCarrier,
  ): Promise<WorkLocation | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateWorkLocation(carrier, tenant, accessToken),
      "Create Work Location",
      "Work location created successfully",
    ) as Promise<WorkLocation | null>;
  };

  const getWorkLocation = async (id: string): Promise<WorkLocation | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetWorkLocation(id, tenant, accessToken),
      "Fetch Work Location",
      "",
    ) as Promise<WorkLocation | null>;
  };

  const updateWorkLocation = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<WorkLocation | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateWorkLocationViaUsers(id, payload, tenant, accessToken),
      "Update Work Location",
      "Work location updated successfully",
    ) as Promise<WorkLocation | null>;
  };

  const refreshWorkLocations = async (
    searchRequest: UniversalSearchRequest = {},
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<WorkLocation> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchWorkLocations(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Work Locations",
      "",
    ) as Promise<Pagination<WorkLocation> | null>;
  };

  const deleteWorkLocation = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeleteWorkLocationViaUsers(id, tenant, accessToken),
      "Delete Work Location",
      "Work location deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: UserManagementContextType = {
    // User Details
    onboardUser,
    createUserDetails,
    getUserDetailsById,
    updateUserDetails,
    updateUser,
    deleteUser,
    refreshUsers,
    refreshUserDetailsSnapshots,
    bulkUpdateUserDetails,
    deleteUserDetailsById,
    bulkDeleteUserDetailsByIds,
    bulkDeleteUserDetailsByFilters,
    bulkDeleteUsers,
    bulkDeactivateUsers,
    bulkEnableUsers,

    // Employee Aggregate
    createEmployeeAggregate,
    getEmployeeAggregate,
    updateEmployeeAggregate,
    deleteEmployeeAggregate,

    // Employment History
    createEmploymentHistory,
    getEmploymentHistoryById,
    updateEmploymentHistory,
    refreshEmploymentHistory,
    bulkUpdateEmploymentHistory,
    deleteEmploymentHistoryById,
    bulkDeleteEmploymentHistoryByIds,
    bulkDeleteEmploymentHistoryByFilters,

    // Event History
    createEventHistory,
    getEventHistoryById,
    updateEventHistory,
    refreshEventHistory,
    bulkUpdateEventHistory,
    deleteEventHistoryById,
    bulkDeleteEventHistoryByIds,
    bulkDeleteEventHistoryByFilters,

    // General Details
    createGeneralDetails,
    getGeneralDetailsById,
    updateGeneralDetails,
    deleteGeneralDetails,

    // Job Details
    createJobDetails,
    getJobDetailsById,
    updateJobDetails,
    deleteJobDetails,

    // Snapshots
    getJobDetailsSnapshot,
    getGeneralDetailsSnapshot,

    // Banking Details
    createBankingDetails,
    getBankingDetailsById,
    updateBankingDetails,
    refreshBankingDetails,
    deleteBankingDetails,

    // Skills
    createSkill,
    getSkillById,
    updateSkill,
    refreshSkills,
    deleteSkill,

    // Documents
    createDocument,
    getDocumentById,
    updateDocument,
    refreshDocuments,
    deleteDocument,

    // Keycloak Users
    createKeycloakUser,
    getKeycloakUserById,
    updateKeycloakUser,
    deleteKeycloakUser,

    // Employee Types
    createEmployeeType,
    getEmployeeType,
    updateEmployeeType,
    refreshEmployeeTypes,
    deleteEmployeeType,
    bulkDeleteEmployeeTypes,

    // Departments
    createDepartment,
    getDepartment,
    updateDepartment,
    refreshDepartments,
    deleteDepartment,

    // Designations
    createDesignation,
    getDesignation,
    updateDesignation,
    refreshDesignations,
    deleteDesignation,

    // Work Locations
    createWorkLocation,
    getWorkLocation,
    updateWorkLocation,
    refreshWorkLocations,
    deleteWorkLocation,

    // Loading State
    isLoading,
  };

  return (
    <UserManagementContext.Provider value={contextValue}>
      {children}
    </UserManagementContext.Provider>
  );
}

/**
 * Hook to use User Management Context
 *
 * Usage:
 * const { createUserDetails, onboardUser, createEmploymentHistory, isLoading } = useUserManagement();
 */
export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error(
      "useUserManagement must be used within UserManagementProvider",
    );
  }
  return context;
}
