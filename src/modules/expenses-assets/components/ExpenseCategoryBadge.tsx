/**
 * Expense Category Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { ExpenseCategory } from '../types/expense.types';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_CATEGORY_ICONS,
} from '../constants/expense.constants';

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategory;
  showIcon?: boolean;
  className?: string;
}

export function ExpenseCategoryBadge({
  category,
  showIcon = true,
  className = '',
}: ExpenseCategoryBadgeProps) {
  return (
    <Badge className={`${EXPENSE_CATEGORY_COLORS[category]} ${className}`}>
      {showIcon && <span className="mr-1">{EXPENSE_CATEGORY_ICONS[category]}</span>}
      {EXPENSE_CATEGORY_LABELS[category]}
    </Badge>
  );
}
