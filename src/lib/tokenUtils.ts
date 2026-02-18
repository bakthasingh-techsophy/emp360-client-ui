/**
 * JWT Token Utility Functions
 * Handles parsing and extracting data from JWT tokens
 */

/**
 * Decode JWT token without verification (client-side only)
 * @param token JWT token string
 * @returns Decoded payload object or null if invalid
 */
export function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Extract resource_access from JWT token payload
 * @param token JWT token string
 * @returns resource_access object or empty object if not found
 */
export function getResourceAccess(token: string) {
  const decoded = decodeJWT(token);
  return decoded?.resource_access || {};
}

/**
 * Get roles for a specific resource/client
 * @param token JWT token string
 * @param resource Resource/client name (e.g., 'user-management', 'account')
 * @returns Array of roles for the resource, or empty array if resource not found
 */
export function getResourceRoles(token: string, resource: string): string[] {
  const resourceAccess = getResourceAccess(token);
  return resourceAccess[resource]?.roles || [];
}

/**
 * Check if user has access to a specific resource
 * @param token JWT token string
 * @param resource Resource/client name (e.g., 'user-management')
 * @returns true if resource exists in resource_access, false otherwise
 */
export function hasResourceAccess(token: string, resource: string): boolean {
  const resourceAccess = getResourceAccess(token);
  const hasAccess = !!resourceAccess[resource];
  
  // Debug logging
  if (!hasAccess) {
    console.warn(`[hasResourceAccess] Access denied for resource: ${resource}`, {
      requestedResource: resource,
      availableResources: Object.keys(resourceAccess),
      resourceAccess: resourceAccess
    });
  }
  
  return hasAccess;
}

/**
 * Check if user has a specific role in a resource
 * @param token JWT token string
 * @param resource Resource/client name
 * @param role Role name to check
 * @returns true if user has the role in the resource
 */
export function hasResourceRole(
  token: string,
  resource: string,
  role: string
): boolean {
  const roles = getResourceRoles(token, resource);
  return roles.includes(role);
}

/**
 * Get all available resources for the user
 * @param token JWT token string
 * @returns Array of resource names
 */
export function getAvailableResources(token: string): string[] {
  const resourceAccess = getResourceAccess(token);
  return Object.keys(resourceAccess);
}

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns true if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get token expiry time
 * @param token JWT token string
 * @returns expiry timestamp in milliseconds, or null if not found
 */
export function getTokenExpiry(token: string): number | null {
  const decoded = decodeJWT(token);
  return decoded?.exp ? decoded.exp * 1000 : null;
}

/**
 * Get user info from token
 * @param token JWT token string
 * @returns User info object with name, email, preferred_username
 */
export function getUserInfoFromToken(token: string) {
  const decoded = decodeJWT(token);
  return {
    id: decoded?.sub,
    name: decoded?.name,
    email: decoded?.email,
    username: decoded?.preferred_username,
    givenName: decoded?.given_name,
    familyName: decoded?.family_name,
  };
}
