# Pagination Components

A collection of reusable pagination components with multiple variants to suit different use cases.

## Variants

### 1. Default Pagination (Full-Featured)
Fixed-position pagination with comprehensive controls. Best for main tables and data grids.

**Features:**
- Fixed bottom position
- Rows per page selector
- Page info display
- Previous/Next navigation
- Adapts to sidebar state

**Usage:**
```tsx
import { Pagination } from '@/components/common/Pagination';

<Pagination
  variant="default"
  pageIndex={0}
  pageSize={10}
  totalPages={10}
  canNextPage={true}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
  pageSizeOptions={[5, 10, 20, 50, 100]}
/>
```

---

### 2. Compact Pagination
Inline pagination with detailed information. Best for embedded tables and cards.

**Features:**
- Inline display (no fixed positioning)
- Shows item range (e.g., "Showing 1 to 10 of 100 results")
- First/Previous/Next/Last buttons
- Compact page size selector
- Minimal vertical space

**Usage:**
```tsx
<Pagination
  variant="compact"
  pageIndex={0}
  pageSize={10}
  totalPages={10}
  totalItems={100}
  canNextPage={true}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
  pageSizeOptions={[10, 20, 50]}
/>
```

---

### 3. Simple Pagination
Minimalist pagination with just navigation buttons. Best for mobile or space-constrained layouts.

**Features:**
- Minimal design
- Just page info and prev/next buttons
- No page size selector
- Ideal for mobile views

**Usage:**
```tsx
<Pagination
  variant="simple"
  pageIndex={0}
  pageSize={10}
  totalPages={10}
  canNextPage={true}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
/>
```

---

### 4. Numbered Pagination
Pagination with clickable page numbers. Best for browsing multiple pages quickly.

**Features:**
- Clickable page number buttons
- Smart ellipsis for large page counts
- Shows first, last, and surrounding pages
- Page size selector included
- Item range display

**Usage:**
```tsx
<Pagination
  variant="numbered"
  pageIndex={5}
  pageSize={20}
  totalPages={50}
  totalItems={1000}
  canNextPage={true}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
  pageSizeOptions={[10, 20, 50]}
/>
```

**Page Number Logic:**
- Total pages ≤ 7: Shows all pages
- Near start (page ≤ 3): `1 2 3 4 5 ... 50`
- In middle: `1 ... 5 6 7 ... 50`
- Near end (page ≥ 47): `1 ... 46 47 48 49 50`

---

### 5. Infinite Pagination
Load more button style. Best for feeds, lists, and infinite scroll scenarios.

**Features:**
- "Load More" button
- Shows loaded vs total items
- Loading state support
- End of list message
- No traditional pagination

**Usage:**
```tsx
<Pagination
  variant="infinite"
  pageIndex={2}
  pageSize={20}
  totalPages={10}
  totalItems={200}
  canNextPage={true}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
  loading={isLoading}
  loadMoreText="Load More Items"
/>
```

---

## Props API

### Common Props (All Variants)

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'default' \| 'compact' \| 'simple' \| 'numbered' \| 'infinite'` | No | `'default'` | Pagination style variant |
| `pageIndex` | `number` | Yes | - | Current page (0-based) |
| `pageSize` | `number` | Yes | - | Items per page |
| `totalPages` | `number` | Yes | - | Total number of pages |
| `canNextPage` | `boolean` | Yes | - | Whether next page exists |
| `onPageChange` | `(page: number) => void` | Yes | - | Page change callback |
| `onPageSizeChange` | `(size: number) => void` | Yes | - | Page size change callback |
| `totalItems` | `number` | No | - | Total item count (for display) |
| `pageSizeOptions` | `number[]` | No | `[10, 20, 50]` | Available page size options |
| `className` | `string` | No | - | Additional CSS classes |
| `disabled` | `boolean` | No | `false` | Disable all interactions |

### Infinite Variant Additional Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `loading` | `boolean` | No | `false` | Show loading state |
| `loadMoreText` | `string` | No | `'Load More'` | Custom button text |

---

## Usage with DataTable

The pagination variants can be used directly with the DataTable component:

```tsx
import { DataTable } from '@/components/common/DataTable';
import { CompactPagination } from '@/components/common/Pagination';

