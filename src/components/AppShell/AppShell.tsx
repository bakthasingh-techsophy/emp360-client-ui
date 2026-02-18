import { useState, useEffect, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, X, ChevronLeft, ChevronRight, Menu, ChevronDown, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MenuPickerSheet, type GenericMenuItem, type MenuPickerCategory } from './MenuPickerDialog';
import { getMenuResource } from '@/config/menuResourceMap';
import { useAuth } from '@/contexts/AuthContext';

// ==================== TYPES ====================

export interface AppShellMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Navigation path/route */
  to?: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Display label */
  label: string;
  /** Permission check (optional) - return true to show item */
  permission?: () => boolean;
  /** Whether this route requires exact match */
  exact?: boolean;
  /** Custom active check (optional) */
  isActive?: (pathname: string) => boolean;
  /** Category/group this item belongs to */
  category?: string;
  /** Display order in sidebar (lower number = higher priority) */
  order?: number;
}

export interface AppShellMenuGroup {
  /** Unique identifier for the group */
  id: string;
  /** Group display label */
  label: string;
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Menu items in this group */
  items: AppShellMenuItem[];
  /** Default open state */
  defaultOpen?: boolean;
}

export interface AppShellProps {
  /** Menu items for sidebar navigation (flat list) */
  menuItems?: AppShellMenuItem[];
  /** All available menu items (for menu picker) */
  allMenuItems?: GenericMenuItem[];
  /** Pinned menu IDs (user's customized sidebar) */
  pinnedMenuIds?: string[];
  /** Callback when menu is pinned/unpinned */
  onTogglePin?: (menuId: string, isPinned: boolean) => void;
  /** Grouped menu items for sidebar navigation (legacy, deprecated) */
  menuGroups?: AppShellMenuGroup[];
  /** Menu categories for picker dialog */
  menuCategories?: MenuPickerCategory[];
  /** Header/toolbar content (custom components) */
  headerContent?: ReactNode;
  /** Brand logo component */
  logo?: ReactNode;
  /** Brand name */
  brandName?: string;
  /** Brand subtitle (optional) */
  brandSubtitle?: string;
  /** Page content */
  children: ReactNode;
  /** Loading indicator (optional) */
  loadingBar?: ReactNode;
  /** Collapsed state of sidebar (controlled) */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Additional className for main content area */
  contentClassName?: string;
  /** Enable page transition animation */
  enableTransitions?: boolean;
  /** Transition animation config */
  transitionConfig?: {
    initial?: object;
    animate?: object;
    transition?: object;
  };
  /** Custom navigation handler (for items that need special behavior) */
  onNavigate?: (item: AppShellMenuItem) => void;
  /** Callback when sidebar closes (mobile) */
  onMobileClose?: () => void;
  /** Show collapse button in sidebar */
  showCollapseButton?: boolean;
  /** Custom render for menu item */
  renderMenuItem?: (item: AppShellMenuItem, isActive: boolean, collapsed: boolean) => ReactNode;
  /** Sheet animation duration in milliseconds (default: 200) */
  sheetAnimationDuration?: number;
  /** Sheet position: 'left' | 'right' | 'top' | 'bottom' (default: 'right') */
  sheetPosition?: 'left' | 'right' | 'top' | 'bottom';
  /** Use menu picker sheet (if false, shows all menus in sidebar) (default: true) */
  useMenuPicker?: boolean;
}

// ==================== HOOKS ====================

/** Hook to detect large screen (matches Tailwind's lg breakpoint: 1024px) */
function useIsLarge() {
  const [isLarge, setIsLarge] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width:1024px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width:1024px)');
    const handler = (ev: MediaQueryListEvent | MediaQueryList) => setIsLarge(ev.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler as any);
    } else {
      // @ts-ignore - fallback for older browsers
      mq.addListener(handler);
    }
    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handler as any);
      } else {
        // @ts-ignore
        mq.removeListener(handler);
      }
    };
  }, []);

  return isLarge;
}

// ==================== MAIN COMPONENT ====================

