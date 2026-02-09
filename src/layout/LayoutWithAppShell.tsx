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
import { Outlet, useNavigate } from 'react-router-dom';
import { LoadingBar } from '@/components/LoadingBar';

import { getAllMenuItems, menuCategories } from '@/config/menuConfig';
import {
  addPinnedMenu,
  removePinnedMenu,
  getOrderedPinnedMenuIds,
} from '@/store/menuPreferences';
import { Header } from '@/components/Header';

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
  const navigate = useNavigate();

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
<<<<<<< HEAD
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
=======
>>>>>>> master
   * Handle navigation when menu item is clicked
   */
  const handleNavigate = (item: AppShellMenuItem) => {
    if (item.to) {
      navigate(item.to);
    }
  };

  // ==================== RENDER ====================
  return (
    <AppShell
      // Menu configuration
      allMenuItems={allMenuItems}
      pinnedMenuIds={pinnedMenuIds}
      onTogglePin={handleTogglePin}
      menuCategories={menuCategoriesForPicker}

      // Branding
      logo={undefined}
      brandName="Employee 360"
      // Header - Use the Header component as custom header content
      headerContent={<Header />}
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
