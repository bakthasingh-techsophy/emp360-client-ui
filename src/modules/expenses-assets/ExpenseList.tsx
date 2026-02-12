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
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';
import { ExpenseTable } from './components/ExpenseTable';
import { IntimationList } from './IntimationList';
import { Bell, Plus, Settings } from 'lucide-react';


export function ExpenseList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [parentTab, setParentTab] = useState('expenses');
  const [activeTab, setActiveTab] = useState('all');
  
  // Column visibility configuration
  const allColumns = [
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'employeeName', label: 'Name' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'description', label: 'Request Details' },
    { id: 'amount', label: 'Amount' },
    { id: 'paidAt', label: 'Paid At' },
    { id: 'createdAt', label: 'Claimed Date' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];
  
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map(col => col.id)
  );

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
        <Tabs value={parentTab} onValueChange={setParentTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="intimations">Intimations</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/expense-management/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/expense-management/intimation/new')}
              >
                <Bell className="h-4 w-4 mr-2" />
                New Intimation
              </Button>
              <Button onClick={() => navigate('/expense-management/expense?mode=create')}>
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Button>
            </div>
          </div>

          <TabsContent value="expenses" className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                <GenericToolbar
                  searchPlaceholder="Search expenses..."
                  onSearchChange={setSearchQuery}
                  showFilters={true}
                  availableFilters={filterFields}
                  activeFilters={activeFilters}
                  onFiltersChange={setActiveFilters}
                  showExport={true}
                  onExportAll={() => console.log('Export all')}
                  showConfigureView={true}
                  allColumns={allColumns}
                  visibleColumns={visibleColumns}
                  onVisibleColumnsChange={setVisibleColumns}
                />

                <div className="mt-4">
                  <ExpenseTable 
                    searchQuery={searchQuery}
                    activeFilters={activeFilters}
                    visibleColumns={visibleColumns}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="intimations" className="space-y-4">
            <IntimationList />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
