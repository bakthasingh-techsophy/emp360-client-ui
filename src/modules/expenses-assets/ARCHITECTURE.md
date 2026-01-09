# Expense Management Component Architecture

## Component Hierarchy

```
ExpenseManagement (index.tsx)
│
├─ Role: Admin
│  └─ Tabs
│     ├─ Tab: My Expenses
│     │  └─ EmployeeExpenseList
│     ├─ Tab: Manager Dashboard
│     │  └─ ApprovalDashboard (level=level1)
│     ├─ Tab: Business Dashboard
│     │  └─ ApprovalDashboard (level=level2)
│     └─ Tab: Finance Dashboard
│        └─ ApprovalDashboard (level=level3)
│
├─ Role: Finance
│  └─ ApprovalDashboard (level=level3)
│
├─ Role: Business Head
│  └─ ApprovalDashboard (level=level2)
│
├─ Role: Manager
│  └─ ApprovalDashboard (level=level1)
│
└─ Role: Employee
   └─ EmployeeExpenseList
```

## EmployeeExpenseList Structure

```
EmployeeExpenseList
│
├─ PageLayout
│  ├─ toolbar
│  │  └─ GenericToolbar
│  │     ├─ Search (by description)
│  │     ├─ Filters
│  │     │  ├─ Status (select)
│  │     │  ├─ Category (select)
│  │     │  ├─ Date From (date)
│  │     │  └─ Date To (date)
│  │     ├─ Export Button
│  │     └─ New Expense Button
│  │
│  └─ children
│     ├─ Title & Description
│     ├─ ExpenseStatsCards
│     │  ├─ Total Expenses Card
│     │  ├─ Pending Card
│     │  ├─ Approved Card
│     │  └─ Paid Card
│     │
│     └─ Grid (3 columns)
│        └─ ExpenseCard (for each expense)
│           ├─ Category Badge
│           ├─ Urgent Flag
│           ├─ Description
│           ├─ Amount
│           ├─ Status Badge
│           ├─ Date
│           ├─ Days in Review
│           ├─ Next Approver
│           ├─ Merchant Name
│           └─ Action Buttons
│              ├─ View
│              ├─ Edit (if canEdit)
│              └─ Cancel (if canCancel)
```

## ApprovalDashboard Structure

```
ApprovalDashboard (props: level, userRole)
│
├─ PageLayout
│  ├─ toolbar
│  │  └─ GenericToolbar
│  │     ├─ Search (by description)
│  │     ├─ Filters
│  │     │  ├─ Category (select)
│  │     │  ├─ Min Amount (text)
│  │     │  ├─ Max Amount (text)
│  │     │  └─ Urgent Only (checkbox)
│  │     └─ Export Button
│  │
│  └─ children
│     ├─ Title & Description (level-specific)
│     ├─ ExpenseStatsCards
│     │  ├─ Total Expenses Card
│     │  ├─ Pending Card
│     │  ├─ Approved Card
│     │  └─ Paid Card
│     │
│     └─ Tabs
│        ├─ Tab: Pending (count)
│        │  └─ Grid → ExpenseCard (no action buttons)
│        │
│        ├─ Tab: Approved Today (count)
│        │  └─ Grid → ExpenseCard (no action buttons)
│        │
│        ├─ Tab: Rejected Today (count)
│        │  └─ Grid → ExpenseCard (no action buttons)
│        │
│        └─ Tab: All Expenses (count)
│           └─ Grid → ExpenseCard (no action buttons)
```

## Reusable Components

### ExpenseCard
```
ExpenseCard (props: expense, onView, onEdit?, onCancel?, showActions?)
├─ Card (clickable)
│  ├─ CardHeader
│  │  ├─ Left Column
│  │  │  ├─ ExpenseCategoryBadge (with icon)
│  │  │  ├─ Urgent Flag (if isUrgent)
│  │  │  └─ Description
│  │  └─ Right Column
│  │     ├─ Amount (formatted currency)
│  │     └─ ExpenseStatusBadge
│  │
│  └─ CardContent
│     ├─ Date (with icon)
│     ├─ Days in Review (if > 0)
│     ├─ Next Approver (if pending)
│     ├─ Merchant Name
│     └─ Action Buttons (if showActions && (canEdit || canCancel))
│        ├─ View Button
│        ├─ Edit Button (if canEdit)
│        └─ Cancel Button (if canCancel)
```

### ExpenseStatsCards
```
ExpenseStatsCards (props: stats)
└─ Grid (4 columns)
   ├─ Total Card (FileText icon)
   │  ├─ Count
   │  └─ Total Amount
   ├─ Pending Card (Clock icon)
   │  ├─ Count
   │  └─ Pending Amount
   ├─ Approved Card (CheckCircle icon)
   │  ├─ Count
   │  └─ Description
   └─ Paid Card (DollarSign icon)
      ├─ Count
      └─ Paid Amount
```

