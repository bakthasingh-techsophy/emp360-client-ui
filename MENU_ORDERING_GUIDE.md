# Menu Ordering System Guide

## Overview
The menu ordering system allows you to control the display order of menu items in the sidebar. This is useful for prioritizing important features and organizing the navigation to match user workflows.

## Architecture

### 1. **Order Field in Menu Config** (`menuConfig.tsx`)
Each menu item can have an optional `order` field:

```typescript
{
  id: 'dashboard',
  to: '/dashboard',
  icon: Home,
  label: 'Dashboard',
  category: 'Dashboard',
  order: 1,  // Lower number = higher priority (appears first)
}
```

### 2. **Order Storage** (`menuPreferences.ts`)
User's custom menu order is persisted in localStorage:

```typescript
interface MenuPreferences {
  pinnedMenuIds: string[];
  menuOrder: Record<string, number>; // Maps menuId to order position
  lastUpdated: string;
}
```

### 3. **Display Logic** (`AppShell.tsx`)
The sidebar displays menus in sorted order:
- First, sort by the `order` field from menuConfig (if present)
- If orders are equal, preserve the pinned order from preferences
- Menus without order field are placed at the end

## How to Use

### Setting Default Order in Menu Config

1. Open `/src/config/menuConfig.tsx`
2. Add `order` field to menu items (lower number = higher priority):

```typescript
export const allMenuItems: MenuItemConfig[] = [
  {
    id: 'dashboard',
    order: 1,  // Shows first
    // ... other fields
  },
  {
    id: 'visitor-management',
    order: 2,  // Shows second
    // ... other fields
  },
  {
    id: 'room-booking',
    order: 3,  // Shows third
    // ... other fields
  },
  {
    id: 'some-other-menu',
    // No order field - will appear after ordered items
  },
];
```

### Default Pinned Menus Order

Edit the `DEFAULT_PINNED_MENUS` array in `/src/store/menuPreferences.ts`:

```typescript
const DEFAULT_PINNED_MENUS = [
  'dashboard',           // Order 0
  'visitor-management',  // Order 1
  'room-booking',        // Order 2
  'policy-library',      // Order 3
  // ... etc
];
```

### Programmatic Order Updates

Use the utility functions:

```typescript
import { updateMenuOrder, getOrderedPinnedMenuIds } from '@/store/menuPreferences';

// Update menu order
updateMenuOrder(['dashboard', 'visitor-management', 'room-booking']);

// Get ordered menu IDs
const orderedIds = getOrderedPinnedMenuIds();
```

## Order Priority Logic

The sidebar menu order is determined by:

1. **Primary**: `order` field from `menuConfig.tsx` (if present)
2. **Secondary**: Position in `pinnedMenuIds` array (from localStorage)
3. **Fallback**: Original array order

Example:
```typescript
// If menu items have these orders:
dashboard: order = 1
visitor-management: order = 2
room-booking: order = 3
my-profile: no order (defaults to MAX_SAFE_INTEGER)

// Sidebar will display:
// 1. Dashboard
// 2. Visitor Management  
// 3. Room Booking
// 4. My Profile (no order, so appears last)
```

## Benefits

✅ **Backward Compatible**: Menus without `order` field still work
✅ **User Preferences**: Order is saved per user in localStorage
✅ **Flexible**: Can reorder by changing order values or array position
✅ **Persistent**: Order survives page reloads and app restarts
✅ **Independent**: Menu sheet (all menus dialog) is not affected by order

## Important Notes

- **Sidebar Only**: The order field only affects the sidebar (pinned menus)
- **Menu Sheet**: The "All Menus" sheet displays items in their original category order
- **No Order Field**: Menus without an order value appear after ordered items
- **Equal Orders**: If two menus have the same order value, they maintain their original relative position
- **User Customization**: Users can pin/unpin menus which updates their personal order preferences

## Example Configuration

For a Visitor Management focused app:

```typescript
// menuConfig.tsx
{
  id: 'visitor-management',
  order: 1,  // Most important - shows first
  // ...
},
{
  id: 'dashboard',
  order: 2,  // Second priority
  // ...
},
{
  id: 'room-booking',
  order: 3,  // Third priority
  // ...
}

// Other menus without order field will appear after these
```

## API Reference

### Functions in `menuPreferences.ts`

```typescript
// Get ordered menu IDs for display
getOrderedPinnedMenuIds(): string[]

// Update menu order
updateMenuOrder(orderedMenuIds: string[]): void

// Add menu to end of sidebar
addPinnedMenu(menuId: string): void

// Remove menu from sidebar
removePinnedMenu(menuId: string): void

// Reset to defaults
resetMenuPreferences(): void
```

## Future Enhancements

Possible future features:
- Drag & drop reordering in sidebar
- Bulk reorder UI
- Import/export menu configurations
- Role-based default orders
- Per-module order configurations
