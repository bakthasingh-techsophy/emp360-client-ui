/**
 * Team Leave Applications Component
 * Manager view for team member leave applications with approval actions
 */

import { useState } from 'react';
import { GenericToolbar } from '@/components/GenericToolbar';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeaveApplication } from '../types/leave.types';
import { format } from 'date-fns';
import { MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

interface TeamLeaveApplicationsProps {
  applications: LeaveApplication[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (application: LeaveApplication) => void;
}

export function TeamLeaveApplications({ 
  applications, 
  onApprove,
  onReject,
  onViewDetails 
}: TeamLeaveApplicationsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Filter fields
  const filterFields: AvailableFilter[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      id: 'leaveType',
      label: 'Leave Type',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Annual Leave', value: 'Annual Leave' },
        { label: 'Sick Leave', value: 'Sick Leave' },
        { label: 'Casual Leave', value: 'Casual Leave' },
        { label: 'Compensatory Off', value: 'Compensatory Off' },
      ],
    },
  ];

  // Convert activeFilters to record
  const filters = activeFilters.reduce((acc, filter) => {
    acc[filter.id] = filter.value;
    return acc;
  }, {} as Record<string, unknown>);

  // Apply filters
  const filteredApplications = applications.filter(application => {
    if (searchQuery && 
        !application.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !application.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !application.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !application.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.status && application.status !== filters.status) {
      return false;
    }
    if (filters.leaveType && application.leaveTypeName !== filters.leaveType) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  const handleExport = () => {
    console.log('Export team applications');
  };

  return (
    <div className="space-y-4">
      <GenericToolbar
        searchPlaceholder="Search team applications..."
        onSearchChange={setSearchQuery}
        showFilters={true}
        availableFilters={filterFields}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        showExport={true}
        onExportAll={handleExport}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No team applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => (
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
                    <div className="flex items-center gap-2">
                      <span>{application.leaveTypeName}</span>
                      <Badge variant="outline" className="text-xs">
                        {application.leaveTypeCode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(application.startDate)}</TableCell>
                  <TableCell>{formatDate(application.endDate)}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{application.numberOfDays}</span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(application.appliedOn), 'MMM dd, yyyy')}
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
                        <DropdownMenuItem onClick={() => onViewDetails(application)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {application.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => onApprove(application.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReject(application.id)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
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
    </div>
  );
}
