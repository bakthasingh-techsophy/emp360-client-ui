/**
 * Leave Configuration Form Page - Create/Edit Leave Type
 * Simplified form matching actual backend model
 */

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormActionBar } from "@/components/common/FormActionBar/FormActionBar";
import { MultiDatePicker } from "@/components/common/MultiDatePicker";
import { ArrowLeft, Check } from "lucide-react";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import {
  LeaveConfiguration,
  LeaveConfigurationCarrier,
} from "./types/leaveConfiguration.types";

// Simple form schema focusing on core required fields
const leaveConfigurationFormSchema = z.object({
  // Basic Information
  name: z.string().min(2, "Leave type name must be at least 2 characters"),
  code: z.string().min(2, "Leave code is required").max(10),
  tagline: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['flexible', 'accrued', 'special', 'monetization']),

  // Leave Properties
  allowedTypes: z.array(z.enum(['fullDay', 'partialDay', 'partialTimings'])).min(1),

// Credit Policy
  allowCreditPolicy: z.boolean().default(true),
  creditValue: z.number().min(0).default(0),
  creditFrequency: z.enum(['monthly', 'yearly', 'quarterly', 'custom']).default('yearly'),
  creditMaxLimit: z.number().min(0).default(0),
  creditCustomDates: z.array(z.string()).default([]),

  // Monetization
  allowMonetization: z.boolean().default(false),
  encashableCount: z.number().min(0).default(0),
  encashableLimit: z.number().min(0).default(0),

  // Expiration
  allowExpirePolicy: z.boolean().default(false),
  carryForward: z.boolean().default(true),
  expireFrequency: z.enum(['monthly', 'afterCredit', 'yearly', 'custom']).default('yearly'),
  afterCreditExpiryDays: z.number().min(0).default(0),
  expireCustomDates: z.array(z.string()).default([]),

  // Calendar
  monthType: z.enum(['standard', 'custom']).default('standard'),
  startDay: z.number().min(1).max(31).default(1),
  yearType: z.enum(['standard', 'custom']).default('standard'),
  startMonth: z.number().min(1).max(12).default(1),

  // Restrictions
  allowRestrictions: z.boolean().default(true),
  approvalRequired: z.boolean().default(true),
  maxConsecutiveDays: z.number().min(0).default(0),
  minGapBetweenLeaves: z.number().min(0).default(0),
  maxRequestsPerYear: z.number().min(0).default(0),
  includeHolidaysWeekends: z.boolean().default(false),
  probationAllowed: z.boolean().default(false),

  // Applicability
  isForAllEmployeeTypes: z.boolean().default(true),
  gender: z.enum(['male', 'female', 'other', 'all']).default('all'),
  marriedStatus: z.enum(['married', 'single', 'all']).default('all'),
  employeeTypes: z.array(z.enum(['fullTime', 'partTime', 'intern', 'contract', 'all'])).default(['all']),
});

type LeaveConfigFormData = z.infer<typeof leaveConfigurationFormSchema>;

