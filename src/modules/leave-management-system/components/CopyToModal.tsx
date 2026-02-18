/**
 * Copy To Modal
 * Modal for copying leave configuration to other companies
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompany } from '@/contexts/CompanyContext';
import { X, Building2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CompanyModel } from '@/types/company';

interface CopyToModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCompanyId?: string;
  onCopyToAll: () => void;
  onCopyToSelected: (companyIds: string[]) => void;
  leaveTypeName?: string;
}

export function CopyToModal({
  open,
  onOpenChange,
  currentCompanyId,
  onCopyToAll,
  onCopyToSelected,
  leaveTypeName = 'Leave Type',
}: CopyToModalProps) {
  const { companies } = useCompany();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedCompanyIds([]);
      setSearchQuery('');
    }
  }, [open]);

  // Filter companies (exclude current company)
  const availableCompanies = companies.filter(
    (company) => company.id !== currentCompanyId
  );

  // Filter companies based on search
  const filteredCompanies = availableCompanies.filter((company) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(query) ||
      company.code?.toLowerCase().includes(query) ||
      company.id?.toLowerCase().includes(query)
    );
  });

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleRemoveCompany = (companyId: string) => {
    setSelectedCompanyIds((prev) => prev.filter((id) => id !== companyId));
  };

  const handleCopyToAll = () => {
    onCopyToAll();
    onOpenChange(false);
  };

  const handleCopyToSelected = () => {
    if (selectedCompanyIds.length > 0) {
      onCopyToSelected(selectedCompanyIds);
      onOpenChange(false);
    }
  };

  const getCompanyById = (id: string): CompanyModel | undefined => {
    return companies.find((c) => c.id === id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Copy to Companies</DialogTitle>
          <DialogDescription>
            Copy <strong>{leaveTypeName}</strong> configuration to other companies
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Company Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Companies</label>
            <Command className="border rounded-lg">
              <CommandInput
                placeholder="Search companies..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No companies found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {filteredCompanies.map((company) => {
                      const isSelected = selectedCompanyIds.includes(company.id);
                      return (
                        <CommandItem
                          key={company.id}
                          onSelect={() => handleCompanyToggle(company.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">{company.name}</span>
                                {company.code && (
                                  <span className="text-xs text-muted-foreground">
                                    {company.code}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Badge variant="secondary" className="ml-2">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>

          {/* Selected Companies List */}
          {selectedCompanyIds.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selected Companies ({selectedCompanyIds.length})
              </label>
              <ScrollArea className="h-[120px] border rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {selectedCompanyIds.map((companyId) => {
                    const company = getCompanyById(companyId);
                    if (!company) return null;
                    return (
                      <Badge
                        key={companyId}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        <Building2 className="h-3 w-3" />
                        {company.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCompany(companyId)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopyToAll}
          >
            Copy to All Companies
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleCopyToSelected}
            disabled={selectedCompanyIds.length === 0}
          >
            Copy to Selected ({selectedCompanyIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
