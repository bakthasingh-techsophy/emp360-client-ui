# AppShell Component

> **📍 Important**: This folder contains **REUSABLE** components only. 
> For application-specific layout implementations, see `/src/layout/` folder.

A **fully reusable application skeleton** component that provides a complete layout structure with sidebar navigation, top header/toolbar, and content area. Perfect for admin dashboards, SaaS applications, and any project requiring consistent layout across multiple pages.

## Features

✅ **Collapsible Sidebar** - Smooth animations, responsive behavior  
✅ **Custom Header/Toolbar** - Pass any React components  
✅ **Mobile-First Responsive** - Touch-friendly drawer on mobile  
✅ **Route-Based Navigation** - Automatic active state detection  
✅ **Page Transitions** - Optional animated page changes  
✅ **Highly Configurable** - Props for everything  
✅ **Router Agnostic** - Works with React Router or any routing library  
✅ **Accessible** - ARIA labels, keyboard navigation, focus management  
✅ **TypeScript** - Full type safety  

## Quick Start

```tsx
import { AppShell } from '@/components/AppShell';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

function App() {
  return (
    <AppShell
      menuItems={[
        { id: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'users', to: '/users', icon: Users, label: 'Users' },
        { id: 'settings', to: '/settings', icon: Settings, label: 'Settings' },
      ]}
      headerContent={
        <>
          <h1>My App</h1>
          <UserMenu />
        </>
      }
      logo={<Logo />}
      brandName="MyApp"
    >
      <YourPageContent />
    </AppShell>
  );
}
```

## API Reference

### Props

#### AppShellProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `menuItems` | `AppShellMenuItem[]` | **required** | Navigation menu items |
| `headerContent` | `ReactNode` | `undefined` | Custom header/toolbar content |
| `logo` | `ReactNode` | `undefined` | Brand logo component |
| `brandName` | `string` | `'App'` | Brand name displayed in sidebar |
| `children` | `ReactNode` | **required** | Page content |
| `loadingBar` | `ReactNode` | `undefined` | Loading indicator component |
| `collapsed` | `boolean` | `undefined` | Controlled sidebar collapse state |
| `onCollapsedChange` | `(collapsed: boolean) => void` | `undefined` | Callback when collapse changes |
| `contentClassName` | `string` | `undefined` | Additional classes for content area |
| `enableTransitions` | `boolean` | `true` | Enable page transition animations |
| `transitionConfig` | `object` | See below | Animation configuration |
| `onNavigate` | `(item: AppShellMenuItem) => void` | `undefined` | Custom navigation handler |
| `onMobileClose` | `() => void` | `undefined` | Callback when mobile menu closes |
| `showCollapseButton` | `boolean` | `true` | Show collapse button in sidebar |
| `renderMenuItem` | `(item, isActive, collapsed) => ReactNode` | `undefined` | Custom menu item renderer |

#### AppShellMenuItem

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier |
| `to` | `string` | ✅ | Navigation path/route |
| `icon` | `LucideIcon` | ✅ | Icon component |
| `label` | `string` | ✅ | Display label |
| `permission` | `() => boolean` | ❌ | Permission check function |
| `exact` | `boolean` | ❌ | Exact path matching |
| `isActive` | `(pathname: string) => boolean` | ❌ | Custom active check |

#### Default Transition Config

```typescript
{
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: 'easeOut' }
}
```

## Usage Examples

### Basic Setup

```tsx
import { AppShell } from '@/components/AppShell';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings 
} from 'lucide-react';

export function App() {
  const menuItems = [
    { id: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', to: '/users', icon: Users, label: 'Users' },
    { id: 'billing', to: '/billing', icon: CreditCard, label: 'Billing' },
    { id: 'settings', to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <AppShell
      menuItems={menuItems}
      headerContent={<h1>My Application</h1>}
      brandName="MyApp"
      logo={<MyLogo />}
    >
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        {/* ... other routes */}
      </Routes>
    </AppShell>
  );
}
```

