/**
 * Self-Service Context
 * Manages self-service operations where employeeId is extracted from JWT token
 * 
 * Features:
 * - Self-Service Skill Management
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

// Self-Service API Service
import {
  apiCreateSkillSelfService,
  apiUpdateSkillSelfService,
  apiDeleteSkillSelfService,
  apiSearchSkillsSelfService,
  apiGetGeneralDetailsSnapshotSelfService,
  apiGetJobDetailsSnapshotSelfService,
} from "@/services/selfServiceService";

// Types
import {
  SkillItem,
  SkillItemCarrier,
  GeneralDetailsSnapshot,
  JobDetailsSnapshot,
} from "@/modules/user-management/types/onboarding.types";
import UniversalSearchRequest from "@/types/search";
import Pagination from "@/types/pagination";

/**
 * Generic update payload type
 */
export type UpdatePayload = Record<string, any>;

/**
 * Self-Service Context Type Definition
 */
interface SelfServiceContextType {
  // Skill Methods (Self-Service)
  createSkillSelfService: (
    carrier: Omit<SkillItemCarrier, 'employeeId'>,
  ) => Promise<SkillItem | null>;
  updateSkillSelfService: (
    id: string,
    payload: UpdatePayload,
  ) => Promise<SkillItem | null>;
  refreshSkillsSelfService: (
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number,
  ) => Promise<Pagination<SkillItem> | null>;
  deleteSkillSelfService: (id: string) => Promise<boolean>;

  // Snapshot Methods (Self-Service)
  getGeneralDetailsSelfService: () => Promise<GeneralDetailsSnapshot | null>;
  getJobDetailsSelfService: () => Promise<JobDetailsSnapshot | null>;

  // Loading State
  isLoading: boolean;
}

const SelfServiceContext = createContext<SelfServiceContextType | undefined>(
  undefined,
);

/**
 * Self-Service Provider Component
 */
export function SelfServiceProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check if token is still valid
   */
  const validateToken = (): boolean => {
    if (isTokenExpired()) {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });
      removeStorageItem(StorageKeys.USER);
      removeStorageItem(StorageKeys.SESSION);
      removeStorageItem(StorageKeys.TENANT);
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
    if (!validateToken()) return null;

    const auth = resolveAuth();
    if (!auth.tenant || !auth.accessToken) {
      handleError(
        null,
        "Authentication Error",
        "Unable to resolve authentication details",
      );
      return null;
    }

    setIsLoading(true);
    try {
      const result = await apiCall(auth.tenant, auth.accessToken);

      if (result?.success === false) {
        handleError(new Error(result?.message), operationName, "Operation failed");
        return null;
      }

      if (successMessage) {
        handleSuccess(successMessage);
      }

      return returnOnSuccess ? true : result?.data ?? null;
    } catch (error) {
      handleError(error, operationName, "An error occurred during the operation");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== SKILL METHODS (SELF-SERVICE) ====================

  const createSkillSelfService = async (
    carrier: Omit<SkillItemCarrier, 'employeeId'>,
  ): Promise<SkillItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateSkillSelfService(carrier, tenant, accessToken),
      "Create Skill",
      "Skill created successfully",
    ) as Promise<SkillItem | null>;
  };

  const updateSkillSelfService = async (
    id: string,
    payload: UpdatePayload,
  ): Promise<SkillItem | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateSkillSelfService(id, payload, tenant, accessToken),
      "Update Skill",
      "Skill updated successfully",
    ) as Promise<SkillItem | null>;
  };

  const refreshSkillsSelfService = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
  ): Promise<Pagination<SkillItem> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchSkillsSelfService(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken,
        ),
      "Refresh Skills",
      "",
    ) as Promise<Pagination<SkillItem> | null>;
  };

  const deleteSkillSelfService = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteSkillSelfService(id, tenant, accessToken),
      "Delete Skill",
      "Skill deleted successfully",
      true,
    );
    return result as boolean;
  };

  // ==================== SNAPSHOT METHODS (SELF-SERVICE) ====================

  const getGeneralDetailsSelfService = async (): Promise<GeneralDetailsSnapshot | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetGeneralDetailsSnapshotSelfService(tenant, accessToken),
      "Load General Details",
      "",
    ) as Promise<GeneralDetailsSnapshot | null>;
  };

  const getJobDetailsSelfService = async (): Promise<JobDetailsSnapshot | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetJobDetailsSnapshotSelfService(tenant, accessToken),
      "Load Job Details",
      "",
    ) as Promise<JobDetailsSnapshot | null>;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: SelfServiceContextType = {
    // Skill Methods
    createSkillSelfService,
    updateSkillSelfService,
    refreshSkillsSelfService,
    deleteSkillSelfService,

    // Snapshot Methods
    getGeneralDetailsSelfService,
    getJobDetailsSelfService,

    // Loading State
    isLoading,
  };

  return (
    <SelfServiceContext.Provider value={contextValue}>
      {children}
    </SelfServiceContext.Provider>
  );
}

/**
 * Hook to use Self-Service Context
 *
 * Usage:
 * const { createSkillSelfService, updateSkillSelfService, deleteSkillSelfService } = useSelfService();
 */
export function useSelfService() {
  const context = useContext(SelfServiceContext);
  if (!context) {
    throw new Error("useSelfService must be used within SelfServiceProvider");
  }
  return context;
}
