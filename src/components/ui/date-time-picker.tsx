/**
 * DateTime Picker Component
 * Combines date and time selection into a single component
 * Time selection happens within the calendar popover
 * Outputs ISO UTC string format
 */

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
  value?: string; // ISO UTC string format
  onChange: (isoString: string) => void;
  placeholder?: string;
  disabled?: boolean;
  timePosition?: 'bottom' | 'right'; // Position of time picker relative to calendar
  timeFormat?: '12' | '24'; // 12-hour (with AM/PM) or 24-hour format
  mode?: 'simple' | 'accessible'; // simple: dropdowns, accessible: scrollable columns
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date and time',
  disabled = false,
  timePosition = 'bottom',
  timeFormat = '12',
  mode = 'simple',
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string>(timeFormat === '24' ? '00' : '12');
  const [minute, setMinute] = useState<string>('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  
  // Refs for accessible mode scrollable columns
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);
  const periodScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected items in accessible mode
  useEffect(() => {
    if (mode === 'accessible' && date) {
      // Scroll hour into view
      if (hourScrollRef.current) {
        const selectedButton = hourScrollRef.current.querySelector(`[data-value="${hour}"]`) as HTMLButtonElement;
        if (selectedButton) {
          selectedButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
      // Scroll minute into view
      if (minuteScrollRef.current) {
        const selectedButton = minuteScrollRef.current.querySelector(`[data-value="${minute}"]`) as HTMLButtonElement;
        if (selectedButton) {
          selectedButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
      // Scroll period into view (12-hour format only)
      if (timeFormat === '12' && periodScrollRef.current) {
        const selectedButton = periodScrollRef.current.querySelector(`[data-value="${period}"]`) as HTMLButtonElement;
        if (selectedButton) {
          selectedButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
    }
  }, [mode, date, hour, minute, period, timeFormat]);

  // Parse ISO string value into date and time components
  useEffect(() => {
    if (value) {
      try {
        const dateObj = new Date(value);
        setDate(dateObj);

        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        if (timeFormat === '24') {
          // 24-hour format: 00-23
          setHour(hours.toString().padStart(2, '0'));
        } else {
          // 12-hour format: 01-12 with AM/PM
          const ampm = hours >= 12 ? 'PM' : 'AM';
          let hours12 = hours % 12;
          hours12 = hours12 ? hours12 : 12; // 0 should be 12
          setHour(hours12.toString().padStart(2, '0'));
          setPeriod(ampm);
        }

        setMinute(minutes.toString().padStart(2, '0'));
      } catch (error) {
        console.error('Invalid ISO string:', error);
      }
    }
  }, [value, timeFormat]);

  // Combine date and time into ISO UTC string whenever any component changes
  useEffect(() => {
    if (date && hour && minute) {
      const combined = new Date(date);
      
      let hours24: number;
      
      if (timeFormat === '24') {
        // Direct 24-hour format
        hours24 = parseInt(hour, 10);
      } else {
        // Convert 12-hour to 24-hour
        hours24 = parseInt(hour, 10);
        if (period === 'PM' && hours24 !== 12) {
          hours24 += 12;
        } else if (period === 'AM' && hours24 === 12) {
          hours24 = 0;
        }
      }

      combined.setHours(hours24);
      combined.setMinutes(parseInt(minute, 10));
      combined.setSeconds(0);
      combined.setMilliseconds(0);

      const isoString = combined.toISOString();
      onChange(isoString);
    }
  }, [date, hour, minute, period, onChange, timeFormat]);

  const hours = Array.from({ length: timeFormat === '24' ? 24 : 12 }, (_, i) => {
    if (timeFormat === '24') {
      return i.toString().padStart(2, '0');
    } else {
      const h = i + 1;
      return h.toString().padStart(2, '0');
    }
  });

  const minutes = Array.from({ length: 60 }, (_, i) => {
    return i.toString().padStart(2, '0');
  });

  // Format display value
  const displayValue = date
    ? timeFormat === '24'
      ? `${format(date, 'PPP')} at ${hour}:${minute}`
      : `${format(date, 'PPP')} at ${hour}:${minute} ${period}`
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue ? (
            <span className="truncate">{displayValue}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className={cn(
          "flex",
          timePosition === 'right' ? 'flex-row' : 'flex-col'
        )}>
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
          
          {/* Time Selection */}
          <div className={cn(
            timePosition === 'right' ? 'border-l' : 'border-t',
            'p-3'
          )}>
            {mode === 'simple' ? (
              // Simple Mode: Dropdown selects
              <div className={cn(
                "flex items-center gap-2",
                timePosition === 'right' ? 'flex-col' : 'justify-center'
              )}>
                <Select value={hour} onValueChange={setHour} disabled={disabled || !date}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {timePosition === 'bottom' && (
                  <span className="text-muted-foreground">:</span>
                )}

                <Select value={minute} onValueChange={setMinute} disabled={disabled || !date}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {minutes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {timeFormat === '12' && (
                  <Select
                    value={period}
                    onValueChange={(val) => setPeriod(val as 'AM' | 'PM')}
                    disabled={disabled || !date}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              // Accessible Mode: Scrollable columns side-by-side
              <div className="flex flex-row gap-2 items-start">
                {/* Hours Column */}
                <div className="flex flex-col">
                  <div className="text-xs text-center text-muted-foreground mb-1 font-medium">
                    Hours
                  </div>
                  <div 
                    ref={hourScrollRef}
                    className="h-[180px] w-[60px] overflow-y-auto border rounded-md scrollbar-thin"
                  >
                    {hours.map((h) => (
                      <button
                        key={h}
                        type="button"
                        data-value={h}
                        onClick={() => setHour(h)}
                        disabled={disabled || !date}
                        className={cn(
                          "w-full py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                          hour === h ? "bg-primary text-primary-foreground font-semibold" : "",
                          disabled || !date ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minutes Column */}
                <div className="flex flex-col">
                  <div className="text-xs text-center text-muted-foreground mb-1 font-medium">
                    Minutes
                  </div>
                  <div 
                    ref={minuteScrollRef}
                    className="h-[180px] w-[60px] overflow-y-auto border rounded-md scrollbar-thin"
                  >
                    {minutes.map((m) => (
                      <button
                        key={m}
                        type="button"
                        data-value={m}
                        onClick={() => setMinute(m)}
                        disabled={disabled || !date}
                        className={cn(
                          "w-full py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                          minute === m ? "bg-primary text-primary-foreground font-semibold" : "",
                          disabled || !date ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AM/PM Column (only for 12-hour format) */}
                {timeFormat === '12' && (
                  <div className="flex flex-col">
                    <div className="text-xs text-center text-muted-foreground mb-1 font-medium">
                      Period
                    </div>
                    <div 
                      ref={periodScrollRef}
                      className="h-[180px] w-[60px] overflow-y-auto border rounded-md scrollbar-thin"
                    >
                      {['AM', 'PM'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          data-value={p}
                          onClick={() => setPeriod(p as 'AM' | 'PM')}
                          disabled={disabled || !date}
                          className={cn(
                            "w-full py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                            period === p ? "bg-primary text-primary-foreground font-semibold" : "",
                            disabled || !date ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
