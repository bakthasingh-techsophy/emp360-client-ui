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
  MoreHorizontal, Copy, User, Mail, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { ActiveFilter, CurrentSort } from '@/components/GenericToolbar/types';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';
import { SortMap } from '@/types/search';
import { useVisitorManagement } from '@/contexts/VisitorManagementContext';
import { useLayoutContext } from '@/contexts/LayoutContext';
import { useToast } from '@/hooks/use-toast';
import { VisitorSnapshot } from './types';
import { 
  VISITOR_STATUS_LABELS, 
  VISITOR_STATUS_COLORS, 
  PURPOSE_LABELS 
} from './constants';
import { format } from 'date-fns';
import { ReactNode } from 'react';

type Props = {
  searchQuery: string;
  activeFilters: ActiveFilter[];
  visibleColumns: string[];
  refreshTrigger?: number;
  currentSort?: CurrentSort | null;
};

export function VisitorsTable({
  searchQuery,
  activeFilters,
  visibleColumns,
  refreshTrigger = 0,
  currentSort = null,
}: Props) {
  const navigate = useNavigate();
  const { refreshVisitors, updateVisitor, deleteVisitorById, isLoading } = useVisitorManagement();
  const { selectedCompanyScope } = useLayoutContext();
  const { toast } = useToast();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [tableData, setTableData] = useState<VisitorSnapshot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorSnapshot | null>(null);
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
    currentSort: CurrentSort | null | undefined;
    selectedCompanyScope: string | null | undefined;
  } | null>(null);

  // Copy to clipboard handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Fetch data function - memoized to prevent unnecessary recreations
  const fetchData = useCallback(async () => {
    try {
      // Build sort map from currentSort
      const sortMap: SortMap | undefined = currentSort
        ? { [currentSort.field]: currentSort.direction }
        : undefined;

      // Build universal search request from filters and search query
      const searchRequest = buildUniversalSearchRequest(
        activeFilters,
        searchQuery,
        [
          "visitorName",
          "visitorEmail",
          "visitorPhone",
          "companyId",
          "purpose",
          "firstName",
          "lastName",
          "employeeId",
          "notes",
        ],
        sortMap
      );

      const result = await refreshVisitors(
        searchRequest,
        pageIndex,
        pageSize,
      );

      if (result) {
        // Backend search endpoint returns VisitorSnapshot[] directly
        setTableData(result.content || []);
        setTotalItems(result.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  }, [activeFilters, searchQuery, pageIndex, pageSize, refreshTrigger, currentSort, refreshVisitors]);

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
      prevDepsRef.current.refreshTrigger !== refreshTrigger ||
      JSON.stringify(prevDepsRef.current.currentSort) !==
        JSON.stringify(currentSort) ||
      prevDepsRef.current.selectedCompanyScope !== selectedCompanyScope;

    if (!depsChanged) return;

    // Update the ref with current values
      prevDepsRef.current = {
        activeFilters,
        searchQuery,
        pageIndex,
        pageSize,
        refreshTrigger,
        currentSort,
        selectedCompanyScope,
      };    fetchData();
  }, [
    activeFilters,
    searchQuery,
    pageIndex,
    pageSize,
    refreshTrigger,
    selectedCompanyScope,
  ]);

  // Actions
  const handleView = useCallback((visitor: VisitorSnapshot) => {
    setSelectedVisitor(visitor);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((visitor: VisitorSnapshot) => {
    navigate(`/visitor-management?mode=edit&id=${visitor.id}`);
    setViewModalOpen(false);
  }, [navigate]);

  const handleApprove = useCallback((visitor: VisitorSnapshot) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Visitor',
      description: `Are you sure you want to approve ${visitor.visitorName}? They will be allowed to check-in.`,
      confirmText: 'Approve',
      variant: 'default',
      action: async () => {
        try {
          // Update status - all values sent to API are strings/primitives
          await updateVisitor(visitor.id, { visitorStatus: 'approved' });
          // Always refresh data after update attempt
          await fetchData();
        } catch (error) {
          console.error('Error approving visitor:', error);
        }
      },
    });
  }, [updateVisitor, fetchData]);

  const handleReject = useCallback((visitor: VisitorSnapshot) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Visitor',
      description: `Are you sure you want to reject ${visitor.visitorName}? This action will prevent them from checking in.`,
      confirmText: 'Reject',
      variant: 'destructive',
      action: async () => {
        try {
          // Update status - all values sent to API are strings/primitives
          await updateVisitor(visitor.id, { visitorStatus: 'rejected' });
          // Always refresh data after update attempt
          await fetchData();
        } catch (error) {
          console.error('Error rejecting visitor:', error);
        }
      },
    });
  }, [updateVisitor, fetchData]);

  const handleCheckIn = useCallback((visitor: VisitorSnapshot) => {
    setConfirmDialog({
      open: true,
      title: 'Check-In Visitor',
      description: (
        <div className="space-y-2">
          <p>Confirm check-in for <strong>{visitor.visitorName}</strong></p>
          <div className="text-xs space-y-1 bg-muted/50 p-3 rounded-md">
            <div><strong>Email:</strong> {visitor.visitorEmail}</div>
            <div><strong>Phone:</strong> {visitor.visitorPhone}</div>
            {visitor.companyId && <div><strong>Company:</strong> {visitor.companyId}</div>}
            <div><strong>Purpose:</strong> {PURPOSE_LABELS[visitor.purpose]}</div>
          </div>
        </div>
      ),
      confirmText: 'Check In',
      variant: 'default',
      action: async () => {
        try {
          // Send ISO timestamp string to API (e.g., "2024-01-15T10:30:00.000Z")
          await updateVisitor(visitor.id, {
            visitorStatus: 'checked-in',
            checkInTime: new Date().toISOString(), // ISO string, not Date object
          });
          // Always refresh data after update attempt
          await fetchData();
        } catch (error) {
          console.error('Error checking in visitor:', error);
        }
      },
    });
  }, [updateVisitor, fetchData]);

  const handleCheckOut = useCallback((visitor: VisitorSnapshot) => {
    setConfirmDialog({
      open: true,
      title: 'Check-Out Visitor',
      description: (
        <div className="space-y-2">
          <p>Confirm check-out for <strong>{visitor.visitorName}</strong></p>
          {visitor.checkInTime && (
            <div className="text-xs text-muted-foreground">
              Checked in at: {format(new Date(visitor.checkInTime), 'MMM dd, yyyy hh:mm a')}
            </div>
          )}
        </div>
      ),
      confirmText: 'Check Out',
      variant: 'default',
      action: async () => {
        try {
          // Send ISO timestamp string to API (e.g., "2024-01-15T10:30:00.000Z")
          await updateVisitor(visitor.id, {
            visitorStatus: 'checked-out',
            checkOutTime: new Date().toISOString(), // ISO string, not Date object
          });
          // Always refresh data after update attempt
          await fetchData();
        } catch (error) {
          console.error('Error checking out visitor:', error);
        }
      },
    });
  }, [updateVisitor, fetchData]);

  const handleDelete = useCallback((visitor: VisitorSnapshot) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Visitor',
      description: (
        <div className="space-y-2">
          <p>Are you sure you want to delete <strong>{visitor.visitorName}</strong>?</p>
          <p className="text-destructive text-xs">This action cannot be undone. All visitor data will be permanently removed.</p>
        </div>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
      action: async () => {
        try {
          await deleteVisitorById(visitor.id);
          // Always refresh data after delete attempt
          await fetchData();
        } catch (error) {
          console.error('Error deleting visitor:', error);
        }
      },
    });
  }, [deleteVisitorById, fetchData]);

  // Define table columns - memoized to prevent unnecessary re-renders
  const columns: ColumnDef<VisitorSnapshot>[] = useMemo(
    () => [
      {
        accessorKey: 'visitorName',
        header: 'Visitor Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.photoUrl ?? undefined} alt={row.original.visitorName} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{row.original.visitorName}</span>
              <div className="flex items-center gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground font-mono max-w-[120px] truncate cursor-help">
                        ID: {row.original.id}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-mono">{row.original.id}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => handleCopy(row.original.id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'contactInfo',
        header: 'Contact Info',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{row.original.visitorEmail}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleCopy(row.original.visitorEmail)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">{row.original.visitorPhone}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleCopy(row.original.visitorPhone)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'companyId',
        header: 'Company',
        cell: ({ row }) => row.original.companyId || '-',
      },
      {
        accessorKey: 'purpose',
        header: 'Purpose',
        cell: ({ row }) => {
          const notes = row.original.notes;
          const hasNotes = notes && notes.trim().length > 0;
          
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm">{PURPOSE_LABELS[row.original.purpose]}</span>
              {hasNotes && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground line-clamp-1 cursor-help">
                        {notes}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs whitespace-pre-wrap">{notes}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'firstName',
        header: 'Host',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
            {row.original.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate cursor-pointer hover:text-foreground" 
                  onClick={() => {
                    navigator.clipboard.writeText(row.original.email);
                    toast({
                      description: 'Email copied to clipboard',
                      duration: 2000,
                    });
                  }}
                  title={row.original.email}>
                  {row.original.email}
                </span>
              </div>
            )}
            {row.original.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(row.original.phone);
                    toast({
                      description: 'Phone copied to clipboard',
                      duration: 2000,
                    });
                  }}
                  title={row.original.phone}>
                  {row.original.phone}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'expectedArrivalDateTime',
        header: 'Expected Arrival',
        cell: ({ row }) => {
          try {
            const dateTime = new Date(row.original.expectedArrivalDateTime);
            const date = format(dateTime, 'MMM dd, yyyy');
            const time = format(dateTime, 'hh:mm a');
            return (
              <div className="flex flex-col">
                <span>{date}</span>
                <span className="text-xs text-muted-foreground">{time}</span>
              </div>
            );
          } catch {
            return row.original.expectedArrivalDateTime;
          }
        },
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge className={VISITOR_STATUS_COLORS[row.original.visitorStatus]}>
              {VISITOR_STATUS_LABELS[row.original.visitorStatus]}
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
            <div className="flex flex-col gap-1">
              {checkIn && (
                <Badge variant="outline" className="text-xs justify-center bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                  In: {checkIn}
                </Badge>
              )}
              {checkOut && (
                <Badge variant="outline" className="text-xs justify-center bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                  Out: {checkOut}
                </Badge>
              )}
            </div>
          );
        },
      },
      {

        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const visitor = row.original;
          const hasCheckedIn = visitor.checkInTime !== null;
          const hasCheckedOut = visitor.checkOutTime !== null;
          const canCheckIn = (visitor.visitorStatus === 'approved' || visitor.visitorStatus === 'pending') && !hasCheckedIn;
          const canCheckOut = visitor.visitorStatus === 'checked-in' && !hasCheckedOut;
          
          return (
            <div className="flex items-center justify-center gap-1">
              {/* View Details Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleView(visitor)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              
              {/* Check-in Button */}
              <Button 
                variant={canCheckIn ? "default" : "secondary"}
                size="sm"
                onClick={() => handleCheckIn(visitor)}
                disabled={!canCheckIn || hasCheckedIn}
                className="h-8 w-[90px] text-xs px-2"
              >
                {hasCheckedIn ? (
                  <span className="whitespace-nowrap truncate">
                    {visitor.checkInTime ? format(new Date(visitor.checkInTime), 'hh:mm a') : 'Checked In'}
                  </span>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    Check In
                  </>
                )}
              </Button>
              
              {/* Check-out Button */}
              <Button 
                variant={canCheckOut ? "default" : "secondary"}
                size="sm"
                onClick={() => handleCheckOut(visitor)}
                disabled={!canCheckOut || hasCheckedOut}
                className="h-8 w-[90px] text-xs px-2"
              >
                {hasCheckedOut ? (
                  <span className="whitespace-nowrap truncate">
                    {visitor.checkOutTime ? format(new Date(visitor.checkOutTime), 'hh:mm a') : 'Checked Out'}
                  </span>
                ) : (
                  <>
                    <UserX className="h-3.5 w-3.5 mr-1" />
                    Check Out
                  </>
                )}
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
                  {visitor.visitorStatus === 'pending' && (
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
                  {((!hasCheckedIn) || (visitor.visitorStatus === 'pending')) && <DropdownMenuSeparator />}
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
        loading={isLoading}
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
