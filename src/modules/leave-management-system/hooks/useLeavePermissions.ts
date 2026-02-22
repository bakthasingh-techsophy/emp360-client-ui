/**
 * useLeavePermissions Hook
 * Provides role-based access control for leave management features
 * 
 * Resource Roles:
 * leave-management-system:
 *   - lmsv: Viewer - Can view own leave applications
 *   - lmss: Submitter - Can submit leave applications and requests
 *   - lmsa: Approver - Can approve/reject team leave applications
 * 
 * employee-360:
 *   - lead: Has reportees/team members, can view and manage team leave
 */

import { useAuth } from "@/contexts/AuthContext";

interface LeavePermissions {
  // Personal leave access
  canViewMyApplications: boolean;
  canSubmitApplications: boolean;
  
  // Personal credits access
  canViewMyCredits: boolean;
  canRequestCredits: boolean;
  
  // Team leave access (if user is a lead/manager)
  canViewTeamApplications: boolean;
  canApproveLeave: boolean;
  canRejectLeave: boolean;
  
  // Team credits access (if user is a lead/manager)
  canViewTeamCredits: boolean;
  canApproveCredits: boolean;
  canRejectCredits: boolean;
  
  // Settings access
  canAccessSettings: boolean;
  
  // Helper methods
  isLead: boolean;
  isApprover: boolean;
  hasLmsRole: boolean;
}

/**
 * Hook to check leave management permissions based on JWT token roles
 * 
 * @returns LeavePermissions object with permission checks
 * 
 * @example
 * const { canViewMyApplications, canViewTeamApplications, isLead } = useLeavePermissions();
 */
export function useLeavePermissions(): LeavePermissions {
  const auth = useAuth();

  // Check leave-management-system roles
  const isViewer = auth.hasResourceRole("leave-management-system", "lmsv");
  const isSubmitter = auth.hasResourceRole("leave-management-system", "lmss");
  const isApprover = auth.hasResourceRole("leave-management-system", "lmsa");
  const hasLmsRole = auth.hasResourceAccess("leave-management-system");

  // Check employee-360 roles
  const isLead = auth.hasResourceRole("employee-360", "lead");

  return {
    // Personal leave access
    canViewMyApplications: isViewer || isApprover || hasLmsRole,
    canSubmitApplications: isSubmitter || hasLmsRole,
    
    // Personal credits access
    canViewMyCredits: isViewer || isApprover || hasLmsRole,
    canRequestCredits: isSubmitter || hasLmsRole,
    
    // Team leave access (requires lead role in employee-360)
    canViewTeamApplications: isLead && (isViewer || isApprover || hasLmsRole),
    canApproveLeave: isLead && isApprover,
    canRejectLeave: isLead && isApprover,
    
    // Team credits access (requires lead role in employee-360)
    canViewTeamCredits: isLead && (isViewer || isApprover || hasLmsRole),
    canApproveCredits: isLead && isApprover,
    canRejectCredits: isLead && isApprover,
    
    // Settings access (only for submitter/admin)
    canAccessSettings: isSubmitter || isApprover,
    
    // Helper flags
    isLead,
    isApprover,
    hasLmsRole,
  };
}
