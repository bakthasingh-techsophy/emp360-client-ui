/**
 * Attendance Analytics Chart Component
 * Displays pie chart with logged hours, remaining hours, and overtime
 * Includes compliance rating and week/month filter
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendanceAnalytics } from '@/types/attendance';
import { BarChart3, TrendingUp } from 'lucide-react';

interface AttendanceChartProps {
  analytics: AttendanceAnalytics | null;
  onPeriodChange: (period: 'week' | 'month') => void;
  period: 'week' | 'month';
  loading?: boolean;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  analytics,
  onPeriodChange,
  period,
  loading = false,
}) => {
  const getComplianceColor = (rating: number) => {
    if (rating >= 90) return 'from-green-500 to-green-600';
    if (rating >= 75) return 'from-blue-500 to-blue-600';
    if (rating >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getComplianceLabel = (rating: number) => {
    if (rating >= 90) return 'Excellent';
    if (rating >= 75) return 'Good';
    if (rating >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  if (loading || !analytics) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-muted rounded-full border-t-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </Card>
    );
  }

  const maxValue = Math.max(...analytics.chartData.map((d) => d.value), 1);
  const complianceColor = getComplianceColor(analytics.complianceRating);
  const complianceLabel = getComplianceLabel(analytics.complianceRating);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Chart Card */}
      <Card className="lg:col-span-2 p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Hours Summary</h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={period === 'week' ? 'default' : 'outline'}
                onClick={() => onPeriodChange('week')}
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={period === 'month' ? 'default' : 'outline'}
                onClick={() => onPeriodChange('month')}
              >
                Month
              </Button>
            </div>
          </div>

          {/* Pie Chart Visualization using bars */}
          <div className="space-y-4">
            {analytics.chartData.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.value.toFixed(1)} hrs</p>
                    <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expected Hours</p>
              <p className="font-semibold text-sm">{analytics.totalExpectedHours.toFixed(1)} hrs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Worked</p>
              <p className="font-semibold text-sm">{analytics.totalWorked.toFixed(1)} hrs</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Compliance Rating Card */}
      <Card className="p-6 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Compliance Rating</h3>
          </div>

          {/* Rating Circle */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`relative w-32 h-32 bg-gradient-to-br ${complianceColor} rounded-full flex items-center justify-center shadow-lg`}>
              <div className="bg-background w-28 h-28 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">
                    {Math.round(analytics.complianceRating)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {complianceLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Logged Hours</span>
              <span className="font-medium">{analytics.totalLoggedHours.toFixed(1)} hrs</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Regularized</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{analytics.totalRegularizedHours.toFixed(1)} hrs
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                -{analytics.remainingHours.toFixed(1)} hrs
              </span>
            </div>
            {analytics.overtimeHours > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overtime</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  +{analytics.overtimeHours.toFixed(1)} hrs
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="pt-2">
            <Badge
              variant="outline"
              className={`w-full justify-center py-2 ${
                analytics.complianceRating >= 80
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                  : analytics.complianceRating >= 60
                    ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
              }`}
            >
              {analytics.complianceRating >= 90
                ? '✓ On Track'
                : analytics.complianceRating >= 75
                  ? '⚠ Monitor'
                  : '✕ Action Needed'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
