/**
 * Holiday Form Page - Create/Edit Holiday
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
import { FormActionBar } from "@/components/common/FormActionBar";
import { ArrowLeft } from "lucide-react";
import { useHoliday } from "@/contexts/HolidayContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Holiday, HolidayCarrier } from "./types";

const holidayFormSchema = z.object({
  name: z.string().min(2, "Holiday name must be at least 2 characters"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  companyIds: z.array(z.string()).optional(),
});

type HolidayFormDataType = z.infer<typeof holidayFormSchema>;

export function HolidayForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") as "create" | "edit") || "create";
  const holidayId = searchParams.get("id");

  const { companies } = useCompany();
  const { createHoliday, updateHoliday, getHolidayById } = useHoliday();
  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingHoliday, setLoadingHoliday] = useState(false);

  const form = useForm<HolidayFormDataType>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      companyIds: [],
    },
  });

  const loadHoliday = async () => {
    if (mode === "edit" && holidayId) {
      setLoadingHoliday(true);
      const foundHoliday = await getHolidayById(holidayId);
      if (foundHoliday) {
        setHoliday(foundHoliday);
        form.reset({
          name: foundHoliday.name,
          description: foundHoliday.description || "",
          imageUrl: foundHoliday.imageUrl || "",
          companyIds: foundHoliday.companyIds || [],
        });
      }
      setLoadingHoliday(false);
    }
  };
  useEffect(() => {
    loadHoliday();
  }, [mode, holidayId, form]);

  const handleSubmit = async (data: HolidayFormDataType) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create holiday carrier
        const holidayCarrier: HolidayCarrier = {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          companyIds: data.companyIds || [],
          createdAt: new Date().toISOString(),
        };

        const newHoliday = await createHoliday(holidayCarrier);

        if (newHoliday) {
          navigate("/holiday-management");
        }
      } else {
        // Update holiday
        const updates = {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          companyIds: data.companyIds || [],
        };

        const updated = await updateHoliday(holidayId!, updates);
        if (updated) {
          navigate("/holiday-management");
        }
      }
    } catch (error) {
      console.error("Error submitting holiday:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/holiday-management");
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      {loadingHoliday ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading holiday...</p>
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
                {mode === "edit" ? "Edit Holiday" : "Add Holiday"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {mode === "edit"
                  ? `Update: ${holiday?.name || ""}`
                  : "Create a new company holiday"}
              </p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 pb-24"
            >
              {/* Holiday Details Card */}
              <Card className="p-6">
                <h3 className="text-base font-semibold mb-6">
                  Holiday Details
                </h3>

                {/* Holiday Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Holiday Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New Year Day" {...field} />
                      </FormControl>
                      <FormMessage />
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
                          placeholder="Brief description of the holiday..."
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain the significance or details about this holiday
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/holiday.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Add an image URL to represent this holiday
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Companies */}
                <FormField
                  control={form.control}
                  name="companyIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable Companies *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {companies && companies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                              {companies.map((company) => (
                                <label
                                  key={company.id}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(field.value || []).includes(company.id)}
                                    onChange={(e) => {
                                      const currentValues = field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([
                                          ...currentValues,
                                          company.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter(
                                            (id) => id !== company.id,
                                          ),
                                        );
                                      }
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm">
                                    {company.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No companies available
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select which companies this holiday applies to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Form Action Bar */}
              <FormActionBar
                mode={mode}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                submitText={
                  mode === "edit" ? "Update Holiday" : "Create Holiday"
                }
              />
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
