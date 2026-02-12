/**
 * Regularisation Requests Component
 * Displays extra hours requests with tabs and filtering
 * Different views for EMPLOYEE and REPORTING_MANAGER roles
 */

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { AddRequestModal } from './AddRequestModal';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  MessageCircle,
  Trash2,
} from 'lucide-react';
import {
  ExtraHoursRequest,
  AttendanceRole,
  ShiftSettings,
  RegularisationStatus,
} from '@/types/attendance';
import { PaginatedResponse } from '@/types/attendance';

interface RegularisationRequestsProps {
  role: AttendanceRole;
  currentEmail: string;
  data: PaginatedResponse<ExtraHoursRequest> | null;
  loading: boolean;
  error: string | null;
  statusFilter: RegularisationStatus | 'all';
  onStatusFilterChange: (status: RegularisationStatus | 'all') => void;
  onRefresh: () => void;
  onAddRequest: (date: string, hours: number, reason: string) => Promise<void>;
  onCancelRequest: (id: string) => Promise<void>;
  onApproveRequest: (id: string) => Promise<void>;
  onRejectRequest: (id: string) => Promise<void>;
  addRequestLoading?: boolean;
}

export const RegularisationRequests: React.FC<RegularisationRequestsProps> = ({
  role,
  currentEmail,
  data,
  loading,
  error,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onAddRequest,
  onCancelRequest,
  onApproveRequest,
  onRejectRequest,
  addRequestLoading,
}) => {
  const [addRequestOpen, setAddRequestOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'my-requests' | 'team-requests'>('my-requests');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Removed unused filterOptions - they are not needed for this component

  // Get status badge colors
  const getStatusBadge = (status: RegularisationStatus) => {
    const variants: Record<RegularisationStatus, string> = {
      pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      cancelled: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
    };
    return variants[status];
  };

  const getStatusIcon = (status: RegularisationStatus) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const handleActionClick = async (
    id: string,
    action: 'cancel' | 'approve' | 'reject'
  ) => {
    setActionLoading({ ...actionLoading, [id]: true });
    try {
      if (action === 'cancel') {
        await onCancelRequest(id);
      } else if (action === 'approve') {
        await onApproveRequest(id);
      } else if (action === 'reject') {
        await onRejectRequest(id);
      }
      onRefresh();
    } finally {
      setActionLoading({ ...actionLoading, [id]: false });
    }
  };

  const renderRequestRow = (request: ExtraHoursRequest, canCancel: boolean = false) => (
    <Card key={request.id} className="p-4 hover:bg-muted/50 transition-colors">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm">
                {format(parseISO(request.date), 'MMM dd, yyyy')}
              </p>
              <Badge className={`text-xs gap-1 ${getStatusBadge(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="capitalize">{request.status}</span>
              </Badge>
            </div>

            {/* Employee email for team requests */}
            {role === 'REPORTING_MANAGER' && request.officialEmail !== currentEmail && (
              <p className="text-xs text-muted-foreground">{request.officialEmail}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">{request.extraHours} hours</p>
            <p className="text-xs text-muted-foreground">requested</p>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Reason</p>
            <p className="font-medium line-clamp-2">{request.reason}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">
              {request.createdAt ? format(parseISO(request.createdAt), 'MMM dd') : '—'}
            </p>
          </div>
        </div>

        {/* Updated At */}
        {request.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Updated: {format(parseISO(request.updatedAt), 'MMM dd, HH:mm')}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {/* For Employee: Cancel pending requests */}
          {canCancel && request.status === 'pending' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleActionClick(request.id, 'cancel')}
              disabled={actionLoading[request.id] || loading}
              className="gap-2 text-xs"
            >
              {actionLoading[request.id] ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Cancel Request
            </Button>
          )}

          {/* For Reporting Manager: Approve/Reject pending requests */}
          {role === 'REPORTING_MANAGER' && request.status === 'pending' && (
            <>
              <Button
                size="sm"
                className="gap-2 text-xs"
                onClick={() => handleActionClick(request.id, 'approve')}
                disabled={actionLoading[request.id] || loading}
              >
                {actionLoading[request.id] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-xs"
                onClick={() => handleActionClick(request.id, 'reject')}
                disabled={actionLoading[request.id] || loading}
              >
                {actionLoading[request.id] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Reject
              </Button>
            </>
          )}

          {/* Status badge when no actions available */}
          {!canCancel && request.status !== 'pending' && (
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">No actions available</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  // Loading state
  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-muted rounded-full border-t-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button size="sm" className="mt-4" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const requests = data?.content || [];
  const myRequests = requests.filter((r) => r.officialEmail === currentEmail);
  const teamRequests = requests.filter((r) => r.officialEmail !== currentEmail);

  return (
    <>
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="my-requests" className="gap-2">
              <p>My Requests</p>
              {myRequests.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {myRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            {role === 'REPORTING_MANAGER' && (
              <TabsTrigger value="team-requests" className="gap-2">
                <p>Team Requests</p>
                {teamRequests.length > 0 && (
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {teamRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {currentTab === 'my-requests' && (
            <Button size="sm" className="gap-2" onClick={() => setAddRequestOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Request
            </Button>
          )}
        </div>

        {/* My Requests Tab */}
        <TabsContent value="my-requests" className="space-y-4">
          {/* Toolbar for filtering */}
          <GenericToolbar
            showFilters={true}
            availableFilters={[
              {
                id: 'status',
                label: 'Status',
                type: 'select',
                operators: [{ label: 'is', value: 'eq' }],
                defaultOperator: 'eq' as const,
                options: [
                  { label: 'All', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Rejected', value: 'rejected' },
                  { label: 'Cancelled', value: 'cancelled' },
                ],
              },
            ]}
            activeFilters={
              statusFilter !== 'all'
                ? [
                    {
                      id: 'filter-status',
                      filterId: 'status',
                      operator: 'eq' as const,
                      value: statusFilter,
                    },
                  ]
                : []
            }
            onFiltersChange={(filters) => {
              const statusFilter = filters.find((f) => f.filterId === 'status');
              onStatusFilterChange((statusFilter?.value as RegularisationStatus) || 'all');
            }}
          />

          {/* Requests List */}
          {myRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground mb-3">No requests yet</p>
              <Button size="sm" onClick={() => setAddRequestOpen(true)}>
                Create First Request
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => renderRequestRow(request, true))}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <p className="text-xs text-muted-foreground">
                Page {data.pageNumber + 1} of {data.totalPages} • {data.totalElements} total
              </p>
            </div>
          )}
        </TabsContent>

        {/* Team Requests Tab (Reporting Manager only) */}
        {role === 'REPORTING_MANAGER' && (
          <TabsContent value="team-requests" className="space-y-4">
            {/* Toolbar for filtering */}
            <GenericToolbar
              showFilters={true}
              availableFilters={[
                {
                  id: 'status',
                  label: 'Status',
                  type: 'select',
                  operators: [{ label: 'is', value: 'eq' }],
                  defaultOperator: 'eq' as const,
                  options: [
                    { label: 'All', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
              ]}
              activeFilters={
                statusFilter !== 'all'
                  ? [
                      {
                        id: 'filter-status-team',
                        filterId: 'status',
                        operator: 'eq' as const,
                        value: statusFilter,
                      },
                    ]
                  : []
              }
              onFiltersChange={(filters) => {
                const statusFilter = filters.find((f) => f.filterId === 'status');
                onStatusFilterChange((statusFilter?.value as RegularisationStatus) || 'all');
              }}
            />

            {/* Requests List */}
            {teamRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No team requests</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {teamRequests.map((request) => renderRequestRow(request, false))}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <p className="text-xs text-muted-foreground">
                  Page {data.pageNumber + 1} of {data.totalPages} • {data.totalElements} total
                </p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Add Request Modal */}
      <AddRequestModal
        open={addRequestOpen}
        onOpenChange={setAddRequestOpen}
        onSubmit={onAddRequest}
        loading={addRequestLoading}
      />
    </>
  );
};
