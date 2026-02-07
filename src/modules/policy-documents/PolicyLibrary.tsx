/**
 * Policy Library Main Page
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { PolicyCard } from './components/PolicyCard';
import { Policy, PolicyVersion } from './types';
import { FileText, Upload } from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { DefaultPagination } from '@/components/common/Pagination/DefaultPagination';
import { usePolicy } from '@/contexts/PolicyContext';
import { ActiveFilter } from '@/components/GenericToolbar/types';
import { buildUniversalSearchRequest } from '@/components/GenericToolbar/searchBuilder';
import { useLayoutContext } from '@/contexts/LayoutContext';

export function PolicyLibrary() {
  const navigate = useNavigate();
  const { refreshPolicies, deletePolicyById, refreshPolicyVersions, isLoading } = usePolicy();
  const { selectedCompanyScope } = useLayoutContext();

  // State
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
    selectedCompanyScope: string | null | undefined;
  } | null>(null);

  const loadPolicies = async () => {
    try {
      // Build universal search request from filters and search query
      const searchRequest = buildUniversalSearchRequest(
        activeFilters,
        searchQuery,
        ['name', 'description', 'category', 'status'],
      );

      const result = await refreshPolicies(searchRequest, pageIndex, pageSize);
      if (result) {
        setPolicies(result.content || []);
        setTotalItems(result.totalElements || 0);
        
        // Load all policy versions for displaying latest version info
        const versionsResult = await refreshPolicyVersions({}, 0, 1000);
        if (versionsResult) {
          setPolicyVersions(versionsResult.content || []);
        }
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
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
      prevDepsRef.current.refreshTrigger !== refreshTrigger ||
      prevDepsRef.current.selectedCompanyScope !== selectedCompanyScope;

    if (!depsChanged) return;

    // Update the ref with current values
    prevDepsRef.current = {
      activeFilters,
      searchQuery,
      pageIndex,
      pageSize,
      refreshTrigger,
      selectedCompanyScope,
    };

    loadPolicies();
  }, [
    activeFilters,
    searchQuery,
    pageIndex,
    pageSize,
    refreshTrigger,
    selectedCompanyScope,
  ]);

  // Get latest version for a policy
  const getLatestVersion = (versionIds: string[]): PolicyVersion | undefined => {
    if (versionIds.length === 0) return undefined;
    return policyVersions.find(v => v.id === versionIds[0]);
  };

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

  // Mock user role - in real app, get from auth context
  const isAdmin = true; // Change to false to test employee view

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize);
  const canNextPage = pageIndex < totalPages - 1;

  // Handlers
  const handleAddPolicy = () => {
    navigate('/policy-form?mode=create');
  };

  const handleEdit = (policy: Policy) => {
    navigate(`/policy-form?mode=edit&id=${policy.id}`);
  };

  const handleManageVersions = (policy: Policy) => {
    navigate(`/policy-versions?id=${policy.id}`);
  };

  const handleView = (policy: Policy) => {
    // Open document in new tab
    const latestVersion = getLatestVersion(policy.versionsIds);
    if (latestVersion?.documentUrl) {
      window.open(latestVersion.documentUrl, '_blank');
    }
  };

  const handleDelete = (policy: Policy) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Policy',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{policy.name}</strong>?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. The policy document will be permanently removed.
          </p>
        </div>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
      action: async () => {
        const success = await deletePolicyById(policy.id);
        if (success) {
          // Trigger refresh by incrementing refreshTrigger
          setRefreshTrigger(prev => prev + 1);
        }
      },
    });
  };

  // Filter configuration for GenericToolbar
  const filterConfig = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      id: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { value: 'hr', label: 'Human Resources' },
        { value: 'it', label: 'Information Technology' },
        { value: 'security', label: 'Security' },
        { value: 'compliance', label: 'Compliance' },
        { value: 'general', label: 'General' },
        { value: 'safety', label: 'Safety' },
      ],
    },
    {
      id: 'mandatory',
      label: 'Mandatory',
      type: 'boolean' as const,
    },
    {
      id: 'effectiveDate',
      label: 'Effective Date',
      type: 'date' as const,
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
      type: 'date' as const,
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
                <FileText className="h-8 w-8" />
                Policy Library
              </h1>
              <p className="text-muted-foreground mt-1">
                Centralized repository of company policies, procedures, and guidelines
              </p>
            </div>
            {isAdmin && (
              <Button onClick={handleAddPolicy} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Policy
              </Button>
            )}
          </div>

          {/* Toolbar */}
          <GenericToolbar
            showSearch
            searchPlaceholder="Search policies by name, description, or category..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters
            availableFilters={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport={false}
            showConfigureView={false}
          />

          {/* Policy Cards Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading policies...
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No policies found</h3>
              <p className="text-muted-foreground">
                {searchQuery || activeFilters.length > 0
                  ? 'Try adjusting your search or filters'
                  : isAdmin
                  ? 'Get started by uploading your first policy'
                  : 'No policies are currently available'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {policies.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onView={handleView}
                    onEdit={isAdmin ? handleEdit : undefined}
                    onManageVersions={isAdmin ? handleManageVersions : undefined}
                    onDelete={isAdmin ? handleDelete : undefined}
                    isAdmin={isAdmin}
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
                  setPageIndex(0);
                }}
                pageSizeOptions={[12, 24, 36, 48]}
                className="fixed bottom-0 left-0 right-0 z-10"
                disabled={isLoading}
              />
            </>
          )}
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
