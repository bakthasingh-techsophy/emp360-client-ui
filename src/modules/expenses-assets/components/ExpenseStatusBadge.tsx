/**
 * Expense Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { ExpenseStatus } from '../types/expense.types';
import { EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS } from '../constants/expense.constants';

interface ExpenseStatusBadgeProps {
  status: ExpenseStatus;
  className?: string;
}

export function ExpenseStatusBadge({ status, className = '' }: ExpenseStatusBadgeProps) {
  return (
    <Badge className={`${EXPENSE_STATUS_COLORS[status]} ${className}`}>
      {EXPENSE_STATUS_LABELS[status]}
    </Badge>
  );
}
