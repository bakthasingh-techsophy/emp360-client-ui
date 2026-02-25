/**
 * User Management Types
 * Types and interfaces for User Management system
 */

import { UserStatus } from './onboarding.types';

export type Department = 
  | 'Engineering'
  | 'Human Resources'
  | 'Finance'
  | 'Marketing'
  | 'Sales'
  | 'Operations'
  | 'IT'
  | 'Legal'
  | 'Administration';

export type UserRole =
  | 'super-admin'
  | 'it-admin'
  | 'chro'
  | 'hr-manager'
  | 'hr-executive'
  | 'recruiter'
  | 'lnd-admin'
  | 'payroll-specialist'
  | 'cxo'
  | 'department-head'
  | 'project-manager'
  | 'employee'
  | 'intern'
  | 'candidate'
  | 'finance-user'
  | 'compliance-user'
  | 'helpdesk-agent';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  designation: string;
  role: UserRole;
  status: UserStatus;
  joiningDate: string;
  lastActive: string;
  reportingTo?: string;
  location: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

/**
 * Carrier for assigning roles to multiple users for a specific resource/client
 * Used when assigning Keycloak roles to users in a resource
 */
export interface AssignRolesCarrier {
  userIds: string[];      // List of Keycloak user UUIDs
  resourceId: string;     // Resource/client ID (e.g., "user-management")
  roleIds: string[];      // List of role IDs to assign (e.g., ["UMA", "UME", "UMC"])
}

/**
 * UserResourceRoles - Represents roles assigned to a specific resource/client
 * Maps a resource (client) to its list of assigned role names
 */
export interface UserResourceRoles {
  roleIds: string[];      // List of role names assigned to this resource (e.g., ["uma", "ume", "umc"])
}

/**
 * UserRoles - Stores role assignments for a user across multiple resources/clients
 * Maps resources to their assigned roles in a hierarchical structure
 * 
 * Example structure:
 * {
 *   "id": "user-123",
 *   "rolesData": {
 *     "user-management": {
 *       "roleIds": ["uma", "ume", "umc"]
 *     },
 *     "leave-management-system": {
 *       "roleIds": ["lmss", "lmsv"]
 *     }
 *   },
 *   "createdAt": "2024-01-15T10:30:00Z",
 *   "updatedAt": "2024-01-20T15:45:00Z"
 * }
 */
export interface UserRoles {
  id: string;                                   // Unique identifier - typically the user ID or employee ID
  rolesData: Record<string, UserResourceRoles>; // Map of resource IDs to their assigned roles
  createdAt?: string;                           // ISO timestamp when the user roles were created
  updatedAt?: string;                           // ISO timestamp when the user roles were last updated
}
