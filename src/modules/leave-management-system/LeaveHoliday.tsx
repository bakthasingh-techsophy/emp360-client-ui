/**
 * Leave & Holiday Management Page
 * Comprehensive leave management with applications and credits
 */

import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LeaveBalanceCards,
  MyLeaveApplications,
  TeamLeaveApplications,
  MyLeaveCredits,
  TeamLeaveCredits,
} from "./components";
import { mockLeaveApplications, mockHolidays } from "./data/mockLeaveData";
import { LeaveApplication, LeaveBalance } from "./types/leave.types";
import { EmployeeLeavesInformation } from "./types/leaveConfiguration.types";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LeaveHoliday() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth();
  const { getEmployeeLeavesInformation } = useLeaveManagement();

  // Check if user has role-based access
  const canAccessSettings = auth.hasResourceRole(
    "leave-management-system",
    "lmss",
  );
  const [applications, setApplications] = useState<LeaveApplication[]>(
    mockLeaveApplications,
  );
  const [employeeLeavesInfo, setEmployeeLeavesInfo] =
    useState<EmployeeLeavesInformation | null>(null);
  const [isLoadingEmployeeInfo, setIsLoadingEmployeeInfo] = useState(true);
  const [employeeInfoError, setEmployeeInfoError] = useState<string | null>(null);

  // Transform employee leaves information to LeaveBalance array
  const buildLeaveBalancesFromInfo = (
    info: EmployeeLeavesInformation,
  ): LeaveBalance[] => {
    if (!info?.balances || !info?.configurations) {
      return [];
    }

    return Object.entries(info.balances).map(([leaveTypeKey, balance]) => {
      const config = info.configurations[leaveTypeKey];

      return {
        leaveTypeId: leaveTypeKey,
        leaveTypeName: config?.name || leaveTypeKey,
        leaveTypeCode:
          config?.code?.toUpperCase() ||
          leaveTypeKey.substring(0, 2).toUpperCase(),
        color: getColorForLeaveType(config?.code || leaveTypeKey),
        totalAllotted:
          (balance.available ?? 0) + (balance.encashable ?? 0) + (balance.monetizable ?? 0),
        used: 0, // TODO: consumed will be provided later
        pending: 0, // TODO: pending will be provided later
        available: balance.available ?? 0,
        carriedForward: 0, // TODO: will be provided later
        lapsed: 0, // TODO: will be provided later
      };
    });
  };

  // Helper function to assign colors to leave types
  const getColorForLeaveType = (leaveTypeCode: string): string => {
    const colorMap: Record<string, string> = {
      AL: "#3b82f6", // blue - Annual Leave
      general_leave: "#3b82f6", // blue
      SL: "#ef4444", // red - Sick Leave
      sick_leave: "#ef4444", // red
      CL: "#10b981", // green - Casual Leave
      casual_leave: "#10b981", // green
      ML: "#ec4899", // pink - Maternity Leave
      maternity_leave: "#ec4899", // pink
      PL: "#8b5cf6", // purple - Paternity Leave
      paternity_leave: "#8b5cf6", // purple
      CO: "#f59e0b", // amber - Compensatory Off
      compensatory_off: "#f59e0b", // amber
    };
    return colorMap[leaveTypeCode] || "#6366f1"; // indigo as default
  };

  // Memoize computed balances
  const computedBalances = useMemo(() => {
    if (employeeLeavesInfo) {
      return buildLeaveBalancesFromInfo(employeeLeavesInfo);
    }
    return [];
  }, [employeeLeavesInfo]);

  // Fetch employee leaves information on mount
  const fetchEmployeeLeavesInfo = async () => {
    try {
      setIsLoadingEmployeeInfo(true);
      setEmployeeInfoError(null);
      const leavesInfo = await getEmployeeLeavesInformation();
      if (leavesInfo) {
        setEmployeeLeavesInfo(leavesInfo);
      }
    } catch (error) {
      setEmployeeInfoError(
        error instanceof Error ? error.message : "Failed to load leave information",
      );
    } finally {
      setIsLoadingEmployeeInfo(false);
    }
  };

  useEffect(() => {
    fetchEmployeeLeavesInfo();
  }, []);

  // Mock team applications
  const teamApplications: LeaveApplication[] = [
    {
      id: "LA-2026-101",
      employeeId: "EMP-102",
      employeeName: "Alice Johnson",
      leaveTypeId: "lt-001",
      leaveTypeName: "Annual Leave",
      leaveTypeCode: "AL",
      startDate: "2026-02-25",
      endDate: "2026-02-28",
      numberOfDays: 4,
      reason: "Family trip to Europe",
      status: "pending",
      appliedOn: "2026-02-12T14:30:00Z",
    },
    {
      id: "LA-2026-102",
      employeeId: "EMP-103",
      employeeName: "Bob Smith",
      leaveTypeId: "lt-002",
      leaveTypeName: "Sick Leave",
      leaveTypeCode: "SL",
      startDate: "2026-02-14",
      endDate: "2026-02-14",
      numberOfDays: 1,
      reason: "Medical checkup appointment",
      status: "pending",
      appliedOn: "2026-02-13T08:45:00Z",
    },
    {
      id: "LA-2026-103",
      employeeId: "EMP-104",
      employeeName: "Carol White",
      leaveTypeId: "lt-003",
      leaveTypeName: "Casual Leave",
      leaveTypeCode: "CL",
      startDate: "2026-02-18",
      endDate: "2026-02-19",
      numberOfDays: 2,
      reason: "Personal work",
      status: "pending",
      appliedOn: "2026-02-11T16:20:00Z",
    },
  ];

  // Handle cancel leave
  const handleCancelLeave = (id: string) => {
    setApplications(
      applications.map((app) =>
        app.id === id
          ? {
              ...app,
              status: "cancelled" as const,
              cancelledOn: new Date().toISOString(),
              cancellationReason: "Cancelled by employee",
            }
          : app,
      ),
    );

    toast({
      title: "Leave Cancelled",
      description: "Your leave application has been cancelled successfully.",
    });
  };

  // Handle team approve/reject
  const handleTeamApprove = (_id: string) => {
    toast({
      title: "Leave Approved",
      description: "The leave application has been approved successfully.",
    });
  };

  const handleTeamReject = (_id: string) => {
    toast({
      title: "Leave Rejected",
      description: "The leave application has been rejected.",
      variant: "destructive",
    });
  };

  // Handle view details (placeholder)
  const handleViewDetails = (_item: unknown) => {
    toast({
      title: "View Details",
      description: "Details dialog will open here",
    });
  };

  // Handle credit actions (placeholders)
  const handleCancelCredit = (_id: string) => {
    toast({
      title: "Credit Cancelled",
      description: "Your credit request has been cancelled.",
    });
  };

  const handleApproveCredit = (_id: string) => {
    toast({
      title: "Credit Approved",
      description: "The credit request has been approved.",
    });
  };

  const handleRejectCredit = (_id: string) => {
    toast({
      title: "Credit Rejected",
      description: "The credit request has been rejected.",
      variant: "destructive",
    });
  };

  // Handle apply leave from card - navigate to apply leave page with leave type
  const handleApplyLeaveFromCard = (leaveTypeId: string) => {
    navigate(`/apply-leave?leaveTypeId=${encodeURIComponent(leaveTypeId)}`);
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
            {canAccessSettings && (
              <Button
                variant="outline"
                onClick={() => navigate("/leave-settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            <Button onClick={() => navigate('/apply-leave')}>
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

          <TabsContent value="balances" className="mt-4">
            {employeeInfoError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-medium">Failed to load leave information</p>
                <p className="mt-1">{employeeInfoError}</p>
              </div>
            )}
            {!employeeInfoError && (
              <LeaveBalanceCards
                employeeLeavesInfo={employeeLeavesInfo}
                holidays={mockHolidays}
                onApplyLeave={handleApplyLeaveFromCard}
                isLoading={isLoadingEmployeeInfo}
              />
            )}
          </TabsContent>

          <TabsContent value="applications">
            <Tabs defaultValue="my-applications">
              <TabsList>
                <TabsTrigger value="my-applications">
                  My Applications
                </TabsTrigger>
                <TabsTrigger value="team-applications">
                  Team Applications
                </TabsTrigger>
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
    </PageLayout>
  );
}
