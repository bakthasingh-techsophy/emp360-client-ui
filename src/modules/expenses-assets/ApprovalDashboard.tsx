/**
 * Approval Dashboard Component
 * For managers, business heads, and finance to review expenses
 */

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar';
import { ExpenseStatsCards, ExpenseCard } from './components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseListItem, ExpenseStats, ApprovalLevel } from './types/expense.types';
import { mockExpenses } from './data/mockData';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';
import { APPROVAL_LEVEL_LABELS } from './constants/expense.constants';

interface ApprovalDashboardProps {
  level: ApprovalLevel;
}

export function ApprovalDashboard({ level }: ApprovalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [activeTab, setActiveTab] = useState('pending');

  // Map levels to status
  const statusForLevel: Record<ApprovalLevel, string> = {
    level1: 'submitted',
    level2: 'level1_approved',
    level3: 'level2_approved',
  };

  const pendingStatus = statusForLevel[level];

  // Filter expenses by level
  const allExpenses = mockExpenses.map(exp => ({
    ...exp,
    daysInReview: exp.status !== 'draft' && exp.status !== 'cancelled' 
      ? Math.floor((new Date().getTime() - new Date(exp.submittedAt || exp.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    canEdit: false,
    canCancel: false,
    nextApproverName: undefined,
  })) as ExpenseListItem[];

  const pendingExpenses = allExpenses.filter(e => e.status === pendingStatus);
  const approvedToday = allExpenses.filter(e => 
    e.approvalHistory?.some(a => 
      a.level === level && 
      a.action === 'approve' && 
      new Date(a.timestamp).toDateString() === new Date().toDateString()
    )
  );
  const rejectedToday = allExpenses.filter(e => 
    e.approvalHistory?.some(a => 
      a.level === level && 
      a.action === 'reject' && 
      new Date(a.timestamp).toDateString() === new Date().toDateString()
    )
  );

  // Calculate stats
  const stats: ExpenseStats = {
    total: allExpenses.length,
    pending: pendingExpenses.length,
    approved: approvedToday.length,
    rejected: rejectedToday.length,
    paid: allExpenses.filter(e => e.status === 'paid').length,
    totalAmount: allExpenses.reduce((sum, e) => sum + (e.totalRequestedAmount || 0), 0),
    pendingAmount: pendingExpenses.reduce((sum, e) => sum + (e.totalRequestedAmount || 0), 0),
    paidAmount: allExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + (e.totalRequestedAmount || 0), 0),
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
        { label: 'Paid', value: 'paid' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      id: 'amountMin',
      label: 'Min Amount',
      type: 'text',
    },
    {
      id: 'amountMax',
      label: 'Max Amount',
      type: 'text',
    },
  ];

  // Convert activeFilters to record for easier access
  const filters = activeFilters.reduce((acc, filter) => {
    acc[filter.id] = filter.value;
    return acc;
  }, {} as Record<string, unknown>);

  // Apply filters
  const applyFilters = (expenses: ExpenseListItem[]) => {
    return expenses.filter(expense => {
      if (searchQuery && !expense.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !expense.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.amountMin && (expense.totalRequestedAmount || 0) < Number(filters.amountMin)) {
        return false;
      }
      if (filters.amountMax && (expense.totalRequestedAmount || 0) > Number(filters.amountMax)) {
        return false;
      }
      return true;
    });
  };

  const handleView = (expense: ExpenseListItem) => {
    console.log('View expense for approval:', expense.id);
    // TODO: Open approval modal
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
    />
  );

  return (
    <PageLayout
      toolbar={toolbar}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{APPROVAL_LEVEL_LABELS[level]} Approval Dashboard</h1>
          <p className="text-muted-foreground mt-2">Review and approve expense submissions</p>
        </div>
        
        <ExpenseStatsCards stats={stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved Today ({approvedToday.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected Today ({rejectedToday.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Expenses ({allExpenses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applyFilters(pendingExpenses).map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onView={handleView}
                  showActions={false}
                />
              ))}
            </div>
            {applyFilters(pendingExpenses).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending expenses</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applyFilters(approvedToday).map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onView={handleView}
                  showActions={false}
                />
              ))}
            </div>
            {applyFilters(approvedToday).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No expenses approved today</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applyFilters(rejectedToday).map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onView={handleView}
                  showActions={false}
                />
              ))}
            </div>
            {applyFilters(rejectedToday).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No expenses rejected today</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applyFilters(allExpenses).map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onView={handleView}
                  showActions={false}
                />
              ))}
            </div>
            {applyFilters(allExpenses).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No expenses found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
