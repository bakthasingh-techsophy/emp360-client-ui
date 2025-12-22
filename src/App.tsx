import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LayoutWithAppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutProvider } from './contexts/LayoutContext';

// Auth modules
import { Login } from './modules/auth/Login';
import { Signup } from './modules/auth/Signup';
import { ForgotPassword } from './modules/auth/ForgotPassword';

// Main application modules
import { Dashboard } from './modules/dashboard/Dashboard';
import { Settings } from './modules/settings/Settings';
import { Support } from './modules/support/Support';

// Account modules
import { Profile } from './modules/account/Profile';
import { SessionInspector } from './modules/account/SessionInspector';

// Core HR modules
import { EmployeeDatabase } from './modules/core-hr/EmployeeDatabase';
import { OrgStructure } from './modules/core-hr/OrgStructure';
import { EmployeeDocuments } from './modules/core-hr/EmployeeDocuments';

// Time, Leave & Attendance modules
import { AttendanceManagement } from './modules/time-attendance/AttendanceManagement';
import { ShiftSchedule } from './modules/time-attendance/ShiftSchedule';
import { LeaveHoliday } from './modules/time-attendance/LeaveHoliday';
import { OvertimeManagement } from './modules/time-attendance/OvertimeManagement';

// Payroll & Compensation modules
import { SalaryStructure } from './modules/payroll/SalaryStructure';
import { PayrollRun } from './modules/payroll/PayrollRun';
import { StatutoryCompliance } from './modules/payroll/StatutoryCompliance';
import { IncentivesBonuses } from './modules/payroll/IncentivesBonuses';

// Recruitment & Onboarding modules
import { JobRequisitions } from './modules/recruitment/JobRequisitions';
import { CandidateTracking } from './modules/recruitment/CandidateTracking';
import { Interviews } from './modules/recruitment/Interviews';
import { OffersPreboarding } from './modules/recruitment/OffersPreboarding';
import { OnboardingChecklists } from './modules/recruitment/OnboardingChecklists';

// Performance & Development modules
import { GoalsOKRs } from './modules/performance/GoalsOKRs';
import { PerformanceReviews } from './modules/performance/PerformanceReviews';
import { Feedback360 } from './modules/performance/Feedback360';
import { TrainingLearning } from './modules/performance/TrainingLearning';
import { SkillsCareer } from './modules/performance/SkillsCareer';

// Self Service modules
import { MyProfile } from './modules/self-service/MyProfile';
import { MyAttendanceLeave } from './modules/self-service/MyAttendanceLeave';
import { MyPayslips } from './modules/self-service/MyPayslips';
import { MyExpenses } from './modules/self-service/MyExpenses';
import { MyRequests } from './modules/self-service/MyRequests';
import { TeamOverview } from './modules/self-service/TeamOverview';
import { ManagerApprovals } from './modules/self-service/ManagerApprovals';

// Expenses, Travel & Assets modules
import { ExpenseManagement } from './modules/expenses-assets/ExpenseManagement';
import { TravelRequests } from './modules/expenses-assets/TravelRequests';
import { AdvancesSettlements } from './modules/expenses-assets/AdvancesSettlements';
import { AssetManagement } from './modules/expenses-assets/AssetManagement';

// Policy & Document Center modules
import { PolicyLibrary } from './modules/policy-documents/PolicyLibrary';
import { Acknowledgements } from './modules/policy-documents/Acknowledgements';
import { FormsTemplates } from './modules/policy-documents/FormsTemplates';

// Projects & Work Management modules
import { ProjectList } from './modules/projects/ProjectList';
import { TasksTimesheets } from './modules/projects/TasksTimesheets';
import { ProjectAttendance } from './modules/projects/ProjectAttendance';

// Visitor & Room Management modules
import { VisitorManagement } from './modules/visitor-room/VisitorManagement';
import { RoomBooking } from './modules/visitor-room/RoomBooking';

// Administration & Security modules
import { UserManagement } from './modules/administration/UserManagement';
import { RolePermissions } from './modules/administration/RolePermissions';
import { AuditLogs } from './modules/administration/AuditLogs';
import { Integrations } from './modules/administration/Integrations';
import { SystemSettings } from './modules/administration/SystemSettings';

