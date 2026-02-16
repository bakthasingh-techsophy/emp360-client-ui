# Leave Management System Module

## Overview
Comprehensive leave and holiday management system for EMP360. This module handles all aspects of employee leave tracking, holiday management, and leave policy configuration.

## Module Structure

```
leave-management-system/
├── LeaveHoliday.tsx          # Main leave & holiday page
├── LeaveSettings.tsx         # Leave configuration & settings page
├── components/               # Leave-related components
│   ├── AddRequestModal.tsx
│   ├── ApplyLeaveDialog.tsx
│   ├── LeaveBalanceCards.tsx
│   ├── LeaveHistoryTable.tsx
│   ├── MyLeaveApplications.tsx
│   ├── MyLeaveCredits.tsx
│   ├── TeamLeaveApplications.tsx
│   ├── TeamLeaveApplicationsTable.tsx
│   ├── TeamLeaveCredits.tsx
│   └── index.ts
├── holiday-management/       # Holiday management subsystem
│   ├── HolidayManagement.tsx
│   ├── HolidayForm.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── HolidayCard.tsx
│   │   ├── HolidayCards.tsx
│   │   └── HolidayCompanyModal.tsx
│   └── index.ts
├── types/
│   ├── leave.types.ts              # Leave-related type definitions
│   └── leaveConfiguration.types.ts # Leave configuration & policy types
├── data/
│   └── mockLeaveData.ts      # Mock leave data for development
├── index.ts                  # Module exports
└── README.md                 # This file
```

## Features

### Leave Management
- **Leave Applications**: Apply for leaves with balance validation
- **Leave Approvals**: Manager approvals for team leave requests
- **Leave Credits**: Track leave balances and accruals
- **Leave History**: View past leave applications and status
- **Leave Types**: Configure different types of leaves (Casual, Sick, Earned, etc.)

### Holiday Management
- **Holiday Calendar**: Company-wide holiday definitions
- **Multi-Company Support**: Manage holidays across different companies
- **Holiday Types**: Regular holidays, optional holidays, floating holidays
- **Holiday Assignment**: Assign holidays to specific companies/locations

### Leave Settings
- **Leave Type Configuration**: Define and customize leave types
- **Leave Policies**: Set up leave accrual rules and policies
- **Carry Forward Rules**: Configure leave carry-forward policies
- **Encashment Rules**: Define leave encashment policies

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/leave-holiday` | LeaveHoliday | Main leave & holiday management page |
| `/leave-holiday/settings` | LeaveSettings | Leave configuration page |
| `/holiday-management` | HolidayManagement | Holiday calendar management |
| `/holiday-management/form` | HolidayForm | Create/Edit holiday form |

## Permissions

The module uses the `leave-management-system` resource with the following roles:

| Role ID | Role Name | Description | Permissions |
|---------|-----------|-------------|-------------|
| `lmsa` | Leave Management System Admin | Full access including settings | view, create, edit, delete, approve, reject, configure, settings |
| `lmss` | Leave Management Settings | Can manage settings & configurations | view, settings, configure |
| `lmsv` | Leave Management Viewer | View-only access | view |

## Context & Services

### Contexts Used
- `HolidayContext` - Manages holiday state and operations
- (Future: `LeaveContext` - Will manage leave applications and balances)

### Services Used
- `holidayService` - API operations for holiday management
- (Future: `leaveService` - API operations for leave management)

## Components

### Leave Components
- **LeaveBalanceCards**: Display leave balance summary cards
- **ApplyLeaveDialog**: Dialog for applying new leave
- **MyLeaveApplications**: User's leave application history
- **TeamLeaveApplications**: Team members' leave requests (for managers)
- **MyLeaveCredits**: User's leave credit details
- **TeamLeaveCredits**: Team members' leave credits overview
- **LeaveHistoryTable**: Tabular view of leave history
- **AddRequestModal**: Modal for submitting leave requests

### Holiday Components
- **HolidayCard**: Individual holiday card display
- **HolidayCards**: Grid of holiday cards
- **HolidayCompanyModal**: Modal for assigning holidays to companies

## Usage Example

```tsx
// Import the main pages
import { LeaveHoliday, LeaveSettings } from '@/modules/leave-management-system';

