/**
 * Users Table Component
 * Displays users in a table with filtering, search, selection, and pagination.
 * Handles all table-related logic, data fetching via searchUserSnapshots, and user interactions.
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { DataTableRef } from '@/components/common/DataTable/types';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { ActiveFilter } from '@/components/GenericToolbar/types';
import { UserStatus, UserDetailsSnapshot } from './types/onboarding.types';
import { EmployeeViewModal } from './components/EmployeeViewModal';

type Props = {
  searchQuery: string;
  activeFilters: ActiveFilter[];
};

export function UsersTable({ searchQuery, activeFilters }: Props) {
  const navigate = useNavigate();
  const { refreshUserDetailsSnapshots, isLoading } = useUserManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [tableData, setTableData] = useState<UserDetailsSnapshot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsSnapshot | null>(null);

  // Ref to track previous dependency values to detect actual changes
  const prevDepsRef = useRef<{ activeFilters: ActiveFilter[]; searchQuery: string; pageIndex: number; pageSize: number } | null>(null);

  // Get status badge variant
  const getStatusVariant = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Fetch data from API when filters or search change
  useEffect(() => {
    // Check if dependencies have actually changed
    const depsChanged = !prevDepsRef.current || 
      JSON.stringify(prevDepsRef.current.activeFilters) !== JSON.stringify(activeFilters) ||
      prevDepsRef.current.searchQuery !== searchQuery ||
      prevDepsRef.current.pageIndex !== pageIndex ||
      prevDepsRef.current.pageSize !== pageSize;

    if (!depsChanged) return;

    // Update the ref with current values
    prevDepsRef.current = { activeFilters, searchQuery, pageIndex, pageSize };

    const fetchData = async () => {
      try {
        const result = await refreshUserDetailsSnapshots(activeFilters, searchQuery, pageIndex, pageSize);
        
        if (result) {
          setTableData(result.content || []);
          setTotalItems(result.totalElements || 0);
        }
      } catch (error) {
        console.error('Error fetching user snapshots:', error);
      }
    };

    fetchData();
  }, [activeFilters, searchQuery, pageIndex, pageSize, refreshUserDetailsSnapshots]);

  // Define table columns
  const columns: ColumnDef<UserDetailsSnapshot>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            setTimeout(updateSelectedIds, 0);
          }}
          aria-label="Select all"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            setTimeout(updateSelectedIds, 0);
          }}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{`${row.original.firstName} ${row.original.lastName}`}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.designation}
          </span>
          {row.original.reportingTo && (
            <span className="text-xs text-muted-foreground">
              Reports to: {row.original.reportingTo}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'contactInfo',
      header: 'Contact Info',
      cell: ({ row }) => {
        const user = row.original;
        const emailId = `email-${user.id}`;
        const phoneId = `phone-${user.id}`;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.email}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(user.email, emailId);
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
              <span className="text-xs text-muted-foreground">{user.phone}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(user.phone, phoneId);
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
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const role = row.original.role.replace(/-/g, ' ');
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{row.getValue('department')}</span>
            <Badge variant="secondary" className="capitalize text-xs w-fit">
              {role}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as UserStatus;
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('location')}</div>
      ),
    },
    {
      accessorKey: 'joiningDate',
      header: 'Joining Date',
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue('joiningDate'))}</div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewUser(user);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(user);
              }}
            >
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">More actions</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDeleteUser(user)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Get visible columns (show select only in selection mode)
  const visibleTableColumns = useMemo(() => {
    return columns.filter((col) => {
      const id = 'id' in col ? col.id : 'accessorKey' in col ? col.accessorKey : null;
      
      if (id === 'select' && !selectionMode) {
        return false;
      }
      
      return id !== undefined;
    });
  }, [columns, selectionMode]);

  // Action handlers
  const handleViewUser = (user: UserDetailsSnapshot) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user: UserDetailsSnapshot) => {
    navigate(`/employee-onboarding?mode=edit&id=${user.id}`);
  };

  const handleDeleteUser = (user: UserDetailsSnapshot) => {
    console.log('Delete user:', user);
  };

  // Sync selected IDs from table ref
  const updateSelectedIds = () => {
    if (selectionMode && tableRef.current) {
      const ids = tableRef.current.getSelectedIds();
      setSelectedIds(ids);
    }
  };

  return (
    <>
      <DataTable
        ref={tableRef}
        data={tableData}
        columns={visibleTableColumns}
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
        selection={{
          enabled: selectionMode,
          getRowId: (user) => user?.id || '',
        }}
        emptyState={{
          title: 'No users found',
          description: 'No users match your current filters. Try adjusting your search or filters.',
        }}
        onRowClick={selectionMode ? undefined : (user) => handleViewUser(user)}
      />

      {/* Employee View Modal */}
      <EmployeeViewModal
        employee={selectedUser}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={(user) => {
          setViewModalOpen(false);
          handleEditUser(user);
        }}
      />
    </>
  );
}

export default UsersTable;
