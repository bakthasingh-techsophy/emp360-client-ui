/**
 * Leave Balance Cards Component
 * Displays leave balances and usage metrics with apply leave functionality
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaveBalance, Holiday } from '../types/leave.types';
import { CalendarDays, Calendar, Sparkles, TrendingUp, CheckCircle2, Clock, Plus } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

interface LeaveBalanceCardsProps {
  balances: LeaveBalance[];
  holidays?: Holiday[];
  onApplyLeave?: (leaveTypeId: string) => void;
}

export function LeaveBalanceCards({ balances, holidays = [], onApplyLeave }: LeaveBalanceCardsProps) {
  const totalAvailable = balances.reduce((sum, b) => sum + b.available, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  const totalPending = balances.reduce((sum, b) => sum + b.pending, 0);
  const totalAllotted = balances.reduce((sum, b) => sum + b.totalAllotted, 0);

  // Find next upcoming holiday
  const today = new Date();
  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextHoliday = upcomingHolidays[0];
  const daysUntilHoliday = nextHoliday 
    ? differenceInDays(parseISO(nextHoliday.date), today)
    : null;

  return (
    <div className="space-y-6">
      {/* KPI Cards + Next Holiday - Improved Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Allocated */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
                <p className="text-3xl font-bold tracking-tight">{totalAllotted}</p>
                <p className="text-xs text-muted-foreground">days this year</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Available Now</p>
                <p className="text-3xl font-bold tracking-tight text-green-600">{totalAvailable}</p>
                <p className="text-xs text-muted-foreground">ready to use</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Used */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Used</p>
                <p className="text-3xl font-bold tracking-tight text-orange-600">{totalUsed}</p>
                <p className="text-xs text-muted-foreground">days taken</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold tracking-tight text-blue-600">{totalPending}</p>
                <p className="text-xs text-muted-foreground">awaiting approval</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Holiday - Premium Card with Image */}
        {nextHoliday ? (
          <Card className="overflow-hidden border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden flex-shrink-0">
              {nextHoliday.imageUrl ? (
                <img
                  src={nextHoliday.imageUrl}
                  alt={nextHoliday.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary/40" />
                </div>
              )}
              {/* Overlay badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
                  {daysUntilHoliday === 0 ? '🎉 Today' : 
                   daysUntilHoliday === 1 ? '📅 Tomorrow' : 
                   `${daysUntilHoliday}d`}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">Next Holiday</p>
                <p className="text-sm font-bold line-clamp-1">{nextHoliday.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(nextHoliday.date), 'MMM dd, yyyy')}
                </p>
                {nextHoliday.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                    {nextHoliday.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden bg-muted/30">
            <div className="relative h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <CardContent className="p-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Next Holiday</p>
                <p className="text-sm font-semibold">None scheduled</p>
                <p className="text-xs text-muted-foreground">Check back later</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Individual Leave Type Cards - Holiday-Style Design */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {balances.map((balance) => {
          const usagePercentage = (balance.used / balance.totalAllotted) * 100;
          
          // Gradient backgrounds for visual appeal (similar to holiday cards)
          const gradients = {
            'AL': 'from-blue-500/20 to-blue-600/10',
            'SL': 'from-red-500/20 to-red-600/10',
            'CL': 'from-green-500/20 to-green-600/10',
            'ML': 'from-pink-500/20 to-pink-600/10',
            'PL': 'from-purple-500/20 to-purple-600/10',
            'CO': 'from-amber-500/20 to-amber-600/10',
          };
          const gradient = gradients[balance.leaveTypeCode as keyof typeof gradients] || 'from-gray-500/20 to-gray-600/10';

          return (
            <Card key={balance.leaveTypeId} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              {/* Visual Header with Gradient (like holiday image section) */}
              <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center border-b`}>
                <div className="text-center space-y-2">
                  <div className="h-14 w-14 mx-auto rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                    <CalendarDays className="h-7 w-7 text-foreground" />
                  </div>
                  <Badge variant="secondary" className="font-semibold text-sm px-3 py-1">
                    {balance.leaveTypeCode}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-bold line-clamp-1">
                    {balance.leaveTypeName}
                  </CardTitle>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold">{balance.available}</div>
                    <div className="text-xs text-muted-foreground">available</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-5">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={usagePercentage} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {balance.used} of {balance.totalAllotted} used
                    </span>
                    <span className="font-medium">{Math.round(usagePercentage)}%</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Pending</div>
                    <div className="text-lg font-semibold">{balance.pending}</div>
                  </div>
                  {balance.carriedForward !== undefined && balance.carriedForward > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Carried Forward</div>
                      <div className="text-lg font-semibold text-green-600">+{balance.carriedForward}</div>
                    </div>
                  )}
                </div>

                {/* Apply Leave Button */}
                <Button 
                  className="w-full mt-2" 
                  variant="default"
                  onClick={() => onApplyLeave?.(balance.leaveTypeId)}
                  disabled={balance.available === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Apply {balance.leaveTypeCode}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
