# Performance Reviews Module

A fully-featured Performance Reviews module for an enterprise HRMS application with strict TypeScript, complete RBAC implementation, dynamic template builder, and workflow-driven request lifecycle.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Type System](#type-system)
- [RBAC & Permissions](#rbac--permissions)
- [Workflow](#workflow)
- [Components](#components)
- [Usage](#usage)
- [Development](#development)

## 🏗️ Architecture

### Directory Structure

```
src/modules/performance/
├── PerformanceReviews.tsx          # Main entry point
├── index.ts                         # Module exports
├── types/
│   └── index.ts                     # Strict TypeScript interfaces
├── dummy-data.ts                    # Mock data for frontend-only mode
├── context/
│   └── PerformanceReviewContext.tsx # State management with context API
├── utils/
│   └── rbac.ts                      # RBAC, permissions, visibility rules
└── components/
    ├── index.ts                     # Component exports
    ├── PerformanceReviewsPage.tsx    # Main orchestrator
    ├── TemplateBuilder.tsx           # Dynamic template creator (HR)
    ├── TemplateManagement.tsx        # Template CRUD view (HR)
    ├── ReviewForm.tsx                # Dynamic review form with RBAC
    ├── RequestList.tsx               # Role-specific request listings
    └── RoleProfileSwitcher.tsx       # Dev-only role switcher
```

## ✨ Features

### 1. Dynamic Template Builder (HR Only)

**Create and manage review templates with:**

- **Flexible columns** – Multiple types:
  - `TEXT`: Free text input
  - `NUMBER`: Numeric values
  - `RATING`: Configurable rating scales (e.g., 1-5)
  - `SELECT`: Dropdown options
  - `CALCULATED`: Auto-computed fields based on rating averages

- **Configurable rows** – Performance periods with weightage for score calculation

- **Column permissions** – Control who can edit each column:
  - `EMPLOYEE`: Employee can edit
  - `MANAGER`: Manager can edit
  - `HR`: HR can edit
  - `ALL`: Everyone can edit

- **Field configuration**:
  - Mandatory/optional marking
  - Rating range configuration
  - Calculation formulas for auto-calculated columns

### 2. Strict TypeScript Interfaces

All types are explicitly defined:

```typescript
interface PerformanceTemplate {
  id: string;
  title: string;
  description: string;
  department: string;
  templateStatus: boolean; // true = open
  columns: TemplateColumn[];
  rows: TemplateRow[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceReviewRequest {
  id: string;
  templateId: string;
  employeeId: string;
  managerId: string;
  department: string;
  status: RequestStatus; // AT_EMPLOYEE | AT_MANAGER | AT_HR | FREEZED | REVOKED
  values: ReviewCellValue[];
  finalScore: number;
  submittedAt?: string;
  updatedAt: string;
}
```

### 3. Complete RBAC Implementation

Three roles with distinct capabilities:

#### HR Role

- ✓ Full CRUD on templates
- ✓ View all requests across organization
- ✓ **Cannot view cell values** (privacy enforcement)
- ✓ Can only see calculated final scores
- ✓ Freeze requests (no further edits)
- ✓ Revoke requests (send back for re-review)
- ✓ Export button (placeholder)

#### Reporting Manager Role

- ✓ View own requests (as employee)
- ✓ View team requests (accordion view)
- ✓ Fill manager-specific columns
- ✓ Edit until HR freezes
- ✓ Submit to HR
- ✓ Save drafts
- ✓ Cannot see HR-only private fields

#### Employee Role

- ✓ Fill own request
- ✓ Fill employee-editable columns only
- ✓ Cannot see manager/HR fields
- ✓ Save as draft
- ✓ Submit to manager
- ✓ Edit until manager submits to HR

### 4. Workflow-Driven Request Lifecycle

```
AT_EMPLOYEE
    ↓ (Employee submits)
AT_MANAGER
    ↓ (Manager submits)
AT_HR
    ├→ FREEZED (HR freezes - final)
    └→ REVOKED (HR revokes - send back)
        ↓ (Employee/Manager re-edit)
    Back to AT_EMPLOYEE/AT_MANAGER
```

### 5. Score Auto-Calculation

- Calculated using **weightage × rating** logic
- Auto-updates when ratings change
- Weighted average across performance periods
- Stored in `finalScore` field
- Privacy-safe: HR sees score only, not cell values

### 6. Draft Support

- Save drafts at any point
- Drafts persist in frontend state
- Drafts cleared on final submission
- Last saved timestamp displayed

## 📊 Type System

### Core Types

**Columns:**

```typescript
type ColumnEditableBy = "EMPLOYEE" | "MANAGER" | "HR" | "ALL";
type ColumnType = "TEXT" | "NUMBER" | "RATING" | "SELECT" | "CALCULATED";

interface TemplateColumn {
  id: string;
  name: string;
  type: ColumnType;
  editableBy: ColumnEditableBy[];
  mandatory: boolean;
  ratingRange?: { min: number; max: number };
  options?: string[];
  calculationFormula?: string;
}
```

**Rows:**

```typescript
interface TemplateRow {
  id: string;
  label: string;
  weightage?: number;
  isPrefilled?: boolean;
}
```

**Requests:**

```typescript
type RequestStatus =
  | "AT_EMPLOYEE"
  | "AT_MANAGER"
  | "AT_HR"
  | "FREEZED"
  | "REVOKED";

interface ReviewCellValue {
  rowId: string;
  columnId: string;
  value: string | number;
  editedBy?: string;
  editedAt?: string;
}
```

## 🔐 RBAC & Permissions

### Permission Functions (in `utils/rbac.ts`)

```typescript
canEditTemplate(role): boolean              // HR only
canViewAllRequests(role): boolean           // HR only
canFreezeRequest(role): boolean             // HR only
canEditColumn(column, userRole): boolean    // Check column editability
getVisibleColumns(columns, role): Column[]  // Filter visible columns
canEditRequest(request, role, userId): boolean
shouldMaskCellValues(role): boolean         // HR masks cell values
getAvailableActions(request, role, userId): AvailableActions
```

### Visibility Rules

**Employees:**

- Cannot see MANAGER-only or HR-only columns
- Cannot view manager ratings
- Cannot see other employees' data

**Managers:**

- Can see employee-filled and manager-editable columns
- Blocked from viewing when HR is reviewing
- Cannot edit after HR receives request

**HR:**

- Can view all requests
- **Cannot see individual cell values** (privacy)
- Can only see calculated final scores
- Can view status and metadata

## 🔄 Workflow

### Employee Workflow

1. Login as employee
2. See department templates (only open ones)
3. Click to fill review
4. Fill employee-editable columns
5. Save as draft (optional)
6. Submit to manager (status → AT_MANAGER)
7. Cannot edit until manager returns it

### Manager Workflow

1. Login as manager
2. See two sections:
   - **My Requests** – Own reviews to submit
   - **Team Requests** – Accordion of team member submissions

3. Open team member's review
4. Fill manager-editable columns
5. See employee-filled values (if not HR)
6. Save as draft
7. Submit to HR (status → AT_HR)

### HR Workflow

1. Login as HR
2. Two tabs: Templates & Reviews
3. **Templates tab:**
   - Create/Edit/Delete templates
   - Toggle active/inactive
4. **Reviews tab:**
   - View all reviews in table format
   - See employee name, department, template, final score
   - **Cannot see cell values** (privacy enforcement)
   - Take actions:
     - View details
     - Freeze (lock permanently)
     - Revoke (send back for re-review)
     - Export (placeholder)

## 🎨 Components

### PerformanceReviewsPage

**Main orchestrator** – Routes to correct view based on role

- Manages global state
- Handles role/user switching
- Routes between list, form, builder, management views

### TemplateBuilder

**HR-only** – Creates/edits dynamic templates

Features:

- Basic details (title, description, department)
- Column builder with drag-and-drop ready
- Row builder with weightage
- Column type configuration
- Permission control (editableBy)
- Mandatory field marking

### ReviewForm

**Role-based** – Renders review form with RBAC

Features:

- Dynamic cell rendering based on column type
- Column visibility based on role
- Cell editability enforcement
- Read-only indicators
- Save draft & submit buttons
- Auto-calculated column display
- Last saved timestamp

### RequestList

**Role-specific views** – Different layouts per role

**Employee:**

- Card layout with status badge
- Edit/View buttons

**Manager:**

- My Requests (simple cards)
- Team Requests (accordion)
- Score visible after employee submits

**HR:**

- Table format
- Freeze/Revoke/Export actions
- Final scores highlighted

### TemplateManagement

**HR-only** – CRUD for templates

- Table with all templates
- Edit, delete, toggle active status
- Quick stats (columns, rows count)
- Feature info card

### RoleProfileSwitcher

**Development only** – Toggle between roles and users

- Dropdown menu
- Group users by role
- Show active user
- Quick info about each role

## 🚀 Usage

### Setup in Application

```typescript
// In your App.tsx or appropriate layout file
import { PerformanceReviews } from '@/modules/performance';

<Route path="/performance-reviews" element={<PerformanceReviews />} />
```

### Using the Context

```typescript
import { usePerformanceReview } from "@/modules/performance";

function MyComponent() {
  const {
    templates,
    requests,
    addTemplate,
    updateRequest,
    getTemplateById,
    freezeRequest,
  } = usePerformanceReview();

  // Use the context as needed
}
```

### Using RBAC Utilities

```typescript
import {
  canEditColumn,
  canEditRequest,
  getVisibleColumns,
  shouldMaskCellValues,
  getAvailableActions,
} from "@/modules/performance";

// Check permissions
if (canEditColumn(column, "EMPLOYEE")) {
  // Allow editing
}

// Get filtered columns
const visibleCols = getVisibleColumns(template.columns, "MANAGER", "AT_HR");

// Check if values should be masked (for HR)
if (shouldMaskCellValues("HR")) {
  // Use placeholder values
}

// Get available actions
const actions = getAvailableActions(request, "EMPLOYEE", "emp-001");
```

## 🛠️ Development

### Mock Data

All data is stored in frontend state (`PerformanceReviewContext`). Initial data comes from `dummy-data.ts`:

- **5 mock users** (1 HR, 2 Managers, 2 Employees)
- **2 templates** (Engineering, Marketing)
- **4 mock requests** with various statuses

### Role Switching

Use the dropdown in top-right corner (development mode):

1. Shows all available users grouped by role
2. Switch between users/roles instantly
3. See how UI adapts to role permissions

### Console Checks

The module includes accurate RBAC checks. Try:

```javascript
// Check what a role can do
const editableColumns = templateColumns.filter((c) =>
  canEditColumn(c, "EMPLOYEE"),
);

// Check visibility
const visible = getVisibleColumns(template.columns, "HR", "AT_HR");

// Check available actions
const actions = getAvailableActions(request, "MANAGER", managerId);
```

### Testing Scenarios

1. **Employee fills review** → Submit to manager
2. **Manager adds ratings** → Submit to HR
3. **HR views request** → Cannot see cell values, only score
4. **HR freezes** → Nobody can edit
5. **HR revokes** → Employee can re-edit
6. **Template builder** → Create new template with custom columns
7. **Draft saving** → Fill form, save, leave, return to see draft

## 📝 Notes

- **Frontend-only**: No backend integration. All data in React state.
- **TypeScript**: Fully typed with no `any` types.
- **Privacy**: HR role has strict visibility enforcement.
- **Themeable**: Uses Tailwind + theme system from existing app.
- **Reusable Components**: Leverages existing UI components.
- **Modular**: Easy to add scoring rules, notifications, etc.

## 🔮 Future Enhancements

- [ ] Real backend integration
- [ ] Batch export to CSV/Excel
- [ ] Email notifications
- [ ] Advanced scoring rules
- [ ] Historical comparisons
- [ ] PDF generation
- [ ] Calendar view for deadlines
- [ ] Comments/feedback thread
- [ ] Normalization scoring across department
- [ ] Multi-language support
