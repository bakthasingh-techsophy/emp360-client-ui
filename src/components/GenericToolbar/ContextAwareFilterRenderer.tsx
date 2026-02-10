import { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';
import { FilterOption, ContextAwareFilterConfig } from './types';

interface ContextAwareFilterRendererProps {
  config: ContextAwareFilterConfig;
  value: string | string[] | null | undefined;
  onChange: (value: string | string[]) => void;
  isSingleSelect?: boolean;
  placeholder?: string;
}

export const ContextAwareFilterRenderer: React.FC<ContextAwareFilterRendererProps> = ({
  config,
  value,
  onChange,
  isSingleSelect = false,
  placeholder = 'Search...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const [cachedOptions, setCachedOptions] = useState<Map<string, FilterOption[]>>(new Map());

  const minChars = config.minCharsToSearch ?? 2;
  const debounceMs = config.debounceMs ?? 300;

  // Convert value to array for easier handling
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  // Load initial options when popover opens (if no search yet)
  useEffect(() => {
    if (isOpen && searchQuery.length === 0 && options.length === 0) {
      // Load default options (empty search)
      loadOptions('');
    }
  }, [isOpen]);

  // Debounced search handler
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if below minimum characters
    if (searchQuery.length > 0 && searchQuery.length < minChars) {
      setOptions([]);
      return;
    }

    // Check cache first
    if (cachedOptions.has(searchQuery)) {
      setOptions(cachedOptions.get(searchQuery) || []);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      loadOptions(searchQuery);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const loadOptions = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const result = await config.loadingFunction(query);
      
      // Cache the result
      setCachedOptions(prev => new Map(prev).set(query, result));
      setOptions(result);
    } catch (error) {
      console.error('Failed to load options:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const handleSelect = (optionValue: string) => {
    if (isSingleSelect) {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    } else {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    }
  };

  const handleRemoveTag = (valueToRemove: string) => {
    if (isSingleSelect) {
      onChange('');
    } else {
      const newValues = selectedValues.filter(v => v !== valueToRemove);
      onChange(newValues);
    }
  };

  const displayLabel = useCallback(() => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (isSingleSelect) {
      const selected = options.find(opt => opt.value === selectedValues[0]);
      return selected?.label || selectedValues[0];
    }

    if (selectedValues.length === 1) {
      const selected = options.find(opt => opt.value === selectedValues[0]);
      return selected?.label || selectedValues[0];
    }

    return `${selectedValues.length} selected`;
  }, [selectedValues, options, isSingleSelect, placeholder]);

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            type="button"
          >
            <span className="truncate text-left">{displayLabel()}</span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
          <div className="p-3 space-y-2">
            {/* Search Input */}
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
              autoFocus
            />

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Options List */}
            {!isLoading && (
              <div className="max-h-[240px] overflow-y-auto space-y-1">
                {options.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2 text-center">
                    {searchQuery.length > 0 && searchQuery.length < minChars
                      ? `Type at least ${minChars} characters`
                      : 'No options available'}
                  </div>
                ) : (
                  options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={() =>
                          handleSelect(option.value)
                        }
                        className="cursor-pointer"
                      />
                      <span className="text-sm flex-1 truncate">
                        {option.label}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Tags (for multiselect) */}
      {!isSingleSelect && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((val) => {
            const selected = options.find(opt => opt.value === val);
            const label = selected?.label || val;
            return (
              <div
                key={val}
                className="bg-primary/10 text-primary text-sm px-2 py-1 rounded flex items-center gap-1"
              >
                <span>{label}</span>
                <button
                  onClick={() => handleRemoveTag(val)}
                  className="hover:text-primary/70"
                  type="button"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
