# PageLayout Component System

A reusable page layout component system that provides consistent structure and functionality across all pages in your application.

## Architecture

```
PageLayout/
├── PageLayout.tsx      # Main layout component
├── EmptyState.tsx      # Empty state component
├── index.tsx          # Exports
└── README.md          # This file
```

## Components

### PageLayout

Main container component that provides:
- **Toolbar section** - Fixed at top with bottom border for search, filters, and actions
- **Content area** - Scrollable main content with configurable padding
- **Scroll-to-top button** - Auto-shows/hides based on scroll position
- **Empty state support** - Built-in empty state handling for when data is unavailable

#### Props

```typescript
interface PageLayoutProps {
  toolbar?: ReactNode;              // Toolbar component (e.g., GenericToolbar)
  children: ReactNode;              // Main content
  contentClassName?: string;        // Additional classes for content wrapper
  showScrollTop?: boolean;          // Show scroll-to-top button (default: true)
  scrollTopThreshold?: number;      // Scroll px to show button (default: 400)
  emptyState?: ReactNode;           // Empty state component
  showEmptyState?: boolean;         // Whether to show empty state
  onScrollTop?: () => void;         // Callback when scroll-to-top clicked
  bottomPadding?: string;           // Bottom padding (default: 'pb-20')
}
```

#### Basic Usage

```tsx
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar';

export function MyPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PageLayout
      toolbar={
        <GenericToolbar
          showSearch={true}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          // ... other toolbar props
        />
      }
    >
      <MyTableComponent />
    </PageLayout>
  );
}
```

#### With Empty State

```tsx
import { PageLayout, EmptyState } from '@/components/PageLayout';
import { FileQuestion } from 'lucide-react';

export function MyPage() {
  const hasData = data.length > 0;

  return (
    <PageLayout
      toolbar={<GenericToolbar {...toolbarProps} />}
      showEmptyState={!hasData}
      emptyState={
        <EmptyState
          icon={<FileQuestion className="h-12 w-12 text-muted-foreground" />}
          title="No data available"
          description="There is no data to display. Try adjusting your filters or add new items."
        />
      }
    >
      <MyTableComponent />
    </PageLayout>
  );
}
```

#### Custom Scroll Behavior

```tsx
<PageLayout
  showScrollTop={true}
  scrollTopThreshold={300}
  onScrollTop={() => {
    console.log('User scrolled to top');
    // Custom logic
  }}
>
  {children}
</PageLayout>
```

#### Custom Content Padding

```tsx
// For pages with fixed pagination
<PageLayout
  bottomPadding="pb-20"  // Default - space for fixed pagination
  contentClassName="space-y-4"
>
  {children}
</PageLayout>

// For pages without fixed elements
<PageLayout
  bottomPadding="pb-4"
>
  {children}
</PageLayout>
```

### EmptyState

Displays empty state with optional icon, title, description, and action.

#### Props

```typescript
interface EmptyStateProps {
  icon?: ReactNode;        // Icon to display
  title: string;           // Title text (required)
  description?: string;    // Description text
  action?: ReactNode;      // Action button/component
  className?: string;      // Additional classes
}
```

#### Usage Examples

```tsx
import { EmptyState } from '@/components/PageLayout';
import { FileQuestion, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simple text only
<EmptyState
  title="No data available"
  description="Get started by adding your first item"
/>

// With icon
<EmptyState
  icon={<FileQuestion className="h-12 w-12 text-muted-foreground" />}
  title="No items found"
  description="Start by adding your first item to this list"
/>

// With action button
<EmptyState
  icon={<Plus className="h-12 w-12 text-muted-foreground" />}
  title="No records found"
  description="Start by adding your first record"
  action={
    <Button onClick={handleAddItem}>
      Add Item
    </Button>
  }
/>

// Custom styling
<EmptyState
  title="Custom Empty State"
  description="With custom spacing"
  className="h-96 bg-muted/20 rounded-lg"
/>
```

## Integration Examples

### Data List Page

```tsx
import { PageLayout, EmptyState } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar';
import { DataListTable } from './DataListTable';
import { FileQuestion } from 'lucide-react';

export function DataListPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  
  return (
    <PageLayout
      toolbar={
        <GenericToolbar
          showSearch={true}
          searchPlaceholder="Search items..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={true}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
          // ... other props
        />
      }
      showEmptyState={!hasData}
      emptyState={
        <EmptyState
          icon={<FileQuestion className="h-12 w-12 text-muted-foreground" />}
          title="No data available"
          description="There is no data to display. Try adjusting your filters or add new items."
        />
      }
      bottomPadding="pb-20"  // For fixed pagination
    >
      <DataTable
        searchTerm={searchTerm}
        activeFilters={activeFilters}
        // ... other props
      />
    </PageLayout>
  );
}
```

### Products Page

```tsx
import { PageLayout, EmptyState } from '@/components/PageLayout';
import { ProductsTable } from './ProductsTable';

export function Products() {
  const hasProducts = products.length > 0;
  
  return (
    <PageLayout
      toolbar={<GenericToolbar {...toolbarProps} />}
      showEmptyState={!hasProducts}
      emptyState={
        <EmptyState
          title="No products found"
          description="Start by adding your first product to the catalog."
        />
      }
      onScrollTop={() => {
        // Custom analytics or state reset
        console.log('Scrolled to top');
      }}
    >
      <ProductsProvider>
        <ProductsTable {...tableProps} />
      </ProductsProvider>
    </PageLayout>
  );
}
```

