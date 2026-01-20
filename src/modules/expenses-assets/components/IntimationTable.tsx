/**
 * Intimation Table Component
 * DataTable for displaying intimation requests with actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Intimation, IntimationStatus } from '../types/intimation.types';
import { TravelIntimationViewModal } from './TravelIntimationViewModal';
import { OtherIntimationViewModal } from './OtherIntimationViewModal';
import { format } from 'date-fns';

interface IntimationTableProps {
  data: Intimation[];
  loading?: boolean;
  visibleColumns?: string[];
}

export function IntimationTable({ data, loading = false, visibleColumns = [] }: IntimationTableProps) {
  const navigate = useNavigate();
  const [selectedIntimation, setSelectedIntimation] = useState<Intimation | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const getStatusBadgeVariant = (status: IntimationStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'submitted':
        return 'secondary';
      case 'acknowledged':
        return 'default';
      case 'cancelled':
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
      acknowledged: 'Acknowledged',
      cancelled: 'Cancelled',
    };
    return labels[status];
  };

  const getTypeLabel = (type: string): string => {
    return type === 'travel' ? 'Travel' : 'Other';
  };

  const getJourneySummary = (intimation: Intimation): string => {
    if (intimation.type !== 'travel' || !intimation.journeySegments) {
      return '-';
    }
    const segments = intimation.journeySegments;
    if (segments.length === 0) return '-';
    if (segments.length === 1) {
      return `${segments[0].from} → ${segments[0].to}`;
    }
    return `${segments[0].from} → ... → ${segments[segments.length - 1].to} (${segments.length} segments)`;
  };

  const handleView = (intimation: Intimation) => {
    setSelectedIntimation(intimation);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedIntimation(null);
  };

  const handleEdit = (intimation: Intimation) => {
    navigate(`/expense-management/intimation/edit/${intimation.id}`);
  };

  const handleDelete = (intimation: Intimation) => {
    console.log('Delete intimation:', intimation.id);
    // TODO: Implement delete confirmation
  };

  const columns: ColumnDef<Intimation>[] = [
    {
      accessorKey: 'intimationNumber',
      header: 'Intimation #',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.intimationNumber}</span>
      ),
    },
    {
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
      accessorKey: 'journey',
      header: 'Journey/Description',
      cell: ({ row }) => {
        if (row.original.type === 'travel') {
          return (
            <div className="max-w-md">
              <span className="text-sm">{getJourneySummary(row.original)}</span>
            </div>
          );
        }
        return (
          <div className="max-w-md">
            <span className="text-sm text-muted-foreground line-clamp-2">
              {row.original.description}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'estimatedTotalCost',
      header: () => <div className="text-center">Est. Cost</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.estimatedTotalCost 
            ? `$${row.original.estimatedTotalCost.toFixed(2)}`
            : '-'}
        </div>
      ),
    },
    {
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
              onClick={() => handleView(intimation)}
              className="h-8 w-8 p-0"
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
                  onClick={() => handleEdit(intimation)}
                  disabled={!canEdit}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(intimation)}
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
  const filteredColumns = visibleColumns.length > 0
    ? columns.filter(col => {
        const id = 'accessorKey' in col ? col.accessorKey as string : col.id;
        return id && visibleColumnsSet.has(id);
      })
    : columns;

  const table = useReactTable({
    data,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No intimations found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View Modals */}
      {selectedIntimation?.type === 'travel' ? (
        <TravelIntimationViewModal
          intimation={selectedIntimation}
          open={viewModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEdit}
        />
      ) : (
        <OtherIntimationViewModal
          intimation={selectedIntimation}
          open={viewModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
