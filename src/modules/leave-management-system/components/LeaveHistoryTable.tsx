/**
 * Leave History Table Component
 * Displays all leave applications with status and actions
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeaveApplication } from '../types/leave.types';
import { format } from 'date-fns';
import { 
  MoreVertical, 
  Eye, 
  X, 
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface LeaveHistoryTableProps {
  applications: LeaveApplication[];
  onCancel?: (id: string) => void;
}

export function LeaveHistoryTable({ applications, onCancel }: LeaveHistoryTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'default' as const, className: 'bg-amber-500 hover:bg-amber-600', icon: Clock },
      approved: { variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, className: '', icon: XCircle },
      cancelled: { variant: 'secondary' as const, className: '', icon: AlertCircle },
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
  };

  const handleCancel = (id: string) => {
    if (onCancel) {
      onCancel(id);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave ID</TableHead>
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
                  <TableCell className="font-medium">{application.id}</TableCell>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {application.status === 'pending' && onCancel && (
                          <DropdownMenuItem 
                            onClick={() => handleCancel(application.id)}
                            className="text-destructive"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Request
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              Complete information about this leave request
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Header with Status */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">{selectedApplication.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.leaveTypeName} ({selectedApplication.leaveTypeCode})
                  </p>
                </div>
                {getStatusBadge(selectedApplication.status)}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6">
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

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    Duration
                  </div>
                  <p className="font-medium">{selectedApplication.numberOfDays} day{selectedApplication.numberOfDays !== 1 ? 's' : ''}</p>
                </div>

                <div className="space-y-2">
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

              {/* Approval/Rejection Info */}
              {selectedApplication.status === 'approved' && selectedApplication.approvedBy && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-md space-y-2">
                  <div className="flex items-center text-green-700 dark:text-green-400 font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approved
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-3 w-3 mr-2" />
                      Approved by: <span className="ml-1 font-medium">{selectedApplication.approvedBy}</span>
                    </div>
                    {selectedApplication.approvedOn && (
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-2" />
                        Approved on: <span className="ml-1 font-medium">
                          {format(new Date(selectedApplication.approvedOn), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApplication.status === 'rejected' && selectedApplication.rejectedBy && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-md space-y-2">
                  <div className="flex items-center text-red-700 dark:text-red-400 font-medium">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejected
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-3 w-3 mr-2" />
                      Rejected by: <span className="ml-1 font-medium">{selectedApplication.rejectedBy}</span>
                    </div>
                    {selectedApplication.rejectedOn && (
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-2" />
                        Rejected on: <span className="ml-1 font-medium">
                          {format(new Date(selectedApplication.rejectedOn), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}
                    {selectedApplication.rejectionReason && (
                      <div className="mt-2 p-2 bg-background rounded text-sm">
                        <span className="font-medium">Reason: </span>
                        {selectedApplication.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
