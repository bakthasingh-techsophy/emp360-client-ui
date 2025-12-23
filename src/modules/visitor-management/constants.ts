/**
 * Visitor Management Constants
 */

import { VisitorPurpose, VisitorStatus } from './types';

export const VISITOR_STATUS_LABELS: Record<VisitorStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  expired: 'Expired',
};

export const VISITOR_STATUS_COLORS: Record<VisitorStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'checked-in': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'checked-out': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export const PURPOSE_LABELS: Record<VisitorPurpose, string> = {
  meeting: 'Meeting',
  interview: 'Interview',
  delivery: 'Delivery',
  maintenance: 'Maintenance',
  vendor: 'Vendor',
  personal: 'Personal Visit',
  other: 'Other',
};

export const PURPOSE_OPTIONS = Object.entries(PURPOSE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ID_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'national_id', label: 'National ID' },
  { value: 'other', label: 'Other' },
];

export const REGISTRATION_TYPE_LABELS = {
  'pre-registered': 'Pre-registered',
  'instant': 'Instant Check-in',
};
