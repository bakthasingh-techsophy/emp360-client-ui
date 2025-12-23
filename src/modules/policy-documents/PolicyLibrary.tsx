/**
 * Policy Library Main Page
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { PolicyStatsCards } from './components/PolicyStatsCards';
import { PolicyCard } from './components/PolicyCard';
import { Policy, PolicyStats } from './types';
import { mockPolicies } from './mockData';
import { FileText } from 'lucide-react';
import { ReactNode } from 'react';

export function PolicyLibrary() {
  const navigate = useNavigate();

  // State
  const [policies] = useState<Policy[]>(mockPolicies);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

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

  // Calculate stats
  const stats: PolicyStats = useMemo(() => {
    return {
      totalPolicies: policies.length,
      publishedPolicies: policies.filter((p) => p.status === 'published').length,
      draftPolicies: policies.filter((p) => p.status === 'draft').length,
      mandatoryPolicies: policies.filter((p) => p.mandatory).length,
    };
  }, [policies]);

  // Filter and search policies
  const filteredPolicies = useMemo(() => {
    let filtered = [...policies];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    activeFilters.forEach((filter) => {
      switch (filter.id) {
        case 'status':
          filtered = filtered.filter((p) => p.status === filter.value);
          break;
        case 'category':
          filtered = filtered.filter((p) => p.category === filter.value);
          break;
        case 'mandatory':
          filtered = filtered.filter((p) => p.mandatory === (filter.value === 'true'));
          break;
        case 'effectiveDate':
          if (filter.value?.from) {
            filtered = filtered.filter((p) => {
              const effectiveDate = new Date(p.effectiveDate);
              const fromDate = new Date(filter.value.from);
              return effectiveDate >= fromDate;
            });
          }
          if (filter.value?.to) {
            filtered = filtered.filter((p) => {
              const effectiveDate = new Date(p.effectiveDate);
              const toDate = new Date(filter.value.to);
              return effectiveDate <= toDate;
            });
          }
          break;
        case 'expiryDate':
          if (filter.value?.from) {
            filtered = filtered.filter((p) => {
              if (!p.expiryDate) return false;
              const expiryDate = new Date(p.expiryDate);
              const fromDate = new Date(filter.value.from);
              return expiryDate >= fromDate;
            });
          }
          if (filter.value?.to) {
            filtered = filtered.filter((p) => {
              if (!p.expiryDate) return false;
              const expiryDate = new Date(p.expiryDate);
              const toDate = new Date(filter.value.to);
              return expiryDate <= toDate;
            });
          }
          break;
      }
    });

    return filtered;
  }, [policies, searchQuery, activeFilters]);

  // Handlers
  const handleAddPolicy = () => {
    navigate('/policy-form?mode=create');
  };

  const handleEdit = (policy: Policy) => {
    navigate(`/policy-form?mode=edit&id=${policy.id}`);
  };

  const handleView = (policy: Policy) => {
    // Open document in new tab
    const latestVersion = policy.versions[0];
    if (latestVersion.documentUrl) {
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
      action: () => {
        console.log('Delete policy:', policy.id);
        // API call here
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
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Policy Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Centralized repository of company policies, procedures, and guidelines
            </p>
          </div>

          {/* Stats Cards */}
          <PolicyStatsCards stats={stats} />

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
            showAddButton={isAdmin}
            addButtonLabel="Upload Policy"
            onAdd={handleAddPolicy}
          />

          {/* Policy Cards Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading policies...
            </div>
          ) : filteredPolicies.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onView={handleView}
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
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
