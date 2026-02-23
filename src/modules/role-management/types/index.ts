/**
 * Role Management Types
 * Defines types for Keycloak client and role management
 * Matches backend models: ClientRoleInfo, RealmClientsAndRoles, CreateClientCarrier, CreateRoleCarrier, UserClientRolesCarrier, UserClientRolesInfo
 */

/**
 * Keycloak Client with Roles
 * Corresponds to backend: ClientRoleInfo
 */
export interface KeycloakClient {
  id: string;
  clientId: string;
  name: string | null;
  description: string | null;
  enabled: boolean;
  roles: string[]; // List of role names (not objects)
}

/**
 * Realm Clients and Roles Response
 * Corresponds to backend: RealmClientsAndRoles
 */
export interface ClientsAndRolesResponse {
  realm: string;
  clientCount: number;
  clients: KeycloakClient[];
}

/**
 * Create Client Request
 * Corresponds to backend: CreateClientCarrier
 */
export interface CreateClientRequest {
  clientId: string;
  name: string;
  description?: string;
  confidential?: boolean;
}

/**
 * Create Role Request
 * Corresponds to backend: CreateRoleCarrier
 */
export interface CreateRoleRequest {
  clientId: string;
  roleName: string;
  description?: string;
}

/**
 * Delete Client Request
 */
export interface DeleteClientRequest {
  clientId: string;
}

/**
 * Delete Role Request
 */
export interface DeleteRoleRequest {
  clientId: string;
  roleName: string;
}

/**
 * User Client Roles Carrier
 * Corresponds to backend: UserClientRolesCarrier
 * Used for assigning and removing roles
 */
export interface UserClientRolesRequest {
  userId: string;
  clientId: string;
  roleNames: string[];
}

/**
 * User Client Roles Info
 * Corresponds to backend: UserClientRolesInfo
 */
export interface UserClientRolesInfo {
  userId: string;
  clientId: string;
  assignedRoles: string[];
}

// Legacy types for backward compatibility
export type RoleAssignment = UserClientRolesRequest;
export type UserWithRoles = UserClientRolesInfo;
