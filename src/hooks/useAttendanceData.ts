/**
 * Custom Hooks for Attendance Management
 */

import { useEffect, useState, useCallback } from 'react';
import { subDays, format } from 'date-fns';
import {
  PersonalAttendanceResponse,
  ExtraHoursRequest,
  PaginatedResponse,
  ShiftSettings,
  AttendanceAnalytics,
  RegularisationStatus,
  AttendanceDetail,
} from '@/types/attendance';
import {
  getPersonalAttendanceData,
  getExtraHoursRequests,
  getShiftSettings,
  createExtraHoursRequest,
  updateExtraHoursRequest,
  cancelExtraHoursRequest,
} from '@/services/attendanceService';

// ============================================================================
// HOOKS FOR DATA FETCHING
// ============================================================================

/**
 * Hook: Fetch personal attendance records
 */
export function usePersonalAttendance(
  employeeId: string,
  shiftId: string = 'regular',
  startDate?: string,
  endDate?: string
) {
  const [data, setData] = useState<PersonalAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default to last 10 days if dates not provided
  const finalEndDate = endDate || format(new Date(), 'yyyy-MM-dd');
  const finalStartDate = startDate || format(subDays(new Date(), 10), 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPersonalAttendanceData({
        employeeIds: [employeeId],
        startDate: finalStartDate,
        endDate: finalEndDate,
        shiftId,
      });

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch attendance data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [employeeId, shiftId, finalStartDate, finalEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook: Fetch extra hours requests with pagination
 */
export function useExtraHoursRequests(
  email: string,
  reportingTo?: string,
  initialPage: number = 0,
  pageSize: number = 5
) {
  const [data, setData] = useState<PaginatedResponse<ExtraHoursRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState<RegularisationStatus | 'all'>('all');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getExtraHoursRequests(
        {
          filters: {
            and: {
              ...(email && { officialEmail: email }),
              ...(reportingTo && { reportingTo }),
              ...(statusFilter !== 'all' && { status: statusFilter }),
            },
          },
        },
        currentPage,
        pageSize
      );

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch requests');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [email, reportingTo, currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    data,
    loading,
    error,
    currentPage,
    setCurrentPage,
    statusFilter,
    setStatusFilter,
    refetch: fetchRequests,
  };
}

/**
 * Hook: Fetch shift settings
 */
export function useShiftSettings(shiftId: string = 'regular') {
  const [data, setData] = useState<ShiftSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getShiftSettings();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch shift settings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { data, loading, error };
}

// ============================================================================
// HOOKS FOR MUTATIONS (CREATE, UPDATE, DELETE)
// ============================================================================

/**
 * Hook: Create extra hours request
 */
export function useCreateExtraHourRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (
      date: string,
      extraHours: number,
      reason: string,
      officialEmail: string,
      reportingTo: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await createExtraHoursRequest({
          date,
          extraHours,
          reason,
          officialEmail,
          reportingTo,
        });

        if (response.success) {
          return response.data;
        } else {
          setError(response.message || 'Failed to create request');
          return null;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error };
}

/**
 * Hook: Update extra hours request (approve/reject)
 */
export function useUpdateExtraHourRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: string, status: RegularisationStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateExtraHoursRequest(id, { status });

      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to update request');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

/**
 * Hook: Cancel extra hours request
 */
export function useCancelExtraHourRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cancelExtraHoursRequest(id);

      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to cancel request');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cancel, loading, error };
}

// ============================================================================
// HOOKS FOR ANALYTICS
// ============================================================================

/**
 * Hook: Calculate attendance analytics from attendance details
 */
export function useAttendanceAnalytics(
  attendanceDetails: AttendanceDetail[] | null,
  shiftSettings: ShiftSettings | null,
  period: 'week' | 'month' = 'week'
) {
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);

  useEffect(() => {
    if (!attendanceDetails || !shiftSettings) return;

    const now = new Date();

    // Determine number of days for period
    let daysInPeriod: Date[] = [];
    if (period === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        daysInPeriod.push(subDays(now, i));
      }
    } else {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        daysInPeriod.push(subDays(now, i));
      }
    }

    // Filter attendance details for the period
    const dateStrings = daysInPeriod.map((d) => format(d, 'yyyy-MM-dd'));
    const periodDetails = attendanceDetails.filter((d) => dateStrings.includes(d.date));

    // Count working days (exclude weekends)
    const workingDays = periodDetails.filter((d) => d.attendanceStatus !== 'Weekend');

    // Calculate totals
    const totalExpectedHours = workingDays.length * shiftSettings.hoursPerDay;
    const totalLoggedHours = workingDays.reduce((sum, d) => sum + d.loggedHours, 0);
    const totalRegularizedHours = workingDays.reduce((sum, d) => sum + d.regularizedHours, 0);
    const totalWorked = totalLoggedHours + totalRegularizedHours;
    const remainingHours = Math.max(0, totalExpectedHours - totalWorked);
    const overtimeHours = Math.max(0, totalWorked - totalExpectedHours);

    // Calculate compliance rating (0-100%)
    let complianceRating = 0;
    if (totalExpectedHours > 0) {
      complianceRating = Math.min(100, (totalWorked / totalExpectedHours) * 100);
    }

    // Prepare chart data
    const chartData = [
      {
        label: 'Logged Hours',
        value: parseFloat(totalLoggedHours.toFixed(2)),
        percentage: totalExpectedHours > 0 ? (totalLoggedHours / totalExpectedHours) * 100 : 0,
        color: 'hsl(var(--chart-1))',
      },
      {
        label: 'Remaining Hours',
        value: parseFloat(remainingHours.toFixed(2)),
        percentage: totalExpectedHours > 0 ? (remainingHours / totalExpectedHours) * 100 : 0,
        color: 'hsl(var(--chart-2))',
      },
      {
        label: 'Overtime',
        value: parseFloat(overtimeHours.toFixed(2)),
        percentage: totalExpectedHours > 0 ? (overtimeHours / totalExpectedHours) * 100 : 0,
        color: 'hsl(var(--chart-3))',
      },
    ];

    setAnalytics({
      period,
      totalExpectedHours: parseFloat(totalExpectedHours.toFixed(2)),
      totalLoggedHours: parseFloat(totalLoggedHours.toFixed(2)),
      totalRegularizedHours: parseFloat(totalRegularizedHours.toFixed(2)),
      totalWorked: parseFloat(totalWorked.toFixed(2)),
      remainingHours: parseFloat(remainingHours.toFixed(2)),
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
      complianceRating: parseFloat(complianceRating.toFixed(2)),
      chartData,
    });
  }, [attendanceDetails, shiftSettings, period]);

  return analytics;
}