### ApprovalTimeline
```
ApprovalTimeline (props: approvalHistory, currentLevel)
└─ Card
   ├─ CardHeader ("Approval Timeline")
   └─ CardContent
      └─ Vertical Timeline (3 levels)
         ├─ Level 1: Manager
         │  ├─ Status Icon (✓/✗/⏰/⚠)
         │  ├─ Level Label
         │  ├─ Approver Name
         │  ├─ Timestamp
         │  ├─ Comments
         │  └─ Vertical Line (colored)
         │
         ├─ Level 2: Business Management
         │  ├─ Status Icon
         │  ├─ Level Label
         │  ├─ Approver Name
         │  ├─ Timestamp
         │  ├─ Comments
         │  └─ Vertical Line (colored)
         │
         └─ Level 3: Finance
            ├─ Status Icon
            ├─ Level Label
            ├─ Approver Name
            ├─ Timestamp
            ├─ Comments
            └─ Payment Details (if confirmed)
               ├─ Transaction ID
               ├─ Payment Date
               └─ Payment Method
```

### ExpenseStatusBadge
```
ExpenseStatusBadge (props: status, className?)
└─ Badge (colored based on status)
   └─ Status Label (Draft/Submitted/Approved/Rejected/etc.)
```

### ExpenseCategoryBadge
```
ExpenseCategoryBadge (props: category, showIcon?, className?)
└─ Badge (colored based on category)
   ├─ Icon Emoji (if showIcon) (✈️🏨🍽️🚗💻📚🎭💿📋)
   └─ Category Label
```

## Data Flow

### Employee View Data Flow
```
currentUser (mockData)
   ↓
Filter expenses by employeeId
   ↓
Add computed fields (daysInReview, canEdit, canCancel, nextApproverName)
   ↓
Calculate stats (total, pending, approved, rejected, paid)
   ↓
Apply search query filter
   ↓
Apply active filters (status, category, dates)
   ↓
Render filtered expenses in grid
```

### Approval Dashboard Data Flow
```
level prop (level1, level2, level3)
   ↓
Map level to status (submitted, level1_approved, level2_approved)
   ↓
Filter all expenses by status = mapped status (Pending tab)
   ↓
Filter approvalHistory for today's actions (Approved/Rejected tabs)
   ↓
Calculate level-specific stats
   ↓
Apply search query filter
   ↓
Apply active filters (category, amount range, urgent)
   ↓
Render filtered expenses by tab
```

### Workflow Execution Flow (TODO)
```
User clicks Approve/Reject/Return/Confirm Payment
   ↓
Open ApprovalActionDialog
   ↓
User enters comments/payment details
   ↓
Submit action
   ↓
Call workflow.config action
   ↓
Execute side effects:
   - Send notification to employee
   - Send email to next approver
   - Trigger webhook to accounting system
   - Update expense status
   ↓
Refresh dashboard
   ↓
Show success toast
```

## State Management

### Local Component State
- `searchQuery`: string (GenericToolbar search)
- `activeFilters`: ActiveFilter[] (GenericToolbar filters)
- `activeTab`: string (ApprovalDashboard tabs)

### Computed State
- `userExpenses`: Filtered by currentUser.id
- `pendingExpenses`: Filtered by appropriate status for level
- `approvedToday`: Filtered by approval history timestamp
- `rejectedToday`: Filtered by approval history timestamp
- `filteredExpenses`: After applying search + filters
- `stats`: Calculated from filtered expenses

### Global State (Not Yet Implemented)
- User authentication context
- Real-time notification system
- API data cache
- Optimistic UI updates

## Styling System

### Colors
**Status Colors (with dark mode):**
- Draft: Gray
- Submitted: Blue
- Level 1 Approved: Green
- Level 2 Approved: Green
- Level 3 Approved: Green
- Paid: Green (darker)
- Rejected: Red
- Cancelled: Gray (darker)

**Category Colors:**
- Travel: Blue
- Accommodation: Purple
- Meals: Orange
- Transport: Green
- Office Supplies: Gray
- Equipment: Cyan
- Training: Indigo
- Entertainment: Pink
- Software: Teal
- Other: Slate

### Layout
- **Desktop (lg)**: 3 columns for expense cards
- **Tablet (md)**: 2 columns
- **Mobile**: 1 column
- **Spacing**: 6 units (1.5rem) between sections
- **Card Gap**: 4 units (1rem) in grid

### Icons
- Lucide React icon library
- Size: h-4 w-4 (16px)
- Colors: Match status/category colors

## Extension Points

### Adding New Approval Level
1. Add `level4` to ApprovalLevel enum
2. Create LEVEL4_CONFIG in workflow.config.ts
3. Update getNextLevel() logic
4. Add level4 status to ExpenseStatus enum
5. Add tab in Admin dashboard

### Adding New Expense Category
1. Add to ExpenseCategory enum
2. Add label to EXPENSE_CATEGORY_LABELS
3. Add color to EXPENSE_CATEGORY_COLORS
4. Add icon to EXPENSE_CATEGORY_ICONS
5. Update filter options

### Adding New Action
1. Create action config in workflow.config.ts
2. Define side effects
3. Add to appropriate level config
4. Create UI button/dialog
5. Wire up handler

### Customizing Auto-Approval
Edit `AUTO_APPROVAL_THRESHOLDS` in constants:
```typescript
export const AUTO_APPROVAL_THRESHOLDS = {
  level1: 1000,  // Manager: $1K
  level2: 5000,  // Business: $5K
  level3: 0,     // Finance: no auto-approval
};
```
