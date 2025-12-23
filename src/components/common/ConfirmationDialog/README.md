# ConfirmationDialog Component

A reusable, generic confirmation dialog component built with Radix UI AlertDialog. This component can be used throughout the application for any action that requires user confirmation.

## Features

- ✅ Flexible content support (string or ReactNode)
- ✅ Customizable action buttons (text and variant)
- ✅ Support for destructive actions with visual feedback
- ✅ Optional icon support
- ✅ Accessible (built on Radix UI)
- ✅ Type-safe with TypeScript

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | `boolean` | Yes | - | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | Yes | - | Callback when dialog state changes |
| `onConfirm` | `() => void` | Yes | - | Action to execute on confirmation |
| `title` | `string` | Yes | - | Dialog title |
| `description` | `string \| ReactNode` | Yes | - | Dialog description or custom content |
| `confirmText` | `string` | No | `'Confirm'` | Text for confirm button |
| `cancelText` | `string` | No | `'Cancel'` | Text for cancel button |
| `variant` | `'default' \| 'destructive'` | No | `'default'` | Button styling variant |
| `icon` | `ReactNode` | No | - | Optional icon displayed above title |

## Usage Examples

### Basic Confirmation

```tsx
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={() => console.log('Confirmed!')}
      title="Are you sure?"
      description="This action will proceed with the operation."
    />
  );
}
```

### Destructive Action (Delete)

```tsx
<ConfirmationDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  onConfirm={handleDelete}
  title="Delete Item"
  description="This action cannot be undone. Are you sure?"
  confirmText="Delete"
  variant="destructive"
/>
```

### Rich Content Description

```tsx
<ConfirmationDialog
  open={checkInDialogOpen}
  onOpenChange={setCheckInDialogOpen}
  onConfirm={handleCheckIn}
  title="Check-In Visitor"
  description={
    <div className="space-y-2">
      <p>Confirm check-in for <strong>{visitor.name}</strong></p>
      <div className="text-xs space-y-1 bg-muted/50 p-3 rounded-md">
        <div><strong>Email:</strong> {visitor.email}</div>
        <div><strong>Phone:</strong> {visitor.phone}</div>
        <div><strong>Company:</strong> {visitor.company}</div>
      </div>
    </div>
  }
  confirmText="Check In"
/>
```

### With Icon

```tsx
import { AlertTriangle } from 'lucide-react';

<ConfirmationDialog
  open={warningDialogOpen}
  onOpenChange={setWarningDialogOpen}
  onConfirm={handleAction}
  title="Warning"
  description="This action may have unintended consequences."
  icon={<AlertTriangle className="h-12 w-12 text-yellow-500" />}
  variant="default"
/>
```

## State Management Pattern

The recommended pattern is to use a single state object for the dialog:

```tsx
const [confirmDialog, setConfirmDialog] = useState<{
  open: boolean;
  title: string;
  description: string | ReactNode;
  action: () => void;
  variant?: 'default' | 'destructive';
  confirmText?: string;
}>({
  open: false,
  title: '',
  description: '',
  action: () => {},
});

// Trigger the dialog
const handleDelete = (item: Item) => {
  setConfirmDialog({
    open: true,
    title: 'Delete Item',
    description: `Delete ${item.name}?`,
    confirmText: 'Delete',
    variant: 'destructive',
    action: () => {
      // Actual delete logic
      deleteItem(item.id);
    },
  });
};

// Render the dialog
<ConfirmationDialog
  open={confirmDialog.open}
  onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
  onConfirm={confirmDialog.action}
  title={confirmDialog.title}
  description={confirmDialog.description}
  confirmText={confirmDialog.confirmText}
  variant={confirmDialog.variant}
/>
```

## Real-World Example: Visitor Management

See `/src/modules/visitor-management/VisitorManagement.tsx` for a complete implementation with multiple confirmation types:
- Check-In confirmation with visitor details
- Check-Out confirmation with timestamp
- Delete confirmation with warning
- Approve/Reject confirmations

## Styling

The component uses:
- `bg-destructive` for destructive actions (red)
- `default` button styling for normal confirmations
- Responsive layout with proper spacing
- Theme-aware colors (light/dark mode support)

## Accessibility

Built on Radix UI AlertDialog, which provides:
- Proper ARIA attributes
- Focus management
- Keyboard navigation (ESC to close, Enter to confirm)
- Screen reader support
