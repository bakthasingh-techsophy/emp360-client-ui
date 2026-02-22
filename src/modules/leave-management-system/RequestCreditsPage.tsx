/**
 * Request Credits Page
 * Dedicated page for employees to request credits (comp-off, special leave, etc.)
 * Supports URL parameters for pre-filling credit type
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditCarrier } from "./types/leave.types";
import { EmployeeLeavesInformation } from "./types/leaveConfiguration.types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import { useSelfService } from "@/contexts/SelfServiceContext";
import { UsersSelector } from "@/components/context-aware/UsersSelector";

const requestCreditsFormSchema = z.object({
  creditType: z.string().min(1, "Credit type is required"),
  fromDate: z.date({
    errorMap: () => ({ message: "From date is required" }),
  }),
  toDate: z.date({
    errorMap: () => ({ message: "To date is required" }),
  }),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
  informTo: z.array(z.string()).optional(),
});

type RequestCreditsFormValues = z.infer<typeof requestCreditsFormSchema>;

interface RequestCreditsPageProps {}

export function RequestCreditsPage({}: RequestCreditsPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getEmployeeLeavesInformation } = useLeaveManagement();
  const { requestCredits, isLoading } = useSelfService();

  const [error, setError] = useState("");
  const [employeeLeavesInfo, setEmployeeLeavesInfo] =
    useState<EmployeeLeavesInformation | null>(null);

  const defaultCreditTypeId = searchParams.get("creditType") || "";

  const form = useForm<RequestCreditsFormValues>({
    resolver: zodResolver(requestCreditsFormSchema),
    defaultValues: {
      creditType: defaultCreditTypeId,
      fromDate: undefined,
      toDate: undefined,
      reason: "",
      informTo: [],
    },
  });

  const { watch } = form;
  const selectedCreditType = watch("creditType");
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  // Fetch leave information on component mount
  const fetchData = async () => {
    const leaveInfo = await getEmployeeLeavesInformation();
    setEmployeeLeavesInfo(leaveInfo);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get special leave configurations
  const specialLeaveConfigs = useMemo(() => {
    if (!employeeLeavesInfo?.configurations) return [];
    return Object.entries(employeeLeavesInfo.configurations)
      .filter(
        ([_, config]) =>
          config.category?.toLowerCase() === "special"
      )
      .map(([code, config]) => ({
        code,
        config,
      }));
  }, [employeeLeavesInfo]);

  // Navigate back to main page with preserved tab state
  const handleGoBack = () => {
    const mainTab = searchParams.get("mainTab") || "balances";
    const applicationsTab =
      searchParams.get("applicationsTab") || "my-applications";
    navigate(
      `/leave-holiday?mainTab=${encodeURIComponent(mainTab)}&applicationsTab=${encodeURIComponent(applicationsTab)}`,
    );
  };

  const onSubmit = async (values: RequestCreditsFormValues) => {
    if (!selectedCreditType || !fromDate || !toDate) {
      setError("Please fill in all required fields");
      return;
    }

    const creditData: CreditCarrier = {
      creditType: selectedCreditType,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      reason: values.reason.trim(),
      informTo:
        values.informTo && values.informTo.length > 0
          ? values.informTo
          : undefined,
      createdAt: new Date().toISOString(),
    };

    // Submit credit request - context handles success/error notifications
    await requestCredits(creditData);

    // Navigate back to previous page after API call completes
    // (context will show success/error toast as needed)
    handleGoBack();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Main Form */}
          <Card>
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b">
              <Button variant="outline" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Request Credits</h1>
                <p className="text-muted-foreground mt-1">
                  Request credits like comp-off or special leave
                </p>
              </div>
            </div>

            <div className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Credit Type Selection */}
                  <FormField
                    control={form.control}
                    name="creditType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Type *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select credit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialLeaveConfigs.map(({ code, config }) => (
                              <SelectItem key={code} value={code}>
                                <div className="flex items-center gap-2">
                                  <span>{config.name}</span>
                                  {config.tagline && (
                                    <span className="text-xs text-muted-foreground">
                                      ({config.tagline})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Credits Input */}
                  <div className="hidden" />

                  {/* Date Range Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fromDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid From *</FormLabel>
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
                                disabled={(date) => date < new Date()}
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
                      name="toDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until *</FormLabel>
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
                                disabled={(date) =>
                                  !fromDate || date < fromDate
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

                  {/* Reason */}
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide a reason for your credit request..."
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
                    name="informTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inform To (Optional)</FormLabel>
                        <FormControl>
                          <UsersSelector
                            value={field.value || []}
                            onChange={(selectedValue) => {
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
                          Select employees to notify about this credit request
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
          <Button variant="outline" onClick={handleGoBack} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              isLoading ||
              !selectedCreditType ||
              !fromDate ||
              !toDate ||
              !form.getValues("reason").trim()
            }
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Padding for fixed bottom bar */}
      <div className="h-20" />
    </div>
  );
}
