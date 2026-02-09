# Context-Aware Components

This folder contains reusable components that leverage application contexts to provide consistent behavior and reduce code duplication across the application.

## Components

### UsersSelector

A searchable user selector component that efficiently handles large user datasets by loading users on-demand.

**Features:**
- 🔍 Search-driven loading (avoids loading all users upfront)
- ✅ Filters only active users
- 🎯 Searches across firstName, lastName, email, and employeeId (id field)
- 📝 Auto-loads selected user by ID
- 🎨 User-friendly interface with avatars and user info display
- ⚡ Debounced search (300ms) for better performance
- 🔄 Integrates with UserManagement context

**Usage:**

```tsx
import { UsersSelector } from '@/components/context-aware/UsersSelector';

function MyComponent() {
  const [selectedUserId, setSelectedUserId] = useState('');

  return (
    <UsersSelector
      value={selectedUserId}
      onChange={setSelectedUserId}
      placeholder="Search and select user"
      disabled={false}
    />
  );
}
```

**With React Hook Form:**

```tsx
<FormField
  control={form.control}
  name="hostEmployeeId"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Host</FormLabel>
      <FormControl>
        <UsersSelector
          value={field.value}
          onChange={field.onChange}
          placeholder="Search and select host"
          error={fieldState.error?.message}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` (optional) | - | User ID (or employeeId) of selected user |
| `onChange` | `(userId: string) => void` | - | Callback when user is selected |
| `placeholder` | `string` | `'Select user'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the selector |
| `className` | `string` | - | Additional CSS classes |
| `error` | `string` | - | Validation error message |

**Search Behavior:**
- Requires minimum 2 characters to trigger search
- 300ms debounce delay
- Searches across: firstName, lastName, email, id (employeeId)
- Limits results to 20 users
- Only shows active users (status: 'ACTIVE')

**Performance Benefits:**
- ✅ No memory overhead from loading all users
- ✅ Efficient for datasets with thousands/lakhs of users
- ✅ Only loads data when needed
- ✅ Automatically handles loading states

---

### CompanySelector

A searchable company selector component that efficiently handles large company datasets by loading companies on-demand.

**Features:**
- 🔍 Search-driven loading (avoids loading all companies upfront)
- ✅ Filters only active companies
- 🎯 Searches across name, code, email, and id
- 📝 Auto-loads selected company by ID
- 🏢 User-friendly interface with company icons and details display
- ⚡ Debounced search (300ms) for better performance
- 🔄 Integrates with Company context

**Usage:**

```tsx
import { CompanySelector } from '@/components/context-aware/CompanySelector';

function MyComponent() {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  return (
    <CompanySelector
      value={selectedCompanyId}
      onChange={setSelectedCompanyId}
      placeholder="Search and select company"
      disabled={false}
    />
  );
}
```

**With React Hook Form:**

```tsx
<FormField
  control={form.control}
  name="companyId"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Company</FormLabel>
      <FormControl>
        <CompanySelector
          value={field.value}
          onChange={field.onChange}
          placeholder="Search and select company (optional)"
          error={fieldState.error?.message}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` (optional) | - | Company ID of selected company |
| `onChange` | `(companyId: string) => void` | - | Callback when company is selected |
| `placeholder` | `string` | `'Search companies...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the selector |
| `error` | `string` | - | Validation error message |

**Search Behavior:**
- Requires minimum 2 characters to trigger search
- 300ms debounce delay
- Searches across: name, code, email, id
- Limits results to 20 companies
- Only shows active companies (isActive: true)

**Performance Benefits:**
- ✅ No memory overhead from loading all companies
- ✅ Efficient for datasets with hundreds/thousands of companies
- ✅ Only loads data when needed
- ✅ Automatically handles loading states

## Adding New Context-Aware Components

When creating new context-aware components:

1. Create the component file in this folder
2. Export it from `index.ts`
3. Document its usage in this README
4. Ensure it uses context hooks for data operations
5. Handle loading and error states appropriately

**Example Structure:**

```tsx
import { useYourContext } from '@/contexts/YourContext';

export function YourComponent({ value, onChange }) {
  const { yourContextMethod } = useYourContext();
  
  // Component logic that uses context
  
  return (
    // Your UI
  );
}
```
