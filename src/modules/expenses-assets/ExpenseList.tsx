/**
 * Expense List Component
 * DataTable view with tabs for different expense states
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit, X } from 'lucide-react';
import { mockExpenses } from './data/mockData';
import { Expense } from './types/expense.types';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';
import { EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS } from './constants/expense.constants';
import { format } from 'date-fns';


export function ExpenseList() {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Filter expenses by tab
  const allExpenses = mockExpenses;
  const pendingExpenses = allExpenses.filter(e => e.status === 'pending');
  const approvedExpenses = allExpenses.filter(e => e.status === 'approved');
  const rejectedExpenses = allExpenses.filter(e => e.status === 'rejected');
  const cancelledExpenses = allExpenses.filter(e => e.status === 'cancelled');

  // Get current tab expenses
  const getCurrentExpenses = () => {
    switch (activeTab) {
      case 'pending': return pendingExpenses;
      case 'approved': return approvedExpenses;
      case 'rejected': return rejectedExpenses;
      case 'cancelled': return cancelledExpenses;
      default: return allExpenses;
    }
  };

  const currentExpenses = getCurrentExpenses();

  // Filter fields
  const filterFields: AvailableFilter[] = [
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Travel', value: 'travel' },
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'Meals', value: 'meals' },
        { label: 'Transport', value: 'transport' },
        { label: 'Office Supplies', value: 'office_supplies' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Training', value: 'training' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Software', value: 'software' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      id: 'amountMin',
      label: 'Min Amount',
      type: 'number',
    },
    {
      id: 'amountMax',
      label: 'Max Amount',
      type: 'number',
    },
    {
      id: 'dateFrom',
      label: 'From Date',
      type: 'date',
    },
    {
      id: 'dateTo',
      label: 'To Date',
      type: 'date',
    },
  ];

  // Table columns
  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'description',
      header: 'Claim Details',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.type === 'advance' ? 'Advance Request' : 'Expense Claim'}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {row.original.description}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {row.original.lineItems.length} {row.original.lineItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold">
          ${row.original.amount.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const colorClass = EXPENSE_STATUS_COLORS[row.original.status];
        return (
          <Badge className={colorClass}>
            {EXPENSE_STATUS_LABELS[row.original.status]}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => console.log('View', row.original.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 'draft' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/expense-management/edit/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {['submitted', 'level1_approved', 'level2_approved'].includes(row.original.status) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => console.log('Cancel', row.original.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({allExpenses.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingExpenses.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedExpenses.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedExpenses.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledExpenses.length})</TabsTrigger>
            </TabsList>
            <Button onClick={() => navigate('/expense-management/new')}>
              New Expense
            </Button>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            <GenericToolbar
              showFilters={true}
              availableFilters={filterFields}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
              showExport={true}
              onExportAll={() => console.log('Export all')}
            />

        <div className="mt-4">
          <DataTable
            data={currentExpenses}
            columns={columns}
            loading={false}
            emptyState={{
              title: 'No expenses found',
              description: 'Try adjusting your filters or create a new expense',
            }}
          />
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
