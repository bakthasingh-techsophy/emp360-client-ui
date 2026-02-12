/**
 * Employee Expense List Component
 * View and manage personal expenses
 */

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar';
import { ExpenseStatsCards, ExpenseCard } from './components';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExpenseListItem, ExpenseStats } from './types/expense.types';
import { mockExpenses } from './data/mockData';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

export function EmployeeExpenseList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // All expenses (for demo, showing all expenses)
  const userExpenses = mockExpenses
    .map(exp => ({
      ...exp,
      daysInReview: exp.status !== 'draft' && exp.status !== 'cancelled' 
        ? Math.floor((new Date().getTime() - new Date(exp.submittedAt || exp.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      canEdit: exp.status === 'draft',
      canCancel: exp.status === 'pending',
      nextApproverName: exp.status === 'pending' ? 'Manager' : undefined,
    })) as ExpenseListItem[];

  // Calculate stats
  const stats: ExpenseStats = {
    total: userExpenses.length,
    pending: userExpenses.filter(e => e.status === 'pending').length,
    approved: userExpenses.filter(e => e.status === 'approved').length,
    rejected: userExpenses.filter(e => e.status === 'rejected').length,
    paid: userExpenses.filter(e => e.status === 'paid').length,
    totalAmount: userExpenses.reduce((sum, e) => sum + (e.totalRequestedAmount || 0), 0),
    pendingAmount: userExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.totalRequestedAmount || 0), 0),
    paidAmount: userExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + (e.totalRequestedAmount || 0), 0),
  };

  // Filter fields
  const filterFields: AvailableFilter[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Paid', value: 'paid' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ];

  // Convert activeFilters to record for easier access
  const filters = activeFilters.reduce((acc, filter) => {
    acc[filter.id] = filter.value;
    return acc;
  }, {} as Record<string, unknown>);

  // Apply filters
  let filteredExpenses = userExpenses.filter(expense => {
    if (searchQuery && !expense.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !expense.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.status && expense.status !== filters.status) {
      return false;
    }
    return true;
  });

  const handleView = (expense: ExpenseListItem) => {
    console.log('View expense:', expense.id);
    // TODO: Open details modal
  };

  const handleEdit = (expense: ExpenseListItem) => {
    navigate(`/expense-management/expense?mode=edit&id=${expense.id}`);
  };

  const handleCancel = (expense: ExpenseListItem) => {
    console.log('Cancel expense:', expense.id);
    // TODO: Implement cancel logic
  };

  const handleExport = () => {
    console.log('Export expenses');
  };

  const toolbar = (
    <GenericToolbar
      searchPlaceholder="Search expenses..."
      onSearchChange={setSearchQuery}
      showFilters={true}
      availableFilters={filterFields}
      activeFilters={activeFilters}
      onFiltersChange={setActiveFilters}
      showExport={true}
      onExportAll={handleExport}
      showAddButton={true}
      addButtonLabel="New Expense"
      onAdd={() => navigate('/expense-management/expense?mode=create&type=expense')}
    />
  );

  return (
    <PageLayout
      toolbar={toolbar}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Expenses</h1>
          <p className="text-muted-foreground mt-2">View and manage your expense submissions</p>
        </div>
        
        <ExpenseStatsCards stats={stats} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExpenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onView={handleView}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          ))}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No expenses found</p>
            <Button className="mt-4" onClick={() => navigate('/expense-management/expense?mode=create&type=expense')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Expense
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
