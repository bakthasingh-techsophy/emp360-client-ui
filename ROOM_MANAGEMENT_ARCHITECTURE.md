# Room Management - Role-Based Architecture

## Overview
Successfully implemented role-based room management system where users and admins see different dashboards based on their role.

## File Structure

### Entry Point
- **`src/modules/visitor-room/index.tsx`** - Role-based routing wrapper
  - Checks user role (mock: 'admin')
  - Routes admin/receptionist → RoomManagementAdmin
  - Routes user/employee/manager → MyBookings

### Admin Dashboard
- **`src/modules/visitor-room/RoomManagementAdmin.tsx`** - Full admin dashboard
  - 4 tabs with separate state management:
    - Pending Approvals - bookings needing approval
    - Today - today's bookings
    - Upcoming - future bookings
    - All Bookings - complete history
  - Stats cards: Total Rooms, Available, Today, Pending, Total, Utilization
  - GenericToolbar per tab (search, filters, export, column config)
  - DataTable with pagination per tab
  - Direct action buttons:
    - View (Eye icon) - always visible
    - Approve (green) / Reject (red) - only for status='pending'
    - Cancel (red) - only for status='confirmed'
  - Page actions in toolbar:
    - "Manage Rooms" → /room-management/room-form?mode=create
    - "Book for Someone" → /room-management/browse

### User Dashboard
- **`src/modules/visitor-room/MyBookings.tsx`** - Personal bookings dashboard
  - Tabs: Upcoming / Past
  - Stats cards: Upcoming, This Week, Total
  - Popular rooms sidebar
  - Quick actions sidebar
  - Navigate to browse and book rooms

### Supporting Components
- **`src/modules/visitor-room/components/ViewBookingModal.tsx`** - Booking details modal
  - Displays full booking information
  - Room, date/time, attendees, purpose
  - Booked by details
  - Timestamps (created, updated)

### Other Pages (Already Complete)
- **BookingPage.tsx** - Multi-step booking form
- **RoomBrowse.tsx** - Browse and search available rooms
- **RoomForm.tsx** - Add/edit room details

## Routing Structure

```typescript
/room-management → RoomManagement (wrapper)
  ├─ admin/receptionist → RoomManagementAdmin dashboard
  └─ user/employee/manager → MyBookings dashboard

/room-management/browse → RoomBrowse
/room-management/booking-form → BookingPage
/room-management/room-form → RoomForm
```

## Menu Configuration
- Single "Room Management" menu item
- Visible for all roles: user, employee, manager, admin, receptionist
- Menu stays active for all sub-routes

## Filter Configuration
Each admin tab supports these filters:
- status (multiselect) - pending, confirmed, cancelled, rejected
- roomId (multiselect) - filter by room
- purpose (multiselect) - meeting types
- recurrence (select) - none, daily, weekly, monthly
- date (date picker) - booking date
- createdAt (date picker) - audit trail
- updatedAt (date picker) - audit trail
- bookedByName (text) - search by user
- minAttendees (number) - capacity filter

## User Journey

### Regular User Flow
1. Login → Navigate to "Room Management"
2. See MyBookings dashboard (personal context)
3. View upcoming bookings, past bookings, stats
4. Quick action: "Book a Room" → Browse → Book
5. Return to dashboard to see new booking

### Admin Flow
1. Login → Navigate to "Room Management"
2. See RoomManagementAdmin dashboard (management context)
3. Pending tab shows bookings needing approval
4. Approve/Reject directly from table
5. Today tab shows today's schedule
6. Upcoming tab shows future bookings
7. All tab shows complete history
8. "Manage Rooms" → Add/edit room configurations
9. "Book for Someone" → Browse and book on behalf of others

## API Integration Points (TODO)
Currently using mock data. Replace with actual API calls:

1. **User Role Check** - `index.tsx` line 16
   ```typescript
   const userRole = 'admin'; // TODO: Replace with actual auth context
   ```

2. **Fetch Bookings** - `RoomManagementAdmin.tsx` line 138
   ```typescript
   const [bookings] = useState<Booking[]>(mockAdminBookings);
   // TODO: Replace with API call: useQuery or useEffect
   ```

3. **Approve Booking** - `RoomManagementAdmin.tsx` handleApprove
   ```typescript
   console.log('Approve booking:', booking.id);
   // TODO: API call here
   ```

4. **Reject Booking** - `RoomManagementAdmin.tsx` handleReject
   ```typescript
   console.log('Reject booking:', booking.id);
   // TODO: API call here
   ```

5. **Cancel Booking** - `RoomManagementAdmin.tsx` handleCancel
   ```typescript
   console.log('Cancel booking:', booking.id);
   // TODO: API call here
   ```

## Key Features

### Context-First UX
- Users see THEIR bookings immediately (personal context)
- Admins see PENDING APPROVALS immediately (management context)
- Same URL, different relevant content based on role

### Separate State Per Tab
- Each tab maintains its own:
  - Search query
  - Active filters
  - Visible columns
  - Pagination state
- Prevents state conflicts when switching tabs

### Direct Action Buttons
- No dropdown menus
- Clear, accessible actions
- Conditional rendering based on status
- Visual feedback with colors (green for approve, red for reject/cancel)

### Audit Trail
- createdAt and updatedAt filters for compliance
- Timestamps shown in booking details
- Export functionality for reporting

## Technical Stack
- React + TypeScript
- React Router v6 (sub-routing)
- TanStack Table (DataTable)
- GenericToolbar (search, filters, export, column config)
- date-fns (date formatting)
- shadcn/ui components

## Navigation Updates Applied
All navigation paths updated to use `/room-management/*` pattern:
- BookingPage.tsx (3 locations)
- RoomBrowse.tsx (3 locations)
- RoomDetailsModal.tsx (2 locations)
- MyBookings.tsx (15 locations)
- ImageCarousel.tsx (1 location)
- App.tsx (route configuration)
- menuConfig.tsx (single menu item)

## Status
✅ Complete and ready for integration with backend API
⚠️ Contains unused import warnings (non-blocking)
🔄 TODO: Replace mock data with actual API calls
🔄 TODO: Integrate with authentication context for role checking
