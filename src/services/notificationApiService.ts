/**
 * Notification API Service
 * Handles all API operations for notification management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/notifications - Create notification
 * - GET /emp-user-management/v1/notifications/{id} - Get notification by ID
 * - PATCH /emp-user-management/v1/notifications/{id} - Update notification
 * - POST /emp-user-management/v1/notifications/search - Search notifications
 * - DELETE /emp-user-management/v1/notifications/{id} - Delete notification
 * - DELETE /emp-user-management/v1/notifications/bulk-delete - Bulk delete notifications
 * - PATCH /emp-user-management/v1/notifications/bulk-update - Bulk update notifications
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { Notification, NotificationType, NotificationStatus } from "@/modules/notifications/notificationTypes";
import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/notifications";

/**
 * Notification Carrier - Input type for creation
 */
export interface NotificationCarrier<T = any> {
  id: string;
  type: NotificationType;
  subject: string;
  message: string;
  status: NotificationStatus;
  metadata: T;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Update payload - Map of field names to values
 */
export type NotificationUpdatePayload = Record<string, any>;

/**
 * Create Notification
 * POST /emp-user-management/v1/notifications
 * 
 * @param carrier - NotificationCarrier with notification information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Notification<T>>>
 */
export const apiCreateNotification = async <T = any>(
  carrier: NotificationCarrier<T>,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Notification<T>>> => {
  return apiRequest<Notification<T>>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get Notification by ID
 * GET /emp-user-management/v1/notifications/{id}
 * 
 * @param id - Notification ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Notification<T>>>
 */
export const apiGetNotificationById = async <T = any>(
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Notification<T>>> => {
  return apiRequest<Notification<T>>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Notification
 * PATCH /emp-user-management/v1/notifications/{id}
 * 
 * Partial update - only provided fields are updated
 * Common use case: Update status to 'read' or 'archived'
 * 
 * @param id - Notification ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Notification<T>>>
 */
export const apiUpdateNotification = async <T = any>(
  id: string,
  payload: NotificationUpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Notification<T>>> => {
  return apiRequest<Notification<T>>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search Notifications with pagination
 * POST /emp-user-management/v1/notifications/search
 * 
 * @param searchRequest - Search criteria and filters
 * @param page - Page number (0-based)
 * @param pageSize - Number of items per page
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<Pagination<Notification<T>>>>
 */
export const apiSearchNotifications = async <T = any>(
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Pagination<Notification<T>>>> => {
  return apiRequest<Pagination<Notification<T>>>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete Notification
 * DELETE /emp-user-management/v1/notifications/{id}
 * 
 * @param id - Notification ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteNotification = async (
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
 * Bulk Delete Notifications
 * DELETE /emp-user-management/v1/notifications/bulk-delete
 * 
 * @param ids - Array of notification IDs to delete
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkDeleteNotifications = async (
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
 * Bulk Update Notifications
 * PATCH /emp-user-management/v1/notifications/bulk-update
 * 
 * Common use case: Mark multiple notifications as read
 * 
 * @param ids - Array of notification IDs to update
 * @param updates - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiBulkUpdateNotifications = async (
  ids: string[],
  updates: NotificationUpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/bulk-update`,
    tenant,
    accessToken,
    body: { ids, updates },
  });
};

/**
 * Helper: Mark notification as read
 */
export const apiMarkNotificationAsRead = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Notification>> => {
  return apiUpdateNotification(id, { status: "read" }, tenant, accessToken);
};

/**
 * Helper: Mark notification as archived
 */
export const apiMarkNotificationAsArchived = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<Notification>> => {
  return apiUpdateNotification(id, { status: "archived" }, tenant, accessToken);
};

/**
 * Helper: Bulk mark notifications as read
 */
export const apiBulkMarkNotificationsAsRead = async (
  ids: string[],
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiBulkUpdateNotifications(ids, { status: "read" }, tenant, accessToken);
};

/**
 * Export all service functions as default object for easier importing
 */
export const notificationApiService = {
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
};
