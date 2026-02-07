# Company Selector Setup Guide

## Overview
This document outlines the complete setup for the company selector feature, which allows users to select and switch between different parent companies (in addition to the tenant-based multi-tenancy model).

## Architecture

### Multi-Company Structure
- **Tenant**: Represents a child company under a parent organization
- **Company**: Represents a parent company that can have multiple tenants
- A parent company will handle multiple companies/tenants under a hierarchy

### Components & Files Created

#### 1. **Type Definitions** (`src/types/company.ts`)
```typescript
export interface CompanyModel {
  id: string;
  name: string;
  description?: string;
  code?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  logoUrl?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive?: boolean;
}

export interface CompanyWithTenants extends CompanyModel {
  tenants?: string[]; // tenant IDs associated with this company
  tenantCount?: number;
}
```

**Key Fields:**
- `id`: Unique identifier for the company
- `name`: Display name of the company
- `code`: Short code for the company (optional)
- `city`, `state`, `country`: Location information
- Timestamps and audit fields for tracking changes

---

#### 2. **Service Layer** (`src/services/companyService.ts`)
Provides API integration for company operations:

**Available Methods:**
- `apiSearchCompanies()`: List/search companies with pagination
- `apiGetCompanyById()`: Fetch a single company by ID
- `apiCreateCompany()`: Create a new company
- `apiPatchCompany()`: Update company details
- `apiGetUserCompanies()`: Get companies accessible to current user

**All methods include:**
- Bearer token authentication
- Tenant-based request headers (`X-Tenant-ID`)
- Error handling and logging
- API response type safety

---

#### 3. **Context Provider** (`src/contexts/CompanyContext.tsx`)
Manages global company state and selection:

**State:**
- `activeCompany`: Currently selected company
- `companies`: List of all accessible companies
- `companyMap`: Map for quick O(1) company lookups
- `loading`, `error`: UI state management

**Key Functions:**
- `refreshCompanies()`: Refresh company list from server
- `setActiveCompany(id)`: Set active company with validation
- `clearActiveCompany()`: Clear selection
- `createCompany()`, `updateCompany()`: Modify companies
- `canAccessCompany()`: Check user permissions
- Local storage persistence for active company

**Features:**
- Automatic data sync with server
- Local caching with server as source of truth
- Permission-based access control (org-owners, org-admins)
- Automatic refresh on user/org changes

---

#### 4. **Company Selector Component** (`src/components/CompanySelector.tsx`)
UI component for company selection:

**Features:**
- Dropdown menu with all accessible companies
- "All Companies" option for aggregated view
- Single-company simplified view
- Loading and error states
- URL-based company selection detection
- Check marks for active selection
- Company details display (name, city, state)
- Responsive design

**URL Pattern:**
```
/dashboard/{companyId}     # Single company view
/dashboard/all              # All companies aggregated
/dashboard                  # Default/unscoped
```

**Icon:** Building2 (lucide-react)

---

#### 5. **Updated LayoutContext** (`src/contexts/LayoutContext.tsx`)
Extended with company scope selection:

**New Properties:**
- `selectedCompanyScope`: string | null | undefined
- `setSelectedCompanyScope()`: Update company scope

**Maintains existing functionality:**
- `activePage`: Current active page tracking
- `sidebarCollapsed`: Sidebar state
- Local storage persistence for sidebar state

---

#### 6. **Header Components**
Two header options available:

##### a) Main Header (`src/components/header.tsx`)
- Minimal implementation with company selector
- Shows company selector prominently
- Clean, responsive design
- Good for dashboard views

##### b) Extended Header (`src/components/Header copy.tsx`)
- Rich features (user menu, theme toggle, switch user)
- Includes company selector
- Better for feature-rich applications
- Hides company selector on settings/support pages

---

## Implementation Steps

### Step 1: Install Context Provider
In `src/App.tsx`, add CompanyProvider to the provider chain:

```tsx
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompanyProvider>                    {/* NEW */}
          <UserManagementProvider>
            <LayoutProvider>
              {/* Routes */}
            </LayoutProvider>
          </UserManagementProvider>
        </CompanyProvider>                   {/* NEW */}
      </AuthProvider>
    </ThemeProvider>
  );
}
```

**Order Important:** CompanyProvider should be placed after AuthProvider but before custom routes.

### Step 2: Use in Header
Choose one of the header implementations:

```tsx
// Option 1: Simple header (src/components/header.tsx)
import { Header } from './components/header';

// Option 2: Feature-rich header (src/components/Header copy.tsx)
import { Header } from './components/Header copy';

// In your layout component
<Header onMenuClick={toggleMobileMenu} />
```

### Step 3: Access Company Context in Components
```tsx
import { useCompany } from '@/contexts/CompanyContext';
import { useLayoutContext } from '@/contexts/LayoutContext';

function MyComponent() {
  const { activeCompany, companies } = useCompany();
  const { selectedCompanyScope } = useLayoutContext();

  return (
    <div>
      Current Company: {activeCompany?.name}
      Selected Scope: {selectedCompanyScope}
    </div>
  );
}
```

---

## API Integration

### Backend Endpoints Expected
The service layer expects these endpoints:

