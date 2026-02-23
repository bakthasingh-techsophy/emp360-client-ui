/**
 * Role Management Service
 * Handles all API operations for role management - clients, roles, and user role assignments
 * 
 * Endpoints:
 * - GET /emp-user-management/v1/roles/clients - Get all clients and their roles
 * - POST /emp-user-management/v1/roles/clients - Create a new client
 * - DELETE /emp-user-management/v1/roles/clients/{clientId} - Delete a client
 * - POST /emp-user-management/v1/roles/clients/{clientId}/roles - Add role to client
 * - DELETE /emp-user-management/v1/roles/clients/{clientId}/roles/{roleName} - Remove role from client
 * - POST /emp-user-management/v1/roles/users/assign - Assign roles to user
 * - POST /emp-user-management/v1/roles/users/remove - Remove roles from user
 * - GET /emp-user-management/v1/roles/users/{userId}/clients/{clientId}/roles - Get user client roles
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import {
  ClientsAndRolesResponse,
  CreateClientRequest,
  CreateRoleRequest,
  DeleteClientRequest,
  DeleteRoleRequest,
  UserClientRolesRequest,
  UserClientRolesInfo,
} from "@/modules/role-management/types";

const BASE_ENDPOINT = "/emp-user-management/v1/roles";

// ============= CLIENT MANAGEMENT =============

/**
 * Get All Clients and Their Roles
 * GET /emp-user-management/v1/roles/clients
 * 
 * Fetches all Keycloak clients and their associated roles for the given realm/tenant.
 * Requires UMA role.
 * 
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<ClientsAndRolesResponse>>
 * 
 * @example
 * const response = await apiGetClientsAndRoles('techsophy');
 */
export const apiGetClientsAndRoles = async (
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<ClientsAndRolesResponse>> => {
  return apiRequest<ClientsAndRolesResponse>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/clients`,
    tenant,
    accessToken,
  });
};

/**
 * Create a New Client
 * POST /emp-user-management/v1/roles/clients
 * 
 * Creates a new Keycloak client in the given tenant/realm.
 * Set confidential=true for backend clients with a client secret.
 * Requires UMA role.
 * 
 * @param request - CreateClientRequest with client details
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiCreateClient({
 *   clientId: 'my-app-client',
 *   name: 'My Application Client',
 *   description: 'Client for My Application',
 *   confidential: true
 * }, 'techsophy');
 */
export const apiCreateClient = async (
  request: CreateClientRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/clients`,
    tenant,
    accessToken,
    body: request,
  });
};

/**
 * Delete Client
 * DELETE /emp-user-management/v1/roles/clients/{clientId}
 * 
 * Deletes a Keycloak client by clientId from the given tenant/realm.
 * Requires UMA role.
 * 
 * @param request - DeleteClientRequest with client identifier
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteClient({
 *   clientId: 'my-app-client'
 * }, 'techsophy');
 */
export const apiDeleteClient = async (
  request: DeleteClientRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/clients/${request.clientId}`,
    tenant,
    accessToken,
  });
};

// ============= ROLE MANAGEMENT =============

/**
 * Add Role to Client
 * POST /emp-user-management/v1/roles/clients/{clientId}/roles
 * 
 * Adds a new role to an existing Keycloak client in the given tenant/realm.
 * Requires UMA role.
 * 
 * @param request - CreateRoleRequest with role details
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiCreateRole({
 *   clientId: 'my-app-client',
 *   roleName: 'MANAGER',
 *   description: 'Manager role with elevated access'
 * }, 'techsophy');
 */
export const apiCreateRole = async (
  request: CreateRoleRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/clients/${request.clientId}/roles`,
    tenant,
    accessToken,
    body: {
      roleName: request.roleName,
      description: request.description,
    },
  });
};

/**
 * Remove Role from Client
 * DELETE /emp-user-management/v1/roles/clients/{clientId}/roles/{roleName}
 * 
 * Removes a role from an existing Keycloak client in the given tenant/realm.
 * Requires UMA role.
 * 
 * @param request - DeleteRoleRequest with client and role identifiers
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 * 
 * @example
 * const response = await apiDeleteRole({
 *   clientId: 'my-app-client',
 *   roleName: 'MANAGER'
 * }, 'techsophy');
 */
export const apiDeleteRole = async (
  request: DeleteRoleRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/clients/${request.clientId}/roles/${request.roleName}`,
    tenant,
    accessToken,
  });
};

// ============= USER ROLE MANAGEMENT =============

/**
 * Assign Roles to User
 * POST /emp-user-management/v1/roles/users/assign
 * 
 * Assigns one or more client roles to a specific user.
 * Returns the full list of roles assigned to the user after the operation.
 * userId must be the Keycloak internal UUID.
 * Requires UMA role.
 * 
 * @param request - UserClientRolesRequest with user and role details
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserClientRolesInfo>>
 * 
 * @example
 * const response = await apiAssignRoles({
 *   userId: 'keycloak-user-uuid-123',
 *   clientId: 'my-app-client',
 *   roleNames: ['MANAGER', 'LEAD']
 * }, 'techsophy');
 */
export const apiAssignRoles = async (
  request: UserClientRolesRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserClientRolesInfo>> => {
  return apiRequest<UserClientRolesInfo>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/users/assign`,
    tenant,
    accessToken,
    body: request,
  });
};

/**
 * Remove Roles from User
 * POST /emp-user-management/v1/roles/users/remove
 * 
 * Removes one or more client roles from a specific user.
 * Returns the remaining roles assigned to the user after the operation.
 * Requires UMA role.
 * 
 * @param request - UserClientRolesRequest with user and role details to remove
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserClientRolesInfo>>
 * 
 * @example
 * const response = await apiRevokeRoles({
 *   userId: 'keycloak-user-uuid-123',
 *   clientId: 'my-app-client',
 *   roleNames: ['MANAGER']
 * }, 'techsophy');
 */
export const apiRevokeRoles = async (
  request: UserClientRolesRequest,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserClientRolesInfo>> => {
  return apiRequest<UserClientRolesInfo>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/users/remove`,
    tenant,
    accessToken,
    body: request,
  });
};

/**
 * Get User Client Roles
 * GET /emp-user-management/v1/roles/users/{userId}/clients/{clientId}/roles
 * 
 * Retrieves all client roles currently assigned to a specific user for a given client.
 * userId must be the Keycloak internal UUID.
 * Requires UMA role.
 * 
 * @param userId - User ID (Keycloak UUID)
 * @param clientId - Client ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<UserClientRolesInfo>>
 * 
 * @example
 * const response = await apiGetUserClientRoles('keycloak-user-uuid-123', 'my-app-client', 'techsophy');
 */
export const apiGetUserClientRoles = async (
  userId: string,
  clientId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<UserClientRolesInfo>> => {
  return apiRequest<UserClientRolesInfo>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/users/${userId}/clients/${clientId}/roles`,
    tenant,
    accessToken,
  });
};
