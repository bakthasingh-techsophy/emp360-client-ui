/**
 * Team Leave Applications Table Component
 * For managers to review and approve/reject team leave requests
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LeaveApplication } from '../types/leave.types';
import { format } from 'date-fns';
import { 
  Eye, 
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamLeaveApplicationsTableProps {
  applications: LeaveApplication[];
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function TeamLeaveApplicationsTable({ 
  applications, 
  onApprove,
  onReject 
}: TeamLeaveApplicationsTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionComments, setActionComments] = useState('');

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'default' as const, className: 'bg-amber-500 hover:bg-amber-600', icon: Clock },
      approved: { variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, className: '', icon: XCircle },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
    setActionType(null);
    setActionComments('');
  };

  const handleApproveClick = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setActionType('approve');
    setActionComments('');
  };

  const handleRejectClick = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setActionType('reject');
    setActionComments('');
  };

  const handleConfirmAction = () => {
    if (!selectedApplication) return;

    if (actionType === 'approve') {
      onApprove(selectedApplication.id, actionComments);
    } else if (actionType === 'reject') {
      if (!actionComments.trim()) {
        return; // Require reason for rejection
      }
      onReject(selectedApplication.id, actionComments);
    }

    setActionType(null);
    setSelectedApplication(null);
    setActionComments('');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No leave applications found
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(application.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{application.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{application.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{application.leaveTypeName}</span>
                      <Badge variant="outline" className="ml-2">
                        {application.leaveTypeCode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(application.startDate)}</div>
                      <div className="text-muted-foreground">to {formatDate(application.endDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{application.numberOfDays}</span> day{application.numberOfDays !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(application.appliedOn), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(application)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveClick(application)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectClick(application)}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Leave Application Details</DialogTitle>
            <DialogDescription>
              Review complete information about this leave request
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Header with Employee and Status */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(selectedApplication.employeeName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedApplication.employeeName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedApplication.id}</p>
                  </div>
                </div>
                {getStatusBadge(selectedApplication.status)}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    Leave Type
                  </div>
                  <p className="font-medium">
                    {selectedApplication.leaveTypeName} ({selectedApplication.leaveTypeCode})
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    Duration
                  </div>
                  <p className="font-medium">{selectedApplication.numberOfDays} day{selectedApplication.numberOfDays !== 1 ? 's' : ''}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Start Date
                  </div>
                  <p className="font-medium">{formatDate(selectedApplication.startDate)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    End Date
                  </div>
                  <p className="font-medium">{formatDate(selectedApplication.endDate)}</p>
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    Applied On
                  </div>
                  <p className="font-medium">
                    {format(new Date(selectedApplication.appliedOn), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  Reason
                </div>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedApplication.reason}
                </p>
              </div>

              {/* Action Buttons for Pending Applications */}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setDetailsOpen(false);
                      handleRejectClick(selectedApplication);
                    }}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setDetailsOpen(false);
                      handleApproveClick(selectedApplication);
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Action Dialog */}
      <Dialog open={actionType !== null} onOpenChange={() => setActionType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Add optional comments for the employee'
                : 'Please provide a reason for rejection'}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 py-4">
              {/* Application Summary */}
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Employee:</span>
                  <span className="text-sm">{selectedApplication.employeeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Leave Type:</span>
                  <span className="text-sm">{selectedApplication.leaveTypeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm">
                    {formatDate(selectedApplication.startDate)} - {formatDate(selectedApplication.endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Days:</span>
                  <span className="text-sm font-bold">{selectedApplication.numberOfDays} day(s)</span>
                </div>
              </div>

              {/* Comments/Reason Input */}
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {actionType === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection *'}
                </Label>
                <Textarea
                  id="comments"
                  placeholder={
                    actionType === 'approve' 
                      ? 'Add any comments for the employee...'
                      : 'Please explain why this leave is being rejected...'
                  }
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={actionType === 'reject' && !actionComments.trim()}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Approval
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
