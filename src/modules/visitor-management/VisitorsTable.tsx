/**
 * Visitors Table Component
 * Displays visitors in a table with filtering, search, and pagination.
 * Handles all table-related logic, data fetching, and visitor interactions.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Eye, Edit, CheckCircle, XCircle, UserCheck, UserX,
  MoreHorizontal, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { DataTableRef } from '@/components/common/DataTable/types';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { ViewVisitorModal } from './components/ViewVisitorModal';
import { ActiveFilter } from '@/components/GenericToolbar/types';
import { Visitor } from './types';
import { 
  VISITOR_STATUS_LABELS, 
  VISITOR_STATUS_COLORS, 
  PURPOSE_LABELS 
} from './constants';
import { mockVisitors } from './mockData';
import { format } from 'date-fns';
import { ReactNode } from 'react';

type Props = {
  searchQuery: string;
  activeFilters: ActiveFilter[];
  visibleColumns: string[];
  refreshTrigger?: number;
};

export function VisitorsTable({
  searchQuery,
  activeFilters,
  visibleColumns,
  refreshTrigger = 0,
}: Props) {
  const navigate = useNavigate();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [tableData, setTableData] = useState<Visitor[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

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

  // Ref to track previous dependency values to detect actual changes
  const prevDepsRef = useRef<{
    activeFilters: ActiveFilter[];
    searchQuery: string;
    pageIndex: number;
    pageSize: number;
    refreshTrigger: number;
  } | null>(null);

  // Copy to clipboard handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now using mock data with filtering
      let filtered = [...mockVisitors];

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.name.toLowerCase().includes(query) ||
            v.email.toLowerCase().includes(query) ||
            v.phone.toLowerCase().includes(query) ||
            v.company?.toLowerCase().includes(query) ||
            v.hostEmployeeName.toLowerCase().includes(query)
        );
      }

      // Apply filters
      activeFilters.forEach((filter) => {
        if (!filter.value) return;

        switch (filter.filterId) {
          case 'status':
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              filtered = filtered.filter((v) => filter.value.includes(v.status));
            }
            break;
          case 'purpose':
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              filtered = filtered.filter((v) => filter.value.includes(v.purpose));
            }
            break;
          case 'registrationType':
            if (filter.value) {
              filtered = filtered.filter((v) => v.registrationType === filter.value);
            }
            break;
          case 'hostEmployee':
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              filtered = filtered.filter((v) => filter.value.includes(v.hostEmployeeId));
            }
            break;
          case 'company':
            if (filter.value && typeof filter.value === 'string') {
              const query = filter.value.toLowerCase();
              filtered = filtered.filter((v) => 
                v.company?.toLowerCase().includes(query)
              );
            }
            break;
          case 'phone':
            if (filter.value && typeof filter.value === 'string') {
              const query = filter.value.toLowerCase();
              filtered = filtered.filter((v) => 
                v.phone.toLowerCase().includes(query)
              );
            }
            break;
          case 'expectedDate':
            if (filter.value) {
              const date = new Date(filter.value).toISOString().split('T')[0];
              filtered = filtered.filter((v) => v.expectedArrivalDate === date);
            }
            break;
          case 'checkInDate':
            if (filter.value) {
              const date = new Date(filter.value).toISOString().split('T')[0];
              filtered = filtered.filter((v) => {
                if (!v.checkInTime) return false;
                const checkInDate = new Date(v.checkInTime).toISOString().split('T')[0];
                return checkInDate === date;
              });
            }
            break;
          case 'checkOutDate':
            if (filter.value) {
              const date = new Date(filter.value).toISOString().split('T')[0];
              filtered = filtered.filter((v) => {
                if (!v.checkOutTime) return false;
                const checkOutDate = new Date(v.checkOutTime).toISOString().split('T')[0];
                return checkOutDate === date;
              });
            }
            break;
          case 'hasCheckedIn':
            if (typeof filter.value === 'boolean') {
              filtered = filtered.filter((v) => 
                filter.value ? v.checkInTime !== null : v.checkInTime === null
              );
            }
            break;
          case 'hasCheckedOut':
            if (typeof filter.value === 'boolean') {
              filtered = filtered.filter((v) => 
                filter.value ? v.checkOutTime !== null : v.checkOutTime === null
              );
            }
            break;
        }
      });

      // Set total items
      setTotalItems(filtered.length);

      // Apply pagination
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      const paginatedData = filtered.slice(start, end);

      setTableData(paginatedData);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data from API when filters or search change
  useEffect(() => {
    // Check if dependencies have actually changed
    const depsChanged =
      !prevDepsRef.current ||
      JSON.stringify(prevDepsRef.current.activeFilters) !==
        JSON.stringify(activeFilters) ||
      prevDepsRef.current.searchQuery !== searchQuery ||
      prevDepsRef.current.pageIndex !== pageIndex ||
      prevDepsRef.current.pageSize !== pageSize ||
      prevDepsRef.current.refreshTrigger !== refreshTrigger;

    if (!depsChanged) return;

    // Update the ref with current values
    prevDepsRef.current = {
      activeFilters,
      searchQuery,
      pageIndex,
      pageSize,
      refreshTrigger,
    };

    fetchData();
  }, [
    activeFilters,
    searchQuery,
    pageIndex,
    pageSize,
    refreshTrigger,
  ]);

  // Actions
  const handleView = useCallback((visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((visitor: Visitor) => {
    navigate(`/visitor-management?mode=edit&id=${visitor.id}`);
    setViewModalOpen(false);
  }, [navigate]);

  const handleApprove = useCallback((visitor: Visitor) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Visitor',
      description: `Are you sure you want to approve ${visitor.name}? They will be allowed to check-in.`,
      confirmText: 'Approve',
      variant: 'default',
      action: () => {
        console.log('Approve visitor:', visitor.id);
        // API call here
        fetchData();
      },
    });
  }, []);

  const handleReject = useCallback((visitor: Visitor) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Visitor',
      description: `Are you sure you want to reject ${visitor.name}? This action will prevent them from checking in.`,
      confirmText: 'Reject',
      variant: 'destructive',
      action: () => {
        console.log('Reject visitor:', visitor.id);
        // API call here
        fetchData();
      },
    });
  }, []);

  const handleCheckIn = useCallback((visitor: Visitor) => {
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
        console.log('Check-in visitor:', visitor.id);
        // API call here
        fetchData();
      },
    });
  }, []);

  const handleCheckOut = useCallback((visitor: Visitor) => {
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
        console.log('Check-out visitor:', visitor.id);
        // API call here
        fetchData();
      },
    });
  }, []);

  const handleDelete = useCallback((visitor: Visitor) => {
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
        console.log('Delete visitor:', visitor.id);
        // API call here
        fetchData();
      },
    });
  }, []);

  // Define table columns - memoized to prevent unnecessary re-renders
  const columns: ColumnDef<Visitor>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Visitor Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: 'contactInfo',
        header: 'Contact Info',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{row.original.email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleCopy(row.original.email)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">{row.original.phone}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleCopy(row.original.phone)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => row.original.company || '-',
      },
      {
        accessorKey: 'purpose',
        header: 'Purpose',
        cell: ({ row }) => PURPOSE_LABELS[row.original.purpose],
      },
      {
        accessorKey: 'hostEmployeeName',
        header: 'Host',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.hostEmployeeName}</span>
            {row.original.hostDepartment && (
              <span className="text-xs text-muted-foreground">{row.original.hostDepartment}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'expectedArrivalDate',
        header: 'Expected Arrival',
        cell: ({ row }) => {
          try {
            const date = format(new Date(row.original.expectedArrivalDate), 'MMM dd, yyyy');
            return (
              <div className="flex flex-col">
                <span>{date}</span>
                <span className="text-xs text-muted-foreground">{row.original.expectedArrivalTime}</span>
              </div>
            );
          } catch {
            return row.original.expectedArrivalDate;
          }
        },
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge className={VISITOR_STATUS_COLORS[row.original.status]}>
              {VISITOR_STATUS_LABELS[row.original.status]}
            </Badge>
          </div>
        ),
      },
      {
        id: 'checkInOut',
        header: 'Check In/Out',
        cell: ({ row }) => {
          const visitor = row.original;
          const formatTime = (isoString: string | null) => {
            if (!isoString) return null;
            try {
              const date = new Date(isoString);
              return format(date, 'hh:mm a');
            } catch {
              return null;
            }
          };
          
          const checkIn = formatTime(visitor.checkInTime);
          const checkOut = formatTime(visitor.checkOutTime);
          
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
              {row.original.registrationType === 'pre-registered' ? 'Pre-registered' : 'Instant'}
            </Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const visitor = row.original;
          const hasCheckedIn = visitor.checkInTime !== null;
          const hasCheckedOut = visitor.checkOutTime !== null;
          const canCheckIn = (visitor.status === 'approved' || visitor.status === 'pending') && !hasCheckedIn;
          const canCheckOut = visitor.status === 'checked-in' && !hasCheckedOut;
          
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
              
              {/* Check-in Button */}
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
              
              {/* Check-out Button */}
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
                  {/* Only show Edit if not checked in */}
                  {!hasCheckedIn && (
                    <DropdownMenuItem onClick={() => handleEdit(visitor)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {visitor.status === 'pending' && (
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
                  {((!hasCheckedIn) || (visitor.status === 'pending')) && <DropdownMenuSeparator />}
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
    ],
    [handleView, handleEdit, handleApprove, handleReject, handleCheckIn, handleCheckOut, handleDelete, handleCopy]
  );

  // Filter columns based on visibility
  const visibleTableColumns = columns.filter(col => {
    const columnId = ('accessorKey' in col ? col.accessorKey as string : col.id) || '';
    return visibleColumns.includes(columnId);
  });

  return (
    <>
      {/* Data Table */}
      <DataTable
        ref={tableRef}
        data={tableData}
        columns={visibleTableColumns}
        loading={loading}
        pagination={{
          pageIndex,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          totalItems: totalItems,
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
            onClick: () => navigate('/visitor-management?mode=create'),
          },
        }}
      />

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
