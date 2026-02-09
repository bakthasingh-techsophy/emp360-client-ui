/**
 * Policy Management Context
 * Manages all policy and policy version operations with centralized API access
 *
 * Features:
 * - Policy CRUD operations
 * - Policy Version CRUD operations
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
import { useLayoutContext } from "@/contexts/LayoutContext";

// Policy Service
import {
  apiCreatePolicy,
  apiGetPolicyById,
  apiUpdatePolicy,
  apiSearchPolicies,
  apiDeletePolicyById,
  apiBulkDeletePolicies,
  apiBulkUpdatePolicies,
} from "@/services/policyService";

// Policy Version Service
import {
  apiCreatePolicyVersion,
  apiGetPolicyVersionById,
  apiUpdatePolicyVersion,
  apiSearchPolicyVersions,
  apiDeletePolicyVersionById,
  apiBulkDeletePolicyVersions,
  apiBulkUpdatePolicyVersions,
} from "@/services/policyVersionService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import {
  Policy,
  PolicyCarrier,
  PolicyVersion,
  PolicyVersionCarrier,
} from "@/modules/policy-documents/types";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * Policy Management Context Type Definition
 */
interface PolicyContextType {
  // Policy Methods
  createPolicy: (carrier: PolicyCarrier) => Promise<Policy | null>;
  getPolicyById: (id: string) => Promise<Policy | null>;
  updatePolicy: (id: string, payload: UpdatePayload) => Promise<Policy | null>;
  refreshPolicies: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<Policy> | null>;
  deletePolicyById: (id: string) => Promise<boolean>;
  bulkDeletePolicies: (ids: string[]) => Promise<boolean>;
  bulkUpdatePolicies: (
    ids: string[],
    updates: UpdatePayload,
  ) => Promise<boolean>;

  // Policy Version Methods
  createPolicyVersion: (
    carrier: PolicyVersionCarrier,
  ) => Promise<PolicyVersion | null>;
  getPolicyVersionById: (id: string) => Promise<PolicyVersion | null>;
  updatePolicyVersion: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<PolicyVersion | null>;
  refreshPolicyVersions: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<PolicyVersion> | null>;
  deletePolicyVersionById: (id: string) => Promise<boolean>;
  bulkDeletePolicyVersions: (ids: string[]) => Promise<boolean>;
  bulkUpdatePolicyVersions: (
    ids: string[],
    updates: UpdatePayload,
  ) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

/**
 * Policy Management Provider Component
 */
export function PolicyProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { selectedCompanyScope } = useLayoutContext();
  const [isLoading, setIsLoading] = useState(false);

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

  // ==================== POLICY METHODS ====================

  const createPolicy = async (
    carrier: PolicyCarrier,
  ): Promise<Policy | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiCreatePolicy(carrier, tenant, accessToken),
      "Create Policy",
      "Policy created successfully",
    ) as Promise<Policy | null>;
  };

  const getPolicyById = async (id: string): Promise<Policy | null> => {
    return executeApiCall(
      (tenant, accessToken) => apiGetPolicyById(id, tenant, accessToken),
      "Fetch Policy",
      "",
    ) as Promise<Policy | null>;
  };

  const updatePolicy = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<Policy | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdatePolicy(id, payload, tenant, accessToken),
      "Update Policy",
      "Policy updated successfully",
    ) as Promise<Policy | null>;
  };

  const refreshPolicies = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<Policy> | null> => {
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
        apiSearchPolicies(enhancedSearchRequest, page, pageSize, tenant, accessToken),
      "Search Policies",
      "",
    ) as Promise<Pagination<Policy> | null>;
  };

  const deletePolicyById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeletePolicyById(id, tenant, accessToken),
      "Delete Policy",
      "Policy deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeletePolicies = async (ids: string[]): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiBulkDeletePolicies(ids, tenant, accessToken),
      "Bulk Delete Policies",
      `${ids.length} policy(ies) deleted successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkUpdatePolicies = async (
    ids: string[],
    updates: UpdatePayload,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdatePolicies(ids, updates, tenant, accessToken),
      "Bulk Update Policies",
      `${ids.length} policy(ies) updated successfully`,
      true,
    );
    return result as boolean;
  };

  // ==================== POLICY VERSION METHODS ====================

  const createPolicyVersion = async (
    carrier: PolicyVersionCarrier,
  ): Promise<PolicyVersion | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreatePolicyVersion(carrier, tenant, accessToken),
      "Create Policy Version",
      "Policy version created successfully",
    ) as Promise<PolicyVersion | null>;
  };

  const getPolicyVersionById = async (
    id: string,
  ): Promise<PolicyVersion | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetPolicyVersionById(id, tenant, accessToken),
      "Fetch Policy Version",
      "",
    ) as Promise<PolicyVersion | null>;
  };

  const updatePolicyVersion = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<PolicyVersion | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdatePolicyVersion(id, payload, tenant, accessToken),
      "Update Policy Version",
      "Policy version updated successfully",
    ) as Promise<PolicyVersion | null>;
  };

  const refreshPolicyVersions = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<PolicyVersion> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchPolicyVersions(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Search Policy Versions",
      "",
    ) as Promise<Pagination<PolicyVersion> | null>;
  };

  const deletePolicyVersionById = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiDeletePolicyVersionById(id, tenant, accessToken),
      "Delete Policy Version",
      "Policy version deleted successfully",
      true,
    );
    return result as boolean;
  };

  const bulkDeletePolicyVersions = async (ids: string[]): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeletePolicyVersions(ids, tenant, accessToken),
      "Bulk Delete Policy Versions",
      `${ids.length} version(s) deleted successfully`,
      true,
    );
    return result as boolean;
  };

  const bulkUpdatePolicyVersions = async (
    ids: string[],
    updates: UpdatePayload,
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdatePolicyVersions(ids, updates, tenant, accessToken),
      "Bulk Update Policy Versions",
      `${ids.length} version(s) updated successfully`,
      true,
    );
    return result as boolean;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: PolicyContextType = {
    // Policy Methods
    createPolicy,
    getPolicyById,
    updatePolicy,
    refreshPolicies,
    deletePolicyById,
    bulkDeletePolicies,
    bulkUpdatePolicies,

    // Policy Version Methods
    createPolicyVersion,
    getPolicyVersionById,
    updatePolicyVersion,
    refreshPolicyVersions,
    deletePolicyVersionById,
    bulkDeletePolicyVersions,
    bulkUpdatePolicyVersions,

    // Loading State
    isLoading,
  };

  return (
    <PolicyContext.Provider value={contextValue}>
      {children}
    </PolicyContext.Provider>
  );
}

/**
 * Hook to use Policy Management Context
 *
 * Usage:
 * const { createPolicy, refreshPolicies, createPolicyVersion, isLoading } = usePolicy();
 */
export function usePolicy() {
  const context = useContext(PolicyContext);
  if (!context) {
    throw new Error("usePolicy must be used within PolicyProvider");
  }
  return context;
}
