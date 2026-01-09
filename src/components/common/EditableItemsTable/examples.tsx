/**
 * EditableItemsTable Usage Examples
 * Practical examples for different use cases
 */

import { useState } from 'react';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';

// ============================================
// Example 1: Invoice Line Items
// ============================================

interface InvoiceItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export function InvoiceLineItemsExample() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', product: '', quantity: 1, unitPrice: 0, tax: 0, total: 0 },
  ]);

  const columns: TableColumn<InvoiceItem>[] = [
    {
      key: 'product',
      header: 'Product/Service',
      type: 'text',
      required: true,
      placeholder: 'Enter product name...',
    },
    {
      key: 'quantity',
      header: 'Qty',
      type: 'number',
      required: true,
      width: '100px',
      min: 1,
      step: 1,
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      type: 'number',
      required: true,
      width: '120px',
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      key: 'tax',
      header: 'Tax %',
      type: 'number',
      width: '100px',
      min: 0,
      max: 100,
      step: 0.1,
      placeholder: '0',
    },
    {
      key: 'total',
      header: 'Total',
      type: 'text',
      width: '120px',
      render: (_, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const taxAmount = subtotal * (item.tax / 100);
        const total = subtotal + taxAmount;
        return <span className="font-semibold">${total.toFixed(2)}</span>;
      },
    },
  ];

  const emptyItem: InvoiceItem = {
    id: Date.now().toString(),
    product: '',
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    total: 0,
  };

  return (
    <EditableItemsTable
      columns={columns}
      items={items}
      onChange={setItems}
      emptyItemTemplate={emptyItem}
      minItems={1}
      maxItems={100}
    />
  );
}

// ============================================
// Example 2: Purchase Order Items
// ============================================

interface PurchaseOrderItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  deliveryDate: string;
  supplier: string;
}

export function PurchaseOrderExample() {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [documents, setDocuments] = useState<Record<number, File[]>>({});

  const columns: TableColumn<PurchaseOrderItem>[] = [
    {
      key: 'itemCode',
      header: 'Item Code',
      type: 'text',
      required: true,
      width: '120px',
      placeholder: 'SKU/Code',
    },
    {
      key: 'description',
      header: 'Description',
      type: 'text',
      required: true,
      placeholder: 'Item description...',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      type: 'number',
      required: true,
      width: '100px',
      min: 1,
    },
    {
      key: 'deliveryDate',
      header: 'Delivery Date',
      type: 'date',
      required: true,
      width: '150px',
      min: new Date().toISOString().split('T')[0],
    },
    {
      key: 'supplier',
      header: 'Supplier',
      type: 'select',
      required: true,
      width: '150px',
      options: [
        { label: 'Supplier A', value: 'supplier-a' },
        { label: 'Supplier B', value: 'supplier-b' },
        { label: 'Supplier C', value: 'supplier-c' },
      ],
    },
    {
      key: 'documents',
      header: 'Specs/Docs',
      type: 'documents',
      width: '130px',
    },
  ];

  const emptyItem: PurchaseOrderItem = {
    id: Date.now().toString(),
    itemCode: '',
    description: '',
    quantity: 1,
    deliveryDate: '',
    supplier: '',
  };

  return (
    <EditableItemsTable
      columns={columns}
      items={items}
      onChange={setItems}
      emptyItemTemplate={emptyItem}
      minItems={0}
      maxItems={50}
      onDocumentsChange={(index, files) => 
        setDocuments(prev => ({ ...prev, [index]: files }))
      }
      getDocuments={(index) => documents[index] || []}
    />
  );
}

// ============================================
// Example 3: Employee Timesheet
// ============================================

interface TimesheetEntry {
  id: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  billable: string;
  notes: string;
}

