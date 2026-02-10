import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { AvailableFilter, FilterOperator } from './types';
import { ContextAwareFilterRenderer } from './ContextAwareFilterRenderer';

interface FilterFieldRendererProps {
  filter: AvailableFilter;
  operator: FilterOperator;
  value: any;
  onChange: (value: any) => void;
  onEnterKey?: () => void; // Callback when Enter is pressed in text fields
}

export const FilterFieldRenderer: React.FC<FilterFieldRendererProps> = ({
  filter,
  operator,
  value,
  onChange,
  onEnterKey,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterKey) {
      onEnterKey();
    }
  };

  // For 'today' operator, no input needed (type-safe check)
  if (operator === 'today' as FilterOperator) {
    return (
      <div className="flex-1 flex items-center text-sm text-muted-foreground">
        (no value needed)
      </div>
    );
  }

  // For 'exists' operator on boolean fields
  if (operator === 'exists' as FilterOperator) {
    return (
      <Select value={value?.toString() || 'true'} onValueChange={(val) => onChange(val === 'true')}>
        <SelectTrigger className="h-9 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  switch (filter.type) {
    case 'text':
      return (
        <Input
          placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 text-sm flex-1"
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          onKeyDown={handleKeyDown}
          className="h-9 text-sm flex-1"
        />
      );

    case 'select':
      const selectValue = Array.isArray(value) ? value : [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 text-sm flex-1 justify-between font-normal"
            >
              <span className="truncate">
                {selectValue.length > 0
                  ? selectValue.map(v => filter.options?.find(opt => opt.value === v)?.label || v).join(', ')
                  : filter.placeholder || `Select ${filter.label.toLowerCase()}`}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filter.options?.map((option) => {
                const isSelected = selectValue.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                    onClick={() => {
                      const newValues = isSelected
                        ? selectValue.filter(v => v !== option.value)
                        : [...selectValue, option.value];
                      onChange(newValues);
                    }}
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span className="text-sm">{option.label}</span>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );

    case 'multiselect':
      const multiselectValue = Array.isArray(value) ? value : [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 text-sm flex-1 justify-between font-normal"
            >
              <span className="truncate">
                {multiselectValue.length > 0
                  ? `${multiselectValue.length} selected`
                  : filter.placeholder || `Select ${filter.label.toLowerCase()}`}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filter.options?.map((option) => {
                const isSelected = multiselectValue.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                    onClick={() => {
                      const newValues = isSelected
                        ? multiselectValue.filter(v => v !== option.value)
                        : [...multiselectValue, option.value];
                      onChange(newValues);
                    }}
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span className="text-sm">{option.label}</span>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );

    case 'date':
      // Determine if we need date picker based on operator
      const showDatePicker = operator !== 'today';
      const showEndDate = operator === 'between';
      const dateValue = value || { from: '', to: '' };

      if (!showDatePicker) {
        return null; // 'today' operator handled above
      }

      return (
        <div className="flex gap-2 flex-1">
          {/* Date Picker(s) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 justify-start text-left font-normal flex-1",
                  !dateValue.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue.from ? format(new Date(dateValue.from), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue.from ? new Date(dateValue.from) : undefined}
                onSelect={(date) => onChange({ ...dateValue, from: date?.toISOString() || '' })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {showEndDate && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 justify-start text-left font-normal flex-1",
                    !dateValue.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue.to ? format(new Date(dateValue.to), "PPP") : <span>End date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue.to ? new Date(dateValue.to) : undefined}
                  onSelect={(date) => onChange({ ...dateValue, to: date?.toISOString() || '' })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      );

    case 'numberrange':
      const numberRangeValue = value || { min: '', max: '' };
      return (
        <div className="grid grid-cols-2 gap-2 flex-1">
          <Input
            type="number"
            placeholder="Min"
            value={numberRangeValue.min || ''}
            onChange={(e) =>
              onChange({ ...numberRangeValue, min: e.target.value ? Number(e.target.value) : '' })
            }
            onKeyDown={handleKeyDown}
            className="h-9 text-sm"
          />
          <Input
            type="number"
            placeholder="Max"
            value={numberRangeValue.max || ''}
            onChange={(e) =>
              onChange({ ...numberRangeValue, max: e.target.value ? Number(e.target.value) : '' })
            }
            onKeyDown={handleKeyDown}
            className="h-9 text-sm"
          />
        </div>
      );

    case 'checkbox':
    case 'boolean':
      return (
        <Select value={value?.toString() || 'true'} onValueChange={(val) => onChange(val === 'true')}>
          <SelectTrigger className="h-9 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );

    case 'context-aware-dropdown':
      if (!filter.contextAwareConfig) {
        return <div className="text-sm text-muted-foreground">Invalid config</div>;
      }
      return (
        <ContextAwareFilterRenderer
          config={filter.contextAwareConfig}
          value={value}
          onChange={onChange}
          isSingleSelect={true}
          placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`}
        />
      );

    case 'context-aware-multiselect':
      if (!filter.contextAwareConfig) {
        return <div className="text-sm text-muted-foreground">Invalid config</div>;
      }
      return (
        <ContextAwareFilterRenderer
          config={filter.contextAwareConfig}
          value={value}
          onChange={onChange}
          isSingleSelect={false}
          placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`}
        />
      );

    default:
      return null;
  }
};
