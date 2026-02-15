/**
 * Asset Management Main Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { ActiveFilter, AvailableFilter, CurrentSort, SortableField } from '@/components/GenericToolbar/types';
import { AssetsTable } from './components/AssetsTable';
import { ASSET_STATUS_OPTIONS, ASSET_CATEGORY_OPTIONS } from './constants';

export function AssetManagement() {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [refreshTrigger] = useState(0);
  const [currentSort, setCurrentSort] = useState<CurrentSort | null>({
    field: 'createdAt',
    direction: -1, // -1 for descending (latest first)
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'assetName', 'assetCode', 'category', 'status', 'assignedTo', 'purchaseDate', 'actions'
  ]);

  // Available columns for configure view
  const allColumns = [
    { id: 'assetName', label: 'Asset Name' },
    { id: 'assetCode', label: 'Asset Code' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'assignedTo', label: 'Assigned To' },
    { id: 'purchaseDate', label: 'Purchase Date' },
    { id: 'purchasePrice', label: 'Purchase Price' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'location', label: 'Location' },
    { id: 'serialNumber', label: 'Serial Number' },
    { id: 'modelNumber', label: 'Model Number' },
    { id: 'actions', label: 'Actions' },
  ];

  // Sortable fields configuration
  const sortableFields: SortableField[] = [
    { id: 'createdAt', label: 'Created Date', type: 'date' },
    { id: 'updatedAt', label: 'Updated Date', type: 'date' },
    { id: 'assetName', label: 'Asset Name', type: 'text' },
    { id: 'assetCode', label: 'Asset Code', type: 'text' },
    { id: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    { id: 'purchasePrice', label: 'Purchase Price', type: 'number' },
  ];

  // Handlers
  const handleAddAsset = () => {
    navigate('/asset-management?mode=create');
  };

  const handleVisibleColumnsChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  // Filter configuration
  const filterConfig: AvailableFilter[] = [
    // Asset Status
    {
      id: 'status',
      label: 'Asset Status',
      type: 'multiselect',
      operators: [
        { value: 'in' as const, label: 'Includes any' },
        { value: 'all' as const, label: 'Includes all' },
        { value: 'nin' as const, label: 'Excludes' },
      ],
      options: ASSET_STATUS_OPTIONS.map(({ value, label }) => ({ value, label })),
    },
    // Category
    {
      id: 'category',
      label: 'Category',
      type: 'multiselect',
      operators: [
        { value: 'in' as const, label: 'Includes any' },
        { value: 'all' as const, label: 'Includes all' },
        { value: 'nin' as const, label: 'Excludes' },
      ],
      options: ASSET_CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label })),
    },
    // Asset Name
    {
      id: 'assetName',
      label: 'Asset Name',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter asset name',
    },
    // Asset Code
    {
      id: 'assetCode',
      label: 'Asset Code',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter asset code',
    },
    // Serial Number
    {
      id: 'serialNumber',
      label: 'Serial Number',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter serial number',
    },
    // Vendor
    {
      id: 'vendor',
      label: 'Vendor',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter vendor name',
    },
    // Location
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      operators: [
        { value: 'regex' as const, label: 'Contains' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Enter location',
    },
    // Purchase Date Range
    {
      id: 'purchaseDate',
      label: 'Purchase Date',
      type: 'date',
      operators: [
        { value: 'gte' as const, label: 'After or on' },
        { value: 'lte' as const, label: 'Before or on' },
        { value: 'eq' as const, label: 'Equals' },
      ],
      placeholder: 'Select date',
    },
    // Assigned Employee ID
    {
      id: 'assignedTo',
      label: 'Assigned To',
      type: 'text',
      operators: [
        { value: 'eq' as const, label: 'Equals' },
        { value: 'regex' as const, label: 'Contains' },
      ],
      placeholder: 'Enter employee ID',
    },
  ];

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Asset Management</h1>
          </div>
          <Button onClick={handleAddAsset} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Track and manage company assets, assignments, and inventory
        </p>
      </div>

      {/* Generic Toolbar */}
      <GenericToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search assets by name, code, or serial..."
        showFilters={true}
        availableFilters={filterConfig}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        showSort={true}
        sortableFields={sortableFields}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
        showConfigureView={true}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        allColumns={allColumns}
      />

      {/* Assets Table */}
      <AssetsTable
        searchQuery={searchQuery}
        activeFilters={activeFilters}
        currentSort={currentSort}
        visibleColumns={visibleColumns}
        refreshTrigger={refreshTrigger}
      />
    </PageLayout>
  );
}
