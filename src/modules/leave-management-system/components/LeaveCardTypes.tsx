/**
 * Leave Card Types - Individual card components for different leave balance types
 * Supports 4 types: Accrued, Flexible, Special, Monetizable
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeaveConfiguration } from "../types/leaveConfiguration.types";
import { LeaveBalanceModel } from "../types/leaveConfiguration.types";
import {
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Plus,
} from "lucide-react";

interface BaseCardProps {
  config: LeaveConfiguration;
  balance: LeaveBalanceModel;
  gradient: string;
  onApplyLeave?: () => void;
}

/**
 * AccruedCard - For ACCRUED type leaves
 * Shows: available, consumed, accrued (total)
 * Layout: Large available display + breakdown of consumed and accrued
 */
export function AccruedCard({
  config,
  balance,
  gradient,
  onApplyLeave,
}: BaseCardProps) {
  const available = balance.available ?? 0;
  const consumed = balance.consumed ?? 0;
  const accrued = balance.accrued ?? available + consumed;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
      {/* Gradient header */}
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center border-b flex-shrink-0`}
      >
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <CalendarDays className="h-6 w-6 text-foreground" />
          </div>
          <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
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
            <div className="text-2xl font-bold text-green-600">
              {Math.round(available * 10) / 10}
            </div>
            <div className="text-xs text-muted-foreground">available</div>
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

        {/* Progress Bar - consumption */}
        <div className="space-y-1.5">
          <Progress
            value={accrued > 0 ? (consumed / accrued) * 100 : 0}
            className="h-1.5"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(consumed * 10) / 10} of {Math.round(accrued * 10) / 10} used</span>
            <span className="font-medium text-foreground">
              {accrued > 0 ? Math.round((consumed / accrued) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Balance breakdown */}
        <div className="space-y-2 pt-1 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Accrued</span>
            <span className="font-semibold">{Math.round(accrued * 10) / 10} days</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Consumed</span>
            <span className="font-semibold">{Math.round(consumed * 10) / 10} days</span>
          </div>
        </div>

        {/* Apply Leave Button */}
        <Button
          className="w-full mt-2"
          variant="default"
          size="sm"
          onClick={onApplyLeave}
          disabled={available === 0}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Apply {config.name}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * FlexibleCard - For FLEXIBLE type leaves
 * Shows: consumed only (no available/accrued - like remote work requests)
 * Layout: Consumption focused with no availability metric
 */
export function FlexibleCard({
  config,
  balance,
  gradient,
  onApplyLeave,
}: BaseCardProps) {
  const consumed = balance.consumed ?? 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col border-amber-200">
      {/* Gradient header */}
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center border-b flex-shrink-0`}
      >
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <Zap className="h-6 w-6 text-amber-600" />
          </div>
          <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
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
          <div className="text-right flex-shrink-0 px-2 py-1 rounded-md bg-amber-100">
            <div className="text-xl font-bold text-amber-700">
              {Math.round(consumed * 10) / 10}
            </div>
            <div className="text-xs text-amber-600 font-medium">used</div>
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

        {/* Info Badge */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Consumption-based leave (no availability limit)
          </p>
        </div>

        {/* Consumption history/current value */}
        <div className="space-y-2 pt-1 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Consumed</span>
            <span className="font-semibold text-amber-600">
              {Math.round(consumed * 10) / 10} units
            </span>
          </div>
        </div>

        {/* Apply Leave Button */}
        <Button
          className="w-full mt-2 bg-amber-600 hover:bg-amber-700"
          size="sm"
          onClick={onApplyLeave}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Request {config.name}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * SpecialCard - For SPECIAL type leaves
 * Shows: available, consumed, expired
 * Layout: Shows expiration status alongside consumption
 */
export function SpecialCard({
  config,
  balance,
  gradient,
  onApplyLeave,
}: BaseCardProps) {
  const available = balance.available ?? 0;
  const consumed = balance.consumed ?? 0;
  const expired = balance.expired ?? 0;
  const total = available + consumed + expired;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col border-purple-200">
      {/* Gradient header */}
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center border-b flex-shrink-0`}
      >
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <CheckCircle2 className="h-6 w-6 text-purple-600" />
          </div>
          <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
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
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(available * 10) / 10}
            </div>
            <div className="text-xs text-muted-foreground">available</div>
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

        {/* Stacked Progress showing available/consumed/expired */}
        <div className="space-y-1.5">
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
            {available > 0 && (
              <div
                className="bg-purple-500"
                style={{ width: `${(available / total) * 100}%` }}
              />
            )}
            {consumed > 0 && (
              <div
                className="bg-yellow-500"
                style={{ width: `${(consumed / total) * 100}%` }}
              />
            )}
            {expired > 0 && (
              <div
                className="bg-red-400"
                style={{ width: `${(expired / total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total: {Math.round(total * 10) / 10} days</span>
          </div>
        </div>

        {/* Balance breakdown */}
        <div className="space-y-2 pt-1 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Available
            </span>
            <span className="font-semibold">{Math.round(available * 10) / 10}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Consumed
            </span>
            <span className="font-semibold">{Math.round(consumed * 10) / 10}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Expired
            </span>
            <span className="font-semibold text-red-600">
              {Math.round(expired * 10) / 10}
            </span>
          </div>
        </div>

        {/* Apply Leave Button */}
        <Button
          className="w-full mt-2"
          variant="default"
          size="sm"
          onClick={onApplyLeave}
          disabled={available === 0}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Apply {config.name}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * MonetizableCard - For MONETIZABLE type leaves
 * Shows: available, encashable, monetizable
 * Layout: Highlights encashment and monetization options
 */
export function MonetizableCard({
  config,
  balance,
  gradient,
  onApplyLeave,
}: BaseCardProps) {
  const totalAvailable = balance.available ?? 0;
  const encashable = balance.encashable ?? 0;
  const monetizable = balance.monetizable ?? 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col border-emerald-200">
      {/* Gradient header */}
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center border-b flex-shrink-0`}
      >
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
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
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(totalAvailable * 10) / 10}
            </div>
            <div className="text-xs text-muted-foreground">total</div>
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

        {/* Available Indicator */}
        <div className="space-y-1.5">
          <Progress
            value={
              totalAvailable > 0
                ? ((encashable + monetizable) / totalAvailable) * 100
                : 0
            }
            className="h-1.5"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {Math.round((encashable + monetizable) * 10) / 10} of{" "}
              {Math.round(totalAvailable * 10) / 10} convertible
            </span>
            <span className="font-medium text-foreground">
              {totalAvailable > 0
                ? Math.round(
                    (((encashable + monetizable) / totalAvailable) * 100)
                  )
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Balance breakdown - Encashment & Monetization */}
        <div className="space-y-2 pt-1 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Encashable</span>
            <span className="font-semibold text-emerald-600">
              {Math.round(encashable * 10) / 10} days
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Monetizable</span>
            <span className="font-semibold text-blue-600">
              {Math.round(monetizable * 10) / 10} days
            </span>
          </div>
        </div>

        {/* Apply Leave Button */}
        <Button
          className="w-full mt-2"
          variant="default"
          size="sm"
          onClick={onApplyLeave}
          disabled={totalAvailable === 0}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Apply {config.name}
        </Button>
      </CardContent>
    </Card>
  );
}
