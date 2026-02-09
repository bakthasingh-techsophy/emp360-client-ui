/**
 * Space Management System
 * Manage visitor management spaces with filtering, search, and CRUD operations
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { AvailableFilter, ActiveFilter, BulkAction } from '@/components/GenericToolbar/types';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceListView } from './components/SpaceListView';
import { Space } from './spaceTypes';

export function SpaceManagement() {
  const navigate = useNavigate();
  const { bulkDeleteSpaces } = useSpace();

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
      id: 'spaceName',
      label: 'Space Name',
      type: 'text',
      placeholder: 'Enter space name...',
    },
    {
      id: 'id',
      label: 'Space ID',
      type: 'text',
      placeholder: 'Enter space ID...',
    },
    {
      id: 'ownerCompany',
      label: 'Owner Company',
      type: 'text',
      placeholder: 'Enter owner company...',
    },
    {
      id: 'address',
      label: 'Address',
      type: 'text',
      placeholder: 'Enter address...',
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
  const handleAddSpace = useCallback(() => {
    navigate('/space-management/form?mode=create');
  }, [navigate]);

  const handleSettings = useCallback(() => {
    navigate('/space-management/settings');
  }, [navigate]);

  const handleExportAll = useCallback((sendEmail: boolean, email?: string) => {
    console.log('Export all spaces', { sendEmail, email });
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

  const handleSelectionChange = useCallback((selectedSpaceIds: string[]) => {
    setSelectedIds(selectedSpaceIds);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  const handleEditSpace = useCallback((space: Space) => {
    navigate(`/space-management/form?mode=edit&id=${space.id}`);
  }, [navigate]);

  const handleViewSpace = useCallback((space: Space) => {
    navigate(`/space-management/form?mode=view&id=${space.id}`);
  }, [navigate]);

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Delete Selected Spaces',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{selectedIds.length}</strong> selected space(s)?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. All space data and associated visitor records will be permanently removed.
          </p>
        </div>
      ),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await bulkDeleteSpaces(selectedIds);
          handleClearSelection();
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
          // Error handling is done in the context
          console.error('Failed to bulk delete spaces:', error);
        }
      },
    });
  }, [selectedIds, bulkDeleteSpaces, handleClearSelection]);

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
              <h1 className="text-3xl font-bold tracking-tight">Space Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage visitor management spaces and their configurations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSettings} variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button onClick={handleAddSpace} className="gap-2">
                <Building className="h-4 w-4" />
                Create Space
              </Button>
            </div>
          </div>

          {/* Generic Toolbar */}
          <GenericToolbar
            showSearch
            searchPlaceholder="Search by space name, ID, owner, address..."
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
      {/* Spaces List View Component */}
      <SpaceListView 
        searchQuery={searchQuery} 
        activeFilters={memoizedActiveFilters}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        refreshTrigger={refreshTrigger}
        onEdit={handleEditSpace}
        onView={handleViewSpace}
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