export function LeaveConfigurationFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") as "create" | "edit") || "create";
  const configId = searchParams.get("id");

  const {
    createLeaveConfiguration,
    updateLeaveConfiguration,
    getLeaveConfigurationById,
  } = useLeaveManagement();

  const [leaveConfig, setLeaveConfig] = useState<LeaveConfiguration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const form = useForm<LeaveConfigFormData>({
    resolver: zodResolver(leaveConfigurationFormSchema),
    defaultValues: {
      name: "",
      code: "",
      tagline: "",
      description: "",
      category: "accrued",
      allowedTypes: ["fullDay"],
      allowCreditPolicy: true,
      creditValue: 0,
      creditFrequency: "yearly",
      creditMaxLimit: 0,
      creditCustomDates: [],
      allowMonetization: false,
      encashableCount: 0,
      encashableLimit: 0,
      allowExpirePolicy: false,
      carryForward: true,
      expireFrequency: "yearly",
      afterCreditExpiryDays: 0,
      expireCustomDates: [],
      monthType: "standard",
      startDay: 1,
      yearType: "standard",
      startMonth: 1,
      allowRestrictions: true,
      approvalRequired: true,
      maxConsecutiveDays: 0,
      minGapBetweenLeaves: 0,
      maxRequestsPerYear: 0,
      includeHolidaysWeekends: false,
      probationAllowed: false,
      isForAllEmployeeTypes: true,
      gender: "all",
      marriedStatus: "all",
      employeeTypes: ["all"],
    },
  });

  // Load existing configuration for edit mode
  useEffect(() => {
    const loadConfiguration = async () => {
      if (mode === "edit" && configId) {
        setLoadingConfig(true);
        const config = await getLeaveConfigurationById(configId);
        if (config) {
          setLeaveConfig(config);
          form.reset({
            name: config.name,
            code: config.code,
            tagline: config.tagline || "",
            description: config.description || "",
            category: config.category as any,
            allowedTypes: config.leaveProperties.allowedTypes as any,
            allowCreditPolicy: config.allowCreditPolicy,
            creditValue: config.creditPolicy?.value || 0,
            creditFrequency: (config.creditPolicy?.frequency as any) || "yearly",
            creditMaxLimit: config.creditPolicy?.maxLimit || 0,
            creditCustomDates: config.creditPolicy?.customDates || [],
            allowMonetization: config.allowMonetization,
            encashableCount: config.monetizationPolicy?.encashableCount || 0,
            encashableLimit: config.monetizationPolicy?.encashableLimit || 0,
            allowExpirePolicy: config.allowExpirePolicy,
            carryForward: config.expirePolicy?.carryForward || true,
            expireFrequency: (config.expirePolicy?.expireFrequency as any) || "yearly",
            afterCreditExpiryDays: config.expirePolicy?.afterCreditExpiryDays || 0,
            expireCustomDates: config.expirePolicy?.customDates || [],
            monthType: config.calendarConfiguration.monthType as any,
            startDay: config.calendarConfiguration.startDay,
            yearType: config.calendarConfiguration.yearType as any,
            startMonth: config.calendarConfiguration.startMonth,
            allowRestrictions: config.allowRestrictions,
            approvalRequired: config.restrictions?.approvalRequired || true,
            maxConsecutiveDays: config.restrictions?.maxConsecutiveDays || 0,
            minGapBetweenLeaves: config.restrictions?.minGapBetweenLeaves || 0,
            maxRequestsPerYear: config.restrictions?.maxRequestsPerYear || 0,
            includeHolidaysWeekends: config.restrictions?.includeHolidaysWeekends || false,
            probationAllowed: config.restrictions?.probationRestrictions.allowed || false,
            isForAllEmployeeTypes: config.applicableCategories.isForAllEmployeeTypes,
            gender: config.applicableCategories.gender as any,
            marriedStatus: config.applicableCategories.marriedStatus as any,
            employeeTypes: config.applicableCategories.employeeTypes as any,
          });
        }
        setLoadingConfig(false);
      }
    };
    loadConfiguration();
  }, [mode, configId]);

  // Auto-enable/disable policies based on category
  useEffect(() => {
    const category = form.watch("category");
    
    // For accrued: enable expiry and credit policies, remove partialTimings
    if (category === "accrued") {
      form.setValue("allowExpirePolicy", true);
      form.setValue("allowCreditPolicy", true);
      // Remove partialTimings if present
      const allowedTypes = form.getValues("allowedTypes");
      if (allowedTypes.includes("partialTimings")) {
        form.setValue("allowedTypes", allowedTypes.filter(t => t !== "partialTimings"));
      }
    }
    
    // For flexible: disable expiry and credit policies
    if (category === "flexible") {
      form.setValue("allowExpirePolicy", false);
      form.setValue("allowCreditPolicy", false);
    }
    
    // For special: disable credit policy, remove partialTimings
    if (category === "special") {
      form.setValue("allowCreditPolicy", false);
      // Remove partialTimings if present
      const allowedTypes = form.getValues("allowedTypes");
      if (allowedTypes.includes("partialTimings")) {
        form.setValue("allowedTypes", allowedTypes.filter(t => t !== "partialTimings"));
      }
    }

    // For monetization: enable expiry and credit policies (like accrued), remove partialTimings
    if (category === "monetization") {
      form.setValue("allowExpirePolicy", true);
      form.setValue("allowCreditPolicy", true);
      form.setValue("allowMonetization", true);
      // Remove partialTimings if present
      const allowedTypes = form.getValues("allowedTypes");
      if (allowedTypes.includes("partialTimings")) {
        form.setValue("allowedTypes", allowedTypes.filter(t => t !== "partialTimings"));
      }
    }
  }, [form.watch("category")]);

  const handleSubmit = async (data: LeaveConfigFormData) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const carrier: LeaveConfigurationCarrier = {
          name: data.name,
          code: data.code,
          tagline: data.tagline || "",
          description: data.description || "",
          category: data.category,
          startDate: new Date().toISOString().split('T')[0], // Auto-set to current date
          leaveProperties: {
            allowedTypes: data.allowedTypes,
            numberOfDaysPerOneLeave: 1, // Default value
          },
          allowCreditPolicy: data.allowCreditPolicy,
          creditPolicy: data.allowCreditPolicy ? {
            onDemandCredit: data.category === 'special', // Auto-set based on category
            value: data.creditValue,
            frequency: data.creditFrequency,
            customDates: data.creditCustomDates || [],
            maxLimit: data.creditMaxLimit,
          } : null,
          allowMonetization: data.allowMonetization,
          monetizationPolicy: data.allowMonetization ? {
            encashableCount: data.encashableCount,
            encashableLimit: data.encashableLimit,
          } : null,
          allowExpirePolicy: data.allowExpirePolicy,
          expirePolicy: data.allowExpirePolicy ? {
            carryForward: data.carryForward,
            expireFrequency: data.expireFrequency,
            afterCreditExpiryDays: data.afterCreditExpiryDays,
            customDates: data.expireCustomDates || [],
          } : null,
          calendarConfiguration: {
            monthType: data.monthType,
            startDay: data.startDay,
            yearType: data.yearType,
            startMonth: data.startMonth,
          },
          allowRestrictions: data.allowRestrictions,
          restrictions: data.allowRestrictions ? {
            approvalRequired: data.approvalRequired,
            maxConsecutiveDays: data.maxConsecutiveDays,
            minGapBetweenLeaves: data.minGapBetweenLeaves,
            maxRequestsPerYear: data.maxRequestsPerYear,
            includeHolidaysWeekends: data.includeHolidaysWeekends,
            probationRestrictions: {
              allowed: data.probationAllowed,
            },
          } : null,
          applicableCategories: {
            isForAllEmployeeTypes: data.isForAllEmployeeTypes,
            gender: data.gender,
            marriedStatus: data.marriedStatus,
            employeeTypes: data.employeeTypes,
          },
          employeeIds: [],
        };

        const newConfig = await createLeaveConfiguration(carrier);
        if (newConfig) {
          navigate("/leave-settings");
        }
      } else {
        // For update, use the update carrier with all fields
        const updates = {
          name: data.name,
          code: data.code,
          tagline: data.tagline,
          description: data.description,
          category: data.category,
          startDate: new Date().toISOString().split('T')[0], // Auto-set to current date
          leaveProperties: {
            allowedTypes: data.allowedTypes,
            numberOfDaysPerOneLeave: 1, // Default value
          },
          allowCreditPolicy: data.allowCreditPolicy,
          creditPolicy: data.allowCreditPolicy ? {
            onDemandCredit: data.category === 'special', // Auto-set based on category
            value: data.creditValue,
            frequency: data.creditFrequency,
            customDates: data.creditCustomDates || [],
            maxLimit: data.creditMaxLimit,
          } : null,
          allowMonetization: data.allowMonetization,
          monetizationPolicy: data.allowMonetization ? {
            encashableCount: data.encashableCount,
            encashableLimit: data.encashableLimit,
          } : null,
          allowExpirePolicy: data.allowExpirePolicy,
          expirePolicy: data.allowExpirePolicy ? {
            carryForward: data.carryForward,
            expireFrequency: data.expireFrequency,
            afterCreditExpiryDays: data.afterCreditExpiryDays,
            customDates: data.expireCustomDates || [],
          } : null,
          calendarConfiguration: {
            monthType: data.monthType,
            startDay: data.startDay,
            yearType: data.yearType,
            startMonth: data.startMonth,
          },
          allowRestrictions: data.allowRestrictions,
          restrictions: data.allowRestrictions ? {
            approvalRequired: data.approvalRequired,
            maxConsecutiveDays: data.maxConsecutiveDays,
            minGapBetweenLeaves: data.minGapBetweenLeaves,
            maxRequestsPerYear: data.maxRequestsPerYear,
            includeHolidaysWeekends: data.includeHolidaysWeekends,
            probationRestrictions: {
              allowed: data.probationAllowed,
            },
          } : null,
          applicableCategories: {
            isForAllEmployeeTypes: data.isForAllEmployeeTypes,
            gender: data.gender,
            marriedStatus: data.marriedStatus,
            employeeTypes: data.employeeTypes,
          },
        };

        const updated = await updateLeaveConfiguration(configId!, updates);
        if (updated) {
          navigate("/leave-settings");
        }
      }
    } catch (error) {
      console.error("Error submitting leave configuration:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/leave-settings");
  };

  if (loadingConfig) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading leave configuration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            {mode === "edit" ? "Edit Leave Type" : "Add Leave Type"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === "edit"
              ? `Update: ${leaveConfig?.name || ""}`
              : "Configure a new leave type and its policies"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 pb-24"
        >
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Annual Leave" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., AL"
                          maxLength={10}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Short tagline..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="accrued">Accrued</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                        <SelectItem value="monetization">Monetization</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Calendar Configuration */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4">Calendar Configuration</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-set startMonth to 1 if standard
                          if (value === "standard") {
                            form.setValue("startMonth", 1);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard (Calendar)</SelectItem>
                          <SelectItem value="custom">Custom (Fiscal)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Standard starts in January, Custom allows custom start month
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Month</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={form.watch("yearType") === "standard"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {form.watch("yearType") === "standard" ? "Locked to January for standard year" : "Select fiscal year start month"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-set startDay to 1 if standard
                          if (value === "standard") {
                            form.setValue("startDay", 1);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Standard starts on day 1, Custom allows custom start day
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Day</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={form.watch("monthType") === "standard"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 26 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {form.watch("monthType") === "standard" ? "Locked to day 1 for standard month" : "Select custom start day (1-26)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Leave Properties */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4">Leave Properties</h3>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="allowedTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Allowed Leave Types *</FormLabel>
                    <div className="flex gap-4 p-3 border rounded-md">
                      {(['fullDay', 'partialDay', 'partialTimings'] as const)
                        .filter(type => type !== 'partialTimings' || form.watch('category') === 'flexible')
                        .map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="allowedTypes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, type]);
                                    } else {
                                      field.onChange(
                                        current.filter((val) => val !== type)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {type.replace(/([A-Z])/g, ' $1').trim()}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Expiration Policy - Hidden for flexible category */}
          {(form.watch("category") !== "flexible") && (
          <Card className="p-6">
            <Accordion 
              type="single" 
              collapsible={form.watch("category") !== "accrued" && form.watch("category") !== "monetization"}
              value={form.watch("allowExpirePolicy") || form.watch("category") === "accrued" || form.watch("category") === "monetization" ? "expiry" : ""}
              onValueChange={(value) => {
                if (form.watch("category") !== "accrued" && form.watch("category") !== "monetization") {
                  form.setValue("allowExpirePolicy", value === "expiry");
                }
              }}
            >
              <AccordionItem value="expiry" className="border-none">
                <AccordionTrigger className="hover:no-underline py-0 mb-4" disabled={form.watch("category") === "accrued" || form.watch("category") === "monetization"}>
                  <div className="flex items-center justify-between w-full pr-2">
                    <h3 className="text-base font-semibold">Expiration Policy</h3>
                    {(form.watch("category") !== "accrued" && form.watch("category") !== "monetization") && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Enable</span>
                        <div className="h-4 w-4 border border-input rounded flex items-center justify-center bg-background cursor-pointer">
                          {form.watch("allowExpirePolicy") && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    )}
                    {(form.watch("category") === "accrued" || form.watch("category") === "monetization") && (
                      <span className="text-xs text-muted-foreground">Always enabled for {form.watch("category")} leaves</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="carryForward"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Allow Carry Forward</FormLabel>
                            <FormDescription>
                              Leaves won't expire if enabled
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {!form.watch("carryForward") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expireFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expire Frequency</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  {form.watch("category") === "special" && (
                                    <SelectItem value="afterCredit">After Credit</SelectItem>
                                  )}
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("expireFrequency") === "afterCredit" && (
                          <FormField
                            control={form.control}
                            name="afterCreditExpiryDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Days After Credit</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value) || 0)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {form.watch("expireFrequency") === "custom" && (
                          <FormField
                            control={form.control}
                            name="expireCustomDates"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Expiry Dates</FormLabel>
                                <FormControl>
                                  <MultiDatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select expiry dates"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
          )}

          {/* Credit Policy - Hidden for flexible and special categories */}
          {(form.watch("category") !== "flexible" && form.watch("category") !== "special") && (
          <Card className="p-6">
            <Accordion 
              type="single" 
              collapsible={form.watch("category") !== "accrued" && form.watch("category") !== "monetization"}
              value={form.watch("allowCreditPolicy") || form.watch("category") === "accrued" || form.watch("category") === "monetization" ? "credit" : ""}
              onValueChange={(value) => {
                if (form.watch("category") !== "accrued" && form.watch("category") !== "monetization") {
                  form.setValue("allowCreditPolicy", value === "credit");
                }
              }}
            >
              <AccordionItem value="credit" className="border-none">
                <AccordionTrigger className="hover:no-underline py-0 mb-4" disabled={form.watch("category") === "accrued" || form.watch("category") === "monetization"}>
                  <div className="flex items-center justify-between w-full pr-2">
                    <h3 className="text-base font-semibold">Credit Policy</h3>
                    {(form.watch("category") !== "accrued" && form.watch("category") !== "monetization") && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Enable</span>
                        <div className="h-4 w-4 border border-input rounded flex items-center justify-center bg-background cursor-pointer">
                          {form.watch("allowCreditPolicy") && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    )}
                    {(form.watch("category") === "accrued" || form.watch("category") === "monetization") && (
                      <span className="text-xs text-muted-foreground">Always enabled for {form.watch("category")} leaves</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="creditValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credit Value (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="creditFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("creditFrequency") === "custom" && (
                      <FormField
                        control={form.control}
                        name="creditCustomDates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Credit Dates</FormLabel>
                            <FormControl>
                              <MultiDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select credit dates"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="creditMaxLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Credit Limit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            0 for unlimited
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
          )}

          {/* Monetization Policy - Only show for 'monetization' category */}
          {form.watch("category") === "monetization" && (
            <Card className="p-6">
              <Accordion 
                type="single" 
                collapsible={false}
                value="monetization"
              >
                <AccordionItem value="monetization" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-0 mb-4" disabled>
                    <div className="flex items-center justify-between w-full pr-2">
                      <h3 className="text-base font-semibold">Monetization Policy</h3>
                      <span className="text-xs text-muted-foreground">Always enabled for monetization leaves</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <FormField
                        control={form.control}
                        name="encashableCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Encashable Count</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="encashableLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Encashable Limit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          )}

          {/* Restrictions */}
          <Card className="p-6">
            <Accordion 
              type="single" 
              collapsible
              value={form.watch("allowRestrictions") ? "restrictions" : ""}
              onValueChange={(value) => {
                form.setValue("allowRestrictions", value === "restrictions");
              }}
            >
              <AccordionItem value="restrictions" className="border-none">
                <AccordionTrigger className="hover:no-underline py-0 mb-4">
                  <div className="flex items-center justify-between w-full pr-2">
                    <h3 className="text-base font-semibold">Restrictions</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Enable</span>
                      <div className="h-4 w-4 border border-input rounded flex items-center justify-center bg-background cursor-pointer">
                        {form.watch("allowRestrictions") && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="approvalRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Approval Required</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxConsecutiveDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Consecutive Days</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minGapBetweenLeaves"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Gap Between Leaves</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="maxRequestsPerYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Requests Per Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includeHolidaysWeekends"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Include Holidays & Weekends</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="probationAllowed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Allowed During Probation</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Applicability */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4">Applicability</h3>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isForAllEmployeeTypes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>For All Employee Types</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marriedStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marriage Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="single">Single</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Form Action Bar */}
          <FormActionBar
            mode={mode}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitText={
              mode === "edit" ? "Update Leave Type" : "Create Leave Type"
            }
          />
        </form>
      </Form>
    </div>
  );
}
