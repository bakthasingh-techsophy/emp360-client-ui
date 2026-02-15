# Menu Resource Restriction - Implementation Checklist

## Overview
This checklist helps you implement menu and route restrictions based on JWT token `resource_access` claims.

## ✅ Completed Components

### Core System (100% implemented)
- [x] Token utility functions (`tokenUtils.ts`)
  - JWT decoding and parsing
  - Resource access checking
  - Role validation helpers
  
- [x] Menu resource mapping (`menuResourceMap.ts`)
  - Complete menu-to-resource mappings
  - Helper functions for checking resource requirements
  
- [x] AuthContext updates (`AuthContext.tsx`)
  - Token state management
  - Resource access methods exposed via `useAuth()` hook
  - JWT token stored and managed
  
- [x] AppShell filtering (`AppShell.tsx`)
  - Automatic menu item filtering based on resource access
  - Filtered menu picker with restricted items
  - Both sidebar and menu picker respect resource restrictions
  
- [x] Route protection component (`RequireResource.tsx`)
  - Restricts route access by resource
  - Shows denial message or redirects
  - Reusable across the app

## 📋 Protected Routes Status

### Status Legend
- ✅ Protected - Route has RequireResource wrapper
- ⚠️ Partial - Some variants protected but not all
- ❌ Not Protected - Route needs RequireResource wrapper
- ➕ Optional - Route doesn't require protection or uses menu visibility

### Core Modules

#### User Management (`/user-management/*`)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `user-management`
- Routes to protect:
  - `/user-management` - Main page
  - `/user-management/settings` - Admin settings
  - `/user-management/employee-onboarding` - Employee onboarding
  - `/user-management/employee-details/:id` - Employee details
  
**Action required**: Wrap these routes in `<RequireResource resourceId="user-management" showDenial>`

#### Company Management (`/company-management/*`)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `user-management`
- Routes to protect:
  - `/company-management` - Main page
  
**Action required**: Wrap in RequireResource with `resourceId="company-management"`

#### Visitor Management (`/visitor-management/*`)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `visitor-management`
- Routes to protect:
  - `/visitor-management` - Main page
  - `/visitor-management/details/:id` - Details
  
**Action required**: Wrap in RequireResource with `resourceId="visitor-management"`

#### Room Management (`/room-management/*`)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `space-management`
- Routes to protect:
  - `/room-management` - Main page
  
**Action required**: Wrap in RequireResource with `resourceId="room-management"`

#### Leave & Holiday Management (`/leave-holiday/*`, `/holiday-management/*`)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `time-attendance`
- Routes to protect:
  - `/leave-holiday` - Main page
  - `/holiday-management` - Settings
  
**Action required**: Wrap in RequireResource with `resourceId="leave-holiday"` or `resourceId="holiday-management"`

#### Attendance Management (`/attendance-management/*`)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `time-attendance`
- Routes to protect:
  - `/attendance-management` - Main page
  
**Action required**: Wrap in RequireResource with `resourceId="attendance-management"`

#### Self-Service (`/my-profile/*`, `/my-attendance-leave/*`, etc.)
- Status: ❌ NOT PROTECTED (Optional - these are less sensitive)
- Required Resource: `self-service`
- Routes to protect (optional):
  - `/my-profile` - User profile
  - `/my-attendance-leave` - Attendance view
  - `/my-payslips` - Payslips view
  
**Action required**: Optional protection, but recommended to wrap

#### Account Profile (`/account/profile/*`)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `account`
- Routes to protect:
  - `/account/profile` - Account profile page
  
**Action required**: Wrap in RequireResource with appropriate resource ID (likely wrapped in RequireAuth is sufficient)

#### Payroll (`/salary-structure/*`, `/payroll-run/*`, etc.)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `payroll`
- Routes to protect:
  - All payroll-related routes
  
**Action required**: Wrap routes in RequireResource with appropriate resource IDs

#### Recruitment (`/job-requisitions/*`, `/candidate-tracking/*`, etc.)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `recruitment`
- Routes to protect:
  - All recruitment-related routes
  
**Action required**: Wrap routes in RequireResource with appropriate resource IDs

#### Core HR (`/employee-database/*`, `/org-structure/*`, etc.)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `core-hr`
- Routes to protect:
  - All core HR routes
  
**Action required**: Wrap routes in RequireResource with appropriate resource IDs

#### Analytics (`/hr-dashboard/*`, `/workforce-analytics/*`, etc.)
- Status: ❌ NOT PROTECTED (Needs implementation)
- Required Resource: `analytics`
- Routes to protect:
  - All analytics routes
  
**Action required**: Wrap routes in RequireResource with appropriate resource IDs

#### Other Modules (Performance, Expenses, Projects, etc.)
- Status: ❌ NOT PROTECTED (Needs implementation)
- See `menuResourceMap.ts` for resource mappings
- Routes to protect: All corresponding routes
  
**Action required**: Review module and wrap main routes

## 🔧 Implementation Steps

### Step 1: Identify Your Route Files
Find all route definitions in your project (usually in `App.tsx`, `main.tsx`, or a `routes/` folder).

