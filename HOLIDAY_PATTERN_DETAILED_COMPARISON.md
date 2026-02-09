# Holiday Management - Detailed Pattern Comparison

## Side-by-Side: Before vs After

### Service Layer

#### BEFORE (No service)
```typescript
// No service file, API calls were embedded in context
```

#### AFTER (Service Layer)
```typescript
// src/services/holidayService.ts
export const apiCreateHoliday = async (
  carrier: HolidayCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Holiday>> => {
  return apiRequest<Holiday>({
    method: "POST",
    endpoint: "/emp-user-management/v1/holidays",
    tenant,
    accessToken,
    body: carrier,
  });
};

export const apiSearchHolidays = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Pagination<Holiday>>> => {
  return apiRequest<Pagination<Holiday>>({
    method: "POST",
    endpoint: `/emp-user-management/v1/holidays/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};
```

### Context Implementation

#### BEFORE
```typescript
// Minimal context, manual mock data filtering
const getHolidays = async (searchRequest, pageIndex, pageSize) => {
  setIsLoading(true);
  try {
    let filtered = [...mockHolidays]; // Direct array manipulation
    
    if (searchRequest.searchText) {
      const searchLower = searchRequest.searchText.toLowerCase();
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(searchLower)
      );
    }
    
    const totalElements = filtered.length;
    const start = pageIndex * pageSize;
    const content = filtered.slice(start, pageSize);
    
    return { content, totalElements };
  } finally {
    setIsLoading(false);
  }
};
```

#### AFTER
```typescript
// Comprehensive context with API integration
const refreshHolidays = async (
  searchRequest: UniversalSearchRequest,
  page: number = 0,
  pageSize: number = 12
): Promise<Pagination<Holiday> | null> => {
  return executeApiCall(
    (tenant, accessToken) =>
      apiSearchHolidays(searchRequest, page, pageSize, tenant, accessToken),
    "Search Holidays",
    ""
  ) as Promise<Pagination<Holiday> | null>;
};

const executeApiCall = async <T,>(
  apiCall: (tenant: string, accessToken: string) => Promise<any>,
  operationName: string,
  successMessage: string,
  returnOnSuccess: boolean = false
): Promise<T | boolean | null> => {
  // 1. Token validation
  if (!validateToken()) return returnOnSuccess ? false : null;

  // 2. Auth resolution
  const auth = resolveAuth();
  if (!auth.tenant || !auth.accessToken) {
    handleError(new Error("Missing auth"), "Error", "Auth missing");
    return returnOnSuccess ? false : null;
  }

  // 3. Loading state
  setIsLoading(true);
  
  try {
    // 4. API call execution
    const response = await apiCall(auth.tenant, auth.accessToken);

    // 5. Response validation
    if (!response.success) {
      handleError(response.message, `${operationName} Failed`, response.message);
      return returnOnSuccess ? false : null;
    }

    // 6. Success notification
    if (successMessage) {
      handleSuccess(successMessage);
    }

    return returnOnSuccess ? true : response.data;
  } catch (error) {
    // 7. Error notification
    handleError(error, "Error", `An error occurred during ${operationName}`);
    return returnOnSuccess ? false : null;
  } finally {
    // 8. Loading state cleanup
    setIsLoading(false);
  }
};
```

### HolidayManagement Main Page

#### BEFORE
```typescript
const { getHolidays, deleteHolidayById, isLoading } = useHoliday();

const loadHolidays = async () => {
  try {
    const searchRequest = buildUniversalSearchRequest(
      activeFilters,
      searchQuery,
      ['name', 'description'],
    );

    const result = await getHolidays(searchRequest, pageIndex, pageSize);
    if (result) {
      setHolidays(result.content || []);
      setTotalItems(result.totalElements || 0);
    }
  } catch (error) {
    console.error('Error fetching holidays:', error);
  }
};
```

#### AFTER (Same structure, different API call)
```typescript
const { refreshHolidays, deleteHolidayById, isLoading } = useHoliday();

const loadHolidays = async () => {
  try {
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
  } catch (error) {
    console.error('Error fetching holidays:', error);
  }
};

