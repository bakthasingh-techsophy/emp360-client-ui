/**
 * Menu Picker Sheet - Outlook/Darwinbox-style menu management
 * Slide-out sidebar for browsing and pinning menus (page-driven pattern)
 */

import { useState, useMemo } from 'react';
import { Search, Pin, PinOff, Grid3x3, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AppShellMenuItem } from './AppShell';

interface MenuPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allMenuItems: AppShellMenuItem[];
  pinnedMenuIds: string[];
  onTogglePin: (menuId: string, isPinned: boolean) => void;
  menuCategories?: { id: string; label: string; icon?: any }[];
}

export function MenuPickerDialog({
  open,
  onOpenChange,
  allMenuItems,
  pinnedMenuIds,
  onTogglePin,
  menuCategories = [],
}: MenuPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter and group menu items by category
  const { categorizedItems } = useMemo(() => {
    const filtered = allMenuItems.filter((item) => {
      const matchesSearch =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Group by category
    const grouped = filtered.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, AppShellMenuItem[]>);

    return { categorizedItems: grouped };
  }, [allMenuItems, searchQuery, selectedCategory]);

  const pinnedCount = pinnedMenuIds.length;

  const handleTogglePin = (menuId: string) => {
    const isPinned = pinnedMenuIds.includes(menuId);
    onTogglePin(menuId, isPinned);
  };

  const getCategoryInfo = (categoryId: string) => {
    return menuCategories.find((cat) => cat.id === categoryId);
  };

  // Reset search when closing
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setSelectedCategory(null);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Grid3x3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">All Menus</SheetTitle>
                <SheetDescription className="text-xs">
                  Pin menus to your sidebar
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
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
                        <button
                          key={item.id}
                          onClick={() => handleTogglePin(item.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left',
                            'hover:bg-accent',
                            isPinned && 'bg-primary/5'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-md flex-shrink-0',
                              isPinned ? 'bg-primary/10' : 'bg-muted'
                            )}
                          >
                            <ItemIcon
                              className={cn(
                                'h-4 w-4',
                                isPinned ? 'text-primary' : 'text-muted-foreground'
                              )}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.label}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.to}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isPinned ? (
                              <Pin className="h-4 w-4 text-primary fill-primary" />
                            ) : (
                              <PinOff className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                        </button>
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
                <p className="text-sm text-muted-foreground">No menus found</p>
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
