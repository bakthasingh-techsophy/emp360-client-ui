/**
 * Dummy Attendance Service
 * Provides mock attendance data structured exactly like backend API responses
 * Will be replaced with actual API services once backend is integrated
 */

import {
  PersonalAttendanceResponse,
  AttendanceDetail,
  AttendanceSummary,
  ExtraHoursRequest,
  PaginatedResponse,
  ShiftSettings,
  ApiResponse,
  AttendanceRecordsRequest,
  ExtraHoursSearchRequest,
  ExtraHoursUpdateRequest,
  ExtraHoursCreateRequest,
  RegularisationStatus,
} from "@/types/attendance";
import { addDays, format } from "date-fns";

// ============================================================================
// DUMMY DATA GENERATORS
// ============================================================================

/**
 * Generate mock attendance details for a date range
 */
function generateAttendanceDetails(
  startDate: Date,
  endDate: Date,
): AttendanceDetail[] {
  const details: AttendanceDetail[] = [];
  let current = new Date(startDate);
  const weekends = [5, 6]; // Saturday (5), Sunday (6)

  const doors = ["Main Gate", "Back Gate", "Office 1", "Office 2"];

  while (current <= endDate) {
    const dateStr = format(current, "yyyy-MM-dd");
    const dayOfWeek = current.getDay();
    const isWeekend = weekends.includes(dayOfWeek);

    if (isWeekend) {
      details.push({
        date: dateStr,
        checkinTime: null,
        checkoutTime: null,
        loggedHours: 0,
        regularizedHours: 0,
        expectedHours: 9.0,
        checkInDoor: null,
        checkOutDoor: null,
        attendanceStatus: "Weekend",
        lateCheckIn: null,
        loggedHoursStatus: null,
        warningHours: 0,
        criticalHours: 0,
      });
    } else {
      // Generate random working day
      const rand = Math.random();
      let detail: AttendanceDetail;

      if (rand < 0.7) {
        // 70% chance: Present with normal hours
        const checkinHour = 9 + Math.floor(Math.random() * 2);
        const checkinMin = Math.floor(Math.random() * 60);
        const checkoutHour = 17 + Math.floor(Math.random() * 2);
        const checkoutMin = Math.floor(Math.random() * 60);
        const loggedHours = 8 + Math.random() * 1;
        const warningHours = loggedHours < 6.5 ? loggedHours : 0;
        const criticalHours = loggedHours < 7.0 ? loggedHours : 0;

        detail = {
          date: dateStr,
          checkinTime: `${String(checkinHour).padStart(2, "0")}:${String(checkinMin).padStart(2, "0")}:00`,
          checkoutTime: `${String(checkoutHour).padStart(2, "0")}:${String(checkoutMin).padStart(2, "0")}:00`,
          loggedHours: parseFloat(loggedHours.toFixed(2)),
          regularizedHours: 0,
          expectedHours: 9.0,
          checkInDoor: doors[Math.floor(Math.random() * doors.length)],
          checkOutDoor: doors[Math.floor(Math.random() * doors.length)],
          attendanceStatus: "Present",
          lateCheckIn: checkinHour > 10,
          loggedHoursStatus:
            loggedHours < 6.5
              ? "Critical"
              : loggedHours < 8.5
                ? "Warning"
                : "Normal",
          warningHours,
          criticalHours,
        };
      } else {
        // 30% chance: Absent or Leave
        const status = Math.random() > 0.5 ? "Absent" : "On Leave";
        detail = {
          date: dateStr,
          checkinTime: null,
          checkoutTime: null,
          loggedHours: 0,
          regularizedHours: 0,
          expectedHours: 9.0,
          checkInDoor: null,
          checkOutDoor: null,
          attendanceStatus: status as any,
          lateCheckIn: null,
          loggedHoursStatus: null,
          warningHours: 0,
          criticalHours: 0,
        };
      }

      details.push(detail);
    }

    current = addDays(current, 1);
  }

  return details;
}

/**
 * Generate attendance summary
 */
function generateAttendanceSummary(
  details: AttendanceDetail[],
): AttendanceSummary {
  const lateCheckins = details.filter((d) => d.lateCheckIn === true).length;
  const workedDays = details.filter(
    (d) =>
      d.attendanceStatus === "Present" ||
      d.attendanceStatus === "Work From Home",
  ).length;

  return {
    numberOfLateCheckins: lateCheckins,
    totalWorkedDays: workedDays,
  };
}

/**
 * Shift Settings - Mock Data
 */
