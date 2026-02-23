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
  id: string; // Role identifier/key (e.g., "ADMIN", "USER")
  resourceId: string; // Reference to the Resource this role belongs to
  roleName: string; // Human-readable role name
  description?: string; // Optional description
}

// ============= UPDATE PAYLOAD TYPE =============

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;
