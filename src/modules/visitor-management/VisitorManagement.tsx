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
import { ActiveFilter, AvailableFilter } from '@/components/GenericToolbar/types';
import { 
  VISITOR_STATUS_LABELS, 
  PURPOSE_LABELS 
} from './constants';
import { mockEmployees } from './mockData';

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

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'visitorName', 'contactInfo', 'purpose', 'firstName', 'expectedArrivalDate', 'status', 'actions'
  ]);

  // Available columns for configure view
  const allColumns = [
    { id: 'visitorName', label: 'Visitor Name' },
    { id: 'contactInfo', label: 'Contact Info' },
    { id: 'company', label: 'Company' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'firstName', label: 'Host' },
    { id: 'expectedArrivalDate', label: 'Expected Arrival' },
    { id: 'status', label: 'Status' },
    { id: 'checkInOut', label: 'Check In/Out' },
    { id: 'actions', label: 'Actions' },
  ];

  // Handlers
  const handleAddVisitor = () => {
    navigate('/visitor-management?mode=create');
  };

  const handleVisibleColumnsChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  // Filter configuration
  const filterConfig: AvailableFilter[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: Object?.entries(VISITOR_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      id: 'registrationType',
      label: 'Registration Type',
      type: 'select',
      options: [
        { value: 'pre-registered', label: 'Pre-registered' },
        { value: 'instant', label: 'Instant Check-in' },
      ],
    },
    {
      id: 'purpose',
      label: 'Purpose',
      type: 'multiselect',
      options: Object?.entries(PURPOSE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      id: 'hostEmployee',
      label: 'Host Employee',
      type: 'multiselect',
      options: mockEmployees?.map((emp) => ({
        value: emp?.id,
        label: `${emp?.name} (${emp?.department})`,
      })),
    },
    {
      id: 'company',
      label: 'Company',
      type: 'text',
      placeholder: 'Enter company name',
    },
    {
      id: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number',
    },
    {
      id: 'expectedDate',
      label: 'Expected Date',
      type: 'date',
    },
    {
      id: 'checkInDate',
      label: 'Check-In Date',
      type: 'date',
    },
    {
      id: 'checkOutDate',
      label: 'Check-Out Date',
      type: 'date',
    },
    {
      id: 'hasCheckedIn',
      label: 'Checked In',
      type: 'boolean',
    },
    {
      id: 'hasCheckedOut',
      label: 'Checked Out',
      type: 'boolean',
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
        />
      </div>
    </PageLayout>
  );
}