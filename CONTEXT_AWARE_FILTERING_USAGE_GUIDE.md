## Context-Aware Filtering Usage Guide

Quick reference guide for implementing context-aware dropdowns and multiselects across modules.

### Basic Structure

```typescript
import { FilterOption } from '@/components/GenericToolbar/types';

// 1. Create loading function
const loadOptions = async (searchQuery: string): Promise<FilterOption[]> => {
  try {
    const auth = resolveAuth();
    const tenant = auth?.tenant;
    const accessToken = auth?.accessToken;
    
    if (!tenant || !accessToken) return [];

    // Call your API with search query
    const response = await apiSearch(
      { filters: { and: { name: searchQuery } } },
      0,
      20,
      tenant,
      accessToken
    );

    // Map results to FilterOption format
    return response.data?.content?.map(item => ({
      value: item.id,
      label: item.name, // or any property to display
    })) || [];
  } catch (error) {
    console.error('Error loading options:', error);
    return [];
  }
};

// 2. Add to filter config
const filterConfig = [
  {
    id: 'fieldName',
    label: 'Field Label',
    type: 'context-aware-dropdown' as const, // or 'context-aware-multiselect'
    placeholder: 'Search and select...',
    contextAwareConfig: {
      loadingFunction: loadOptions,
      minCharsToSearch: 0, // 0 = load on open, 1+ = require chars before search
      debounceMs: 300,
    },
  },
];

// 3. Use in toolbar
<GenericToolbar
  availableFilters={filterConfig}
  activeFilters={activeFilters}
  onFiltersChange={setActiveFilters}
  // ... other props
/>
```

---

### Common Patterns

#### Pattern 1: Load All on Open
```typescript
contextAwareConfig: {
  loadingFunction: loadAllItems,
  minCharsToSearch: 0, // Empty string search loads all
  debounceMs: 300,
}
```

#### Pattern 2: Require Minimum Characters
```typescript
contextAwareConfig: {
  loadingFunction: loadWithSearch,
  minCharsToSearch: 2, // Must type at least 2 chars
  debounceMs: 300,
}
```

#### Pattern 3: Longer Debounce for Expensive Operations
```typescript
contextAwareConfig: {
  loadingFunction: loadHeavyData,
  minCharsToSearch: 1,
  debounceMs: 500, // Wait 500ms before calling API
}
```

---

### Common APIs Ready for Use

#### Company Filter
```typescript
import { apiSearchCompanies } from '@/services/companyService';

const loadCompanies = async (searchQuery: string): Promise<FilterOption[]> => {
  const auth = resolveAuth();
  const response = await apiSearchCompanies(
    searchQuery ? { filters: { and: { name: searchQuery } } } : {},
    0, 20, auth.tenant!, auth.accessToken!
  );
  return response.data?.content
    ?.filter(c => c.isActive !== false)
    ?.map(c => ({ value: c.id, label: c.name })) || [];
};
```

#### User Filter
```typescript
import { apiSearchUsers } from '@/services/userManagementService';

const loadUsers = async (searchQuery: string): Promise<FilterOption[]> => {
  const auth = resolveAuth();
  const response = await apiSearchUsers(
    searchQuery ? { filters: { and: { name: searchQuery } } } : {},
    0, 20, auth.tenant!, auth.accessToken!
  );
  return response.data?.content?.map(u => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName}`,
  })) || [];
};
```

#### Department Filter
```typescript
import { apiSearchDepartments } from '@/services/departmentService';

