/**
 * Event History Tab
 * View-only display of career progression and events
 */

import { EventHistoryCard } from './EventHistoryCard';

interface EventHistoryTabProps {
  // Props kept for compatibility
}

export function EventHistoryTab({}: EventHistoryTabProps) {
  return (
    <div className="w-full">
      <EventHistoryCard />
    </div>
  );
}
