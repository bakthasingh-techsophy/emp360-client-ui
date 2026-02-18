/**
 * Leave Balance Cards Component
 * Displays leave balances and usage metrics using EmployeeLeavesInformation
 * Renders type-specific cards based on leave configuration category
 * Supports 4 types: accrued, flexible, special, monetizable
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HolidayInfo } from "../types/leave.types";
import { EmployeeLeavesInformation, LeaveConfiguration } from "../types/leaveConfiguration.types";
import {
  CalendarDays,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  AccruedCard,
  FlexibleCard,
  SpecialCard,
  MonetizableCard,
} from "./LeaveCardTypes";

interface LeaveBalanceCardsProps {
  employeeLeavesInfo: EmployeeLeavesInformation | null;
  holidays?: HolidayInfo[];
  onApplyLeave?: (leaveTypeId: string) => void;
  isLoading?: boolean;
}

const CARD_GRADIENTS = [
  "from-blue-500/20 to-blue-600/10",
  "from-red-500/20 to-red-600/10",
  "from-green-500/20 to-green-600/10",
  "from-pink-500/20 to-pink-600/10",
  "from-purple-500/20 to-purple-600/10",
  "from-amber-500/20 to-amber-600/10",
  "from-cyan-500/20 to-cyan-600/10",
  "from-teal-500/20 to-teal-600/10",
];

export function LeaveBalanceCards({
  employeeLeavesInfo,
  holidays = [],
  onApplyLeave,
  isLoading = false,
}: LeaveBalanceCardsProps) {
  // Show loading skeleton
  if (isLoading) {
    return <LeaveBalanceCardsSkeleton />;
  }

  // Extract balances and configurations from employeeLeavesInfo
  const balances = employeeLeavesInfo?.balances || {};
  const configurations = employeeLeavesInfo?.configurations || {};
  
  // Define category order
  const categoryOrder = { accrued: 0, flexible: 1, special: 2, monetization: 3, monetizable: 4 };
  
  // Sort leave entries by category order
  const leaveEntries = Object.entries(balances).sort(([codeA], [codeB]) => {
    const configA = configurations[codeA];
    const configB = configurations[codeB];
    
    const categoryA = configA?.category?.toLowerCase() || "unknown";
    const categoryB = configB?.category?.toLowerCase() || "unknown";
    
    const orderA = categoryOrder[categoryA as keyof typeof categoryOrder] ?? 999;
    const orderB = categoryOrder[categoryB as keyof typeof categoryOrder] ?? 999;
    
    return orderA - orderB;
  });

  // Calculate totals intelligently based on card types
  let totalEncashable = 0;
  let totalMonetizable = 0;

  leaveEntries.forEach(([leaveCode, balance]) => {
    const config = configurations[leaveCode];
    if (!config) return;

    const category = config.category?.toLowerCase();
    if (category === "monetization" || category === "monetizable") {
      totalEncashable += balance.encashable ?? 0;
      totalMonetizable += balance.monetizable ?? 0;
    }
  });

  const today = new Date();
  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextHoliday = upcomingHolidays[0];

  return (
    <div className="space-y-6">
      {/* KPI Cards + Next Holiday */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Available - Total */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-3xl font-bold tracking-tight text-green-600">
                  {leaveEntries.reduce((sum, [code]) => {
                    const config = configurations[code];
                    const balance = balances[code];
                    if (config?.category?.toLowerCase() !== "flexible") {
                      return sum + (balance?.available ?? 0);
                    }
                    return sum;
                  }, 0)}
                </p>
                <p className="text-xs text-muted-foreground">days available</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encashable */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Encashable
                </p>
                <p className="text-3xl font-bold tracking-tight text-orange-600">
                  {totalEncashable}
                </p>
                <p className="text-xs text-muted-foreground">can be encashed</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monetizable */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Monetizable
                </p>
                <p className="text-3xl font-bold tracking-tight text-blue-600">
                  {totalMonetizable}
                </p>
                <p className="text-xs text-muted-foreground">
                  can be monetized
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Holiday */}
        {nextHoliday ? (
          <Card className="overflow-hidden border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {nextHoliday.imageUrl ? (
                <img
                  src={nextHoliday.imageUrl}
                  alt={nextHoliday.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sparkles className="h-8 w-8 text-primary/40" />
              )}
            </div>
            <CardContent className="p-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  Next Holiday
                </p>
                <p className="text-sm font-bold line-clamp-1">
                  {nextHoliday.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(nextHoliday.date), "MMM dd, yyyy")}
                </p>
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Next Holiday
                </p>
                <p className="text-sm font-semibold">None scheduled</p>
                <p className="text-xs text-muted-foreground">
                  Check back later
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Individual Leave Type Cards - Type-Specific Rendering */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {leaveEntries.map(([leaveCode, balance], index) => {
          const config = configurations[leaveCode] as LeaveConfiguration;
          if (!config) return null; // Skip if no configuration found

          const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

          // Render type-specific card based on category
          const handleApplyLeave = () => onApplyLeave?.(leaveCode);

          switch (config.category?.toLowerCase()) {
            case "accrued":
              return (
                <AccruedCard
                  key={leaveCode}
                  config={config}
                  balance={balance}
                  gradient={gradient}
                  onApplyLeave={handleApplyLeave}
                />
              );
            case "flexible":
              return (
                <FlexibleCard
                  key={leaveCode}
                  config={config}
                  balance={balance}
                  gradient={gradient}
                  onApplyLeave={handleApplyLeave}
                />
              );
            case "special":
              return (
                <SpecialCard
                  key={leaveCode}
                  config={config}
                  balance={balance}
                  gradient={gradient}
                  onApplyLeave={handleApplyLeave}
                />
              );
            case "monetization":
            case "monetizable":
              return (
                <MonetizableCard
                  key={leaveCode}
                  config={config}
                  balance={balance}
                  gradient={gradient}
                  onApplyLeave={handleApplyLeave}
                />
              );
            default:
              // Fallback to accrued for unknown types
              return (
                <AccruedCard
                  key={leaveCode}
                  config={config}
                  balance={balance}
                  gradient={gradient}
                  onApplyLeave={handleApplyLeave}
                />
              );
          }
        })}
      </div>

      {/* Empty state */}
      {leaveEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <CalendarDays className="h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No leave types assigned</p>
          <p className="text-sm">
            You don't have any leave types assigned. Contact your administrator.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for LeaveBalanceCards during loading state
 */
function LeaveBalanceCardsSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leave Type Cards Skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Card key={idx} className="overflow-hidden flex flex-col">
            {/* Header skeleton */}
            <div className="h-28 bg-gradient-to-br from-muted to-muted/50 p-4 flex items-center justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            <CardHeader className="pb-2 pt-4 px-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-4 px-4 flex-1 flex flex-col justify-between">
              {/* Description skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>

              {/* Progress skeleton */}
              <div className="space-y-1.5">
                <Skeleton className="h-1.5 w-full rounded" />
                <Skeleton className="h-3 w-2/3" />
              </div>

              {/* Balance breakdown skeleton */}
              <div className="space-y-2 pt-1 border-t">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>

              {/* Button skeleton */}
              <Skeleton className="h-9 w-full rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
