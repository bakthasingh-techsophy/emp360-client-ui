import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const parseValue = (val?: string) => {
    if (!val) return { hour: '', minute: '', period: 'AM' };
    const [h, m] = val.split(':');
    const hourNum = parseInt(h);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum === 0 ? '12' : hourNum > 12 ? (hourNum - 12).toString() : hourNum.toString();
    return { hour: hour12, minute: m, period };
  };

  const { hour: initialHour, minute: initialMinute, period: initialPeriod } = parseValue(value);
  const [selectedHour, setSelectedHour] = React.useState(initialHour);
  const [selectedMinute, setSelectedMinute] = React.useState(initialMinute);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'AM' | 'PM'>(initialPeriod as 'AM' | 'PM');

  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const { hour, minute, period } = parseValue(value);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period as 'AM' | 'PM');
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const to24Hour = (hour: string, period: 'AM' | 'PM') => {
    let h = parseInt(hour);
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return h.toString().padStart(2, '0');
  };

  const updateTime = (hour?: string, minute?: string, period?: 'AM' | 'PM') => {
    const h = hour || selectedHour;
    const m = minute || selectedMinute;
    const p = period || selectedPeriod;
    
    if (h && m) {
      const hour24 = to24Hour(h, p);
      onChange?.(`${hour24}:${m}`);
    }
  };

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    updateTime(hour, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    if (selectedHour) {
      updateTime(selectedHour, minute, selectedPeriod);
    }
  };

  const handlePeriodToggle = (period: 'AM' | 'PM') => {
    setSelectedPeriod(period);
    if (selectedHour && selectedMinute) {
      updateTime(selectedHour, selectedMinute, period);
      setIsOpen(false);
    }
  };

  const formatDisplay = () => {
    if (!value) return placeholder;
    const { hour, minute, period } = parseValue(value);
    return `${hour}:${minute} ${period}`;
  };

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (selectedHour && hourScrollRef.current) {
          const selected = hourScrollRef.current.querySelector(`[data-hour="${selectedHour}"]`);
          selected?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        if (selectedMinute && minuteScrollRef.current) {
          const selected = minuteScrollRef.current.querySelector(`[data-minute="${selectedMinute}"]`);
          selected?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 50);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&>span]:line-clamp-1',
          !value && 'text-muted-foreground'
        )}
      >
        <Clock className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <span className="flex-1 text-left">{formatDisplay()}</span>
      </button>

      {isOpen && !disabled && (
        <div 
          className={cn(
            'absolute left-0 z-50 mt-2 rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
          data-state="open"
        >
          <div className="flex">
            {/* Hours Column */}
            <div className="flex flex-col w-16 border-r border-border">
              <div className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm px-2 py-2 text-xs font-semibold text-foreground border-b border-border text-center">
                Hour
              </div>
              <div 
                className="h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" 
                ref={hourScrollRef}
              >
                <div className="p-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      data-hour={hour}
                      onClick={() => handleHourSelect(hour)}
                      className={cn(
                        'w-full px-2 py-1.5 text-sm rounded-sm transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
                        selectedHour === hour
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex flex-col w-16 border-r border-border">
              <div className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm px-2 py-2 text-xs font-semibold text-foreground border-b border-border text-center">
                Min
              </div>
              <div 
                className="h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" 
                ref={minuteScrollRef}
              >
                <div className="p-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      data-minute={minute}
                      onClick={() => handleMinuteSelect(minute)}
                      className={cn(
                        'w-full px-2 py-1.5 text-sm rounded-sm transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
                        selectedMinute === minute
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Period Column */}
            <div className="flex flex-col w-16">
              <div className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm px-2 py-2 text-xs font-semibold text-foreground border-b border-border text-center">
                Period
              </div>
              <div className="p-1.5 space-y-1.5 flex flex-col justify-center h-[160px]">
                {(['AM', 'PM'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => handlePeriodToggle(period)}
                    className={cn(
                      'w-full px-2 py-2 text-sm font-medium rounded-sm transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
                      selectedPeriod === period
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimePicker;



