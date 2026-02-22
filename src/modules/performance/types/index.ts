/**
 * Performance Reviews Module - Strict TypeScript Types
 * RBAC: HR, REPORTING_MANAGER, EMPLOYEE
 */

// ============= RBAC =============
export type UserRole = "HR" | "REPORTING_MANAGER" | "EMPLOYEE";

// ============= TEMPLATE TYPES =============
export type ColumnType = "TEXT" | "NUMBER" | "RATING" | "SELECT" | "CALCULATED";

export interface TemplateColumn {
  id: string;
  name: string;
  columnType: ColumnType;
  type: string; // display type or label
  mandatory: boolean;
  ratingRange?: { min: number; max: number };
  options?: string[]; // for SELECT
  calculationFormula?: string; // for CALCULATED columns
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * TemplateColumnCarrier - Carrier for creating/updating template columns
 * Transfer object for template column operations without ID and system fields
 */
export interface TemplateColumnCarrier {
  name: string; // required
  type: string; // required - TEXT, NUMBER, SELECT, RATING, CALCULATED, etc.
  mandatory: boolean; // required
  ratingRange?: { min: number; max: number }; // for RATING type columns
  options?: string[]; // for SELECT type columns
  calculationFormula?: string; // for CALCULATED type columns
  displayOrder?: number;
}

export interface TemplateRow {
  id: string;
  label: string;
  weightage?: number; // used in score calculation
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * TemplateRowCarrier - Carrier for creating/updating template rows
 * Transfer object for template row operations without ID and system fields
 */
export interface TemplateRowCarrier {
  label: string; // required
  weightage?: number; // used in score calculation
  displayOrder?: number;
}

export interface PerformanceTemplate {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  columnIds: string[]; // don't add columns again
  templateStatus: string; //open, hold, closed
  rowIds: string[]; // don't add rows again
  columns?: TemplateColumn[]; // optional - populated when full data is loaded/needed
  rows?: TemplateRow[]; // optional - populated when full data is loaded/needed
  createdBy: string; // HR user ID
  createdAt: string;
  updatedAt: string;
}

/**
 * PerformanceTemplateCarrier - Carrier for creating/updating performance templates
 * Transfer object for performance template operations without ID and system fields
 */
export interface PerformanceTemplateCarrier {
  title: string; // required
  description: string; // required
  department: string; // required - department ID
  templateStatus?: string; // optional - 'open', 'hold', 'closed'
}

// ============= REVIEW REQUEST TYPES =============
export type RequestStatus =
  | "AT_EMPLOYEE"
  | "AT_MANAGER"
  | "AT_HR"
  | "FREEZED"
  | "REVOKED";

export interface ReviewCellValue {
  rowId: string;
  columnId: string;
  value: string | number;
  editedBy?: string; // track who edited
  editedAt?: string;
}

export interface PerformanceReviewRequest {
  id: string;
  templateId: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  department: string;
  status: RequestStatus;
  values: ReviewCellValue[];
  finalScore: number;
  submittedByEmployeeAt?: string;
  submittedByManagerAt?: string;
  updatedAt: string;
  createdAt: string;
}

// ============= FILTER & SEARCH TYPES =============
export interface RequestFilter {
  status?: RequestStatus[];
  department?: string;
  templateId?: string;
  search?: string;
}

// ============= DRAFT TYPES =============
export interface ReviewDraft {
  id: string;
  requestId: string;
  values: ReviewCellValue[];
  lastSavedAt: string;
}

// ============= SCORE CALCULATION =============
export interface ScoreCalculationResult {
  finalScore: number;
  breakdown: {
    rowId: string;
    label: string;
    weightage: number;
    rating: number;
    contribution: number;
  }[];
}

// ============= MOCK USER TYPES =============
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

// ============= COMPONENT PROP TYPES =============
export interface TemplateBuilderProps {
  initialTemplate?: PerformanceTemplate;
  onSave: (template: PerformanceTemplate) => void;
  onCancel: () => void;
}

export interface ReviewFormProps {
  request: PerformanceReviewRequest;
  template: PerformanceTemplate;
  currentUserRole: UserRole;
  onSave: (request: PerformanceReviewRequest) => void;
  onSubmit: (request: PerformanceReviewRequest) => void;
  onCancel: () => void;
}

export interface RequestListProps {
  requests: PerformanceReviewRequest[];
  templates: Map<string, PerformanceTemplate>;
  currentUserRole: UserRole;
  currentUserId: string;
  onEdit: (request: PerformanceReviewRequest) => void;
  onFreeze?: (requestId: string) => void;
  onRevoke?: (requestId: string) => void;
}
