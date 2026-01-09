/**
 * Expense Management Types
 * Comprehensive type definitions for multi-level approval workflow
 */

// ==================== Enums ====================

export type ExpenseStatus = 
  | 'draft'           // Created but not submitted
  | 'submitted'       // Submitted, awaiting Level 1 approval
  | 'level1_approved' // Approved by Manager
  | 'level2_approved' // Approved by Business Management
  | 'level3_approved' // Approved by Finance (ready for payment)
  | 'paid'           // Payment confirmed
  | 'rejected'       // Rejected at any level
  | 'cancelled';     // Cancelled by employee

export type ExpenseCategory = 
  | 'travel'
  | 'accommodation'
  | 'meals'
  | 'transportation'
  | 'office_supplies'
  | 'equipment'
  | 'training'
  | 'client_entertainment'
  | 'software_licenses'
  | 'other';

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'cheque'
  | 'digital_wallet';

export type ApprovalLevel = 'level1' | 'level2' | 'level3';

export type ApprovalAction = 'approve' | 'reject' | 'return' | 'confirm_payment';

export type UserRole = 
  | 'employee'
  | 'manager'          // Level 1 approver
  | 'business_head'    // Level 2 approver
  | 'finance'          // Level 3 approver
  | 'admin';

// ==================== Core Interfaces ====================

// Individual expense line item within a claim
export interface ExpenseLineItem {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string; // ISO date string
  merchantName?: string;
  receiptNumber?: string;
  attachments: ExpenseAttachment[];
  notes?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g., "EXP-2024-001"
  
  // Employee details
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  
  // Claim header details
  claimTitle: string; // e.g., "Business trip to NYC"
  fromDate: string; // Start date of expense period
  toDate: string; // End date of expense period
  purpose: string; // Purpose/reason for expenses
  
  // Line items - multiple expenses in one claim
  lineItems: ExpenseLineItem[];
  
  // Calculated totals
  amount: number; // Total amount (sum of line items)
  currency: string;
  
  // Payment details
  paymentMethod: PaymentMethod;
  
  // Status and workflow
  status: ExpenseStatus;
  currentLevel: ApprovalLevel | null; // Current approval level
  
  // Approval history
  approvalHistory: ApprovalRecord[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
  
  // Additional metadata
  tags?: string[];
  notes?: string;
  isUrgent?: boolean;
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // mime type
  size: number; // bytes
  uploadedAt: string;
}

export interface ApprovalRecord {
  id: string;
  level: ApprovalLevel;
  action: ApprovalAction;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  comments?: string;
  timestamp: string;
  
  // For payment confirmation
  paymentDetails?: PaymentConfirmation;
}

export interface PaymentConfirmation {
  paymentDate: string;
  paymentReference: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  bankDetails?: string;
}

// ==================== Workflow Configuration ====================

export interface ApprovalLevelConfig {
  level: ApprovalLevel;
  name: string;
  description: string;
  requiredRoles: UserRole[];
  availableActions: ApprovalActionConfig[];
  autoApproveThreshold?: number; // Auto-approve if amount is below this
  notificationRecipients: string[]; // Email addresses or user IDs
}

export interface ApprovalActionConfig {
  action: ApprovalAction;
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  requiresComment?: boolean;
  requiresPaymentDetails?: boolean;
  nextStatus: ExpenseStatus;
  sideEffects: SideEffect[];
}

export interface SideEffect {
  type: 'notification' | 'email' | 'webhook' | 'status_change' | 'assign_next_level';
  target?: string;
  payload?: Record<string, any>;
}

// ==================== Filter and Search ====================

export interface ExpenseFilters {
  status?: ExpenseStatus[];
  category?: ExpenseCategory[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  employeeId?: string;
  department?: string;
  isUrgent?: boolean;
  currentLevel?: ApprovalLevel[];
}

export interface ExpenseStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

// ==================== Form Data ====================

export interface ExpenseFormData {
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  merchantName?: string;
  receiptNumber?: string;
  attachments?: File[];
  tags?: string[];
  notes?: string;
  isUrgent?: boolean;
}

export interface ApprovalFormData {
  action: ApprovalAction;
  comments?: string;
  paymentDetails?: PaymentConfirmation;
}

// ==================== View Models ====================

export interface ExpenseListItem extends Expense {
  // Additional computed fields for list view
  daysInReview: number;
  canEdit: boolean;
  canCancel: boolean;
  nextApproverName?: string;
}

export interface ApprovalDashboardData {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  averageApprovalTime: number; // in hours
  expenses: Expense[];
  stats: ExpenseStats;
}
