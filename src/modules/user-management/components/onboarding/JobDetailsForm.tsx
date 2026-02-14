/**
 * Job Details Form
 * Professional work information including designation, location, dates, etc.
 */

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { JobDetails } from "../../types/onboarding.types";
import { 
  EmployeeType as EmployeeTypeSettings, 
  Designation, 
  Department, 
  WorkLocation 
} from "../../types/settings.types";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Zod schema for JobDetails validation
export const jobDetailsSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  email: z.string().min(1, "Official email is required").email("Invalid email address"),
  phone: z.string().min(1, "Primary phone is required").regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  secondaryPhone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number").optional().or(z.literal("")),
  designationId: z.string().min(1, "Designation is required"),
  departmentId: z.string().optional(),
  employeeTypeId: z.string().min(1, "Employee type is required"),
  workLocationId: z.string().min(1, "Work location is required"),
  reportingTo: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  celebrationDOB: z.string().optional(),
  sameAsDOB: z.boolean().optional(),
  shift: z.string().min(1, "Shift is required"),
  probationPeriod: z.number().min(0, "Must be 0 or greater").max(12, "Cannot exceed 12 months"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

interface JobDetailsFormProps {
  form: UseFormReturn<JobDetails>;
  employeeId?: string;
}

// Mock data for managers and shifts (these don't come from settings)
const managers = [
  { value: "MGR001", label: "John Doe - Engineering Manager" },
  { value: "MGR002", label: "Jane Smith - Tech Lead" },
  { value: "MGR003", label: "Robert Johnson - Senior Manager" },
  { value: "MGR004", label: "Sarah Williams - VP Engineering" },
];

const shifts = [
  { value: "day-shift-9-6", label: "Day Shift (9 AM - 6 PM)" },
  { value: "day-shift-10-7", label: "Day Shift (10 AM - 7 PM)" },
  { value: "night-shift-9-6", label: "Night Shift (9 PM - 6 AM)" },
  { value: "flexible", label: "Flexible Hours" },
];

// Searchable Combobox Component
interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className={cn(!selectedLabel && "text-muted-foreground")}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function JobDetailsFormComponent({
  form,
  employeeId,
}: JobDetailsFormProps) {
  const { 
    getJobDetailsById, 
    refreshEmployeeTypes, 
    refreshDesignations,
    refreshDepartments,
    refreshWorkLocations 
  } = useUserManagement();
  const [isLoading, setIsLoading] = useState(false);
  const [reportingManagerType, setReportingManagerType] = useState<'dropdown' | 'email'>('dropdown');
  
  // Employee Types
  const [employeeTypesList, setEmployeeTypesList] = useState<EmployeeTypeSettings[]>([]);
  const [isLoadingEmployeeTypes, setIsLoadingEmployeeTypes] = useState(true);
  
  // Designations
  const [designationsList, setDesignationsList] = useState<Designation[]>([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(true);
  
  // Departments
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  
  // Work Locations
  const [workLocationsList, setWorkLocationsList] = useState<WorkLocation[]>([]);
  const [isLoadingWorkLocations, setIsLoadingWorkLocations] = useState(true);

  // All hooks must be called before any conditional returns
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = form;

  const sameAsDOB = watch("sameAsDOB");
  const dateOfBirth = watch("dateOfBirth");

  // Load employee types on component mount
  const loadEmployeeTypes = async () => {
    setIsLoadingEmployeeTypes(true);
    const result = await refreshEmployeeTypes({}, 0, 100);
    if (result?.content) {
      setEmployeeTypesList(result.content);
    }
    setIsLoadingEmployeeTypes(false);
  };

  // Load designations on component mount
  const loadDesignations = async () => {
    setIsLoadingDesignations(true);
    const result = await refreshDesignations({}, 0, 100);
    if (result?.content) {
      setDesignationsList(result.content);
    }
    setIsLoadingDesignations(false);
  };

  // Load departments on component mount
  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    const result = await refreshDepartments({}, 0, 100);
    if (result?.content) {
      setDepartmentsList(result.content);
    }
    setIsLoadingDepartments(false);
  };

  // Load work locations on component mount
  const loadWorkLocations = async () => {
    setIsLoadingWorkLocations(true);
    const result = await refreshWorkLocations({}, 0, 100);
    if (result?.content) {
      setWorkLocationsList(result.content);
    }
    setIsLoadingWorkLocations(false);
  };

  const fetchJobDetails = async () => {
    if (employeeId) {
      setIsLoading(true);
      const data = await getJobDetailsById(employeeId);
      if (data) {
        form.reset({
          id: data.id || employeeId,
          email: data.email,
          phone: data.phone || "",
          secondaryPhone: data.secondaryPhone || "",
          designationId: data.designationId || "",
          departmentId: data.departmentId || "",
          employeeTypeId: data.employeeTypeId || "",
          workLocationId: data.workLocationId || "",
          reportingTo: data.reportingTo || "",
          joiningDate: data.joiningDate || "",
          dateOfBirth: data.dateOfBirth || "",
          celebrationDOB: data.celebrationDOB || "",
          sameAsDOB: data.sameAsDOB || false,
          shift: data.shift || "",
          probationPeriod: data.probationPeriod || 3,
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || "",
        });
      }
      setIsLoading(false);
    }
  };

  // Load employee types and job details on component mount
  useEffect(() => {
    loadEmployeeTypes();
    loadDesignations();
    loadDepartments();
    loadWorkLocations();
    fetchJobDetails();
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  // Handle sameAsDOB checkbox
  const handleSameAsDOBChange = (checked: boolean) => {
    setValue("sameAsDOB", checked);
    if (checked && dateOfBirth) {
      setValue("celebrationDOB", dateOfBirth);
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee Identification */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">
              Employee ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employeeId"
              {...register("id", {
                required: "Employee ID is required",
              })}
              placeholder="EMP001"
              disabled
            />
            {errors.id && (
              <p className="text-sm text-destructive">
                {errors.id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Official Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Official email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="employee@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Designation <span className="text-destructive">*</span>
            </Label>
            <Combobox
              value={watch("designationId")}
              onChange={(value) => {
                setValue("designationId", value);
                trigger("designationId");
              }}
              options={designationsList.map(d => ({
                value: d.id,
                label: d.designation
              }))}
              placeholder="Select designation"
              searchPlaceholder="Search designation..."
              disabled={isLoadingDesignations}
            />
            {errors.designationId && (
              <p className="text-sm text-destructive">
                {errors.designationId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Department
            </Label>
            <Combobox
              value={watch("departmentId")}
              onChange={(value) => {
                setValue("departmentId", value);
                trigger("departmentId");
              }}
              options={departmentsList.map(d => ({
                value: d.id,
                label: d.department
              }))}
              placeholder="Select department"
              searchPlaceholder="Search department..."
              disabled={isLoadingDepartments}
            />
            {errors.departmentId && (
              <p className="text-sm text-destructive">
                {errors.departmentId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                Employee Type <span className="text-destructive">*</span>
              </Label>
              {isLoadingEmployeeTypes && (
                <span className="text-xs text-muted-foreground">Loading...</span>
              )}
              {!isLoadingEmployeeTypes && watch("employeeTypeId") && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent align="start">
                      <p className="max-w-xs">
                        {employeeTypesList.find((e) => e.id === watch("employeeTypeId"))?.description || "No description available"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Select
              value={watch("employeeTypeId")}
              onValueChange={(value) => {
                setValue("employeeTypeId", value);
                trigger("employeeTypeId");
              }}
              disabled={isLoadingEmployeeTypes}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee type" />
              </SelectTrigger>
              <SelectContent>
                {employeeTypesList.length > 0 ? (
                  employeeTypesList.map((empType) => (
                    <SelectItem key={empType.id} value={empType.id}>
                      {empType.employeeType}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-2">No employee types available</div>
                )}
              </SelectContent>
            </Select>
            {errors.employeeTypeId && (
              <p className="text-sm text-destructive">
                {errors.employeeTypeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Work Location <span className="text-destructive">*</span>
            </Label>
            <Combobox
              value={watch("workLocationId")}
              onChange={(value) => {
                setValue("workLocationId", value);
                trigger("workLocationId");
              }}
              options={workLocationsList.map(w => ({
                value: w.id,
                label: w.location
              }))}
              placeholder="Select location"
              searchPlaceholder="Search location..."
              disabled={isLoadingWorkLocations}
            />
            {errors.workLocationId && (
              <p className="text-sm text-destructive">
                {errors.workLocationId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reporting Manager</Label>
            
            {/* Selection Type Radio */}
            <RadioGroup
              value={reportingManagerType}
              onValueChange={(value: 'dropdown' | 'email') => {
                setReportingManagerType(value);
                setValue("reportingTo", "");
                trigger("reportingTo");
              }}
              className="flex items-center gap-4 mb-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dropdown" id="manager-dropdown" />
                <Label htmlFor="manager-dropdown" className="font-normal cursor-pointer">
                  Select from list
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="manager-email" />
                <Label htmlFor="manager-email" className="font-normal cursor-pointer">
                  Enter email
                </Label>
              </div>
            </RadioGroup>

            {/* Conditional Rendering based on type */}
            {reportingManagerType === 'dropdown' ? (
              <Combobox
                value={watch("reportingTo")}
                onChange={(value) => {
                  setValue("reportingTo", value);
                  trigger("reportingTo");
                }}
                options={managers}
                placeholder="Select manager"
                searchPlaceholder="Search manager..."
              />
            ) : (
              <Input
                type="email"
                placeholder="manager@company.com"
                value={watch("reportingTo") || ""}
                onChange={(e) => {
                  setValue("reportingTo", e.target.value);
                  trigger("reportingTo");
                }}
              />
            )}
            
            {errors.reportingTo && (
              <p className="text-sm text-destructive">
                {errors.reportingTo.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {reportingManagerType === 'dropdown' 
                ? 'Select manager from the list of onboarded employees'
                : 'Enter manager\'s email if they are not yet onboarded'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Shift <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("shift")}
              onValueChange={(value) => {
                setValue("shift", value);
                trigger("shift");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.shift && (
              <p className="text-sm text-destructive">{errors.shift.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="probationPeriod">
              Probation Period (months){" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="probationPeriod"
              type="number"
              {...register("probationPeriod", {
                required: "Probation period is required",
                valueAsNumber: true,
                min: { value: 0, message: "Must be 0 or greater" },
                max: { value: 12, message: "Cannot exceed 12 months" },
              })}
              placeholder="3"
            />
            {errors.probationPeriod && (
              <p className="text-sm text-destructive">
                {errors.probationPeriod.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Joining Date <span className="text-destructive">*</span>
            </Label>
            <DatePicker
              date={
                watch("joiningDate")
                  ? new Date(watch("joiningDate"))
                  : undefined
              }
              onSelect={(date) => {
                setValue("joiningDate", date?.toISOString() || "");
                trigger("joiningDate");
              }}
              placeholder="Select joining date"
            />
            {errors.joiningDate && (
              <p className="text-sm text-destructive">
                {errors.joiningDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <DatePicker
              date={
                watch("dateOfBirth")
                  ? new Date(watch("dateOfBirth"))
                  : undefined
              }
              onSelect={(date) => {
                const isoDate = date?.toISOString() || "";
                setValue("dateOfBirth", isoDate);
                trigger("dateOfBirth");
                if (sameAsDOB) {
                  setValue("celebrationDOB", isoDate);
                }
              }}
              placeholder="Select date of birth"
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Celebration Date of Birth</Label>
            <DatePicker
              date={
                watch("celebrationDOB")
                  ? new Date(watch("celebrationDOB"))
                  : undefined
              }
              onSelect={(date) =>
                setValue("celebrationDOB", date?.toISOString() || "")
              }
              placeholder="Select celebration date"
              disabled={sameAsDOB}
            />
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="sameAsDOB"
                checked={sameAsDOB}
                onCheckedChange={handleSameAsDOBChange}
              />
              <Label
                htmlFor="sameAsDOB"
                className="text-sm font-normal cursor-pointer"
              >
                Same as Date of Birth
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Primary Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              {...register("phone", {
                required: "Primary phone is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              })}
              placeholder="xxxxxxxxx"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryPhone">Secondary Phone</Label>
            <Input
              id="secondaryPhone"
              {...register("secondaryPhone", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              })}
              placeholder="9876543210"
            />
            {errors.secondaryPhone && (
              <p className="text-sm text-destructive">
                {errors.secondaryPhone.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
