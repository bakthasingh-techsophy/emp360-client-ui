/**
 * Utility functions for RBAC, permissions, and visibility rules
 */

import {
  UserRole,
  PerformanceReviewRequest,
  TemplateColumn,
  RequestStatus,
  ColumnEditableBy,
} from "../types";

// ============= ROLE CHECKS =============
export const canEditTemplate = (role: UserRole): boolean => {
  return role === "HR";
};

export const canViewAllRequests = (role: UserRole): boolean => {
  return role === "HR";
};

export const canFreezeRequest = (role: UserRole): boolean => {
  return role === "HR";
};

export const canRevokeRequest = (role: UserRole): boolean => {
  return role === "HR";
};

export const canExport = (role: UserRole): boolean => {
  return role === "HR";
};

// ============= COLUMN VISIBILITY & EDITABILITY =============
/**
 * Determine if a column can be edited by the current user
 */
export const canEditColumn = (
  column: TemplateColumn,
  userRole: UserRole,
): boolean => {
  if (column.type === "CALCULATED") return false; // Calculated columns are never editable

  const roleMap: Record<UserRole, ColumnEditableBy> = {
    EMPLOYEE: "EMPLOYEE",
    REPORTING_MANAGER: "MANAGER",
    HR: "HR",
  };

  const userEditRole = roleMap[userRole];
  return column.editableBy.includes(userEditRole);
};

/**
 * Get visible columns for a user based on their role
 */
export const getVisibleColumns = (
  columns: TemplateColumn[],
  userRole: UserRole,
  requestStatus: RequestStatus,
): TemplateColumn[] => {
  if (userRole === "HR") {
    // HR can only see calculated columns and metadata (no cell values)
    return columns.filter((col) => col.type === "CALCULATED");
  }

  if (userRole === "EMPLOYEE") {
    // Employees cannot see MANAGER-only or HR-only columns
    return columns.filter(
      (col) =>
        !col.editableBy.includes("MANAGER") ||
        col.editableBy.includes("EMPLOYEE") ||
        col.editableBy.includes("ALL"),
    );
  }

  if (userRole === "REPORTING_MANAGER") {
    // Managers can see employee and their own columns, but check if request is still editable
    if (requestStatus === "AT_HR" || requestStatus === "FREEZED") {
      return []; // Manager cannot view when HR is reviewing or request is frozen
    }
    return columns;
  }

  return columns;
};

/**
 * Filter columns visible to a user (stricter version)
 */
export const getEditableColumnsForRole = (
  columns: TemplateColumn[],
  userRole: UserRole,
): TemplateColumn[] => {
  return columns.filter((col) => canEditColumn(col, userRole));
};

// ============= REQUEST STATUS LOGIC =============
/**
 * Determine if a request can be edited by the current user
 */
export const canEditRequest = (
  request: PerformanceReviewRequest,
  userRole: UserRole,
  currentUserId: string,
): boolean => {
  // Frozen and revoked requests have special handling
  if (request.status === "FREEZED") {
    // Only HR can revoke a frozen request
    return userRole === "HR";
  }

  if (request.status === "REVOKED") {
    // Revoked requests can be edited by employee and manager
    return userRole === "EMPLOYEE" || userRole === "REPORTING_MANAGER";
  }

  // Normal workflow checks
  if (request.status === "AT_EMPLOYEE") {
    return userRole === "EMPLOYEE" && request.employeeId === currentUserId;
  }

  if (request.status === "AT_MANAGER") {
    return (
      userRole === "REPORTING_MANAGER" && request.managerId === currentUserId
    );
  }

  if (request.status === "AT_HR") {
    return false; // HR cannot edit cell values
  }

  return false;
};

/**
 * Determine accessible request statuses for role transitions
 */
