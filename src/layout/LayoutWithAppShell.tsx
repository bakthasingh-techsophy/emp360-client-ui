/**
 * LayoutWithAppShell - Application-specific layout implementation
 * 
 * This file serves as the APPLICATION LAYER that connects your app's specific
 * requirements (auth, navigation, menu config, etc.) to the reusable AppShell component.
 * 
 * 🔧 CUSTOMIZATION GUIDE:
 * ----------------------
 * To adapt this for your application:
 * 
 * 1. MENU CONFIGURATION:
 *    - Import your menu items from your config: `import { getAllMenuItems } from '@/config/menuConfig'`
 *    - Define your menu categories for grouping in the menu picker
 *    - Set up initial pinned menus (default sidebar items)
 * 
 * 2. AUTHENTICATION:
 *    - Import your auth context: `import { useAuth } from '@/contexts/AuthContext'`
 *    - Access user data, logout functions, etc.
 * 
 * 3. HEADER CONTENT:
 *    - Customize the header toolbar (breadcrumbs, search, user menu, etc.)
 *    - Add theme toggle, notifications, or other global actions
 * 
 * 4. NAVIGATION:
 *    - Define how menu items navigate (React Router, Next.js Router, etc.)
 *    - Add custom navigation logic if needed
 * 
 * 5. BRANDING:
 *    - Set logo, brand name, and colors
 *    - Customize the sidebar appearance
 * 
 * 6. STATE MANAGEMENT:
 *    - Connect to your state management solution (Redux, Zustand, Context, etc.)
 *    - Manage pinned menus, user preferences, etc.
 * 
 * 📚 The underlying AppShell component is completely reusable and agnostic.
 * This layout file is the ONLY place you need to wire up your app-specific logic.
 */

import { useState } from 'react';
import { AppShell, AppShellMenuItem } from '@/components/AppShell';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  User,
  LogOut,
  Settings as SettingsIcon,
  Code,
} from 'lucide-react';
import { useLayoutContext } from '@/contexts/LayoutContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingBar } from '@/components/LoadingBar';
import { useAuth } from '@/contexts/AuthContext';
import { getAllMenuItems, menuCategories } from '@/config/menuConfig';
import {
  addPinnedMenu,
  removePinnedMenu,
  getOrderedPinnedMenuIds,
} from '@/store/menuPreferences';

/**
 * Main application layout component using AppShell
 * 
 * Features:
 * - Outlook-style customizable sidebar with pinned menus
 * - User authentication integration
 * - Theme switching
 * - Dynamic page titles
 * - Responsive mobile menu
 */
export function LayoutWithAppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { activePage } = useLayoutContext();

  const path = location.pathname || '';

  // ==================== MENU CONFIGURATION ====================
  // Get all available menu items from your config
  const allMenuItems: AppShellMenuItem[] = getAllMenuItems();

  // Menu categories for the menu picker dialog
  const menuCategoriesForPicker = menuCategories;

  // ==================== STATE MANAGEMENT ====================
  // Manage pinned menus (user's customized sidebar) with proper ordering
  const [pinnedMenuIds, setPinnedMenuIds] = useState<string[]>(() => {
    // Get ordered pinned menu IDs from preferences
    return getOrderedPinnedMenuIds();
  });

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle pin/unpin of menu items
   * Updates both pinned state and order preferences
   */
  const handleTogglePin = (menuId: string, isPinned: boolean) => {
    if (isPinned) {
      // Unpin - remove from sidebar
      removePinnedMenu(menuId);
      setPinnedMenuIds((prev) => prev.filter((id) => id !== menuId));
    } else {
      // Pin - add to sidebar at the end
      addPinnedMenu(menuId);
      setPinnedMenuIds((prev) => [...prev, menuId]);
    }
  };

  /**
   * Get dynamic page title based on current route
   */
  const getPageTitle = () => {
    // if (activePage) return activePage;

    // // Find the menu item for the current path
    // const currentMenuItem = allMenuItems.find((item) => item.to === path);
    // if (currentMenuItem) return currentMenuItem.label;

    // // Fallback to path-based titles
    // if (path.startsWith('/settings')) return 'Settings';
    // if (path.startsWith('/support')) return 'Support';
    // if (path.startsWith('/dashboard')) return 'Dashboard';
    // if (path.startsWith('/account')) return 'Account';

    return 'Employee 360';
  };

  /**
   * Handle navigation when menu item is clicked
   */
  const handleNavigate = (item: AppShellMenuItem) => {
    if (item.to) {
      navigate(item.to);
    }
  };

  // ==================== HEADER CONTENT ====================
  // Custom header toolbar with page title and user menu
  const headerContent = (
    <>
      {/* Page Title */}
      <div className="flex-1 items-center gap-2 min-w-0">
        <h1 className="text-lg font-semibold truncate">{getPageTitle()}</h1>
      </div>

      {/* Right Actions: Theme Toggle & User Menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)]">
            <DropdownMenuLabel>
              <div className="min-w-0">
                <div className="font-medium truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/account/profile" className="flex items-center">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/account/inspector" className="flex items-center">
                <Code className="mr-2 h-4 w-4" />
                Session Inspector
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  // ==================== RENDER ====================
  return (
    <AppShell
      // Menu configuration
      allMenuItems={allMenuItems}
      pinnedMenuIds={pinnedMenuIds}
      onTogglePin={handleTogglePin}
      menuCategories={menuCategoriesForPicker}

      // Branding
      logo={<User className="h-6 w-6 text-primary" />}
      brandName="Employee 360"

      // Header & Loading
      headerContent={headerContent}
      loadingBar={<LoadingBar />}

      // Navigation
      onNavigate={handleNavigate}

      // Customization options (all optional with sensible defaults)
      sheetAnimationDuration={0}         // 0 = instant (no animation), 200 = smooth slide (default)
      sheetPosition="left"
    // useMenuPicker={true}             // Enable menu picker (false = show all menus in sidebar)
    >
      {/* Page content rendered here */}
      <Outlet />
    </AppShell>
  );
}
