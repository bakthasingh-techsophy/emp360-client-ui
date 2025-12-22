# Layout Folder

This folder contains **application-specific layout implementations**. These are NOT reusable components.

## Purpose

The layout components here serve as the **integration layer** between:
- Your reusable `AppShell` component (in `@/components/AppShell`)
- Your application's specific requirements (auth, menus, navigation, etc.)

## Files

### `LayoutWithAppShell.tsx`

The main application layout that wires up:
- ✅ Menu configuration from `@/config/menuConfig`
- ✅ Authentication from `@/contexts/AuthContext`
- ✅ Navigation using React Router
- ✅ Theme switching
- ✅ User preferences (pinned menus)
- ✅ Header toolbar with user menu

**This is where you customize your app's layout behavior.**

## Architecture

```
┌─────────────────────────────────────────┐
│   Your Application (App.tsx)            │
│   - Routes                               │
│   - Providers                            │
└─────────────┬───────────────────────────┘
              │
              │ uses
              ▼
┌─────────────────────────────────────────┐
│   Layout Layer (THIS FOLDER)            │
│   - LayoutWithAppShell.tsx              │
│   - App-specific wiring                 │
│   - Menu config integration             │
│   - Auth integration                    │
└─────────────┬───────────────────────────┘
              │
              │ uses
              ▼
┌─────────────────────────────────────────┐
│   Reusable Components                   │
│   - AppShell (in @/components/AppShell) │
│   - Generic, prop-based                 │
│   - No app-specific logic               │
└─────────────────────────────────────────┘
```

## Customization Guide

When adapting for your application, modify `LayoutWithAppShell.tsx`:

### 1. Menu System
```typescript
// Import your menu configuration
import { getAllMenuItems, menuCategories } from '@/config/menuConfig';

const allMenuItems = getAllMenuItems();
```

### 2. Authentication
```typescript
// Import your auth context
import { useAuth } from '@/contexts/AuthContext';

const { user, logout } = useAuth();
```

### 3. Navigation
```typescript
// Use your router (React Router, Next.js, etc.)
import { useNavigate } from 'react-router-dom';

const handleNavigate = (item) => {
  navigate(item.to);
};
```

### 4. Branding
```typescript
<AppShell
  logo={<YourLogo />}
  brandName="Your App Name"
  // ... other props
/>
```

### 5. Header Content
```typescript
const headerContent = (
  <>
    <PageTitle />
    <Search />
    <Notifications />
    <UserMenu />
  </>
);
```

### 6. Animation Speed
```typescript
<AppShell
  sheetAnimationDuration={300} // Adjust sheet slide speed (ms)
  // ... other props
/>
```

## Don't Modify

❌ Don't modify `@/components/AppShell` - it's reusable  
✅ Modify THIS folder (`@/layout`) for app-specific changes

## Reusability

If you want to use the AppShell in another project:
1. Copy `@/components/AppShell` folder (reusable component)
2. Create a NEW layout file like this one (app-specific wiring)
3. Wire it up to your new app's auth, menus, navigation, etc.

The `AppShell` is project-agnostic. This `layout` folder is project-specific.
