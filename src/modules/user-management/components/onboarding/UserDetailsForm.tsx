import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyDropdown } from "@/components/context-aware/CompanyDropdown";
import { UserDetails, UserStatus } from "../../types/onboarding.types";
import { useUserManagement } from "@/contexts/UserManagementContext";

// Zod schema for UserDetails validation
export const userDetailsSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.nativeEnum(UserStatus, { required_error: "Status is required" }),
  companyId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

interface UserDetailsFormProps {
  form: UseFormReturn<UserDetails>;
  employeeId?: string;
  mode?: "create" | "edit";
}

export function UserDetailsFormComponent({
  form,
  employeeId,
  mode = "create",
}: UserDetailsFormProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = form;

  const { getUserDetailsById } = useUserManagement();
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserDetails = async () => {
    if (mode === "edit" && employeeId) {
      setIsLoading(true);
      const data = await getUserDetailsById(employeeId);
      if (data) {
        form.reset({
          id: data.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.status || UserStatus.ACTIVE,
          companyId: data.companyId || "",
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || "",
        });
      }
      setIsLoading(false);
    }
  };

  // Fetch user details in edit mode
  useEffect(() => {
    fetchUserDetails();
  }, [employeeId, mode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Loading user details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee ID */}
        <div className="space-y-2">
          <Label htmlFor="id">Employee ID *</Label>
          <Input
            id="id"
            placeholder="e.g., EMP001"
            disabled={mode === 'edit'}
            {...register("id", { required: "Employee ID is required" })}
          />
          {errors.id && (
            <p className="text-sm text-destructive">{errors.id.message}</p>
          )}
        </div>

        {/* Company Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <CompanyDropdown
            value={watch("companyId")}
            onChange={(companyId) => {
              setValue("companyId", companyId);
              trigger("companyId");
            }}
            placeholder="Search companies..."
            error={errors.companyId?.message}
            showRefresh={true}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) => {
              setValue("status", value as UserStatus);
              trigger("status");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="John"
            {...register("firstName", { required: "First name is required" })}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            {...register("lastName", { required: "Last name is required" })}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@company.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register("phone", { required: "Phone number is required" })}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
