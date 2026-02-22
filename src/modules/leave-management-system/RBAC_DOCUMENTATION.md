/**
 * Leave Management System - Role-Based Access Control
 * 
 * This document describes the roles and permissions for the Leave Management System (LMS)
 * based on JWT token resource roles from Keycloak.
 * 
 * ============================================================================
 * RESOURCE ROLES
 * ============================================================================
 * 
 * The system uses two main resources for leave management access:
 * 1. "leave-management-system" - Core leave management operations
 * 2. "employee-360" - Team/reportee management features
 * 
 * ============================================================================
 * 1. LEAVE-MANAGEMENT-SYSTEM RESOURCE ROLES
 * ============================================================================
 * 
 * Role: lmsv (Leave Management System Viewer)
 * ────────────────────────────────────────────────────
 * Description: Employee can view their own leave applications and credits
 * Permissions:
 *   ✓ View own leave applications
 *   ✓ View own credits
 *   ✓ View leave balances
 *   ✗ Cannot submit leave applications (requires lmss)
 *   ✗ Cannot approve/reject (requires lmsa)
 * Typical User: Regular Employee
 * 
 * Example JWT Payload:
 * {
 *   "resource_access": {
 *     "leave-management-system": {
 *       "roles": ["lmsv"]
 *     }
 *   }
 * }
 * 
 * 
 * Role: lmss (Leave Management System Submitter)
 * ────────────────────────────────────────────────────
 * Description: Employee can submit leave applications and request credits
 * Permissions:
 *   ✓ View own leave applications
 *   ✓ View own credits
 *   ✓ Submit new leave applications
 *   ✓ Request credits
 *   ✓ Cancel own pending applications/credits
 *   ✓ Access Settings (leave configuration management)
 *   ✗ Cannot approve/reject (requires lmsa)
 * Typical User: Regular Employee, Employee with full self-service access
 * 
 * Example JWT Payload:
 * {
 *   "resource_access": {
 *     "leave-management-system": {
 *       "roles": ["lmsv", "lmss"]
 *     }
 *   }
 * }
 * 
 * 
 * Role: lmsa (Leave Management System Approver)
 * ────────────────────────────────────────────────────
 * Description: Manager/HR can approve and reject team leave applications
 * Permissions:
 *   ✓ View own leave applications
 *   ✓ View own credits
 *   ✓ Submit own leave applications
 *   ✓ Access Settings
 *   ✓ Approve/Reject team leave applications (if lead role in employee-360)
 *   ✓ Approve/Reject team credits (if lead role in employee-360)
 * Typical User: Manager, HR Admin, Leave Approver
 * 
 * Example JWT Payload:
 * {
 *   "resource_access": {
 *     "leave-management-system": {
 *       "roles": ["lmsv", "lmss", "lmsa"]
 *     }
 *   }
 * }
 * 
 * 
 * ============================================================================
 * 2. EMPLOYEE-360 RESOURCE ROLES
 * ============================================================================
 * 
 * Role: lead (Team Lead/Manager)
 * ────────────────────────────────────────────────
 * Description: User has team members/reportees and can manage their applications
 * Permissions:
 *   ✓ View team leave applications (when combined with lmsv or lmsa)
 *   ✓ View team credits (when combined with lmsv or lmsa)
 *   ✓ Approve/Reject team applications (when combined with lmsa)
 *   ✓ Approve/Reject team credits (when combined with lmsa)
 *   ✓ View all team members' leaves
 * Typical User: Department Manager, Team Lead, Reporting Manager
 * 
 * Note: "lead" role REQUIRES additional roles in leave-management-system
 * for actual operations. The combination determines functionality.
 * 
 * Example JWT Payload (Manager with full permissions):
 * {
 *   "resource_access": {
 *     "leave-management-system": {
 *       "roles": ["lmsv", "lmss", "lmsa"]
 *     },
 *     "employee-360": {
 *       "roles": ["lead"]
 *     }
 *   }
 * }
 * 
 * 
 * ============================================================================
 * 3. PERMISSION MATRIX
 * ============================================================================
 * 
 * Operation Matrix:
 * ┌─────────────────────────┬──────────┬──────────┬──────────┬────────────┐
 * │ Feature                 │ lmsv     │ lmss     │ lmsa     │ + lead     │
 * ├─────────────────────────┼──────────┼──────────┼──────────┼────────────┤
 * │ View My Applications    │ ✓        │ ✓        │ ✓        │ ✓         │
 * │ Submit Applications     │ ✗        │ ✓        │ ✓        │ ✓         │
 * │ Cancel My Applications  │ ✗        │ ✓        │ ✓        │ ✓         │
 * │ View My Credits         │ ✓        │ ✓        │ ✓        │ ✓         │
 * │ Request Credits         │ ✗        │ ✓        │ ✓        │ ✓         │
 * │ Cancel My Credits       │ ✗        │ ✓        │ ✓        │ ✓         │
 * │ View Team Applications  │ ✗        │ ✗        │ ✗        │ ✓*        │
 * │ Approve Applications    │ ✗        │ ✗        │ ✗        │ ✓*        │
 * │ Reject Applications     │ ✗        │ ✗        │ ✗        │ ✓*        │
 * │ View Team Credits       │ ✗        │ ✗        │ ✗        │ ✓*        │
 * │ Approve Credits         │ ✗        │ ✗        │ ✗        │ ✓*        │
 * │ Reject Credits          │ ✗        │ ✗        │ ✗        │ ✓*        │
 * │ Access Settings         │ ✗        │ ✓        │ ✓        │ ✓         │
 * └─────────────────────────┴──────────┴──────────┴──────────┴────────────┘
 * 
 * * Requires "lead" role in employee-360 AND "lmsa" role in leave-management-system
 * 
 * 
 * ============================================================================
 * 4. PRACTICAL EXAMPLES
 * ============================================================================
 * 
 * EXAMPLE 1: Regular Employee
 * ────────────────────────────────────────────────────────────────────────
 * User: john.doe@company.com
 * Roles in JWT (leave-management-system): ["lmsv", "lmss"]
 * 
 * Permissions:
 *   ✓ Can view "My Applications" tab
 *   ✓ Can view "My Credits" tab
 *   ✓ Can submit new leave applications (Apply Leave button visible)
 *   ✓ Can request credits (Request Credits button visible)
 *   ✓ Can cancel pending applications/credits
 *   ✗ Cannot see "Team Applications" tab
 *   ✗ Cannot see "Team Credits" tab
 *   ✗ Cannot access Settings
 * 
 * 
 * EXAMPLE 2: Department Manager (Team Lead)
 * ────────────────────────────────────────────────────────────────────────
 * User: jane.smith@company.com
 * Roles in JWT:
 *   leave-management-system: ["lmsv", "lmss", "lmsa"]
 *   employee-360: ["lead"]
 * 
 * Permissions:
 *   ✓ Can view "My Applications" tab
 *   ✓ Can view "My Credits" tab
 *   ✓ Can submit own leave applications
 *   ✓ Can request own credits
 *   ✓ Can VIEW "Team Applications" tab (due to "lead" role)
 *   ✓ Can APPROVE/REJECT team applications (due to "lead" + "lmsa")
 *   ✓ Can VIEW "Team Credits" tab (due to "lead" role)
 *   ✓ Can APPROVE/REJECT team credits (due to "lead" + "lmsa")
 *   ✓ Can access Settings
 * 
 * User sees all 4 tabs: My Applications, Team Applications, My Credits, Team Credits
 * 
 * 
 * EXAMPLE 3: View-Only Manager (without approval rights)
 * ────────────────────────────────────────────────────────────────────────
 * User: manager.view@company.com
 * Roles in JWT:
 *   leave-management-system: ["lmsv"]
 *   employee-360: ["lead"]
 * 
 * Permissions:
 *   ✓ Can view "My Applications" tab
 *   ✓ Can view "My Credits" tab
 *   ✓ Can VIEW "Team Applications" tab (due to "lead" role)
 *   ✓ Can VIEW "Team Credits" tab (due to "lead" role)
 *   ✗ Cannot APPROVE/REJECT (requires "lmsa")
 *   ✗ Cannot submit or request credits (requires "lmss")
 *   ✗ Cannot access Settings
 * 
 * User sees all 4 tabs but in view-only mode for team tabs
 * 
 * 
 * EXAMPLE 4: HR Admin (Full Permissions)
 * ────────────────────────────────────────────────────────────────────────
 * User: hr.admin@company.com
 * Roles in JWT:
 *   leave-management-system: ["lmsv", "lmss", "lmsa"]
 *   employee-360: ["lead"]
 * 
 * Permissions:
 *   ✓ Full access to all tabs and features
 *   ✓ Can manage all leave configurations in Settings
 *   ✓ Can approve/reject all leave applications
 *   ✓ Can manage all credit requests
 * 
 * 
 * ============================================================================
 * 5. IMPLEMENTATION DETAILS
 * ============================================================================
 * 
 * The useLeavePermissions Hook:
 * ──────────────────────────────
 * 
 * Location: src/modules/leave-management-system/hooks/useLeavePermissions.ts
 * 
 * Usage:
 *   const { canViewMyApplications, canViewTeamApplications, isLead } = useLeavePermissions();
 * 
 * Returns:
 *   - canViewMyApplications: boolean
 *   - canSubmitApplications: boolean
 *   - canViewMyCredits: boolean
 *   - canRequestCredits: boolean
 *   - canViewTeamApplications: boolean (requires lead role)
 *   - canApproveLeave: boolean (requires lead + lmsa roles)
 *   - canRejectLeave: boolean (requires lead + lmsa roles)
 *   - canViewTeamCredits: boolean (requires lead role)
 *   - canApproveCredits: boolean (requires lead + lmsa roles)
 *   - canRejectCredits: boolean (requires lead + lmsa roles)
 *   - canAccessSettings: boolean
 *   - isLead: boolean
 *   - isApprover: boolean
 *   - hasLmsRole: boolean
 * 
 * 
 * ============================================================================
 * 6. TAB VISIBILITY LOGIC
 * ============================================================================
 * 
 * My Applications Tab:
 *   Shown when: canViewMyApplications = true
 *   Requires: lmsv, lmss, or lmsa role in leave-management-system
 * 
 * Team Applications Tab:
 *   Shown when: canViewTeamApplications = true
 *   Requires: lead role in employee-360 AND (lmsv, lmss, or lmsa role)
 * 
 * My Credits Tab:
 *   Shown when: canViewMyCredits = true
 *   Requires: lmsv, lmss, or lmsa role in leave-management-system
 * 
 * Team Credits Tab:
 *   Shown when: canViewTeamCredits = true
 *   Requires: lead role in employee-360 AND (lmsv, lmss, or lmsa role)
 * 
 * Settings Button:
 *   Shown when: canAccessSettings = true
 *   Requires: lmss or lmsa role in leave-management-system
 * 
 * Apply Leave Button:
 *   Shown when: canSubmitApplications = true
 *   Requires: lmss or lmsa role in leave-management-system
 * 
 * Request Credits Button:
 *   Shown when: canRequestCredits = true
 *   Requires: lmss or lmsa role in leave-management-system
 * 
 * 
 * ============================================================================
 * 7. BACKEND INTEGRATION
 * ============================================================================
 * 
 * The backend APIs already have role-based access control:
 * 
 * Personal Leave APIs (extract employeeId from JWT):
 *   - POST /emp-user-management/v1/self-service/leaves/apply
 *   - POST /emp-user-management/v1/self-service/leaves/applications
 *   - DELETE /emp-user-management/v1/self-service/leaves/applications/{id}
 * 
 * Personal Credits APIs (extract employeeId from JWT):
 *   - POST /emp-user-management/v1/self-service/credits
 *   - POST /emp-user-management/v1/self-service/credits/request
 *   - DELETE /emp-user-management/v1/self-service/credits/{id}
 * 
 * Team Leave APIs (for managers):
 *   - Need be defined by backend team
 * 
 * Team Credits APIs (for managers):
 *   - Need to be defined by backend team
 * 
 * Settings APIs (for admins):
 *   - Already exist in leave configuration endpoints
 * 
 * 
 * ============================================================================
 * 8. ACCESS DENIAL HANDLING
 * ============================================================================
 * 
 * If a user has no leave management role at all:
 * - They are redirected to home page
 * - Toast notification: "You do not have permission to access leave management."
 * 
 * If a tab is disabled due to permissions:
 * - The tab trigger is not shown
 * - The tab content is not rendered
 * - No error is shown (graceful degradation)
 * 
 * If a button is disabled due to permissions:
 * - Button is not rendered in the header
 * - User can still access features through other means if available
 * 
 * 
 * ============================================================================
 * 9. FUTURE ENHANCEMENTS
 * ============================================================================
 * 
 * Potential improvements:
 * 1. Add permission tooltips explaining why features are disabled
 * 2. Add breadcrumb indicating current permission level
 * 3. Add audit logging for all approved/rejected applications
 * 4. Add team organization view (see full team hierarchies)
 * 5. Add bulk operations for team leave management
 * 6. Add approval workflow history
 * 7. Support sub-delegations (delegate approval rights)
 * 
 */

// This is documentation - no code to export
