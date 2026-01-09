# Expense Management Module

Complete multi-level approval workflow system for organization-wide expense tracking and reimbursement.

## Quick Start

### Access the System
Navigate to `/expense-management` in your browser.

### Role-Based Views
The system automatically shows the appropriate dashboard based on your role:
- **Employee**: Personal expense list
- **Manager**: Level 1 approval dashboard
- **Business Head**: Level 2 approval dashboard
- **Finance**: Level 3 approval dashboard with payment confirmation
- **Admin**: All dashboards with tabs

### Change User Role (Testing)
Edit `src/modules/expenses-assets/data/mockData.ts`:
```typescript
export const currentUser: User = {
  id: 'user-001',
  name: 'John Doe',
  email: 'john.doe@company.com',
  role: 'employee', // Change to: 'manager', 'business_head', 'finance', 'admin'
};
```

## Workflow

### Expense Lifecycle
1. **Employee submits** → `submitted` status
2. **Manager approves** → `level1_approved` status
3. **Business approves** → `level2_approved` status
4. **Finance confirms payment** → `paid` status

At any level, approver can:
- ✅ **Approve**: Move to next level
- ❌ **Reject**: End workflow, notify employee
- 🔄 **Return**: Request clarification, send back to employee

### Auto-Approval
- **Manager**: Expenses ≤ $1,000 auto-approved
- **Business**: Expenses ≤ $5,000 auto-approved
- **Finance**: All expenses require manual review

## Features

### Employee Dashboard
- View all personal expenses
- Filter by status, category, date range
- Search expenses
- Create new expenses (TODO)
- Edit draft expenses (TODO)
- Cancel submitted/approved expenses
- Export expense reports

### Approval Dashboards
- **Pending Tab**: Expenses awaiting your approval
- **Approved Today**: Today's approvals
- **Rejected Today**: Today's rejections
- **All Expenses**: Complete list
- Filter by category, amount, urgent flag
- Click expense to review and take action (TODO)
- Export reports

### Statistics
- Total expenses count
- Pending count and amount
- Approved count
- Paid count and amount

## Mock Data

7 pre-loaded expenses covering all scenarios:
1. $850 flight - PAID (completed all levels)
2. $750 hotel - Awaiting Finance
3. $320 client dinner - Awaiting Business
4. $180 team lunch - Awaiting Manager
5. $1200 laptop - REJECTED by manager
6. $299 software - DRAFT
7. $75 taxi - Submitted, URGENT

## Configuration

### Expense Categories
Travel, Accommodation, Meals, Transport, Office Supplies, Equipment, Training, Entertainment, Software, Other

### Payment Methods
Corporate Card, Personal Card (Reimbursement), Cash, Bank Transfer, Digital Wallet

### Approval Levels
Configure in `config/workflow.config.ts`:
- Actions per level
- Auto-approval thresholds
- Side effects (notifications, emails, webhooks)
- Role requirements

## Files

### Core
- `index.tsx` - Main entry point with role-based routing
- `EmployeeExpenseList.tsx` - Employee dashboard
- `ApprovalDashboard.tsx` - Approval dashboard (all levels)

### Foundation
- `types/expense.types.ts` - TypeScript definitions
- `constants/expense.constants.ts` - Labels, colors, icons
- `config/workflow.config.ts` - Workflow configuration
- `data/mockData.ts` - Mock users and expenses

### Components
- `ExpenseStatusBadge.tsx` - Status badge with colors
- `ExpenseCategoryBadge.tsx` - Category badge with icons
- `ApprovalTimeline.tsx` - Visual approval timeline
- `ExpenseCard.tsx` - Expense card for list view
- `ExpenseStatsCards.tsx` - Dashboard KPI cards

## Pending Implementation

### High Priority
- [ ] Expense submission form
- [ ] Approval action modals (approve/reject/return/confirm payment)
- [ ] Expense details modal
- [ ] File upload for receipts

### Medium Priority
- [ ] API integration (replace mock data)
- [ ] Workflow engine execution
- [ ] Real-time notifications
- [ ] Edit expense functionality

### Future Enhancements
- [ ] Bulk approval actions
- [ ] Expense comments/discussion
- [ ] Approval delegation
- [ ] Out-of-office routing
- [ ] PDF receipt generation
- [ ] Email digest

## Support

For questions or issues, refer to:
- `IMPLEMENTATION_SUMMARY.md` - Detailed technical documentation
- `config/workflow.config.ts` - Workflow configuration guide
- Mock data in `data/mockData.ts` - Example usage

## License

Internal tool for organization use.
