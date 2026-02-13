/**
 * Apply Leave Dialog Component
 * Dialog for submitting leave applications
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, differenceInBusinessDays } from 'date-fns';
import { CalendarIcon, Plus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveBalance } from '../types/leave.types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApplyLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: LeaveBalance[];
  defaultLeaveTypeId?: string;
  onSubmit: (data: {
    leaveTypeId: string;
    startDate: Date;
    endDate: Date;
    numberOfDays: number;
    reason: string;
  }) => void;
}

export function ApplyLeaveDialog({ 
  open, 
  onOpenChange, 
  balances,
  defaultLeaveTypeId,
  onSubmit 
}: ApplyLeaveDialogProps) {
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [error, setError] = useState('');

  // Set default leave type when dialog opens
  useEffect(() => {
    if (open && defaultLeaveTypeId) {
      setSelectedLeaveType(defaultLeaveTypeId);
    }
  }, [open, defaultLeaveTypeId]);

  // Calculate number of days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      // Calculate business days (Monday to Friday) + 1 to include both start and end dates
      const days = differenceInBusinessDays(endDate, startDate) + 1;
      setNumberOfDays(days > 0 ? days : 0);
      setError('');
    } else {
      setNumberOfDays(0);
    }
  }, [startDate, endDate]);

  // Validate against available balance
  useEffect(() => {
    if (selectedLeaveType && numberOfDays > 0) {
      const balance = balances.find(b => b.leaveTypeId === selectedLeaveType);
      if (balance && numberOfDays > balance.available) {
        setError(`You only have ${balance.available} days available for ${balance.leaveTypeName}`);
      } else {
        setError('');
      }
    }
  }, [selectedLeaveType, numberOfDays, balances]);

  const handleSubmit = () => {
    if (!selectedLeaveType || !startDate || !endDate || !reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (numberOfDays <= 0) {
      setError('End date must be after start date');
      return;
    }

    const balance = balances.find(b => b.leaveTypeId === selectedLeaveType);
    if (balance && numberOfDays > balance.available) {
      setError(`Insufficient leave balance. You have ${balance.available} days available.`);
      return;
    }

    onSubmit({
      leaveTypeId: selectedLeaveType,
      startDate,
      endDate,
      numberOfDays,
      reason: reason.trim(),
    });

    // Reset form
    setSelectedLeaveType('');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
    setNumberOfDays(0);
    setError('');
  };

  const selectedBalance = balances.find(b => b.leaveTypeId === selectedLeaveType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>
            Submit a new leave application. Make sure you have sufficient balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Leave Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="leave-type">Leave Type *</Label>
            <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
              <SelectTrigger id="leave-type">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {balances.map((balance) => (
                  <SelectItem 
                    key={balance.leaveTypeId} 
                    value={balance.leaveTypeId}
                    disabled={balance.available === 0}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{balance.leaveTypeName}</span>
                      <span className="ml-4 text-xs text-muted-foreground">
                        {balance.available} days available
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBalance && (
              <p className="text-sm text-muted-foreground">
                Available: <span className="font-semibold text-green-600">{selectedBalance.available}</span> days
                {selectedBalance.pending > 0 && (
                  <span className="text-amber-600"> ({selectedBalance.pending} pending)</span>
                )}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date < startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Number of Days Display */}
          {numberOfDays > 0 && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">
                Duration: <span className="text-lg font-bold text-primary">{numberOfDays}</span> business day{numberOfDays !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!!error || !selectedLeaveType || !startDate || !endDate || !reason.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
