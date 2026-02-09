/**
 * Visitor Registration Form Component
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Upload,
  Camera,
  User,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FormActionBar } from "@/components/common/FormActionBar/FormActionBar";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { UsersSelector, CompanySelector } from "@/components/context-aware";
import { useVisitorManagement } from "@/contexts/VisitorManagementContext";
import { PURPOSE_OPTIONS, VISITOR_STATUS_LABELS } from "../constants";
import { VisitorPurpose, VisitorStatus } from "../types";

// Form schema - structure matches VisitorCarrierInput (backend payload)
// This ensures form data can be directly used for API requests
const visitorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  companyId: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  photoUrl: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  purpose: z
    .string()
    .min(1, "Purpose is required") as z.ZodType<VisitorPurpose>,
  hostEmployeeId: z.string().min(1, "Host employee is required"),
  expectedArrivalDateTime: z.string().min(1, "Arrival date and time is required"),
  visitorStatus: z
    .string()
    .min(1, "Status is required") as z.ZodType<VisitorStatus>,
  instantCheckIn: z.boolean().default(false),
  notes: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

type VisitorFormValues = z.infer<typeof visitorFormSchema>;

interface VisitorRegistrationFormProps {
  mode: "create" | "edit";
  visitorId?: string;
}

export function VisitorRegistrationForm({
  mode,
  visitorId,
}: VisitorRegistrationFormProps) {
  const navigate = useNavigate();
  const { createVisitor, updateVisitor, getVisitorById, isLoading } = useVisitorManagement();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitorPhoto, setVisitorPhoto] = useState<string>("");
  const [cameraState, setCameraState] = useState<
    "idle" | "starting" | "active"
  >("idle");
  const visitorPhotoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyId: "",
      photoUrl: "",
      purpose: "" as VisitorPurpose,
      hostEmployeeId: "",
      expectedArrivalDateTime: "",
      visitorStatus: "pending" as VisitorStatus,
      instantCheckIn: false,
      notes: "",
    },
  });

  // Load visitor data in edit mode
  useEffect(() => {
    if (mode === "edit" && visitorId) {
      const loadVisitor = async () => {
        const foundVisitor = await getVisitorById(visitorId);
        if (foundVisitor) {
          form.reset({
            name: foundVisitor.visitorName,
            email: foundVisitor.visitorEmail,
            phone: foundVisitor.visitorPhone,
            companyId: foundVisitor.companyId || "",
            photoUrl: foundVisitor.photoUrl || "",
            purpose: foundVisitor.purpose,
            hostEmployeeId: foundVisitor.employeeId,
            expectedArrivalDateTime: foundVisitor.expectedArrivalDateTime,
            visitorStatus: foundVisitor.visitorStatus,
            notes: foundVisitor.notes || "",
          });
          // Set visitor photo state for display
          if (foundVisitor.photoUrl) {
            setVisitorPhoto(foundVisitor.photoUrl);
          }
        }
      };
      loadVisitor();
    }
  }, [mode, visitorId, form]);

  const onSubmit = async (data: VisitorFormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create payload - expectedArrivalDateTime is already ISO UTC string from DateTimePicker
        const visitorCarrier: any = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          companyId: data.companyId || null,
          photoUrl: data.photoUrl || null,
          purpose: data.purpose,
          hostEmployeeId: data.hostEmployeeId,
          expectedArrivalDateTime: data.expectedArrivalDateTime, // ISO UTC timestamp: "2026-02-09T14:02:00.000Z"
          visitorStatus: data.instantCheckIn ? "checked-in" : data.visitorStatus,
          notes: data.notes || null,
          createdAt: new Date().toISOString(), // ISO UTC timestamp
        };

        // If instant check-in is enabled, set checkInTime to current time
        if (data.instantCheckIn) {
          visitorCarrier.checkInTime = new Date().toISOString();
        }

        const result = await createVisitor(visitorCarrier);
        if (result) {
          navigate("/visitor-management");
        }
      } else {
        // Update payload - expectedArrivalDateTime is already ISO UTC string
        const updatePayload = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          companyId: data.companyId || null,
          photoUrl: data.photoUrl || null,
          purpose: data.purpose,
          hostEmployeeId: data.hostEmployeeId,
          expectedArrivalDateTime: data.expectedArrivalDateTime, // ISO UTC timestamp: "2026-02-09T14:02:00.000Z"
          visitorStatus: data.visitorStatus,
          notes: data.notes || null,
        };

        const result = await updateVisitor(visitorId!, updatePayload);
        if (result) {
          navigate("/visitor-management");
        }
      }
    } catch (error) {
      console.error("Error submitting visitor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/visitor-management");
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraState("idle");
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (cameraState === "active" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraState]);

  const startCamera = async () => {
    setCameraState("starting");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = mediaStream;
      setCameraState("active");
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraState("idle");
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Camera not ready. Please wait a moment and try again.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
        setVisitorPhoto(imageUrl);
        form.setValue("photoUrl", imageUrl);
        stopCamera();
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVisitorPhoto(reader.result as string);
        form.setValue("photoUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            {mode === "edit" ? "Edit Visitor" : "Register Visitor"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === "edit"
              ? "Update visitor information"
              : "Fill in visitor details"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Visitor Photo Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Visitor Photo */}
            <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-muted-foreground/25">
                    <AvatarImage
                      src={visitorPhoto}
                      alt="Visitor"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  {visitorPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setVisitorPhoto("");
                        form.setValue("photoUrl", "");
                      }}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {cameraState !== "idle" ? (
                  <div className="space-y-1.5 w-full max-w-[200px]">
                    {cameraState === "starting" ? (
                      <div className="w-full aspect-[4/3] rounded border bg-muted flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-[4/3] rounded border bg-black object-cover"
                      />
                    )}
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        onClick={capturePhoto}
                        disabled={cameraState !== "active"}
                        className="flex-1 h-7 text-xs"
                      >
                        <Camera className="mr-1 h-3 w-3" />
                        Capture
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={stopCamera}
                        className="flex-1 h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={startCamera}
                      className="h-7 text-xs px-2"
                    >
                      <Camera className="mr-1 h-3 w-3" />
                      Camera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => visitorPhotoInputRef.current?.click()}
                      className="h-7 text-xs px-2"
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Upload
                    </Button>
                    <input
                      ref={visitorPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Phone <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1234567890"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Company</FormLabel>
                      <FormControl>
                        <CompanySelector
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Search and select company (optional)"
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

          {/* Visit Details Fields */}
          <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Purpose <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PURPOSE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hostEmployeeId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Host <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <UsersSelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search and select host"
                        disabled={isSubmitting || isLoading}
                        error={fieldState.error?.message}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitorStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">{VISITOR_STATUS_LABELS.pending}</SelectItem>
                        <SelectItem value="approved">{VISITOR_STATUS_LABELS.approved}</SelectItem>
                        <SelectItem value="rejected">{VISITOR_STATUS_LABELS.rejected}</SelectItem>
                        <SelectItem value="checked-in">{VISITOR_STATUS_LABELS['checked-in']}</SelectItem>
                        <SelectItem value="checked-out">{VISITOR_STATUS_LABELS['checked-out']}</SelectItem>
                        <SelectItem value="expired">{VISITOR_STATUS_LABELS.expired}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>


          {/* Instant Check-In Checkbox - Only in Create Mode */}
          {mode === "create" && (
            <FormField
              control={form.control}
              name="instantCheckIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // Automatically set status to checked-in when instant check-in is enabled
                        if (checked) {
                          form.setValue("visitorStatus", "checked-in");
                          // Set arrival date & time to current instant
                          form.setValue("expectedArrivalDateTime", new Date().toISOString());
                        } else {
                          // Reset to pending when unchecked
                          form.setValue("visitorStatus", "pending");
                          // Clear the arrival date & time
                          form.setValue("expectedArrivalDateTime", "");
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Instant Check-In
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Check this to immediately check in the visitor. Status will be set to "Checked-In" and check-in time will be recorded automatically.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Visit Schedule Field */}
          <FormField
            control={form.control}
            name="expectedArrivalDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  Arrival Date & Time <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Pick arrival date and time"
                    timePosition="right"
                    mode="accessible"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Notes Field */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes or requirements..."
                    className="text-sm min-h-[120px] resize-y"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Form Action Bar */}
          <FormActionBar
            mode={mode}
            isSubmitting={isSubmitting || isLoading}
            onCancel={handleCancel}
            submitText={mode === "edit" ? "Update" : "Register"}
          />
        </form>
      </Form>
      </Card>
    </div>
  );
}
