/**
 * Holiday Company Modal
 * Modal for selecting/managing companies for a holiday
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { CompanyModel } from '@/types/company';

interface HolidayCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedCompanyIds: string[]) => void;
  selectedCompanyIds: string[];
  companies: CompanyModel[];
  isLoading?: boolean;
}

export const HolidayCompanyModal: React.FC<HolidayCompanyModalProps> = ({
  isOpen,
  onClose,
  onApply,
  selectedCompanyIds,
  companies,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedCompanyIds);

  // Filter and search companies - debounced via useMemo
  const filteredCompanies = useMemo(() => {
    const activeCompanies = companies.filter(c => c.isActive !== false);
    
    if (!searchQuery.trim()) {
      return activeCompanies;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return activeCompanies.filter(company =>
      company.name.toLowerCase().includes(lowerQuery) ||
      (company.description?.toLowerCase().includes(lowerQuery) ?? false)
    );
  }, [companies, searchQuery]);

  const handleToggleCompany = (companyId: string) => {
    setSelectedIds(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleApply = () => {
    onApply(selectedIds);
    onClose();
  };

  const handleClose = () => {
    // Reset selections on close without applying
    setSelectedIds(selectedCompanyIds);
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Companies</DialogTitle>
          <DialogDescription>
            Select the companies this holiday applies to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>

          {/* Companies List */}
          <ScrollArea className="h-[300px] border rounded-md p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Loading companies...</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  {companies.length === 0 ? 'No companies available' : 'No companies found matching your search'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.map(company => (
                  <label
                    key={company.id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedIds.includes(company.id)}
                      onCheckedChange={() => handleToggleCompany(company.id)}
                      className="cursor-pointer mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{company.name}</div>
                      {company.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {company.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selection Summary */}
          <div className="text-sm text-muted-foreground">
            {selectedIds.length === 0
              ? 'No companies selected'
              : `${selectedIds.length} company${selectedIds.length !== 1 ? 'ies' : ''} selected`}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isLoading}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
