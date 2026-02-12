/**
 * Attendance Management Screen
 * Main component orchestrating all attendance features
 * Includes attendance records, regularisation requests, and analytics
 */

import { useState, useEffect } from 'react';
import { subDays, format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Types
import { AttendanceRole, RegularisationStatus } from '@/types/attendance';
import { MOCK_USERS } from '@/services/attendanceService';

// Components
import { ProfileToggle } from './components/ProfileToggle';
import { AttendanceRecordsTable } from './components/AttendanceRecordsTable';
import { RegularisationRequests } from './components/RegularisationRequests';
import { AttendanceChart } from './components/AttendanceChart';

// Hooks
import {
  usePersonalAttendance,
  useExtraHoursRequests,
  useShiftSettings,
  useCreateExtraHourRequest,
  useUpdateExtraHourRequest,
  useCancelExtraHourRequest,
  useAttendanceAnalytics,
} from '@/hooks/useAttendanceData';

export function AttendanceManagement() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Role and user context
  const [currentRole, setCurrentRole] = useState<AttendanceRole>('EMPLOYEE');
  const [currentUser, setCurrentUser] = useState(() => MOCK_USERS.employee);

  // Update user when role changes
  useEffect(() => {
    setCurrentUser(currentRole === 'EMPLOYEE' ? MOCK_USERS.employee : MOCK_USERS.reportingManager);
  }, [currentRole]);

  // Date range for attendance records
  const [startDate, setStartDate] = useState(() =>
    format(subDays(new Date(), 10), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  // Chart analytics period
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month'>('week');

  // Regularisation filter
  const [regularisationStatusFilter, setRegularisationStatusFilter] =
    useState<RegularisationStatus | 'all'>('all');

  // Toast notifications
  const { toast } = useToast();

  // ============================================================================
  // DATA FETCHING HOOKS
  // ============================================================================

  // Fetch personal attendance records
  const attendanceData = usePersonalAttendance(
    currentUser.employeeId,
    'regular',
    startDate,
    endDate
  );

  // Fetch extra hours requests (My Requests for current user)
  const myRequestsData = useExtraHoursRequests(
    currentUser.email,
    '', // reportingTo not used for employee requests
    0,
    5
  );

  // Fetch team requests (Reporting Manager only)
  const teamRequestsData = useExtraHoursRequests(
    '',
    currentRole === 'REPORTING_MANAGER' ? currentUser.email : '',
    0,
    5
  );

  // Fetch shift settings
  const shiftSettings = useShiftSettings('regular');

  // Calculate analytics
  const analytics = useAttendanceAnalytics(
    attendanceData.data?.attendanceDetails || null,
    shiftSettings.data,
    analyticsPeriod
  );

  // ============================================================================
  // MUTATION HOOKS
  // ============================================================================

  const { create: createRequest, loading: createRequestLoading } =
    useCreateExtraHourRequest();
  const { update: updateRequest } = useUpdateExtraHourRequest();
  const { cancel: cancelRequest } = useCancelExtraHourRequest();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Handle role change
  const handleRoleChange = (role: AttendanceRole) => {
    setCurrentRole(role);
    // Reset filters when role changes
    setRegularisationStatusFilter('all');
    toast({
      title: 'Role Updated',
      description: `Switched to ${role === 'EMPLOYEE' ? 'Employee' : 'Reporting Manager'} view`,
    });
  };

  // Handle date range change
  const handleDateRangeChange = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  // Handle adding extra hours request
  const handleAddRequest = async (
    date: string,
    extraHours: number,
    reason: string
  ) => {
    const newRequest = await createRequest(
      date,
      extraHours,
      reason,
      currentUser.email,
      currentRole === 'REPORTING_MANAGER'
        ? currentUser.email
        : MOCK_USERS.reportingManager.email
    );

    if (newRequest) {
      toast({
        title: 'Request Created',
        description: `Extra hours request for ${date} has been submitted for approval`,
      });
      myRequestsData.refetch();
    }
  };

  // Handle cancelling request
  const handleCancelRequest = async (id: string) => {
    const cancelled = await cancelRequest(id);
    if (cancelled) {
      toast({
        title: 'Request Cancelled',
        description: 'Your request has been cancelled',
        variant: 'default',
      });
      myRequestsData.refetch();
    }
  };

  // Handle approving request
  const handleApproveRequest = async (id: string) => {
    const approved = await updateRequest(id, 'approved');
    if (approved) {
      toast({
        title: 'Request Approved',
        description: 'The extra hours request has been approved',
      });
      teamRequestsData.refetch();
    }
  };

  // Handle rejecting request
  const handleRejectRequest = async (id: string) => {
    const rejected = await updateRequest(id, 'rejected');
    if (rejected) {
      toast({
        title: 'Request Rejected',
        description: 'The extra hours request has been rejected',
        variant: 'destructive',
      });
      teamRequestsData.refetch();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
        {/* Header with Profile Toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Attendance Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage employee attendance, check-ins, check-outs, and work hours
              with regularisation requests and compliance analytics.
            </p>
          </div>
          {/* Dev-only Profile Toggle */}
          <ProfileToggle currentRole={currentRole} onRoleChange={handleRoleChange} />
        </div>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsContent value="records" className="m-0">
              Records, Regularisation & Analytics
            </TabsContent>
          </TabsList>

          {/* Content Tab */}
          <div className="space-y-6">
            {/* Records Section */}
            <div>
              <AttendanceRecordsTable
                data={attendanceData.data}
                loading={attendanceData.loading}
                onDateRangeChange={handleDateRangeChange}
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            {/* Regularisation Section */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold">Regularisation Requests</h2>
                <p className="text-sm text-muted-foreground">
                  {currentRole === 'EMPLOYEE'
                    ? 'Request additional work hours to be added to specific dates'
                    : 'Review and approve/reject team members\' regularisation requests'}
                </p>
              </div>
              <RegularisationRequests
                role={currentRole}
                currentEmail={currentUser.email}
                data={
                  currentRole === 'EMPLOYEE' ? myRequestsData.data : teamRequestsData.data
                }
                loading={
                  currentRole === 'EMPLOYEE'
                    ? myRequestsData.loading
                    : teamRequestsData.loading
                }
                error={
                  currentRole === 'EMPLOYEE' ? myRequestsData.error : teamRequestsData.error
                }
                statusFilter={regularisationStatusFilter}
                onStatusFilterChange={setRegularisationStatusFilter}
                onRefresh={() => {
                  if (currentRole === 'EMPLOYEE') {
                    myRequestsData.refetch();
                  } else {
                    teamRequestsData.refetch();
                  }
                }}
                onAddRequest={handleAddRequest}
                onCancelRequest={handleCancelRequest}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
                addRequestLoading={createRequestLoading}
              />
            </div>

            {/* Analytics Section */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold">Attendance Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  View your logged hours, compliance rating, and overtime analysis
                </p>
              </div>
              <AttendanceChart
                analytics={analytics}
                onPeriodChange={setAnalyticsPeriod}
                period={analyticsPeriod}
                loading={attendanceData.loading}
              />
            </div>

            {/* Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/30">
              <h3 className="font-semibold mb-3">Quick Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Role</p>
                  <p className="font-semibold text-sm">
                    {currentRole === 'EMPLOYEE' ? 'Employee' : 'Reporting Manager'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pending Requests</p>
                  <p className="font-semibold text-sm">
                    {(currentRole === 'EMPLOYEE' ? myRequestsData : teamRequestsData).data
                      ?.content.filter((r) => r.status === 'pending').length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Compliance Rating
                  </p>
                  <p className="font-semibold text-sm">
                    {analytics?.complianceRating.toFixed(0) || '—'}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Shift</p>
                  <p className="font-semibold text-sm">
                    {shiftSettings.data?.id || '—'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Tabs>
      </div>
  );
}