### With React Router

```tsx
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { AppShell, AppShellMenuItem } from '@/components/AppShell';

export function AppWithRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: AppShellMenuItem[] = [
    { id: 'home', to: '/', icon: Home, label: 'Home', exact: true },
    { id: 'products', to: '/products', icon: Package, label: 'Products' },
    { id: 'orders', to: '/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  return (
    <AppShell
      menuItems={menuItems}
      onNavigate={(item) => navigate(item.to)}
      headerContent={
        <>
          <SearchBar />
          <NotificationBell />
          <UserMenu />
        </>
      }
      brandName="E-Commerce Admin"
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </AppShell>
  );
}
```

### With Permission-Based Navigation

```tsx
import { AppShell } from '@/components/AppShell';
import { useAuth } from './hooks/useAuth';

export function App() {
  const { can } = useAuth();

  const menuItems = [
    { 
      id: 'dashboard', 
      to: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      permission: () => can('dashboard.view')
    },
    { 
      id: 'users', 
      to: '/users', 
      icon: Users, 
      label: 'Users',
      permission: () => can('users.read')
    },
    { 
      id: 'admin', 
      to: '/admin', 
      icon: Shield, 
      label: 'Admin',
      permission: () => can('admin.access')
    },
  ];

  return (
    <AppShell
      menuItems={menuItems}
      headerContent={<UserInfo />}
      brandName="Admin Panel"
    >
      <Outlet />
    </AppShell>
  );
}
```

### With Custom Header Content

```tsx
import { AppShell } from '@/components/AppShell';
import { ThemeToggle } from './components/ThemeToggle';
import { UserMenu } from './components/UserMenu';
import { Button } from './components/ui/button';

export function MyApp() {
  return (
    <AppShell
      menuItems={menuItems}
      headerContent={
        <>
          {/* Left side - Page title or breadcrumbs */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Quick Action
            </Button>
            <ThemeToggle />
            <UserMenu />
          </div>
        </>
      }
      logo={<LayoutGrid className="h-6 w-6 text-primary" />}
      brandName="My App"
    >
      <Outlet />
    </AppShell>
  );
}
```

### Controlled Sidebar State

```tsx
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';

export function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AppShell
      menuItems={menuItems}
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      onMobileClose={() => {
        console.log('Mobile menu closed');
      }}
      headerContent={<CustomHeader />}
    >
      <YourContent />
    </AppShell>
  );
}
```

### Custom Menu Item Rendering

```tsx
import { NavLink } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';

export function App() {
  return (
    <AppShell
      menuItems={menuItems}
      renderMenuItem={(item, isActive, collapsed) => (
        <NavLink
          key={item.id}
          to={item.to}
          className={({ isActive }) => 
            cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg',
              isActive ? 'bg-primary text-white' : 'text-gray-600'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && item.badge && (
            <Badge>{item.badge}</Badge>
          )}
        </NavLink>
      )}
      headerContent={<Header />}
    >
      <Outlet />
    </AppShell>
  );
}
```

### With Loading Bar

```tsx
import { AppShell } from '@/components/AppShell';
import { LoadingBar } from './components/LoadingBar';

export function App() {
  return (
    <AppShell
      menuItems={menuItems}
      loadingBar={<LoadingBar />}
      headerContent={<Header />}
    >
      <Outlet />
    </AppShell>
  );
}
```

### Disable Transitions

```tsx
<AppShell
  menuItems={menuItems}
  enableTransitions={false}
  headerContent={<Header />}
>
  <FastRenderingContent />
</AppShell>
```

### Custom Transition Animation

```tsx
<AppShell
  menuItems={menuItems}
  transitionConfig={{
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  }}
  headerContent={<Header />}
>
  <Content />
</AppShell>
```

### Custom Active Route Detection