// Analytics & Dashboards modules
import { HRDashboard } from './modules/analytics/HRDashboard';
import { WorkforceAnalytics } from './modules/analytics/WorkforceAnalytics';
import { PayrollAnalytics } from './modules/analytics/PayrollAnalytics';
import { CustomReports } from './modules/analytics/CustomReports';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LayoutProvider>
          <BrowserRouter>
            <Routes>
              {/* Public auth routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot" element={<ForgotPassword />} />

              {/* Protected routes - rendered inside LayoutWithAppShell */}
              <Route
                element={
                  <RequireAuth>
                    <LayoutWithAppShell />
                  </RequireAuth>
                }
              >
                {/* Main application routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />

                {/* Account routes */}
                <Route path="/account/profile" element={<Profile />} />
                <Route path="/account/inspector" element={<SessionInspector />} />

                {/* Core HR routes */}
                <Route path="/core-hr/employee-database" element={<EmployeeDatabase />} />
                <Route path="/core-hr/org-structure" element={<OrgStructure />} />
                <Route path="/core-hr/employee-documents" element={<EmployeeDocuments />} />

                {/* Time, Leave & Attendance routes */}
                <Route path="/time-attendance/attendance" element={<AttendanceManagement />} />
                <Route path="/time-attendance/shift-schedule" element={<ShiftSchedule />} />
                <Route path="/time-attendance/leave-holiday" element={<LeaveHoliday />} />
                <Route path="/time-attendance/overtime" element={<OvertimeManagement />} />

                {/* Payroll & Compensation routes */}
                <Route path="/payroll/salary-structure" element={<SalaryStructure />} />
                <Route path="/payroll/payroll-run" element={<PayrollRun />} />
                <Route path="/payroll/statutory-compliance" element={<StatutoryCompliance />} />
                <Route path="/payroll/incentives-bonuses" element={<IncentivesBonuses />} />

                {/* Recruitment & Onboarding routes */}
                <Route path="/recruitment/job-requisitions" element={<JobRequisitions />} />
                <Route path="/recruitment/candidate-tracking" element={<CandidateTracking />} />
                <Route path="/recruitment/interviews" element={<Interviews />} />
                <Route path="/recruitment/offers-preboarding" element={<OffersPreboarding />} />
                <Route path="/recruitment/onboarding" element={<OnboardingChecklists />} />

                {/* Performance & Development routes */}
                <Route path="/performance/goals-okrs" element={<GoalsOKRs />} />
                <Route path="/performance/performance-reviews" element={<PerformanceReviews />} />
                <Route path="/performance/360-feedback" element={<Feedback360 />} />
                <Route path="/performance/training-learning" element={<TrainingLearning />} />
                <Route path="/performance/skills-career" element={<SkillsCareer />} />

                {/* Self Service routes */}
                <Route path="/self-service/my-profile" element={<MyProfile />} />
                <Route path="/self-service/my-attendance-leave" element={<MyAttendanceLeave />} />
                <Route path="/self-service/my-payslips" element={<MyPayslips />} />
                <Route path="/self-service/my-expenses" element={<MyExpenses />} />
                <Route path="/self-service/my-requests" element={<MyRequests />} />
                <Route path="/self-service/team-overview" element={<TeamOverview />} />
                <Route path="/self-service/manager-approvals" element={<ManagerApprovals />} />

                {/* Expenses, Travel & Assets routes */}
                <Route path="/expenses-assets/expense-management" element={<ExpenseManagement />} />
                <Route path="/expenses-assets/travel-requests" element={<TravelRequests />} />
                <Route path="/expenses-assets/advances-settlements" element={<AdvancesSettlements />} />
                <Route path="/expenses-assets/asset-management" element={<AssetManagement />} />

                {/* Policy & Document Center routes */}
                <Route path="/policy-documents/policy-library" element={<PolicyLibrary />} />
                <Route path="/policy-documents/acknowledgements" element={<Acknowledgements />} />
                <Route path="/policy-documents/forms-templates" element={<FormsTemplates />} />

                {/* Projects & Work Management routes */}
                <Route path="/projects/project-list" element={<ProjectList />} />
                <Route path="/projects/tasks-timesheets" element={<TasksTimesheets />} />
                <Route path="/projects/project-attendance" element={<ProjectAttendance />} />

                {/* Visitor & Room Management routes */}
                <Route path="/visitor-room/visitor-management" element={<VisitorManagement />} />
                <Route path="/visitor-room/room-booking" element={<RoomBooking />} />

                {/* Administration & Security routes */}
                <Route path="/administration/user-management" element={<UserManagement />} />
                <Route path="/administration/role-permissions" element={<RolePermissions />} />
                <Route path="/administration/audit-logs" element={<AuditLogs />} />
                <Route path="/administration/integrations" element={<Integrations />} />
                <Route path="/administration/system-settings" element={<SystemSettings />} />

                {/* Analytics & Dashboards routes */}
                <Route path="/analytics/hr-dashboard" element={<HRDashboard />} />
                <Route path="/analytics/workforce-analytics" element={<WorkforceAnalytics />} />
                <Route path="/analytics/payroll-analytics" element={<PayrollAnalytics />} />
                <Route path="/analytics/custom-reports" element={<CustomReports />} />
              </Route>

              {/* Redirect root and unknown routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </LayoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
