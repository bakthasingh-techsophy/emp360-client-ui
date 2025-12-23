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
  CalendarIcon,
  Upload,
  Camera,
  User,
  X,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FormActionBar } from "@/components/common/FormActionBar";
import { TimePicker } from "./TimePicker";
import { PURPOSE_OPTIONS } from "../constants";
import { mockEmployees, mockVisitors } from "../mockData";
import { VisitorPurpose } from "../types";
import { cn } from "@/lib/utils";

// Form schema - matches Visitor type fields used in form
const visitorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  company: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  purpose: z
    .string()
    .min(1, "Purpose is required") as z.ZodType<VisitorPurpose>,
  hostEmployeeId: z.string().min(1, "Host employee is required"),
  registrationType: z.enum(["pre-registered", "instant"]),
  expectedArrivalDate: z.date({ required_error: "Arrival date is required" }),
  expectedArrivalTime: z.string().min(1, "Arrival time is required"),
  expectedDepartureTime: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
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
  currentUserRole?: "admin" | "employee";
  currentUserId?: string;
}

export function VisitorRegistrationForm({
  mode,
  visitorId,
  currentUserRole = "employee",
  currentUserId = "emp001",
}: VisitorRegistrationFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeringForOther, setRegisteringForOther] = useState(false);
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
      company: "",
      purpose: "" as VisitorPurpose,
      hostEmployeeId: currentUserRole === "employee" ? currentUserId : "",
      registrationType:
        currentUserRole === "admin" ? "instant" : "pre-registered",
      expectedArrivalTime: "",
      expectedDepartureTime: "",
      notes: "",
    },
  });

  const selectedHostId = form.watch("hostEmployeeId");
  const isAdmin = currentUserRole === "admin";

  // Load visitor data in edit mode
  useEffect(() => {
    if (mode === "edit" && visitorId) {
      const foundVisitor = mockVisitors.find((v) => v.id === visitorId);
      if (foundVisitor) {
        form.reset({
          name: foundVisitor.name,
          email: foundVisitor.email,
          phone: foundVisitor.phone,
          company: foundVisitor.company || "",
          purpose: foundVisitor.purpose,
          hostEmployeeId: foundVisitor.hostEmployeeId,
          registrationType: foundVisitor.registrationType,
          expectedArrivalDate: new Date(foundVisitor.expectedArrivalDate),
          expectedArrivalTime: foundVisitor.expectedArrivalTime,
          expectedDepartureTime: foundVisitor.expectedDepartureTime || "",
          notes: foundVisitor.notes || "",
        });
      }
    }
  }, [mode, visitorId, form]);

  // Handle registeringForOther checkbox
  useEffect(() => {
    if (currentUserRole === "employee" && !registeringForOther) {
      form.setValue("hostEmployeeId", currentUserId);
    }
  }, [registeringForOther, currentUserRole, currentUserId, form]);

  const onSubmit = async (data: VisitorFormValues) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Form data:", { ...data, photoUrl: visitorPhoto });

    setIsSubmitting(false);

    // Navigate back to visitor management
    navigate("/visitor-management");
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
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedEmployee = mockEmployees.find(
    (emp) => emp.id === selectedHostId
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Registration Type - Only show for admin */}
          {isAdmin && (
            <Card className="p-4">
              <FormField
                control={form.control}
                name="registrationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pre-registered">
                          Pre-registered
                        </SelectItem>
                        <SelectItem value="instant">
                          Instant Check-in
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          )}

          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Basic Information</h3>

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
                      onClick={() => setVisitorPhoto("")}
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
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Company name"
                          className="h-8 text-sm"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Visit Details */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Visit Details</h3>
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
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-1">
                      <FormLabel className="text-xs">
                        Host <span className="text-destructive">*</span>
                        {!isAdmin && !registeringForOther && (
                          <span className="text-muted-foreground ml-1">
                            (You)
                          </span>
                        )}
                      </FormLabel>
                      {!isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <Checkbox
                            id="registerForOther"
                            checked={registeringForOther}
                            onCheckedChange={(checked) =>
                              setRegisteringForOther(!!checked)
                            }
                            className="h-3.5 w-3.5"
                          />
                          <Label
                            htmlFor="registerForOther"
                            className="text-xs cursor-pointer font-normal"
                          >
                            For other
                          </Label>
                        </div>
                      )}
                    </div>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!isAdmin && !registeringForOther}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select host" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedEmployee && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedEmployee.email}
                      </p>
                    )}
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Visit Schedule</h3>
            <div className="mx-auto space-y-3">
              <FormField
                control={form.control}
                name="expectedArrivalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs">
                      Arrival Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-8 text-sm font-normal w-full",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="expectedArrivalTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Entry Time <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDepartureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Exit Time</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-4">
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
          </Card>

          {/* Form Action Bar */}
          <FormActionBar
            mode={mode}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitText={mode === "edit" ? "Update" : "Register"}
          />
        </form>
      </Form>
    </div>
  );
}