export function AppShell({
  menuItems,
  allMenuItems = [],
  pinnedMenuIds = [],
  onTogglePin,
  menuGroups,
  menuCategories = [],
  headerContent,
  logo,
  brandName = 'App',
  brandSubtitle,
  children,
  loadingBar,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  contentClassName,
  enableTransitions = true,
  transitionConfig = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  onNavigate,
  onMobileClose,
  showCollapseButton = true,
  renderMenuItem,
  sheetAnimationDuration = 200,
  sheetPosition = 'right',
  useMenuPicker = true,
}: AppShellProps) {
  const location = useLocation();
  const isLarge = useIsLarge();
  const auth = useAuth();

  // Menu picker dialog state
  const [menuPickerOpen, setMenuPickerOpen] = useState(false);

  // Internal state for collapse (if not controlled)
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('app-shell-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use controlled or internal state
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = (value: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setInternalCollapsed(value);
      localStorage.setItem('app-shell-sidebar-collapsed', JSON.stringify(value));
    }
  };

  // Filter menu items based on resource access from JWT token
  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];
    
    const filtered = menuItems.filter((item) => {
      // First check explicit permission function
      if (item.permission && !item.permission()) {
        return false;
      }
      
      // Check resource-based access
      const resource = getMenuResource(item.id);
      if (resource) {
        // If menu item requires a resource, user must have access to that resource
        const hasAccess = auth.hasResourceAccess(resource);
        if (!hasAccess) {
          console.log(`[AppShell] Filtering out menu item - No access to resource:`, {
            menuId: item.id,
            label: item.label,
            requiredResource: resource
          });
        }
        return hasAccess;
      }
      
      // If no resource mapping, allow by default (unless permission check failed above)
      return true;
    });
    
    console.log('[AppShell] Filtered menu items:', {
      totalItems: menuItems.length,
      filteredCount: filtered.length,
      items: filtered.map(m => ({ id: m.id, label: m.label }))
    });
    
    return filtered;
  }, [menuItems, auth, auth.token]);

  // Filter all menu items for menu picker based on resource access
  const filteredAllMenuItems = useMemo(() => {
    if (!allMenuItems) return [];
    
    return allMenuItems.filter((item) => {
      // Check resource-based access
      const resource = getMenuResource(item.id);
      if (resource) {
        // If menu item requires a resource, user must have access to that resource
        return auth.hasResourceAccess(resource);
      }
      
      // If no resource mapping, allow by default
      return true;
    });
  }, [allMenuItems, auth, auth.token]);

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Handle mobile menu toggle
  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle mobile menu close
  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
    onMobileClose?.();
  };

  // ESC key handler and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        handleCloseMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Lock body scroll on mobile when menu is open
    if (mobileMenuOpen && !isLarge) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, isLarge]);

  // Animate sidebar position based on screen size
  const animateX: number | string = isLarge ? 0 : (mobileMenuOpen ? 0 : '-100%');

  return (
    <div className="relative min-h-screen bg-background">
      {/* Loading Bar */}
      {loadingBar}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: animateX }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r bg-card',
          'transition-transform duration-300 ease-out',
          'lg:translate-x-0 lg:transition-[width] lg:duration-200'
        )}
        aria-label="Main navigation"
      >
        {/* Pass all props to AppShellSidebar sub-component */}
        <AppShellSidebar
          menuItems={filteredMenuItems}
          allMenuItems={filteredAllMenuItems}
          pinnedMenuIds={pinnedMenuIds}
          menuGroups={menuGroups}
          collapsed={collapsed}
          logo={logo}
          brandName={brandName}
          brandSubtitle={brandSubtitle}
          onToggleSidebar={handleToggleSidebar}
          onCloseMobileMenu={handleCloseMobileMenu}
          onOpenMenuPicker={() => setMenuPickerOpen(true)}
          showCollapseButton={showCollapseButton}
          renderMenuItem={renderMenuItem}
          onNavigate={onNavigate}
          location={location}
          useMenuPicker={useMenuPicker}
        />
      </motion.aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'min-h-screen',
          'transition-[margin] duration-200 ease-out',
          'lg:ml-16',
          !collapsed && 'lg:ml-64'
        )}
      >
        {/* Header */}
        <AppShellHeader
          onMobileMenuToggle={handleToggleMobileMenu}
          collapsed={collapsed}
          headerContent={headerContent}
        />

        {/* Page Content */}
        <main className={cn(
          'min-h-screen pt-[5rem] px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 overflow-y-auto',
          contentClassName
        )}>
          {enableTransitions ? (
            <motion.div
              key={location.pathname}
              initial={transitionConfig.initial as any}
              animate={transitionConfig.animate as any}
              transition={transitionConfig.transition as any}
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menu Picker Sheet */}
      {useMenuPicker && (
        <MenuPickerSheet
          open={menuPickerOpen}
          onOpenChange={setMenuPickerOpen}
          allMenuItems={filteredAllMenuItems}
          pinnedMenuIds={pinnedMenuIds}
          onTogglePin={onTogglePin || (() => {})}
          categories={menuCategories}
          title="All Menus"
          description="Click menu to navigate, click pin icon to add to sidebar"
          searchPlaceholder="Search menus..."
          animationDuration={sheetAnimationDuration}
          sheetPosition={sheetPosition}
          onMenuClick={onNavigate}
        />
      )}
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

interface AppShellSidebarProps {
  menuItems?: AppShellMenuItem[];
  allMenuItems?: GenericMenuItem[];
  pinnedMenuIds?: string[];
  menuGroups?: AppShellMenuGroup[];
  collapsed: boolean;
  logo?: ReactNode;
  brandName: string;
  brandSubtitle?: string;
  onToggleSidebar: () => void;
  onCloseMobileMenu: () => void;
  onOpenMenuPicker: () => void;
  showCollapseButton: boolean;
  renderMenuItem?: AppShellProps['renderMenuItem'];
  onNavigate?: AppShellProps['onNavigate'];
  location: ReturnType<typeof useLocation>;
  useMenuPicker: boolean;
}

function AppShellSidebar({
  menuItems,
  allMenuItems = [],
  pinnedMenuIds = [],
  menuGroups,
  collapsed,
  logo,
  brandName,
  brandSubtitle,
  onToggleSidebar,
  onCloseMobileMenu,
  onOpenMenuPicker,
  showCollapseButton,
  renderMenuItem,
  onNavigate,
  location,
  useMenuPicker,
}: AppShellSidebarProps) {
  // Determine which menu items to display
  // If useMenuPicker is false, show all menus
  // If pinnedMenuIds is provided, filter menuItems or allMenuItems by pinned IDs
  // Sort by order field (from menuConfig) or preserve pinned order
  const displayMenuItems = useMemo(() => {
    let items: (AppShellMenuItem | GenericMenuItem)[] = [];
    
    if (!useMenuPicker && allMenuItems.length > 0) {
      // Show all menus when menu picker is disabled
      items = allMenuItems;
    } else if (pinnedMenuIds.length > 0 && allMenuItems.length > 0) {
      // Show only pinned menus from allMenuItems
      items = allMenuItems.filter((item) => pinnedMenuIds.includes(item.id));
    } else {
      // Fallback to regular menuItems
      items = menuItems || [];
    }
    
    // Sort by order field (lower number = higher priority)
    // If order is not defined, maintain original array order
    return [...items].sort((a, b) => {
      const orderA = (a as AppShellMenuItem).order ?? Number.MAX_SAFE_INTEGER;
      const orderB = (b as AppShellMenuItem).order ?? Number.MAX_SAFE_INTEGER;
      
      if (orderA === orderB) {
        // If orders are equal, preserve the original position in pinnedMenuIds
        const indexA = pinnedMenuIds.indexOf(a.id);
        const indexB = pinnedMenuIds.indexOf(b.id);
        return indexA - indexB;
      }
      
      return orderA - orderB;
    });
  }, [menuItems, allMenuItems, pinnedMenuIds, useMenuPicker]);

  // Track which groups are open (only used when not collapsed)
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initialOpen = new Set<string>();
    if (menuGroups) {
      menuGroups.forEach((group) => {
        if (group.defaultOpen !== false) {
          initialOpen.add(group.id);
        }
      });
    }
    return initialOpen;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Helper to check if an item is active
  const isItemActive = (item: AppShellMenuItem | GenericMenuItem) => {
    if (!item.to) return false;
    const pathBase = location.pathname.replace(/^\//g, '').split('/')[0];
    return item.isActive
      ? item.isActive(location.pathname)
      : item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to) || pathBase === item.to.replace(/^\//g, '');
  };

  // Render a single menu item
  const renderItem = (item: AppShellMenuItem | GenericMenuItem, isActive: boolean) => {
    if (renderMenuItem && 'to' in item && item.to) {
      return renderMenuItem(item as AppShellMenuItem, isActive, collapsed);
    }

    return (
      <Button
        key={item.id}
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 h-10 px-3',
          isActive && 'shadow-sm font-medium',
          !collapsed && 'text-sm font-normal',
          collapsed && 'justify-center'
        )}
        onClick={() => {
          onCloseMobileMenu();
          onNavigate?.(item);
        }}
      >
        <item.icon className={cn(
          "h-[18px] w-[18px] flex-shrink-0",
          collapsed && "h-5 w-5"
        )} />
        {!collapsed && <span className="truncate text-left flex-1">{item.label}</span>}
      </Button>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center gap-2.5 border-b px-3 py-3">
        {/* Menu Picker Icon - Left side */}
        {useMenuPicker && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMenuPicker}
            className="flex-shrink-0 h-8 w-8"
            title="More menus"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        )}
        
        {/* Logo - Center when collapsed, left when expanded */}
        {logo && (
          <div className={cn(
            "flex-shrink-0",
            collapsed && "mx-auto"
          )}>
            {logo}
          </div>
        )}
        
        {/* Brand Name */}
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold truncate leading-tight">{brandName}</span>
            {brandSubtitle && (
              <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{brandSubtitle}</span>
            )}
          </div>
        )}
        
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseMobileMenu}
          className="lg:hidden flex-shrink-0 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 overflow-y-auto overscroll-contain custom-scrollbar">
        {/* Pinned/Flat Menu Items (New Outlook-style approach) */}
        {displayMenuItems.length > 0 ? (
          <div className="space-y-0.5">
            {displayMenuItems.map((item) => {
              // Check permission
              if (item.permission && !item.permission()) {
                return null;
              }

              const isActive = isItemActive(item);
              return <div key={item.id}>{renderItem(item, isActive)}</div>;
            })}
          </div>
        ) : /* Legacy: Grouped Menu Items (backward compatibility) */
        menuGroups && menuGroups.length > 0 ? (
          <div className="space-y-1">
            {menuGroups.map((group) => {
              // Filter items by permission
              const visibleItems = group.items.filter(
                (item) => !item.permission || item.permission()
              );

              if (visibleItems.length === 0) return null;

              const isOpen = openGroups.has(group.id);
              const hasActiveItem = visibleItems.some((item) => isItemActive(item));

              // When collapsed, show items without grouping
              if (collapsed) {
                return (
                  <div key={group.id} className="space-y-1">
                    {visibleItems.map((item) => {
                      const isActive = isItemActive(item);
                      return <div key={item.id}>{renderItem(item, isActive)}</div>;
                    })}
                  </div>
                );
              }

              // When expanded, show collapsible groups
              return (
                <Collapsible
                  key={group.id}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(group.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 h-10 px-3 font-semibold text-sm',
                        'hover:bg-accent/50',
                        hasActiveItem && 'text-primary bg-accent/30'
                      )}
                    >
                      {group.icon && <group.icon className="h-4 w-4 flex-shrink-0" />}
                      <span className="truncate text-left flex-1">{group.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1">
                    <div className="ml-2 space-y-1 border-l-2 border-border pl-2">
                      {visibleItems.map((item) => {
                        const isActive = isItemActive(item);
                        return <div key={item.id}>{renderItem(item, isActive)}</div>;
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        ) : null}
      </nav>

      {/* Collapse Button (Desktop Only) */}
      {showCollapseButton && (
        <div className="p-3 hidden lg:block border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="w-full justify-center gap-2 h-9"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface AppShellHeaderProps {
  onMobileMenuToggle: () => void;
  collapsed: boolean;
  headerContent?: ReactNode;
}

function AppShellHeader({
  onMobileMenuToggle,
  collapsed,
  headerContent,
}: AppShellHeaderProps) {

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6',
        'transition-[left] duration-200 ease-out',
        'left-0 lg:left-16',
        !collapsed && 'lg:left-64'
      )}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuToggle}
        className="lg:hidden flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Custom Header Content */}
      <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
        {headerContent}
      </div>
    </header>
  );
}
