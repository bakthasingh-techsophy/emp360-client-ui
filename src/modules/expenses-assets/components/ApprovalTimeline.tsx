/**
 * Approval Timeline Component
 * Shows the approval history and current status
 */

import { ApprovalRecord, ApprovalLevel } from '../types/expense.types';
import { APPROVAL_LEVEL_LABELS } from '../constants/expense.constants';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApprovalTimelineProps {
  approvalHistory: ApprovalRecord[];
  currentLevel: ApprovalLevel | null;
}

export function ApprovalTimeline({ approvalHistory, currentLevel }: ApprovalTimelineProps) {
  const levels: ApprovalLevel[] = ['level1', 'level2', 'level3'];
  
  const getStepStatus = (level: ApprovalLevel) => {
    const record = approvalHistory.find((r) => r.level === level);
    if (record) {
      if (record.action === 'approve' || record.action === 'confirm_payment') {
        return 'approved';
      } else if (record.action === 'reject') {
        return 'rejected';
      } else {
        return 'returned';
      }
    }
    if (currentLevel === level) {
      return 'pending';
    }
    return 'not-started';
  };

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'returned':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Approval Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {levels.map((level, index) => {
            const stepStatus = getStepStatus(level);
            const record = approvalHistory.find((r) => r.level === level);
            
            return (
              <div key={level}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    {getStepIcon(stepStatus)}
                    {index < levels.length - 1 && (
                      <div className={`w-0.5 h-12 my-1 ${
                        stepStatus === 'approved' ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-sm">{APPROVAL_LEVEL_LABELS[level]}</div>
                    {record ? (
                      <div className="mt-1 space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {record.action === 'approve' && 'Approved'}
                          {record.action === 'reject' && 'Rejected'}
                          {record.action === 'return' && 'Returned for clarification'}
                          {record.action === 'confirm_payment' && 'Payment Confirmed'}
                          {' by ' + record.approverName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(record.timestamp), 'MMM dd, yyyy hh:mm a')}
                        </div>
                        {record.comments && (
                          <div className="text-xs bg-muted p-2 rounded mt-2">
                            <strong>Comment:</strong> {record.comments}
                          </div>
                        )}
                        {record.paymentDetails && (
                          <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded mt-2">
                            <div><strong>Payment Reference:</strong> {record.paymentDetails.paymentReference}</div>
                            <div><strong>Transaction ID:</strong> {record.paymentDetails.transactionId}</div>
                            <div><strong>Payment Date:</strong> {format(new Date(record.paymentDetails.paymentDate), 'MMM dd, yyyy')}</div>
                          </div>
                        )}
                      </div>
                    ) : stepStatus === 'pending' ? (
                      <div className="text-xs text-blue-600 mt-1">Pending review</div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1">Not yet reviewed</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
