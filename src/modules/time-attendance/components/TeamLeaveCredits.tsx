/**
 * Team Leave Credits Component
 * Manager view for team member credit requests
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
import { format } from 'date-fns';
import { MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

interface TeamLeaveCredit {
  id: string;
  employeeId: string;
  employeeName: string;
  creditType: string;
  daysRequested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectedBy?: string;
  rejectedOn?: string;
  rejectionReason?: string;
  supportingDocuments?: string[];
}

// Mock data for team credits
const mockTeamCredits: TeamLeaveCredit[] = [
  {
    id: 'LC-2026-101',
    employeeId: 'EMP-102',
    employeeName: 'Alice Johnson',
    creditType: 'Maternity Leave',
    daysRequested: 90,
    reason: 'Pregnancy - requesting maternity leave credit',
    status: 'pending',
    requestedOn: '2026-02-10T10:00:00Z',
    supportingDocuments: ['medical_report.pdf'],
  },
  {
    id: 'LC-2026-102',
    employeeId: 'EMP-103',
    employeeName: 'Bob Smith',
    creditType: 'Compassionate Leave',
    daysRequested: 5,
    reason: 'Family bereavement - need additional days',
    status: 'pending',
    requestedOn: '2026-02-11T14:00:00Z',
  },
  {
    id: 'LC-2026-103',
    employeeId: 'EMP-104',
    employeeName: 'Carol White',
    creditType: 'Medical Leave',
    daysRequested: 20,
    reason: 'Surgery recovery - doctor recommended extended rest',
    status: 'approved',
    requestedOn: '2026-01-20T09:00:00Z',
    approvedBy: 'HR Manager',
    approvedOn: '2026-01-21T11:00:00Z',
    supportingDocuments: ['surgery_report.pdf', 'doctor_note.pdf'],
  },
];

interface TeamLeaveCreditsProps {
  onViewDetails: (credit: TeamLeaveCredit) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function TeamLeaveCredits({ onViewDetails, onApprove, onReject }: TeamLeaveCreditsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [credits] = useState<TeamLeaveCredit[]>(mockTeamCredits);

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
      id: 'creditType',
      label: 'Credit Type',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Maternity Leave', value: 'Maternity Leave' },
        { label: 'Paternity Leave', value: 'Paternity Leave' },
        { label: 'Medical Leave', value: 'Medical Leave' },
        { label: 'Compassionate Leave', value: 'Compassionate Leave' },
      ],
    },
  ];

  // Convert activeFilters to record
  const filters = activeFilters.reduce((acc, filter) => {
    acc[filter.id] = filter.value;
    return acc;
  }, {} as Record<string, unknown>);

  // Apply filters
  const filteredCredits = credits.filter(credit => {
    if (searchQuery && 
        !credit.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !credit.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !credit.creditType.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !credit.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.status && credit.status !== filters.status) {
      return false;
    }
    if (filters.creditType && credit.creditType !== filters.creditType) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleExport = () => {
    console.log('Export team credits');
  };

  return (
    <div className="space-y-4">
      <GenericToolbar
        searchPlaceholder="Search team credit requests..."
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
              <TableHead>Credit Type</TableHead>
              <TableHead>Days Requested</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCredits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No team credit requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredCredits.map((credit) => (
                <TableRow key={credit.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(credit.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{credit.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{credit.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{credit.creditType}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{credit.daysRequested}</span> days
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{credit.reason}</div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(credit.requestedOn), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{getStatusBadge(credit.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(credit)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {credit.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => onApprove(credit.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReject(credit.id)}>
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
