/**
 * Visitor Management Main Page
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { VisitorRegistrationForm } from './components/VisitorRegistrationForm';
import { VisitorsTable } from './VisitorsTable';
import { ActiveFilter, AvailableFilter, CurrentSort, SortableField } from '@/components/GenericToolbar/types';
import { 
  VISITOR_STATUS_LABELS, 
  PURPOSE_LABELS 
} from './constants';

export function VisitorManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we're in registration mode
  const mode = searchParams?.get('mode') as 'create' | 'edit' | null;
  const visitorId = searchParams?.get('id');
  const isRegistrationMode = mode === 'create' || mode === 'edit';

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [refreshTrigger] = useState(0); // Reserved for future bulk operations
  const [currentSort, setCurrentSort] = useState<CurrentSort | null>({
    field: 'createdAt',
    direction: -1, // -1 for descending (latest first)
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'visitorName', 'contactInfo', 'purpose', 'firstName', 'expectedArrivalDateTime', 'status', 'actions'
  ]);

  // Available columns for configure view
  const allColumns = [
    { id: 'visitorName', label: 'Visitor Name' },
    { id: 'contactInfo', label: 'Contact Info' },
    { id: 'company', label: 'Company' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'firstName', label: 'Host' },
    { id: 'expectedArrivalDateTime', label: 'Expected Arrival' },
    { id: 'status', label: 'Status' },
    { id: 'checkInOut', label: 'Check In/Out' },
    { id: 'actions', label: 'Actions' },
  ];

  // Sortable fields configuration
  const sortableFields: SortableField[] = [
    { id: 'createdAt', label: 'Created Date', type: 'date' },
    { id: 'updatedAt', label: 'Updated Date', type: 'date' },
  ];

  // Handlers
  const handleAddVisitor = () => {
    navigate('/visitor-management?mode=create');
  };

  const handleVisibleColumnsChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  // Filter configuration - matches VisitorSnapshot fields
  const filterConfig: AvailableFilter[] = [
    // Visitor Status (from Visitor)
    {
      id: 'visitorStatus',
      label: 'Visitor Status',
      type: 'multiselect',
      operators: [
        { value: 'in' as const, label: 'Includes any' },
        { value: 'all' as const, label: 'Includes all' },
        { value: 'nin' as const, label: 'Excludes' },
      ],
      options: Object?.entries(VISITOR_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    // Purpose (from Visitor)
    {
      id: 'purpose',
      label: 'Purpose',
      type: 'multiselect',
      operators: [
        { value: 'in' as const, label: 'Includes any' },
        { value: 'all' as const, label: 'Includes all' },
        { value: 'nin' as const, label: 'Excludes' },
      ],
      options: Object?.entries(PURPOSE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    // Visitor Name (from Visitor)
    {
      id: 'visitorName',
      label: 'Visitor Name',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter visitor name',
    },
    // Visitor Email (from Visitor)
    {
      id: 'visitorEmail',
      label: 'Visitor Email',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter visitor email',
    },
    // Visitor Phone (from Visitor)
    {
      id: 'visitorPhone',
      label: 'Visitor Phone',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter visitor phone',
    },
    // Company ID (from Visitor)
    {
      id: 'companyId',
      label: 'Company',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter company',
    },
    // Host Employee ID (from Visitor)
    {
      id: 'employeeId',
      label: 'Host Employee ID',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter host employee ID',
    },
    // Host First Name (from VisitorSnapshot - derived)
    {
      id: 'firstName',
      label: 'Host First Name',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter host first name',
    },
    // Host Last Name (from VisitorSnapshot - derived)
    {
      id: 'lastName',
      label: 'Host Last Name',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter host last name',
    },
    // Host Email (from VisitorSnapshot - derived)
    {
      id: 'email',
      label: 'Host Email',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter host email',
    },
    // Host Phone (from VisitorSnapshot - derived)
    {
      id: 'phone',
      label: 'Host Phone',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter host phone',
    },
    // Expected Arrival DateTime (from Visitor)
    {
      id: 'expectedArrivalDateTime',
      label: 'Expected Arrival Date',
      type: 'date',
      operators: [
        { value: 'today' as const, label: 'Today' },
        { value: 'on' as const, label: 'On date' },
        { value: '>=' as const, label: 'On or after' },
        { value: '<=' as const, label: 'On or before' },
        { value: 'between' as const, label: 'Between' },
      ],
    },
    // Check-In Time (from Visitor)
    {
      id: 'checkInTime',
      label: 'Check-In Date',
      type: 'date',
      operators: [
        { value: 'today' as const, label: 'Today' },
        { value: 'on' as const, label: 'On date' },
        { value: '>=' as const, label: 'On or after' },
        { value: '<=' as const, label: 'On or before' },
        { value: 'between' as const, label: 'Between' },
      ],
    },
    // Check-Out Time (from Visitor)
    {
      id: 'checkOutTime',
      label: 'Check-Out Date',
      type: 'date',
      operators: [
        { value: 'today' as const, label: 'Today' },
        { value: 'on' as const, label: 'On date' },
        { value: '>=' as const, label: 'On or after' },
        { value: '<=' as const, label: 'On or before' },
        { value: 'between' as const, label: 'Between' },
      ],
    },
    // Created At (from Visitor)
    {
      id: 'createdAt',
      label: 'Registration Date',
      type: 'date',
      operators: [
        { value: 'today' as const, label: 'Today' },
        { value: 'on' as const, label: 'On date' },
        { value: '>=' as const, label: 'On or after' },
        { value: '<=' as const, label: 'On or before' },
        { value: 'between' as const, label: 'Between' },
      ],
    },
    // Notes (from Visitor)
    {
      id: 'notes',
      label: 'Notes',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Search in notes',
    },
  ];

  // If in registration mode, show the form
  if (isRegistrationMode) {
    return (
      <VisitorRegistrationForm 
        mode={mode!} 
        visitorId={visitorId || undefined} 
      />
    );
  }

  // Main visitor management view
  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page Header with Action Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Visitor Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage visitor registrations, approvals, and check-ins
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Register Visitor Button */}
            <Button onClick={handleAddVisitor} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Register Visitor
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <GenericToolbar
          showSearch
          searchPlaceholder="Search visitors by name, email, phone, or company..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          showConfigureView
          allColumns={allColumns}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={handleVisibleColumnsChange}
          showSort
          sortableFields={sortableFields}
          currentSort={currentSort}
          onSortChange={setCurrentSort}
          showFilters
          availableFilters={filterConfig}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
          showExport
          onExportAll={() => console.log('Export all')}
          onExportResults={() => console.log('Export results')}
        />

        {/* Visitors Table */}
        <VisitorsTable
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          visibleColumns={visibleColumns}
          refreshTrigger={refreshTrigger}
          currentSort={currentSort}
        />
      </div>
    </PageLayout>
  );
}