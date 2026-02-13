/**
 * Intimation Table Component
 * Displays intimation requests in a data table
 * Uses IntimationSnapshot for optimized rendering
 * Implements search, filtering, pagination with context integration
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { DataTableRef } from '@/components/common/DataTable/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreVertical, Copy, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IntimationSnapshot, IntimationStatus } from '../types/intimation.types';
import { TravelIntimationViewModal } from './TravelIntimationViewModal';
import { OtherIntimationViewModal } from './OtherIntimationViewModal';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useExpenseManagement } from '@/contexts/ExpenseManagementContext';
import { ActiveFilter } from '@/components/GenericToolbar/types';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';

interface IntimationTableProps {
  activeTab: string;
  searchQuery: string;
  activeFilters: ActiveFilter[];
  visibleColumns: string[];
}

export function IntimationTable({ 
  activeTab,
  searchQuery, 
  activeFilters, 
  visibleColumns
}: IntimationTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { searchIntimationSnapshotsMain, isLoading } = useExpenseManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [tableData, setTableData] = useState<IntimationSnapshot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedIntimation, setSelectedIntimation] = useState<IntimationSnapshot | null>(null);

  // Ref to track previous dependency values
  const prevDepsRef = useRef<{
    activeTab: string;
    activeFilters: ActiveFilter[];
    searchQuery: string;
    pageIndex: number;
    pageSize: number;
  } | null>(null);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Action handlers
  const handleViewIntimation = useCallback((intimation: IntimationSnapshot) => {
    setSelectedIntimation(intimation);
    setViewModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewModalOpen(false);
    setSelectedIntimation(null);
  }, []);

  const handleEditIntimation = useCallback(
    (intimation: IntimationSnapshot) => {
      navigate(`/expense-management/intimation/edit/${intimation.id}`);
    },
    [navigate],
  );

  const handleDeleteIntimation = useCallback(
    async (intimation: IntimationSnapshot) => {
      // TODO: Implement delete via context
      console.log('Delete intimation:', intimation.id);
      toast({
        title: 'Delete',
        description: 'Delete functionality to be implemented',
      });
    },
    [toast],
  );

  // Fetch data from API
  const fetchData = async () => {
    try {
      // Build filters with status based on active tab
      const filtersToApply = [...activeFilters];
      
      // Add status filter based on active tab
      if (activeTab !== 'all') {
        const statusMap: Record<string, string[]> = {
          draft: ['draft'],
          submitted: ['submitted', 'pending_approval'],
          approved: ['approved'],
          rejected: ['rejected'],
          acknowledged: ['acknowledged'],
          cancelled: ['cancelled'],
        };
        
        const statusValues = statusMap[activeTab];
        if (statusValues) {
          filtersToApply.push({
            id: `status-tab-${activeTab}`,
            filterId: 'status',
            operator: 'in',
            value: statusValues,
          });
        }
      }

      const searchRequest = buildUniversalSearchRequest(
        filtersToApply,
        searchQuery,
        ['type', 'firstName', 'lastName', 'email', 'description'],
      );

      const result = await searchIntimationSnapshotsMain(
        searchRequest,
        pageIndex,
        pageSize,
      );

      if (result) {
        setTableData(result.content || []);
        setTotalItems(result.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching intimation snapshots:', error);
    }
  };

  // Fetch data when filters or search change
  useEffect(() => {
    const depsChanged =
      !prevDepsRef.current ||
      prevDepsRef.current.activeTab !== activeTab ||
      JSON.stringify(prevDepsRef.current.activeFilters) !==
        JSON.stringify(activeFilters) ||
      prevDepsRef.current.searchQuery !== searchQuery ||
      prevDepsRef.current.pageIndex !== pageIndex ||
      prevDepsRef.current.pageSize !== pageSize;

    if (!depsChanged) return;

    prevDepsRef.current = {
      activeTab,
      activeFilters,
      searchQuery,
      pageIndex,
      pageSize,
    };

    fetchData();
  }, [activeTab, activeFilters, searchQuery, pageIndex, pageSize]);

  // Status badge helpers
  const getStatusBadgeVariant = (status: IntimationStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'submitted':
      case 'pending_approval':
        return 'secondary';
      case 'acknowledged':
      case 'approved':
        return 'default';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      case 'draft':
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: IntimationStatus): string => {
    const labels: Record<IntimationStatus, string> = {
      draft: 'Draft',
      submitted: 'Submitted',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      acknowledged: 'Acknowledged',
      cancelled: 'Cancelled',
    };
    return labels[status];
  };

  const getTypeLabel = (type: string): string => {
    return type === 'travel' ? 'Travel' : 'Other';
  };

  // Column definitions
  const columns = useMemo<ColumnDef<IntimationSnapshot>[]>(() => {
    const allColumns: ColumnDef<IntimationSnapshot>[] = [
      {
        id: 'employeeId',
        accessorKey: 'employeeId',
        header: 'Employee ID',
        cell: ({ row }) => (
          <div className="font-mono text-sm font-medium">{row.original.employeeId}</div>
        ),
      },
      {
        id: 'employeeName',
        header: 'Name',
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contact Info',
        cell: ({ row }) => {
          const intimation = row.original;
          const emailId = `email-${intimation.id}`;
          const phoneId = `phone-${intimation.id}`;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{intimation.email}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(intimation.email || '', emailId);
                        }}
                      >
                        {copiedField === emailId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy email</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {intimation.phone}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(intimation.phone || '', phoneId);
                        }}
                      >
                        {copiedField === phoneId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy phone</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        },
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => <div className="text-center">Type</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant={row.original.type === 'travel' ? 'default' : 'secondary'}>
              {getTypeLabel(row.original.type)}
            </Badge>
          </div>
        ),
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-md">
            <span className="text-sm line-clamp-2">{row.original.description || '-'}</span>
          </div>
        ),
      },
      {
        id: 'estimatedTotalCost',
        accessorKey: 'estimatedTotalCost',
        header: () => <div className="text-center">Est. Cost</div>,
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {row.original.totalEstimatedCost 
              ? `$${row.original.totalEstimatedCost.toFixed(2)}`
              : '-'}
          </div>
        ),
      },
      {
        id: 'submittedAt',
        accessorKey: 'submittedAt',
        header: () => <div className="text-center">Submitted Date</div>,
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {row.original.submittedAt 
              ? format(new Date(row.original.submittedAt), 'MMM dd, yyyy')
              : '-'}
          </div>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge variant={getStatusBadgeVariant(row.original.status)}>
              {getStatusLabel(row.original.status)}
            </Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const intimation = row.original;
          const canEdit = intimation.status === 'draft';
          const canDelete = intimation.status === 'draft';

          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewIntimation(intimation)}
                className="h-8 w-8 p-0"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditIntimation(intimation)}
                    disabled={!canEdit}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteIntimation(intimation)}
                    disabled={!canDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
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
    const visibleColumnsSet = new Set(visibleColumns);
    return visibleColumns.length > 0
      ? allColumns.filter(col => {
          const id = col.id;
          return id && visibleColumnsSet.has(id);
        })
      : allColumns;
  }, [visibleColumns, copiedField, copyToClipboard, handleViewIntimation, handleEditIntimation, handleDeleteIntimation]);

  return (
    <>
      <DataTable
        ref={tableRef}
        columns={columns}
        data={tableData}
        loading={isLoading}
        pagination={{
          pageIndex,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          totalItems,
          onPageChange: setPageIndex,
          onPageSizeChange: setPageSize,
        }}
        paginationVariant="default"
        fixedPagination={true}
        emptyState={{
          title: 'No intimations found',
          description: 'Try adjusting your filters or create a new intimation',
        }}
      />

      {/* View Modals */}
      {selectedIntimation?.type === 'travel' ? (
        <TravelIntimationViewModal
          intimation={selectedIntimation}
          open={viewModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEditIntimation}
        />
      ) : selectedIntimation ? (
        <OtherIntimationViewModal
          intimation={selectedIntimation}
          open={viewModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEditIntimation}
        />
      ) : null}
    </>
  );
}