<DataTable
  data={data}
  columns={columns}
  pagination={paginationConfig}
  customPaginationComponent={CompactPagination}
  // ... other props
/>
```

Or use the variant switcher:

```tsx
import { DataTable } from '@/components/common/DataTable';

<DataTable
  data={data}
  columns={columns}
  pagination={paginationConfig}
  paginationVariant="numbered" // Switch variants easily
  // ... other props
/>
```

---

## Standalone Usage

All pagination components can be used independently outside of tables:

```tsx
import { NumberedPagination } from '@/components/common/Pagination';

function MyComponent() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  return (
    <div>
      {/* Your content */}
      <div className="my-content">
        {/* ... */}
      </div>
      
      {/* Pagination */}
      <NumberedPagination
        pageIndex={page}
        pageSize={pageSize}
        totalPages={50}
        totalItems={1000}
        canNextPage={page < 49}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
```

---

## Choosing the Right Variant

| Use Case | Recommended Variant | Reason |
|----------|-------------------|--------|
| Main data tables | `default` | Full-featured, fixed position, doesn't scroll away |
| Embedded tables/cards | `compact` | Inline, detailed info, space-efficient |
| Mobile views | `simple` | Minimal design, touch-friendly |
| Browse many pages | `numbered` | Quick navigation to specific pages |
| Social feeds, lists | `infinite` | Load more pattern, familiar UX |

---

## Examples

### Example 1: Data Table with Numbered Pagination
```tsx
import { DataTable } from '@/components/common/DataTable';
import { NumberedPagination } from '@/components/common/Pagination';

<DataTable
  data={items}
  columns={itemColumns}
  pagination={{
    pageIndex,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
    canNextPage: pageIndex < totalPages - 1,
    onPageChange: setPageIndex,
    onPageSizeChange: setPageSize,
  }}
  customPaginationComponent={NumberedPagination}
  serverSidePagination={true}
/>
```

### Example 2: Activity Feed with Infinite Scroll
```tsx
import { InfinitePagination } from '@/components/common/Pagination';

<div className="activity-feed">
  {activities.map(activity => (
    <ActivityCard key={activity.id} {...activity} />
  ))}
  
  <InfinitePagination
    pageIndex={page}
    pageSize={20}
    totalPages={totalPages}
    totalItems={totalActivities}
    canNextPage={hasMore}
    onPageChange={(newPage) => loadMore(newPage)}
    onPageSizeChange={() => {}}
    loading={isLoading}
    loadMoreText="Load More Activities"
  />
</div>
```

### Example 3: Compact Pagination in Modal
```tsx
import { CompactPagination } from '@/components/common/Pagination';

<Dialog>
  <DialogContent className="max-w-4xl">
    <Table>
      {/* table content */}
    </Table>
    
    <CompactPagination
      pageIndex={modalPage}
      pageSize={10}
      totalPages={10}
      totalItems={95}
      canNextPage={modalPage < 9}
      onPageChange={setModalPage}
      onPageSizeChange={setModalPageSize}
      pageSizeOptions={[10, 25, 50]}
    />
  </DialogContent>
</Dialog>
```

---

## Styling & Customization

All pagination components support:
- Custom `className` prop for additional styling
- Disabled state with `disabled` prop
- Consistent with shadcn/ui design system
- Responsive design out of the box

---

## Migration from TablePagination

The existing `TablePagination` component is now aliased to `DefaultPagination`:

```tsx
// Old
import { TablePagination } from '@/components/common/TablePagination';

// New (same behavior)
import { DefaultPagination } from '@/components/common/Pagination';
// or
import { Pagination } from '@/components/common/Pagination';
<Pagination variant="default" ... />
```

---

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type { PaginationProps, PaginationVariant } from '@/components/common/Pagination';

// Type-safe props
const props: PaginationProps = {
  pageIndex: 0,
  pageSize: 10,
  totalPages: 10,
  canNextPage: true,
  onPageChange: () => {},
  onPageSizeChange: () => {},
};

// Type-safe variant selection
const variant: PaginationVariant = 'numbered';
```
