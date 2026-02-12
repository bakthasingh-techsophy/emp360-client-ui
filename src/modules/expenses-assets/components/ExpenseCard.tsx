/**
 * Expense Card Component
 * Displays expense summary in list/grid view
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpenseListItem } from '../types/expense.types';
import { ExpenseStatusBadge } from './ExpenseStatusBadge';
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
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(expense)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${expense.type === 'advance' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                {expense.type === 'advance' ? 'Advance' : 'Expense'}
              </span>
            </div>
            <h3 className="font-semibold text-base truncate">{expense.description}</h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">ID: {expense.id}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{formatCurrency(expense.totalRequestedAmount || 0)}</div>
            <ExpenseStatusBadge status={expense.status} className="mt-1" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(expense.createdAt), 'MMM dd, yyyy')}</span>
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
            <span className="font-medium">{expense.lineItemIds?.length || 0}</span> expense {(expense.lineItemIds?.length || 0) === 1 ? 'item' : 'items'}
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
