# Menu & Route Resource Restriction Guide

## Overview

This system restricts menu visibility and route access based on the user's JWT token `resource_access` claims. If a user doesn't have access to a specific resource in their token, they won't see the menu item and cannot access the route directly.

## How It Works

### 1. JWT Token Structure

The system looks for `resource_access` in the JWT token:

```json
{
  "resource_access": {
    "user-management": {
      "roles": ["uma", "umv", "ume", "umd"]
    },
    "account": {
      "roles": ["manage-account", "view-profile"]
    },
    "visitor-management": {
      "roles": ["visitor-viewer", "visitor-admin"]
    }
  }
}
```

### 2. Resource Mapping

Each menu item is mapped to a resource in [menuResourceMap.ts](./menuResourceMap.ts):

```typescript
export const menuResourceMap: Record<string, string> = {
  'user-management': 'user-management',
  'company-management': 'user-management',
  'visitor-management': 'visitor-management',
  'room-management': 'space-management',
  // ... more mappings
};
```

### 3. Menu Filtering

The AppShell component automatically filters menu items based on resource access:

```typescript
const filteredMenuItems = useMemo(() => {
  return menuItems.filter((item) => {
    const resource = getMenuResource(item.id);
    if (resource) {
      return auth.hasResourceAccess(resource);
    }
    return true;
  });
}, [menuItems, auth.token]);
```

### 4. Route Protection

Routes should be wrapped with `RequireResource` component to prevent direct URL access:

```tsx
<RequireResource resourceId="user-management" showDenial>
  <UserManagement />
</RequireResource>
```

## Usage Examples

### Example 1: Check Resource Access in Component

```tsx
import { useAuth } from '@/contexts/AuthContext';

function UserManagementPage() {
  const auth = useAuth();

  if (!auth.hasResourceAccess('user-management')) {
    return <div>Access Denied</div>;
  }

  return <div>User Management Content</div>;
}
```

### Example 2: Protect a Route

```tsx
import { RequireResource } from '@/components/RequireResource';
import UserManagement from '@/modules/user-management/UserManagement';

// In your route configuration:
<RequireResource resourceId="user-management" showDenial>
  <UserManagement />
</RequireResource>
```

### Example 3: Check for Specific Role in Resource

```tsx
import { useAuth } from '@/contexts/AuthContext';

function AdminPanel() {
  const auth = useAuth();
  
  const isUserAdmin = auth.hasResourceRole('user-management', 'uma');
  
  return isUserAdmin ? <AdminContent /> : <div>Not an admin</div>;
}
```

### Example 4: Get All Roles for Resource

```tsx
import { useAuth } from '@/contexts/AuthContext';

function RoleDisplay() {
  const auth = useAuth();
  
  const roles = auth.getResourceRoles('user-management');
  
  return <div>Your roles: {roles.join(', ')}</div>;
}
```

## Available Token Utilities

The `tokenUtils.ts` file provides these helper functions:

```typescript
// Parse JWT and extract resource_access
getResourceAccess(token): object;

// Get roles for a specific resource
getResourceRoles(token, resource): string[];

// Check if user has access to a resource
hasResourceAccess(token, resource): boolean;

// Check if user has a specific role in a resource
hasResourceRole(token, resource, role): boolean;

// Get all available resources
getAvailableResources(token): string[];

// Check if token is expired
isTokenExpired(token): boolean;

// Get user info from token
getUserInfoFromToken(token): object;
```

## Adding New Resources

### Step 1: Define Resource in Token

Work with your backend/Keycloak admin to add the resource and roles:

```json
{
  "resource_access": {
    "my-new-resource": {
      "roles": ["role1", "role2"]
    }
  }
}
```

### Step 2: Map Menu Items

Add mappings in [menuResourceMap.ts](./menuResourceMap.ts):

```typescript
export const menuResourceMap: Record<string, string> = {
  // ... existing mappings
  'my-menu-item': 'my-new-resource',
  'my-other-item': 'my-new-resource',
};
```

### Step 3: Protect Routes

Wrap the route with `RequireResource`:

