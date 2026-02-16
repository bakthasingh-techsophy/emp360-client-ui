/**
 * Holiday Cards Component
 * Wrapper around DataCards for holiday management
 * Handles all holiday-related logic: actions, selections, company management
 */

import React, { useState } from 'react';
import { DataCards, CardContentField, CardAction } from '@/components/common/DataCards';
import { HolidayCard } from './HolidayCard';
import { Holiday } from '../types';
import { Building2, Edit2, Trash2 } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useHoliday } from '@/contexts/HolidayContext';
import { useToast } from '@/hooks/use-toast';
import { CompanyAssignmentModal } from '@/components/context-aware/CompanyAssignmentModal';

interface HolidayCardsProps {
  holidays: Holiday[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalPages?: number;
    canNextPage?: boolean;
    totalItems?: number;
    pageSizeOptions?: number[];
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (holiday: Holiday) => void;
  isAdmin?: boolean;
  showEmptyState?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  searchQuery?: string;
  activeFiltersCount?: number;
  selection?: {
    enabled: boolean;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  };
}

export const HolidayCards: React.FC<HolidayCardsProps> = ({
  holidays,
  loading = false,
  error = null,
  pagination,
  onEdit,
  onDelete,
  isAdmin = false,
  showEmptyState = true,
  emptyStateTitle = 'No holidays found',
  emptyStateDescription = 'Get started by adding your first holiday',
  searchQuery = '',
  activeFiltersCount = 0,
  selection,
}) => {
  const { companies } = useCompany();
  const { updateHoliday } = useHoliday();
  const { toast } = useToast();

  // Company modal state
  const [companyModalState, setCompanyModalState] = useState<{
    isOpen: boolean;
    holidayId: string | null;
    holidayName: string;
    selectedCompanyIds: string[];
    isSaving: boolean;
  }>({
    isOpen: false,
    holidayId: null,
    holidayName: '',
    selectedCompanyIds: [],
    isSaving: false,
  });

  // Handle company modal open
  const handleOpenCompanyModal = (holiday: Holiday) => {
    setCompanyModalState({
      isOpen: true,
      holidayId: holiday.id,
      holidayName: holiday.name,
      selectedCompanyIds: holiday.companyIds,
      isSaving: false,
    });
  };

  // Handle company selection apply
  const handleApplyCompanies = async (selectedCompanyIds: string[]) => {
    if (!companyModalState.holidayId) return;

    setCompanyModalState(prev => ({ ...prev, isSaving: true }));
    try {
      const success = await updateHoliday(companyModalState.holidayId, {
        companyIds: selectedCompanyIds,
      });
      if (success) {
        toast({
          title: 'Success',
          description: 'Holiday companies updated successfully',
        });
        setCompanyModalState(prev => ({ ...prev, isOpen: false }));
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update holiday companies',
        variant: 'destructive',
      });
    } finally {
      setCompanyModalState(prev => ({ ...prev, isSaving: false }));
    }
  };

  // Define card content - just the holiday card component
  const contentFields: CardContentField<Holiday>[] = [
    {
      id: 'content',
      fullWidth: true,
      render: (holiday) => <HolidayCard holiday={holiday} />,
    },
  ];

  // Define card actions
  const cardActions: CardAction<Holiday>[] = [
    {
      id: 'companies',
      label: 'Companies',
      icon: <Building2 className="h-4 w-4" />,
      variant: 'outline',
      onClick: (holiday) => handleOpenCompanyModal(holiday),
    },
    ...(isAdmin && onEdit
      ? [
          {
            id: 'edit',
            label: 'Edit',
            icon: <Edit2 className="h-4 w-4" />,
            variant: 'outline' as const,
            onClick: (holiday: Holiday) => onEdit(holiday),
          },
        ]
      : []),
    ...(isAdmin && onDelete
      ? [
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const,
            onClick: (holiday: Holiday) => onDelete(holiday),
          },
        ]
      : []),
  ];

  // Empty state message based on filters
  const getEmptyStateDescription = () => {
    if (searchQuery || activeFiltersCount > 0) {
      return 'Try adjusting your search or filters';
    }
    return emptyStateDescription;
  };

  return (
    <>
      <DataCards
        data={holidays}
        contentFields={contentFields}
        hoverEffect={false}
        actions={cardActions}
        loading={loading}
        error={error}
        pagination={pagination}
        fixedPagination={true}
        paginationVariant="default"
        selection={
          selection
            ? {
                enabled: selection.enabled,
                onSelectionChange: selection.onSelectionChange,
                getItemId: (item) => item.id,
              }
            : undefined
        }
        emptyState={
          showEmptyState
            ? {
                title: emptyStateTitle,
                description: getEmptyStateDescription(),
              }
            : undefined
        }
        loadingState={{
          message: 'Loading holidays...',
        }}
        gridCols={{
          sm: 1,
          md: 2,
          lg: 3,
          xl: 4,
        }}
        ariaLabel="Holiday management cards"
      />

      {/* Company Modal */}
      {companyModalState.isOpen && companyModalState.holidayId && (
        <CompanyAssignmentModal
          isOpen={companyModalState.isOpen}
          onClose={() => setCompanyModalState(prev => ({ ...prev, isOpen: false }))}
          onApply={handleApplyCompanies}
          selectedCompanyIds={companyModalState.selectedCompanyIds}
          companies={companies}
          isLoading={companyModalState.isSaving}
          title="Assign Companies to Holiday"
          description={`Select companies where "${companyModalState.holidayName}" applies`}
        />
      )}
    </>
  );
};
