/**
 * Holiday Management Main Page
 * Displays list of holidays with filtering, search, and pagination
 */

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { HolidayCards } from './components/HolidayCards';
import { Holiday } from './types';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHoliday } from '@/contexts/HolidayContext';
import { useCompany } from '@/contexts/CompanyContext';
import { ActiveFilter, FilterOption } from '@/components/GenericToolbar/types';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';

export function HolidayManagement() {
  const navigate = useNavigate();
  const { refreshHolidays, deleteHolidayById, isLoading } = useHoliday();

  // State
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  // Ref to track previous dependency values to detect actual changes
  const prevDepsRef = useRef<{
    activeFilters: ActiveFilter[];
    searchQuery: string;
    pageIndex: number;
    pageSize: number;
    refreshTrigger: number;
  } | null>(null);

  const loadHolidays = async () => {
    try {
      // Build universal search request from filters and search query
      const searchRequest = buildUniversalSearchRequest(
        activeFilters,
        searchQuery,
        ['name', 'description'],
      );

      const result = await refreshHolidays(searchRequest, pageIndex, pageSize);
      if (result) {
        setHolidays(result.content || []);
        setTotalItems(result.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  // Fetch data from API when filters or search change
  useEffect(() => {
    // Check if dependencies have actually changed
    const depsChanged =
      !prevDepsRef.current ||
      JSON.stringify(prevDepsRef.current.activeFilters) !==
        JSON.stringify(activeFilters) ||
      prevDepsRef.current.searchQuery !== searchQuery ||
      prevDepsRef.current.pageIndex !== pageIndex ||
      prevDepsRef.current.pageSize !== pageSize ||
      prevDepsRef.current.refreshTrigger !== refreshTrigger;

    if (!depsChanged) return;

    // Update the ref with current values
    prevDepsRef.current = {
      activeFilters,
      searchQuery,
      pageIndex,
      pageSize,
      refreshTrigger,
    };

    loadHolidays();
  }, [
    activeFilters,
    searchQuery,
    pageIndex,
    pageSize,
    refreshTrigger,
  ]);

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

  // Get companies from context
  const { companies } = useCompany();

  // Admin flag - in real app, get from auth context
  const isAdmin = true;

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize);
  const canNextPage = pageIndex < totalPages - 1;

  // Company loading function for context-aware filter
  const loadCompanies = async (searchQuery: string): Promise<FilterOption[]> => {
    // Filter companies based on search query
    const filtered = companies.filter(company => {
      if (!searchQuery) return company.isActive !== false;
      return (
        company.isActive !== false &&
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Map to FilterOption format and limit to 20 results
    return filtered
      .slice(0, 20)
      .map(company => ({
        value: company.id,
        label: company.name,
      }));
  };

  // Handlers
  const handleAddHoliday = () => {
    navigate('/holiday-management/form?mode=create');
  };

  const handleEdit = (holiday: Holiday) => {
    navigate(`/holiday-management/form?mode=edit&id=${holiday.id}`);
  };

  const handleDelete = (holiday: Holiday) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Holiday',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{holiday.name}</strong>?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. The holiday will be permanently removed.
          </p>
        </div>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
      action: async () => {
        const success = await deleteHolidayById(holiday.id);
        if (success) {
          // Clear selection
          setSelectedIds([]);
          setSelectionMode(false);
          // Reset to first page
          setPageIndex(0);
          // Trigger refresh by incrementing refreshTrigger
          setRefreshTrigger(prev => prev + 1);
        }
      },
    });
  };

  // Bulk delete handler for selected holidays
  const handleBulkDelete = () => {
    const selectedCount = selectedIds.length;
    const selectedHolidayNames = holidays
      .filter(h => selectedIds.includes(h.id))
      .map(h => h.name);

    setConfirmDialog({
      open: true,
      title: 'Delete Selected Holidays',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{selectedCount}</strong> selected holiday
            {selectedCount !== 1 ? 'ies' : ''}?
          </p>
          {selectedHolidayNames.length <= 5 ? (
            <div className="text-sm text-muted-foreground">
              {selectedHolidayNames.map((name, idx) => (
                <div key={idx}>• {name}</div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {selectedHolidayNames.slice(0, 3).map(n => n).join(', ')} and{' '}
              {selectedHolidayNames.length - 3} more
            </p>
          )}
          <p className="text-destructive text-xs">
            This action cannot be undone. The holidays will be permanently removed.
          </p>
        </div>
      ),
      confirmText: 'Delete All',
      variant: 'destructive',
      action: async () => {
        // Delete all selected holidays
        const deletePromises = selectedIds.map(id => deleteHolidayById(id));
        const results = await Promise.all(deletePromises);
        
        if (results.some(result => result)) {
          // Clear selection immediately
          setSelectedIds([]);
          // Reset to first page
          setPageIndex(0);
          // Trigger data refresh
          setRefreshTrigger(prev => prev + 1);
        }
      },
    });
  };

  // Export handler for holidays
  const handleExport = async (sendEmail: boolean, email?: string) => {
    try {
      // TODO: Replace with actual API call to export holidays
      // const response = await apiExportHolidays({
      //   filters: activeFilters,
      //   searchQuery: searchQuery,
      //   sendEmail,
      //   email,
      // });

      // Placeholder: Show alert with current filters and search
      console.log('Export triggered with:', {
        activeFilters,
        searchQuery,
        sendEmail,
        email,
        holidays: holidays.map(h => ({
          id: h.id,
          name: h.name,
          description: h.description,
          companyIds: h.companyIds,
        })),
      });

      // Placeholder for successful export
      alert('Export functionality coming soon! Check console for data.');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export holidays');
    }
  };

  // Filter configuration for GenericToolbar
  const filterConfig = [
    {
      id: 'name',
      label: 'Name',
      type: 'text' as const,
      placeholder: 'Search by holiday name...',
    },
    {
      id: 'description',
      label: 'Description',
      type: 'text' as const,
      placeholder: 'Search by description...',
    },
    {
      id: 'companyIds',
      label: 'Company',
      type: 'context-aware-multiselect' as const,
      placeholder: 'Select companies...',
      contextAwareConfig: {
        loadingFunction: loadCompanies,
        minCharsToSearch: 0, // Allow loading on open without typing
        debounceMs: 300,
      },
    },
  ];

  return (
    <>
      <PageLayout>
        <div className="space-y-6">
          {/* Page Header with Action Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Holiday Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage company holidays and observances
              </p>
            </div>
            {isAdmin && (
              <Button onClick={handleAddHoliday} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Holiday
              </Button>
            )}
          </div>

          {/* Toolbar */}
          <GenericToolbar
            showSearch
            searchPlaceholder="Search holidays by name or description..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters
            availableFilters={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport={true}
            onExportAll={handleExport}
            onExportResults={handleExport}
            showConfigureView={false}
            showBulkActions={true}
            selectedCount={selectedIds.length}
            bulkActions={[
              {
                id: 'delete',
                label: `Delete (${selectedIds.length})`,
                type: 'button' as const,
                variant: 'destructive',
                onClick: handleBulkDelete,
              },
            ]}
            selectionMode={selectionMode}
            onToggleSelection={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) {
                // Clear selection when toggling off
                setSelectedIds([]);
              }
            }}
          />

          {/* Holiday Cards using HolidayCards wrapper */}
          <HolidayCards
            holidays={holidays}
            loading={isLoading}
            pagination={{
              pageIndex,
              pageSize,
              totalPages,
              canNextPage,
              totalItems,
              pageSizeOptions: [12, 24, 36, 48],
              onPageChange: setPageIndex,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPageIndex(0);
              },
            }}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
            isAdmin={isAdmin}
            searchQuery={searchQuery}
            activeFiltersCount={activeFilters.length}
            emptyStateTitle="No holidays found"
            emptyStateDescription={
              isAdmin
                ? 'Get started by adding your first holiday'
                : 'No holidays are currently available'
            }
            selection={{
              enabled: selectionMode,
              selectedIds,
              onSelectionChange: setSelectedIds,
            }}
          />
        </div>

        {/* Add padding at bottom to prevent content from being hidden behind fixed pagination */}
        <div className="h-20" />
      </PageLayout>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </>
  );
}
