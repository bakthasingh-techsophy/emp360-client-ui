/**
 * Apply Leave Page
 * Dedicated page for employees to apply for leave
 * Supports URL parameters for pre-filling leave type
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { format, differenceInBusinessDays } from "date-fns";
import { CalendarIcon, Plus, AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaveApplicationCarrier, LeaveBalance } from "./types/leave.types";
import { EmployeeLeavesInformation } from "./types/leaveConfiguration.types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import { UsersSelector } from "@/components/context-aware/UsersSelector";

const applyLeaveFormSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  leaveCategory: z.enum(["fullDay", "partialDay", "partialTiming"]),
  startDate: z.date({
    errorMap: () => ({ message: "Date is required" }),
  }),
  endDate: z
    .date({
      errorMap: () => ({ message: "End date is required" }),
    })
    .optional(),
  partialDaySelection: z.enum(["firstHalf", "secondHalf"]).optional(),
  fromTime: z.string().optional(),
  toTime: z.string().optional(),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
  informToUserIds: z.array(z.string()).optional(),
});

type ApplyLeaveFormValues = z.infer<typeof applyLeaveFormSchema>;

interface ApplyLeavePageProps {}

export function ApplyLeavePage({}: ApplyLeavePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getEmployeeLeavesInformation } = useLeaveManagement();

  const [numberOfDays, setNumberOfDays] = useState(0);
  const [error, setError] = useState("");
  const [employeeLeavesInfo, setEmployeeLeavesInfo] =
    useState<EmployeeLeavesInformation | null>(null);
  const [untrackedLeave, setUntrackedLeave] = useState(false);

  const defaultLeaveTypeId = searchParams.get("leaveTypeId") || "";

  const form = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveFormSchema),
    defaultValues: {
      leaveTypeId: defaultLeaveTypeId,
      leaveCategory: "fullDay",
      startDate: undefined,
      endDate: undefined,
      partialDaySelection: undefined,
      fromTime: "",
      toTime: "",
      reason: "",
      informToUserIds: [],
    },
  });

  const { watch } = form;
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const leaveCategory = watch("leaveCategory");
  const selectedLeaveType = watch("leaveTypeId");

  // Helper function to assign colors to leave types
  const getColorForLeaveType = (leaveTypeCode: string): string => {
    const colorMap: Record<string, string> = {
      AL: "#3b82f6", // blue - Annual Leave
      general_leave: "#3b82f6", // blue
      SL: "#ef4444", // red - Sick Leave
      sick_leave: "#ef4444", // red
      CL: "#10b981", // green - Casual Leave
      casual_leave: "#10b981", // green
      ML: "#ec4899", // pink - Maternity Leave
      maternity_leave: "#ec4899", // pink
      PL: "#8b5cf6", // purple - Paternity Leave
      paternity_leave: "#8b5cf6", // purple
      CO: "#f59e0b", // amber - Compensatory Off
      compensatory_off: "#f59e0b", // amber
    };
    return colorMap[leaveTypeCode] || "#6366f1"; // indigo as default
  };

  // Transform employee leaves information to LeaveBalance array
  const buildLeaveBalancesFromInfo = (
    info: EmployeeLeavesInformation,
  ): LeaveBalance[] => {
    if (!info?.balances || !info?.configurations) {
      return [];
    }

    return Object.entries(info.balances).map(([leaveTypeKey, balance]) => {
      const config = info.configurations[leaveTypeKey];

      return {
        leaveTypeId: leaveTypeKey,
        leaveTypeName: config?.name || leaveTypeKey,
        leaveTypeCode:
          config?.code?.toUpperCase() ||
          leaveTypeKey.substring(0, 2).toUpperCase(),
        color: getColorForLeaveType(config?.code || leaveTypeKey),
        totalAllotted:
          (balance.available ?? 0) +
          (balance.encashable ?? 0) +
          (balance.monetizable ?? 0),
        used: 0,
        pending: 0,
        available: balance.available ?? 0,
        carriedForward: 0,
        lapsed: 0,
      };
    });
  };

  // Memoize computed balances
  const computedBalances = useMemo(() => {
    if (employeeLeavesInfo) {
      return buildLeaveBalancesFromInfo(employeeLeavesInfo);
    }
    return [];
  }, [employeeLeavesInfo]);

  // Fetch leave information on component mount
  const fetchData = async () => {
    try {
      const leaveInfo = await getEmployeeLeavesInformation();
      setEmployeeLeavesInfo(leaveInfo);
    } catch (error) {
      console.error("Failed to fetch leave information:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate number of days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInBusinessDays(endDate, startDate) + 1;
      setNumberOfDays(days > 0 ? days : 0);
      setError("");
    } else {
      setNumberOfDays(0);
    }
  }, [startDate, endDate]);

  // Validate against available balance (skip validation for flexible requests with 0 available)
  useEffect(() => {
    if (selectedLeaveType && numberOfDays > 0) {
      const balance = computedBalances.find(
        (b: LeaveBalance) => b.leaveTypeId === selectedLeaveType,
      );
      if (
        balance &&
        balance.available > 0 &&
        numberOfDays > balance.available
      ) {
        setError(
          `You only have ${balance.available} days available for ${balance.leaveTypeName}`,
        );
      } else {
        setError("");
      }
    }
  }, [selectedLeaveType, numberOfDays, computedBalances]);

  const onSubmit = async (values: ApplyLeaveFormValues) => {
    if (!selectedLeaveType || !startDate) {
      setError("Please fill in all required fields");
      return;
    }

    // For full day, both dates are required
    if (leaveCategory === "fullDay" && !endDate) {
      setError("End date is required for full day leave");
      return;
    }

    // For partial day, partial day selection is required
    if (leaveCategory === "partialDay" && !values.partialDaySelection) {
      setError("Please select first half or second half");
      return;
    }

    // For partial timing, both times are required
    if (
      leaveCategory === "partialTiming" &&
      (!values.fromTime || !values.toTime)
    ) {
      setError(
        "Please select both from time and to time for partial timing leave",
      );
      return;
    }

    // Validate balance only for non-flexible leaves (those with available balance > 0)
    const balance = computedBalances.find(
      (b: LeaveBalance) => b.leaveTypeId === selectedLeaveType,
    );
    if (balance && balance.available > 0 && numberOfDays > balance.available) {
      setError(
        `Insufficient leave balance. You have ${balance.available} days available.`,
      );
      return;
    }

    try {
      // For partial day and partial timing, set endDate equal to startDate
      const applyEndDate = leaveCategory === "fullDay" ? endDate : startDate;

      const leaveData: LeaveApplicationCarrier = {
        leaveType: selectedLeaveType,
        fromDate: startDate.toISOString(),
        toDate: applyEndDate!.toISOString(),
        leaveCategory:
          leaveCategory === "partialTiming"
            ? "partialDay"
            : (leaveCategory as "fullDay" | "partialDay"),
        partialDaySelection:
          leaveCategory === "partialDay"
            ? (values.partialDaySelection as "firstHalf" | "secondHalf")
            : undefined,
        reason: values.reason.trim(),
        fromTime:
          leaveCategory === "partialTiming" ? values.fromTime : undefined,
        toTime: leaveCategory === "partialTiming" ? values.toTime : undefined,
        informTo:
          values.informToUserIds && values.informToUserIds.length > 0
            ? values.informToUserIds
            : undefined,
      };

      // TODO: Call API to submit leave application
      console.log("Leave application to submit:", leaveData);

      // Navigate back to leave page after successful submission
      //   navigate("/leave-holiday");
    } catch (err) {
      console.error("Failed to submit leave application:", err);
      setError("Failed to submit leave application. Please try again.");
    }
  };

  const selectedBalance = computedBalances.find(
    (b: LeaveBalance) => b.leaveTypeId === selectedLeaveType,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Main Form */}
          <Card>
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/leave-holiday")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Apply for Leave</h1>
                <p className="text-muted-foreground mt-1">
                  Submit a new leave application
                </p>
              </div>
            </div>

            <div className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Leave Type Selection */}
                  <FormField
                    control={form.control}
                    name="leaveTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {computedBalances.map((balance: LeaveBalance) => (
                              <SelectItem
                                key={balance.leaveTypeId}
                                value={balance.leaveTypeId}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{balance.leaveTypeName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({balance.available} days available)
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedBalance && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">
                        Available:{" "}
                        <span className="font-semibold text-green-600">
                          {selectedBalance.available}
                        </span>{" "}
                        days
                        {selectedBalance.pending > 0 && (
                          <span className="text-amber-600 ml-2">
                            ({selectedBalance.pending} pending)
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Leave Category Selection */}
                  <FormField
                    control={form.control}
                    name="leaveCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Category *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fullDay">Full Day</SelectItem>
                            <SelectItem value="partialDay">
                              Partial Day (Half Day)
                            </SelectItem>
                            <SelectItem value="partialTiming">
                              Partial Timing
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Untracked Leave Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="untrackedLeave"
                      checked={untrackedLeave}
                      onCheckedChange={(checked) =>
                        setUntrackedLeave(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="untrackedLeave"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Untracked Leave (apply for forgotten leave)
                    </label>
                  </div>
                  {/* Date Selection - Conditional based on Leave Category */}
                  {leaveCategory === "fullDay" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={
                                    !untrackedLeave
                                      ? (date) => date < new Date()
                                      : undefined
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={
                                    !untrackedLeave
                                      ? (date) => !startDate || date < startDate
                                      : (date) => !startDate || date < startDate
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Single Date Selection for Partial Day and Partial Timing */}
                  {(leaveCategory === "partialDay" ||
                    leaveCategory === "partialTiming") && (
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={
                                  !untrackedLeave
                                    ? (date) => date < new Date()
                                    : undefined
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Number of Days Display - Only for Full Day */}
                  {numberOfDays > 0 && leaveCategory === "fullDay" && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium">
                        Duration:{" "}
                        <span className="text-lg font-bold text-primary">
                          {numberOfDays}
                        </span>{" "}
                        business day{numberOfDays !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  {/* Partial Day Selection - First Half or Second Half */}
                  {leaveCategory === "partialDay" && (
                    <FormField
                      control={form.control}
                      name="partialDaySelection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Half Day Selection *</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select half day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="firstHalf">
                                First Half
                              </SelectItem>
                              <SelectItem value="secondHalf">
                                Second Half
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Time Selection for Partial Timing */}
                  {leaveCategory === "partialTiming" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fromTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Time *</FormLabel>
                            <FormControl>
                              <TimePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select from time"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="toTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Time *</FormLabel>
                            <FormControl>
                              <TimePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select to time"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Reason */}
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide a reason for your leave request..."
                            {...field}
                            rows={4}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="informToUserIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inform To (Optional)</FormLabel>
                        <FormControl>
                          <UsersSelector
                            value={field.value || []}
                            onChange={(selectedValue) => {
                              // Can be string or string[] depending on mode
                              const emails = Array.isArray(selectedValue)
                                ? selectedValue
                                : selectedValue
                                  ? [selectedValue]
                                  : [];
                              field.onChange(emails);
                            }}
                            placeholder="Search and select employees to inform..."
                            disabled={false}
                            returnField="email"
                            type="multiple"
                          />
                        </FormControl>
                        <FormDescription>
                          Select employees to notify about this leave request
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Error Message */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </div>
          </Card>
        </div>
      </div>

      {/* Form Action Bar - Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm p-4 z-40">
        <div className="container mx-auto flex gap-2 justify-end">
          <Button variant="outline" onClick={() => navigate("/leave-holiday")}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              !!error ||
              !selectedLeaveType ||
              !startDate ||
              !endDate ||
              !form.getValues("reason").trim() ||
              (leaveCategory === "partialDay" &&
                (!form.getValues("fromTime") || !form.getValues("toTime")))
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Submit Application
          </Button>
        </div>
      </div>

      {/* Padding for fixed bottom bar */}
      <div className="h-20" />
    </div>
  );
}
