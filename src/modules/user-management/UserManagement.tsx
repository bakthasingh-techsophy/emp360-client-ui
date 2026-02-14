/**
 * User Management System
 * Manage users with filtering, search, and CRUD operations
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserX, Trash2, Gift, UserCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { AvailableFilter, ActiveFilter, BulkAction } from '@/components/GenericToolbar/types';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { UsersTable } from './UsersTable';
import UniversalSearchRequest from '@/types/search';
import { useUserManagementPermissions } from '@/lib/permissions';

export function UserManagement() {
  const navigate = useNavigate();
  const { bulkDeleteUsers, bulkDeactivateUsers, bulkEnableUsers } = useUserManagement();
  const permissions = useUserManagementPermissions();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ open: false, title: '', description: '', onConfirm: () => {} });
  // Action handlers
  const handleSettings = useCallback(() => {
    navigate('/user-management/settings');
  }, [navigate]);
  // If user has no access at all, show restricted message
  if (!permissions.hasAnyAccess) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access User Management.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator for access.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // If user can't view employees but has other permissions, show limited access message
  if (!permissions.canView) {
    return (
      <PageLayout
        toolbar={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage system users, roles, and access control
                </p>
              </div>
              <div className="flex items-center gap-2">
                {permissions.canAccessSettings && (
                  <Button onClick={handleSettings} variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                )}
                {permissions.canCreate && (
                  <Button onClick={() => navigate('/user-management/employee-onboarding')} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Onboard New Employee
                  </Button>
                )}
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-2xl font-bold">Limited Access</h2>
            <p className="text-muted-foreground">
              You don't have permission to view the employee list.
            </p>
            <p className="text-sm text-muted-foreground">
              {permissions.canCreate ? (
                <>
                  However, you can create new employees. Click the "Onboard New Employee" button above to get started.
                </>
              ) : permissions.canAccessSettings ? (
                <>
                  However, you can access settings. Click the "Settings" button above to manage employee types, designations, and more.
                </>
              ) : (
                "Please contact your administrator to request additional access."
              )}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

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
    navigate('/user-management/employee-onboarding');
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
    setSelectionMode(prev => {
      const newMode = !prev;
      // Clear selection when turning OFF selection mode
      if (prev) {
        setSelectedIds([]);
      }
      return newMode;
    });
  }, []);

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
    if (selectedIds.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Delete Selected Users',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{selectedIds.length}</strong> selected user(s)?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. All user data will be permanently removed.
          </p>
        </div>
      ),
      variant: 'destructive',
      onConfirm: async () => {
        // Build UniversalSearchRequest with idsList
        const searchRequest = {
          idsList: selectedIds,
        };
        const success = await bulkDeleteUsers(searchRequest);
        if (success) {
          handleClearSelection();
          setRefreshTrigger(prev => prev + 1);
        }
      },
    });
  }, [selectedIds, bulkDeleteUsers, handleClearSelection]);

  const handleBulkCreditLeaves = useCallback(() => {
    if (selectedIds.length > 0) {
      console.log('Bulk credit leaves for users:', selectedIds);
      // TODO: Implement bulk credit leaves dialog and functionality
      handleClearSelection();
    }
  }, [selectedIds, handleClearSelection]);

  const handleBulkDeactivate = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Deactivate Selected Users',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to deactivate <strong>{selectedIds.length}</strong> selected user(s)?
          </p>
          <p className="text-muted-foreground text-xs">
            Deactivated users will not be able to access the system until reactivated.
          </p>
        </div>
      ),
      variant: 'default',
      onConfirm: async () => {
        // Build UniversalSearchRequest with idsList
        const searchRequest:UniversalSearchRequest = {
          idsList: selectedIds,
        };
        const success = await bulkDeactivateUsers(searchRequest);
        if (success) {
          handleClearSelection();
          setRefreshTrigger(prev => prev + 1);
        }
      },
    });
  }, [selectedIds]);

  const handleBulkEnable = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Enable Selected Users',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to enable <strong>{selectedIds.length}</strong> selected user(s)?
          </p>
          <p className="text-muted-foreground text-xs">
            Enabled users will be able to access the system.
          </p>
        </div>
      ),
      variant: 'default',
      onConfirm: async () => {
        // Build UniversalSearchRequest with idsList
        const searchRequest = {
          idsList: selectedIds,
        };
        const success = await bulkEnableUsers(searchRequest);
        if (success) {
          handleClearSelection();
          setRefreshTrigger(prev => prev + 1);
        }
      },
    });
  }, [selectedIds, bulkEnableUsers, handleClearSelection]);

  // Memoize activeFilters to prevent unnecessary re-renders of UsersTable
  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);

  // Define bulk actions based on permissions
  const bulkActions: BulkAction[] = useMemo(() => {
    const actions: BulkAction[] = [];
    
    // Delete action - only if user has delete permission
    if (permissions.canDelete) {
      actions.push({
        id: 'delete',
        label: 'Delete Selected',
        icon: <Trash2 className="h-4 w-4" />,
        type: 'button',
        variant: 'destructive',
        onClick: handleBulkDelete,
      });
    }
    
    // Deactivate action - only if user has deactivate permission
    if (permissions.canDeactivate) {
      actions.push({
        id: 'deactivate',
        label: 'Deactivate',
        icon: <UserX className="h-4 w-4" />,
        type: 'button',
        variant: 'outline',
        onClick: handleBulkDeactivate,
      });
    }
    
    // Enable action - only if user has enable permission
    if (permissions.canEnable) {
      actions.push({
        id: 'enable',
        label: 'Enable Users',
        icon: <UserCheck className="h-4 w-4" />,
        type: 'button',
        variant: 'outline',
        onClick: handleBulkEnable,
      });
    }
    
    // Credit leaves - only if user has edit permission
    if (permissions.canEdit) {
      actions.push({
        id: 'credit-leaves',
        label: 'Credit Leaves',
        icon: <Gift className="h-4 w-4" />,
        type: 'button',
        variant: 'outline',
        onClick: handleBulkCreditLeaves,
      });
    }
    
    return actions;
  }, [permissions, handleBulkDelete, handleBulkDeactivate, handleBulkEnable, handleBulkCreditLeaves]);

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
            <div className="flex items-center gap-2">
              {permissions.canAccessSettings && (
                <Button onClick={handleSettings} variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              )}
              {permissions.canCreate && (
                <Button onClick={handleAddUser} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Onboard New Employee
                </Button>
              )}
            </div>
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
        refreshTrigger={refreshTrigger}
        permissions={permissions}
      />
    </PageLayout>

    {/* Confirmation Dialog */}
    <ConfirmationDialog
      open={confirmDialog.open}
      onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      onConfirm={confirmDialog.onConfirm}
      title={confirmDialog.title}
      description={confirmDialog.description}
      variant={confirmDialog.variant}
      confirmText={confirmDialog.variant === 'destructive' ? 'Delete' : 'Confirm'}
    />
  </>
  );
}
