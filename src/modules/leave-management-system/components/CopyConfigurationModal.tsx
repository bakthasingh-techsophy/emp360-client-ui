/**
 * Copy Configuration Modal
 * Modal for selecting target companies to copy a configuration to
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CompanyDropdown } from '@/components/context-aware/CompanyDropdown';
import { useCompany } from '@/contexts/CompanyContext';
import { X } from 'lucide-react';
import { LeaveConfiguration } from '../types/leaveConfiguration.types';

interface CopyConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceConfiguration: LeaveConfiguration;
  onCopyToAllCompanies: () => void;
  onCopyToSelectedCompanies: (companyIds: string[]) => void;
  leaveTypeName?: string;
}

export function CopyConfigurationModal({
  open,
  onOpenChange,
  sourceConfiguration,
  onCopyToAllCompanies,
  onCopyToSelectedCompanies,
  leaveTypeName = 'Leave Type',
}: CopyConfigurationModalProps) {
  const { companies } = useCompany();
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Reset on modal open
  useEffect(() => {
    if (open) {
      setSelectedCompanies([]);
      setSelectedCompanyDetails([]);
    }
  }, [open]);

  const handleCompanySelect = (companyId: string) => {
    if (!selectedCompanies.includes(companyId)) {
      const newCompanies = [...selectedCompanies, companyId];
      setSelectedCompanies(newCompanies);
      // Get company name from context
      const company = companies?.find(c => c.id === companyId);
      setSelectedCompanyDetails([
        ...selectedCompanyDetails,
        { id: companyId, name: company?.name || companyId },
      ]);
    }
  };

  const handleRemoveCompany = (companyId: string) => {
    setSelectedCompanies(selectedCompanies.filter((id) => id !== companyId));
    setSelectedCompanyDetails(
      selectedCompanyDetails.filter((company) => company.id !== companyId)
    );
  };

  const handleCopyToAll = () => {
    onCopyToAllCompanies();
    onOpenChange(false);
  };

  const handleCopyToSelected = () => {
    onCopyToSelectedCompanies(selectedCompanies);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Copy Configuration</DialogTitle>
          <DialogDescription>
            Copy this {leaveTypeName} configuration to other companies
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Source Configuration Info */}
          <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
            <div>
              <strong>Source Company:</strong> {companies?.find(c => c.id === sourceConfiguration.companyId)?.name || sourceConfiguration.companyId}
            </div>
            <div>
              <strong>Category:</strong> {sourceConfiguration.category}
            </div>
            <div>
              <strong>Configuration ID:</strong> {sourceConfiguration.id}
            </div>
          </div>

          {/* Company Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Target Companies</label>
            <CompanyDropdown
              value=""
              onChange={handleCompanySelect}
              placeholder="Search and select companies..."
              showRefresh={true}
            />
          </div>

          {/* Selected Companies List */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Target Companies ({selectedCompanyDetails.length})
            </label>
            <ScrollArea className="border rounded-md p-4 h-[200px]">
              {selectedCompanyDetails.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No companies selected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCompanyDetails.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between bg-muted p-2 rounded-md"
                    >
                      <Badge variant="outline" className="text-xs">
                        {company.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveCompany(company.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button
            variant="destructive"
            onClick={handleCopyToAll}
            className="flex-1"
          >
            Copy To All Companies
          </Button>
          <Button
            onClick={handleCopyToSelected}
            disabled={selectedCompanyDetails.length === 0}
            className="flex-1"
          >
            Copy To Selected ({selectedCompanyDetails.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