```tsx
<RequireResource resourceId="my-menu-item" showDenial>
  <MyNewFeature />
</RequireResource>
```

## Auth Context API

The `useAuth()` hook now includes these resource methods:

```typescript
interface AuthContextType {
  // ... existing properties
  token: string | null;
  hasResourceAccess: (resource: string) => boolean;
  getResourceRoles: (resource: string) => string[];
  hasResourceRole: (resource: string, role: string) => boolean;
  getAvailableResources: () => string[];
}
```

## Current Resource Mappings

| Resource | Menu Items |
|----------|-----------|
| `user-management` | user-management, company-management, role-permissions, audit-logs, integrations, system-settings |
| `visitor-management` | visitor-management |
| `space-management` | room-management |
| `core-hr` | employee-database, org-structure, employee-documents |
| `time-attendance` | attendance-management, shift-schedule, leave-holiday, holiday-management, overtime |
| `payroll` | salary-structure, payroll-run, statutory-compliance, incentives-bonuses |
| `recruitment` | job-requisitions, candidate-tracking, interviews, offers-preboarding, onboarding |
| `performance` | goals-okrs, performance-reviews, 360-feedback, training-learning, skills-career |
| `self-service` | my-profile, my-attendance-leave, my-payslips, my-expenses, my-requests, team-overview, manager-approvals |
| `expenses-assets` | expense-management, travel-requests, advances-settlements, asset-management |
| `policy-documents` | policy-library, acknowledgements, forms-templates |
| `projects` | project-list, tasks-timesheets, project-attendance |
| `analytics` | hr-dashboard, workforce-analytics, payroll-analytics, custom-reports |

## Behavior

### Menu Visibility
- **Visible**: User has the resource in their `resource_access`
- **Hidden**: User doesn't have the resource in their `resource_access`

### Route Access
- **Allowed**: User has the resource in their `resource_access`
- **Denied**: User doesn't have the resource
  - If `showDenial=true`: Shows restricted message
  - If `showDenial=false`: Redirects to `/dashboard`

## Testing

### Test with Mock Token

```typescript
// In browser console
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZV9hY2Nlc3MiOnsiY29yZS1ociI6eyJyb2xlcyI6WyJhZG1pbiJdfX19.signature';

// This will be decoded and checked by the system
```

### Verify in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function DebugComponent() {
  const auth = useAuth();
  
  return (
    <div>
      <p>Available Resources: {auth.getAvailableResources().join(', ')}</p>
      <p>Has user-management: {auth.hasResourceAccess('user-management') ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Troubleshooting

### Menu item not visible
1. Check token has the resource in `resource_access`
2. Verify menu item ID matches the mapping in `menuResourceMap.ts`
3. Check browser console for token decode logs

### Route access denied
1. Ensure user is authenticated with valid token
2. Check token `resource_access` contains required resource
3. Verify `RequireResource` wrapper is used correctly
4. Clear browser storage and re-login if needed

### Token not being loaded
1. Check localStorage has SESSION stored with token
2. Verify token is not expired
3. Check AuthContext is initialized before routes render

## Performance Notes

- Menu filtering uses `useMemo` to prevent unnecessary re-renders
- Token parsing happens on component render, not on every check
- Resource access is cached in the auth context
- Consider token expiry time when caching decisions

## Security Notes

⚠️ **Important**: Token decoding happens client-side only for UI logic. Never rely on client-side checks alone for security. Always validate resource access on the backend.

- Backend must validate resource access before returning sensitive data
- Don't store sensitive information in JWT token claims
- Implement proper CSRF protection
- Use secure token storage (encrypted localStorage, secure cookies)
- Implement token refresh mechanism
- Validate all API requests on backend regardless of client-side checks

## References

- [AuthContext.tsx](../../contexts/AuthContext.tsx)
- [tokenUtils.ts](../../lib/tokenUtils.ts)
- [menuResourceMap.ts](./menuResourceMap.ts)
- [RequireResource.tsx](../../components/RequireResource.tsx)
- [AppShell.tsx](../../components/AppShell/AppShell.tsx)
