/**
 * Expense Claim Form Component
 * Create or edit expense claim with date range and multiple line items
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { FormActionBar } from '@/components/common/FormActionBar';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockExpenses } from './data/mockData';
import { ExpenseCategory, PaymentMethod, ExpenseLineItem } from './types/expense.types';
import { EXPENSE_CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from './constants/expense.constants';

export function ExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Find expense if editing
  const existingExpense = isEdit ? mockExpenses.find(e => e.id === id) : null;

  // Header form data
  const [headerData, setHeaderData] = useState({
    claimTitle: existingExpense?.claimTitle || '',
    fromDate: existingExpense?.fromDate ? new Date(existingExpense.fromDate) : undefined,
    toDate: existingExpense?.toDate ? new Date(existingExpense.toDate) : undefined,
    purpose: existingExpense?.purpose || '',
    paymentMethod: existingExpense?.paymentMethod || ('card' as PaymentMethod),
    notes: existingExpense?.notes || '',
  });

  // Line items
  const [lineItems, setLineItems] = useState<Partial<ExpenseLineItem>[]>(
    existingExpense?.lineItems || [
      {
        id: `temp-${Date.now()}`,
        category: 'travel' as ExpenseCategory,
        description: '',
        amount: 0,
        expenseDate: '',
        merchantName: '',
        receiptNumber: '',
        notes: '',
        attachments: [],
      },
    ]
  );

  // Document storage (index -> files mapping)
  const [documents, setDocuments] = useState<Record<number, File[]>>({});

  const [isSaving, setIsSaving] = useState(false);

  const handleHeaderChange = (field: string, value: unknown) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentsChange = (index: number, files: File[]) => {
    setDocuments(prev => ({ ...prev, [index]: files }));
  };

  const getDocuments = (index: number): File[] => {
    return documents[index] || [];
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    console.log('Saving draft...', { headerData, lineItems, documents });
    setTimeout(() => {
      setIsSaving(false);
      navigate('/expense-management');
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    console.log('Submitting expense claim...', { headerData, lineItems, documents });
    setTimeout(() => {
      setIsSaving(false);
      navigate('/expense-management');
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/expense-management');
  };

  // Define columns for the editable table
  const lineItemColumns: TableColumn<Partial<ExpenseLineItem>>[] = [
    {
      key: 'category',
      header: 'Category',
      type: 'select',
      required: true,
      width: '160px',
      options: Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    },
    {
      key: 'expenseDate',
      header: 'Date',
      type: 'date',
      required: true,
      width: '150px',
      min: headerData.fromDate ? format(headerData.fromDate, 'yyyy-MM-dd') : undefined,
      max: headerData.toDate ? format(headerData.toDate, 'yyyy-MM-dd') : undefined,
    },
    {
      key: 'description',
      header: 'Description',
      type: 'text',
      required: true,
      placeholder: 'e.g., Flight from LAX to JFK',
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
      key: 'merchantName',
      header: 'Merchant',
      type: 'text',
      width: '150px',
      placeholder: 'Optional',
    },
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      type: 'text',
      width: '120px',
      placeholder: 'Optional',
    },
    {
      key: 'documents',
      header: 'Documents',
      type: 'documents',
      width: '130px',
    },
  ];

  const emptyLineItem: Partial<ExpenseLineItem> = {
    id: `temp-${Date.now()}`,
    category: 'travel' as ExpenseCategory,
    description: '',
    amount: 0,
    expenseDate: '',
    merchantName: '',
    receiptNumber: '',
    notes: '',
    attachments: [],
  };

  const toolbar = (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" onClick={handleCancel}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Expenses
      </Button>
    </div>
  );

  return (
    <PageLayout toolbar={toolbar}>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6 pb-24">
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Expense Claim' : 'New Expense Claim'}</h1>
          <p className="text-muted-foreground mt-2">
            {isEdit ? 'Update your expense claim details' : 'Submit expenses from your business trip or activities'}
          </p>
        </div>

        {/* Claim Header */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Claim Title */}
            <div className="space-y-2">
              <Label htmlFor="claimTitle">Claim Title *</Label>
              <Input
                id="claimTitle"
                placeholder="E.g., Business trip to NYC, Q4 Client Meetings"
                value={headerData.claimTitle}
                onChange={(e) => handleHeaderChange('claimTitle', e.target.value)}
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !headerData.fromDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {headerData.fromDate ? format(headerData.fromDate, 'PPP') : 'Pick start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={headerData.fromDate}
                      onSelect={(date) => handleHeaderChange('fromDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !headerData.toDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {headerData.toDate ? format(headerData.toDate, 'PPP') : 'Pick end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={headerData.toDate}
                      onSelect={(date) => handleHeaderChange('toDate', date)}
                      disabled={(date) => headerData.fromDate ? date < headerData.fromDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the business purpose for these expenses..."
                value={headerData.purpose}
                onChange={(e) => handleHeaderChange('purpose', e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Primary Payment Method *</Label>
              <Select
                value={headerData.paymentMethod}
                onValueChange={(value) => handleHeaderChange('paymentMethod', value)}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Overall Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this claim..."
                value={headerData.notes}
                onChange={(e) => handleHeaderChange('notes', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Expense Items</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Add all expenses from your trip. Edit cells directly in the table.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <EditableItemsTable
              columns={lineItemColumns}
              items={lineItems}
              onChange={setLineItems}
              emptyItemTemplate={emptyLineItem}
              minItems={1}
              maxItems={50}
              onDocumentsChange={handleDocumentsChange}
              getDocuments={getDocuments}
            />

            {/* Total */}
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Claim Amount</div>
                <div className="text-2xl font-bold">${calculateTotal().toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Action Bar */}
        <FormActionBar
          mode={isEdit ? 'edit' : 'create'}
          isSubmitting={isSaving}
          onCancel={handleCancel}
          submitText="Submit for Approval"
          leftContent={
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              Save as Draft
            </Button>
          }
        />
      </form>
    </PageLayout>
  );
}
