/**
 * User Management System
 * Manage users with filtering, search, and CRUD operations
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Download, UserCheck, UserX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';
import { UsersTable } from './UsersTable';

export function UserManagement() {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Filter configuration
  const filterConfig: AvailableFilter[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
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

  // Action handlers
  const handleAddUser = () => {
    navigate('/employee-onboarding');
  };

  const handleExportAll = (sendEmail: boolean, email?: string) => {
    console.log('Export all users', { sendEmail, email });
  };

  const handleExportResults = (sendEmail: boolean, email?: string) => {
    console.log('Export filtered results', { sendEmail, email });
  };

  const handleToggleSelection = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedIds([]);
    }
  };

  // Memoize activeFilters to prevent unnecessary re-renders of UsersTable
  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);

  // Bulk action handlers
  const handleBulkDelete = (selectedIds: string[]) => {
    console.log('Bulk delete users:', selectedIds);
    setSelectedIds([]);
  };

  const handleBulkExport = (selectedIds: string[]) => {
    console.log('Bulk export users:', selectedIds);
  };

  const handleBulkActivate = (selectedIds: string[]) => {
    console.log('Bulk activate users:', selectedIds);
    setSelectedIds([]);
  };

  const handleBulkDeactivate = (selectedIds: string[]) => {
    console.log('Bulk deactivate users:', selectedIds);
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
            visibleColumns={allColumns.map((col) => col.id)}
            onVisibleColumnsChange={() => {}}
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
      {/* Users Table Component */}
      <UsersTable searchQuery={searchQuery} activeFilters={memoizedActiveFilters} />
    </PageLayout>
  );
}
