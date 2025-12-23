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

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
          if (Array?.isArray(filter?.value) && filter?.value?.length > 0) {
            filtered = filtered?.filter((v) => filter?.value?.includes(v?.registrationType));
          }
          break;
        case 'hostEmployee':
          if (Array?.isArray(filter?.value) && filter?.value?.length > 0) {
            filtered = filtered?.filter((v) => filter?.value?.includes(v?.hostEmployeeId));
          }
          break;
        case 'expectedDate':
          if (filter?.value) {
            const date = new Date(filter?.value).toISOString().split('T')[0];
            filtered = filtered?.filter((v) => v?.expectedArrivalDate === date);
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
    console?.log('Approve visitor:', visitor?.id);
    // API call here
  };

  const handleReject = (visitor: Visitor) => {
    console?.log('Reject visitor:', visitor?.id);
    // API call here
  };

  const handleCheckIn = (visitor: Visitor) => {
    console?.log('Check-in visitor:', visitor?.id);
    // API call here
  };

  const handleCheckOut = (visitor: Visitor) => {
    console?.log('Check-out visitor:', visitor?.id);
    // API call here
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
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={VISITOR_STATUS_COLORS[row?.original?.status]}>
          {VISITOR_STATUS_LABELS[row?.original?.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'registrationType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row?.original?.registrationType === 'pre-registered' ? 'Pre-registered' : 'Instant'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const visitor = row?.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(visitor)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(visitor)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {visitor?.status === 'pending' && (
                <>
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
              {visitor?.status === 'approved' && (
                <DropdownMenuItem onClick={() => handleCheckIn(visitor)}>
                  <UserCheck className="mr-2 h-4 w-4 text-blue-600" />
                  Check In
                </DropdownMenuItem>
              )}
              {visitor?.status === 'checked-in' && (
                <DropdownMenuItem onClick={() => handleCheckOut(visitor)}>
                  <UserX className="mr-2 h-4 w-4 text-gray-600" />
                  Check Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
      id: 'purpose',
      label: 'Purpose',
      type: 'multiselect',
      options: Object?.entries(PURPOSE_LABELS).map(([value, label]) => ({
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
      id: 'hostEmployee',
      label: 'Host Employee',
      type: 'multiselect',
      options: mockEmployees?.map((emp) => ({
        value: emp?.id,
        label: `${emp?.name} (${emp?.department})`,
      })),
    },
    {
      id: 'expectedDate',
      label: 'Expected Date',
      type: 'date',
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
            columns={columns}
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
      />
    </>
  );
}
