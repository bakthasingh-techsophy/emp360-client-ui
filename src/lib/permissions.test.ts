/**
 * Permission Matrix Testing Guide
 * 
 * This file contains test tokens and examples for testing the permission system
 */

// Example: How to test different permission scenarios
// After login, the JWT token is stored in localStorage under SESSION key

/**
 * Test Case 1: User with ALL permissions (uma role)
 * This user should see everything: Settings, Onboard Employee, Edit, Delete buttons
 * Token should contain: "resource_access": { "user-management": { "roles": ["uma"] } }
 */

/**
 * Test Case 2: User with VIEW ONLY permission (umv role)
 * This user should only see the eye icon (view modal)
 * No Settings, No Onboard Employee, No Edit, No Delete
 * Token should contain: "resource_access": { "user-management": { "roles": ["umv"] } }
 */

/**
 * Test Case 3: User with VIEW + EDIT permissions (umv + ume roles)
 * This user should see: View icon, Edit button
 * No Settings, No Onboard Employee, No Delete
 * Token should contain: "resource_access": { "user-management": { "roles": ["umv", "ume"] } }
 */

/**
 * Test Case 4: User with CREATE permission (umc role)
 * This user should see: Onboard Employee button
 * Token should contain: "resource_access": { "user-management": { "roles": ["umc"] } }
 */

/**
 * Test Case 5: User with DELETE permission (umd role)
 * This user should see: Delete option in dropdown menu
 * Token should contain: "resource_access": { "user-management": { "roles": ["umd"] } }
 */

/**
 * Test Case 6: User with SETTINGS permission (ums role)
 * This user should see: Settings button in the header
 * Token should contain: "resource_access": { "user-management": { "roles": ["ums"] } }
 */

/**
 * Test Case 7: User with multiple specific permissions (umv + ume + umd)
 * This user should see: View, Edit, Delete
 * No Settings, No Onboard Employee
 * Token should contain: "resource_access": { "user-management": { "roles": ["umv", "ume", "umd"] } }
 */

/**
 * Test Case 8: User with NO permissions
 * This user should see: "Access Restricted" message
 * Token should NOT contain user-management in resource_access
 */

/**
 * How to test:
 * 1. Log in with a user that has specific roles in Keycloak
 * 2. The JWT token will be decoded automatically
 * 3. Check browser console for permission debugging - search for "UserManagementPermissions"
 * 4. Verify UI elements appear/disappear based on roles
 * 
 * To manually inspect the token:
 * - Open browser DevTools > Application > Local Storage
 * - Find the "SESSION" key (it's encrypted)
 * - Or check the Network tab during login to see the raw JWT token
 */

export default {};
