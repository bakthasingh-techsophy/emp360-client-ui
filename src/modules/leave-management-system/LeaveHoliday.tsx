/**
 * Leave & Holiday Management Page
 * Comprehensive leave management with applications and credits
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import { useLeavePermissions } from "./hooks";
import {
  LeaveBalanceCards,
  MyLeaveApplications,
  TeamLeaveApplications,
  MyLeaveCredits,
  TeamLeaveCredits,
} from "./components";
import { mockHolidays } from "./data/mockLeaveData";
import { EmployeeLeavesInformation } from "./types/leaveConfiguration.types";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LeaveHoliday() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getEmployeeLeavesInformation, approveRejectAbsenceApplication, approveRejectCreditRequest } = useLeaveManagement();
  
  // Get leave management permissions
  const permissions = useLeavePermissions();

  // Get tab from URL params, default to 'balances'
  const mainTab = (searchParams.get('mainTab') || 'balances') as string;
  const applicationsTab = (searchParams.get('applicationsTab') || 'my-applications') as string;

  // Initialize URL params on first load if not present
  useEffect(() => {
    // If no search params, set initial defaults
    if (!searchParams.get('mainTab')) {
      navigate(`?mainTab=balances&applicationsTab=my-applications`, { replace: true });
    }
  }, []);  // Only run once on mount

  // Check if user has access to leave management features
  // Redirect if user doesn't have any leave management role
  useEffect(() => {
    if (!permissions.hasLmsRole && !permissions.isLead) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to access leave management.",
      });
      navigate("/");
    }
  }, [permissions.hasLmsRole, permissions.isLead]);
  const [employeeLeavesInfo, setEmployeeLeavesInfo] =
    useState<EmployeeLeavesInformation | null>(null);
  const [isLoadingEmployeeInfo, setIsLoadingEmployeeInfo] = useState(true);
  const [employeeInfoError, setEmployeeInfoError] = useState<string | null>(null);
  const [actionRefreshVersion, setActionRefreshVersion] = useState(0);

  // Fetch employee leaves information only when balances tab is active
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

  // Only fetch when balances tab becomes active
  useEffect(() => {
    if (mainTab === 'balances') {
      fetchEmployeeLeavesInfo();
    }
  }, [mainTab]);

  // Handle team approve/reject
  /**
   * Approve team member's leave application
   * API: PUT /emp-user-management/v1/leave-management/absences/{id}?status=approve
   */
  const handleTeamApprove = async (id: string) => {
    console.log("[ACTION] Approving team leave application:", id);
    const result = await approveRejectAbsenceApplication(id, "approve");
    if (result) {
      toast({
        title: "Success",
        description: "The leave application has been approved.",
      });
      setActionRefreshVersion((v) => v + 1);
    }
  };

  /**
   * Reject team member's leave application
   * API: PUT /emp-user-management/v1/leave-management/absences/{id}?status=reject
   */
  const handleTeamReject = async (id: string) => {
    console.log("[ACTION] Rejecting team leave application:", id);
    const result = await approveRejectAbsenceApplication(id, "reject");
    if (result) {
      toast({
        title: "Success",
        description: "The leave application has been rejected.",
      });
      setActionRefreshVersion((v) => v + 1);
    }
  };


  // Handle credit approval/rejection
  /**
   * Approve team member's credit request
   * API: PUT /emp-user-management/v1/leave-management/credits/{id}?status=approve
   */
  const handleApproveCredit = async (id: string) => {
    console.log("[ACTION] Approving team credit request:", id);
    const result = await approveRejectCreditRequest(id, "approve");
    if (result) {
      toast({
        title: "Success",
        description: "The credit request has been approved.",
      });
      setActionRefreshVersion((v) => v + 1);
    }
  };

  /**
   * Reject team member's credit request
   * API: PUT /emp-user-management/v1/leave-management/credits/{id}?status=reject
   */
  const handleRejectCredit = async (id: string) => {
    console.log("[ACTION] Rejecting team credit request:", id);
    const result = await approveRejectCreditRequest(id, "reject");
    if (result) {
      toast({
        title: "Success",
        description: "The credit request has been rejected.",
      });
      setActionRefreshVersion((v) => v + 1);
    }
  };

  // Handle apply leave from card - navigate to apply leave page with leave type and return tab info
  const handleApplyLeaveFromCard = (leaveTypeId: string) => {
    navigate(`/leave-holiday/apply-leave?leaveTypeId=${encodeURIComponent(leaveTypeId)}&mainTab=${encodeURIComponent(mainTab)}&applicationsTab=${encodeURIComponent(applicationsTab)}`);
  };

  // Handle request credits from card - navigate to request credits page with credit type and return tab info
  const handleRequestCreditsFromCard = (creditType: string) => {
    navigate(`/leave-holiday/request-credits?creditType=${encodeURIComponent(creditType)}&mainTab=${encodeURIComponent(mainTab)}&applicationsTab=${encodeURIComponent(applicationsTab)}`);
  };

  // Handle general apply leave button
  const handleApplyLeave = () => {
    navigate(`/leave-holiday/apply-leave?mainTab=${encodeURIComponent(mainTab)}&applicationsTab=${encodeURIComponent(applicationsTab)}`);
  };

  // Handle request credits button
  const handleRequestCredits = () => {
    navigate(`/leave-holiday/request-credits?mainTab=${encodeURIComponent(mainTab)}&applicationsTab=${encodeURIComponent(applicationsTab)}`);
  };

  // Handle main tab change - use replace to avoid creating excessive history entries
  const handleMainTabChange = (value: string) => {
    navigate(`?mainTab=${encodeURIComponent(value)}&applicationsTab=${encodeURIComponent(applicationsTab)}`, { replace: true });
  };

  // Handle applications tab change - use replace to avoid creating excessive history entries
  const handleApplicationsTabChange = (value: string) => {
    navigate(`?mainTab=${encodeURIComponent(mainTab)}&applicationsTab=${encodeURIComponent(value)}`, { replace: true });
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
            {permissions.canAccessSettings && (
              <Button
                variant="outline"
                onClick={() => navigate("/leave-holiday/leave-settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            {permissions.canRequestCredits && (
              <Button variant="outline" onClick={handleRequestCredits}>
                <Plus className="h-4 w-4 mr-2" />
                Request Credits
              </Button>
            )}
            {permissions.canSubmitApplications && (
              <Button onClick={handleApplyLeave}>
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            )}
          </div>
        </div>

        <Tabs value={mainTab} onValueChange={handleMainTabChange} className="space-y-4">
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
                onRequestCredits={handleRequestCreditsFromCard}
                isLoading={isLoadingEmployeeInfo}
              />
            )}
          </TabsContent>

          <TabsContent value="applications">
            <Tabs value={applicationsTab} onValueChange={handleApplicationsTabChange}>
              <TabsList>
                {permissions.canViewMyApplications && (
                  <TabsTrigger value="my-applications">
                    My Applications
                  </TabsTrigger>
                )}
                {permissions.canViewTeamApplications && (
                  <TabsTrigger value="team-applications">
                    Team Applications
                  </TabsTrigger>
                )}
                {permissions.canViewMyCredits && (
                  <TabsTrigger value="my-credits">My Credits</TabsTrigger>
                )}
                {permissions.canViewTeamCredits && (
                  <TabsTrigger value="team-credits">Team Credits</TabsTrigger>
                )}
              </TabsList>

              {permissions.canViewMyApplications && (
                <TabsContent value="my-applications" className="mt-4">
                  <MyLeaveApplications />
                </TabsContent>
              )}

              {permissions.canViewTeamApplications && (
                <TabsContent value="team-applications" className="mt-4">
                  <TeamLeaveApplications
                    onApprove={handleTeamApprove}
                    onReject={handleTeamReject}
                    refreshDependency={actionRefreshVersion}
                  />
                </TabsContent>
              )}

              {permissions.canViewMyCredits && (
                <TabsContent value="my-credits" className="mt-4">
                  <MyLeaveCredits />
                </TabsContent>
              )}

              {permissions.canViewTeamCredits && (
                <TabsContent value="team-credits" className="mt-4">
                  <TeamLeaveCredits
                    onApprove={handleApproveCredit}
                    onReject={handleRejectCredit}
                    refreshDependency={actionRefreshVersion}
                  />
                </TabsContent>
              )}
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
