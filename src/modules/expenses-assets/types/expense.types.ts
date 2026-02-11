/**
 * Expense Management Types
 * Comprehensive type definitions for multi-level approval workflow
 * Updated to match backend models
 */

// ==================== Enums ====================

export type ExpenseType = "expense" | "advance";

export type ExpenseStatus =
  | "draft" // Created but not submitted
  | "pending" // Submitted, awaiting approval
  | "approved" // Fully approved (ready for payment)
  | "paid" // Payment confirmed
  | "rejected" // Rejected at any level
  | "cancelled"; // Cancelled by employee

export type ExpenseCategory =
  | "travel"
  | "accommodation"
  | "meals"
  | "transportation"
  | "office_supplies"
  | "equipment"
  | "training"
  | "client_entertainment"
  | "software_licenses"
  | "other";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "cheque"
  | "digital_wallet";

export type ApprovalAction =
  | "approve"
  | "reject"
  | "return"
  | "confirm_payment";

export type UserRole =
  | "employee"
  | "manager" // Level 1 approver
  | "business_head" // Level 2 approver
  | "finance" // Level 3 approver
  | "admin";

// ==================== Core Interfaces ====================

// Individual expense line item within a claim
export interface ExpenseLineItem {
  id: string;
  category: string; // ExpenseCategory enum value
  description: string;
  amount: number;
  fromDate: string; // ISO date string - start date of expense
  toDate: string; // ISO date string - end date of expense
  attachments: ExpenseAttachment[];
  notes?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g., "EXP-2024-001"

  // Type of claim
  type: string; // ExpenseType enum value

  // Employee details
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;

  // Raised by details (for claims raised on behalf)
  raisedById?: string;
  raisedByFirstName?: string;
  raisedByLastName?: string;

  // Temporary person details (if applicable)
  isTemporaryPerson?: boolean;
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;

  // Claim details
  description: string; // Main description/purpose

  // Line items - multiple expenses in one claim (IDs only)
  lineItemIds?: string[];

  // Calculated totals
  amount: number; // Total amount (sum of line items or advance amount)

  // Status and workflow
  status: string; // ExpenseStatus enum value
  currentApprovalLevel?: number; // Numeric approval level (1, 2, 3)

  // Approval history (IDs only)
  approvalHistoryIds?: string[];

  // Payment confirmation (ID only)
  paymentConfirmationId?: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;
  paidAt?: string;
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // mime type
  size: number; // bytes
  uploadedAt?: string;
}

export interface ApprovalRecord {
  id: string;
  approvalLevel: number; // 1, 2, or 3
  approverUserId: string;
  approverName: string;
  approverEmail: string;
  action: string; // ApprovalAction enum value
  comments?: string;
  actionDate: string;
  approverRole: string; // UserRole enum value
}

export interface PaymentConfirmation {
  id?: string;
  paymentDate: string;
  paymentReference: string;
  paymentMethod: string; // PaymentMethod enum value
  transactionId?: string;
  bankDetails?: string;
}

// ==================== Carrier Types for API ====================

// Carrier for creating/updating expenses
export interface ExpenseCarrier {
  type: string; // ExpenseType enum value
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  raisedById?: string;
  raisedByFirstName?: string;
  raisedByLastName?: string;
  isTemporaryPerson?: boolean;
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;
  description: string;
  lineItemIds?: string[];
  status: string; // ExpenseStatus enum value
  currentApprovalLevel?: number;
  approvalHistoryIds?: string[];
  paymentConfirmationId?: string;
  createdAt: string; // ISO date string
}

// Carrier for expense line items
export interface ExpenseLineItemCarrier {
  id: string;
  category: string; // ExpenseCategory enum value
  description: string;
  amount: number;
  fromDate: string; // ISO date string
  toDate: string; // ISO date string
  attachments?: ExpenseAttachmentCarrier[];
  notes?: string;
  createdAt: string;
}

// Carrier for expense attachments
export interface ExpenseAttachmentCarrier {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Carrier for payment confirmation
export interface PaymentConfirmationCarrier {
  id?: string;
  paymentDate: string; // ISO date string
  paymentReference: string;
  paymentMethod: string; // PaymentMethod enum value
  transactionId?: string;
  bankDetails?: string;
}

// ==================== Workflow Configuration ====================

export interface ApprovalLevelConfig {
  level: number;
  name: string;
  description: string;
  requiredRoles: string[];
  availableActions: ApprovalActionConfig[];
  autoApproveThreshold?: number; // Auto-approve if amount is below this
  notificationRecipients: string[]; // Email addresses or user IDs
}

export interface ApprovalActionConfig {
  action: string;
  label: string;
  icon?: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
  requiresComment?: boolean;
  requiresPaymentDetails?: boolean;
  nextStatus: string;
  sideEffects: SideEffect[];
}

export interface SideEffect {
  type:
    | "notification"
    | "email"
    | "webhook"
    | "status_change"
    | "assign_next_level";
  target?: string;
  payload?: Record<string, any>;
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

// Parent form data for entire expense/advance request
export interface ExpenseFormData {
  // General Information
  type: string; // ExpenseType enum value
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  description: string;

  // Line Items
  lineItems: ExpenseLineItemCarrier[];

  // Optional fields
  isTemporaryPerson?: boolean;
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;
}

// Single line item form data
export interface ExpenseLineItemFormData {
  category: string; // ExpenseCategory enum value
  description: string;
  amount: number;
  fromDate: string;
  toDate: string;
  attachments?: File[];
  notes?: string;
}

export interface ApprovalFormData {
  action: string; // ApprovalAction enum value
  comments?: string;
  paymentDetails?: PaymentConfirmationCarrier;
}

// ==================== View Models ====================

export interface ExpenseListItem extends Expense {
  // Additional computed fields for list view
  daysInReview: number;
  canEdit: boolean;
  canCancel: boolean;
  nextApproverName?: string;
}
