# Space Management System Implementation

## Overview

The space management system enables multi-company visitor coordination for shared buildings, floors, or offices. Companies can create dedicated spaces or connect to existing shared spaces, allowing multiple organizations to share a visitor database and coordinate with shared reception desks.

## Architecture

### Core Concepts

- **Space**: A shared database for managing visitors in a specific location (building, floor, or office)
- **Space Owner**: The company that created the space (has admin rights)
- **Space Members**: Companies approved to use the shared space
- **Connection Request**: Request from a company to join an existing space

### Space Types

1. **Building**: Entire building with shared reception
2. **Floor**: Single floor in a multi-company building
3. **Office**: Specific office space

## Components

### 1. SpaceSetup.tsx

**Location**: `/src/modules/visitor-management/SpaceSetup.tsx`

**Purpose**: Entry point for space management, presents two options:
- Create new space
- Connect to existing space

**Features**:
- Two-card selection UI
- Pending status screen when connection request awaits approval
- Info section explaining space concept
- Mode-based routing (select/create/connect)

**Props**:
- `onComplete`: Callback when space is configured
- `isPending`: Show pending status screen

### 2. SpaceCreationForm.tsx

**Location**: `/src/modules/visitor-management/components/SpaceCreationForm.tsx`

**Purpose**: Form for creating a new visitor management space

**Features**:
- Space name, type, location, address fields
- Conditional floor number field (for floor/office types)
- Capacity and description (optional)
- Automatic space ID generation (`SPACE-[timestamp]`)
- Form validation using Zod schema
- Stores configuration in localStorage (temporary)

**Form Fields**:
```typescript
{
  spaceName: string;          // Required, min 3 chars
  spaceType: 'building' | 'floor' | 'office';  // Required
  location: string;           // Required (city/area)
  address: string;            // Required
  floorNumber?: number;       // Conditional (floor/office only)
  capacity?: number;          // Optional
  description?: string;       // Optional
}
```

### 3. SpaceConnectionForm.tsx

**Location**: `/src/modules/visitor-management/components/SpaceConnectionForm.tsx`

**Purpose**: Form for requesting access to an existing space

**Features**:
- Space ID input field (provided by space owner)
- Request message (explain why joining)
- Creates notification for space owner
- Stores pending request in localStorage
- "What happens next?" guide section

**Form Fields**:
```typescript
{
  spaceId: string;            // Required (exact space ID)
  requestMessage: string;     // Required, min 10 chars
}
```

### 4. NotificationsPage.tsx

**Location**: `/src/modules/visitor-management/NotificationsPage.tsx`

**Purpose**: Manage space connection requests and notifications

**Features**:
- Pending requests section (requires action)
- Previous notifications history (approved/rejected)
- Approve/reject actions for pending requests
- Real-time pending count badge
- Empty state when no notifications

**Sections**:
- **Pending Requests**: Unprocessed connection requests
- **Previous Notifications**: Historical requests with outcomes

## Integration

### VisitorManagement.tsx

The main visitor management page now checks for space configuration:

1. **Loading State**: Shows while checking for space configuration
2. **Space Setup Required**: Shows SpaceSetup if no space configured
3. **Pending Approval**: Shows pending status if connection request awaiting approval
4. **Active Space**: Shows visitor management interface

**Added Features**:
- Notification bell icon with pending count badge
- Space configuration check on mount
- Navigation to notifications page

### Routing

Added routes in `App.tsx`:

```typescript
<Route path="/visitor-management" element={<VisitorManagement />} />
<Route path="/visitor-management/notifications" element={<NotificationsPage />} />
```

## Data Types

### spaceTypes.ts

**Location**: `/src/modules/visitor-management/spaceTypes.ts`

**Key Types**:

```typescript
// Space configuration stored per company
interface SpaceConfiguration {
  spaceId: string;
  status: 'active' | 'pending' | 'rejected';
  isOwner: boolean;
  requestedAt?: string;
  approvedAt?: string;
}

// Full space details
interface Space {
  spaceId: string;
  spaceName: string;
  spaceType: 'building' | 'floor' | 'office';
  location: string;
  address: string;
  floorNumber?: number;
  capacity?: number;
  description?: string;
  ownerId: string;
  ownerCompany: string;
  createdAt: string;
  members: SpaceMember[];
}

// Connection request
interface SpaceConnectionRequest {
  requestId: string;
  spaceId: string;
  requestingCompanyId: string;
  requestingCompany: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Notification
interface SpaceNotification {
  id: string;
  type: 'space_connection_request';
  spaceId: string;
  requestingCompany: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
```

## Storage (LocalStorage - Temporary)

### Keys Used

1. **`visitorManagementSpace`**: Current company's space configuration
   ```json
   {
     "spaceId": "SPACE-1234567890",
     "status": "active",
     "isOwner": true,
     "approvedAt": "2024-01-15T10:00:00Z"
   }
   ```

2. **`spaceNotifications`**: Array of notifications for current company
   ```json
   [
     {
       "id": "NOTIF-1234567890",
       "type": "space_connection_request",
       "spaceId": "SPACE-1234567890",
       "requestingCompany": "Company B",
       "message": "We share the same building...",
       "status": "pending",
       "createdAt": "2024-01-15T09:00:00Z"
     }
   ]
   ```

## User Flows

### Flow 1: Create New Space

1. User opens Visitor Management
2. No space configured → SpaceSetup displayed
3. User clicks "Create New Space"
4. SpaceCreationForm displayed
5. User fills form (name, type, location, etc.)
6. Form validated, space ID generated
7. Configuration saved to localStorage
8. `onComplete` callback triggers
9. VisitorManagement reloads configuration
10. Visitor management interface displayed

