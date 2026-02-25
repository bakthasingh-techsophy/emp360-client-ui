/**
 * Leaves Configuration Selector Component
 *
 * A searchable leave configuration selector that loads configurations on initial open.
 * Supports single selection and displays leave configuration details.
 *
 * Features:
 * - Initial load of 10 configurations on popover open
 * - Search-driven loading for additional configurations
 * - Searches across name, code, description
 * - Loads selected configuration by ID when value is provided
 * - Refresh button at end of dropdown list
 * - Custom placeholder support
 *
 * Usage:
 * ```tsx
 * <LeavesConfigurationSelector
 *   value={selectedConfigId}
 *   onChange={(configId) => setSelectedConfigId(configId)}
 *   placeholder="Select leave type"
 *   onRefresh={() => console.log('refresh')}
 * />
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import { LMSConfiguration } from "@/modules/leave-management-system/types/leaveConfiguration.types";
import UniversalSearchRequest from "@/types/search";

interface LeavesConfigurationSelectorProps {
  value?: string; // Leave Configuration ID
  onChange: (configId: string, category?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  onRefresh?: () => void; // Callback when refresh button is clicked
}

export function LeavesConfigurationSelector({
  value,
  onChange,
  placeholder = "Select leave type",
  disabled = false,
  className,
  error,
  onRefresh,
}: LeavesConfigurationSelectorProps) {
  const { searchLeaveConfigurations } = useLeaveManagement();

  // State
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [configurations, setConfigurations] = useState<LMSConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<LMSConfiguration | null>(
    null,
  );
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load selected configuration when value changes
  const loadSelectedConfiguration = async () => {
    if (!value) {
      setSelectedConfig(null);
      return;
    }

    // If already selected, no need to reload
    if (selectedConfig?.id === value) {
      return;
    }

    setIsLoadingSelected(true);
    try {
      const searchRequest: UniversalSearchRequest = {
        searchText: value,
        searchFields: ["id", "name", "code", "description", "tagline"],
      };

      const result = await searchLeaveConfigurations(searchRequest, 0, 1);

      if (result && result.content && result.content.length > 0) {
        setSelectedConfig(result.content[0]);
      }
    } catch (error) {
      console.error("Error loading selected configuration:", error);
    } finally {
      setIsLoadingSelected(false);
    }
  };

  useEffect(() => {
    loadSelectedConfiguration();
  }, [value]);

  // Search configurations with debounce
  const searchConfigurations = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 1) {
        // Load initial configs if search is cleared
        await loadInitialConfigurations();
        return;
      }

      setIsLoadingConfigs(true);
      try {
        const searchRequest: UniversalSearchRequest = {
          searchText: query.trim(),
          searchFields: ["name", "code", "description", "tagline"], // Assuming backend supports searching across multiple fields
        };

        const result = await searchLeaveConfigurations(searchRequest, 0, 20);

        if (result && result.content) {
          setConfigurations(result.content);
        } else {
          setConfigurations([]);
        }
      } catch (error) {
        console.error("Error searching configurations:", error);
        setConfigurations([]);
      } finally {
        setIsLoadingConfigs(false);
      }
    },
    [searchLeaveConfigurations],
  );

  // Load initial configurations (page 0, size 10)
  const loadInitialConfigurations = async () => {
    setIsLoadingConfigs(true);
    try {
      const result = await searchLeaveConfigurations({}, 0, 10);

      if (result && result.content) {
        setConfigurations(result.content);
      } else {
        setConfigurations([]);
      }
    } catch (error) {
      console.error("Error loading initial configurations:", error);
      setConfigurations([]);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        if (query.trim().length === 0) {
          // Load initial configs when search is cleared
          loadInitialConfigurations();
        } else {
          searchConfigurations(query);
        }
      }, 300); // 300ms debounce
    },
    [searchConfigurations],
  );

  // Handle configuration selection
  const handleSelect = useCallback(
    (config: LMSConfiguration) => {
      setSelectedConfig(config);
      onChange(config.id, config.category);
      setOpen(false);
      setSearchQuery("");
      setConfigurations([]);
    },
    [onChange],
  );

  // Handle refresh button click
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadInitialConfigurations();
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-1">
      <Popover
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (newOpen && configurations.length === 0 && searchQuery === "") {
            loadInitialConfigurations();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-[2rem] py-2",
              !selectedConfig && "text-muted-foreground",
              error && "border-destructive",
              className,
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isLoadingSelected ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="text-sm">Loading...</span>
                </>
              ) : selectedConfig ? (
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium truncate w-full text-left">
                    {selectedConfig.name}
                  </span>
                  {selectedConfig.code && (
                    <span className="text-xs text-muted-foreground truncate w-full text-left">
                      {selectedConfig.code}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0 flex flex-col"
          align="start"
        >
          <Command
            shouldFilter={false}
            className="w-full flex flex-col max-h-80"
          >
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-2 gap-2 w-full flex-shrink-0">
              <CommandInput
                placeholder="Search leave configurations..."
                value={searchQuery}
                onValueChange={handleSearchChange}
                className="flex-1 w-full text-sm"
              />
            </div>

            {/* Scrollable List */}
            <CommandList className="flex-1 overflow-y-auto">
              <CommandEmpty>
                {isLoadingConfigs ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading configurations...
                    </span>
                  </div>
                ) : searchQuery.trim().length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No configurations available
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No configurations found
                  </div>
                )}
              </CommandEmpty>
              {configurations.length > 0 && (
                <CommandGroup>
                  {configurations.map((config) => (
                    <CommandItem
                      key={config.id}
                      value={config.id}
                      onSelect={() => handleSelect(config)}
                      className="flex items-center gap-2 px-2 py-2"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {config.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {config.code}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4 shrink-0",
                          selectedConfig?.id === config.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>

            {/* Refresh Button at Bottom - Always Visible */}
            <div className="border-t px-2 py-2 flex-shrink-0 bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingConfigs || isRefreshing}
                className="w-full justify-center h-8 text-xs"
                title="Refresh configurations"
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
