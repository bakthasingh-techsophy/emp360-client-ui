/**
 * Attendance Records Table Component
 * Displays employee attendance records with filtering and date range selection
 */

import { useMemo } from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, AlertTriangle, AlertCircle } from 'lucide-react';
import { PersonalAttendanceResponse, AttendanceDetail } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface AttendanceRecordsTableProps {
  data: PersonalAttendanceResponse | null;
  loading: boolean;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  startDate: string;
  endDate: string;
}

export const AttendanceRecordsTable: React.FC<AttendanceRecordsTableProps> = ({
  data,
  loading,
  onDateRangeChange,
  startDate,
  endDate,
}) => {
  // Get status badge color
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Present: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      Absent: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      Weekend: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
      'On Leave': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      'Work From Home': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    };
    return variants[status] || '';
  };

  // Get hours status indicator
  const getHoursStatus = (detail: AttendanceDetail) => {
    const critical = detail.criticalHours > 0;
    const warning = detail.warningHours > 0;

    if (critical) {
      return {
        color: 'text-red-600 dark:text-red-400',
        icon: AlertCircle,
        label: 'Critical',
      };
    }
    if (warning) {
      return {
        color: 'text-orange-600 dark:text-orange-400',
        icon: AlertTriangle,
        label: 'Warning',
      };
    }
    return {
      color: 'text-green-600 dark:text-green-400',
      icon: null,
      label: 'Normal',
    };
  };

  const hoursStatus = useMemo(() => {
    if (!data?.attendanceDetails) return {};
    const status: Record<string, any> = {};
    data.attendanceDetails.forEach((detail) => {
      status[detail.date] = getHoursStatus(detail);
    });
    return status;
  }, [data?.attendanceDetails]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-muted rounded-full border-t-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading attendance records...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No attendance data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header with Date Range */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-sm">Attendance Records</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {data.firstName} {data.lastName} • Shift: {data.shift}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">
                    {format(parseISO(startDate), 'MMM dd')} - {format(parseISO(endDate), 'MMM dd')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          if (e.target.value <= endDate) {
                            onDateRangeChange(e.target.value, endDate);
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border rounded border-input"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          if (e.target.value >= startDate) {
                            onDateRangeChange(startDate, e.target.value);
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border rounded border-input"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing {data.attendanceDetails.length} days
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b bg-background grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Worked</p>
          <p className="font-semibold text-sm">
            {data.attendanceDetails
              .reduce((sum, d) => sum + d.loggedHours + d.regularizedHours, 0)
              .toFixed(1)}{' '}
            hrs
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Worked Days</p>
          <p className="font-semibold text-sm">{data.attendanceSummary.totalWorkedDays}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Late Check-ins</p>
          <p className="font-semibold text-sm text-orange-600 dark:text-orange-400">
            {data.attendanceSummary.numberOfLateCheckins}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Expected Hours</p>
          <p className="font-semibold text-sm">
            {data.attendanceDetails
              .filter((d) => d.attendanceStatus !== 'Weekend')
              .reduce((sum, d) => sum + d.expectedHours, 0)
              .toFixed(1)}{' '}
            hrs
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Date</TableHead>
              <TableHead className="w-28">Check-in</TableHead>
              <TableHead className="w-28">Check-out</TableHead>
              <TableHead className="text-right w-28">Logged Hours</TableHead>
              <TableHead className="text-right w-28">Regular Hours</TableHead>
              <TableHead className="text-right w-28">Expected Hours</TableHead>
              <TableHead className="w-28">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.attendanceDetails.map((detail) => {
              const statusInfo = hoursStatus[detail.date];
              const StatusIcon = statusInfo?.icon;
              const isLate = detail.lateCheckIn === true;

              return (
                <TableRow
                  key={detail.date}
                  className={cn(
                    'hover:bg-muted/50',
                    statusInfo?.color === 'text-red-600 dark:text-red-400' && 'bg-red-500/5',
                    statusInfo?.color === 'text-orange-600 dark:text-orange-400' && 'bg-orange-500/5'
                  )}
                >
                  <TableCell className="font-medium text-sm">
                    <div>
                      <p>{format(parseISO(detail.date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">
                        {isToday(parseISO(detail.date))
                          ? 'Today'
                          : isYesterday(parseISO(detail.date))
                            ? 'Yesterday'
                            : format(parseISO(detail.date), 'EEE')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {detail.checkinTime ? (
                      <div>
                        <p className={isLate ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                          {format(parseISO(`2000-01-01T${detail.checkinTime}`), 'HH:mm')}
                        </p>
                        {detail.checkInDoor && (
                          <p className="text-xs text-muted-foreground">{detail.checkInDoor}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {detail.checkoutTime ? (
                      <div>
                        <p>{format(parseISO(`2000-01-01T${detail.checkoutTime}`), 'HH:mm')}</p>
                        {detail.checkOutDoor && (
                          <p className="text-xs text-muted-foreground">{detail.checkOutDoor}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {detail.loggedHours > 0 ? detail.loggedHours.toFixed(2) : '—'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {detail.regularizedHours > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        {detail.regularizedHours.toFixed(2)}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {detail.expectedHours.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getStatusBadge(detail.attendanceStatus)}`}>
                        {detail.attendanceStatus}
                      </Badge>
                      {StatusIcon && (
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} title={statusInfo.label} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-muted/30 text-xs text-muted-foreground">
        <p className="font-medium mb-2">Legend:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
            <span>Critical Hours (&lt; 7.0 hrs)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
            <span>Warning Hours (&lt; 6.5 hrs)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Regularized Hours = Extra hours approved by manager</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