### Simple List Page

```tsx
import { PageLayout } from '@/components/PageLayout';
import { SimpleToolbar } from './SimpleToolbar';

export function SimpleListPage() {
  return (
    <PageLayout
      toolbar={<SimpleToolbar />}
      showScrollTop={false}  // Disable scroll-to-top
      bottomPadding="pb-4"    // Less padding for inline pagination
    >
      <SimpleList />
    </PageLayout>
  );
}
```

## Features

### ✅ Responsive Design
- Mobile-first approach
- Adapts to sidebar collapse/expand
- Proper spacing on all screen sizes

### ✅ Scroll-to-Top Button
- Auto-shows after scrolling past threshold (default 400px)
- Smooth scroll behavior
- Fixed positioning at bottom-right
- Configurable via props

### ✅ Empty State Management
- Built-in empty state support
- Conditional rendering
- Consistent styling
- Customizable content

### ✅ Flexible Toolbar
- Any toolbar component can be passed
- GenericToolbar integration
- Custom toolbar support
- Optional (can be omitted)

### ✅ Content Area
- Configurable padding for fixed elements
- Custom className support
- Proper spacing from toolbar
- Scrollable content

### ✅ Independence
- No dependencies on specific contexts (except UI components)
- Works with any data fetching pattern
- Compatible with all table implementations
- Provider-agnostic

## Benefits

1. **Consistency** - All pages follow the same layout pattern
2. **Reusability** - Write once, use everywhere
3. **Maintainability** - Single source of truth for layout logic
4. **Flexibility** - Highly configurable via props
5. **Accessibility** - Proper ARIA labels and semantic HTML
6. **Performance** - Optimized scroll listeners with cleanup
7. **Type Safety** - Full TypeScript support

## Migration Guide

### Before (Repetitive Code)

```tsx
export function MyPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h3>No data available</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-background pb-4 border-b">
        <GenericToolbar {...props} />
      </div>
      <div className="mt-4 pb-20">
        <MyTable />
      </div>
      {showScrollTop && (
        <Button onClick={scrollToTop} className="fixed bottom-24 right-6">
          <ArrowUp />
        </Button>
      )}
    </div>
  );
}
```

### After (Clean & Reusable)

```tsx
export function MyPage() {
  const hasData = data.length > 0;
  
  return (
    <PageLayout
      toolbar={<GenericToolbar {...props} />}
      showEmptyState={!hasData}
      emptyState={
        <EmptyState
          title="No data available"
          description="There is no data to display. Add new items to get started."
        />
      }
    >
      <MyTable />
    </PageLayout>
  );
}
```

### Lines of Code Saved

- **Before**: ~50-60 lines per page
- **After**: ~15-20 lines per page
- **Savings**: ~70% reduction in boilerplate
- **Multiplied by**: 10+ pages = **300-400 lines saved**

## Best Practices

### DO ✅

```tsx
// Use EmptyState for consistent empty states
<EmptyState
  title="No results"
  description="Try adjusting your filters"
/>

// Pass toolbar as a prop
<PageLayout toolbar={<GenericToolbar {...props} />}>

// Configure bottom padding based on fixed elements
<PageLayout bottomPadding="pb-20"> // Fixed pagination
<PageLayout bottomPadding="pb-4">  // No fixed elements

// Use onScrollTop for analytics or state reset
<PageLayout onScrollTop={trackScrollEvent}>
```

### DON'T ❌

```tsx
// Don't hardcode empty states
if (!data) return <div>No data</div>; // Use EmptyState instead

// Don't duplicate scroll logic
useEffect(() => { /* scroll handling */ }); // Use PageLayout

// Don't hardcode layout structure
<div className="flex flex-col">...</div> // Use PageLayout

// Don't forget bottom padding for fixed elements
<PageLayout> // Add bottomPadding="pb-20" for fixed pagination
```

## TypeScript Support

```typescript
import { PageLayoutProps, EmptyStateProps } from '@/components/PageLayout';

// Type-safe wrapper component
interface MyPageLayoutProps extends Partial<PageLayoutProps> {
  customProp?: string;
}

function MyPageLayout({ customProp, ...layoutProps }: MyPageLayoutProps) {
  return <PageLayout {...layoutProps} />;
}
```

## Accessibility

- ✅ Scroll-to-top button has `aria-label="Scroll to top"`
- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy in EmptyState
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Responsive breakpoints: mobile, tablet, desktop
- ✅ CSS Grid and Flexbox support

## Performance

- Event listeners properly cleaned up
- Scroll handler optimized
- No unnecessary re-renders
- Minimal DOM manipulation

## Future Enhancements

- [ ] Breadcrumb support
- [ ] Page title integration
- [ ] Loading state skeleton
- [ ] Sticky toolbar option
- [ ] Customizable scroll button position
- [ ] Animation options for scroll button
- [ ] Multiple empty state variants

## Related Components

- **GenericToolbar** - Toolbar with search, filters, and bulk actions
- **DataTable** - Table component with pagination
- **Layout** - Main app layout with sidebar and header
- **Sidebar** - Navigation sidebar
- **Header** - Top header with toolbar and actions
