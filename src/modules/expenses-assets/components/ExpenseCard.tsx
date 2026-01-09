/**
 * Expense Card Component
 * Displays expense summary in list/grid view
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpenseListItem } from '../types/expense.types';
import { ExpenseStatusBadge } from './ExpenseStatusBadge';
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge';
import { format } from 'date-fns';
import { Eye, Edit, X, Clock, User } from 'lucide-react';

interface ExpenseCardProps {
  expense: ExpenseListItem;
  onView: (expense: ExpenseListItem) => void;
  onEdit?: (expense: ExpenseListItem) => void;
  onCancel?: (expense: ExpenseListItem) => void;
  showActions?: boolean;
}

export function ExpenseCard({ expense, onView, onEdit, onCancel, showActions = true }: ExpenseCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: expense.currency,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(expense)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {expense.lineItems.length > 0 && (
                <ExpenseCategoryBadge category={expense.lineItems[0].category} showIcon />
              )}
              {expense.lineItems.length > 1 && (
                <span className="text-xs text-muted-foreground">+{expense.lineItems.length - 1} more</span>
              )}
              {expense.isUrgent && (
                <span className="text-xs font-medium text-red-600 dark:text-red-400">URGENT</span>
              )}
            </div>
            <h3 className="font-semibold text-base truncate">{expense.claimTitle}</h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{expense.purpose}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{formatCurrency(expense.amount)}</div>
            <ExpenseStatusBadge status={expense.status} className="mt-1" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(expense.fromDate), 'MMM dd, yyyy')} - {format(new Date(expense.toDate), 'MMM dd, yyyy')}</span>
            {expense.daysInReview > 0 && (
              <span className="text-xs">({expense.daysInReview} days in review)</span>
            )}
          </div>

          {expense.nextApproverName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Pending with: {expense.nextApproverName}</span>
            </div>
          )}

          <div className="text-muted-foreground">
            <span className="font-medium">{expense.lineItems.length}</span> expense {expense.lineItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {showActions && (expense.canEdit || expense.canCancel) && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onView(expense);
              }}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {expense.canEdit && onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(expense);
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            
            {expense.canCancel && onCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(expense);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
