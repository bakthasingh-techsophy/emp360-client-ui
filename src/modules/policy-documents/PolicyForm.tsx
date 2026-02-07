/**
 * Policy Form Page - Create/Edit Policy
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { FormActionBar } from "@/components/common/FormActionBar/FormActionBar";
import { format } from "date-fns";
import {
  CalendarIcon,
  Upload,
  Link as LinkIcon,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Policy, PolicyFormData, PolicyCarrier, PolicyVersionCarrier } from "./types";
import { POLICY_CATEGORY_LABELS } from "./constants";
import { useCompany } from "@/contexts/CompanyContext";
import { usePolicy } from "@/contexts/PolicyContext";

const policyFormSchema = z.object({
  name: z.string().min(3, "Policy name must be at least 3 characters"),
  companyId: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(["hr", "it", "security", "compliance", "general", "safety"]),
  status: z.enum(["draft", "published", "archived"]),
  sourceType: z.enum(["upload", "url"]),
  documentId: z.string().optional(),
  documentUrl: z.string().optional(),
  fileType: z.enum(["pdf", "docx"]).optional(),
  effectiveDate: z.date({
    required_error: "Effective date is required",
  }),
  expiryDate: z.date().optional(),
  mandatory: z.boolean().default(false),
});

export function PolicyForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") as "create" | "edit") || "create";
  const policyId = searchParams.get("id");

  const { companies, loading: isLoadingCompanies } = useCompany();
  const { createPolicy, updatePolicy, getPolicyById, createPolicyVersion } = usePolicy();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [sourceType, setSourceType] = useState<"upload" | "url">("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(false);

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: "",
      companyId: "",
      description: "",
      category: "general",
      status: "draft",
      sourceType: "upload",
      effectiveDate: new Date(),
      mandatory: false,
    },
  });

  useEffect(() => {
    const loadPolicy = async () => {
      if (mode === "edit" && policyId) {
        setLoadingPolicy(true);
        const foundPolicy = await getPolicyById(policyId);
        if (foundPolicy) {
          setPolicy(foundPolicy);
          form.reset({
            name: foundPolicy.name,
            companyId: foundPolicy.companyId || "",
            description: foundPolicy.description || "",
            category: foundPolicy.category,
            status: foundPolicy.status,
            sourceType: "upload", // Default for edit mode
            effectiveDate: new Date(foundPolicy.effectiveDate),
            expiryDate: foundPolicy.expiryDate
              ? new Date(foundPolicy.expiryDate)
              : undefined,
            mandatory: foundPolicy.mandatory || false,
          });
        }
        setLoadingPolicy(false);
      }
    };
    loadPolicy();
  }, [mode, policyId, getPolicyById, form]);

  const handleSubmit = async (data: PolicyFormData) => {
    setIsSubmitting(true);
    
    try {
      if (mode === "create") {
        // Create policy carrier
        const policyCarrier: PolicyCarrier = {
          name: data.name,
          companyId: data.companyId || "",
          description: data.description,
          category: data.category,
          status: data.status,
          currentVersion: "1.0",
          versionsIds: [],
          effectiveDate: data.effectiveDate.toISOString(),
          expiryDate: data.expiryDate?.toISOString(),
          mandatory: data.mandatory,
          createdAt: new Date().toISOString(),
        };

        const newPolicy = await createPolicy(policyCarrier);
        
        if (newPolicy && (data.documentId || data.documentUrl)) {
          // Create initial policy version
          const versionCarrier: PolicyVersionCarrier = {
            policyId: newPolicy.id,
            versionNumber: "1.0",
            documentId: data.documentId,
            documentUrl: data.documentUrl,
            sourceType: data.sourceType,
            fileType: data.fileType,
            changeNotes: "Initial version",
            createdAt: new Date().toISOString(),
          };
          
          await createPolicyVersion(versionCarrier);
        }
        
        if (newPolicy) {
          navigate("/policy-library");
        }
      } else {
        // Update policy
        const updates = {
          name: data.name,
          companyId: data.companyId,
          description: data.description,
          category: data.category,
          status: data.status,
          effectiveDate: data.effectiveDate.toISOString(),
          expiryDate: data.expiryDate?.toISOString(),
          mandatory: data.mandatory,
        };

        const updated = await updatePolicy(policyId!, updates);
        if (updated) {
          navigate("/policy-library");
        }
      }
    } catch (error) {
      console.error("Error submitting policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/policy-library");
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      {loadingPolicy ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading policy...</p>
          </div>
        </div>
      ) : (
        <>
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
            {mode === "edit" ? "Edit Policy" : "Upload Policy"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === "edit"
              ? `Update: ${policy?.name || ""}`
              : "Create a new policy document"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pb-24"
        >
          {/* Unified Policy Form */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-6">Policy Details</h3>

            {/* Policy Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Policy Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Code of Conduct" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mandatory Checkbox */}
            <FormField
              control={form.control}
              name="mandatory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mandatory Policy</FormLabel>
                    <FormDescription>
                      Mark this policy as mandatory for all employees
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the policy..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(POLICY_CATEGORY_LABELS).map(
                          ([key, label]: [string, any]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company */}
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingCompanies}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingCompanies
                                ? "Loading companies..."
                                : "Select company (optional)"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies
                          .filter((c) => c)
                          .map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value === "published" && (
                      <FormDescription className="text-xs">
                        ✉️ Notifications will be sent to users
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Effective Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date <
                            (form.getValues("effectiveDate") || new Date())
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

            {/* Document Source */}
            <div className="mb-4">
              <FormLabel className="mb-2 block">Document Source *</FormLabel>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={sourceType === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSourceType("upload");
                    form.setValue("sourceType", "upload");
                  }}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={sourceType === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSourceType("url");
                    form.setValue("sourceType", "url");
                  }}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  External URL
                </Button>
              </div>

              {sourceType === "upload" ? (
                <FormField
                  control={form.control}
                  name="documentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                            <Input
                              type="file"
                              accept=".pdf,.docx"
                              className="hidden"
                              id="file-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(`DOC-${Date.now()}`);
                                  form.setValue("documentUrl", file.name);
                                  form.setValue(
                                    "fileType",
                                    file.name.endsWith(".pdf") ? "pdf" : "docx",
                                  );
                                }
                              }}
                            />
                            <p className="font-medium mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF or DOCX (MAX. 10MB)
                            </p>
                            {form.watch("documentUrl") && (
                              <div className="mt-4 p-3 bg-muted rounded-md">
                                <p className="font-medium text-primary">
                                  {form.watch("documentUrl")}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Document ID: {field.value}
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="documentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/policy.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the URL to an external policy document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </Card>

          {/* Form Action Bar */}
          <FormActionBar
            mode={mode}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitText={mode === "edit" ? "Update Policy" : "Create Policy"}
          />
        </form>
      </Form>
        </>
      )}
    </div>
  );
}
