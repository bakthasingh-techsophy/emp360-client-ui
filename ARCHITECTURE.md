# Architecture Overview - AppShell System

## 🎯 Separation of Concerns

The AppShell system follows a clean **layered architecture** with clear separation between reusable components and application-specific code.

```
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                              │
│                  (Your App-Specific Code)                        │
│                                                                   │
│   Location: /src/layout/                                        │
│   ├─ LayoutWithAppShell.tsx   ← Edit this for your app         │
│   ├─ index.ts                                                    │
│   └─ README.md                                                   │
│                                                                   │
│   What it does:                                                  │
│   • Imports menu config from @/config/menuConfig                │
│   • Wires up authentication (@/contexts/AuthContext)            │
│   • Configures navigation (React Router)                        │
│   • Defines header content (user menu, theme, etc.)             │
│   • Manages user preferences (pinned menus)                     │
│   • Sets branding (logo, app name)                              │
│                                                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   COMPONENT LAYER                                │
│                  (Reusable Components)                           │
│                                                                   │
│   Location: /src/components/AppShell/                           │
│   ├─ AppShell.tsx              ← Generic shell (props-based)    │
│   ├─ MenuPickerDialog.tsx      ← Generic menu picker            │
│   ├─ index.ts / index.tsx      ← Exports                        │
│   ├─ README.md                 ← Component docs                 │
│   └─ REUSABLE.md               ← Reusability guide              │
│                                                                   │
│   What it does:                                                  │
│   • Provides layout structure (sidebar, header, content)        │
│   • Manages sidebar collapse/expand                             │
│   • Handles mobile responsiveness                               │
│   • Renders menu items from props                               │
│   • Provides menu picker UI                                     │
│   • Accepts all config via props (100% generic)                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 Folder Structure

```
src/
├── layout/                           ← APPLICATION-SPECIFIC
│   ├── LayoutWithAppShell.tsx       ← Your customized layout
│   ├── index.ts
│   └── README.md
│
├── components/
│   └── AppShell/                    ← REUSABLE COMPONENTS
│       ├── AppShell.tsx             ← Generic shell
│       ├── MenuPickerDialog.tsx     ← Generic picker
│       ├── index.ts / index.tsx
│       ├── README.md
│       └── REUSABLE.md
│
├── config/
│   └── menuConfig.tsx               ← YOUR menu definitions
│
├── contexts/
│   ├── AuthContext.tsx              ← YOUR auth logic
│   └── LayoutContext.tsx
│
└── store/
    └── menuPreferences.ts           ← YOUR user preferences
```

## 🔄 Data Flow

```
User Interaction
      │
      ▼
┌──────────────────────────┐
│  LayoutWithAppShell      │  ← Application Layer
│  (src/layout/)           │
│                          │
│  • Loads menu config     │
│  • Manages pinned state  │
│  • Handles navigation    │
└─────────┬────────────────┘
          │
          │ passes props
          ▼
┌──────────────────────────┐
│  AppShell                │  ← Component Layer
│  (src/components/)       │
│                          │
│  • Renders UI            │
│  • Manages layout state  │
│  • Emits events          │
└──────────────────────────┘
```

## 🎯 Type System

### Type Contracts (enforced by AppShell)

```typescript
// Your menus MUST follow this interface
interface AppShellMenuItem {
  id: string;              // Required: unique ID
  label: string;           // Required: display text
  icon: LucideIcon;        // Required: icon component
  to?: string;             // Optional: route path
  category?: string;       // Optional: grouping
  permission?: () => boolean;  // Optional: access control
  exact?: boolean;
  isActive?: (pathname: string) => boolean;
}
```

The AppShell component **enforces this contract** - any menu system using it must conform to these types.

## 📋 Component Responsibilities

### AppShell (Reusable)
- ✅ Layout structure (sidebar, header, content)
- ✅ Sidebar collapse/expand
- ✅ Mobile responsiveness
- ✅ Menu rendering
- ✅ Active state detection
- ❌ NO auth logic
- ❌ NO route configuration
- ❌ NO hardcoded menus
- ❌ NO app-specific logic

### LayoutWithAppShell (App-Specific)
- ✅ Menu configuration loading
- ✅ Authentication integration
- ✅ Navigation wiring
- ✅ User preference management
- ✅ Header toolbar definition
- ✅ Branding configuration
- ✅ App-specific event handlers

## 🔧 Customization Points

### For New Projects

1. **Copy reusable components**:
   ```
   cp -r src/components/AppShell /new-project/src/components/
   ```

2. **Create your layout**:
   ```typescript
   // new-project/src/layout/MyAppLayout.tsx
   import { AppShell } from '@/components/AppShell';
   
   export function MyAppLayout() {
     // Your app's specific wiring
     const menuItems = getMyMenus();
     const { user } = useMyAuth();
     
     return (
       <AppShell
         allMenuItems={menuItems}
         brandName="My App"
         // ... your config
       />
     );
   }
   ```

### For This Project (HRMS)

Edit `/src/layout/LayoutWithAppShell.tsx`:
- Modify menu configuration
- Change header content
- Update navigation logic
- Adjust branding

**DON'T** edit `/src/components/AppShell/` - it's reusable!

## ⚙️ Configuration Options

### Animation Speed
```typescript
<AppShell sheetAnimationDuration={300} />  // Sheet slide-in speed (ms)
```

### Menu Categories
```typescript
const categories = [
  { id: 'core', label: 'Core', icon: LayersIcon },
  { id: 'admin', label: 'Admin', icon: ShieldIcon },
];

<AppShell menuCategories={categories} />
```

### Custom Navigation
```typescript
const handleNavigate = (item: AppShellMenuItem) => {
  if (item.to) {
    // Use your router
    router.push(item.to);
  }
};

<AppShell onNavigate={handleNavigate} />
```

## 📖 Documentation

- **Component Layer**: `/src/components/AppShell/README.md`
- **Reusability Guide**: `/src/components/AppShell/REUSABLE.md`
- **Application Layer**: `/src/layout/README.md`
- **This Overview**: `/ARCHITECTURE.md`

## 🎓 Key Principles

1. **Generic Components**: AppShell has NO app-specific logic
2. **Props-Based Config**: Everything configurable via props
3. **Type Safety**: TypeScript interfaces enforce contracts
4. **Separation of Concerns**: Clear boundary between layers
5. **Reusability**: AppShell can be used in ANY React app
6. **Customizability**: Layout layer wires up app specifics

## ✅ Benefits

- 🔄 Easy to reuse in other projects
- 🎯 Clear separation of concerns
- 📝 Type-safe contracts
- 🔧 Highly configurable
- 📚 Well-documented
- 🧪 Easy to test (components are pure)
- 🚀 Quick to customize for new apps

## 🚀 Getting Started

1. **Understand the architecture** (this document)
2. **Read component docs** (`/src/components/AppShell/README.md`)
3. **Check the example** (`/src/layout/LayoutWithAppShell.tsx`)
4. **Customize your layout** (edit `/src/layout/LayoutWithAppShell.tsx`)
5. **Define your menus** (edit `/src/config/menuConfig.tsx`)

---

**Remember**: 
- `/src/components/AppShell/` = Reusable (don't modify for app needs)
- `/src/layout/` = App-specific (customize here)