```
POST   /api/companies/search
  - Payload: UniversalSearchRequest (pagination, filters)
  - Returns: Paginated list of companies

GET    /api/companies/:id
  - Returns: Single company details

POST   /api/companies
  - Payload: CompanyModel (without id, timestamps)
  - Returns: Created company with id

PATCH  /api/companies/:id
  - Payload: Partial company updates
  - Returns: Updated company

GET    /api/companies/my-access
  - Returns: Companies accessible to current user
```

### Request/Response Format
All endpoints expect:
- **Headers:**
  - `Authorization: Bearer {token}`
  - `X-Tenant-ID: {tenant}`
  - `Content-Type: application/json`

- **Response:** ApiResponse<T>
  ```typescript
  {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
  }
  ```

---

## URL Navigation Pattern

### URL Structures
```
/dashboard                    # No company scope
/dashboard/{companyId}        # Specific company
/dashboard/all               # All companies aggregated
/settings/{companyId}        # Settings for company
/support/all                 # Support for all companies
```

### Automatic URL Sync
- Selecting a company updates URL without navigation
- Uses `window.history.replaceState()` to prevent component remount
- On page load, URL-based company is auto-selected
- Company selector shows current URL selection

---

## Local Storage

### Persisted Keys
- `active-company-id`: Last selected company ID
- `sidebar-collapsed`: Sidebar state

### Usage
Company selection is automatically persisted and restored on reload.

---

## Permissions & Access Control

### Access Validation
- `canAccessCompany()` checks user permissions
- Org-owners and org-admins can access all companies
- Other roles validated based on company assignments
- Invalid access attempts logged but don't crash app

### User Roles
- `org-owner`: Full access to all companies
- `org-admin`: Full access to all companies
- Other roles: Company-specific access (configurable)

---

## State Management Flow

```
User Authentication
        ↓
   AuthProvider
        ↓
   CompanyProvider (loads companies from API)
        ↓
   Companies cached in memory + localStorage
        ↓
   CompanySelector UI
        ↓
   setActiveCompany() → URL update → Component re-render
```

### Loading States
1. **Initial Load**: `loading = true` → Shows "Loading companies…"
2. **No Companies**: Returns `null` → Nothing displayed
3. **Single Company**: Compact view (no dropdown)
4. **Multiple Companies**: Dropdown menu available
5. **Error State**: Shows "Failed to load companies"

---

## Integration with Existing Features

### With Tenant System
- The company selector is **independent** of the tenant system
- A company can manage multiple tenants
- Tenant header can be displayed separately if needed
- Both scope types can coexist in the app

### With LayoutContext
- Company scope tracked alongside active page
- UI can conditionally show/hide company selector
- Compatible with existing sidebar and navigation

### With Authentication
- Company access validated on selection
- Follows user's role-based permissions
- Automatic refresh on auth changes

---

## Customization Guide

### Change Company Selector Icon
Edit `src/components/CompanySelector.tsx`:
```tsx
// Current: Building2
// Change to any icon from lucide-react
import { GiFactory } from 'lucide-react'; // Example

<GiFactory className="h-4 w-4 text-muted-foreground" />
```

### Add Company Logo Display
```tsx
{company.logoUrl && (
  <img src={company.logoUrl} alt={company.name} className="h-4 w-4 rounded" />
)}
```

### Customize Dropdown Content
Edit the dropdown section in CompanySelector to show additional company info:
```tsx
<span className="text-xs text-muted-foreground">
  {company.industry} • {company.registrationNumber}
</span>
```

### Hide Company Selector on Specific Routes
```tsx
const hideCompanySelector = 
  path.startsWith('/admin') || 
  path.startsWith('/settings') ||
  path.startsWith('/company-management');
```

---

## Testing Checklist

- [ ] Company selector displays in header
- [ ] Can switch between companies
- [ ] URL updates when company changes
- [ ] Company persists on page reload
- [ ] "All Companies" option works
- [ ] Single company shows simplified view
- [ ] Loading state displays correctly
- [ ] Error state displays correctly
- [ ] Access control prevents unauthorized selection
- [ ] Mobile responsive design works
- [ ] Active company highlighted in dropdown
- [ ] Company detail page receives companyId from URL

---

## Troubleshooting

### Companies not loading
1. Check browser console for API errors
2. Verify backend endpoints are correct
3. Check auth token validity
4. Verify X-Tenant-ID header is being sent

### Selector not updating URL
1. Ensure window.history API is not blocked
2. Check browser console for errors
3. Verify URL pattern matches expected format

### Permission denied on selection
1. Verify user role in AuthContext
2. Check canAccessCompany() logic
3. Ensure user has company assignments

### Persistence not working
1. Check localStorage available
2. Verify localStorage keys not conflicting
3. Clear browser cache and try again

---

## Future Enhancements

- [ ] Company search/filter
- [ ] Recently used companies
- [ ] Company favorites
- [ ] Bulk company operations
- [ ] Company hierarchy visualization
- [ ] Department-level scoping within company
- [ ] Company-specific branding
- [ ] Advanced access control matrix

---

## Related Documentation
- [Backend Models Sync](./BACKEND_MODELS_SYNC.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Endpoints](./src/types/apiEndPoints.ts)
