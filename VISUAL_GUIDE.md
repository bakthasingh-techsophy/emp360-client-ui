# Visual Architecture Guide

## 🏗️ Component Hierarchy

```
App.tsx
  │
  ├─ ThemeProvider
  ├─ AuthProvider  
  ├─ LayoutProvider
  │
  └─ Routes
      │
      └─ LayoutWithAppShell  ← Application Layer (/src/layout/)
          │
          ├─ Loads: menuConfig, auth, preferences
          ├─ Wires: navigation, header, branding
          │
          └─ <AppShell>  ← Component Layer (/src/components/AppShell/)
              │
              ├─ Sidebar (collapsible)
              │   ├─ Logo & Brand
              │   ├─ Navigation Menu (from props)
              │   └─ Menu Picker Button
              │
              ├─ Header (fixed)
              │   └─ Custom Content (from props)
              │
              ├─ Content Area
              │   └─ <Outlet /> (your pages)
              │
              └─ <MenuPickerSheet>  ← Generic Menu Picker
                  ├─ Search
                  ├─ Categories
                  └─ Pin/Unpin Actions
```

## 📦 Package Structure

```
┌─────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                     │
│                                                           │
│  src/                                                    │
│  ├─ layout/                  ← YOUR CUSTOMIZATIONS      │
│  │  ├─ LayoutWithAppShell    • Menu wiring             │
│  │  ├─ index.ts              • Auth integration         │
│  │  └─ README.md             • Navigation setup         │
│  │                            • Header config            │
│  │                            • Branding                 │
│  │                                                       │
│  ├─ config/                  ← YOUR DATA                │
│  │  └─ menuConfig.tsx         Menu definitions          │
│  │                                                       │
│  ├─ contexts/                ← YOUR LOGIC               │
│  │  ├─ AuthContext           Authentication             │
│  │  └─ LayoutContext         Layout state               │
│  │                                                       │
│  └─ store/                   ← YOUR STATE               │
│     └─ menuPreferences        User preferences          │
│                                                           │
└───────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   REUSABLE COMPONENTS                     │
│                                                           │
│  src/components/                                         │
│  └─ AppShell/              ← GENERIC & REUSABLE         │
│     ├─ AppShell.tsx         • No app logic              │
│     ├─ MenuPickerDialog     • Props-based config        │
│     ├─ index.ts             • Type-safe interfaces      │
│     ├─ README.md            • Fully documented          │
│     └─ REUSABLE.md          • Copy to other projects    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌────────────┐
│   User     │
│   Action   │
└─────┬──────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│  LayoutWithAppShell.tsx                     │
│  (/src/layout/)                             │
│                                              │
│  1. Load menuConfig.getAllMenuItems()       │
│  2. Get auth state (useAuth)                │
│  3. Get user preferences (pinnedMenuIds)    │
│  4. Define header content                   │
│  5. Create navigation handler               │
│  6. Set branding (logo, name)               │
│                                              │
│  State:                                      │
│  • pinnedMenuIds: string[]                  │
│  • user: User                               │
│  • navigate: NavigateFunction               │
└────────┬────────────────────────────────────┘
         │
         │ Passes props ▼
         │
┌────────┴────────────────────────────────────┐
│  AppShell Component                         │
│  (/src/components/AppShell/)                │
│                                              │
│  Props received:                             │
│  • allMenuItems: MenuItem[]                 │
│  • pinnedMenuIds: string[]                  │
│  • onTogglePin: (id, isPinned) => void      │
│  • menuCategories: Category[]               │
│  • headerContent: ReactNode                 │
│  • brandName: string                        │
│  • logo: ReactNode                          │
│  • onNavigate: (item) => void               │
│  • sheetAnimationDuration: number           │
│                                              │
│  Renders:                                    │
│  ├─ Sidebar with filtered menus             │
│  ├─ Header with custom content              │
│  └─ Content area with children              │
│                                              │
│  Events emitted:                             │
│  • onTogglePin(menuId, isPinned)           │
│  • onNavigate(menuItem)                     │
└─────────────────────────────────────────────┘
         │
         │ User clicks menu ▼
         │
┌────────┴────────────────────────────────────┐
│  Event Handler                              │
│  (in LayoutWithAppShell)                    │
│                                              │
│  handleNavigate(item) {                     │
│    if (item.to) navigate(item.to)          │
│  }                                           │
│                                              │
│  handleTogglePin(id, isPinned) {           │
│    if (isPinned) removePinnedMenu(id)      │
│    else addPinnedMenu(id)                  │
│    setPinnedMenuIds(...)                    │
│  }                                           │
└─────────────────────────────────────────────┘
```

## 🎨 Styling & Theming

```
┌─────────────────────────────────────────────┐
│  ThemeProvider                              │
│  (Wraps entire app)                         │
│                                              │
│  CSS Variables:                              │
│  • --primary, --secondary, --accent         │
│  • --background, --foreground               │
│  • --border, --ring                         │
│                                              │
└────────┬────────────────────────────────────┘
         │
         │ Applied to ▼
         │
┌────────┴────────────────────────────────────┐
│  AppShell                                   │
│  Uses Tailwind + CSS vars                   │
│                                              │
│  Classes:                                    │
│  • bg-card (sidebar)                        │
│  • bg-background (content)                  │
│  • border-border (dividers)                 │
│  • text-primary (active items)              │
│                                              │
│  Animations:                                 │
│  • Framer Motion (sidebar slide)            │
│  • Tailwind transitions (collapse)          │
│  • Sheet duration: configurable via prop    │
└─────────────────────────────────────────────┘
```

