/**
 * Leave & Holiday Management Page
 * Comprehensive leave management with applications and credits
 */

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  LeaveBalanceCards, 
  ApplyLeaveDialog,
  MyLeaveApplications,
  TeamLeaveApplications,
  MyLeaveCredits,
  TeamLeaveCredits
} from './components';
import { 
  mockLeaveBalances, 
  mockLeaveApplications,
  mockHolidays
} from './data/mockLeaveData';
import { LeaveApplication } from './types/leave.types';
import { Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LeaveHoliday() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string | undefined>();
  const [applications, setApplications] = useState<LeaveApplication[]>(mockLeaveApplications);
  const [balances] = useState(mockLeaveBalances);

  // Mock team applications
  const teamApplications: LeaveApplication[] = [
    {
      id: 'LA-2026-101',
      employeeId: 'EMP-102',
      employeeName: 'Alice Johnson',
      leaveTypeId: 'lt-001',
      leaveTypeName: 'Annual Leave',
      leaveTypeCode: 'AL',
      startDate: '2026-02-25',
      endDate: '2026-02-28',
      numberOfDays: 4,
      reason: 'Family trip to Europe',
      status: 'pending',
      appliedOn: '2026-02-12T14:30:00Z',
    },
    {
      id: 'LA-2026-102',
      employeeId: 'EMP-103',
      employeeName: 'Bob Smith',
      leaveTypeId: 'lt-002',
      leaveTypeName: 'Sick Leave',
      leaveTypeCode: 'SL',
      startDate: '2026-02-14',
      endDate: '2026-02-14',
      numberOfDays: 1,
      reason: 'Medical checkup appointment',
      status: 'pending',
      appliedOn: '2026-02-13T08:45:00Z',
    },
    {
      id: 'LA-2026-103',
      employeeId: 'EMP-104',
      employeeName: 'Carol White',
      leaveTypeId: 'lt-003',
      leaveTypeName: 'Casual Leave',
      leaveTypeCode: 'CL',
      startDate: '2026-02-18',
      endDate: '2026-02-19',
      numberOfDays: 2,
      reason: 'Personal work',
      status: 'pending',
      appliedOn: '2026-02-11T16:20:00Z',
    },
  ];

  // Handle apply leave submission
  const handleApplyLeave = (data: {
    leaveTypeId: string;
    startDate: Date;
    endDate: Date;
    numberOfDays: number;
    reason: string;
  }) => {
    const leaveType = balances.find(b => b.leaveTypeId === data.leaveTypeId);
    
    if (!leaveType) {
      toast({
        title: 'Error',
        description: 'Invalid leave type selected',
        variant: 'destructive',
      });
      return;
    }

    // Create new application
    const newApplication: LeaveApplication = {
      id: `LA-2026-${String(applications.length + 1).padStart(3, '0')}`,
      employeeId: 'EMP-001',
      employeeName: 'John Doe',
      leaveTypeId: data.leaveTypeId,
      leaveTypeName: leaveType.leaveTypeName,
      leaveTypeCode: leaveType.leaveTypeCode,
      startDate: data.startDate.toISOString().split('T')[0],
      endDate: data.endDate.toISOString().split('T')[0],
      numberOfDays: data.numberOfDays,
      reason: data.reason,
      status: 'pending',
      appliedOn: new Date().toISOString(),
    };

    // Add to applications list
    setApplications([newApplication, ...applications]);
    setApplyLeaveOpen(false);

    toast({
      title: 'Leave Application Submitted',
      description: `Your ${leaveType.leaveTypeName} request for ${data.numberOfDays} day(s) has been submitted for approval.`,
    });
  };

  // Handle cancel leave
  const handleCancelLeave = (id: string) => {
    setApplications(applications.map(app => 
      app.id === id 
        ? { 
            ...app, 
            status: 'cancelled' as const,
            cancelledOn: new Date().toISOString(),
            cancellationReason: 'Cancelled by employee'
          }
        : app
    ));

    toast({
      title: 'Leave Cancelled',
      description: 'Your leave application has been cancelled successfully.',
    });
  };

  // Handle team approve/reject
  const handleTeamApprove = (_id: string) => {
    toast({
      title: 'Leave Approved',
      description: 'The leave application has been approved successfully.',
    });
  };

  const handleTeamReject = (_id: string) => {
    toast({
      title: 'Leave Rejected',
      description: 'The leave application has been rejected.',
      variant: 'destructive',
    });
  };

  // Handle view details (placeholder)
  const handleViewDetails = (_item: unknown) => {
    toast({
      title: 'View Details',
      description: 'Details dialog will open here',
    });
  };

  // Handle credit actions (placeholders)
  const handleCancelCredit = (_id: string) => {
    toast({
      title: 'Credit Cancelled',
      description: 'Your credit request has been cancelled.',
    });
  };

  const handleApproveCredit = (_id: string) => {
    toast({
      title: 'Credit Approved',
      description: 'The credit request has been approved.',
    });
  };

  const handleRejectCredit = (_id: string) => {
    toast({
      title: 'Credit Rejected',
      description: 'The credit request has been rejected.',
      variant: 'destructive',
    });
  };

  // Handle apply leave from card
  const handleApplyLeaveFromCard = (leaveTypeId: string) => {
    setSelectedLeaveTypeId(leaveTypeId);
    setApplyLeaveOpen(true);
  };

  return (
    <PageLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage leave balances, applications, and credit requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/leave-holiday/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setApplyLeaveOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Apply Leave
            </Button>
          </div>
        </div>

        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="applications">Leave Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="balances">
            <LeaveBalanceCards 
              balances={balances} 
              holidays={mockHolidays}
              onApplyLeave={handleApplyLeaveFromCard}
            />
          </TabsContent>

          <TabsContent value="applications">
            <Tabs defaultValue="my-applications">
              <TabsList>
                <TabsTrigger value="my-applications">My Applications</TabsTrigger>
                <TabsTrigger value="team-applications">Team Applications</TabsTrigger>
                <TabsTrigger value="my-credits">My Credits</TabsTrigger>
                <TabsTrigger value="team-credits">Team Credits</TabsTrigger>
              </TabsList>

              <TabsContent value="my-applications" className="mt-4">
                <MyLeaveApplications
                  applications={applications}
                  onCancel={handleCancelLeave}
                  onViewDetails={handleViewDetails}
                />
              </TabsContent>

              <TabsContent value="team-applications" className="mt-4">
                <TeamLeaveApplications
                  applications={teamApplications}
                  onApprove={handleTeamApprove}
                  onReject={handleTeamReject}
                  onViewDetails={handleViewDetails}
                />
              </TabsContent>

              <TabsContent value="my-credits" className="mt-4">
                <MyLeaveCredits
                  onViewDetails={handleViewDetails}
                  onCancel={handleCancelCredit}
                />
              </TabsContent>

              <TabsContent value="team-credits" className="mt-4">
                <TeamLeaveCredits
                  onViewDetails={handleViewDetails}
                  onApprove={handleApproveCredit}
                  onReject={handleRejectCredit}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <ApplyLeaveDialog
        open={applyLeaveOpen}
        onOpenChange={(open) => {
          setApplyLeaveOpen(open);
          if (!open) {
            setSelectedLeaveTypeId(undefined);
          }
        }}
        balances={balances}
        defaultLeaveTypeId={selectedLeaveTypeId}
        onSubmit={handleApplyLeave}
      />
    </PageLayout>
  );
}
