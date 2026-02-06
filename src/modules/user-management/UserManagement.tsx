/**
 * User Management System
 * Manage users with filtering, search, and CRUD operations
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserX, Trash2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { AvailableFilter, ActiveFilter, BulkAction } from '@/components/GenericToolbar/types';
import { UsersTable } from './UsersTable';

export function UserManagement() {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Column visibility state - minimal columns visible by default
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'employeeId',
    'name',
    'contactInfo',
    'department',
    'status',
  ]);

  // Filter configuration
  const filterConfig: AvailableFilter[] = [
    {
      id: 'employeeId',
      label: 'Employee ID',
      type: 'text',
      placeholder: 'Enter employee ID...',
    },
    {
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter first name...',
    },
    {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter last name...',
    },
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
      id: 'location',
      label: 'Location',
      type: 'multiselect',
      options: [
        { value: 'bangalore', label: 'Bangalore' },
        { value: 'hyderabad', label: 'Hyderabad' },
        { value: 'pune', label: 'Pune' },
        { value: 'mumbai', label: 'Mumbai' },
        { value: 'delhi', label: 'Delhi' },
        { value: 'remote', label: 'Remote' },
      ],
    },
    {
      id: 'reportingTo',
      label: 'Reporting To',
      type: 'text',
      placeholder: 'Enter manager name...',
    },
    {
      id: 'joiningDate',
      label: 'Joining Date',
      type: 'date',
    },
    {
      id: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
    },
    {
      id: 'panNumber',
      label: 'PAN Number',
      type: 'text',
      placeholder: 'Enter PAN number...',
    },
    {
      id: 'aadharNumber',
      label: 'Aadhar Number',
      type: 'text',
      placeholder: 'Enter Aadhar number...',
    },
    {
      id: 'skills',
      label: 'Skills',
      type: 'text',
      placeholder: 'Enter skill name...',
    },
    {
      id: 'createdAt',
      label: 'Created At',
      type: 'date',
    },
    {
      id: 'updatedAt',
      label: 'Updated At',
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
    { id: 'reportingTo', label: 'Reporting To' },
    { id: 'joiningDate', label: 'Joining Date' },
    { id: 'dateOfBirth', label: 'Date of Birth' },
    { id: 'panNumber', label: 'PAN Number' },
    { id: 'aadharNumber', label: 'Aadhar Number' },
    { id: 'skills', label: 'Skills' },
    { id: 'createdAt', label: 'Created At' },
    { id: 'updatedAt', label: 'Updated At' },
  ];

  // Action handlers
  const handleAddUser = useCallback(() => {
    navigate('/employee-onboarding');
  }, [navigate]);

  const handleExportAll = useCallback((sendEmail: boolean, email?: string) => {
    console.log('Export all users', { sendEmail, email });
    // TODO: Implement actual export logic
  }, []);

  const handleExportResults = useCallback((sendEmail: boolean, email?: string) => {
    console.log('Export filtered results', { sendEmail, email });
    // TODO: Implement actual export logic
  }, []);

  const handleToggleSelection = useCallback(() => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      setSelectedIds([]);
    }
  }, [selectionMode]);

  const handleSelectionChange = useCallback((selectedUserIds: string[]) => {
    setSelectedIds(selectedUserIds);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  const handleVisibleColumnsChange = useCallback((columns: string[]) => {
    // Always include actions - it should not be hideable
    const finalColumns = [...columns];
    if (!finalColumns.includes('actions')) {
      finalColumns.push('actions');
    }
    setVisibleColumns(finalColumns);
  }, []);

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      console.log('Bulk delete users:', selectedIds);
      // TODO: Implement bulk delete dialog and functionality
      handleClearSelection();
    }
  }, [selectedIds, handleClearSelection]);

  const handleBulkCreditLeaves = useCallback(() => {
    if (selectedIds.length > 0) {
      console.log('Bulk credit leaves for users:', selectedIds);
      // TODO: Implement bulk credit leaves dialog and functionality
      handleClearSelection();
    }
  }, [selectedIds, handleClearSelection]);

  const handleBulkDeactivate = useCallback(() => {
    if (selectedIds.length > 0) {
      console.log('Bulk deactivate users:', selectedIds);
      // TODO: Implement bulk deactivate functionality
      handleClearSelection();
    }
  }, [selectedIds, handleClearSelection]);

  // Memoize activeFilters to prevent unnecessary re-renders of UsersTable
  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);

  // Define bulk actions
  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      type: 'button',
      variant: 'destructive',
      onClick: handleBulkDelete,
    },
    {
      id: 'credit-leaves',
      label: 'Credit Leaves',
      icon: <Gift className="h-4 w-4" />,
      type: 'button',
      variant: 'outline',
      onClick: handleBulkCreditLeaves,
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: <UserX className="h-4 w-4" />,
      type: 'button',
      variant: 'outline',
      onClick: handleBulkDeactivate,
    },
  ], [handleBulkDelete, handleBulkCreditLeaves, handleBulkDeactivate]);

  return (
    <>
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
            onVisibleColumnsChange={handleVisibleColumnsChange}
            showFilters
            availableFilters={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport={!selectionMode}
            onExportAll={handleExportAll}
            onExportResults={handleExportResults}
            showBulkActions
            bulkActions={bulkActions}
            selectedCount={selectedIds.length}
            onToggleSelection={handleToggleSelection}
            selectionMode={selectionMode}
          />
        </div>
      }
    >
      {/* Users Table Component */}
      <UsersTable 
        searchQuery={searchQuery} 
        activeFilters={memoizedActiveFilters}
        visibleColumns={visibleColumns}
        selectionMode={selectionMode}
        onSelectionChange={handleSelectionChange}
      />
    </PageLayout>
  </>
  );
}
