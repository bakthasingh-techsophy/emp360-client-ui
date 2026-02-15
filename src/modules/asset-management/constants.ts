/**
 * Asset Management Constants
 */

import type { AssetStatus, AssetCategory } from './types';

export const ASSET_STATUS_OPTIONS: { value: AssetStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'assigned', label: 'Assigned', color: 'blue' },
  { value: 'retired', label: 'Retired', color: 'gray' },
  { value: 'under-maintenance', label: 'Under Maintenance', color: 'orange' },
];

export const ASSET_CATEGORY_OPTIONS: { value: AssetCategory; label: string }[] = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Vehicles', label: 'Vehicles' },
  { value: 'IT Equipment', label: 'IT Equipment' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Other', label: 'Other' },
];

export const DEFAULT_ASSET_FILTERS = {
  status: [],
  category: [],
  assignedTo: undefined,
  searchTerm: '',
};
