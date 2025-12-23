# Visitor Management Module

A comprehensive visitor management system for tracking and managing visitor registrations, check-ins, and check-outs with role-based form logic.

## Features

### Two Registration Flows

1. **Pre-registered Visitors**
   - Registered in advance before arrival
   - Requires approval before check-in
   - Ideal for scheduled meetings and appointments

2. **Instant Check-in**
   - Walk-in visitors without prior registration
   - Quick registration at reception
   - Requires immediate approval

### Role-Based Form Logic ⭐

The registration form adapts based on the user's role:

#### For Employees
- **Default Behavior**: Employee is automatically set as the host (disabled field)
- **Registration Type**: Always "Pre-registered"
- **Register for Other**: Optional checkbox to register visitors for other employees
  - When checked: Host selection is enabled
  - When unchecked: Current employee is the host

#### For Administrators
- **Full Control**: Can select any employee as host
- **Registration Type**: Can choose between "Pre-registered" or "Instant Check-in"
- **No Restrictions**: All fields are editable

### Key Capabilities

- **Visitor Registration**: Comprehensive form with visitor details, visit purpose, and schedule
- **Status Tracking**: Monitor visitors through different states (Pending, Approved, Checked-in, Checked-out, Rejected)
- **Search & Filters**: Find visitors by name, email, status, or date range
- **Approval Workflow**: Review and approve/reject visitor registrations
- **Check-in/Check-out**: Track visitor entry and exit times
- **Statistics Dashboard**: View current visitor stats and trends
- **Export Functionality**: Export visitor data to CSV or PDF

## Components

### Main Components

1. **VisitorManagement.tsx**
   - Main page with visitor table
   - Statistics cards
   - Search and filter functionality
   - Bulk actions and export options

2. **VisitorRegistrationForm.tsx** ⭐
   - Add/edit visitor form with **role-based logic**
   - Form validation with React Hook Form
   - **shadcn DatePicker** for date selection
   - Custom **TimePicker** for 12-hour time format
   - Auto-fills host for employees (unless registering for others)
   - Props:
     - `mode`: 'create' | 'edit'
     - `visitorId`: string (for edit mode)
     - `currentUserRole`: 'admin' | 'employee'
     - `currentUserId`: string (employee ID)

3. **VisitorStatsCards.tsx**
   - Real-time visitor statistics
   - Total visitors, checked-in count, pending approvals
   - Uses theme colors for consistent styling

4. **ViewVisitorModal.tsx**
   - Detailed visitor information display
   - Visit history and timeline
   - Action buttons for approval/rejection

5. **TimePicker.tsx** ⭐
   - Custom 12-hour time picker component
   - Three selects: Hour (01-12), Minute (00-59), Period (AM/PM)
   - Built with shadcn Select components
   - Format: "02:00 PM"

## File Structure

```
visitor-management/
├── components/
│   ├── VisitorRegistrationForm.tsx  # Role-based registration form
│   ├── VisitorStatsCards.tsx        # Statistics cards
│   ├── ViewVisitorModal.tsx         # Visitor details modal
│   └── TimePicker.tsx               # 12-hour time picker
├── types.ts                         # TypeScript interfaces
├── constants.ts                     # Status colors, options
├── mockData.ts                      # Sample data
├── VisitorManagement.tsx            # Main page
├── index.ts                         # Module exports
└── README.md                        # Documentation
```

## Usage

### Basic Usage

```tsx
import { VisitorManagement } from '@/modules/visitor-management';

function App() {
  return <VisitorManagement />;
}
```

### Registration Form with Role

```tsx
import { VisitorRegistrationForm } from '@/modules/visitor-management';

// For Employee
function EmployeeRegisterVisitor() {
  return (
    <VisitorRegistrationForm 
      mode="create"
      currentUserRole="employee"
      currentUserId="emp001"
    />
  );
}

// For Admin
function AdminRegisterVisitor() {
  return (
    <VisitorRegistrationForm 
      mode="create"
      currentUserRole="admin"
      currentUserId="admin001"
    />
  );
}
```

### Using TimePicker

```tsx
import { TimePicker } from '@/modules/visitor-management';
import { useState } from 'react';

function MyForm() {
  const [time, setTime] = useState('09:00 AM');
  
  return (
    <div>
      <label>Select Time</label>
      <TimePicker 
        value={time} 
        onChange={setTime} 
      />
    </div>
  );
}
```

## Data Flow

