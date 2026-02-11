# Performance Reviews Backend Handoff

## Overview

This document provides all the information required for backend development of the Performance Reviews module. It includes:

- Data models and types
- API requirements and flows
- Role-based access and workflow
- Key business logic
- Integration points

---

## 1. Data Models & Types

### 1.1. Review Template

- **id**: string
- **name**: string
- **description**: string
- **columns**: Array<ReviewColumn>
- **rows**: Array<ReviewRow>
- **isActive**: boolean
- **createdBy**: UserRef
- **createdAt**: ISODate
- **updatedAt**: ISODate

### 1.2. ReviewColumn

- **id**: string
- **label**: string
- **type**: 'text' | 'number' | 'rating' | 'select' | 'boolean'
- **options?**: string[] (for select)
- **weightage?**: number
- **isEditable**: boolean

### 1.3. ReviewRow

- **id**: string
- **label**: string
- **description?**: string
- **weightage?**: number

### 1.4. ReviewRequest

- **id**: string
- **templateId**: string
- **employeeId**: string
- **managerId**: string
- **hrId**: string
- **status**: 'DRAFT' | 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
- **currentActor**: 'EMPLOYEE' | 'MANAGER' | 'HR'
- **responses**: Array<ReviewResponse>
- **createdAt**: ISODate
- **updatedAt**: ISODate

### 1.5. ReviewResponse

- **rowId**: string
- **columnId**: string
- **value**: string | number | boolean
- **comment?**: string
- **actor**: 'EMPLOYEE' | 'MANAGER' | 'HR'
- **submittedAt**: ISODate

### 1.6. UserRef

- **id**: string
- **name**: string
- **role**: 'EMPLOYEE' | 'MANAGER' | 'HR'

---

## 2. API Endpoints & Flows

### 2.1. Templates

- `GET /api/performance/templates` — List all templates
- `POST /api/performance/templates` — Create new template
- `GET /api/performance/templates/:id` — Get template by ID
- `PUT /api/performance/templates/:id` — Update template
- `DELETE /api/performance/templates/:id` — Delete template

### 2.2. Review Requests

- `GET /api/performance/requests` — List review requests (filter by role, status, etc.)
- `POST /api/performance/requests` — Create new review request
- `GET /api/performance/requests/:id` — Get review request by ID
- `PUT /api/performance/requests/:id` — Update review request (status, responses)
- `POST /api/performance/requests/:id/submit` — Submit review (by actor)
- `POST /api/performance/requests/:id/reject` — Reject review (by actor)

### 2.3. Users

- `GET /api/users?role=EMPLOYEE|MANAGER|HR` — List users by role

---

## 3. Workflow & State Machine

### 3.1. Review Request Lifecycle

1. **DRAFT** (created by HR or Manager)
2. **SUBMITTED** (to Employee)
3. **IN_PROGRESS** (Employee fills, submits to Manager)
4. **IN_PROGRESS** (Manager reviews, submits to HR)
5. **COMPLETED** (HR finalizes)
6. **REJECTED** (at any stage, returns to previous actor)

### 3.2. State Transitions

- Only the current actor can update/submit at their stage
- Each transition must be logged (audit trail)
- Rejection returns to previous actor, status set to IN_PROGRESS

---

## 4. Role-Based Access (RBAC)

- **EMPLOYEE**: Can view and edit their own review requests, submit responses
- **MANAGER**: Can view/manage direct reports' requests, provide feedback, submit to HR
- **HR**: Can view/manage all requests, finalize reviews, manage templates
- All actions must be validated against user role and request state

---

## 5. Filtering & Search

- All list endpoints must support filtering by:
  - status
  - actor
  - template
  - date range
  - employee/manager/HR
- Support search by name, template, etc.

---

## 6. Audit & History

- All state changes and submissions must be logged with:
  - actor
  - timestamp
  - action
  - previous and new state
- Provide endpoint to fetch audit trail for a review request

---

## 7. Validation & Business Rules

- Only one active review per employee per template per cycle
- Weightages must sum to 100% (if used)
- All required fields must be validated
- Only allowed actors can update at each stage

---

## 8. Example Flows

### 8.1. HR Creates Template

1. HR POSTs to `/api/performance/templates`
2. Template is stored, available for new review requests

### 8.2. Manager Initiates Review

1. Manager POSTs to `/api/performance/requests` with templateId, employeeId
2. Request is created with status DRAFT, currentActor: MANAGER
3. Manager submits, status → SUBMITTED, currentActor: EMPLOYEE

### 8.3. Employee Fills Review

1. Employee GETs their requests
2. Employee fills responses, submits
3. Status → IN_PROGRESS, currentActor: MANAGER

### 8.4. Manager Reviews

1. Manager reviews, adds feedback, submits
2. Status → IN_PROGRESS, currentActor: HR

### 8.5. HR Finalizes

1. HR reviews, finalizes
2. Status → COMPLETED

---

## 9. Integration Points

- User service for employee/manager/HR lookup
- Notification service for status changes
- Audit logging service

---

## 10. References

- See `rbac.ts` for permission logic
- See `TemplateBuilder.tsx`, `RequestList.tsx`, `TemplateManagement.tsx` for UI flows

---

## 11. Open Questions

- How to handle review cycles (annual, quarterly, etc.)?
- Should templates be versioned?
- Should comments be allowed at every stage?

---

## 12. Contact

For questions, contact the frontend team or see the frontend codebase for further details.

/\*\*

- Performance Reviews Module - Strict TypeScript Types
- RBAC: HR, REPORTING_MANAGER, EMPLOYEE
  \*/

// ============= RBAC =============
export type UserRole = "HR" | "REPORTING_MANAGER" | "EMPLOYEE";

// ============= TEMPLATE TYPES =============
export type ColumnEditableBy = "EMPLOYEE" | "MANAGER" | "HR" | "ALL";
export type ColumnType = "TEXT" | "NUMBER" | "RATING" | "SELECT" | "CALCULATED";

export interface TemplateColumn {
id: string;
name: string;
type: ColumnType;
editableBy: ColumnEditableBy[];
mandatory: boolean;
ratingRange?: { min: number; max: number };
options?: string[]; // for SELECT
calculationFormula?: string; // for CALCULATED columns
displayOrder?: number;
}

export interface TemplateRow {
id: string;
label: string;
weightage?: number; // used in score calculation
isPrefilled?: boolean;
displayOrder?: number;
}

export interface PerformanceTemplate {
id: string;
title: string;
description: string;
department: string;
templateStatus: boolean; // true = open, false = closed
columns: TemplateColumn[];
rows: TemplateRow[];
createdBy: string; // HR user ID
createdAt: string;
updatedAt: string;
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
