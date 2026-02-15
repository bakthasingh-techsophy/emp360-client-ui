/**
 * Assets Table Component
 * Displays assets in a table with filtering, search, and pagination
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Eye, Edit, Trash2, Package, User, MoreHorizontal 
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
import { ActiveFilter, CurrentSort } from '@/components/GenericToolbar/types';
import { useToast } from '@/hooks/use-toast';
import { AssetSnapshot } from '../types';
import { ASSET_STATUS_OPTIONS } from '../constants';
import { mockAssets } from '../mockData';
import { format } from 'date-fns';
import { ReactNode } from 'react';

type Props = {
  searchQuery: string;
  activeFilters: ActiveFilter[];
  visibleColumns: string[];
  refreshTrigger?: number;
  currentSort?: CurrentSort | null;
};

export function AssetsTable({
  searchQuery,
  activeFilters,
  visibleColumns,
  currentSort = null,
}: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const tableRef = useRef<DataTableRef>(null);

  // Table state - using mock data for now
  const [tableData, setTableData] = useState<AssetSnapshot[]>(mockAssets);
  const [totalItems, setTotalItems] = useState(mockAssets.length);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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

  // Filter and search data (client-side for now with mock data)
  const filteredData = useMemo(() => {
    let data = [...mockAssets];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(asset =>
        asset.assetName.toLowerCase().includes(query) ||
        asset.assetCode.toLowerCase().includes(query) ||
        asset.serialNumber?.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    activeFilters.forEach(filter => {
      if (filter.id === 'status' && filter.value) {
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
        data = data.filter(asset => values.includes(asset.status));
      }
      if (filter.id === 'category' && filter.value) {
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
        data = data.filter(asset => values.includes(asset.category));
      }
    });

    // Apply sorting
    if (currentSort) {
      data.sort((a, b) => {
        const aVal = a[currentSort.field as keyof AssetSnapshot];
        const bVal = b[currentSort.field as keyof AssetSnapshot];
        
        if (aVal === undefined || bVal === undefined) return 0;
        if (aVal === bVal) return 0;
        const comparison = aVal > bVal ? 1 : -1;
        return currentSort.direction === 1 ? comparison : -comparison;
      });
    }

    return data;
  }, [mockAssets, searchQuery, activeFilters, currentSort]);

  // Update table data when filter/search changes
  useEffect(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    setTableData(filteredData.slice(start, end));
    setTotalItems(filteredData.length);
  }, [filteredData, pageIndex, pageSize]);

  // Actions
  const handleView = useCallback((asset: AssetSnapshot) => {
    navigate(`/asset-management?mode=view&id=${asset.id}`);
  }, [navigate]);

  const handleEdit = useCallback((asset: AssetSnapshot) => {
    navigate(`/asset-management?mode=edit&id=${asset.id}`);
  }, [navigate]);

  const handleDelete = useCallback((asset: AssetSnapshot) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Asset',
      description: (
        <div>
          Are you sure you want to delete <strong>{asset.assetName}</strong> ({asset.assetCode})?
          <br />
          <span className="text-sm text-muted-foreground">This action cannot be undone.</span>
        </div>
      ),
      action: async () => {
        try {
          // TODO: Replace with actual API call
          toast({
            title: 'Asset deleted',
            description: `${asset.assetName} has been removed from the system.`,
          });
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete asset. Please try again.',
            variant: 'destructive',
          });
        }
      },
      variant: 'destructive',
      confirmText: 'Delete',
    });
  }, [toast]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusOption = ASSET_STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || 'gray';
  };

  // Column definitions
  const columns: ColumnDef<AssetSnapshot>[] = useMemo(() => {
    const allColumnDefs: Record<string, ColumnDef<AssetSnapshot>> = {
      assetName: {
        id: 'assetName',
        header: 'Asset Name',
        accessorKey: 'assetName',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{row.original.assetName}</div>
              {row.original.description && (
                <div className="text-xs text-muted-foreground truncate max-w-xs">
                  {row.original.description}
                </div>
              )}
            </div>
          </div>
        ),
      },
      assetCode: {
        id: 'assetCode',
        header: 'Asset Code',
        accessorKey: 'assetCode',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.assetCode}</span>
        ),
      },
      category: {
        id: 'category',
        header: 'Category',
        accessorKey: 'category',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.category}</Badge>
        ),
      },
      status: {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const color = getStatusColor(row.original.status);
          return (
            <Badge 
              variant={
                color === 'green' ? 'default' : 
                color === 'blue' ? 'secondary' : 
                color === 'orange' ? 'outline' : 
                'outline'
              }
            >
              {row.original.status}
            </Badge>
          );
        },
      },
      assignedTo: {
        id: 'assignedTo',
        header: 'Assigned To',
        accessorKey: 'assignedTo',
        cell: ({ row }) => {
          if (!row.original.assignedTo) {
            return <span className="text-muted-foreground text-sm">Not assigned</span>;
          }
          return (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">
                  {row.original.employeeFirstName} {row.original.employeeLastName}
                </div>
                {row.original.employeeDepartment && (
                  <div className="text-xs text-muted-foreground">
                    {row.original.employeeDepartment}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      purchaseDate: {
        id: 'purchaseDate',
        header: 'Purchase Date',
        accessorKey: 'purchaseDate',
        cell: ({ row }) => {
          if (!row.original.purchaseDate) return <span className="text-muted-foreground">-</span>;
          return format(new Date(row.original.purchaseDate), 'MMM dd, yyyy');
        },
      },
      purchasePrice: {
        id: 'purchasePrice',
        header: 'Purchase Price',
        accessorKey: 'purchasePrice',
        cell: ({ row }) => {
          if (!row.original.purchasePrice) return <span className="text-muted-foreground">-</span>;
          return <span>${row.original.purchasePrice.toLocaleString()}</span>;
        },
      },
      vendor: {
        id: 'vendor',
        header: 'Vendor',
        accessorKey: 'vendor',
        cell: ({ row }) => row.original.vendor || <span className="text-muted-foreground">-</span>,
      },
      location: {
        id: 'location',
        header: 'Location',
        accessorKey: 'location',
        cell: ({ row }) => row.original.location || <span className="text-muted-foreground">-</span>,
      },
      serialNumber: {
        id: 'serialNumber',
        header: 'Serial Number',
        accessorKey: 'serialNumber',
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.serialNumber || <span className="text-muted-foreground">-</span>}
          </span>
        ),
      },
      modelNumber: {
        id: 'modelNumber',
        header: 'Model Number',
        accessorKey: 'modelNumber',
        cell: ({ row }) => row.original.modelNumber || <span className="text-muted-foreground">-</span>,
      },
      actions: {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleView(row.original)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleEdit(row.original)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={() => handleDelete(row.original)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    };

    // Return only visible columns
    return visibleColumns
      .map(id => allColumnDefs[id])
      .filter(Boolean);
  }, [visibleColumns, handleView, handleEdit, handleDelete]);

  return (
    <>
      <DataTable
        ref={tableRef}
        columns={columns}
        data={tableData}
        loading={false}
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
          title: 'No assets found',
          description: 'Get started by adding your first asset',
          action: {
            label: 'Add Asset',
            onClick: () => navigate('/asset-management?mode=create'),
          },
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.action}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
      />
    </>
  );
}
