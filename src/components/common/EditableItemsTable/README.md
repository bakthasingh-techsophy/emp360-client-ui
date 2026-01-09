# Editable Items Table Component

A reusable, feature-rich table component for collecting and managing multiple line items with inline editing capabilities.

## Features

- ✅ **Inline Cell Editing** - Edit values directly in table cells
- ✅ **Multiple Input Types** - Text, Number, Date, Select dropdowns
- ✅ **Document Management** - Upload and manage documents per row with modal
- ✅ **Add/Remove Rows** - Dynamic row management with + and - icons
- ✅ **Validation** - Built-in and custom validation support
- ✅ **Min/Max Constraints** - Control minimum and maximum items
- ✅ **Fully Typed** - TypeScript support with generics
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Customizable** - Flexible column configuration

## Usage

### Basic Example

```tsx
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const columns: TableColumn<ExpenseItem>[] = [
  {
    key: 'category',
    header: 'Category',
    type: 'select',
    required: true,
    width: '150px',
    options: [
      { label: 'Travel', value: 'travel' },
      { label: 'Meals', value: 'meals' },
      { label: 'Accommodation', value: 'accommodation' },
    ],
  },
  {
    key: 'description',
    header: 'Description',
    type: 'text',
    required: true,
    placeholder: 'Enter description...',
  },
  {
    key: 'amount',
    header: 'Amount',
    type: 'number',
    required: true,
    width: '120px',
    min: 0,
    step: 0.01,
    placeholder: '0.00',
  },
  {
    key: 'date',
    header: 'Date',
    type: 'date',
    required: true,
    width: '150px',
  },
  {
    key: 'documents',
    header: 'Documents',
    type: 'documents',
    width: '120px',
  },
];

function MyForm() {
  const [items, setItems] = useState<ExpenseItem[]>([
    {
      id: '1',
      category: '',
      description: '',
      amount: 0,
      date: '',
    },
  ]);

  const [documents, setDocuments] = useState<Record<number, File[]>>({});

  const emptyItem: ExpenseItem = {
    id: Date.now().toString(),
    category: '',
    description: '',
    amount: 0,
    date: '',
  };

  const handleDocumentsChange = (index: number, files: File[]) => {
    setDocuments((prev) => ({ ...prev, [index]: files }));
  };

  const getDocuments = (index: number) => {
    return documents[index] || [];
  };

  return (
    <EditableItemsTable
      columns={columns}
      items={items}
      onChange={setItems}
      emptyItemTemplate={emptyItem}
      minItems={1}
      maxItems={20}
      onDocumentsChange={handleDocumentsChange}
      getDocuments={getDocuments}
    />
  );
}
```

## Props

### EditableItemsTable

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `TableColumn[]` | ✅ | - | Column definitions |
| `items` | `T[]` | ✅ | - | Array of items to display |
| `onChange` | `(items: T[]) => void` | ✅ | - | Callback when items change |
| `emptyItemTemplate` | `T` | ✅ | - | Template for new items |
| `minItems` | `number` | ❌ | 1 | Minimum number of items |
| `maxItems` | `number` | ❌ | 50 | Maximum number of items |
| `onDocumentsChange` | `(index: number, docs: File[]) => void` | ❌ | - | Callback for document changes |
| `getDocuments` | `(index: number) => File[]` | ❌ | - | Get documents for item |
| `showAddButton` | `boolean` | ❌ | true | Show add button in header |
| `allowRemove` | `boolean` | ❌ | true | Allow removing items |
| `allowAdd` | `boolean` | ❌ | true | Allow adding items |
| `className` | `string` | ❌ | '' | Additional CSS classes |

### TableColumn

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | ✅ | Property key in item object |
| `header` | `string` | ✅ | Column header text |
| `type` | `'text' \| 'number' \| 'date' \| 'select' \| 'documents'` | ✅ | Input type |
| `width` | `string` | ❌ | Column width (CSS value) |
| `required` | `boolean` | ❌ | Show required indicator |
| `placeholder` | `string` | ❌ | Input placeholder |
| `options` | `{label: string, value: string}[]` | ❌ | Options for select type |
| `min` | `number` | ❌ | Min value for number/date |
| `max` | `number` | ❌ | Max value for number/date |
| `step` | `number` | ❌ | Step for number input |
| `render` | `(value: any, item: T) => ReactNode` | ❌ | Custom cell renderer |
| `validate` | `(value: any) => string \| null` | ❌ | Custom validation |

## Document Upload Modal

The document modal is automatically shown when clicking the document column button. It supports:

- Drag & drop file upload
- Multiple file selection
- File type validation
- File size validation
- Preview of uploaded files
- Remove individual files

### DocumentUploadModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxFiles` | `number` | 10 | Maximum files allowed |
| `maxFileSize` | `number` | 10 | Max file size in MB |
| `acceptedFormats` | `string[]` | `['image/*', 'application/pdf']` | Accepted file formats |

## Advanced Examples

### Custom Render Function

```tsx
{
  key: 'status',
  header: 'Status',
  type: 'text',
  render: (value, item) => (
    <Badge variant={value === 'approved' ? 'success' : 'default'}>
      {value}
    </Badge>
  ),
}
```

### Custom Validation

```tsx
{
  key: 'amount',
  header: 'Amount',
  type: 'number',
  validate: (value) => {
    if (value > 10000) return 'Amount exceeds limit';
    return null;
  },
}
```

### Read-Only Mode

```tsx
<EditableItemsTable
  columns={columns}
  items={items}
  onChange={setItems}
  emptyItemTemplate={emptyItem}
  allowAdd={false}
  allowRemove={false}
/>
```

## Styling

The component uses Tailwind CSS and shadcn/ui components. You can customize styling through:

1. **className prop** - Add custom classes to the wrapper
2. **Column width** - Set individual column widths
3. **Theme variables** - Customize via your theme configuration

## Best Practices

1. **Always provide unique IDs** - Include an `id` field in your item type
2. **Handle documents separately** - Store document state outside the items array
3. **Validate on submit** - Use form validation in addition to inline validation
4. **Optimize for large datasets** - Consider virtualization for 100+ items
5. **Provide clear placeholders** - Help users understand expected input

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 18+
- @radix-ui/react-dialog
- @radix-ui/react-select
- lucide-react
- Tailwind CSS
- shadcn/ui components
