/**
 * Finance Tab - Banking Details
 * View-only display of bank account information
 */

import { BankingDetailsCard } from './BankingDetailsCard';

interface FinancesTabProps {
    // Props kept for compatibility
}

export function FinancesTab({}: FinancesTabProps) {
    return (
        <div className="w-full">
            <BankingDetailsCard />
        </div>
    );
}
