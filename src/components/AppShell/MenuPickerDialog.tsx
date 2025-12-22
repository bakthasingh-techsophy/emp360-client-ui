/**
 * Menu Picker Sheet - Generic, reusable menu management component
 * Can be used in any project for managing pinned/visible menu items
 *
 * @example
 * ```tsx
 * <MenuPickerSheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   allMenuItems={myMenuItems}
 *   pinnedMenuIds={pinnedIds}
 *   onTogglePin={handleToggle}
 *   categories={categories}
 *   title="All Menus"
 *   description="Pin your frequently used menus"
 * />
 * ```
 */

import { useState, useMemo } from "react";
import { Search, Pin, PinOff, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Generic menu item interface - can be extended for specific needs
 */
export interface GenericMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon component */
  icon: LucideIcon;
  /** Optional route/path for display */
  to?: string;
  /** Category for grouping */
  category?: string;
  /** Any additional custom data */
  [key: string]: any;
}

/**
 * Category for organizing menu items in the picker
 */
export interface MenuPickerCategory {
  /** Category ID */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
}

export interface MenuPickerSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** All available menu items */
  allMenuItems: GenericMenuItem[];
  /** IDs of currently pinned items */
  pinnedMenuIds: string[];
  /** Callback when item is toggled */
  onTogglePin: (menuId: string, isPinned: boolean) => void;
  /** Optional categories for grouping */
  categories?: MenuPickerCategory[];
  /** Sheet title */
  title?: string;
  /** Sheet description */
  description?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Custom empty state message */
  emptyStateMessage?: string;
  /** Show item path/route in UI */
  showItemPath?: boolean;
  /** Custom className for sheet content */
  className?: string;
  /** Animation duration in milliseconds (default: 200) */
  animationDuration?: number;
  /** Sheet position: 'left' | 'right' | 'top' | 'bottom' (default: 'right') */
  sheetPosition?: 'left' | 'right' | 'top' | 'bottom';
  /** Callback when menu item is clicked (for navigation) */
  onMenuClick?: (item: GenericMenuItem) => void;
}

export function MenuPickerSheet({
  open,
  onOpenChange,
  allMenuItems,
  pinnedMenuIds,
  onTogglePin,
  categories = [],
  title = "All Menus",
  description = "Pin items to your sidebar for quick access",
  searchPlaceholder = "Search...",
  emptyStateMessage = "No items found",
  showItemPath = true,
  className,
  animationDuration = 200, // Note: Animation is controlled by sheet.tsx Tailwind classes
  sheetPosition = 'right',
  onMenuClick,
}: MenuPickerSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Suppress unused variable warning - animationDuration is accepted for API consistency
  // but actual animation is controlled by Tailwind classes in sheet.tsx
  void animationDuration;

  // Filter and group menu items by category
  const categorizedItems = useMemo(() => {
    const filtered = allMenuItems.filter((item) => {
      const matchesSearch =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.to?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Group by category
    const grouped = filtered.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GenericMenuItem[]>);

    return grouped;
  }, [allMenuItems, searchQuery]);

  const pinnedCount = pinnedMenuIds.length;

  const handleTogglePin = (menuId: string) => {
    const isPinned = pinnedMenuIds.includes(menuId);
    onTogglePin(menuId, isPinned);
  };

  const getCategoryInfo = (categoryName: string) => {
    return categories.find(
      (cat) => cat.label === categoryName || cat.id === categoryName
    );
  };

  // Reset search when closing
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery("");
    }
    onOpenChange(open);
  };

  // Handle menu item click - navigate to page
  const handleMenuItemClick = (item: GenericMenuItem) => {
    if (onMenuClick) {
      onMenuClick(item);
      handleOpenChange(false); // Close sheet after navigation
    }
  };

  // Handle pin icon click - pin/unpin without navigation
  const handlePinClick = (e: React.MouseEvent, menuId: string) => {
    e.stopPropagation(); // Prevent menu item click
    handleTogglePin(menuId);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={sheetPosition}
        disableAnimation={animationDuration === 0}
        className={cn(
          "w-full sm:max-w-md p-0 flex flex-col",
          animationDuration === 0 && "data-[state=open]:animate-none data-[state=closed]:animate-none duration-0",
          className
        )}
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(false)}
                className="h-10 w-10 flex-shrink-0"
                title="Close menu picker"
              >
                <X className="h-5 w-5" />
              </Button>
              <div>
                <SheetTitle className="text-lg">{title}</SheetTitle>
                <SheetDescription className="text-xs">
                  {description}
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Stats Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {Object.keys(categorizedItems).length} categories
            </span>
            <Badge variant="secondary" className="text-xs">
              {pinnedCount} pinned
            </Badge>
          </div>
        </SheetHeader>

        {/* Category Sections with Menus */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            {Object.entries(categorizedItems).map(([categoryId, items]) => {
              const categoryInfo = getCategoryInfo(categoryId);
              const CategoryIcon = categoryInfo?.icon;

              return (
                <div key={categoryId} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
                    {CategoryIcon && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm">
                      {categoryInfo?.label || categoryId}
                    </h3>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {items.length}
                    </Badge>
                  </div>

                  {/* Menu Items in Category */}
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isPinned = pinnedMenuIds.includes(item.id);
                      const ItemIcon = item.icon;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'w-full flex items-center gap-3 p-2.5 rounded-lg transition-all',
                            'hover:bg-accent cursor-pointer',
                            isPinned && 'bg-primary/5'
                          )}
                          onClick={() => handleMenuItemClick(item)}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-md flex-shrink-0",
                              isPinned ? "bg-primary/10" : "bg-muted"
                            )}
                          >
                            <ItemIcon
                              className={cn(
                                "h-4 w-4",
                                isPinned
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {item.label}
                            </div>
                            {showItemPath && item.to && (
                              <div className="text-xs text-muted-foreground truncate">
                                {item.to}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => handlePinClick(e, item.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-accent/50 transition-colors"
                            title={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                          >
                            {isPinned ? (
                              <Pin className="h-4 w-4 text-primary fill-primary" />
                            ) : (
                              <PinOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />
                </div>
              );
            })}

            {Object.keys(categorizedItems).length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {emptyStateMessage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Legacy export for backward compatibility
export { MenuPickerSheet as MenuPickerDialog };