export const MOCK_SHIFT_SETTINGS: ShiftSettings = {
  id: "attendance-settings-regular",
  checkInTime: "10:00 AM",
  checkOutTime: "07:00 PM",
  acceptableDelayInMinutes: 15,
  criticalHours: 7.0,
  warningHours: 6.5,
  hoursPerDay: 9.0,
  weekends: ["SATURDAY", "SUNDAY"],
  enableAutoReports: true,
  enableManualReports: true,
  enableMonitoring: false,
  enableLopMails: false,
  tenant: "techsophy",
  reportingName: "Employee 360",
  employeeIdCode: "1",
  reportingEmails: ["younus.s@mailinator.com", "srikanth@mailinator.com"],
  fromEmail: "techsophyws@mailinator.com",
  markLateCheckin: false,
  reportsTime: "11:30 PM",
  reportsFrequency: "daily",
  employeeIds: ["590", "manager", "employee1"],
};

/**
 * Mock Users for Role Switching
 */
export const MOCK_USERS = {
  employee: {
    employeeId: "employee1",
    email: "younus.s@mailinator.com",
    firstName: "Shaik",
    lastName: "Younus",
  },
  reportingManager: {
    employeeId: "manager",
    email: "manager@mailinator.com",
    firstName: "Manager",
    lastName: "Lead",
  },
};

/**
 * Mock Extra Hours Requests - for employee
 */
function generateMockExtraHoursRequests(
  email: string,
  count: number = 5,
): ExtraHoursRequest[] {
  const statuses: RegularisationStatus[] = [
    "pending",
    "approved",
    "rejected",
    "cancelled",
  ];
  const reasons = [
    "Project deadline",
    "Client meeting",
    "System deployment",
    "Emergency support",
    "Testing environment",
  ];
  const requests: ExtraHoursRequest[] = [];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const requestDate = addDays(new Date(), -daysAgo);

    requests.push({
      id: `request-${i + 1}-${Date.now() + i}`,
      date: format(requestDate, "yyyy-MM-dd"),
      extraHours: Math.floor(Math.random() * 8) + 1,
      status: statuses[i % statuses.length],
      officialEmail: email,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      reportingTo: "younus.s@mailinator.com",
      createdAt: format(
        addDays(requestDate, -Math.floor(Math.random() * 5)),
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
      ),
      updatedAt: format(
        addDays(requestDate, -Math.floor(Math.random() * 3)),
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
      ),
    });
  }

  return requests;
}

/**
 * Mock Team Extra Hours Requests - for reporting manager
 */
function generateMockTeamExtraHoursRequests(
  reportingManagerEmail: string,
  count: number = 9,
): ExtraHoursRequest[] {
  const teamEmails = [
    "mahesh.s@mailinator.com",
    "chandrakiran.p@mailinator.com",
    "vinaypilla@mailinator.com",
    "younus.s@mailinator.com",
  ];
  const statuses: RegularisationStatus[] = [
    "pending",
    "approved",
    "rejected",
    "cancelled",
  ];
  const reasons = [
    "Project deadline",
    "Client meeting",
    "System deployment",
    "Emergency support",
    "Testing environment",
  ];
  const requests: ExtraHoursRequest[] = [];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const requestDate = addDays(new Date(), -daysAgo);

    requests.push({
      id: `team-request-${i + 1}-${Date.now() + i}`,
      date: format(requestDate, "yyyy-MM-dd"),
      extraHours: Math.floor(Math.random() * 8) + 1,
      status: statuses[i % statuses.length],
      officialEmail: teamEmails[i % teamEmails.length],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      reportingTo: reportingManagerEmail,
      createdAt: format(
        addDays(requestDate, -Math.floor(Math.random() * 5)),
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
      ),
      updatedAt: format(
        addDays(requestDate, -Math.floor(Math.random() * 3)),
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
      ),
    });
  }

  return requests;
}

// ============================================================================
// API SERVICE METHODS (DUMMY)
// ============================================================================

/**
 * Get personal attendance records for date range
 * POST /api/emp360-backend/v1/attendance/user-personal-data
 */
export async function getPersonalAttendanceData(
  request: AttendanceRecordsRequest,
): Promise<ApiResponse<PersonalAttendanceResponse>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);

  const attendanceDetails = generateAttendanceDetails(startDate, endDate);
  const attendanceSummary = generateAttendanceSummary(attendanceDetails);

  return {
    data: {
      firstName: MOCK_USERS.employee.firstName,
      lastName: MOCK_USERS.employee.lastName,
      employeeId: MOCK_USERS.employee.employeeId,
      officialEmail: MOCK_USERS.employee.email,
      shift: request.shiftId,
      attendanceDetails,
      attendanceSummary,
    },
    success: true,
    message: "Fetched Successfully",
  };
}

