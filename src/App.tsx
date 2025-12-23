import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LayoutWithAppShell } from './layout';
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
import { PolicyForm } from './modules/policy-documents/PolicyForm';
import { Acknowledgements } from './modules/policy-documents/Acknowledgements';
import { FormsTemplates } from './modules/policy-documents/FormsTemplates';

// Projects & Work Management modules
import { ProjectList } from './modules/projects/ProjectList';
import { TasksTimesheets } from './modules/projects/TasksTimesheets';
import { ProjectAttendance } from './modules/projects/ProjectAttendance';

// Visitor & Room Management modules
import { VisitorManagement } from './modules/visitor-management';
import { RoomBooking } from './modules/visitor-room/RoomBooking';
import { RoomForm } from './modules/visitor-room/RoomForm';

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

                {/* Core HR routes - Flat paths */}
                <Route path="/employee-database" element={<EmployeeDatabase />} />
                <Route path="/org-structure" element={<OrgStructure />} />
                <Route path="/employee-documents" element={<EmployeeDocuments />} />

                {/* Time, Leave & Attendance routes - Flat paths */}
                <Route path="/attendance-management" element={<AttendanceManagement />} />
                <Route path="/shift-schedule" element={<ShiftSchedule />} />
                <Route path="/leave-holiday" element={<LeaveHoliday />} />
                <Route path="/overtime" element={<OvertimeManagement />} />

                {/* Payroll & Compensation routes - Flat paths */}
                <Route path="/salary-structure" element={<SalaryStructure />} />
                <Route path="/payroll-run" element={<PayrollRun />} />
                <Route path="/statutory-compliance" element={<StatutoryCompliance />} />
                <Route path="/incentives-bonuses" element={<IncentivesBonuses />} />

                {/* Recruitment & Onboarding routes - Flat paths */}
                <Route path="/job-requisitions" element={<JobRequisitions />} />
                <Route path="/candidate-tracking" element={<CandidateTracking />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/offers-preboarding" element={<OffersPreboarding />} />
                <Route path="/onboarding" element={<OnboardingChecklists />} />

                {/* Performance & Development routes - Flat paths */}
                <Route path="/goals-okrs" element={<GoalsOKRs />} />
                <Route path="/performance-reviews" element={<PerformanceReviews />} />
                <Route path="/360-feedback" element={<Feedback360 />} />
                <Route path="/training-learning" element={<TrainingLearning />} />
                <Route path="/skills-career" element={<SkillsCareer />} />

                {/* Self Service routes - Flat paths */}
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="/my-attendance-leave" element={<MyAttendanceLeave />} />
                <Route path="/my-payslips" element={<MyPayslips />} />
                <Route path="/my-expenses" element={<MyExpenses />} />
                <Route path="/my-requests" element={<MyRequests />} />
                <Route path="/team-overview" element={<TeamOverview />} />
                <Route path="/manager-approvals" element={<ManagerApprovals />} />

                {/* Expenses, Travel & Assets routes - Flat paths */}
                <Route path="/expense-management" element={<ExpenseManagement />} />
                <Route path="/travel-requests" element={<TravelRequests />} />
                <Route path="/advances-settlements" element={<AdvancesSettlements />} />
                <Route path="/asset-management" element={<AssetManagement />} />

                {/* Policy & Document Center routes - Flat paths */}
                <Route path="/policy-library" element={<PolicyLibrary />} />
                <Route path="/policy-form" element={<PolicyForm />} />
                <Route path="/acknowledgements" element={<Acknowledgements />} />
                <Route path="/forms-templates" element={<FormsTemplates />} />

                {/* Projects & Work Management routes - Flat paths */}
                <Route path="/project-list" element={<ProjectList />} />
                <Route path="/tasks-timesheets" element={<TasksTimesheets />} />
                <Route path="/project-attendance" element={<ProjectAttendance />} />

                {/* Visitor & Room Management routes - Flat paths */}
                <Route path="/visitor-management" element={<VisitorManagement />} />
                <Route path="/room-management" element={<RoomBooking />} />
                <Route path="/room-form" element={<RoomForm />} />

                {/* Administration & Security routes - Flat paths */}
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/role-permissions" element={<RolePermissions />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/system-settings" element={<SystemSettings />} />

                {/* Analytics & Dashboards routes - Flat paths */}
                <Route path="/hr-dashboard" element={<HRDashboard />} />
                <Route path="/workforce-analytics" element={<WorkforceAnalytics />} />
                <Route path="/payroll-analytics" element={<PayrollAnalytics />} />
                <Route path="/custom-reports" element={<CustomReports />} />
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
