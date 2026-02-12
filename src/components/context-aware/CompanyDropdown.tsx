import { useState, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown, Building2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/contexts/CompanyContext';
import { CompanyModel } from '@/types/company';

interface CompanySelectorProps {
  value?: string | null;
  onChange: (companyId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showRefresh?: boolean;
}

/**
 * CompanySelector Component (CompanyDropdown)
 * 
 * Optimistic company selector that reads from CompanyContext.
 * Does NOT fetch data on demand - uses pre-loaded companies list from context.
 * Provides local search/filtering of existing companies.
 * 
 * Features:
 * - Reads companies from CompanyContext (no API calls)
 * - Local search and filtering
 * - Refresh button to reload companies from API
 * - Auto-loads selected company from context cache
 * - Full React Hook Form support
 */
export function CompanyDropdown({
  value,
  onChange,
  placeholder = 'Search companies...',
  disabled = false,
  error,
  showRefresh = true,
}: CompanySelectorProps) {
  const { companies, getCompanyById, refreshCompanies } = useCompany();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyModel | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load selected company when value changes
  useEffect(() => {
    if (value && value !== selectedCompany?.id) {
      const company = getCompanyById(value);
      if (company) {
        setSelectedCompany(company);
      }
    } else if (!value) {
      setSelectedCompany(null);
    }
  }, [value, selectedCompany?.id, getCompanyById]);

  // Filter companies locally based on search query
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return companies;
    }
    
    const query = searchQuery.toLowerCase();
    return companies.filter(company => 
      company.name?.toLowerCase().includes(query) ||
      company.code?.toLowerCase().includes(query) ||
      company.email?.toLowerCase().includes(query) ||
      company.id?.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  // Handle company selection
  const handleSelect = (company: CompanyModel) => {
    setSelectedCompany(company);
    onChange(company.id);
    setOpen(false);
    setSearchQuery('');
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCompanies();
    } catch (error) {
      console.error('Failed to refresh companies:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get display details for a company
  const getDisplayDetails = (company: CompanyModel) => {
    const details = [];
    
    if (company.code) {
      details.push(company.code);
    }
    
    if (company.email) {
      details.push(company.email);
    }
    
    return details.join(' • ');
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                'w-full justify-between h-8 text-sm',
                !selectedCompany && 'text-muted-foreground',
                error && 'border-destructive'
              )}
            >
              {selectedCompany ? (
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{selectedCompany.name}</span>
                  {selectedCompany.code && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {selectedCompany.code}
                    </Badge>
                  )}
                </div>
              ) : (
                <span>{placeholder}</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Type to search companies..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {companies.length === 0 ? (
                  <CommandEmpty>No companies available. Click refresh to load companies.</CommandEmpty>
                ) : filteredCompanies.length === 0 ? (
                  <CommandEmpty>No companies found matching your search.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Companies">
                    {filteredCompanies.map((company) => {
                      const isSelected = selectedCompany?.id === company.id;
                      const displayDetails = getDisplayDetails(company);

                      return (
                        <CommandItem
                          key={company.id}
                          value={company.id}
                          onSelect={() => handleSelect(company)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{company.name}</span>
                                {company.code && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {company.code}
                                  </Badge>
                                )}
                              </div>
                              {displayDetails && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {displayDetails}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Refresh Button */}
        {showRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={disabled || isRefreshing}
            className="h-8 w-8 flex-shrink-0"
            title="Refresh companies"
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                isRefreshing && 'animate-spin'
              )}
            />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
