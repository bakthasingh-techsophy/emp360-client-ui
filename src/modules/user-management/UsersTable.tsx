/**
 * Users Table Component
 * Displays users in a table with filtering, search, selection, and pagination.
 * Handles all table-related logic, data fetching via searchUserSnapshots, and user interactions.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
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
  visibleColumns: string[];
  selectionMode: boolean;
  onSelectionChange: (ids: string[]) => void;
};

export function UsersTable({ searchQuery, activeFilters, visibleColumns, selectionMode, onSelectionChange }: Props) {
  const navigate = useNavigate();
  const { refreshUserDetailsSnapshots, deleteUser, isLoading } = useUserManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [tableData, setTableData] = useState<UserDetailsSnapshot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsSnapshot | null>(null);
  
  // Confirmation dialog state for single user deletion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserDetailsSnapshot | null>(null);

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
  const copyToClipboard = useCallback(async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Action handlers - defined before columns to allow memoization
  const handleViewUser = useCallback((user: UserDetailsSnapshot) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: UserDetailsSnapshot) => {
    navigate(`/employee-onboarding?mode=edit&id=${user.id}`);
  }, [navigate]);

  const handleDeleteUser = useCallback((user: UserDetailsSnapshot) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;
    
    const success = await deleteUser(userToDelete.employeeId);
    if (success) {
      // Refresh table data
      fetchData();
    }
    setUserToDelete(null);
  }, [userToDelete, deleteUser]);

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

  // Define table columns - memoized to prevent unnecessary re-renders
  const columns: ColumnDef<UserDetailsSnapshot>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'employeeId',
      accessorKey: 'id',
      header: 'Employee ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      id: 'name',
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
      id: 'contactInfo',
      accessorKey: 'email',
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
        const designation = row.original.designation;
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{row.getValue('department')}</span>
            <Badge variant="secondary" className="capitalize text-xs w-fit">
              {designation}
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
      accessorKey: 'dateOfBirth',
      header: 'Date of Birth',
      cell: ({ row }) => {
        const dob = row.getValue('dateOfBirth') as string | undefined;
        return (
          <div className="text-sm">{dob ? formatDate(dob) : '-'}</div>
        );
      },
    },
    {
      accessorKey: 'reportingTo',
      header: 'Reporting To',
      cell: ({ row }) => {
        const reportingTo = row.getValue('reportingTo') as string | undefined;
        return (
          <div className="text-sm">{reportingTo || '-'}</div>
        );
      },
    },
    {
      accessorKey: 'panNumber',
      header: 'PAN Number',
      cell: ({ row }) => {
        const panNumber = row.getValue('panNumber') as string | undefined;
        return (
          <div className="text-sm font-mono">{panNumber || '-'}</div>
        );
      },
    },
    {
      accessorKey: 'aadharNumber',
      header: 'Aadhar Number',
      cell: ({ row }) => {
        const aadharNumber = row.getValue('aadharNumber') as string | undefined;
        return (
          <div className="text-sm font-mono">{aadharNumber || '-'}</div>
        );
      },
    },
    {
      accessorKey: 'emergencyContact',
      header: 'Emergency Contact',
      cell: ({ row }) => {
        const contact = row.getValue('emergencyContact') as { name: string; phone: string; relation: string } | undefined;
        return (
          <div className="text-sm">
            {contact ? (
              <div>
                <div className="font-medium">{contact.name}</div>
                <div className="text-xs text-muted-foreground">{contact.phone}</div>
              </div>
            ) : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => {
        const skills = row.getValue('skills') as string[] | undefined;
        return (
          <div className="text-sm">
            {skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{skills.length - 3}
                  </Badge>
                )}
              </div>
            ) : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue('createdAt'))}</div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue('updatedAt'))}</div>
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
  ], [copyToClipboard, copiedField, handleViewUser, handleEditUser, handleDeleteUser]);

  // Filter columns based on visibleColumns prop
  const filteredColumns = useMemo(() => 
    columns.filter((column: any) => {
      // Always include select column if in selection mode
      if (column.id === 'select') {
        return selectionMode;
      }
      // Always include action columns
      if (column.id === 'actions') {
        return true;
      }
      // For other columns, check if id or accessorKey is in visibleColumns
      if (column.id) {
        return visibleColumns.includes(column.id);
      }
      if ('accessorKey' in column) {
        return visibleColumns.includes(column.accessorKey as string);
      }
      return true;
    }),
    [columns, visibleColumns, selectionMode]
  );

  console.log('UsersTable: selectionMode', selectionMode);
  console.log('UsersTable: filteredColumns count', filteredColumns.length);
  console.log('UsersTable: has select column?', filteredColumns.some((c: any) => c.id === 'select'));
  console.log('UsersTable: columns', filteredColumns.map((c: any) => c.id || c.accessorKey));

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
        selection={{
          enabled: selectionMode ?? false,
          onSelectionChange,
          getRowId: (user) => user.id,
          enableSelectAll: true,
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description={
          userToDelete ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to delete{' '}
                <strong>
                  {userToDelete.firstName} {userToDelete.lastName}
                </strong>{' '}
                ({userToDelete.employeeId})?
              </p>
              <p className="text-destructive text-xs">
                This action cannot be undone. All user data will be permanently removed.
              </p>
            </div>
          ) : (
            'Are you sure you want to delete this user?'
          )
        }
        variant="destructive"
        confirmText="Delete"
        icon={<AlertTriangle className="h-10 w-10 text-destructive" />}
      />
    </>
  );
}

export default UsersTable;
