/**
 * Credit/Deduct Leaves Dialog Component
 * Reusable dialog for crediting or deducting employee leaves
 * Used in both bulk employee management and individual leave details
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Gift } from "lucide-react";

export interface CreditDeductFormData {
  leaveType: string;
  count: string;
  actionType: "credit" | "deduct";
}

export interface CreditDeductLeavesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreditDeductFormData;
  onFormDataChange: (data: CreditDeductFormData) => void;
  targetIds: string[];
  isBulk: boolean;
  onSubmit: () => void;
  isSubmitting?: boolean;
  leaveTypes?: { value: string; label: string }[];
}

export function CreditDeductLeavesDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  targetIds,
  isBulk,
  onSubmit,
  isSubmitting = false,
  leaveTypes = [
    { value: "sick", label: "Sick Leave" },
    { value: "casual", label: "Casual Leave" },
    { value: "earned", label: "Earned Leave" },
    { value: "privilege", label: "Privilege Leave" },
    { value: "maternity", label: "Maternity Leave" },
    { value: "paternity", label: "Paternity Leave" },
    { value: "general_leave", label: "General Leave" },
  ],
}: CreditDeductLeavesDialogProps) {
  const isValid = formData.leaveType && formData.count;

  const handleCredit = () => {
    onFormDataChange({ ...formData, actionType: "credit" });
    onSubmit();
  };

  const handleDeduct = () => {
    onFormDataChange({ ...formData, actionType: "deduct" });
    onSubmit();
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
              <DialogTitle>Credit/Deduct Leaves</DialogTitle>
              <DialogDescription className="mt-1">
                {isBulk
                  ? `Manage leaves for ${targetIds.length} selected employee(s)`
                  : "Manage leaves for the selected employee"}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
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
            {/* Employee IDs - Bulk Mode */}
            {isBulk && (
              <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
                <Label className="text-xs font-semibold">
                  Selected Employees
                </Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {targetIds.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium"
                    >
                      {id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave Type *</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, leaveType: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="leave-type">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count */}
            <div className="space-y-2">
              <Label htmlFor="leave-count">Count (decimals up to 1) *</Label>
              <Input
                id="leave-count"
                type="number"
                placeholder="e.g., 2.5"
                value={formData.count}
                onChange={(e) =>
                  onFormDataChange({ ...formData, count: e.target.value })
                }
                step="0.5"
                min="0"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Accepted format: 0.5, 1, 1.5, 2, etc.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={!isValid || isSubmitting}
            onClick={handleCredit}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2 h-4 w-4">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Credit Leaves
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            disabled={!isValid || isSubmitting}
            onClick={handleDeduct}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2 h-4 w-4">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Deduct Leaves
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
