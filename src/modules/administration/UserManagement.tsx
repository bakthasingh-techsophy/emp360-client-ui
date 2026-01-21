/**
 * User Management System
 * Manage users with filtering, search, and CRUD operations
 */

import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, UserPlus, Trash2, MoreHorizontal, Copy, Check, Download, UserCheck, UserX } from 'lucide-react';
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
import { PageLayout } from '@/components/PageLayout';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { DataTableRef } from '@/components/common/DataTable/types';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';
import { mockUsers } from './data/mockData';
import { User, UserStatus } from './types/user.types';

export function UserManagement() {
  const tableRef = useRef<DataTableRef>(null);
  const navigate = useNavigate();

  // State management
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'select',
    'employeeId',
    'name',
    'contactInfo',
    'department',
    'status',
    'location',
    'joiningDate',
    'actions',
  ]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Get status badge variant
  const getStatusVariant = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'suspended':
        return 'destructive';
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

  // Define table columns
  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            // Update after a brief delay to let the state settle
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
            // Update after a brief delay to let the state settle
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
        <div className="font-medium">{row.getValue('employeeId')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.getValue('name')}</span>
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

  // Define available columns for column visibility toggle
  const allColumns = [
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'name', label: 'Name' },
    { id: 'contactInfo', label: 'Contact Info' },
    { id: 'department', label: 'Department' },
    { id: 'status', label: 'Status' },
    { id: 'location', label: 'Location' },
    { id: 'joiningDate', label: 'Joining Date' },
    { id: 'actions', label: 'Actions' },
  ];

  // Filter configuration
  const filterConfig: AvailableFilter[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'suspended', label: 'Suspended' },
      ],
    },
    {
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Human Resources', label: 'Human Resources' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Operations', label: 'Operations' },
        { value: 'IT', label: 'IT' },
        { value: 'Legal', label: 'Legal' },
        { value: 'Administration', label: 'Administration' },
      ],
    },
    {
      id: 'role',
      label: 'Role',
      type: 'multiselect',
      options: [
        { value: 'super-admin', label: 'Super Admin' },
        { value: 'it-admin', label: 'IT Admin' },
        { value: 'chro', label: 'CHRO' },
        { value: 'hr-manager', label: 'HR Manager' },
        { value: 'hr-executive', label: 'HR Executive' },
        { value: 'recruiter', label: 'Recruiter' },
        { value: 'employee', label: 'Employee' },
        { value: 'intern', label: 'Intern' },
      ],
    },
    {
      id: 'joiningDate',
      label: 'Joining Date',
      type: 'date',
    },
  ];

  // Apply filters and search
  const filteredUsers = useMemo(() => {
    let result = [...mockUsers];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.employeeId.toLowerCase().includes(query) ||
          user.department.toLowerCase().includes(query) ||
          user.designation.toLowerCase().includes(query) ||
          user.phone.includes(query)
      );
    }

    // Apply filters
    activeFilters.forEach((filter) => {
      switch (filter.filterId) {
        case 'status':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            result = result.filter((user) => filter.value.includes(user.status));
          }
          break;
        case 'department':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            result = result.filter((user) => filter.value.includes(user.department));
          }
          break;
        case 'role':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            result = result.filter((user) => filter.value.includes(user.role));
          }
          break;
        case 'joiningDate':
          if (filter.value && typeof filter.value === 'object') {
            const { from, to } = filter.value as { from?: string; to?: string };
            if (from) {
              result = result.filter((user) => new Date(user.joiningDate) >= new Date(from));
            }
            if (to) {
              result = result.filter((user) => new Date(user.joiningDate) <= new Date(to));
            }
          }
          break;
      }
    });

    return result;
  }, [searchQuery, activeFilters]);

  // Get visible columns
  const visibleTableColumns = useMemo(() => {
    return columns.filter((col) => {
      const id = 'id' in col ? col.id : 'accessorKey' in col ? col.accessorKey : null;
      
      // Hide select column when selection mode is disabled
      if (id === 'select' && !selectionMode) {
        return false;
      }
      
      return id && visibleColumns.includes(id as string);
    });
  }, [columns, visibleColumns, selectionMode]);

  // Paginate data
  const paginatedUsers = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, pageIndex, pageSize]);

  // Action handlers
  const handleAddUser = () => {
    navigate('/employee-onboarding');
  };

  const handleViewUser = (user: User) => {
    console.log('View user:', user);
    // Navigate to user details page
  };

  const handleEditUser = (user: User) => {
    navigate(`/employee-onboarding?mode=edit&id=${user.id}`);
  };

  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user);
    // Show confirmation dialog and delete
  };

  const handleExportAll = (sendEmail: boolean, email?: string) => {
    console.log('Export all users', { sendEmail, email });
  };

  const handleExportResults = (sendEmail: boolean, email?: string) => {
    console.log('Export filtered users', { sendEmail, email, count: filteredUsers.length });
  };

  const handleToggleSelection = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedIds([]);
      // Clear table selection
      tableRef.current?.clearSelection();
    }
  };

  // Sync selected IDs from table ref periodically
  const updateSelectedIds = () => {
    if (selectionMode && tableRef.current) {
      const ids = tableRef.current.getSelectedIds();
      setSelectedIds(ids);
    }
  };

  // Bulk action handlers
  const handleBulkDelete = (selectedIds: string[]) => {
    console.log('Bulk delete users:', selectedIds);
    // Show confirmation dialog and delete multiple users
    // After deletion, clear selection
    setSelectedIds([]);
  };

  const handleBulkExport = (selectedIds: string[]) => {
    console.log('Bulk export users:', selectedIds);
    // Export selected users to CSV/Excel
  };

  const handleBulkActivate = (selectedIds: string[]) => {
    console.log('Bulk activate users:', selectedIds);
    // Activate multiple users
    setSelectedIds([]);
  };

  const handleBulkDeactivate = (selectedIds: string[]) => {
    console.log('Bulk deactivate users:', selectedIds);
    // Deactivate multiple users
    setSelectedIds([]);
  };

  return (
    <PageLayout
      toolbar={
        <div className="space-y-4">
          {/* Page Header with Action Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage system users, roles, and access control
              </p>
            </div>
            <Button onClick={handleAddUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Onboard New Employee
            </Button>
          </div>

          {/* Generic Toolbar */}
          <GenericToolbar
            showSearch
            searchPlaceholder="Search by name, email, employee ID, department..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showConfigureView
            allColumns={allColumns}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            showFilters
            availableFilters={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport
            onExportAll={handleExportAll}
            onExportResults={handleExportResults}
            showBulkActions
            bulkActions={[
              {
                id: 'export',
                label: 'Export Selected',
                icon: <Download className="h-4 w-4" />,
                type: 'button',
                variant: 'outline',
                onClick: handleBulkExport,
              },
              {
                id: 'status',
                label: 'Change Status',
                type: 'dropdown',
                variant: 'outline',
                options: [
                  {
                    id: 'activate',
                    label: 'Activate Users',
                    icon: <UserCheck className="h-4 w-4" />,
                    onClick: handleBulkActivate,
                  },
                  {
                    id: 'deactivate',
                    label: 'Deactivate Users',
                    icon: <UserX className="h-4 w-4" />,
                    onClick: handleBulkDeactivate,
                  },
                ],
              },
              {
                id: 'delete',
                label: 'Delete Selected',
                icon: <Trash2 className="h-4 w-4" />,
                type: 'button',
                variant: 'destructive',
                onClick: handleBulkDelete,
              },
            ]}
            selectedCount={selectedIds.length}
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            selectionMode={selectionMode}
          />
        </div>
      }
    >
      {/* Data Table */}
      <DataTable
        ref={tableRef}
        data={paginatedUsers}
        columns={visibleTableColumns}
        loading={loading}
        pagination={{
          pageIndex,
          pageSize,
          totalPages: Math.ceil(filteredUsers.length / pageSize),
          totalItems: filteredUsers.length,
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
    </PageLayout>
  );
}
