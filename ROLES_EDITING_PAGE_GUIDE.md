# RolesEditingPage - User Role Management

## Overview

The `RolesEditingPage` is a comprehensive user interface for managing user roles across different resources. It allows administrators to:
- Select a user from the system
- View the user's currently assigned roles (grouped by resource)
- Select a resource and view all available roles
- Assign new roles to the user with a single click
- See real-time updates when roles are assigned

## Location

`/src/modules/user-management/pages/RolesEditingPage.tsx`

## Features

### 1. **User Selection**
- Uses `UsersSelector` component for intuitive user search
- Search across: firstName, lastName, email, employeeId
- Returns single user ID via the `returnField="id"` configuration

### 2. **Current Roles Display**
- Shows all roles assigned to the selected user
- Displays roles grouped by resource (hierarchical structure)
- Shows resource name and role IDs as badges
- Displays "No roles assigned yet" when user has no roles

### 3. **Role Assignment Panel**
- **Resource Selector**: Dropdown to choose a resource
- **Available Roles List**: Shows all roles for the selected resource
- **Role Status**: Badges indicate if role is already assigned
- **Add Button**: 
  - Shows "Add" when role is not assigned
  - Shows "Added" (disabled) when role is already assigned
  - Loading state while assignment is in progress

### 4. **Data Flow**

```
User Selection
    ↓
Fetch User Roles (getUserRoles API)
    ↓
Display Current Roles by Resource
    ↓
Select Resource → Filter Available Roles
    ↓
Click "Add" → Call assignRolesToUsers API
    ↓
Refresh User Roles → Update Display
```

## Component Architecture

### State Management

```typescript
// User and roles data
const [selectedUserId, setSelectedUserId] = useState<string>("");
const [userRoles, setUserRoles] = useState<UserRoles | null>(null);

// Resources and roles catalog
const [resources, setResources] = useState<Resource[]>([]);
const [allRoles, setAllRoles] = useState<RoleModel[]>([]);
const [selectedResourceId, setSelectedResourceId] = useState<string>("");

// Loading states
const [isLoadingUser, setIsLoadingUser] = useState(false);
const [isLoadingResources, setIsLoadingResources] = useState(true);
const [isAssigningRole, setIsAssigningRole] = useState(false);
```

### Key Functions

1. **`loadResourcesAndRoles()`**
   - Fetches all resources and roles on component mount
   - Uses RoleManagement context methods: `refreshResources()`, `refreshRoles()`
   - Sets first resource as default selection

2. **`handleUserSelect(selectedValue)`**
   - Triggered when user is selected in UsersSelector
   - Calls `getUserRoles(userId)` to fetch user's current roles
   - Handles both single and multiple selection modes

3. **`handleAssignRole(roleId)`**
   - Calls `assignRolesToUsers()` with carrier object:
     - `userIds`: [selectedUserId]
     - `resourceId`: selectedResourceId
     - `roleIds`: [roleId]
   - Refreshes user roles on success
   - Shows toast notification on error

4. **`isRoleAssigned(roleId)`**
   - Helper function to check if role is already assigned to user
   - Used to determine button state (enabled/disabled)

### Memoized Values

```typescript
// Roles for currently selected resource
const selectedResourceRoles = useMemo(() => {
  if (!selectedResourceId) return [];
  return allRoles.filter((role) => role.resourceId === selectedResourceId);
}, [selectedResourceId, allRoles]);

// User's assigned roles in current resource
const assignedRoleIds = useMemo(() => {
  if (!userRoles || !selectedResourceId) return [];
  const rolesData = userRoles.rolesData as Record<string, any> | undefined;
  const resourceRoles = rolesData?.[selectedResourceId];
  return resourceRoles?.roleIds || [];
}, [userRoles, selectedResourceId]);

// Get selected resource name for display
const selectedResource = useMemo(
  () => resources.find((r) => r.id === selectedResourceId),
  [resources, selectedResourceId]
);
```