const loadDepartments = async (searchQuery: string): Promise<FilterOption[]> => {
  const auth = resolveAuth();
  const response = await apiSearchDepartments(
    searchQuery ? { filters: { and: { name: searchQuery } } } : {},
    0, 20, auth.tenant!, auth.accessToken!
  );
  return response.data?.content?.map(d => ({
    value: d.id,
    label: d.name,
  })) || [];
};
```

---

### Single vs Multi-Select

#### Single Select (Dropdown)
```typescript
{
  type: 'context-aware-dropdown' as const,
  contextAwareConfig: { loadingFunction },
  // User can select only ONE option
  // Returns string value
}
```

#### Multi-Select
```typescript
{
  type: 'context-aware-multiselect' as const,
  contextAwareConfig: { loadingFunction },
  // User can select MULTIPLE options
  // Returns string[] array of values
  // Shows tags for each selection
  // Shows "N selected" in button when multiple selected
}
```

---

### Error Handling

**The component handles errors gracefully:**
- API errors → returns empty array `[]`
- Missing auth → returns empty array `[]`
- Network timeouts → returns empty array `[]`

**Errors are logged to console** for debugging:
```typescript
console.error('Error loading options:', error);
```

---

### Performance Considerations

1. **Caching**: Results are cached per search query
2. **Debouncing**: Delays API call to prevent request spam
3. **Minimum Characters**: Prevents unnecessary API calls for short searches
4. **Result Limit**: Typically limit to 20-50 results per API call
5. **Pagination**: If using paginated APIs, load first page (page 0)

**Example with pagination:**
```typescript
const loadOptions = async (searchQuery: string): Promise<FilterOption[]> => {
  const response = await apiSearch(
    searchRequest,
    0, // Always load first page for filter
    50, // Load more items for filter dropdown
    tenant,
    accessToken
  );
  // ...
};
```

---

### Testing the Implementation

#### Quick Test in Browser
1. Open Holiday Management page
2. Look for "Company" filter
3. Click on it - should see loading spinner briefly
4. Should load list of companies from API
5. Type in search box - should filter companies
6. Select companies - should show tags
7. Clear selections - tags disappear

#### Console Checks
```typescript
// Check network tab for API calls
// Should see: POST /emp-user-management/v1/companies/search
// Should see debounced - not called on every keystroke
// Should be called on open (minCharsToSearch: 0)
```

---

### Troubleshooting

#### Problem: Filter shows no options
**Solution:**
1. Check auth is resolved: `resolveAuth()` returns valid tenant + token
2. Check API endpoint is correct
3. Check API response format matches expected structure
4. Open browser console for error messages

#### Problem: API called too frequently
**Solution:**
1. Increase `debounceMs` value
2. Increase `minCharsToSearch` to reduce unnecessary calls
3. Check if you're caching results properly

#### Problem: Search not working
**Solution:**
1. Verify `searchQuery` is being passed to API
2. Check API `filters` parameter structure
3. Verify API endpoint accepts search filters

---

### Advanced: Custom Search Criteria

If you need to search on a different field:

```typescript
// Default searches on 'name' field
const loadOptions = async (searchQuery: string): Promise<FilterOption[]> => {
  const response = await apiSearch(
    // Search on different field
    searchQuery ? { filters: { and: { email: searchQuery } } } : {},
    0, 20, tenant, accessToken
  );
  // ...
};
```

---

### Files to Reference

- **Type Definitions**: `src/components/GenericToolbar/types.ts`
- **Renderer Component**: `src/components/GenericToolbar/ContextAwareFilterRenderer.tsx`
- **Filter Renderer**: `src/components/GenericToolbar/FilterFieldRenderer.tsx`
- **Example Usage**: `src/modules/time-attendance/holiday-management/HolidayManagement.tsx`

---

### Checklist for Adding to New Module

- [ ] Import `FilterOption` and `apiSearchXxxx`
- [ ] Import `resolveAuth` from localStorage
- [ ] Create `loadXxxOptions` async function
- [ ] Handle auth validation in function
- [ ] Map API response to `FilterOption[]`
- [ ] Add to filter config with `context-aware-dropdown` or `context-aware-multiselect`
- [ ] Set `minCharsToSearch` appropriately (0 for load-on-open, 1+ for require-chars)
- [ ] Set `debounceMs` (300 default is good)
- [ ] Test in browser - verify API calls and UI work
- [ ] Check console for errors