/**
 * Get extra hours requests (paginated)
 * POST /api/emp360-backend/v1/extra-hours/search?page={page}&size={pageSize}
 */
export async function getExtraHoursRequests(
  request: ExtraHoursSearchRequest,
  page: number = 0,
  pageSize: number = 5,
): Promise<ApiResponse<PaginatedResponse<ExtraHoursRequest>>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Determine if this is for employee or reporting manager
  const email = request.filters.and.officialEmail;
  const reportingTo = request.filters.and.reportingTo;

  let allRequests: ExtraHoursRequest[];

  if (email) {
    // My Requests (employee's own requests)
    allRequests = generateMockExtraHoursRequests(email, 12);
  } else if (reportingTo) {
    // Team Requests (for reporting manager)
    allRequests = generateMockTeamExtraHoursRequests(reportingTo, 9);
  } else {
    allRequests = [];
  }

  // Filter by status if provided
  if (request.filters.and.status) {
    allRequests = allRequests.filter(
      (r) => r.status === request.filters.and.status,
    );
  }

  // Apply pagination
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedContent = allRequests.slice(startIndex, endIndex);

  return {
    data: {
      content: paginatedContent,
      totalPages: Math.ceil(allRequests.length / pageSize),
      totalElements: allRequests.length,
      pageNumber: page,
      pageSize: pageSize,
      last: page >= Math.ceil(allRequests.length / pageSize) - 1,
      first: page === 0,
    },
    success: true,
    message: "Extra hours requests retrieved successfully",
  };
}

/**
 * Create extra hours request
 * POST /api/emp360-backend/v1/extra-hours
 */
export async function createExtraHoursRequest(
  request: ExtraHoursCreateRequest,
): Promise<ApiResponse<ExtraHoursRequest>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newRequest: ExtraHoursRequest = {
    id: `request-${Date.now()}`,
    date: request.date,
    extraHours: request.extraHours,
    status: "pending",
    officialEmail: request.officialEmail,
    reason: request.reason,
    reportingTo: request.reportingTo,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };

  return {
    data: newRequest,
    success: true,
    message: "Extra hours request created successfully",
  };
}

/**
 * Update extra hours request (approve, reject, cancel)
 * PUT /api/emp360-backend/v1/extra-hours/{id}
 */
export async function updateExtraHoursRequest(
  id: string,
  request: ExtraHoursUpdateRequest,
): Promise<ApiResponse<ExtraHoursRequest>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In real implementation, this would fetch from DB and update
  // For now, we'll return a mock response
  const mockRequest: ExtraHoursRequest = {
    id,
    date: format(addDays(new Date(), -5), "yyyy-MM-dd"),
    extraHours: 2.0,
    status: request.status,
    officialEmail: "younus.s@mailinator.com",
    reason: "Test request",
    reportingTo: "younus.s@mailinator.com",
    createdAt: null,
    updatedAt: new Date().toISOString(),
  };

  return {
    data: mockRequest,
    success: true,
    message: "Extra hours request updated successfully",
  };
}

/**
 * Get shift settings
 * GET /api/emp360-backend/v1/settings/attendance-settings/shift/{shiftId}
 */
export async function getShiftSettings(): Promise<ApiResponse<ShiftSettings>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    data: MOCK_SHIFT_SETTINGS,
    success: true,
    message: "Shift settings fetched successfully",
  };
}

/**
 * Delete/Cancel extra hours request
 * DELETE /api/emp360-backend/v1/extra-hours/{id}
 */
export async function cancelExtraHoursRequest(
  id: string,
): Promise<ApiResponse<ExtraHoursRequest>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return mock cancellation response
  const mockRequest: ExtraHoursRequest = {
    id,
    date: format(addDays(new Date(), -5), "yyyy-MM-dd"),
    extraHours: 2.0,
    status: "cancelled",
    officialEmail: "younus.s@mailinator.com",
    reason: "Test request",
    reportingTo: "younus.s@mailinator.com",
    createdAt: null,
    updatedAt: new Date().toISOString(),
  };

  return {
    data: mockRequest,
    success: true,
    message: "Extra hours request cancelled successfully",
  };
}
