/**
 * Expense List Component
 * DataTable view with tabs for different expense states
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockExpenses } from './data/mockData';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';
import { ExpenseTable } from './components/ExpenseTable';


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
          <ExpenseTable data={currentExpenses} loading={false} />
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
