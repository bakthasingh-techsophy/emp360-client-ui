/**
 * Leave Details Tab
 * View-only display of leave balance and history
 */

import { LeaveDetailsCard } from './LeaveDetailsCard';

interface LeaveDetailsTabProps {
  // Props kept for compatibility
}

export function LeaveDetailsTab({}: LeaveDetailsTabProps) {
  return (
    <div className="w-full">
      <LeaveDetailsCard />
    </div>
  );
}