### Employee Registration Flow
1. **Employee Opens Form**: Host is auto-set to self (disabled)
2. **Optional**: Check "Register for Other" to select different host
3. **Fill Details**: Visitor info, purpose, schedule (with DatePicker & TimePicker)
4. **Submit**: Creates pre-registered visitor entry
5. **Approval**: Admin reviews and approves/rejects
6. **Check-in**: On arrival, receptionist checks in

### Admin Registration Flow
1. **Admin Opens Form**: All options available
2. **Select Type**: Pre-registered or Instant Check-in
3. **Select Host**: Choose any employee as host
4. **Fill Details**: Complete visitor information
5. **Submit**: Creates visitor entry based on selected type
6. **Workflow**: Follows approval and check-in process

## Validation Rules

### Required Fields
- Name (string)
- Email (valid email format)
- Phone (string)
- Purpose of Visit (dropdown selection)
- Host Employee (auto-selected for employees, unless "Register for Other")
- Expected Arrival Date (shadcn DatePicker)
- Expected Arrival Time (12-hour TimePicker)

### Optional Fields
- Company/Organization
- ID Type & Number
- Purpose Details (textarea)
- Expected Departure Time
- Additional Notes

## Status Flow

```
Pending → Approved → Checked-in → Checked-out
        ↘ Rejected
```

## Styling Guidelines

### Theme-Based Colors ⭐
- **All colors use shadcn theme variables**
- No hardcoded colors (e.g., bg-blue-100, text-blue-600)
- Uses: `bg-primary`, `text-primary`, `bg-muted`, `text-muted-foreground`, etc.
- Ensures consistent theming and easy CSS customization

### Benefits
- Easy to change theme colors globally
- Consistent with rest of the application
- Supports light/dark mode automatically

## Time Format

- **12-Hour Format**: All times displayed as "02:00 PM"
- **TimePicker Component**: Custom component with hour/minute/period dropdowns
- **User-Friendly**: Intuitive time selection without keyboard input

## Date Selection

- **shadcn Calendar Component**: Consistent UI with rest of the app
- **Popover Interface**: Dropdown calendar picker
- **Date Formatting**: Uses date-fns for formatting (PPP format)

## API Integration Points

The module is ready for API integration at these points:

```typescript
// Registration Form
const onSubmit = async (data: VisitorFormData) => {
  // POST /api/visitors or PUT /api/visitors/{id}
  await api.post('/visitors', data);
};

// Approve Visitor
const handleApprove = async (id: string) => {
  // POST /api/visitors/{id}/approve
  await api.post(`/visitors/${id}/approve`);
};

// Reject Visitor
const handleReject = async (id: string) => {
  // POST /api/visitors/{id}/reject
  await api.post(`/visitors/${id}/reject`);
};

// Check-in
const handleCheckIn = async (id: string) => {
  // POST /api/visitors/{id}/check-in
  await api.post(`/visitors/${id}/check-in`);
};

// Check-out
const handleCheckOut = async (id: string) => {
  // POST /api/visitors/{id}/check-out
  await api.post(`/visitors/${id}/check-out`);
};
```

## Future Enhancements

- Real-time notifications for host employees
- QR code generation for visitor badges
- Photo capture integration
- SMS/Email notifications
- Visitor history and analytics
- Integration with access control systems
- Multi-tenancy support
- Visitor badge printing
- Recurring visitor profiles

## Development Notes

### Mock Data
- Sample data available in `mockData.ts`
- 6 sample visitors with different statuses
- 5 sample employees for host selection

### Testing
- Test both employee and admin roles
- Verify "Register for Other" checkbox behavior
- Test DatePicker and TimePicker functionality
- Validate form submission with different scenarios

### Dependencies
- React Hook Form (form validation)
- shadcn/ui (UI components)
- TanStack Table (data table)
- date-fns (date formatting)
- lucide-react (icons)

## Summary of Recent Updates

✅ **Removed hardcoded colors** - All colors now use theme variables  
✅ **Added TimePicker component** - 12-hour format time selection  
✅ **Integrated shadcn DatePicker** - Consistent date selection UI  
✅ **Implemented role-based form logic** - Different behavior for employees vs admins  
✅ **Added "Register for Other" checkbox** - Employees can register for other hosts  
✅ **Auto-fill host for employees** - Host field disabled by default for employees  
✅ **Removed Additional Information section** - Simplified form (removed vehicle, escort fields)  
✅ **Updated time format to 12-hour** - All times as "02:00 PM" format  
