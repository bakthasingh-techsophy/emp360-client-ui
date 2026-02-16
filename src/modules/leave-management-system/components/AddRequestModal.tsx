/**
 * Add Regularisation Request Modal
 * Form to create a new extra hours request
 */

import React, { useState, useMemo } from 'react';
import { format, parseISO, isWeekend } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Calendar, Clock } from 'lucide-react';

interface AddRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (date: string, extraHours: number, reason: string) => Promise<void>;
  loading?: boolean;
}

export const AddRequestModal: React.FC<AddRequestModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}) => {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [extraHours, setExtraHours] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check if selected date is weekend
  const isSelectedDateWeekend = useMemo(() => {
    try {
      return isWeekend(parseISO(date));
    } catch {
      return false;
    }
  }, [date]);

  // Check if selected date is in future
  const isDateInFuture = useMemo(() => {
    try {
      return parseISO(date) > new Date();
    } catch {
      return false;
    }
  }, [date]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = 'Date is required';
    } else if (isDateInFuture) {
      newErrors.date = 'Cannot request for future date';
    } else if (isSelectedDateWeekend) {
      newErrors.date = 'Cannot request for weekend (unless override is needed)';
    }

    const hours = parseFloat(extraHours);
    if (!extraHours || isNaN(hours)) {
      newErrors.extraHours = 'Extra hours is required';
    } else if (hours <= 0) {
      newErrors.extraHours = 'Extra hours must be greater than 0';
    } else if (hours > 24) {
      newErrors.extraHours = 'Extra hours cannot exceed 24 hours per day';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (reason.trim().length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(date, parseFloat(extraHours), reason.trim());
      // Reset form on success
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setExtraHours('');
      setReason('');
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create request');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset when opening
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setExtraHours('');
      setReason('');
      setErrors({});
      setSubmitError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Add Regularisation Request</DialogTitle>
          <DialogDescription>
            Request additional work hours to be added to a specific date
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Alert */}
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Request Date
            </Label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) {
                  setErrors({ ...errors, date: '' });
                }
              }}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 text-sm border rounded-md border-input bg-background"
              disabled={loading}
            />
            {isSelectedDateWeekend && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                ⚠️ Selected date is a weekend. Regular requests cannot be made for weekends.
              </p>
            )}
            {errors.date && <p className="text-xs text-red-600 dark:text-red-400">{errors.date}</p>}
          </div>

          {/* Extra Hours Field */}
          <div className="space-y-2">
            <Label htmlFor="extraHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Extra Hours
            </Label>
            <div className="relative">
              <Input
                id="extraHours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="0.0"
                value={extraHours}
                onChange={(e) => {
                  setExtraHours(e.target.value);
                  if (errors.extraHours) {
                    setErrors({ ...errors, extraHours: '' });
                  }
                }}
                disabled={loading}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                hrs
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Maximum 24 hours per day</p>
            {errors.extraHours && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.extraHours}</p>
            )}
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you need to request extra hours..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors({ ...errors, reason: '' });
                }
              }}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {reason.length > 0 ? `${reason.length} characters` : 'Minimum 5 characters required'}
            </p>
            {errors.reason && <p className="text-xs text-red-600 dark:text-red-400">{errors.reason}</p>}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>Note:</strong> Your reporting manager will review and approve/reject this request.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !date || !extraHours || !reason}
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 border-2 border-primary/60 border-t-primary rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
