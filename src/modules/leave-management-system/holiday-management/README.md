# Holiday Management Module

Complete holiday management system following the Policy Library architecture pattern.

## Overview

The Holiday Management module provides comprehensive CRUD operations for company holidays with:
- Service-based API integration
- Context-based state management
- Search, filter, and pagination capabilities
- Create, read, update, and delete operations
- Toast notifications for user feedback

## Architecture

### Service Layer (`holidayService.ts`)

Handles all API communication. Functions follow the pattern:
```typescript
export const apiCreateHoliday = async (
  carrier: HolidayCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Holiday>>
```

**API Endpoints:**
- `POST /emp-user-management/v1/holidays` - Create
- `GET /emp-user-management/v1/holidays/{id}` - Get by ID
- `PATCH /emp-user-management/v1/holidays/{id}` - Update
- `POST /emp-user-management/v1/holidays/search?page={page}&size={size}` - Search with pagination
- `DELETE /emp-user-management/v1/holidays/{id}` - Delete
- `DELETE /emp-user-management/v1/holidays/bulk-delete` - Bulk delete
- `PATCH /emp-user-management/v1/holidays/bulk-update` - Bulk update

### Context Layer (`HolidayContext.tsx`)

Centralized state management with:
- **Token validation**: Auto-checks session expiry
- **Error handling**: Automatic error toast notifications
- **Success handling**: Toast notifications for create/update/delete
- **Loading state**: Single `isLoading` flag for async operations
- **API execution wrapper**: `executeApiCall` handles all request logic

**Context Methods:**
```typescript
const { 
  createHoliday,      // Create new holiday
  getHolidayById,     // Fetch single holiday
  updateHoliday,      // Update holiday
  refreshHolidays,    // Search with filters and pagination
  deleteHolidayById,  // Delete holiday
  bulkDeleteHolidays, // Bulk delete
  bulkUpdateHolidays, // Bulk update
  isLoading           // Loading state
} = useHoliday();
```

### Components

#### HolidayManagement.tsx (Main Page)

Features:
- **Toolbar**: Search, filters, export, view configuration
- **Grid Layout**: Responsive cards (1-4 columns)
- **Pagination**: Fixed bottom with configurable page sizes (12/24/36/48)
- **Refresh Trigger**: Incremented on delete to reload data
- **Dependency Tracking**: Prevents unnecessary API calls

**Key Pattern:**
```typescript
const { refreshHolidays, deleteHolidayById, isLoading } = useHoliday();

const loadHolidays = async () => {
  const searchRequest = buildUniversalSearchRequest(
    activeFilters,
    searchQuery,
    ['name', 'description'],
  );

  const result = await refreshHolidays(searchRequest, pageIndex, pageSize);
  if (result) {
    setHolidays(result.content || []);
    setTotalItems(result.totalElements || 0);
  }
};

// Refresh trigger pattern
const handleDelete = (holiday: Holiday) => {
  setConfirmDialog({
    open: true,
    action: async () => {
      const success = await deleteHolidayById(holiday.id);
      if (success) {
        setRefreshTrigger(prev => prev + 1); // Trigger reload
      }
    },
  });
};
```

#### HolidayForm.tsx (Create/Edit)

Features:
- **URL-based Modes**: `?mode=create` or `?mode=edit&id={id}`
- **Form Validation**: Zod schema with React Hook Form
- **Auto-population**: Loads existing holiday in edit mode
- **Navigation**: Returns to management page on success

**Key Pattern:**
```typescript
const { createHoliday, updateHoliday, getHolidayById } = useHoliday();

const handleSubmit = async (data: HolidayFormDataType) => {
  if (mode === 'create') {
    const carrier: HolidayCarrier = {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      companyIds: data.companyIds,
      createdAt: new Date().toISOString(),
    };

    const newHoliday = await createHoliday(carrier);
    if (newHoliday) {
      navigate('/holiday-management');
    }
  } else {
    const updated = await updateHoliday(holidayId!, {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      companyIds: data.companyIds,
    });
    if (updated) {
      navigate('/holiday-management');
    }
  }
};
```

#### HolidayCard.tsx (Grid Item)

Features:
- **Image Display**: Holiday image or emoji placeholder
- **Company Badges**: Shows up to 3 companies, "+X more" badge
- **Admin Controls**: Edit/delete dropdown menu
- **Responsive**: Works on mobile, tablet, desktop

## Type Definitions

```typescript
// Core entity
export interface Holiday {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Create payload
export interface HolidayCarrier {
  name: string;
  description?: string;
  imageUrl?: string;
  companyIds: string[];
  createdAt: string;
}

// Update payload
export interface HolidayUpdateCarrier {
  name?: string;
  description?: string;
  imageUrl?: string;
  companyIds?: string[];
}
```

## Usage

### In Components

```typescript
import { useHoliday } from '@/contexts/HolidayContext';

function MyComponent() {
  const { 
    createHoliday, 
    refreshHolidays, 
    deleteHolidayById,
    isLoading 
  } = useHoliday();

  // Use the methods...
}
```

### App Setup

```typescript
import { HolidayProvider } from '@/contexts/HolidayContext';

<HolidayProvider>
  <YourApp />
</HolidayProvider>
```

## Routing

```typescript
<Route path="/holiday-management" element={<HolidayManagement />} />
<Route path="/holiday-management/form" element={<HolidayForm />} />
```

## Menu Configuration

Added to Time & Attendance section with Calendar icon:
```typescript
{
  label: 'Holiday Management',
  icon: Calendar,
  route: '/holiday-management',
  adminOnly: true,
}
```

## Error Handling

All errors are automatically handled with:
1. **Session Validation**: Checks token expiry, redirects to login if expired
2. **Error Notifications**: Toast with error message
3. **Loading State**: Managed by context
4. **Operation Feedback**: Success toast on successful operations

## Search & Filtering

The `refreshHolidays` method uses `UniversalSearchRequest` with:
- **Search Fields**: name, description
- **Filters**: Company ID (custom filter)
- **Operators**: Regex (contains), equals
- **Pagination**: Page number and size

## Pattern Comparison with Policy Library

| Aspect | Holiday | Policy |
|--------|---------|--------|
| Service | `holidayService.ts` | `policyService.ts` |
| Context | `HolidayContext.tsx` | `PolicyContext.tsx` |
| Methods | `createHoliday`, `refreshHolidays`, `deleteHolidayById` | `createPolicy`, `refreshPolicies`, `deletePolicyById` |
| Token Validation | ✅ Yes | ✅ Yes |
| Error Toasts | ✅ Yes | ✅ Yes |
| Loading State | ✅ Yes | ✅ Yes |
| API Execute Wrapper | ✅ Yes | ✅ Yes |
| Bulk Operations | ✅ Yes | ✅ Yes |

## Next Steps for Deployment

1. Ensure API endpoints match the service paths
2. Test with real backend API
3. Verify token validation works
4. Confirm search/filter parameters match backend
5. Test pagination with various page sizes

## Notes

- Mock data has been completely removed
- All API calls go through the service layer
- Context provides centralized state and error handling
- Form uses React Hook Form with Zod validation
- Search uses universal search request builder
- Component follows responsive design principles