### Flow 2: Connect to Existing Space

1. User opens Visitor Management
2. No space configured → SpaceSetup displayed
3. User clicks "Connect to Existing Space"
4. SpaceConnectionForm displayed
5. User enters space ID and message
6. Connection request created
7. Notification sent to space owner
8. Pending status saved to localStorage
9. `onComplete` callback triggers
10. Pending status screen displayed
11. **Space owner** receives notification
12. Space owner approves/rejects request
13. **Requesting company** status updated
14. Visitor management interface becomes available

### Flow 3: Approve Connection Request

1. Space owner has pending notifications
2. Bell icon shows badge with count
3. User clicks bell icon
4. NotificationsPage displayed
5. Pending requests listed at top
6. User reviews request details
7. User clicks "Approve" or "Reject"
8. Notification status updated
9. Toast confirmation shown
10. TODO: Send notification to requesting company

## Next Steps (Backend Integration)

### Required API Endpoints

1. **Space Management**
   - `POST /api/spaces` - Create new space
   - `GET /api/spaces/:id` - Get space details
   - `PUT /api/spaces/:id` - Update space
   - `GET /api/spaces/my-space` - Get current company's space

2. **Connection Requests**
   - `POST /api/spaces/:id/connection-requests` - Request to join space
   - `GET /api/spaces/:id/connection-requests` - Get pending requests
   - `PUT /api/spaces/:id/connection-requests/:requestId` - Approve/reject

3. **Notifications**
   - `GET /api/notifications` - Get user notifications
   - `PUT /api/notifications/:id/read` - Mark as read
   - `GET /api/notifications/count` - Get pending count

4. **Visitors (updated)**
   - `GET /api/visitors?spaceId=:id` - Filter by space
   - Update all visitor endpoints to include spaceId

### Database Schema Changes

1. **spaces table**
   ```sql
   CREATE TABLE spaces (
     space_id VARCHAR(50) PRIMARY KEY,
     space_name VARCHAR(100) NOT NULL,
     space_type ENUM('building', 'floor', 'office'),
     location VARCHAR(100),
     address TEXT,
     floor_number INT,
     capacity INT,
     description TEXT,
     owner_company_id VARCHAR(50),
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

2. **space_members table**
   ```sql
   CREATE TABLE space_members (
     id INT PRIMARY KEY AUTO_INCREMENT,
     space_id VARCHAR(50),
     company_id VARCHAR(50),
     role ENUM('owner', 'member'),
     joined_at TIMESTAMP,
     FOREIGN KEY (space_id) REFERENCES spaces(space_id)
   );
   ```

3. **space_connection_requests table**
   ```sql
   CREATE TABLE space_connection_requests (
     request_id VARCHAR(50) PRIMARY KEY,
     space_id VARCHAR(50),
     requesting_company_id VARCHAR(50),
     message TEXT,
     status ENUM('pending', 'approved', 'rejected'),
     created_at TIMESTAMP,
     reviewed_at TIMESTAMP,
     reviewed_by VARCHAR(50),
     FOREIGN KEY (space_id) REFERENCES spaces(space_id)
   );
   ```

4. **visitors table (add column)**
   ```sql
   ALTER TABLE visitors ADD COLUMN space_id VARCHAR(50);
   ALTER TABLE visitors ADD FOREIGN KEY (space_id) REFERENCES spaces(space_id);
   ```

### Business Logic

1. **Space Creation**
   - Validate company doesn't already have a space
   - Generate unique space ID
   - Set creating company as owner
   - Initialize space with owner as first member

2. **Connection Request**
   - Validate space exists
   - Validate company doesn't already have access
   - Create notification for space owner
   - Store pending request

3. **Request Approval**
   - Validate requester is space owner
   - Add company to space_members
   - Update request status
   - Create notification for requesting company
   - Update company's space configuration

4. **Visitor Filtering**
   - All visitor queries filtered by user's space ID
   - Cross-company visibility within same space
   - Company-specific visibility settings (optional)

## Testing Checklist

- [ ] Create new space flow
- [ ] Space ID generation uniqueness
- [ ] Form validation (all fields)
- [ ] Connection request flow
- [ ] Pending status display
- [ ] Notification creation
- [ ] Approve connection request
- [ ] Reject connection request
- [ ] Notification count badge
- [ ] Navigation between pages
- [ ] localStorage persistence
- [ ] Empty states
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications

## Future Enhancements

1. **Space Management Dashboard**
   - View all members
   - Remove members
   - Edit space details
   - Space analytics

2. **Advanced Permissions**
   - Read-only members
   - Limited visitor creation
   - Approval delegation

3. **Multi-Space Support**
   - Companies with multiple locations  - Switch between spaces
   - Space-specific settings

4. **Visitor Assignments**
   - Assign visitors to specific companies
   - Company-filtered views
   - Inter-company visitor transfers

5. **Notifications**
   - Email notifications
   - In-app notifications
   - Real-time updates via WebSocket
   - Notification preferences

6. **Audit Log**
   - Track all space changes
   - Member join/leave history
   - Configuration change history

## Notes

- Current implementation uses localStorage (temporary)
- Space IDs are generated client-side (will be server-generated)
- Company names are hardcoded (will come from CompanyContext)
- No real-time updates (will use WebSocket/polling)
- No email notifications (will be added with backend)
- Approval workflow is simplified (will have more validation)

## Dependencies

- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod resolver for react-hook-form
- `lucide-react` - Icons
- `date-fns` - Date formatting in notifications
- UI components from `@/components/ui/*`
