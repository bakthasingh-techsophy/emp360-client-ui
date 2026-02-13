/**
 * My Leave Credits Component
 * Employee's credit requests for exceptional leaves (maternity, paternity, etc.)
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { MoreVertical, Eye, X } from 'lucide-react';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

interface LeaveCredit {
  id: string;
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

// Mock data for credits
const mockMyCredits: LeaveCredit[] = [
  {
    id: 'LC-2026-001',
    creditType: 'Paternity Leave',
    daysRequested: 15,
    reason: 'Birth of first child - requesting additional days',
    status: 'approved',
    requestedOn: '2026-01-15T10:00:00Z',
    approvedBy: 'HR Manager',
    approvedOn: '2026-01-16T14:30:00Z',
    supportingDocuments: ['birth_certificate.pdf'],
  },
  {
    id: 'LC-2025-012',
    creditType: 'Medical Leave',
    daysRequested: 10,
    reason: 'Extended medical treatment - doctor advised rest',
    status: 'pending',
    requestedOn: '2026-02-10T09:00:00Z',
    supportingDocuments: ['medical_certificate.pdf'],
  },
];

interface MyLeaveCreditsProps {
  onViewDetails: (credit: LeaveCredit) => void;
  onCancel: (id: string) => void;
}

export function MyLeaveCredits({ onViewDetails, onCancel }: MyLeaveCreditsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [credits] = useState<LeaveCredit[]>(mockMyCredits);

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

  const handleExport = () => {
    console.log('Export credits');
  };

  return (
    <div className="space-y-4">
      <GenericToolbar
        searchPlaceholder="Search credit requests..."
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
              <TableHead>Credit ID</TableHead>
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
                  No credit requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredCredits.map((credit) => (
                <TableRow key={credit.id}>
                  <TableCell className="font-medium">{credit.id}</TableCell>
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
                          <DropdownMenuItem onClick={() => onCancel(credit.id)}>
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
    </div>
  );
}
