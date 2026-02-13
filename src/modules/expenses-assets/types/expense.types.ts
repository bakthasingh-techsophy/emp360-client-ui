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
  expenseId: string;
  category: string; // ExpenseCategory enum value
  description: string;
  amount: number;
  fromDate: string; // ISO date string - start date of expense
  toDate: string; // ISO date string - end date of expense
  attachments: ExpenseAttachment[];
  notes?: string;
  createdAt: string; // ISO datetime string
  updatedAt?: string; // ISO datetime string
}

export interface Expense {
  id: string;
  companyId: string; // Company ID for the expense

  // Type of claim
  type: string; // ExpenseType enum value

  // Raised for details (myself, another employee, or temporary person)
  raisedFor: string; // "myself" | "employee" | "temporary-person"

  // Employee details
  employeeId: string;

  // Raised by details (for claims raised on behalf)
  raisedByEmployeeId?: string;

  // Temporary person details (if applicable - only when raisedFor="temporary-person")
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;

  // Claim details
  expenseCategoryId?: string; // Selected expense category ID (for expense type only)
  description: string; // Main description/purpose

  // Line items - multiple expenses in one claim (IDs only)
  lineItemIds?: string[];

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

/**
 * ExpenseCarrier
 * Carrier for creating/updating expenses
 * Matches backend ExpenseCarrier model for API compatibility
 * Minimal required fields for backend API
 */
export interface ExpenseCarrier {
  // Required fields - must always be provided
  type: string; // ExpenseType enum value - "expense" or "advance"
  raisedFor: string; // "myself" | "employee" | "temporary-person"
  description: string; // Validation: @NotBlank, max 1000 characters

  // Company and employee context
  companyId: string; // Company ID for the expense
  employeeId?: string; // Employee ID (required when raisedFor="myself" or "employee")

  // Conditional required fields
  raisedByEmployeeId?: string; // Mandatory if raisedFor != "myself", else null

  // Category (required for expense type)
  expenseCategoryId?: string; // Validation: @Size(max=100) - required for expense type

  // Temporary person fields (when raisedFor="temporary-person")
  temporaryPersonName?: string; // Validation: @Size(max=100)
  temporaryPersonPhone?: string; // Validation: @Size(max=20)
  temporaryPersonEmail?: string;

  // Metadata
  createdAt: string; // ISO datetime string - required
}

// Carrier for expense line items
export interface ExpenseLineItemCarrier {
  id: string;
  expenseId: string; // Reference to parent expense
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
  companyId: string; // Company ID - required
  raisedFor: string; // "myself" | "employee" | "temporary-person" - required
  employeeId?: string; // Employee ID (for "myself" or when selecting specific employee)
  raisedByEmployeeId?: string; // Employee ID who raised this (current user if raisedFor != "myself")
  description: string;
  expenseCategoryId?: string; // Selected expense category ID (for expense type only)

  // Temporary person details (only when raisedFor="temporary-person")
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;

  // Line Items
  lineItems: ExpenseLineItemCarrier[];
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

/**
 * ExpenseSnapshot
 * Lightweight snapshot of expense data optimized for table rendering
 * Extends Expense with cached computed fields for improved performance
 * Eliminates expensive calculations (e.g., array length) during rendering
 */
export interface ExpenseSnapshot extends Expense {
  /**
   * Cached line item count for faster table rendering
   * Avoids calculating length from lineItemIds array on every render
   */
  lineItemCount: number;

  /**
   * Total requested amount (sum of line items or advance amount)
   * Cached for faster rendering
   */
  totalRequestedAmount?: number;

  /**
   * Employee details for display purposes (cached from employee data)
   */
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  /**
   * Raised by details for display purposes (populated from raised by employee details)
   */
  raisedByFirstName?: string;
  raisedByLastName?: string;
  raisedByEmail?: string;
  raisedByPhone?: string;
}
