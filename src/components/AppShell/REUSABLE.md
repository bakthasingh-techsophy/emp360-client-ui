# AppShell Component Library - Reusable Components

This directory contains **fully reusable** shell components that can be used in any React/TypeScript project.

## 🎯 Reusable Components

### 1. MenuPickerSheet

A **generic, project-agnostic** slide-out sheet component for managing pinned/visible menu items. Inspired by Microsoft Outlook and Darwinbox.

#### Features
- ✅ Fully generic - works with any menu structure
- ✅ Search functionality
- ✅ Category-based grouping
- ✅ Pin/unpin functionality
- ✅ Customizable styling
- ✅ Mobile-friendly
- ✅ Fast animations (200ms)

#### Usage

```typescript
import { MenuPickerSheet, type GenericMenuItem, type MenuPickerCategory } from '@/components/AppShell';

// Define your menu items
const myMenuItems: GenericMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    to: '/dashboard',
    category: 'Main',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    to: '/settings',
    category: 'Admin',
  },
  // ... more items
];

// Define categories (optional)
const categories: MenuPickerCategory[] = [
  { id: 'main', label: 'Main', icon: HomeIcon },
  { id: 'admin', label: 'Admin', icon: ShieldIcon },
];

// Use in your component
function MyApp() {
  const [open, setOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState(['dashboard']);

  const handleTogglePin = (menuId: string, isPinned: boolean) => {
    if (isPinned) {
      setPinnedIds(prev => prev.filter(id => id !== menuId));
    } else {
      setPinnedIds(prev => [...prev, menuId]);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Menu Picker</button>
      
      <MenuPickerSheet
        open={open}
        onOpenChange={setOpen}
        allMenuItems={myMenuItems}
        pinnedMenuIds={pinnedIds}
        onTogglePin={handleTogglePin}
        categories={categories}
        title="All Features"
        description="Customize your sidebar"
        searchPlaceholder="Search features..."
        emptyStateMessage="No features found"
        showItemPath={true}
      />
    </>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Whether the sheet is open |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `allMenuItems` | `GenericMenuItem[]` | - | All available menu items |
| `pinnedMenuIds` | `string[]` | - | IDs of currently pinned items |
| `onTogglePin` | `(menuId: string, isPinned: boolean) => void` | - | Callback when item is toggled |
| `categories` | `MenuPickerCategory[]` | `[]` | Optional categories for grouping |
| `title` | `string` | `'All Menus'` | Sheet title |
| `description` | `string` | `'Pin items to your sidebar...'` | Sheet description |
| `headerIcon` | `LucideIcon` | `Grid3x3` | Icon for header |
| `searchPlaceholder` | `string` | `'Search...'` | Search placeholder text |
| `emptyStateMessage` | `string` | `'No items found'` | Empty state message |
| `showItemPath` | `boolean` | `true` | Show item path/route in UI |
| `className` | `string` | - | Custom className for content |
| `animationDuration` | `number` | `200` | Animation duration in ms |

#### Types

```typescript
interface GenericMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  category?: string;
  [key: string]: any; // Extend with custom properties
}

interface MenuPickerCategory {
  id: string;
  label: string;
  icon?: LucideIcon;
}
```

---

### 2. AppShell

A complete application shell with sidebar, header, and content area. Supports pinned menus via MenuPickerSheet integration.

#### Usage

```typescript
import { AppShell, type AppShellMenuItem } from '@/components/AppShell';

function MyApp() {
  const menuItems: AppShellMenuItem[] = [...];
  const [pinnedIds, setPinnedIds] = useState([...]);

  return (
    <AppShell
      allMenuItems={menuItems}
      pinnedMenuIds={pinnedIds}
      onTogglePin={handleTogglePin}
      menuCategories={categories}
      headerContent={<MyHeader />}
      logo={<MyLogo />}
      brandName="My App"
      onNavigate={(item) => navigate(item.to)}
    >
      {/* Your page content */}
    </AppShell>
  );
}
```

---

## 🔧 Integration Steps

### Step 1: Copy Components

Copy the following files to your project:
- `MenuPickerDialog.tsx` (the reusable sheet component)
- `AppShell.tsx` (optional - if you want the full shell)

### Step 2: Install Dependencies

```bash
npm install lucide-react @radix-ui/react-dialog framer-motion
```

### Step 3: Ensure shadcn/ui Components

You need these shadcn/ui components:
- `Sheet`
- `Button`
- `Input`
- `Badge`
- `ScrollArea`
- `Separator`

Install them:
```bash
npx shadcn-ui@latest add sheet button input badge scroll-area separator
```

### Step 4: Use in Your Project

```typescript
import { MenuPickerSheet } from './components/MenuPickerSheet';

// Use as shown in examples above
```

---

## 🎨 Customization

### Styling

The component uses Tailwind CSS and shadcn/ui theming. Customize via:

1. **Tailwind theme** - colors, spacing, etc.
2. **Custom className** - pass `className` prop
3. **CSS variables** - modify shadcn theme vars

### Animation Speed

Sheet animation is configurable via props:

```typescript
<MenuPickerSheet
  animationDuration={300} // Adjust as needed (ms)
  // ... other props
/>

<AppShell
  sheetAnimationDuration={300} // Controls MenuPickerSheet animation
  // ... other props
/>
```

**Note**: The underlying Sheet component uses Tailwind duration classes. For deeper customization, modify `src/components/ui/sheet.tsx`:

```typescript
// In sheetVariants
'data-[state=open]:duration-200' // Adjust as needed
```

---

## 📦 Export for NPM (Optional)

To publish as a standalone package:

1. Extract components to separate package
2. Add peer dependencies:
   ```json
   {
     "peerDependencies": {
       "react": "^18.0.0",
       "lucide-react": "^0.263.0",
       "@radix-ui/react-dialog": "^1.0.0"
     }
   }
   ```
3. Build and publish

---

## 🚀 Examples

See `src/layout/LayoutWithAppShell.tsx` for a complete HRMS implementation example.

---

## 📝 License

MIT - Use freely in any project!
