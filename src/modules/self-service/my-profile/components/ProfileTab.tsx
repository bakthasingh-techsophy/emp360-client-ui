/**
 * Profile Tab - General Details
 * View-only display of personal information from GeneralDetailsForm
 */

import { GeneralDetailsCard } from './GeneralDetailsCard';

interface ProfileTabProps {
    // Props kept for compatibility
}

export function ProfileTab({}: ProfileTabProps) {
    return (
        <div className="w-full">
            <GeneralDetailsCard />
        </div>
    );
}
