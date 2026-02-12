/**
 * Attendance Management Types
 * Aligned with backend API contracts
 */

// Roles
export type AttendanceRole = 'EMPLOYEE' | 'REPORTING_MANAGER';

// Attendance Status
export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Weekend'
  | 'On Leave'
  | 'Work From Home';

// Regularisation Request Status
export type RegularisationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

/**
 * Individual Attendance Detail
 * Represents a single day's attendance record
 */
export interface AttendanceDetail {
  date: string; // YYYY-MM-DD format
  checkinTime: string | null; // HH:MM:SS format or null
  checkoutTime: string | null; // HH:MM:SS format or null
  loggedHours: number;
  regularizedHours: number;
  expectedHours: number;
  checkInDoor: string | null;
  checkOutDoor: string | null;
  attendanceStatus: AttendanceStatus;
  lateCheckIn: boolean | null;
  loggedHoursStatus: string | null;
  warningHours: number;
  criticalHours: number;
}

/**
 * Attendance Summary Statistics
 */
export interface AttendanceSummary {
  numberOfLateCheckins: number;
  totalWorkedDays: number;
}

/**
 * Personal Attendance Response
 * Contains all attendance data for a user within date range
 */
export interface PersonalAttendanceResponse {
  firstName: string;
  lastName: string;
  employeeId: string;
  officialEmail: string;
  shift: string;
  attendanceDetails: AttendanceDetail[];
  attendanceSummary: AttendanceSummary;
}

/**
 * Extra Hours / Regularisation Request
 */
export interface ExtraHoursRequest {
  id: string;
  date: string; // YYYY-MM-DD format
  extraHours: number;
  status: RegularisationStatus;
  officialEmail: string;
  reason: string;
  reportingTo: string;
  createdAt: string | null; // ISO format or null
  updatedAt: string | null; // ISO format or null
}

/**
 * Paginated Response Wrapper
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
  first: boolean;
}

/**
 * Shift Settings / Attendance Configuration
 */
export interface ShiftSettings {
  id: string;
  checkInTime: string; // HH:MM AM/PM format
  checkOutTime: string; // HH:MM AM/PM format
  acceptableDelayInMinutes: number;
  criticalHours: number;
  warningHours: number;
  hoursPerDay: number;
  weekends: string[]; // e.g., ['SATURDAY', 'SUNDAY']
  enableAutoReports: boolean;
  enableManualReports: boolean;
  enableMonitoring: boolean;
  enableLopMails: boolean;
  tenant: string;
  reportingName: string;
  employeeIdCode: string;
  reportingEmails: string[];
  fromEmail: string;
  markLateCheckin: boolean;
  reportsTime: string;
  reportsFrequency: string;
  employeeIds: string[];
}

/**
 * API Request/Response Wrappers
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface AttendanceRecordsRequest {
  employeeIds: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  shiftId: string;
}

export interface ExtraHoursSearchRequest {
  filters: {
    and: {
      officialEmail?: string;
      reportingTo?: string;
      status?: RegularisationStatus;
    };
  };
}

export interface ExtraHoursUpdateRequest {
  status: RegularisationStatus;
}

export interface ExtraHoursCreateRequest {
  date: string;
  extraHours: number;
  reason: string;
  officialEmail: string;
  reportingTo: string;
}

/**
 * Chart Data Point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

/**
 * Attendance Analytics Data
 */
export interface AttendanceAnalytics {
  period: 'week' | 'month';
  totalExpectedHours: number;
  totalLoggedHours: number;
  totalRegularizedHours: number;
  totalWorked: number;
  remainingHours: number;
  overtimeHours: number;
  complianceRating: number;
  chartData: ChartDataPoint[];
}

/**
 * Context State for Attendance Management
 */
export interface AttendanceContextType {
  currentRole: AttendanceRole;
  setCurrentRole: (role: AttendanceRole) => void;
  currentUser: {
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  setCurrentUser: (user: any) => void;
}

/**
 * Filter State for Regularisation Requests
 */
export interface RegularisationFilterState {
  status: RegularisationStatus | 'all';
  page: number;
  pageSize: number;
}

/**
 * Attendance Records Filter State
 */
export interface AttendanceRecordsFilterState {
  startDate: string;
  endDate: string;
  status: AttendanceStatus | 'all';
}

/**
 * Bulk Action Types for Regularisation
 */
export type RegularisationBulkAction = 'approve' | 'reject' | 'cancel';