export const getAccessibleStatuses = (
  currentStatus: RequestStatus,
  userRole: UserRole,
): RequestStatus[] => {
  if (userRole === "HR") {
    if (currentStatus === "AT_HR") {
      return ["FREEZED", "REVOKED"];
    }
    return [];
  }

  if (userRole === "REPORTING_MANAGER") {
    if (currentStatus === "AT_MANAGER") {
      return ["AT_HR"];
    }
  }

  if (userRole === "EMPLOYEE") {
    if (currentStatus === "AT_EMPLOYEE") {
      return ["AT_MANAGER"];
    }
    if (currentStatus === "REVOKED") {
      return ["AT_MANAGER"];
    }
  }

  return [];
};

// ============= VISIBILITY RULES =============
/**
 * Privacy enforcement: HR cannot view cell values
 */
export const shouldMaskCellValues = (userRole: UserRole): boolean => {
  return userRole === "HR";
};

/**
 * Determine if final score should be visible
 */
export const canViewFinalScore = (
  request: PerformanceReviewRequest,
  userRole: UserRole,
  currentUserId: string,
): boolean => {
  if (userRole === "HR") return true;
  if (userRole === "EMPLOYEE" && request.employeeId === currentUserId)
    return true;
  if (userRole === "REPORTING_MANAGER" && request.managerId === currentUserId) {
    return request.status !== "AT_EMPLOYEE"; // Manager can only see score after employee submits
  }
  return false;
};

/**
 * Filter requests based on user role and permissions
 */
export const filterRequestsByRole = (
  requests: PerformanceReviewRequest[],
  userRole: UserRole,
  currentUserId: string,
): PerformanceReviewRequest[] => {
  if (userRole === "HR") {
    // HR can see all requests
    return requests;
  }

  if (userRole === "REPORTING_MANAGER") {
    // Manager can see:
    // 1. Their own requests as employee
    // 2. Their team's requests
    return requests.filter(
      (req) =>
        req.managerId === currentUserId || req.employeeId === currentUserId,
    );
  }

  if (userRole === "EMPLOYEE") {
    // Employee can only see their own requests
    return requests.filter((req) => req.employeeId === currentUserId);
  }

  return [];
};

// ============= WORKFLOW ACTIONS =============
/**
 * Determine available actions for a user on a request
 */
export interface AvailableActions {
  canEdit: boolean;
  canSaveDraft: boolean;
  canSubmit: boolean;
  canFreeze: boolean;
  canRevoke: boolean;
  canExport: boolean;
  canView: boolean;
}

export const getAvailableActions = (
  request: PerformanceReviewRequest,
  userRole: UserRole,
  currentUserId: string,
): AvailableActions => {
  const canEdit = canEditRequest(request, userRole, currentUserId);

  return {
    canEdit,
    canSaveDraft: canEdit,
    canSubmit:
      canEdit && getAccessibleStatuses(request.status, userRole).length > 0,
    canFreeze: userRole === "HR" && request.status === "AT_HR",
    canRevoke:
      userRole === "HR" &&
      (request.status === "AT_HR" || request.status === "FREEZED"),
    canExport: userRole === "HR",
    canView:
      userRole === "HR" ||
      (userRole === "EMPLOYEE" && request.employeeId === currentUserId) ||
      (userRole === "REPORTING_MANAGER" &&
        (request.managerId === currentUserId ||
          request.employeeId === currentUserId)),
  };
};

// ============= STATUS DISPLAY HELPERS =============
export const getStatusLabel = (status: RequestStatus): string => {
  const labels: Record<RequestStatus, string> = {
    AT_EMPLOYEE: "Pending Employee Review",
    AT_MANAGER: "Pending Manager Review",
    AT_HR: "Pending HR Review",
    FREEZED: "Review Completed",
    REVOKED: "Revoked for Re-review",
  };
  return labels[status];
};

export const getStatusColor = (status: RequestStatus): string => {
  const colors: Record<RequestStatus, string> = {
    AT_EMPLOYEE: "bg-blue-100 text-blue-800",
    AT_MANAGER: "bg-yellow-100 text-yellow-800",
    AT_HR: "bg-orange-100 text-orange-800",
    FREEZED: "bg-green-100 text-green-800",
    REVOKED: "bg-red-100 text-red-800",
  };
  return colors[status];
};
