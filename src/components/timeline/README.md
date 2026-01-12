# Timeline Component

A reusable, generic component for displaying chronological sequences of events, similar to how DataTable handles tabular data.

## Features

- **Generic & Type-Safe**: Accepts any data type with TypeScript support
- **Custom Renderers**: Define how each item type should be rendered
- **Pagination Support**: Built-in pagination with multiple variants
- **Auto-sorting**: Automatic chronological sorting by timestamp
- **Visual Timeline**: Connected timeline with customizable icons and colors
- **Loading & Empty States**: Built-in states with customization options

## Basic Usage

```tsx
import { Timeline, TimelineItem, TimelineTypeConfig } from '@/components/timeline';

// Define your items
const items: TimelineItem[] = [
  {
    id: '1',
    type: 'appointment',
    timestamp: new Date('2026-01-03T10:00:00'),
    data: { /* your appointment data */ }
  },
  {
    id: '2',
    type: 'visit',
    timestamp: new Date('2026-01-02T14:30:00'),
    data: { /* your visit data */ }
  }
];

// Configure how each type should render
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
  }
];

// Render the timeline
<Timeline
  items={items}
  typeConfigs={typeConfigs}
/>
```

## With Pagination

```tsx
<Timeline
  items={items}
  typeConfigs={typeConfigs}
  showPagination
  paginationVariant="compact"
  pageIndex={0}
  pageSize={10}
  totalPages={5}
  totalItems={50}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
/>
```

## With Fixed Pagination (like DataTable)

```tsx
<Timeline
  items={items}
  typeConfigs={typeConfigs}
  showPagination
  paginationVariant="default"
  fixedPagination={true}
  pageIndex={0}
  pageSize={20}
  totalPages={10}
  onPageChange={setPage}
  onPageSizeChange={setSize}
/>
```

## Custom Empty State

```tsx
<Timeline
  items={[]}
  typeConfigs={typeConfigs}
  emptyMessage="No activities found for the selected dates"
  emptyIcon={CalendarOff}
/>
```

## Props

### Required Props

- `items`: Array of timeline items
- `typeConfigs`: Configuration for rendering different item types

### Optional Props

- `showPagination`: Enable pagination (default: false)
- `paginationVariant`: Pagination style (default, compact, simple, numbered)
- `pageIndex`: Current page (0-based)
- `pageSize`: Items per page
- `totalPages`: Total number of pages
- `totalItems`: Total item count
- `onPageChange`: Page change handler
- `onPageSizeChange`: Page size change handler
- `pageSizeOptions`: Available page sizes
- `emptyMessage`: Empty state message
- `emptyIcon`: Empty state icon component
- `emptyState`: Custom empty state renderer
- `isLoading`: Loading state flag
- `loadingState`: Custom loading renderer
- `className`: Additional CSS classes
- `autoSort`: Enable automatic sorting (default: true)
- `sortOrder`: Sort order ('asc' | 'desc', default: 'desc')

## Type Definitions

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
  icon?: {
    component: any;
    className?: string;
  };
  color?: {
    dot: string;
    iconColor: string;
  };
}
```

## Examples

See `/src/modules/visitor-appointments/pages/VisitorsHistoriesPage.tsx` for a real-world implementation.
