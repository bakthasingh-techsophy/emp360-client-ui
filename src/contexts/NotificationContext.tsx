/**
 * Notification Management Context
 * Manages all notification operations with centralized API access
 *
 * Features:
 * - Notification CRUD operations
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

// Notification Service
import {
  apiCreateNotification,
  apiGetNotificationById,
  apiUpdateNotification,
  apiSearchNotifications,
  apiDeleteNotification,
  apiBulkDeleteNotifications,
  apiBulkUpdateNotifications,
  apiMarkNotificationAsRead,
  apiMarkNotificationAsArchived,
  apiBulkMarkNotificationsAsRead,
  NotificationCarrier,
  NotificationUpdatePayload,
} from "@/services/notificationApiService";

// Types
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { Notification } from "@/modules/notifications/notificationTypes";

/**
 * Notification Management Context Type Definition
 */
interface NotificationContextType {
  // Notification Methods
  createNotification: <T = any>(
    carrier: NotificationCarrier<T>
  ) => Promise<Notification<T> | null>;
  getNotificationById: <T = any>(id: string) => Promise<Notification<T> | null>;
  updateNotification: <T = any>(
    id: string,
    payload: NotificationUpdatePayload
  ) => Promise<Notification<T> | null>;
  refreshNotifications: <T = any>(
    searchRequest: UniversalSearchRequest,
    page?: number,
    pageSize?: number
  ) => Promise<Pagination<Notification<T>> | null>;
  deleteNotification: (id: string) => Promise<boolean>;
  bulkDeleteNotifications: (ids: string[]) => Promise<boolean>;
  bulkUpdateNotifications: (
    ids: string[],
    updates: NotificationUpdatePayload
  ) => Promise<boolean>;

  // Helper Methods
  markAsRead: (id: string) => Promise<Notification | null>;
  markAsArchived: (id: string) => Promise<Notification | null>;
  bulkMarkAsRead: (ids: string[]) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/**
 * Notification Management Provider Component
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
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
    defaultMessage: string
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
    returnOnSuccess: boolean = false
  ): Promise<T | boolean | null> => {
    if (!validateToken()) return returnOnSuccess ? false : null;

    const auth = resolveAuth();
    if (!auth.tenant || !auth.accessToken) {
      handleError(
        new Error("Missing auth"),
        "Error",
        "Authentication information is missing"
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
          response.message || `Failed to ${operationName}`
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

  // ==================== NOTIFICATION METHODS ====================

  const createNotification = async <T = any>(
    carrier: NotificationCarrier<T>
  ): Promise<Notification<T> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiCreateNotification(carrier, tenant, accessToken),
      "Create Notification",
      "Notification created successfully"
    ) as Promise<Notification<T> | null>;
  };

  const getNotificationById = async <T = any>(
    id: string
  ): Promise<Notification<T> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiGetNotificationById<T>(id, tenant, accessToken),
      "Fetch Notification",
      ""
    ) as Promise<Notification<T> | null>;
  };

  const updateNotification = async <T = any>(
    id: string,
    payload: NotificationUpdatePayload
  ): Promise<Notification<T> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiUpdateNotification<T>(id, payload, tenant, accessToken),
      "Update Notification",
      "Notification updated successfully"
    ) as Promise<Notification<T> | null>;
  };

  const refreshNotifications = async <T = any>(
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10
  ): Promise<Pagination<Notification<T>> | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiSearchNotifications<T>(
          searchRequest,
          page,
          pageSize,
          tenant,
          accessToken
        ),
      "Search Notifications",
      ""
    ) as Promise<Pagination<Notification<T>> | null>;
  };

  const deleteNotification = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) => apiDeleteNotification(id, tenant, accessToken),
      "Delete Notification",
      "Notification deleted successfully",
      true
    );
    return result as boolean;
  };

  const bulkDeleteNotifications = async (ids: string[]): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkDeleteNotifications(ids, tenant, accessToken),
      "Bulk Delete Notifications",
      `${ids.length} notification(s) deleted successfully`,
      true
    );
    return result as boolean;
  };

  const bulkUpdateNotifications = async (
    ids: string[],
    updates: NotificationUpdatePayload
  ): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkUpdateNotifications(ids, updates, tenant, accessToken),
      "Bulk Update Notifications",
      `${ids.length} notification(s) updated successfully`,
      true
    );
    return result as boolean;
  };

  // ==================== HELPER METHODS ====================

  const markAsRead = async (id: string): Promise<Notification | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiMarkNotificationAsRead(id, tenant, accessToken),
      "Mark as Read",
      ""
    ) as Promise<Notification | null>;
  };

  const markAsArchived = async (id: string): Promise<Notification | null> => {
    return executeApiCall(
      (tenant, accessToken) =>
        apiMarkNotificationAsArchived(id, tenant, accessToken),
      "Archive Notification",
      "Notification archived successfully"
    ) as Promise<Notification | null>;
  };

  const bulkMarkAsRead = async (ids: string[]): Promise<boolean> => {
    const result = await executeApiCall(
      (tenant, accessToken) =>
        apiBulkMarkNotificationsAsRead(ids, tenant, accessToken),
      "Mark Notifications as Read",
      `${ids.length} notification(s) marked as read`,
      true
    );
    return result as boolean;
  };

  // ==================== PROVIDER VALUE ====================

  const contextValue: NotificationContextType = {
    // Notification Methods
    createNotification,
    getNotificationById,
    updateNotification,
    refreshNotifications,
    deleteNotification,
    bulkDeleteNotifications,
    bulkUpdateNotifications,

    // Helper Methods
    markAsRead,
    markAsArchived,
    bulkMarkAsRead,

    // Loading State
    isLoading,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use Notification Management Context
 *
 * Usage:
 * const { createNotification, refreshNotifications, markAsRead, isLoading } = useNotification();
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within NotificationProvider"
    );
  }
  return context;
}
