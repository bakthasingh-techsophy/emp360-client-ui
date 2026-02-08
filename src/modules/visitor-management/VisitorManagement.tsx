/**
 * Visitor Management Main Page
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { VisitorRegistrationForm } from './components/VisitorRegistrationForm';
import { VisitorsTable } from './VisitorsTable';
import { SpaceSetup } from './SpaceSetup';
import { ActiveFilter, AvailableFilter } from '@/components/GenericToolbar/types';
import { 
  VISITOR_STATUS_LABELS, 
  PURPOSE_LABELS 
} from './constants';
import { mockEmployees } from './mockData';
import { SpaceConfiguration } from './spaceTypes';

export function VisitorManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we're in registration mode
  const mode = searchParams?.get('mode') as 'create' | 'edit' | null;
  const visitorId = searchParams?.get('id');
  const isRegistrationMode = mode === 'create' || mode === 'edit';

  // Space configuration state
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfiguration | null>(null);
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const [isLoadingSpace, setIsLoadingSpace] = useState(true);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [refreshTrigger] = useState(0); // Reserved for future bulk operations

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name', 'contactInfo', 'purpose', 'hostEmployeeName', 'expectedArrivalDate', 'status', 'checkInOut', 'actions'
  ]);

  // Available columns for configure view
  const allColumns = [
    { id: 'name', label: 'Visitor Name' },
    { id: 'contactInfo', label: 'Contact Info' },
    { id: 'company', label: 'Company' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'hostEmployeeName', label: 'Host' },
    { id: 'expectedArrivalDate', label: 'Expected Arrival' },
    { id: 'status', label: 'Status' },
    { id: 'checkInOut', label: 'Check In/Out' },
    { id: 'registrationType', label: 'Type' },
    { id: 'actions', label: 'Actions' },
  ];

  // Load space configuration and notifications
  useEffect(() => {
    loadSpaceConfiguration();
    loadNotifications();
  }, []);

  const loadSpaceConfiguration = () => {
    setIsLoadingSpace(true);
    try {
      // Load from localStorage (TODO: Replace with API call)
      const stored = localStorage.getItem('visitorManagementSpace');
      if (stored) {
        setSpaceConfig(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load space configuration:', error);
    } finally {
      setIsLoadingSpace(false);
    }
  };

  const loadNotifications = () => {
    try {
      // Load from localStorage (TODO: Replace with API call)
      const stored = localStorage.getItem('spaceNotifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        const pending = notifications.filter((n: { status: string }) => n.status === 'pending').length;
        setPendingNotifications(pending);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleSpaceSetupComplete = () => {
    loadSpaceConfiguration();
  };

  // Handlers
  const handleAddVisitor = () => {
    navigate('/visitor-management?mode=create');
  };

  const handleVisibleColumnsChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  const handleNotificationsClick = () => {
    navigate('/visitor-management/notifications');
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

  // Show space setup if loading
  if (isLoadingSpace) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-2">
            <div className="text-muted-foreground">Loading space configuration...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show space setup if no space configured or pending
  if (!spaceConfig || spaceConfig.status === 'pending') {
    return <SpaceSetup onComplete={handleSpaceSetupComplete} isPending={spaceConfig?.status === 'pending'} />;
  }

  // Main visitor management view
  return (
    <>
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
              {/* Notifications Button */}
              <Button 
                variant="outline" 
                size="icon" 
                className="relative"
                onClick={handleNotificationsClick}
              >
                <Bell className="h-4 w-4" />
                {pendingNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {pendingNotifications}
                  </Badge>
                )}
              </Button>
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
    </>
  );
}
