/**
 * MultiDatePicker Component
 * A reusable component for selecting multiple dates with chip display
 * Shows limited dates inline with a modal for viewing/editing all dates
 */

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface MultiDatePickerProps {
  value?: string[]; // Array of ISO date strings
  onChange?: (dates: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MAX_VISIBLE_DATES = 5; // Show only 5 dates as chips, rest in modal

export function MultiDatePicker({
  value = [],
  onChange,
  placeholder = "Select dates",
  className,
  disabled = false,
}: MultiDatePickerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Convert ISO strings to Date objects for calendar (as local dates)
  const selectedDates = value.map(dateStr => {
    // Parse YYYY-MM-DD as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  // Handle date selection from calendar (in modal)
  const handleSelect = (dates: Date[] | undefined) => {
    if (!dates || dates.length === 0) {
      onChange?.([]);
      return;
    }

    // Convert dates to ISO strings (YYYY-MM-DD format) using local date components
    const isoStrings = dates.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    onChange?.(isoStrings);
  };

  // Remove individual date
  const handleRemoveDate = (dateToRemove: string) => {
    const newDates = value.filter(date => date !== dateToRemove);
    onChange?.(newDates);
  };

  // Format date for chip display
  const formatDate = (isoDate: string) => {
    try {
      return format(parseISO(isoDate), "MMM dd, yyyy");
    } catch {
      return isoDate;
    }
  };

  // Determine visible dates (first 5)
  const visibleDates = value.slice(0, MAX_VISIBLE_DATES);
  const hiddenCount = Math.max(0, value.length - MAX_VISIBLE_DATES);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setModalOpen(true)}
        className={cn(
          "w-full justify-start text-left font-normal",
          !value.length && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value.length > 0
          ? `${value.length} date${value.length > 1 ? 's' : ''} selected`
          : placeholder}
      </Button>

      {/* Display limited dates as chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {visibleDates.map((date) => (
            <Badge
              key={date}
              variant="secondary"
              className="pr-1 flex items-center gap-1"
            >
              <span className="text-xs">{formatDate(date)}</span>
              <button
                type="button"
                onClick={() => handleRemoveDate(date)}
                disabled={disabled}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {/* Show "more" button if there are hidden dates */}
          {hiddenCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(true)}
              disabled={disabled}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              +{hiddenCount} more
            </Button>
          )}
        </div>
      )}

      {/* Modal for viewing/editing all dates */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 flex flex-col" hideClose>
          {/* Fixed Header */}
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl">Select Dates</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {value.length > 0 
                    ? `${value.length} date${value.length > 1 ? 's' : ''} selected`
                    : 'No dates selected'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 rounded-full shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Scrollable Content - Calendar and Selected Dates */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar - Always Visible */}
              <div className="flex flex-col">
                <h3 className="font-semibold mb-3 text-sm">Calendar</h3>
                <div className="border rounded-lg p-3 inline-block">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={handleSelect}
                    disabled={disabled}
                    className="rounded-md"
                  />
                </div>
              </div>

              {/* Selected Dates List */}
              <div className="flex flex-col">
                <h3 className="font-semibold mb-3 text-sm">
                  Selected Dates ({value.length})
                </h3>
                {value.length > 0 ? (
                  <div className="border rounded-lg p-4 bg-muted/30 dark:bg-muted/10">
                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                      {value.map((date, index) => (
                        <div
                          key={date}
                          className="flex items-center justify-between p-2 rounded-md bg-background border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground font-medium w-6">
                              #{index + 1}
                            </span>
                            <span className="text-sm font-medium">
                              {formatDate(date)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDate(date)}
                            disabled={disabled}
                            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No dates selected</p>
                    <p className="text-xs mt-1">Select dates from the calendar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-between items-center gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Click on dates in the calendar to select or deselect
            </div>
            <Button onClick={() => setModalOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