### Step 2: Import RequireResource
In your route configuration file:
```typescript
import { RequireResource } from '@/components/RequireResource';
```

### Step 3: Wrap Protected Routes
For each route that needs protection, wrap the component:

**Before:**
```typescript
<Route path="/user-management" element={<UserManagement />} />
```

**After:**
```typescript
<Route 
  path="/user-management" 
  element={
    <RequireResource resourceId="user-management" showDenial>
      <UserManagement />
    </RequireResource>
  } 
/>
```

### Step 4: Verify Menu Resource Mapping
Ensure the `resourceId` matches the menu ID (or a component ID) that maps correctly in `menuResourceMap.ts`.

```typescript
// Check mapping in menuResourceMap.ts
export const menuResourceMap = {
  'user-management': 'user-management',  // ✓ Correct
  'visitor-management': 'visitor-management',  // ✓ Correct
  'room-management': 'space-management',  // ✓ Note: different ID
  // ...
};
```

### Step 5: Test Each Route
1. Login with user having specific resources
2. Check menu shows/hides correctly
3. Try direct URL access - should restrict if no access
4. Try URL access with correct resource - should allow
5. Try URL access without resource - should show denial message or redirect

## 📊 Quick Statistics

- **Total Menu Items**: 60+
- **Resource Types**: 13
- **Utility Functions**: 7
- **Auth Context Methods**: 4
- **Protected Routes to Update**: ~40+

## 🚀 Recommended Priority

### Phase 1: Critical (Do First)
1. User Management routes
2. Company Management routes
3. Visitor Management routes
4. Room Management routes

### Phase 2: Important (Do Second)
1. Leave & Holiday Management
2. Attendance Management
3. Account Profile
4. Admin routes (Settings, Audit Logs, etc.)

### Phase 3: Nice to Have (Optional)
1. Self-Service routes
2. Analytics routes
3. Payroll routes
4. Recruitment routes
5. Performance routes

## 💡 Usage Examples

### Example: Protecting User Management Routes
```typescript
import { RequireResource } from '@/components/RequireResource';

// In your routes configuration:
const routes = [
  {
    path: '/user-management',
    element: (
      <RequireResource resourceId="user-management" showDenial>
        <UserManagement />
      </RequireResource>
    ),
  },
  {
    path: '/user-management/settings',
    element: (
      <RequireResource resourceId="user-management" showDenial>
        <UserManagementSettings />
      </RequireResource>
    ),
  },
  {
    path: '/company-management',
    element: (
      <RequireResource resourceId="company-management" showDenial>
        <CompanyManagement />
      </RequireResource>
    ),
  },
];
```

### Example: Checking Access in Component
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const auth = useAuth();
  
  // Check resource access
  if (!auth.hasResourceAccess('user-management')) {
    return <div>You don't have access to User Management</div>;
  }
  
  // Check specific role
  const isAdmin = auth.hasResourceRole('user-management', 'uma');
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      <div>Available resources: {auth.getAvailableResources().join(', ')}</div>
    </div>
  );
}
```

## ✨ Features Included

✅ **Automatic Menu Filtering**
- Menus hidden from UI if user lacks resource access

✅ **Route Protection**
- Direct URL access restricted without proper resource access

✅ **Flexible Denial Handling**
- Show restricted message (`showDenial=true`)
- Auto-redirect to dashboard (`showDenial=false`)

✅ **Resource Role Checking**
- Check specific roles within a resource

✅ **JWT Token Parsing**
- Automatic decoding of JWT tokens
- No external dependencies needed

✅ **Performance Optimized**
- Memoized filtering
- Efficient token parsing
- No excessive re-renders

## 🔒 Security Considerations

⚠️ **Always remember:**
1. Client-side checks are for UX only
2. Backend must validate all requests
3. Token should be validated on each API call
4. Sensitive operations must be authorized on server
5. Never trust client-side permission checks alone

## 📝 Notes

- The system integrates with existing Keycloak authentication
- Token is automatically decoded and cached in auth context
- Menu filtering is applied automatically in AppShell
- No additional configuration needed beyond wrapping routes

## 🎯 Next Steps

1. Locate your route configuration file
2. Start with Phase 1 routes (User Management, etc.)
3. Wrap each route with `RequireResource`
4. Test with different users having different resources
5. Move to Phase 2 routes
6. Complete with Phase 3 routes

## 📖 Reference Files

- Implementation Details: [MENU_RESOURCE_RESTRICTION.md](./MENU_RESOURCE_RESTRICTION.md)
- Token Utilities: [src/lib/tokenUtils.ts](./src/lib/tokenUtils.ts)
- Menu Mappings: [src/config/menuResourceMap.ts](./src/config/menuResourceMap.ts)
- Auth Context: [src/contexts/AuthContext.tsx](./src/contexts/AuthContext.tsx)
- AppShell: [src/components/AppShell/AppShell.tsx](./src/components/AppShell/AppShell.tsx)
- Route Protection: [src/components/RequireResource.tsx](./src/components/RequireResource.tsx)

## Questions or Issues?

Refer to the troubleshooting section in [MENU_RESOURCE_RESTRICTION.md](./MENU_RESOURCE_RESTRICTION.md) or check browser console for token decoding debug information.