// Import holiday management
import { HolidayManagement, HolidayForm } from '@/modules/leave-management-system/holiday-management';

// Import components
import { 
  LeaveBalanceCards, 
  ApplyLeaveDialog,
  MyLeaveApplications 
} from '@/modules/leave-management-system/components';

// Import types
import { 
  LeaveApplication, 
  LeaveBalance,
  LeaveConfiguration,
  CreditPolicy,
  MonetizationPolicy
} from '@/modules/leave-management-system';
import { Holiday } from '@/modules/leave-management-system/holiday-management/types';
```

## Type Definitions

### Leave Application Types (`leave.types.ts`)
- **LeaveType**: Basic leave type information
- **LeaveBalance**: Employee leave balance tracking
- **LeaveApplication**: Leave request details
- **LeaveComment**: Comments on leave applications
- **ApplyLeaveFormData**: Form data for applying leave

### Leave Configuration Types (`leaveConfiguration.types.ts`)
Comprehensive leave policy configuration matching backend models:

- **LeaveConfiguration**: Main leave configuration entity
- **LeaveProperties**: Allowed leave types and properties
- **CreditPolicy**: Leave credit/accrual policy
- **MonetizationPolicy**: Leave encashment policy
- **ExpirePolicy**: Leave expiration and carry-forward policy
- **CalendarConfiguration**: Calendar and fiscal year settings
- **Restrictions**: Leave restrictions and approval rules
- **ProbationRestrictions**: Probation-specific restrictions
- **ApplicableCategories**: Employee applicability rules

**Enums & Constants:**
- `LeaveCategories`: flexible, accrued, special
- `LeaveTypeOptions`: fullDay, partialDay, partialTimings
- `CreditFrequencies`: monthly, yearly, quarterly, custom
- `ExpireFrequencies`: monthly, afterCredit, yearly, custom
- `GenderOptions`: male, female, other, all
- `EmployeeTypeOptions`: fullTime, partTime, intern, contract, all

## Migration Notes

This module was separated from `time-attendance` module to provide better organization and modularity. The following components were moved:

**From `time-attendance`:**
- LeaveHoliday.tsx
- LeaveSettings.tsx
- holiday-management/ (entire folder)
- Leave-related components
- Leave types and mock data

**Remained in `time-attendance`:**
- AttendanceManagement.tsx
- ShiftSchedule.tsx
- OvertimeManagement.tsx
- Attendance-related components

## Future Enhancements

1. **Leave Context**: Create dedicated LeaveContext for state management
2. **Leave Service**: Implement leaveService for API operations
3. **Leave Policies**: Advanced leave policy engine
4. **Leave Forecasting**: Predictive leave analytics
5. **Integration**: Integration with attendance and payroll modules
6. **Notifications**: Leave approval notifications and reminders
7. **Mobile View**: Responsive design for mobile devices
8. **Bulk Operations**: Bulk leave approvals and rejections

## Related Modules

- **time-attendance**: Attendance tracking and shift management
- **self-service**: Employee self-service portal (includes leave applications)
- **user-management**: Employee data and permissions
- **payroll**: Integration for leave deductions and encashments

## Development

To add new leave-related features:

1. Add components to `components/` folder
2. Export from `components/index.ts`
3. Update types in `types/leave.types.ts`
4. Update main module export in `index.ts`
5. Add routes in `App.tsx`
6. Update permissions in `permissions.json` if needed

## Notes

- All leave balance calculations should validate against available credits
- Holiday assignments are company-specific
- Leave approvals follow the organizational hierarchy
- Leave types can be configured per company policy