// Delete with refresh trigger - matches Policy Library pattern
const handleDelete = (holiday: Holiday) => {
  setConfirmDialog({
    open: true,
    title: 'Delete Holiday',
    description: `Are you sure you want to delete "${holiday.name}"?`,
    action: async () => {
      const success = await deleteHolidayById(holiday.id);
      if (success) {
        // Trigger reload by incrementing refreshTrigger
        setRefreshTrigger(prev => prev + 1);
      }
    },
  });
};
```

### HolidayForm

#### BEFORE
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
    const updates: HolidayUpdateCarrier = {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      companyIds: data.companyIds,
    };

    const updated = await updateHoliday(holidayId!, updates);
    if (updated) {
      navigate('/holiday-management');
    }
  }
};
```

#### AFTER (Matches Policy Form pattern)
```typescript
const { createHoliday, updateHoliday, getHolidayById } = useHoliday();

const handleSubmit = async (data: HolidayFormDataType) => {
  setIsSubmitting(true);

  try {
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
      // Update payload without carrier wrapping
      const updates = {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        companyIds: data.companyIds,
      };

      const updated = await updateHoliday(holidayId!, updates);
      if (updated) {
        navigate('/holiday-management');
      }
    }
  } catch (error) {
    console.error('Error submitting holiday:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

## Key Improvements

### 1. Separation of Concerns
- **Service**: API communication only
- **Context**: State management, error handling, token validation
- **Component**: UI logic only

### 2. Error Handling
- Before: Manual try-catch in each component
- After: Automatic error handling in context with toast notifications

### 3. Token Management
- Before: No token validation
- After: Automatic validation in executeApiCall wrapper

### 4. Loading State
- Before: Each operation had its own loading flag
- After: Single unified `isLoading` state in context

### 5. Success Notifications
- Before: No user feedback
- After: Automatic success toasts for create, update, delete

### 6. Code Reusability
- Before: Error handling repeated in each function
- After: Centralized executeApiCall wrapper used by all operations

### 7. API Integration
- Before: Hardcoded mock data filtering
- After: Real API calls through service layer with pagination and filtering

## Function Mapping

| Operation | Before | After |
|-----------|--------|-------|
| List | `getHolidays()` | `refreshHolidays()` |
| Get Single | `getHolidayById()` | `getHolidayById()` |
| Create | `createHoliday()` | `createHoliday()` |
| Update | `updateHoliday()` | `updateHoliday()` |
| Delete | `deleteHolidayById()` | `deleteHolidayById()` |
| New | - | `bulkDeleteHolidays()` |
| New | - | `bulkUpdateHolidays()` |

## Data Flow

### Create Holiday
```
HolidayForm
  ↓ handleSubmit(data)
useHoliday.createHoliday(carrier)
  ↓ (in context)
executeApiCall()
  ↓ Token validation
  ↓ Auth resolution
apiCreateHoliday(carrier, tenant, accessToken)
  ↓ (in service)
apiRequest({ method: POST, ... })
  ↓
API Response
  ↓
Response validation
  ↓
Success toast
  ↓
Return Holiday | null
```

### Search Holidays
```
HolidayManagement
  ↓ loadHolidays()
buildUniversalSearchRequest(filters, search, fields)
  ↓
useHoliday.refreshHolidays(searchRequest, page, pageSize)
  ↓ (in context)
executeApiCall()
  ↓ Token validation
apiSearchHolidays(searchRequest, page, pageSize, tenant, accessToken)
  ↓ (in service)
apiRequest({ method: POST, body: searchRequest, ... })
  ↓
API Response
  ↓
Return Pagination<Holiday> | null
  ↓
setHolidays(result.content)
```

## Files Structure

### Before
```
holiday-management/
├── HolidayManagement.tsx
├── HolidayForm.tsx
├── types.ts
├── mockData.ts        ← To be removed
└── components/
    └── HolidayCard.tsx
```

### After
```
holiday-management/
├── HolidayManagement.tsx  ← Uses refreshHolidays()
├── HolidayForm.tsx        ← Uses createHoliday/updateHoliday()
├── types.ts
├── README.md              ← Documentation
└── components/
    └── HolidayCard.tsx

services/
├── holidayService.ts      ← API functions (NEW)
├── policyService.ts
└── ...

contexts/
├── HolidayContext.tsx     ← Full API integration (REFACTORED)
├── PolicyContext.tsx
└── ...
```

## Consistency Achieved

✅ Holiday Management now follows **exact same pattern** as Policy Library
✅ Same service architecture
✅ Same context wrapper pattern
✅ Same error handling approach
✅ Same success notification pattern
✅ Same token validation strategy
✅ Same loading state management
✅ Same bulk operation support
✅ Same form handling pattern
✅ Same search/filter integration