## UI Layout

### Two-Column Layout (for selected user)

#### Left Panel (1/3 width on desktop)
- **Title**: "Current Roles"
- **Content**: Hierarchical list of roles grouped by resource
- Shows resource name and role badges
- Sticky height on desktop (lg:col-span-1)

#### Right Panel (2/3 width on desktop)
- **Title**: "Assign Roles"
- **Section 1**: Resource selector (dropdown)
- **Section 2**: Available roles for selected resource
  - Shows role ID and human-readable name
  - "Add" button for each role
  - Badge indicates assignment status

### Responsive Design
- Mobile: Single column, full width
- Tablet: Single column, full width
- Desktop: Two column layout (1/3 + 2/3)

## API Integration

### Context Methods Used

1. **UserManagement Context**
   ```typescript
   // Fetch user's roles across all resources
   const userRoles = await getUserRoles(userId);
   
   // Assign roles to user in a specific resource
   const success = await assignRolesToUsers({
     userIds: [userId],
     resourceId: "resource-id",
     roleIds: ["role-id-1", "role-id-2"]
   });
   ```

2. **RoleManagement Context**
   ```typescript
   // Load all resources
   const resourcesResult = await refreshResources({}, 0, 1000);
   
   // Load all roles
   const rolesResult = await refreshRoles({}, 0, 1000);
   ```

### Data Types

**UserRoles** (returned by getUserRoles):
```typescript
{
  id: string;                    // User ID
  rolesData: {
    [resourceId: string]: {
      roleIds: string[]          // Role IDs for this resource
    }
  };
  createdAt?: string;
  updatedAt?: string;
}
```

**AssignRolesCarrier** (passed to assignRolesToUsers):
```typescript
{
  userIds: string[];             // User IDs to assign roles to
  resourceId: string;            // Resource ID
  roleIds: string[];             // Role IDs to assign
}
```

## Usage Example

To add this page to your routing:

```typescript
// In your router configuration
import RolesEditingPage from '@/modules/user-management/pages/RolesEditingPage';

// Add to routes
{
  path: '/user-management/roles',
  element: <RolesEditingPage />
}
```

## Empty States

1. **No user selected**: Displays message "Select a user above to begin managing their roles."
2. **User has no roles**: Shows "No roles assigned yet" in current roles panel
3. **Resource has no roles**: Shows "No roles available for this resource"

## Loading States

- **Initial resources loading**: Skeleton loaders shown for resource selector
- **User roles loading**: Skeleton loaders shown in current roles panel
- **Role assignment**: Button disabled while assignment in progress

## Error Handling

- Errors during resource/role loading: Toast notification with error message
- Errors during user role fetch: Toast notification + displayed as null
- Errors during role assignment: Toast notification (success toast is handled by context)
- All errors logged to console for debugging

## Future Enhancements

1. **Bulk Role Assignment**: Assign multiple roles to a user at once
2. **Role Removal**: UI to remove roles from users
3. **Batch User Selection**: Assign roles to multiple users at once
4. **Role Filters**: Filter roles by name, description, or other attributes
5. **Audit Trail**: Show who assigned which role and when
6. **Keycloak Sync**: Toggle to sync roles with Keycloak
7. **Export Roles**: Export user roles to CSV/Excel

## Troubleshooting

### Roles not showing up
- Verify that resources and roles exist in the system
- Check that the role's `resourceId` matches the selected resource

### User roles not loading
- Verify user ID is correctly extracted from UsersSelector
- Check network tab for API errors
- Ensure user has roles in the backend

### Role assignment not working
- Verify that `assignRolesToUsers` is properly integrated in UserManagementContext
- Check toast notifications for error messages
- Verify user has permission to assign roles

## Related Components

- `UsersSelector`: User selection component
- `UserManagementContext`: Context for user operations
- `RoleManagementContext`: Context for role operations
- `PageLayout`: Page wrapper component
- `RoleManagement.tsx`: Main role management page (for reference)
