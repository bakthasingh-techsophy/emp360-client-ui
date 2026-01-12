# Timeline Component - Quick Reference

## Basic Usage

```tsx
import { Timeline, TimelineItem, TimelineTypeConfig } from '@/components/timeline';

// 1. Prepare your data
const items: TimelineItem[] = data.map(item => ({
  id: item.id,
  type: 'your-type',
  timestamp: new Date(item.date),
  data: item
}));

// 2. Configure renderers
const typeConfigs: TimelineTypeConfig[] = [
  {
    type: 'your-type',
    renderer: (item, isLast) => <YourCard {...item.data} />,
    icon: { component: YourIcon },
    color: { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' }
  }
];

// 3. Render
<Timeline
  items={items}
  typeConfigs={typeConfigs}
  showPagination
  paginationVariant="compact"
  pageIndex={pageIndex}
  pageSize={pageSize}
  totalPages={Math.ceil(items.length / pageSize)}
  onPageChange={setPageIndex}
  onPageSizeChange={setPageSize}
/>
```

## With Multiple Types

```tsx
const typeConfigs: TimelineTypeConfig[] = [
  {
    type: 'appointment',
    renderer: (item, isLast) => <AppointmentCard {...item.data} />,
    icon: { component: Calendar },
    color: { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' }
  },
  {
    type: 'visit',
    renderer: (item, isLast) => <VisitCard {...item.data} />,
    icon: { component: User },
    color: { dot: 'bg-green-500/10', iconColor: 'text-green-600' }
  },
  {
    type: 'payment',
    renderer: (item, isLast) => <PaymentCard {...item.data} />,
    icon: { component: DollarSign },
    color: { dot: 'bg-purple-500/10', iconColor: 'text-purple-600' }
  }
];
```

## Common Patterns

### With Search
```tsx
const [searchValue, setSearchValue] = useState('');

const filteredItems = items.filter(item => 
  item.data.name.toLowerCase().includes(searchValue.toLowerCase())
);

<GenericToolbar
  showSearch
  searchValue={searchValue}
  onSearchChange={setSearchValue}
/>

<Timeline items={filteredItems} typeConfigs={typeConfigs} />
```

### With Date Range
```tsx
const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

const filteredItems = items.filter(item => {
  const itemDate = new Date(item.timestamp);
  if (dateRange.from && itemDate < dateRange.from) return false;
  if (dateRange.to && itemDate > dateRange.to) return false;
  return true;
});
```

### With Loading State
```tsx
<Timeline
  items={items}
  typeConfigs={typeConfigs}
  isLoading={isLoading}
  loadingState={<CustomLoader />}
/>
```

### Custom Empty State
```tsx
<Timeline
  items={[]}
  typeConfigs={typeConfigs}
  emptyMessage="No activities found"
  emptyIcon={CalendarOff}
/>
```

## Color Schemes

```tsx
// Blue (Appointments, Info)
color: { dot: 'bg-blue-500/10', iconColor: 'text-blue-600' }

// Green (Visits, Success)
color: { dot: 'bg-green-500/10', iconColor: 'text-green-600' }

// Purple (Payments, Premium)
color: { dot: 'bg-purple-500/10', iconColor: 'text-purple-600' }

// Orange (Warnings, Pending)
color: { dot: 'bg-orange-500/10', iconColor: 'text-orange-600' }

// Red (Cancellations, Errors)
color: { dot: 'bg-red-500/10', iconColor: 'text-red-600' }

// Gray (Neutral, Notes)
color: { dot: 'bg-gray-500/10', iconColor: 'text-gray-600' }
```

## Pagination Variants

```tsx
// Default - Full featured with fixed position
paginationVariant="default"

// Compact - Minimal inline design
paginationVariant="compact"

// Simple - Just prev/next buttons
paginationVariant="simple"

// Numbered - Shows page numbers
paginationVariant="numbered"
```

## TypeScript Types

```typescript
interface TimelineItem<T = any> {
  id: string;
  type: string;
  timestamp: Date;
  data: T;
}

interface TimelineTypeConfig<T = any> {
  type: string;
  renderer: (item: TimelineItem<T>, isLast: boolean) => ReactNode;
  icon?: { component: any; className?: string };
  color?: { dot: string; iconColor: string };
}

interface TimelineProps<T = any> {
  items: TimelineItem<T>[];
  typeConfigs: TimelineTypeConfig<T>[];
  showPagination?: boolean;
  paginationVariant?: PaginationVariant;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // ... more props
}
```

## Real-World Example

See `/src/modules/visitor-appointments/pages/VisitorsHistoriesPage.tsx` for a complete implementation with:
- Multiple type configurations
- Search functionality
- Stats dashboard
- Pagination
- Visitor information cards
- Responsive design
