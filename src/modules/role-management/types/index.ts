/**
 * Role Management Types
 * Defines types for the new role management system: Resources, Roles Lists, and Roles Config
 */

// ============= RESOURCE TYPES =============

/**
 * Resource Model
 * Represents a top-level resource that has roles assigned to it
 */
export interface Resource {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resource Carrier
 * Used for creating or updating resources
 */
export interface ResourceCarrier {
  id: string;
  name: string;
  description?: string;
  loadFromKeycloak: boolean;
}

// ============= DELETE CARRIERS =============

/**
 * Delete Resource Carrier
 * Used for deleting resources with option to delete from Keycloak
 */
export interface DeleteResourceCarrier {
  resourceId: string;
  deleteFromKeycloak: boolean;
}

/**
 * Delete Role Carrier
 * Used for deleting roles with option to delete from Keycloak
 */
export interface DeleteRoleCarrier {
  roleId: string;
  deleteFromKeycloak: boolean;
}

// ============= ROLE MODEL TYPES =============

/**
 * RoleModel / RolesList Item
 * Represents a role associated with a resource
 */
export interface RoleModel {
  id: string; // Role identifier (e.g., "ADMIN", "USER")
  resourceId: string; // Reference to the Resource this role belongs to
  roleName: string; // Human-readable role name
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * RoleModel Carrier
 * Used for creating or updating roles
 * Maps to backend RoleModelCarrier
 */
export interface RoleModelCarrier {
  id?: string; // Role identifier/key (e.g., "ADMIN", "USER")
  resourceId: string; // Reference to the Resource this role belongs to
  roleName: string; // Human-readable role name
  description?: string; // Optional description
  loadFromKeycloak: boolean;
}

// ============= UPDATE PAYLOAD TYPE =============

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;
