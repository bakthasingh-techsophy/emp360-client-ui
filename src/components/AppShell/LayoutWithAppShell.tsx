import { AppShell, AppShellMenuItem, AppShellMenuGroup } from './AppShell';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  User,
  LogOut,
  Settings as SettingsIcon,
  Code,
} from 'lucide-react';
import { useLayoutContext } from '../../contexts/LayoutContext';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LoadingBar } from '../LoadingBar';
import { useAuth } from '@/contexts/AuthContext';
import { menuStructure } from '@/config/menuConfig';

/**
 * LayoutWithAppShell - Employee 360 HRMS Layout
 * 
 * Complete HRMS application layout with grouped menu structure
 */
export function LayoutWithAppShell() {
  const { can, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { activePage } = useLayoutContext();

  const path = location.pathname || '';

  // Convert menu structure to grouped format
  const menuGroups: AppShellMenuGroup[] = menuStructure.map((category) => ({
    id: category.id,
    label: category.label,
    icon: category.icon,
    items: category.items.map((item) => ({
      ...item,
      permission: item.permission || (() => true), // Default to visible for all
    })),
    defaultOpen: category.id === 'dashboard' || category.id === 'core-hr', // Open first two groups by default
  }));

  const getPageTitle = () => {
    if (activePage) return activePage;
    
    // Find the menu item for the current path across all groups
    for (const group of menuGroups) {
      const currentMenuItem = group.items.find((item) => item.to === path);
      if (currentMenuItem) return currentMenuItem.label;
    }
    
    // Fallback to path-based titles
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/support')) return 'Support';
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/account')) return 'Account';
    
    return 'Employee 360';
  };

  // Navigation handler
  const handleNavigate = (item: AppShellMenuItem) => {
    navigate(item.to);
  };

  // Header content
  const headerContent = (
    <>
      <div className="flex-1 items-center gap-2 min-w-0">
        <h1 className="text-lg font-semibold truncate">{getPageTitle()}</h1>
      </div>

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

  return (
    <AppShell
      menuGroups={menuGroups}
      headerContent={headerContent}
      logo={<User className="h-6 w-6 text-primary" />}
      brandName="Employee 360" // Employee 360 HRMS Platform
      loadingBar={<LoadingBar />}
      onNavigate={handleNavigate}
    >
      <Outlet />
    </AppShell>
  );
}
