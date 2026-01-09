/**
 * Approval Workflow Configuration
 * Configurable multi-level approval system with actions and side effects
 */

import {
  ApprovalLevelConfig,
  ApprovalActionConfig,
  ApprovalAction,
  ApprovalLevel,
  ExpenseStatus,
  UserRole,
} from '../types/expense.types';

// ==================== Action Configurations ====================

const approveAction: ApprovalActionConfig = {
  action: 'approve',
  label: 'Approve',
  variant: 'default',
  requiresComment: false,
  nextStatus: 'level1_approved', // Will be overridden per level
  sideEffects: [
    {
      type: 'notification',
      target: 'employee',
      payload: { message: 'Your expense has been approved' },
    },
    {
      type: 'assign_next_level',
    },
    {
      type: 'email',
      target: 'next_approver',
      payload: { template: 'expense_awaiting_approval' },
    },
  ],
};

const rejectAction: ApprovalActionConfig = {
  action: 'reject',
  label: 'Reject',
  variant: 'destructive',
  requiresComment: true,
  nextStatus: 'rejected',
  sideEffects: [
    {
      type: 'notification',
      target: 'employee',
      payload: { message: 'Your expense has been rejected' },
    },
    {
      type: 'email',
      target: 'employee',
      payload: { template: 'expense_rejected' },
    },
    {
      type: 'status_change',
      payload: { status: 'rejected' },
    },
  ],
};

const returnAction: ApprovalActionConfig = {
  action: 'return',
  label: 'Return for Clarification',
  variant: 'outline',
  requiresComment: true,
  nextStatus: 'submitted',
  sideEffects: [
    {
      type: 'notification',
      target: 'employee',
      payload: { message: 'Your expense needs clarification' },
    },
    {
      type: 'email',
      target: 'employee',
      payload: { template: 'expense_returned' },
    },
  ],
};

const confirmPaymentAction: ApprovalActionConfig = {
  action: 'confirm_payment',
  label: 'Confirm Payment',
  variant: 'default',
  requiresComment: false,
  requiresPaymentDetails: true,
  nextStatus: 'paid',
  sideEffects: [
    {
      type: 'notification',
      target: 'employee',
      payload: { message: 'Your expense has been paid' },
    },
    {
      type: 'email',
      target: 'employee',
      payload: { template: 'expense_paid' },
    },
    {
      type: 'status_change',
      payload: { status: 'paid' },
    },
    {
      type: 'webhook',
      target: 'accounting_system',
      payload: { action: 'record_payment' },
    },
  ],
};

// ==================== Level Configurations ====================

export const LEVEL1_CONFIG: ApprovalLevelConfig = {
  level: 'level1',
  name: 'Manager Approval',
  description: 'Direct manager reviews and approves expense claims',
  requiredRoles: ['manager', 'admin'],
  availableActions: [
    {
      ...approveAction,
      nextStatus: 'level1_approved',
    },
    rejectAction,
    returnAction,
  ],
  autoApproveThreshold: 1000,
  notificationRecipients: ['manager@company.com'],
};

export const LEVEL2_CONFIG: ApprovalLevelConfig = {
  level: 'level2',
  name: 'Business Management Approval',
  description: 'Business head reviews manager-approved expenses',
  requiredRoles: ['business_head', 'admin'],
  availableActions: [
    {
      ...approveAction,
      nextStatus: 'level2_approved',
    },
    rejectAction,
    returnAction,
  ],
  autoApproveThreshold: 5000,
  notificationRecipients: ['business-head@company.com'],
};

export const LEVEL3_CONFIG: ApprovalLevelConfig = {
  level: 'level3',
  name: 'Finance Approval & Payment',
  description: 'Finance team processes payment for approved expenses',
  requiredRoles: ['finance', 'admin'],
  availableActions: [
    confirmPaymentAction,
    rejectAction,
    returnAction,
  ],
  autoApproveThreshold: undefined, // Finance always reviews manually
  notificationRecipients: ['finance@company.com'],
};

// ==================== Workflow Configuration Map ====================

export const APPROVAL_WORKFLOW_CONFIG: Record<ApprovalLevel, ApprovalLevelConfig> = {
  level1: LEVEL1_CONFIG,
  level2: LEVEL2_CONFIG,
  level3: LEVEL3_CONFIG,
};

// ==================== Helper Functions ====================

/**
 * Get the next approval level after current level
 */
export function getNextLevel(currentLevel: ApprovalLevel): ApprovalLevel | null {
  const levels: ApprovalLevel[] = ['level1', 'level2', 'level3'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

/**
 * Get the previous approval level
 */
export function getPreviousLevel(currentLevel: ApprovalLevel): ApprovalLevel | null {
  const levels: ApprovalLevel[] = ['level1', 'level2', 'level3'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex > 0 ? levels[currentIndex - 1] : null;
}

/**
 * Determine the next status after an action
 */
export function getNextStatus(
  currentLevel: ApprovalLevel,
  action: ApprovalAction
): ExpenseStatus {
  const levelConfig = APPROVAL_WORKFLOW_CONFIG[currentLevel];
  const actionConfig = levelConfig.availableActions.find((a) => a.action === action);
  return actionConfig?.nextStatus || 'submitted';
}

/**
 * Check if a user has permission to perform an action at a level
 */
export function canPerformAction(
  userRole: UserRole,
  level: ApprovalLevel
): boolean {
  const levelConfig = APPROVAL_WORKFLOW_CONFIG[level];
  return levelConfig.requiredRoles.includes(userRole);
}

/**
 * Check if expense should be auto-approved based on amount
 */
export function shouldAutoApprove(
  level: ApprovalLevel,
  amount: number
): boolean {
  const levelConfig = APPROVAL_WORKFLOW_CONFIG[level];
  if (!levelConfig.autoApproveThreshold) return false;
  return amount <= levelConfig.autoApproveThreshold;
}

/**
 * Get all available actions for a user at a specific level
 */
export function getAvailableActions(
  userRole: UserRole,
  level: ApprovalLevel
): ApprovalActionConfig[] {
  if (!canPerformAction(userRole, level)) return [];
  return APPROVAL_WORKFLOW_CONFIG[level].availableActions;
}

/**
 * Execute side effects for an action
 */
export async function executeSideEffects(
  action: ApprovalActionConfig,
  expenseId: string
): Promise<void> {
  // In a real implementation, this would trigger actual side effects
  for (const effect of action.sideEffects) {
    console.log(`Executing side effect: ${effect.type}`, {
      expenseId,
      target: effect.target,
      payload: effect.payload,
    });
    
    // Simulate async operations
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