```tsx
const menuItems = [
  {
    id: 'users',
    to: '/users',
    icon: Users,
    label: 'Users',
    // Custom logic to determine if this item is active
    isActive: (pathname) => {
      return pathname.startsWith('/users') || 
             pathname.startsWith('/people') ||
             pathname.includes('/user-management');
    }
  },
  {
    id: 'settings',
    to: '/settings',
    icon: Settings,
    label: 'Settings',
    exact: true, // Only active on exact match
  }
];

<AppShell menuItems={menuItems}>
  <Content />
</AppShell>
```

### Multi-Project Usage

```tsx
// Project A - E-Commerce Admin
<AppShell
  menuItems={ecommerceMenuItems}
  headerContent={<EcommerceHeader />}
  logo={<ShoppingBag />}
  brandName="Shop Admin"
>
  <EcommerceRoutes />
</AppShell>

// Project B - CRM System
<AppShell
  menuItems={crmMenuItems}
  headerContent={<CRMHeader />}
  logo={<Users />}
  brandName="CRM Pro"
>
  <CRMRoutes />
</AppShell>

// Project C - Project Management
<AppShell
  menuItems={projectMenuItems}
  headerContent={<ProjectHeader />}
  logo={<FolderKanban />}
  brandName="Project Manager"
>
  <ProjectRoutes />
</AppShell>
```

## Features in Detail

### Responsive Behavior

- **Desktop**: Sidebar always visible, collapsible
- **Mobile**: Drawer-style sidebar with overlay backdrop
- **Tablet**: Hybrid behavior based on screen width
- **Breakpoint**: Tailwind's `lg` (1024px)

### Keyboard Navigation

- `ESC` - Close mobile menu
- `Tab` - Navigate through menu items
- `Enter/Space` - Activate focused menu item
- Focus trap in mobile menu

### Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Screen reader friendly
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Semantic HTML structure

### State Persistence

- Sidebar collapse state saved to `localStorage`
- Key: `app-shell-sidebar-collapsed`
- Automatically restored on page reload

### Animation

- Smooth sidebar collapse/expand
- Page transition animations (optional)
- Mobile drawer slide-in/out
- Backdrop fade in/out
- Spring-based physics for natural feel

## Integration with Existing Projects

### Replace Current Layout

```tsx
// Before
<Layout>
  <Outlet />
</Layout>

// After
<AppShell
  menuItems={menuItems}
  headerContent={
    <>
      <PageTitle />
      <ThemeToggle />
      <UserMenu />
    </>
  }
  logo={<AppLogo />}
  brandName="My App"
  loadingBar={<LoadingBar />}
>
  <Outlet />
</AppShell>
```

### Migrate Sidebar Menu

```tsx
// Extract from existing Sidebar component
const navItems = [
  { to: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard.view' },
  { to: 'users', icon: Users, label: 'Users', permission: 'users.read' },
  // ... etc
];

// Convert to AppShell format
const menuItems: AppShellMenuItem[] = navItems.map(item => ({
  id: item.to,
  to: `/${item.to}`,
  icon: item.icon,
  label: item.label,
  permission: () => can(item.permission)
}));
```

### Migrate Header Content

```tsx
// Extract from existing Header component
const headerContent = (
  <>
    <div className="flex-1">
      <PageTitle />
    </div>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button variant="outline" onClick={handleAction}>
        Quick Action
      </Button>
      <UserMenu />
    </div>
  </>
);

<AppShell
  menuItems={menuItems}
  headerContent={headerContent}
  // ... other props
>
```

## Styling

### Customization via Tailwind

The component uses Tailwind CSS classes. Customize by modifying:

```tsx
// Custom content padding
<AppShell contentClassName="px-8 py-12">

// Or extend the component
const CustomAppShell = (props) => (
  <AppShell
    {...props}
    contentClassName={cn("custom-padding", props.contentClassName)}
  />
);
```

### Theme Support

Works with any Tailwind theme. Uses CSS variables for colors:

- `background` - Main background
- `card` - Sidebar and header background
- `primary` - Active menu item
- `muted-foreground` - Inactive menu items
- `accent` - Hover states

