# Visitor Management Module

A comprehensive visitor management system for tracking visitor registrations, approvals, and check-ins/check-outs.

## Features

### 🎯 Core Functionality
- **Pre-registered Visits**: Employee registers visitor in advance → Host approves → Admin checks in
- **Instant Check-ins**: Walk-in visitor → Admin registers → Host approves → Immediate check-in
- **Real-time Tracking**: Monitor all visitor statuses (Pending, Approved, Rejected, Checked-in, Checked-out)
- **Host Notifications**: Notify employees when visitors arrive for approval

### 📊 Dashboard & Stats
- Total visitors count
- Currently checked-in visitors
- Pending approvals
- Expected visitors today

### 🔍 Advanced Search & Filters
- **Search**: Name, email, phone, company, host name
- **Filters**:
  - Status (Pending, Approved, Rejected, Checked-in, Checked-out, Expired)
  - Purpose (Meeting, Interview, Delivery, Maintenance, Vendor, Personal, Other)
  - Registration Type (Pre-registered, Instant)
  - Host Employee
  - Expected Date

### 📝 Visitor Registration
- Comprehensive visitor information capture
- Host selection with auto-complete
- Purpose and visit details
- Schedule management
- ID verification fields
- Vehicle tracking
- Special requirements (escort, access level)

### 👁️ Visitor Actions
- **View**: Complete visitor details in modal
- **Edit**: Update visitor information
- **Approve/Reject**: Host approval workflow
- **Check-in/Check-out**: Admin actions for visitor lifecycle
- **Export**: Export visitor data (all/filtered)

## Module Structure

```
visitor-management/
├── components/
│   ├── VisitorStatsCards.tsx      # Dashboard stats cards
│   ├── ViewVisitorModal.tsx       # Visitor details modal
│   └── VisitorRegistrationForm.tsx # Add/Edit visitor form
├── VisitorManagement.tsx          # Main page with table
├── types.ts                       # TypeScript types
├── constants.ts                   # Constants & labels
├── mockData.ts                    # Mock data for development
└── index.ts                       # Module exports
```

## Usage

### Navigation
- Main page: `/visitor-management`
- Create new: `/visitor-management?mode=create`
- Edit visitor: `/visitor-management?mode=edit&id={visitorId}`

### URL Parameters
- `mode`: `create` | `edit` - Determines form mode
- `id`: Visitor ID (required when mode=edit)

### Component Integration

```tsx
import { VisitorManagement } from '@/modules/visitor-management';

// In your routing
<Route path="/visitor-management" element={<VisitorManagement />} />
```

## Data Flow

### Pre-registered Flow
1. Employee/Host registers visitor details
2. System sends notification to host for approval
3. Host approves/rejects the visit
4. On arrival day, receptionist verifies and checks in
5. Receptionist checks out when visitor leaves

### Instant Check-in Flow
1. Visitor arrives without prior registration
2. Receptionist registers visitor details
3. System notifies host employee
4. Host approves/rejects in real-time
5. Upon approval, receptionist checks in immediately
6. Receptionist checks out when visitor leaves

## API Integration Points

Currently using mock data. Replace these with actual API calls:

```typescript
// In VisitorManagement.tsx

// Fetch visitors
const fetchVisitors = async () => {
  const response = await api.get('/visitors');
  setVisitors(response.data);
};

// Create visitor
const createVisitor = async (data: VisitorFormData) => {
  await api.post('/visitors', data);
};

// Update visitor
const updateVisitor = async (id: string, data: VisitorFormData) => {
  await api.put(`/visitors/${id}`, data);
};

// Approve visitor
const approveVisitor = async (id: string) => {
  await api.post(`/visitors/${id}/approve`);
};

// Reject visitor
const rejectVisitor = async (id: string, reason: string) => {
  await api.post(`/visitors/${id}/reject`, { reason });
};

// Check-in visitor
const checkInVisitor = async (id: string) => {
  await api.post(`/visitors/${id}/check-in`);
};

// Check-out visitor
const checkOutVisitor = async (id: string) => {
  await api.post(`/visitors/${id}/check-out`);
};
```

## Type Definitions

### Visitor
```typescript
interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  purpose: VisitorPurpose;
  hostEmployeeId: string;
  hostEmployeeName: string;
  status: VisitorStatus;
  registrationType: RegistrationType;
  expectedArrivalDate: string;
  expectedArrivalTime: string;
  // ... more fields
}
```

### Status Types
- `pending`: Awaiting host approval
- `approved`: Approved by host, awaiting check-in
- `rejected`: Rejected by host
- `checked-in`: Currently in premises
- `checked-out`: Visit completed
- `expired`: Expected arrival time passed without check-in

## Customization

### Adding New Purpose Types
Edit `constants.ts`:
```typescript
export const PURPOSE_LABELS: Record<VisitorPurpose, string> = {
  // ... existing
  'custom_purpose': 'Custom Purpose',
};
```

### Adding Custom Filters
In `VisitorManagement.tsx`:
```typescript
const filterConfig = [
  // ... existing filters
  {
    id: 'department',
    label: 'Department',
    type: 'multiselect',
    options: departmentOptions,
  },
];
```

### Styling Status Badges
Edit `constants.ts`:
```typescript
export const VISITOR_STATUS_COLORS: Record<VisitorStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  // ... customize colors
};
```

## Dependencies

- React Hook Form: Form validation
- TanStack Table: Data table functionality
- date-fns: Date formatting
- Lucide React: Icons
- shadcn/ui: UI components

## Future Enhancements

- [ ] Bulk check-in/check-out
- [ ] Visitor photo capture
- [ ] QR code generation for pre-approved visits
- [ ] SMS/Email notifications
- [ ] Visitor badge printing
- [ ] Recurring visitor management
- [ ] Blacklist management
- [ ] Analytics dashboard
- [ ] Mobile app integration
- [ ] Access control system integration

## Best Practices

1. **Security**: Always verify visitor identity before check-in
2. **Privacy**: Handle visitor data per GDPR/privacy regulations
3. **Notifications**: Ensure timely host notifications
4. **Access Control**: Restrict check-in/approval permissions appropriately
5. **Audit Trail**: Log all visitor actions for security audits
