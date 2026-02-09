/**
 * Company List View Component
 * Displays companies in a card grid with filtering, search, selection, and pagination.
 * Handles data fetching and user interactions.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Building2 } from 'lucide-react';
import { DefaultPagination } from '@/components/common/Pagination/DefaultPagination';
import { CompanyCard } from './CompanyCard';
import { CompanyModel } from '@/types/company';
import { useCompany } from '@/contexts/CompanyContext';
import { resolveAuth } from '@/store/localStorage';
import { ActiveFilter } from '@/components/GenericToolbar/types';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { apiSearchCompanies } from '@/services/companyService';
import { useToast } from '@/hooks/use-toast';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';

type Props = {
  searchQuery: string;
  activeFilters: ActiveFilter[];
  selectionMode: boolean;
  onSelectionChange: (ids: string[]) => void;
  refreshTrigger?: number;
  onEdit?: (company: CompanyModel) => void;
  onView?: (company: CompanyModel) => void;
};

export function CompanyListView({
  searchQuery,
  activeFilters,
  selectionMode,
  onSelectionChange,
  refreshTrigger = 0,
  onEdit,
  onView,
}: Props) {
  const { deleteCompany } = useCompany();
  const { toast } = useToast();

  // List state
  const [companies, setCompanies] = useState<CompanyModel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(12); // 12 cards per page for better grid layout
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation dialog state for single company deletion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<CompanyModel | null>(null);

  // Ref to track previous dependency values to detect actual changes
  const prevDepsRef = useRef<{
    activeFilters: ActiveFilter[];
    searchQuery: string;
    pageIndex: number;
    pageSize: number;
    refreshTrigger: number;
  } | null>(null);

  // Fetch companies data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get auth from localStorage
      const { accessToken, tenant } = resolveAuth();
      
      // Build the search request
      const searchRequest = buildUniversalSearchRequest(activeFilters, searchQuery);

      // Call API with correct parameter order: (searchRequest, page, pageSize, tenant, accessToken?)
      const result = await apiSearchCompanies(searchRequest, pageIndex, pageSize, tenant ?? "", accessToken ?? undefined);

      if (result.success && result.data) {
        setCompanies(result.data.content || []);
        setTotalItems(result.data.totalElements || 0);
      } else {
        toast({
          title: 'Failed to load companies',
          description: result.message || 'An error occurred while fetching companies',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Failed to load companies',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [activeFilters, searchQuery, pageIndex, pageSize, toast]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    const currentDeps = {
      activeFilters,
      searchQuery,
      pageIndex,
      pageSize,
      refreshTrigger,
    };

    // Check if dependencies have actually changed
    const depsChanged =
      !prevDepsRef.current ||
      JSON.stringify(prevDepsRef.current.activeFilters) !==
        JSON.stringify(currentDeps.activeFilters) ||
      prevDepsRef.current.searchQuery !== currentDeps.searchQuery ||
      prevDepsRef.current.pageIndex !== currentDeps.pageIndex ||
      prevDepsRef.current.pageSize !== currentDeps.pageSize ||
      prevDepsRef.current.refreshTrigger !== currentDeps.refreshTrigger;

    if (depsChanged) {
      prevDepsRef.current = currentDeps;
      fetchData();
    }
  }, [activeFilters, searchQuery, pageIndex, pageSize, refreshTrigger, fetchData]);

  // Reset to first page when search or filters change
  useEffect(() => {
    if (prevDepsRef.current) {
      const filtersChanged =
        JSON.stringify(prevDepsRef.current.activeFilters) !==
        JSON.stringify(activeFilters);
      const searchChanged = prevDepsRef.current.searchQuery !== searchQuery;

      if (filtersChanged || searchChanged) {
        setPageIndex(0);
      }
    }
  }, [activeFilters, searchQuery]);

  // Handle selection change
  const handleSelectChange = useCallback((companyId: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSelection = selected
        ? [...prev, companyId]
        : prev.filter(id => id !== companyId);
      onSelectionChange(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Sync selectedIds when selectionMode is turned off
  useEffect(() => {
    if (!selectionMode) {
      setSelectedIds([]);
      onSelectionChange([]);
    }
  }, [selectionMode, onSelectionChange]);

  // Handle delete
  const handleDelete = useCallback((company: CompanyModel) => {
    setCompanyToDelete(company);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!companyToDelete) return;

    try {
      await deleteCompany(companyToDelete.id);
      setDeleteConfirmOpen(false);
      setCompanyToDelete(null);
      // Refresh the list
      fetchData();
    } catch (error) {
      // Error handling is done in the context
      console.error('Failed to delete company:', error);
    }
  }, [companyToDelete, deleteCompany, fetchData]);

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize);
  const canNextPage = pageIndex < totalPages - 1;

  return (
    <>
      {/* Loading State */}
      {loading && companies.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No companies found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No companies match your current filters. Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Companies Grid */}
      {companies.length > 0 && (
        <div className="space-y-4">
          {/* Grid of Company Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onEdit={onEdit}
                onDelete={handleDelete}
                onView={onView}
                selectionMode={selectionMode}
                selected={selectedIds.includes(company.id)}
                onSelectChange={(selected) => handleSelectChange(company.id, selected)}
              />
            ))}
          </div>

          {/* Fixed Bottom Pagination */}
          <DefaultPagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalPages={totalPages}
            canNextPage={canNextPage}
            totalItems={totalItems}
            onPageChange={setPageIndex}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageIndex(0); // Reset to first page when page size changes
            }}
            pageSizeOptions={[12, 24, 36, 48]}
            className="fixed bottom-0 left-0 right-0 z-10"
            disabled={loading}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Company"
        description={
          companyToDelete ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to delete{' '}
                <strong>{companyToDelete.name}</strong>
                {companyToDelete.code && ` (${companyToDelete.code})`}?
              </p>
              <p className="text-destructive text-xs">
                This action cannot be undone. All company data will be permanently removed.
              </p>
            </div>
          ) : (
            'Are you sure you want to delete this company?'
          )
        }
        variant="destructive"
        confirmText="Delete"
        icon={<AlertTriangle className="h-10 w-10 text-destructive" />}
      />
    </>
  );
}
