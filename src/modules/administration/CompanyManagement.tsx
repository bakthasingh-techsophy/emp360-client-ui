/**
 * Company Management System
 * Manage companies with filtering, search, and CRUD operations
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { AvailableFilter, ActiveFilter, BulkAction } from '@/components/GenericToolbar/types';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useCompany } from '@/contexts/CompanyContext';
import { CompanyListView } from './components/CompanyListView';
import { CompanyModel } from '@/types/company';

export function CompanyManagement() {
  const navigate = useNavigate();
  const { bulkDeleteCompanies } = useCompany();

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

  // Filter configuration
  const filterConfig: AvailableFilter[] = [
    {
      id: 'name',
      label: 'Company Name',
      type: 'text',
      placeholder: 'Enter company name...',
    },
    {
      id: 'code',
      label: 'Company Code',
      type: 'text',
      placeholder: 'Enter code...',
    },
    {
      id: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Enter email...',
    },
    {
      id: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone...',
    },
    {
      id: 'industry',
      label: 'Industry',
      type: 'multiselect',
      options: [
        { value: 'Technology', label: 'Technology' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Retail', label: 'Retail' },
        { value: 'Education', label: 'Education' },
        { value: 'Consulting', label: 'Consulting' },
        { value: 'Real Estate', label: 'Real Estate' },
        { value: 'Hospitality', label: 'Hospitality' },
        { value: 'Other', label: 'Other' },
      ],
    },
    {
      id: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter city...',
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'Enter state...',
    },
    {
      id: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Enter country...',
    },
    {
      id: 'isActive',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
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

  // Action handlers
  const handleAddCompany = useCallback(() => {
    navigate('/company-form?mode=create');
  }, [navigate]);

  const handleSettings = useCallback(() => {
    navigate('/administration/companies/settings');
  }, [navigate]);

  const handleExportAll = useCallback((sendEmail: boolean, email?: string) => {
    console.log('Export all companies', { sendEmail, email });
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

  const handleSelectionChange = useCallback((selectedCompanyIds: string[]) => {
    setSelectedIds(selectedCompanyIds);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  const handleEditCompany = useCallback((company: CompanyModel) => {
    navigate(`/company-form?mode=edit&id=${company.id}`);
  }, [navigate]);

  const handleViewCompany = useCallback((company: CompanyModel) => {
    navigate(`/company-form?mode=view&id=${company.id}`);
  }, [navigate]);

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Delete Selected Companies',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{selectedIds.length}</strong> selected company(ies)?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. All company data will be permanently removed.
          </p>
        </div>
      ),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await bulkDeleteCompanies(selectedIds);
          handleClearSelection();
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
          // Error handling is done in the context
          console.error('Failed to bulk delete companies:', error);
        }
      },
    });
  }, [selectedIds, bulkDeleteCompanies, handleClearSelection]);

  // Memoize activeFilters to prevent unnecessary re-renders
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
  ], [handleBulkDelete]);

  return (
    <>
      <PageLayout
        toolbar={
        <div className="space-y-4">
          {/* Page Header with Action Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage companies and their information
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSettings} variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button onClick={handleAddCompany} className="gap-2">
                <Building2 className="h-4 w-4" />
                Add Company
              </Button>
            </div>
          </div>

          {/* Generic Toolbar */}
          <GenericToolbar
            showSearch
            searchPlaceholder="Search by name, code, email, industry..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
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
      {/* Companies List View Component */}
      <CompanyListView 
        searchQuery={searchQuery} 
        activeFilters={memoizedActiveFilters}
        selectionMode={selectionMode}
        onSelectionChange={handleSelectionChange}
        refreshTrigger={refreshTrigger}
        onEdit={handleEditCompany}
        onView={handleViewCompany}
      />

      {/* Add padding at bottom to prevent content from being hidden behind fixed pagination */}
      <div className="h-20" />
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
