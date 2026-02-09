/**
 * Visitor Management Constants
 */

import { VisitorPurpose, VisitorStatus } from './types';

export const VISITOR_STATUS_LABELS: Record<VisitorStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  expired: 'Expired',
};

export const VISITOR_STATUS_COLORS: Record<VisitorStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  'checked-in': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'checked-out': 'bg-muted text-muted-foreground border-border',
  expired: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
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
