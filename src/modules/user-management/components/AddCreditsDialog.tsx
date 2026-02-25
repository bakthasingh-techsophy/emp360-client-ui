/**
 * Add Credits Dialog Component
 * Dialog for allocating credits (comp-off, special leave, etc.) to one or multiple employees
 * Fixed header (custom close) and fixed footer with scrollable content
 * Works with both single and bulk employee IDs
 * Uses LMS configurations for credit type selection and shadcn date pickers
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Gift, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BulkCreditCarrier } from "@/services/userManagementService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LeavesConfigurationSelector } from "@/components/context-aware/LeavesConfigurationSelector";

export interface AddCreditsFormData {
  creditType: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  reason: string;
}

export interface AddCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIds: string[];
  onSubmit: (carrier: BulkCreditCarrier) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddCreditsDialog({
  open,
  onOpenChange,
  userIds,
  onSubmit,
  isSubmitting = false,
}: AddCreditsDialogProps) {
  const [formData, setFormData] = useState<AddCreditsFormData>({
    creditType: "",
    fromDate: new Date(),
    toDate: new Date(),
    reason: "",
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        creditType: "",
        fromDate: new Date(),
        toDate: new Date(),
        reason: "",
      });
    }
  }, [open]);

  const isValid =
    formData.creditType &&
    formData.fromDate &&
    formData.toDate &&
    formData.reason.trim();

  const handleSubmit = async () => {
    if (!isValid) return;

    const carrier: BulkCreditCarrier = {
      userIds,
      creditType: formData.creditType,
      fromDate: new Date(
        formData.fromDate!.getFullYear(),
        formData.fromDate!.getMonth(),
        formData.fromDate!.getDate(),
        0,
        0,
        0,
        0,
      ).toISOString(),
      toDate: new Date(
        formData.toDate!.getFullYear(),
        formData.toDate!.getMonth(),
        formData.toDate!.getDate(),
        23,
        59,
        59,
        999,
      ).toISOString(),
      reason: formData.reason.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await onSubmit(carrier);
      onOpenChange(false);
      setFormData({
        creditType: "",
        fromDate: new Date(),
        toDate: new Date(),
        reason: "",
      });
    } catch (err) {
      // Error handling is done by the caller via toast
      console.error("Error submitting form:", err);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 gap-0 flex flex-col"
        hideClose
      >
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Add Credits to Employees</DialogTitle>
              <DialogDescription className="mt-1">
                Allocate credits to {userIds.length} selected employee(s)
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8 rounded-full shrink-0 -mt-2"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* Employee IDs Display */}
            <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
              <Label className="text-xs font-semibold">
                Selected Employees ({userIds.length})
              </Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {userIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium"
                  >
                    {id}
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Type - Using LeavesConfigurationSelector */}
            <div className="space-y-2">
              <Label htmlFor="credit-type">Credit Type *</Label>
              <LeavesConfigurationSelector
                value={formData.creditType}
                onChange={(creditTypeId) =>
                  setFormData({ ...formData, creditType: creditTypeId })
                }
                placeholder="Select credit type"
                disabled={isSubmitting}
                categories={["special"]}
              />
              <p className="text-xs text-muted-foreground">
                Loads leave types from system configurations
              </p>
            </div>

            {/* From Date */}
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.fromDate && "text-muted-foreground",
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.fromDate
                      ? format(formData.fromDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.fromDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, fromDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.toDate && "text-muted-foreground",
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.toDate
                      ? format(formData.toDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.toDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, toDate: date })
                    }
                    initialFocus
                    disabled={(date) =>
                      formData.fromDate ? date < formData.fromDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for credit allocation"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                disabled={isSubmitting}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide a clear reason for the credit allocation
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/20">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2 h-4 w-4">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Add Credits
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
