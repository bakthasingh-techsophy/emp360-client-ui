/**
 * Expense Settings Types
 * Type definitions for expense configuration
 */

export interface ExpenseTypeConfig {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface ExpenseCategoryConfig {
  id: string;
  category: string;
  description: string;
}

export interface ApprovalLevel {
  id: string;
  level: number;
  roleName: string;
  threshold: number;
}

export interface ApprovalWorkflowConfig {
  id: string;
  workflowId: string;
  name: string;
  description?: string;
  levels: ApprovalLevel[];
}

export interface IntimationLevel {
  id: string;
  level: number;
  roleName: string;
  maxDays: number;
}

export interface IntimationWorkflowConfig {
  id: string;
  workflowId: string;
  name: string;
  description?: string;
  levels: IntimationLevel[];
}

