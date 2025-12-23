/**
 * Visitor Management Main Page
 */

import { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Eye, Edit, CheckCircle, XCircle, UserCheck, UserX,
  MoreHorizontal
} from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageLayout } from '@/components/PageLayout';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { DataTableRef } from '@/components/common/DataTable/types';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { VisitorStatsCards } from './components/VisitorStatsCards';
import { ViewVisitorModal } from './components/ViewVisitorModal';
import { VisitorRegistrationForm } from './components/VisitorRegistrationForm';
import { Visitor, VisitorStats } from './types';
import { 
  VISITOR_STATUS_LABELS, 
  VISITOR_STATUS_COLORS, 
  PURPOSE_LABELS 
} from './constants';
import { mockVisitors, mockEmployees } from './mockData';
import { format } from 'date-fns';

export function VisitorManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableRef = useRef<DataTableRef>(null);

  // Check if we're in registration mode
  const mode = searchParams?.get('mode') as 'create' | 'edit' | null;
  const visitorId = searchParams?.get('id');
  const isRegistrationMode = mode === 'create' || mode === 'edit';

  // State
  const [visitors] = useState<Visitor[]>(mockVisitors);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name', 'phone', 'company', 'purpose', 'hostEmployeeName', 'expectedArrivalDate', 'status', 'checkInOut', 'registrationType', 'actions'
  ]);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string | ReactNode;
    action: () => void;
    variant?: 'default' | 'destructive';
    confirmText?: string;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Available columns for configure view
  const allColumns = [
    { id: 'name', label: 'Visitor Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'company', label: 'Company' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'hostEmployeeName', label: 'Host' },
    { id: 'expectedArrivalDate', label: 'Expected Arrival' },
    { id: 'status', label: 'Status' },
    { id: 'checkInOut', label: 'Check In/Out' },
    { id: 'registrationType', label: 'Type' },
    { id: 'actions', label: 'Actions' },
  ];

  // Calculate stats
  const stats: VisitorStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalVisitors: visitors?.length,
      checkedIn: visitors?.filter((v) => v?.status === 'checked-in').length,
      pending: visitors?.filter((v) => v?.status === 'pending').length,
      expectedToday: visitors?.filter((v) => v?.expectedArrivalDate === today).length,
    };
  }, [visitors]);

  // Filter and search visitors
  const filteredVisitors = useMemo(() => {
    let filtered = [...visitors];

    // Apply search
    if (searchQuery) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(
        (v) =>
          v?.name?.toLowerCase().includes(query) ||
          v?.email?.toLowerCase().includes(query) ||
          v?.phone?.toLowerCase().includes(query) ||
          v?.company?.toLowerCase().includes(query) ||
          v?.hostEmployeeName?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    activeFilters?.forEach((filter) => {
      if (!filter?.value) return;

      switch (filter?.filterId) {
        case 'status':
          if (Array?.isArray(filter?.value) && filter?.value?.length > 0) {
            filtered = filtered?.filter((v) => filter?.value?.includes(v?.status));
          }
          break;
        case 'purpose':
          if (Array?.isArray(filter?.value) && filter?.value?.length > 0) {
            filtered = filtered?.filter((v) => filter?.value?.includes(v?.purpose));
          }
          break;
        case 'registrationType':
          if (filter?.value) {
            filtered = filtered?.filter((v) => v?.registrationType === filter?.value);
          }
          break;
        case 'hostEmployee':
          if (Array?.isArray(filter?.value) && filter?.value?.length > 0) {
            filtered = filtered?.filter((v) => filter?.value?.includes(v?.hostEmployeeId));
          }
          break;
        case 'company':
          if (filter?.value && typeof filter?.value === 'string') {
            const query = filter?.value?.toLowerCase();
            filtered = filtered?.filter((v) => 
              v?.company?.toLowerCase().includes(query)
            );
          }
          break;
        case 'phone':
          if (filter?.value && typeof filter?.value === 'string') {
            const query = filter?.value?.toLowerCase();
            filtered = filtered?.filter((v) => 
              v?.phone?.toLowerCase().includes(query)
            );
          }
          break;
        case 'expectedDate':
          if (filter?.value) {
            const date = new Date(filter?.value).toISOString().split('T')[0];
            filtered = filtered?.filter((v) => v?.expectedArrivalDate === date);
          }
          break;
        case 'hasCheckedIn':
          if (typeof filter?.value === 'boolean') {
            filtered = filtered?.filter((v) => 
              filter?.value ? v?.checkInTime !== null : v?.checkInTime === null
            );
          }
          break;
        case 'hasCheckedOut':
          if (typeof filter?.value === 'boolean') {
            filtered = filtered?.filter((v) => 
              filter?.value ? v?.checkOutTime !== null : v?.checkOutTime === null
            );
          }
          break;
      }
    });

    return filtered;
  }, [visitors, searchQuery, activeFilters]);

  // Paginated data
  const paginatedVisitors = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredVisitors?.slice(start, end);
  }, [filteredVisitors, pageIndex, pageSize]);

  // Actions
  const handleView = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setViewModalOpen(true);
  };

  const handleEdit = (visitor: Visitor) => {
    navigate(`/visitor-management?mode=edit&id=${visitor?.id}`);
    setViewModalOpen(false);
  };

  const handleAddVisitor = () => {
    navigate('/visitor-management?mode=create');
  };

  const handleApprove = (visitor: Visitor) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Visitor',
      description: `Are you sure you want to approve ${visitor.name}? They will be allowed to check-in.`,
      confirmText: 'Approve',
      variant: 'default',
      action: () => {
        console?.log('Approve visitor:', visitor?.id);
        // API call here
      },
    });
  };

  const handleReject = (visitor: Visitor) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Visitor',
      description: `Are you sure you want to reject ${visitor.name}? This action will prevent them from checking in.`,
      confirmText: 'Reject',
      variant: 'destructive',
      action: () => {
        console?.log('Reject visitor:', visitor?.id);
        // API call here
      },
    });
  };

  const handleCheckIn = (visitor: Visitor) => {
    setConfirmDialog({
      open: true,
      title: 'Check-In Visitor',
      description: (
        <div className="space-y-2">
          <p>Confirm check-in for <strong>{visitor.name}</strong></p>
          <div className="text-xs space-y-1 bg-muted/50 p-3 rounded-md">
            <div><strong>Email:</strong> {visitor.email}</div>
            <div><strong>Phone:</strong> {visitor.phone}</div>
            {visitor.company && <div><strong>Company:</strong> {visitor.company}</div>}
            <div><strong>Purpose:</strong> {PURPOSE_LABELS[visitor.purpose]}</div>
          </div>
        </div>
      ),
      confirmText: 'Check In',
      variant: 'default',
      action: () => {
        console?.log('Check-in visitor:', visitor?.id);
        // API call here
      },
    });
  };

  const handleCheckOut = (visitor: Visitor) => {
    setConfirmDialog({
      open: true,
      title: 'Check-Out Visitor',
      description: (
        <div className="space-y-2">
          <p>Confirm check-out for <strong>{visitor.name}</strong></p>
          {visitor.checkInTime && (
            <div className="text-xs text-muted-foreground">
              Checked in at: {format(new Date(visitor.checkInTime), 'MMM dd, yyyy hh:mm a')}
            </div>
          )}
        </div>
      ),
      confirmText: 'Check Out',
      variant: 'default',
      action: () => {
        console?.log('Check-out visitor:', visitor?.id);
        // API call here
      },
    });
  };

  const handleDelete = (visitor: Visitor) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Visitor',
      description: (
        <div className="space-y-2">
          <p>Are you sure you want to delete <strong>{visitor.name}</strong>?</p>
          <p className="text-destructive text-xs">This action cannot be undone. All visitor data will be permanently removed.</p>
        </div>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
      action: () => {
        console?.log('Delete visitor:', visitor?.id);
        // API call here
      },
    });
  };

  // Table columns
  const columns: ColumnDef<Visitor>[] = [
    {
      accessorKey: 'name',
      header: 'Visitor Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row?.original?.name}</span>
          <span className="text-xs text-muted-foreground">{row?.original?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row?.original?.phone || '-',
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => row?.original?.company || '-',
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => PURPOSE_LABELS[row?.original?.purpose],
    },
    {
      accessorKey: 'hostEmployeeName',
      header: 'Host',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row?.original?.hostEmployeeName}</span>
          {row?.original?.hostDepartment && (
            <span className="text-xs text-muted-foreground">{row?.original?.hostDepartment}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'expectedArrivalDate',
      header: 'Expected Arrival',
      cell: ({ row }) => {
        try {
          const date = format(new Date(row?.original?.expectedArrivalDate), 'MMM dd, yyyy');
          return (
            <div className="flex flex-col">
              <span>{date}</span>
              <span className="text-xs text-muted-foreground">{row?.original?.expectedArrivalTime}</span>
            </div>
          );
        } catch {
          return row?.original?.expectedArrivalDate;
        }
      },
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className={VISITOR_STATUS_COLORS[row?.original?.status]}>
            {VISITOR_STATUS_LABELS[row?.original?.status]}
          </Badge>
        </div>
      ),
    },
    {
      id: 'checkInOut',
      header: 'Check In/Out',
      cell: ({ row }) => {
        const visitor = row?.original;
        const formatTime = (isoString: string | null) => {
          if (!isoString) return null;
          try {
            const date = new Date(isoString);
            return format(date, 'hh:mm a');
          } catch {
            return null;
          }
        };
        
        const checkIn = formatTime(visitor?.checkInTime);
        const checkOut = formatTime(visitor?.checkOutTime);
        
        if (!checkIn && !checkOut) return <span className="text-muted-foreground text-xs">-</span>;
        
        return (
          <div className="flex flex-col text-xs">
            {checkIn && (
              <span className="text-green-600 dark:text-green-400">
                In: {checkIn}
              </span>
            )}
            {checkOut && (
              <span className="text-orange-600 dark:text-orange-400">
                Out: {checkOut}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'registrationType',
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline">
            {row?.original?.registrationType === 'pre-registered' ? 'Pre-registered' : 'Instant'}
          </Badge>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const visitor = row?.original;
        const hasCheckedIn = visitor?.checkInTime !== null;
        const hasCheckedOut = visitor?.checkOutTime !== null;
        const canCheckIn = (visitor?.status === 'approved' || visitor?.status === 'pending') && !hasCheckedIn;
        const canCheckOut = visitor?.status === 'checked-in' && !hasCheckedOut;
        
        return (
          <div className="flex items-center justify-center gap-1">
            {/* View Details Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleView(visitor)}
              className="h-8 px-2"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            
            {/* Check-in Button - Always show, disabled if already checked in */}
            <Button 
              variant={canCheckIn ? "default" : "secondary"}
              size="sm"
              onClick={() => handleCheckIn(visitor)}
              disabled={!canCheckIn}
              className="h-8 px-2 text-xs"
            >
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              In
            </Button>
            
            {/* Check-out Button - Always show, disabled if not checked in or already checked out */}
            <Button 
              variant={canCheckOut ? "default" : "secondary"}
              size="sm"
              onClick={() => handleCheckOut(visitor)}
              disabled={!canCheckOut}
              className="h-8 px-2 text-xs"
            >
              <UserX className="h-3.5 w-3.5 mr-1" />
              Out
            </Button>
            
            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                {/* Only show Edit if not checked in */}
                {!hasCheckedIn && (
                  <DropdownMenuItem onClick={() => handleEdit(visitor)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {visitor?.status === 'pending' && (
                  <>
                    {!hasCheckedIn && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={() => handleApprove(visitor)}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReject(visitor)}>
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(visitor)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Filter columns based on visibility
  const visibleTableColumns = columns.filter(col => {
    const columnId = ('accessorKey' in col ? col.accessorKey as string : col.id) || '';
    return visibleColumns.includes(columnId);
  });

  // Filter configuration
  const filterConfig: any[] = [
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
    <>
      <PageLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">Visitor Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage visitor registrations, approvals, and check-ins
            </p>
          </div>
          {/* Stats Cards */}
          <VisitorStatsCards stats={stats} loading={loading} />

          {/* Toolbar */}
          <GenericToolbar
            showSearch
            searchPlaceholder="Search visitors by name, email, phone, or company..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showConfigureView
            allColumns={allColumns}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            showFilters
            availableFilters={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport
            onExportAll={() => console?.log('Export all')}
            onExportResults={() => console?.log('Export results')}
            showAddButton
            addButtonLabel="Register Visitor"
            onAdd={handleAddVisitor}
          />

          {/* Data Table */}
          <DataTable
            ref={tableRef}
            data={paginatedVisitors}
            columns={visibleTableColumns}
            loading={loading}
            pagination={{
              pageIndex,
              pageSize,
              totalPages: Math?.ceil(filteredVisitors?.length / pageSize),
              totalItems: filteredVisitors?.length,
              onPageChange: setPageIndex,
              onPageSizeChange: setPageSize,
            }}
            paginationVariant="default"
            fixedPagination={true}
            emptyState={{
              title: 'No visitors found',
              description: 'Get started by registering your first visitor',
              action: {
                label: 'Register Visitor',
                onClick: handleAddVisitor,
              },
            }}
          />
        </div>
      </PageLayout>

      {/* View Visitor Modal */}
      <ViewVisitorModal
        visitor={selectedVisitor}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedVisitor(null);
        }}
        onEdit={handleEdit}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </>
  );
}
