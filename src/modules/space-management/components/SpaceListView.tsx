/**
 * Space List View Component
 * Displays grid of space cards with loading, empty states, and pagination
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Building } from 'lucide-react';
import { SpaceCard } from './SpaceCard';
import { Space } from '../spaceTypes';
import { useSpace } from '@/contexts/SpaceContext';
import { DefaultPagination } from '@/components/common/Pagination/DefaultPagination';
import { ActiveFilter } from '@/components/GenericToolbar/types';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';
import { apiSearchSpaces } from '@/services/spaceService';
import { resolveAuth } from '@/store/localStorage';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SpaceListViewProps {
  searchQuery: string;
  activeFilters: ActiveFilter[];
  selectionMode: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  refreshTrigger?: number;
  onEdit?: (space: Space) => void;
  onView?: (space: Space) => void;
}

export function SpaceListView({
  searchQuery,
  activeFilters,
  selectionMode,
  selectedIds,
  onSelectionChange,
  refreshTrigger = 0,
  onEdit,
  onView,
}: SpaceListViewProps) {
  const { deleteSpace } = useSpace();
  const { toast } = useToast();
  
  // List state
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);

  // Ref to track previous dependency values
  const prevDepsRef = useRef<{
    activeFilters: ActiveFilter[];
    searchQuery: string;
    pageIndex: number;
    pageSize: number;
    refreshTrigger: number;
  } | null>(null);

  // Fetch spaces data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get auth from localStorage
      const { accessToken, tenant } = resolveAuth();
      
      // Build the search request
      const searchRequest = buildUniversalSearchRequest(activeFilters, searchQuery);

      // Call API
      const result = await apiSearchSpaces(searchRequest, pageIndex, pageSize, tenant ?? "", accessToken ?? undefined);

      if (result.success && result.data) {
        setSpaces(result.data.content || []);
        setTotalItems(result.data.totalElements || 0);
      } else {
        toast({
          title: 'Failed to load spaces',
          description: result.message || 'An error occurred while fetching spaces',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast({
        title: 'Failed to load spaces',
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

    // Check if dependencies actually changed
    const depsChanged = !prevDepsRef.current || 
      JSON.stringify(prevDepsRef.current) !== JSON.stringify(currentDeps);

    if (depsChanged) {
      prevDepsRef.current = currentDeps;
      fetchData();
    }
  }, [activeFilters, searchQuery, pageIndex, pageSize, refreshTrigger, fetchData]);

  const handleSelectChange = (spaceId: string, selected: boolean) => {
    const newSelectedIds = selected
      ? [...selectedIds, spaceId]
      : selectedIds.filter((id) => id !== spaceId);

    onSelectionChange(newSelectedIds);
  };

  const handleDeleteClick = (space: Space) => {
    setSpaceToDelete(space);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!spaceToDelete) return;

    try {
      await deleteSpace(spaceToDelete.id);
      setDeleteDialogOpen(false);
      setSpaceToDelete(null);
      fetchData(); // Refresh the list
      toast({
        title: 'Space deleted',
        description: `"${spaceToDelete.spaceName}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Failed to delete space:', error);
      toast({
        title: 'Failed to delete space',
        description: 'An error occurred while deleting the space',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0); // Reset to first page
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize);
  const canNextPage = pageIndex < totalPages - 1;

  // Loading state
  if (loading && spaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading spaces...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!spaces || spaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No spaces found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery || activeFilters.length > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first space'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Space Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            onView={onView}
            selectionMode={selectionMode}
            selected={selectedIds.includes(space.id)}
            onSelectChange={(selected) => handleSelectChange(space.id, selected)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <DefaultPagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalPages={totalPages}
          canNextPage={canNextPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[12, 24, 36, 48]}
          className="fixed bottom-0 left-0 right-0 z-10"
          disabled={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{spaceToDelete?.spaceName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSpaceToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
