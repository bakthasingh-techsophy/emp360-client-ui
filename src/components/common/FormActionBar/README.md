# FormActionBar Component

A reusable, sidebar-aware fixed action bar for form pages with flexible action button configuration.

## Features

- ✅ **Fixed positioning** at bottom of viewport
- ✅ **Sidebar awareness** - automatically adjusts margins based on sidebar state
- ✅ **Flexible actions** - supports default Cancel/Submit or custom action buttons
- ✅ **Multiple layouts** - left, right, or split positioning for custom actions
- ✅ **Loading states** - built-in loading indicators
- ✅ **Responsive** - works on all screen sizes
- ✅ **Reusable** - can be used across different projects

## Basic Usage (Default)

```tsx
import { FormActionBar } from '@/components/common/FormActionBar';

<form onSubmit={handleSubmit} className="pb-24">
  {/* Your form fields */}
  
  <FormActionBar
    mode="create"
    isSubmitting={isSubmitting}
    onCancel={handleCancel}
  />
</form>
```

## Custom Actions Usage

### Example 1: Approval Flow (Split Layout)

```tsx
<FormActionBar
  onCancel={handleCancel}
  customActions={[
    {
      id: 'cancel',
      label: 'Cancel',
      onClick: handleCancel,
      variant: 'outline',
      disabled: isSubmitting,
    },
    {
      id: 'reject',
      label: 'Reject',
      onClick: handleReject,
      variant: 'destructive',
      disabled: isSubmitting || !isValid,
      loading: isSubmitting,
    },
    {
      id: 'approve',
      label: 'Approve',
      onClick: handleApprove,
      variant: 'default',
      disabled: isSubmitting || !isValid,
      loading: isSubmitting,
    },
  ]}
  customActionsPosition="split"
/>
```

**Result**: Cancel button on left, Reject and Approve buttons on right.

### Example 2: All Actions on Right

```tsx
<FormActionBar
  onCancel={handleCancel}
  customActions={[
    { id: 'save-draft', label: 'Save Draft', onClick: saveDraft, variant: 'outline' },
    { id: 'preview', label: 'Preview', onClick: showPreview, variant: 'secondary' },
    { id: 'publish', label: 'Publish', onClick: publish, variant: 'default' },
  ]}
  customActionsPosition="right"
/>
```

**Result**: All buttons aligned to the right side.

### Example 3: With Additional Content

```tsx
<FormActionBar
  mode="edit"
  isSubmitting={isSubmitting}
  onCancel={handleCancel}
  leftContent={
    <button
      type="button"
      onClick={handleDelete}
      className="text-destructive text-sm"
    >
      Delete
    </button>
  }
  rightContent={
    <span className="text-sm text-muted-foreground">
      Last saved: {lastSavedTime}
    </span>
  }
/>
```

## Props

### FormActionBarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'create' \| 'edit'` | `'create'` | Form mode - affects default submit button text |
| `isSubmitting` | `boolean` | `false` | Whether form is currently submitting |
| `onCancel` | `() => void` | **Required** | Cancel button click handler |
| `submitText` | `string` | Auto | Custom submit button text (overrides mode default) |
| `cancelText` | `string` | `'Cancel'` | Custom cancel button text |
| `showRequiredIndicator` | `boolean` | `true` | Show "* Required fields" indicator |
| `leftContent` | `ReactNode` | - | Additional content on left side |
| `rightContent` | `ReactNode` | - | Additional content on right side |
| `customActions` | `ActionButton[]` | - | Custom action buttons (replaces defaults) |
| `customActionsPosition` | `'left' \| 'right' \| 'split'` | `'split'` | Position of custom actions |
| `hideDefaultActions` | `boolean` | `false` | Hide default Cancel/Submit buttons |
| `className` | `string` | - | Additional CSS classes |

### ActionButton Interface

```typescript
interface ActionButton {
  id: string;                    // Unique identifier
  label: string;                 // Button text
  onClick: () => void;           // Click handler
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;            // Disabled state
  loading?: boolean;             // Show loading spinner
  type?: 'button' | 'submit' | 'reset';
}
```

## Custom Actions Position

### `split` (Default)
- First action → Left side
- Remaining actions → Right side
- **Use case**: Approval flows with Cancel on left, Approve/Reject on right

### `left`
- All actions → Left side
- **Use case**: Navigation or secondary actions

### `right`
- All actions → Right side
- **Use case**: Standard form actions or workflows

## Styling Notes

- Action bar has `z-40` to stay above most content
- Automatically adjusts for sidebar state (64px or 256px left margin on large screens)
- Uses smooth transitions for margin changes
- Max width of `7xl` (80rem) for optimal readability

## Required Parent Styling

Add bottom padding to your form container to prevent content from being hidden behind the fixed action bar:

```tsx
<form className="pb-24">
  {/* Your form content */}
  <FormActionBar ... />
</form>
```

## Examples in Codebase

- **VisitorRegistrationForm**: Standard create/edit form
- **ExpenseForm**: Form with "Save as Draft" option in leftContent
- **ExpenseApprovalPage**: Custom approval flow with Cancel/Reject/Approve
- **PolicyForm**: Edit mode with additional options
- **RoomForm**: Room booking form
- **BookingPage**: Room booking with custom actions

## Migration from Custom Action Bar

**Before:**
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <Button onClick={onCancel}>Cancel</Button>
    <Button onClick={onSubmit}>Submit</Button>
  </div>
</div>
```

**After:**
```tsx
<FormActionBar
  onCancel={onCancel}
  customActions={[
    { id: 'cancel', label: 'Cancel', onClick: onCancel, variant: 'outline' },
    { id: 'submit', label: 'Submit', onClick: onSubmit, variant: 'default' }
  ]}
/>
```

## Best Practices

1. **Always provide unique IDs** for custom actions
2. **Use loading states** for async operations
3. **Disable buttons appropriately** during submission or validation failures
4. **Use correct variants** - destructive for dangerous actions, outline for cancel
5. **Test with sidebar** - both collapsed and expanded states
6. **Add pb-24 to form** to prevent content overlap