## 🔌 Integration Points

```
External Systems          Your App Layer          Reusable Components
━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━━

React Router  ────────▶  LayoutWithAppShell  ───▶  AppShell
useNavigate()            • handleNavigate          • onNavigate prop
useLocation()            • getPageTitle            • location prop

Auth System   ────────▶  LayoutWithAppShell  ───▶  AppShell
useAuth()                • user data               • headerContent
logout()                 • permissions             • logo/brandName

State Mgmt    ────────▶  LayoutWithAppShell  ───▶  AppShell
localStorage             • pinnedMenuIds           • pinnedMenuIds prop
getPreferences()         • handleTogglePin         • onTogglePin prop

Menu Config   ────────▶  LayoutWithAppShell  ───▶  AppShell
menuConfig.tsx           • getAllMenuItems         • allMenuItems prop
menuCategories           • categories              • menuCategories prop

Theme System  ────────▶  ThemeToggle  ───────────▶  AppShell
ThemeProvider            • in headerContent        • headerContent prop
setTheme()               • switches theme          • renders header
```

## 📊 Component Communication

```
          Parent                    Child
          ────────────────────────────────

App.tsx
   │
   ├─▶ LayoutWithAppShell
   │      │
   │      │ Props ▼
   │      │ • allMenuItems
   │      │ • pinnedMenuIds
   │      │ • headerContent
   │      │ • onNavigate
   │      │ • onTogglePin
   │      │
   │      └─▶ AppShell
   │            │
   │            │ Props ▼
   │            │ • menuItems
   │            │ • collapsed
   │            │ • logo
   │            │
   │            ├─▶ AppShellSidebar
   │            │     └─▶ MenuItems (rendered)
   │            │
   │            ├─▶ AppShellHeader
   │            │     └─▶ headerContent (rendered)
   │            │
   │            └─▶ MenuPickerSheet
   │                  │
   │                  │ Callbacks ▲
   │                  │ • onTogglePin(id, isPinned)
   │                  │
   │                  └─ Emits to parent
```

## 🎯 Props Flow

```
User's Config            LayoutWithAppShell           AppShell
━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━━         ━━━━━━━━━

menuConfig.tsx
getAllMenuItems() ────▶ const allMenuItems ────────▶ allMenuItems prop
menuCategories    ────▶ const categories   ────────▶ menuCategories prop

menuPreferences.ts
getPreferences()  ────▶ const [pinnedIds] ─────────▶ pinnedMenuIds prop
addPinnedMenu()   ────▶ handleTogglePin    ────────▶ onTogglePin prop

React Router
useNavigate()     ────▶ const navigate     ────────▶ handleNavigate
                        ▼                            ▼
                   onNavigate={(item) => {      onNavigate prop
                     navigate(item.to)
                   }}

Custom UI
<UserMenu />      ────▶ const headerContent ───────▶ headerContent prop
<ThemeToggle />
<h1>Title</h1>

Branding
<Logo />          ────▶ logo prop          ────────▶ logo prop
"App Name"        ────▶ brandName          ────────▶ brandName prop

Performance
200 (default)     ────▶ can override       ────────▶ sheetAnimationDuration
```

## 📝 Type Safety Flow

```
TypeScript Contracts
━━━━━━━━━━━━━━━━━━━━

Interface Definition (AppShell)
┌─────────────────────────────────┐
│ interface AppShellMenuItem {    │
│   id: string;                   │
│   label: string;                │
│   icon: LucideIcon;             │
│   to?: string;                  │
│   category?: string;            │
│ }                               │
└────────┬────────────────────────┘
         │
         │ enforces ▼
         │
Your Implementation (menuConfig)
┌─────────────────────────────────┐
│ const menus: AppShellMenuItem[] │
│   = [                           │
│   {                              │
│     id: 'dashboard', ✓          │
│     label: 'Dashboard', ✓       │
│     icon: HomeIcon, ✓           │
│     to: '/dashboard', ✓         │
│   }                              │
│ ];                              │
└────────┬────────────────────────┘
         │
         │ passed to ▼
         │
AppShell Component
┌─────────────────────────────────┐
│ function AppShell(props) {      │
│   props.allMenuItems.map(item  │
│     => /* TypeScript knows      │
│           item.label exists */  │
│   )                             │
│ }                               │
└─────────────────────────────────┘

If you break the contract:
❌ TypeScript error at compile time
✓ Caught before runtime
```

---

## 🚀 Quick Reference

**To customize your app:**
→ Edit `/src/layout/LayoutWithAppShell.tsx`

**To reuse in another project:**
→ Copy `/src/components/AppShell/` folder

**To understand architecture:**
→ Read `/ARCHITECTURE.md`

**To see usage examples:**
→ Check `/src/layout/LayoutWithAppShell.tsx`

**To configure animation:**
→ Pass `sheetAnimationDuration` prop

**To add new menus:**
→ Edit `/src/config/menuConfig.tsx`
