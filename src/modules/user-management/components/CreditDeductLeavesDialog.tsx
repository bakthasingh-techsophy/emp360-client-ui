/**
 * Credit/Deduct Leaves Dialog Component
 * Reusable dialog for crediting or deducting employee leaves
 * Used in both bulk employee management and individual leave details
 * Dynamically loads leave configurations from LMS
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
import { X, Gift, AlertCircle } from "lucide-react";
import { LeavesConfigurationSelector } from "@/components/context-aware/LeavesConfigurationSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface CreditDeductFormData {
  leaveTypeId: string; // Leave Configuration ID
  category: string; // Leave category (for validation)
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
  onSubmit: (action: "credit" | "deduct") => void;
  isSubmitting?: boolean;
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
}: CreditDeductLeavesDialogProps) {
  const isValid = formData.leaveTypeId && formData.count;
  const isFlexible = formData.category?.toLowerCase() === "flexible";
  const isSpecial = formData.category?.toLowerCase() === "special";
  const canSubmit = isValid && !isFlexible;

  const handleCredit = () => {
    onSubmit("credit");
  };

  const handleDeduct = () => {
    onSubmit("deduct");
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

            {/* Leave Type - Context-Aware Selector */}
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave Type *</Label>
              <LeavesConfigurationSelector
                value={formData.leaveTypeId}
                onChange={(leaveTypeId, category) =>
                  onFormDataChange({ ...formData, leaveTypeId, category: category || "" })
                }
                placeholder="Select leave type"
                disabled={isSubmitting}
                categories={["accrued", "monetization"]}
              />
            </div>

            {/* Warning for Flexible Leaves */}
            {isFlexible && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cannot modify flexible leaves:</strong> Flexible leaves are consumption-based and cannot be credited or deducted. They are tracked based on actual consumption only.
                </AlertDescription>
              </Alert>
            )}

            {/* Info for Special Leaves */}
            {isSpecial && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Special Leave:</strong> Special leaves can only be credited through the add credits feature. Deduction is not supported for special leaves.
                </AlertDescription>
              </Alert>
            )}

            {/* Count */}
            <div className="space-y-2">
              <Label htmlFor="leave-count">Count (decimals up to 1) *</Label>
              <Input
                id="leave-count"
                type="number"
                placeholder="e.g., 2.5"
                value={formData.count}
                onChange={(e) => {
                  let value = e.target.value;
                  // Limit to 1 decimal place
                  if (value && value.includes(".")) {
                    const parts = value.split(".");
                    if (parts[1].length > 1) {
                      value = `${parts[0]}.${parts[1].substring(0, 1)}`;
                    }
                  }
                  onFormDataChange({ ...formData, count: value });
                }}
                step="0.1"
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
            disabled={!canSubmit || isSubmitting}
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
            disabled={!canSubmit || isSubmitting || isSpecial}
            onClick={handleDeduct}
            title={isSpecial ? "Deduction not supported for special leaves" : ""}
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
