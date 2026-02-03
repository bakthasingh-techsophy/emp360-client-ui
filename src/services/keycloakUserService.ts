/**
 * Keycloak User Service
 * Handles all API operations for Keycloak user management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/keycloak-users - Create Keycloak user
 * - GET /emp-user-management/v1/keycloak-users/{id} - Get Keycloak user by ID
 * - PATCH /emp-user-management/v1/keycloak-users/{id} - Update Keycloak user
 * - DELETE /emp-user-management/v1/keycloak-users/{id} - Delete Keycloak user
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";

const BASE_ENDPOINT = "/emp-user-management/v1/keycloak-users";

/**
 * Keycloak User Item
 * Identity and access management user record
 */
export interface KeycloakUserItem {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Keycloak User
 * POST /emp-user-management/v1/keycloak-users
 * 
 * Creates a new Keycloak user for identity and access management
 * 
 * @param item - KeycloakUserItem with user information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<KeycloakUserItem>>
 */
export const apiCreateKeycloakUser = async (
  item: KeycloakUserItem,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<KeycloakUserItem>> => {
  return apiRequest<KeycloakUserItem>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: item,
  });
};

/**
 * Get Keycloak User by ID
 * GET /emp-user-management/v1/keycloak-users/{id}
 * 
 * @param id - Keycloak user ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<KeycloakUserItem>>
 */
export const apiGetKeycloakUserById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<KeycloakUserItem>> => {
  return apiRequest<KeycloakUserItem>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Keycloak User
 * PATCH /emp-user-management/v1/keycloak-users/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Keycloak user ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<KeycloakUserItem>>
 */
export const apiUpdateKeycloakUser = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<KeycloakUserItem>> => {
  return apiRequest<KeycloakUserItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Keycloak User
 * DELETE /emp-user-management/v1/keycloak-users/{id}
 * 
 * @param id - Keycloak user ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteKeycloakUser = async (
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
 * Export all service functions as default object for easier importing
 */
export const keycloakUserService = {
  apiCreateKeycloakUser,
  apiGetKeycloakUserById,
  apiUpdateKeycloakUser,
  apiDeleteKeycloakUser,
};
