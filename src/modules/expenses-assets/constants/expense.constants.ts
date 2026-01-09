/**
 * Expense Management Constants
 */

import { ExpenseCategory, ExpenseStatus, PaymentMethod, ExpenseType } from '../types/expense.types';

// ==================== Labels ====================

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  expense: 'Expense Claim',
  advance: 'Advance Request',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  travel: 'Travel',
  accommodation: 'Accommodation',
  meals: 'Meals & Entertainment',
  transportation: 'Transportation',
  office_supplies: 'Office Supplies',
  equipment: 'Equipment',
  training: 'Training & Development',
  client_entertainment: 'Client Entertainment',
  software_licenses: 'Software Licenses',
  other: 'Other',
};

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Credit/Debit Card',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  digital_wallet: 'Digital Wallet',
};

// ==================== Colors ====================

export const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  travel: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  accommodation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  meals: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  transportation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  office_supplies: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  equipment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  training: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  client_entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  software_licenses: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

// ==================== Icons ====================

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  travel: '✈️',
  accommodation: '🏨',
  meals: '🍽️',
  transportation: '🚗',
  office_supplies: '📎',
  equipment: '💻',
  training: '📚',
  client_entertainment: '🎭',
  software_licenses: '💿',
  other: '📋',
};

// ==================== Configuration ====================

export const DEFAULT_CURRENCY = 'USD';

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const EXPENSE_NUMBER_PREFIX = 'EXP';

// Auto-approval thresholds by level
export const AUTO_APPROVAL_THRESHOLDS = {
  level1: 1000,  // Manager auto-approves up to $1000
  level2: 5000,  // Business head auto-approves up to $5000
  level3: null,  // Finance always reviews
};