## Performance

### Optimizations

- Minimal re-renders via proper memoization
- Efficient event listeners with cleanup
- Conditional rendering for mobile/desktop
- Lazy animation calculations
- No unnecessary DOM updates

### Bundle Size

- Core component: ~8KB gzipped
- Dependencies: framer-motion, lucide-react
- Total impact: ~15-20KB gzipped

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ IE11 not supported (uses modern JS features)

## TypeScript

Full TypeScript support with comprehensive types:

```typescript
import { AppShell, AppShellProps, AppShellMenuItem } from '@/components/AppShell';

// Type-safe menu items
const menuItems: AppShellMenuItem[] = [
  // ...
];

// Type-safe props
const appShellProps: AppShellProps = {
  menuItems,
  headerContent: <Header />,
  // ...
};
```

## Testing

### Unit Tests Example

```typescript
import { render, fireEvent } from '@testing-library/react';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders menu items', () => {
    const { getByText } = render(
      <AppShell menuItems={mockItems}>
        <div>Content</div>
      </AppShell>
    );
    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  it('toggles sidebar on collapse button click', () => {
    const { getByLabelText } = render(
      <AppShell menuItems={mockItems}>
        <div>Content</div>
      </AppShell>
    );
    const collapseBtn = getByLabelText('Collapse sidebar');
    fireEvent.click(collapseBtn);
    expect(getByLabelText('Expand sidebar')).toBeInTheDocument();
  });

  it('closes mobile menu on ESC', () => {
    const onMobileClose = jest.fn();
    render(
      <AppShell
        menuItems={mockItems}
        onMobileClose={onMobileClose}
      >
        <div>Content</div>
      </AppShell>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onMobileClose).toHaveBeenCalled();
  });
});
```

## FAQ

### Q: Can I use this with Next.js?

**A:** Yes! Works perfectly with Next.js App Router or Pages Router.

```tsx
// app/layout.tsx (App Router)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppShell menuItems={menuItems}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
```

### Q: How do I handle nested routes?

**A:** Use the `isActive` prop for custom active detection:

```tsx
{
  id: 'users',
  to: '/users',
  icon: Users,
  label: 'Users',
  isActive: (pathname) => pathname.startsWith('/users')
}
```

### Q: Can I add badges/counts to menu items?

**A:** Yes, use custom `renderMenuItem`:

```tsx
renderMenuItem={(item, isActive, collapsed) => (
  <div className="flex items-center justify-between">
    <span>{item.label}</span>
    {!collapsed && item.count && <Badge>{item.count}</Badge>}
  </div>
)}
```

### Q: Does it work without React Router?

**A:** Yes! Provide your own `onNavigate` handler:

```tsx
<AppShell
  menuItems={menuItems}
  onNavigate={(item) => {
    // Use your router
    yourRouter.push(item.to);
  }}
>
```

### Q: Can I have multiple sidebars?

**A:** The component is designed for single sidebar. For complex layouts, compose multiple AppShell instances or extend the component.

### Q: How do I customize animations?

**A:** Use `transitionConfig` prop:

```tsx
<AppShell
  transitionConfig={{
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
  }}
>
```

## Migration Guide

See [APP_SHELL_MIGRATION.md](./APP_SHELL_MIGRATION.md) for detailed migration steps from existing Layout component.

## Contributing

Contributions welcome! Areas for improvement:

- [ ] Nested menu items support
- [ ] Multiple sidebar sections
- [ ] Pinned/favorites menu items
- [ ] Menu item search/filter
- [ ] Customizable breakpoints
- [ ] RTL support
- [ ] More animation presets

## License

MIT

## Related Components

- **PageLayout** - Content wrapper with toolbar (use inside AppShell)
- **GenericToolbar** - Reusable toolbar component
- **DataTable** - Reusable table component

## Support

- Documentation: This README
- Examples: See usage examples above
- Issues: Create GitHub issue
- Questions: Ask in discussions

---

**Created**: December 21, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
