/**
 * Permission Matrix Utilities
 * Handles role-based access control based on Keycloak JWT token
 */

import { getStorageItem } from '@/store/localStorage';
import StorageKeys from '@/constants/storageConstants';

/**
 * Decoded JWT Token structure from Keycloak
 */
export interface DecodedToken {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string[];
  sub: string;
  typ: string;
  azp: string;
  sid: string;
  acr: string;
  'allowed-origins': string[];
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

/**
 * User Management Permission Roles
 */
export enum UserManagementRole {
  ALL = 'uma',              // All permissions (view + create + edit + delete + deactivate + enable + settings)
  VIEW = 'umv',             // View only
  EDIT = 'ume',             // Edit permission
  DELETE = 'umd',           // Delete permission
  CREATE = 'umc',           // Create permission (onboard employee)
  DEACTIVATE = 'umde',      // Deactivate users permission
  ENABLE = 'umen',          // Enable users permission
  SETTINGS = 'ums',         // Settings permission
}

/**
 * Decode JWT token (Base64 decode)
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as DecodedToken;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Get current token from storage
 */
export function getCurrentToken(): string | null {
  try {
    const session = getStorageItem<{ token: string }>(StorageKeys.SESSION);
    return session?.token || null;
  } catch (error) {
    console.error('Failed to get token from storage:', error);
    return null;
  }
}

/**
 * Get decoded token from storage
 */
export function getDecodedToken(): DecodedToken | null {
  const token = getCurrentToken();
  if (!token) return null;
  
  return decodeJWT(token);
}

/**
 * Get roles for a specific resource
 */
export function getResourceRoles(resourceName: string): string[] {
  const decodedToken = getDecodedToken();
  if (!decodedToken?.resource_access) return [];
  
  return decodedToken.resource_access[resourceName]?.roles || [];
}

/**
 * Check if user has a specific role for a resource
 */
export function hasResourceRole(resourceName: string, role: string): boolean {
  const roles = getResourceRoles(resourceName);
  return roles.includes(role);
}

/**
 * User Management Permission Checker
 */
export class UserManagementPermissions {
  private static readonly RESOURCE_NAME = 'user-management';
  
  /**
   * Check if user has ALL permissions (uma role)
   */
  static hasAllPermissions(): boolean {
    return hasResourceRole(this.RESOURCE_NAME, UserManagementRole.ALL);
  }
  
  /**
   * Check if user can view user details
   */
  static canView(): boolean {
    return (
      this.hasAllPermissions() ||
      hasResourceRole(this.RESOURCE_NAME, UserManagementRole.VIEW)
    );
  }
  
  /**
   * Check if user can create/onboard employees
   */
  static canCreate(): boolean {
    return (
      this.hasAllPermissions() ||
      hasResourceRole(this.RESOURCE_NAME, UserManagementRole.CREATE)
    );
  }
  
  /**
   * Check if user can edit users
   */
  static canEdit(): boolean {
    return (
      this.hasAllPermissions() ||
      hasResourceRole(this.RESOURCE_NAME, UserManagementRole.EDIT)
    );
  }
  
  /**
   * Check if user can delete users
   */
  static canDelete(): boolean {
    return (
      this.hasAllPermissions() ||
      hasResourceRole(this.RESOURCE_NAME, UserManagementRole.DELETE)
    );
  }
  
  /**
   * Check if user can deactivate users
   */
  static canDeactivate(): boolean {
    return (
      this.hasAllPermissions() ||
      hasResourceRole(this.RESOURCE_NAME, UserManagementRole.DEACTIVATE)
    );
  }
  
  /**
   * Check if user can enable users
   */
  static canEnable(): boolean {
    return (
      this.hasAllPermissions() ||
      hasResourceRole(this.RESOURCE_NAME, UserManagementRole.ENABLE)
    );
  }
  
  /**
   * Check if user can deactivate or enable users
   */
  static canDeactivateEnable(): boolean {
    return this.canDeactivate() || this.canEnable();
  }
  
  /**
   * Check if user can access settings
   */
  static canAccessSettings(): boolean {
    return (
      this.hasAllPermissions() ||
      hasResourceRole(this.RESOURCE_NAME, UserManagementRole.SETTINGS)
    );
  }
  
  /**
   * Get all user management roles
   */
  static getRoles(): string[] {
    return getResourceRoles(this.RESOURCE_NAME);
  }
  
  /**
   * Check if user has any user management access
   */
  static hasAnyAccess(): boolean {
    const roles = this.getRoles();
    return roles.length > 0;
  }
}

/**
 * React Hook for User Management Permissions
 */
export function useUserManagementPermissions() {
  return {
    canView: UserManagementPermissions.canView(),
    canCreate: UserManagementPermissions.canCreate(),
    canEdit: UserManagementPermissions.canEdit(),
    canDelete: UserManagementPermissions.canDelete(),
    canDeactivate: UserManagementPermissions.canDeactivate(),
    canEnable: UserManagementPermissions.canEnable(),
    canDeactivateEnable: UserManagementPermissions.canDeactivateEnable(),
    canAccessSettings: UserManagementPermissions.canAccessSettings(),
    hasAllPermissions: UserManagementPermissions.hasAllPermissions(),
    hasAnyAccess: UserManagementPermissions.hasAnyAccess(),
    roles: UserManagementPermissions.getRoles(),
  };
}
