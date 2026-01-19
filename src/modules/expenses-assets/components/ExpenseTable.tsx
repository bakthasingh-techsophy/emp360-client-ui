/**
 * Expense Table Component
 * Displays expense/advance requests in a data table
 */

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Copy } from 'lucide-react';
import { Expense } from '../types/expense.types';
import { EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS } from '../constants/expense.constants';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ExpenseViewModal } from './ExpenseViewModal';
import { useState } from 'react';

interface ExpenseTableProps {
  data: Expense[];
  loading?: boolean;
  visibleColumns?: string[];
}

export function ExpenseTable({ data, loading = false, visibleColumns }: ExpenseTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
      duration: 2000,
    });
  };

  const columns: ColumnDef<Expense>[] = [
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
      accessorKey: 'employeeName',
      header: 'Name',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium">{row.original.employeeName}</div>
          <div className="text-xs text-muted-foreground">{row.original.department}</div>
        </div>
      ),
    },
    {
      id: 'employeeEmail',
      accessorKey: 'employeeEmail',
      header: 'Contact Info',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs truncate max-w-[160px]">{row.original.employeeEmail}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 p-0 hover:bg-accent shrink-0"
              onClick={() => copyToClipboard(row.original.employeeEmail, 'Email')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{row.original.employeePhone}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 p-0 hover:bg-accent shrink-0"
              onClick={() => copyToClipboard(row.original.employeePhone, 'Phone')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ),
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
            {row.original.lineItems.length} {row.original.lineItems.length === 1 ? 'item' : 'items'}
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
        const colorClass = EXPENSE_STATUS_COLORS[row.original.status];
        return (
          <Badge className={colorClass}>
            {EXPENSE_STATUS_LABELS[row.original.status]}
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
                  onClick={() => navigate(`/expense-management/edit/${expense.id}`)}
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
  ];

  // Filter columns based on visibility
  const visibleColumnsData = visibleColumns 
    ? columns.filter(col => col.id && visibleColumns.includes(col.id))
    : columns;

  return (
    <>
      <DataTable
        data={data}
        columns={visibleColumnsData}
        loading={loading}
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
          navigate(`/expense-management/edit/${expense.id}`);
        }}
        onApprove={(expense) => {
          console.log('Approve', expense.id);
          setViewModalOpen(false);
          toast({
            title: 'Approved',
            description: `Expense ${expense.expenseNumber} has been approved`,
          });
        }}
        onReject={(expense) => {
          console.log('Reject', expense.id);
          setViewModalOpen(false);
          toast({
            title: 'Rejected',
            description: `Expense ${expense.expenseNumber} has been rejected`,
          });
        }}
      />
    </>
  );
}
