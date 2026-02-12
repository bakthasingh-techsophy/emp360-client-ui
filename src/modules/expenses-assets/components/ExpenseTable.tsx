/**
 * Expense Table Component
 * Displays expense/advance requests in a data table
 * Uses ExpenseSnapshot for optimized rendering
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
import { ExpenseSnapshot } from '../types/expense.types';
import { EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS } from '../constants/expense.constants';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ExpenseViewModal } from './ExpenseViewModal';
import { useExpenseManagement } from '@/contexts/ExpenseManagementContext';
import { ActiveFilter } from '@/components/GenericToolbar/types';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';

interface ExpenseTableProps {
  searchQuery: string;
  activeFilters: ActiveFilter[];
  visibleColumns: string[];
  refreshTrigger?: number;
}

export function ExpenseTable({ 
  searchQuery, 
  activeFilters, 
  visibleColumns,
  refreshTrigger = 0 
}: ExpenseTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { searchExpenseSnapshots, isLoading } = useExpenseManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [tableData, setTableData] = useState<ExpenseSnapshot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseSnapshot | null>(null);

  // Ref to track previous dependency values
  const prevDepsRef = useRef<{
    activeFilters: ActiveFilter[];
    searchQuery: string;
    pageIndex: number;
    pageSize: number;
    refreshTrigger: number;
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
  const handleViewExpense = useCallback((expense: ExpenseSnapshot) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  }, []);

  const handleEditExpense = useCallback(
    (expense: ExpenseSnapshot) => {
      navigate(`/expense-management/expense?mode=edit&id=${expense.id}`);
    },
    [navigate],
  );

  // Fetch data from API
  const fetchData = async () => {
    try {
      const searchRequest = buildUniversalSearchRequest(
        activeFilters,
        searchQuery,
        ['description', 'type', 'firstName', 'lastName', 'email', 'employeeId'],
      );

      const result = await searchExpenseSnapshots(
        searchRequest,
        pageIndex,
        pageSize,
      );

      if (result) {
        setTableData(result.content || []);
        setTotalItems(result.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching expense snapshots:', error);
    }
  };

  // Fetch data when filters or search change
  useEffect(() => {
    const depsChanged =
      !prevDepsRef.current ||
      JSON.stringify(prevDepsRef.current.activeFilters) !==
        JSON.stringify(activeFilters) ||
      prevDepsRef.current.searchQuery !== searchQuery ||
      prevDepsRef.current.pageIndex !== pageIndex ||
      prevDepsRef.current.pageSize !== pageSize ||
      prevDepsRef.current.refreshTrigger !== refreshTrigger;

    if (!depsChanged) return;

    prevDepsRef.current = {
      activeFilters,
      searchQuery,
      pageIndex,
      pageSize,
      refreshTrigger,
    };

    fetchData();
  }, [activeFilters, searchQuery, pageIndex, pageSize, refreshTrigger]);

  // Initial load on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Define table columns - memoized to prevent unnecessary re-renders
  const columns: ColumnDef<ExpenseSnapshot>[] = useMemo(
    () => [
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
          <div className="text-xs text-muted-foreground">{row.original.department}</div>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact Info',
      cell: ({ row }) => {
        const expense = row.original;
        const emailId = `email-${expense.id}`;
        const phoneId = `phone-${expense.id}`;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">{expense.email}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(expense.email, emailId);
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
                {expense.phone}
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
                        copyToClipboard(expense.phone, phoneId);
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
      id: 'description',
      accessorKey: 'description',
      header: 'Request Details',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium">{row.original.type === 'advance' ? 'Advance Request' : 'Expense Claim'}</div>
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 truncate">
            {row.original.description}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {row.original.lineItemCount} {row.original.lineItemCount === 1 ? 'item' : 'items'}
          </div>
        </div>
      ),
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: () => <div className="text-center">Amount</div>,
      cell: ({ row }) => (
        <div className="text-center font-semibold">
          ${row.original.amount.toLocaleString()}
        </div>
      ),
    },
    {
      id: 'paidAt',
      accessorKey: 'paidAt',
      header: () => <div className="text-center">Paid At</div>,
      cell: ({ row }) => {
        if (!row.original.paidAt) {
          return <div className="text-center text-xs text-muted-foreground">-</div>;
        }
        return (
          <div className="text-center text-sm">
            {format(new Date(row.original.paidAt), 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => <div className="text-center">Claimed Date</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status as keyof typeof EXPENSE_STATUS_COLORS;
        const colorClass = EXPENSE_STATUS_COLORS[status];
        return (
          <Badge className={colorClass}>
            {EXPENSE_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const expense = row.original;
        const isPending = expense.status === 'pending';
        const isDraft = expense.status === 'draft';

        return (
          <div className="flex items-center justify-center gap-2">
            {/* View icon - always enabled */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => {
                setSelectedExpense(expense);
                setViewModalOpen(true);
              }}
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Take Action button - always visible, disabled when not pending */}
            <Button
              size="sm"
              variant="default"
              disabled={!isPending}
              onClick={() => navigate(`/expense-management/approve/${expense.id}`)}
            >
              Take Action
            </Button>

            {/* More actions dropdown - always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={!(isDraft || isPending)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/expense-management/expense?mode=edit&id=${expense.id}`)}
                  disabled={!isDraft}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => console.log('Delete', expense.id)}
                  className="text-red-600"
                  disabled={!(isDraft || isPending)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
    ],
    [copyToClipboard, copiedField, handleViewExpense, handleEditExpense, navigate],
  );

  // Filter columns based on visibleColumns prop
  const filteredColumns = useMemo(
    () =>
      columns.filter((column: any) => {
        // Always include action columns
        if (column.id === 'actions') {
          return true;
        }
        // For other columns, check if id is in visibleColumns
        if (column.id) {
          return visibleColumns.includes(column.id);
        }
        return true;
      }),
    [columns, visibleColumns],
  );

  return (
    <>
      <DataTable
        ref={tableRef}
        data={tableData}
        columns={filteredColumns}
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
          title: 'No expenses found',
          description: 'Try adjusting your filters or create a new expense',
        }}
      />
      
      <ExpenseViewModal
        expense={selectedExpense}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedExpense(null);
        }}
        onEdit={(expense) => {
          setViewModalOpen(false);
          navigate(`/expense-management/expense?mode=edit&id=${expense.id}`);
        }}
        onApprove={(expense) => {
          console.log('Approve', expense.id);
          setViewModalOpen(false);
          toast({
            title: 'Approved',
            description: `Expense ${expense.id} has been approved`,
          });
        }}
        onReject={(expense) => {
          console.log('Reject', expense.id);
          setViewModalOpen(false);
          toast({
            title: 'Rejected',
            description: `Expense ${expense.id} has been rejected`,
          });
        }}
      />
    </>
  );
}
