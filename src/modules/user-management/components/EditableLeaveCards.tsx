/**
 * Editable Leave Cards Component
 * Admin version of leave balance cards with credit/deduct buttons
 * Allows admin to modify employee leave credits
 * Renders type-specific cards based on leave configuration category
 * Supports 4 types: accrued, flexible, special, monetizable
 * Uses external CreditDeductLeavesDialog for editing
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeLeavesInformation, LMSConfiguration } from "../../../modules/leave-management-system/types/leaveConfiguration.types";
import { LeaveBalanceModel } from "../../../modules/leave-management-system/types/leaveConfiguration.types";
import {
  CalendarDays,
  Plus,
  Gift,
} from "lucide-react";

interface EditableLeaveCardsProps {
  employeeLeavesInfo: EmployeeLeavesInformation | null;
  onCreditDeduct?: (leaveCode: string) => void;
  onAddCredits?: () => void;
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

export function EditableLeaveCards({
  employeeLeavesInfo,
  onCreditDeduct,
  onAddCredits,
  isLoading = false,
}: EditableLeaveCardsProps) {
  // Show loading skeleton
  if (isLoading) {
    return <EditableLeaveCardsSkeleton />;
  }

  const balances = employeeLeavesInfo?.balances || {};
  const configurations = employeeLeavesInfo?.configurations || {};

  const categoryOrder = { accrued: 0, flexible: 1, special: 2, monetization: 3, monetizable: 4 };

  const leaveEntries = Object.entries(balances).sort(([codeA], [codeB]) => {
    const configA = configurations[codeA];
    const configB = configurations[codeB];

    const categoryA = configA?.category?.toLowerCase() || "unknown";
    const categoryB = configB?.category?.toLowerCase() || "unknown";

    const orderA = categoryOrder[categoryA as keyof typeof categoryOrder] ?? 999;
    const orderB = categoryOrder[categoryB as keyof typeof categoryOrder] ?? 999;

    return orderA - orderB;
  });

  return (
    <div className="space-y-6">
      {/* Individual Leave Type Cards - Editable Version */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {leaveEntries.map(([leaveCode, balance], index) => {
          const config = configurations[leaveCode] as LMSConfiguration;
          if (!config) return null;

          const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
          const category = config.category?.toLowerCase();

          return (
            <EditableLeaveCardByType
              key={leaveCode}
              config={config}
              balance={balance}
              gradient={gradient}
              category={category}
              onCreditDeduct={() => onCreditDeduct?.(leaveCode)}
              onAddCredits={onAddCredits}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {leaveEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <CalendarDays className="h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No leave types assigned</p>
          <p className="text-sm">Assign leave types to this employee first</p>
        </div>
      )}
    </div>
  );
}

interface EditableLeaveCardByTypeProps {
  config: LMSConfiguration;
  balance: LeaveBalanceModel;
  gradient: string;
  category?: string;
  onCreditDeduct?: () => void;
  onAddCredits?: () => void;
}

function EditableLeaveCardByType({
  config,
  balance,
  gradient,
  category,
  onCreditDeduct,
  onAddCredits,
}: EditableLeaveCardByTypeProps) {
  const available = balance.available ?? 0;
  const consumed = balance.consumed ?? 0;
  const accrued = balance.accrued ?? available + consumed;
  const expired = balance.expired ?? 0;
  const monetizable = balance.monetizable ?? 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Gradient header */}
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center border-b flex-shrink-0`}
      >
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <CalendarDays className="h-6 w-6 text-foreground" />
          </div>
          <Badge
            variant="secondary"
            className="font-semibold text-xs px-2 py-0.5"
          >
            {config.code}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold leading-tight line-clamp-2">
              {config.name}
            </CardTitle>
            {config.tagline && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {config.tagline}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            {category === "accrued" && (
              <div className="text-2xl font-bold text-green-600">
                {Math.round(available * 10) / 10}
              </div>
            )}
            {category === "flexible" && (
              <div className="text-2xl font-bold text-amber-600">
                {Math.round(consumed * 10) / 10}
              </div>
            )}
            {category === "special" && (
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(available * 10) / 10}
              </div>
            )}
            {(category === "monetization" || category === "monetizable") && (
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(monetizable * 10) / 10}
              </div>
            )}
            <div className="text-xs text-muted-foreground">balance</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4 px-4 flex-1 flex flex-col justify-between">
        {/* Description */}
        {config.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {config.description}
          </p>
        )}

        {/* Balance breakdown */}
        {category === "accrued" && (
          <div className="space-y-2 pt-1 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Consumed</span>
              <span className="font-semibold">
                {Math.round(consumed * 10) / 10} days
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Accrued</span>
              <span className="font-semibold">
                {Math.round(accrued * 10) / 10} days
              </span>
            </div>
          </div>
        )}

        {category === "flexible" && (
          <div className="space-y-2 pt-1 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Consumed</span>
              <span className="font-semibold">
                {Math.round(consumed * 10) / 10} days
              </span>
            </div>
          </div>
        )}

        {category === "special" && (
          <div className="space-y-2 pt-1 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Consumed</span>
              <span className="font-semibold">
                {Math.round(consumed * 10) / 10} days
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Expired</span>
              <span className="font-semibold">
                {Math.round(expired * 10) / 10} days
              </span>
            </div>
          </div>
        )}

        {(category === "monetization" || category === "monetizable") && (
          <div className="space-y-2 pt-1 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Monetizable</span>
              <span className="font-semibold">
                {Math.round(monetizable * 10) / 10} days
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 flex flex-col gap-2">
          {/* Credit/Deduct Button - For accrued and monetization leaves */}
          {category !== "flexible" && category !== "special" && (
            <Button
              className="w-full"
              variant="secondary"
              size="sm"
              onClick={onCreditDeduct}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Credit / Deduct
            </Button>
          )}
          {/* Add Credits Button - Only for special leaves */}
          {category === "special" && (
            <Button
              className="w-full"
              variant="default"
              size="sm"
              onClick={onAddCredits}
            >
              <Gift className="h-3.5 w-3.5 mr-1.5" />
              Add Credits
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for editable leave cards
 */
export function EditableLeaveCardsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-28" />
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
