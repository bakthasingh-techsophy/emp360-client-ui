/**
 * Employment History Tab
 * View-only display of previous work experience with timeline
 */

import { EmploymentHistoryCard } from './EmploymentHistoryCard';

interface TimelineTabProps {
    // Props kept for compatibility
}

export function TimelineTab({}: TimelineTabProps) {
    return (
        <div className="w-full">
            <EmploymentHistoryCard />
        </div>
    );
}
