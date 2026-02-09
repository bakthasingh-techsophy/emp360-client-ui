import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
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
import { apiSearchCompanies } from '@/services/companyService';
import { resolveAuth } from '@/store/localStorage';

interface CompanySelectorProps {
  value?: string | null;
  onChange: (companyId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

/**
 * CompanySelector Component
 * 
 * An on-demand company selector that loads companies only when the user searches.
 * This prevents memory issues when dealing with large numbers of companies.
 * 
 * Features:
 * - Search-driven loading (doesn't load all companies initially)
 * - Debounced search (300ms delay)
 * - Minimum 2 characters to trigger search
 * - Filters only active companies
 * - Limits results to 20 companies
 * - Auto-loads selected company by ID (for edit mode)
 * - Integrates with CompanyContext
 * - Full React Hook Form support
 */
export function CompanySelector({
  value,
  onChange,
  placeholder = 'Search companies...',
  disabled = false,
  error,
}: CompanySelectorProps) {
  const { getCompanyById, fetchCompanyById } = useCompany();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<CompanyModel[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyModel | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load selected company when value changes (e.g., in edit mode)
  useEffect(() => {
    if (value && value !== selectedCompany?.id) {
      // First check if company is already in memory
      const cachedCompany = getCompanyById(value);
      if (cachedCompany) {
        setSelectedCompany(cachedCompany);
      } else {
        // Load from server if not in memory
        setIsLoadingSelected(true);
        fetchCompanyById(value)
          .then((company) => {
            if (company) {
              setSelectedCompany(company);
            }
          })
          .catch((err) => {
            console.error('Failed to load selected company:', err);
          })
          .finally(() => {
            setIsLoadingSelected(false);
          });
      }
    } else if (!value) {
      setSelectedCompany(null);
    }
  }, [value, getCompanyById, fetchCompanyById, selectedCompany?.id]);

  // Search companies with debouncing
  const searchCompanies = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setCompanies([]);
        return;
      }

      setIsLoadingCompanies(true);
      try {
        const { accessToken, tenant } = resolveAuth();
        
        // Build search request with filters
        const searchRequest = {
          searchText: query.trim(),
          searchFields: ['name', 'code', 'email', 'id'], // Search in name, code, email, and id
          filters: {
            and: {
              isActive: true, // Only show active companies
            },
          },
        };

        // Call API directly to get search results
        const result = await apiSearchCompanies(
          searchRequest,
          0,
          20,
          tenant ?? '',
          accessToken ?? undefined
        );

        if (result.success && result.data) {
          const content = (result.data as any)?.content || [];
          setCompanies(content.filter((c: any) => c && c.id));
        } else {
          setCompanies([]);
        }
      } catch (error) {
        console.error('Error searching companies:', error);
        setCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    },
    []
  );

  // Debounced search handler
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      searchCompanies(query);
    }, 300); // 300ms debounce
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle company selection
  const handleSelect = (company: CompanyModel) => {
    setSelectedCompany(company);
    onChange(company.id);
    setOpen(false);
    setSearchQuery('');
    setCompanies([]);
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
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoadingSelected}
            className={cn(
              'w-full justify-between h-8 text-sm',
              !selectedCompany && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            {isLoadingSelected ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading company...
              </span>
            ) : selectedCompany ? (
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
              placeholder="Type to search companies (min 2 chars)..."
              value={searchQuery}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {isLoadingCompanies ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="ml-2 text-sm text-muted-foreground">Searching companies...</span>
                </div>
              ) : companies.length === 0 && searchQuery.trim().length >= 2 ? (
                <CommandEmpty>No companies found.</CommandEmpty>
              ) : companies.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              ) : (
                <CommandGroup heading="Companies">
                  {companies.map((company) => {
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
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
