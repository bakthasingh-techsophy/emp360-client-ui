/**
 * Job Details Form
 * Professional work information including designation, location, dates, etc.
 */

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { JobDetails, EmployeeType } from "../../types/onboarding.types";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Zod schema for JobDetails validation
export const jobDetailsSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  email: z.string().min(1, "Official email is required").email("Invalid email address"),
  phone: z.string().min(1, "Primary phone is required").regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  secondaryPhone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number").optional().or(z.literal("")),
  designation: z.string().min(1, "Designation is required"),
  employeeType: z.nativeEnum(EmployeeType, { required_error: "Employee type is required" }),
  workLocation: z.string().min(1, "Work location is required"),
  reportingManager: z.string().min(1, "Reporting manager is required"),
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

// Mock data for dropdowns
const designations = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "senior-software-engineer", label: "Senior Software Engineer" },
  { value: "tech-lead", label: "Tech Lead" },
  { value: "engineering-manager", label: "Engineering Manager" },
  { value: "product-manager", label: "Product Manager" },
  { value: "ui-ux-designer", label: "UI/UX Designer" },
  { value: "qa-engineer", label: "QA Engineer" },
  { value: "devops-engineer", label: "DevOps Engineer" },
];

const locations = [
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
  { value: "mumbai", label: "Mumbai" },
  { value: "delhi", label: "Delhi" },
  { value: "remote", label: "Remote" },
];

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
  const { getJobDetailsById } = useUserManagement();
  const [isLoading, setIsLoading] = useState(false);

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
          designation: data.designation || "",
          employeeType: data.employeeType || EmployeeType.FULL_TIME,
          workLocation: data.workLocation || "",
          reportingManager: data.reportingManager || "",
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

  // Fetch job details when employeeId is available
  useEffect(() => {
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
              value={watch("designation")}
              onChange={(value) => {
                setValue("designation", value);
                trigger("designation");
              }}
              options={designations}
              placeholder="Select designation"
              searchPlaceholder="Search designation..."
            />
            {errors.designation && (
              <p className="text-sm text-destructive">
                {errors.designation.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Employee Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("employeeType")}
              onValueChange={(value) => {
                setValue("employeeType", value as EmployeeType);
                trigger("employeeType");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EmployeeType.FULL_TIME}>Full Time (Permanent)</SelectItem>
                <SelectItem value={EmployeeType.CONTRACT}>Contract</SelectItem>
                <SelectItem value={EmployeeType.TEMPORARY}>Part Time (Temporary)</SelectItem>
                <SelectItem value={EmployeeType.INTERN}>Intern</SelectItem>
              </SelectContent>
            </Select>
            {errors.employeeType && (
              <p className="text-sm text-destructive">
                {errors.employeeType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Work Location <span className="text-destructive">*</span>
            </Label>
            <Combobox
              value={watch("workLocation")}
              onChange={(value) => {
                setValue("workLocation", value);
                trigger("workLocation");
              }}
              options={locations}
              placeholder="Select location"
              searchPlaceholder="Search location..."
            />
            {errors.workLocation && (
              <p className="text-sm text-destructive">
                {errors.workLocation.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Reporting Manager <span className="text-destructive">*</span>
            </Label>
            <Combobox
              value={watch("reportingManager")}
              onChange={(value) => {
                setValue("reportingManager", value);
                trigger("reportingManager");
              }}
              options={managers}
              placeholder="Select manager"
              searchPlaceholder="Search manager..."
            />
            {errors.reportingManager && (
              <p className="text-sm text-destructive">
                {errors.reportingManager.message}
              </p>
            )}
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