export function TimesheetExample() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  const columns: TableColumn<TimesheetEntry>[] = [
    {
      key: 'date',
      header: 'Date',
      type: 'date',
      required: true,
      width: '140px',
    },
    {
      key: 'project',
      header: 'Project',
      type: 'select',
      required: true,
      width: '150px',
      options: [
        { label: 'Project Alpha', value: 'alpha' },
        { label: 'Project Beta', value: 'beta' },
        { label: 'Internal', value: 'internal' },
      ],
    },
    {
      key: 'task',
      header: 'Task',
      type: 'text',
      required: true,
      placeholder: 'Task description...',
    },
    {
      key: 'hours',
      header: 'Hours',
      type: 'number',
      required: true,
      width: '100px',
      min: 0,
      max: 24,
      step: 0.5,
      placeholder: '0.0',
    },
    {
      key: 'billable',
      header: 'Billable',
      type: 'select',
      required: true,
      width: '100px',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
    },
    {
      key: 'notes',
      header: 'Notes',
      type: 'text',
      placeholder: 'Optional notes...',
    },
  ];

  const emptyEntry: TimesheetEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    project: '',
    task: '',
    hours: 0,
    billable: 'yes',
    notes: '',
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div className="space-y-4">
      <EditableItemsTable
        columns={columns}
        items={entries}
        onChange={setEntries}
        emptyItemTemplate={emptyEntry}
        minItems={0}
        maxItems={30}
      />
      <div className="text-right">
        <span className="text-sm text-muted-foreground">Total Hours: </span>
        <span className="text-lg font-bold">{totalHours.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ============================================
// Example 4: Trip Itinerary
// ============================================

interface ItineraryItem {
  id: string;
  date: string;
  time: string;
  activity: string;
  location: string;
  type: string;
  cost: number;
}

export function TripItineraryExample() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [documents, setDocuments] = useState<Record<number, File[]>>({});

  const columns: TableColumn<ItineraryItem>[] = [
    {
      key: 'date',
      header: 'Date',
      type: 'date',
      required: true,
      width: '140px',
    },
    {
      key: 'type',
      header: 'Type',
      type: 'select',
      required: true,
      width: '140px',
      options: [
        { label: '✈️ Flight', value: 'flight' },
        { label: '🏨 Hotel', value: 'hotel' },
        { label: '🚗 Transport', value: 'transport' },
        { label: '🍽️ Meal', value: 'meal' },
        { label: '📅 Meeting', value: 'meeting' },
        { label: '🎯 Activity', value: 'activity' },
      ],
    },
    {
      key: 'activity',
      header: 'Activity',
      type: 'text',
      required: true,
      placeholder: 'What are you doing?',
    },
    {
      key: 'location',
      header: 'Location',
      type: 'text',
      required: true,
      width: '180px',
      placeholder: 'Where?',
    },
    {
      key: 'cost',
      header: 'Cost',
      type: 'number',
      width: '100px',
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      key: 'documents',
      header: 'Bookings',
      type: 'documents',
      width: '120px',
    },
  ];

  const emptyItem: ItineraryItem = {
    id: Date.now().toString(),
    date: '',
    time: '',
    activity: '',
    location: '',
    type: '',
    cost: 0,
  };

  const totalCost = itinerary.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-4">
      <EditableItemsTable
        columns={columns}
        items={itinerary}
        onChange={setItinerary}
        emptyItemTemplate={emptyItem}
        minItems={0}
        maxItems={100}
        onDocumentsChange={(index, files) =>
          setDocuments(prev => ({ ...prev, [index]: files }))
        }
        getDocuments={(index) => documents[index] || []}
      />
      <div className="text-right space-y-1">
        <div>
          <span className="text-sm text-muted-foreground">Total Activities: </span>
          <span className="font-semibold">{itinerary.length}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Total Cost: </span>
          <span className="text-lg font-bold">${totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 5: Read-Only Mode (View Only)
// ============================================

export function ReadOnlyExample() {
  const [items] = useState([
    { id: '1', product: 'Product A', quantity: 5, price: 100 },
    { id: '2', product: 'Product B', quantity: 3, price: 150 },
  ]);

  const columns: TableColumn[] = [
    { key: 'product', header: 'Product', type: 'text' },
    { key: 'quantity', header: 'Quantity', type: 'number', width: '100px' },
    { key: 'price', header: 'Price', type: 'number', width: '100px' },
  ];

  return (
    <EditableItemsTable
      columns={columns}
      items={items}
      onChange={() => {}} // No-op
      emptyItemTemplate={{}}
      allowAdd={false}
      allowRemove={false}
      showAddButton={false}
    />
  );
}
