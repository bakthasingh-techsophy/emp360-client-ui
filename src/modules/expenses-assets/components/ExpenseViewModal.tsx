/**
 * View Expense Modal Component
 * Displays comprehensive expense/advance details in a modal dialog
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, Building2, Clock, 
  FileText, Edit, X, DollarSign, Receipt, Copy, Check, XIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import { Expense } from '../types/expense.types';
import { 
  EXPENSE_STATUS_LABELS, 
  EXPENSE_STATUS_COLORS,
  EXPENSE_TYPE_LABELS
} from '../constants/expense.constants';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Timeline } from '@/components/timeline/Timeline';
import { TimelineItem } from '@/components/timeline/types';
import { useState } from 'react';

interface ExpenseViewModalProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (expense: Expense) => void;
  onApprove?: (expense: Expense) => void;
  onReject?: (expense: Expense) => void;
}

export function ExpenseViewModal({ 
  expense, 
  open, 
  onClose, 
  onEdit,
  onApprove,
  onReject
}: ExpenseViewModalProps) {
  if (!expense) return null;

  const { toast } = useToast();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const InfoField = ({ icon: Icon, label, value, copyable = false }: { 
    icon: any; 
    label: string; 
    value: string | React.ReactNode;
    copyable?: boolean;
  }) => {
    const handleCopy = async () => {
      if (typeof value === 'string') {
        try {
          await navigator.clipboard.writeText(value);
          toast({
            title: "Copied!",
            description: `${label} copied to clipboard`,
          });
        } catch (err) {
          toast({
            title: "Failed to copy",
            description: "Could not copy to clipboard",
            variant: "destructive",
          });
        }
      }
    };

    return (
      <div className="flex items-start gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <div className="flex items-start gap-1.5">
            <p className="text-sm font-medium break-words">{value}</p>
            {copyable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 flex-shrink-0"
                onClick={handleCopy}
                title={`Copy ${label.toLowerCase()}`}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Description handling
  const descriptionLimit = 120;
  const isLongDescription = expense.description.length > descriptionLimit;
  const displayDescription = showFullDescription || !isLongDescription
    ? expense.description
    : `${expense.description.slice(0, descriptionLimit)}...`;

  // Build timeline items from expense history
  const timelineItems: TimelineItem[] = [
    {
      id: 'created',
      type: 'created',
      timestamp: new Date(expense.createdAt),
      data: {
        action: 'Created',
        description: 'Expense request created',
        timestamp: expense.createdAt,
      }
    },
    ...(expense.submittedAt ? [{
      id: 'submitted',
      type: 'submitted',
      timestamp: new Date(expense.submittedAt),
      data: {
        action: 'Submitted',
        description: 'Submitted for approval',
        timestamp: expense.submittedAt,
      }
    }] : []),
    ...(expense.approvalHistory || []).map((approval, idx) => ({
      id: `approval-${idx}`,
      type: approval.action === 'approve' ? 'approved' : 'rejected',
      timestamp: new Date(approval.timestamp),
      data: {
        action: approval.action === 'approve' ? 'Approved' : 'Rejected',
        description: approval.comments || `${approval.action} by ${approval.approverName}`,
        approver: approval.approverName,
        role: approval.approverRole,
        level: approval.level,
        comments: approval.comments,
        timestamp: approval.timestamp,
      }
    })),
    ...(expense.paidAt ? [{
      id: 'paid',
      type: 'paid',
      timestamp: new Date(expense.paidAt),
      data: {
        action: 'Paid',
        description: 'Payment completed',
        timestamp: expense.paidAt,
      }
    }] : []),
  ];

  const timelineTypeConfigs = [
    {
      type: 'created',
      renderer: (item: TimelineItem) => (
        <div className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{item.data.action}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.data.timestamp), 'MMM dd, yyyy hh:mm a')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{item.data.description}</p>
        </div>
      ),
      icon: { component: FileText },
      color: { dot: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' }
    },
    {
      type: 'submitted',
      renderer: (item: TimelineItem) => (
        <div className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{item.data.action}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.data.timestamp), 'MMM dd, yyyy hh:mm a')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{item.data.description}</p>
        </div>
      ),
      icon: { component: Clock },
      color: { dot: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-400' }
    },
    {
      type: 'approved',
      renderer: (item: TimelineItem) => (
        <div className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{item.data.action}</span>
              <Badge variant="outline" className="text-xs">
                Level {item.data.level?.replace('level', '')}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.data.timestamp), 'MMM dd, yyyy hh:mm a')}
            </span>
          </div>
          <p className="text-xs font-medium">{item.data.approver}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.data.role?.replace('_', ' ')}</p>
          {item.data.comments && (
            <p className="text-xs text-muted-foreground mt-1 italic">"{item.data.comments}"</p>
          )}
        </div>
      ),
      icon: { component: Check },
      color: { dot: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' }
    },
    {
      type: 'rejected',
      renderer: (item: TimelineItem) => (
        <div className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{item.data.action}</span>
              <Badge variant="outline" className="text-xs">
                Level {item.data.level?.replace('level', '')}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.data.timestamp), 'MMM dd, yyyy hh:mm a')}
            </span>
          </div>
          <p className="text-xs font-medium">{item.data.approver}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.data.role?.replace('_', ' ')}</p>
          {item.data.comments && (
            <p className="text-xs text-muted-foreground mt-1 italic">"{item.data.comments}"</p>
          )}
        </div>
      ),
      icon: { component: XIcon },
      color: { dot: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400' }
    },
    {
      type: 'paid',
      renderer: (item: TimelineItem) => (
        <div className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-green-600 dark:text-green-400">{item.data.action}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.data.timestamp), 'MMM dd, yyyy hh:mm a')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{item.data.description}</p>
        </div>
      ),
      icon: { component: DollarSign },
      color: { dot: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' }
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden" hideClose>
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-xl">{expense.firstName} {expense.lastName} - {expense.id}</DialogTitle>
                <Badge className={EXPENSE_STATUS_COLORS[expense.status]}>
                  {EXPENSE_STATUS_LABELS[expense.status]}
                </Badge>
                <Badge variant="outline">
                  {EXPENSE_TYPE_LABELS[expense.type]}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {displayDescription}
                {isLongDescription && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 ml-1 text-xs"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show more
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Employee Information */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee Information
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <InfoField 
                  icon={User} 
                  label="Name" 
                  value={expense.employeeName} 
                />
                <InfoField 
                  icon={Building2} 
                  label="Employee ID" 
                  value={expense.employeeId} 
                />
                <InfoField 
                  icon={Building2} 
                  label="Department" 
                  value={expense.department} 
                />
                <InfoField 
                  icon={Mail} 
                  label="Email" 
                  value={expense.employeeEmail}
                  copyable
                />
                <InfoField 
                  icon={Phone} 
                  label="Phone" 
                  value={expense.employeePhone}
                  copyable
                />
              </div>
            </div>

            <Separator />

            {/* Financial Summary */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Summary
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <InfoField 
                  icon={DollarSign} 
                  label="Total Amount" 
                  value={
                    <span className="text-lg font-bold text-primary">
                      ${expense.amount.toLocaleString()} {expense.currency}
                    </span>
                  }
                />
                <InfoField 
                  icon={Receipt} 
                  label="Number of Items" 
                  value={`${expense.lineItems.length} ${expense.lineItems.length === 1 ? 'item' : 'items'}`}
                />
              </div>
            </div>

            <Separator />

            {/* Timeline & History */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline & History
              </h3>
              <Timeline
                items={timelineItems}
                typeConfigs={timelineTypeConfigs}
                autoSort={true}
                sortOrder="asc"
              />
            </div>

            {/* Additional Notes */}
            {expense.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Additional Notes
                  </h3>
                  <p className="text-sm text-muted-foreground">{expense.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-background">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(expense)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onReject && (
            <Button variant="outline" onClick={() => onReject(expense)} className="text-red-600 hover:text-red-700">
              <XIcon className="h-4 w-4 mr-2" />
              Reject
            </Button>
          )}
          {onApprove && (
            <Button onClick={() => onApprove(expense)}>
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
