/**
 * Company Form Page
 * Dual-purpose page for creating new companies and editing existing ones
 * 
 * Modes:
 * - mode=create: Create new company
 * - mode=edit&id=xxx: Edit existing company
 */

import { FormActionBar } from "@/components/common/FormActionBar";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CompanyModel, CompanyCarrier } from "@/types/company";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

// Zod schema matching CompanyCarrier validation rules
const companyFormSchema = z.object({
  name: z.string()
    .min(1, "Company name is required")
    .max(255, "Company name must not exceed 255 characters"),
  description: z.string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  code: z.string()
    .max(50, "Company code must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("Invalid email format")
    .max(100, "Email must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .max(20, "Phone must not exceed 20 characters")
    .optional()
    .or(z.literal("")),
  website: z.string()
    .max(255, "Website must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  industry: z.string()
    .max(100, "Industry must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  registrationNumber: z.string()
    .max(50, "Registration number must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .max(500, "Address must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  city: z.string()
    .max(100, "City must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  state: z.string()
    .max(100, "State must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  country: z.string()
    .max(100, "Country must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  zipCode: z.string()
    .max(20, "Zip code must not exceed 20 characters")
    .optional()
    .or(z.literal("")),
  logoUrl: z.string()
    .max(500, "Logo URL must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function CompanyForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { createCompany, updateCompany, fetchCompanyById, loading } = useCompany();

  // Determine mode and company ID from URL params
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const companyId = searchParams.get("id");

  // Form instance
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      registrationNumber: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      logoUrl: "",
      isActive: true,
    },
  });

  // Fetch company data if in edit mode
  useEffect(() => {
    const loadCompanyData = async () => {
      if (mode === "edit" && companyId) {
        try {
          const company = await fetchCompanyById(companyId);
          if (company) {
            form.reset({
              name: company.name || "",
              description: company.description || "",
              code: company.code || "",
              email: company.email || "",
              phone: company.phone || "",
              website: company.website || "",
              industry: company.industry || "",
              registrationNumber: company.registrationNumber || "",
              address: company.address || "",
              city: company.city || "",
              state: company.state || "",
              country: company.country || "",
              zipCode: company.zipCode || "",
              logoUrl: company.logoUrl || "",
              isActive: company.isActive ?? true,
            });
          }
        } catch (error) {
          console.error("Error loading company data:", error);
          toast({
            title: "Error",
            description: "Failed to load company data",
            variant: "destructive",
          });
        }
      }
    };

    loadCompanyData();
  }, [mode, companyId, fetchCompanyById, form, toast]);

  // Handle form submission
  const handleSubmit = async (values: CompanyFormValues) => {
    try {
      if (mode === "create") {
        // Create new company
        const carrier: CompanyCarrier = {
          ...values,
          createdAt: new Date().toISOString(),
        };

        await createCompany(carrier);

        toast({
          title: "Company Created",
          description: "The company has been successfully created.",
        });

        // Navigate back to company management
        navigate("/company-management");
      } else if (mode === "edit" && companyId) {
        // Update existing company
        const updates: Partial<CompanyModel> = {
          ...values,
          updatedAt: new Date().toISOString(),
        };

        await updateCompany(companyId, updates);

        toast({
          title: "Company Updated",
          description: "The company has been successfully updated.",
        });

        // Navigate back to company management
        navigate("/company-management");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: mode === "create" ? "Failed to create company" : "Failed to update company",
        variant: "destructive",
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/company-management");
  };

  return (
    <PageLayout
      toolbar={
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/company-management")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {mode === "create" ? "Create Company" : "Edit Company"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {mode === "create"
                    ? "Add a new company to your organization"
                    : `Update company information${companyId ? ` • ID: ${companyId}` : ""}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    <p className="text-sm text-muted-foreground">
                      Essential company details and identification
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Acme Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Company Code */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ACME" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the company..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Industry */}
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Technology, Manufacturing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Registration Number */}
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Company registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Contact Information</h2>
                    <p className="text-sm text-muted-foreground">
                      Company contact details and web presence
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Website */}
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Information Section */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Address Information</h2>
                    <p className="text-sm text-muted-foreground">
                      Physical location and mailing address
                    </p>
                  </div>

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Street address, building number..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* City */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., San Francisco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., California" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Zip Code */}
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip/Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 94102" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Settings Section */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Additional Settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Company logo and status configuration
                    </p>
                  </div>

                  {/* Logo URL */}
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to the company logo image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Active Status */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this company in the system
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <FormActionBar
        onCancel={handleCancel}
        customActions={[
          {
            id: "cancel",
            label: "Cancel",
            onClick: handleCancel,
            variant: "outline",
            type: "button",
          },
          {
            id: "submit",
            label: mode === "create" ? "Create Company" : "Save Changes",
            onClick: form.handleSubmit(handleSubmit),
            variant: "default",
            disabled: loading,
            loading: loading,
            type: "button",
          },
        ]}
        customActionsPosition="split"
      />
    </PageLayout>
  );
}
