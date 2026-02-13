/**
 * Other Intimation View Modal Component
 * Displays non-travel intimation details with description
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Building2, Clock, 
  FileText, Edit, X, DollarSign, Calendar, Package, Copy, Check
} from 'lucide-react';
import { Intimation } from '../types/intimation.types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface OtherIntimationViewModalProps {
  intimation: Intimation | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (intimation: Intimation) => void;
  onAcknowledge?: (intimation: Intimation) => void;
  onCancel?: (intimation: Intimation) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'acknowledged':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function OtherIntimationViewModal({ 
  intimation, 
  open, 
  onClose,
  onEdit,
  onAcknowledge,
  onCancel
}: OtherIntimationViewModalProps) {
  if (!intimation) return null;

  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const InfoField = ({ icon: Icon, label, value, copyable = false, copyText }: { 
    icon: any; 
    label: string; 
    value: string | React.ReactNode;
    copyable?: boolean;
    copyText?: string;
  }) => (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="flex items-start gap-1.5">
          <p className="text-sm font-medium break-words">{value}</p>
          {copyable && copyText && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 flex-shrink-0"
              onClick={() => handleCopy(copyText, label)}
              title={`Copy ${label.toLowerCase()}`}
            >
              {copiedField === label ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden" hideClose>
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-xl">{intimation.intimationNumber}</DialogTitle>
                <Badge className={getStatusColor(intimation.status)}>
                  {getStatusLabel(intimation.status)}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <Package className="h-3 w-3 mr-1" />
                  Other
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {intimation.description}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Employee Information */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee Information
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <InfoField 
                  icon={User} 
                  label="Name" 
                  value={intimation.employeeName} 
                />
                <InfoField 
                  icon={Building2} 
                  label="Employee ID" 
                  value={intimation.employeeId}
                  copyable
                  copyText={intimation.employeeId}
                />
                <InfoField 
                  icon={Building2} 
                  label="Department" 
                  value={intimation.department} 
                />
                <InfoField 
                  icon={Mail} 
                  label="Email" 
                  value={intimation.employeeEmail}
                  copyable
                  copyText={intimation.employeeEmail}
                />
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <div className="p-4 rounded-lg border-2 border-primary/10 bg-primary/5">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {intimation.description}
                </p>
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            {intimation.estimatedTotalCost && intimation.estimatedTotalCost > 0 && (
              <>
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Information
                  </h3>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Estimated Total Cost</p>
                      <p className="text-2xl font-bold text-primary">
                        ${intimation.estimatedTotalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Description */}
            {intimation.description && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </h3>
                  <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed italic">
                      "{intimation.description}"
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Purpose/Category */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Intimation Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    Other Expense
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(intimation.status)}>
                    {getStatusLabel(intimation.status)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dates */}
            <Separator />
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Important Dates
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <InfoField 
                  icon={Calendar} 
                  label="Created At" 
                  value={format(new Date(intimation.createdAt), 'MMM dd, yyyy hh:mm a')}
                />
                {intimation.submittedAt && (
                  <InfoField 
                    icon={Calendar} 
                    label="Submitted At" 
                    value={format(new Date(intimation.submittedAt), 'MMM dd, yyyy hh:mm a')}
                  />
                )}
                {intimation.acknowledgedAt && (
                  <InfoField 
                    icon={Calendar} 
                    label="Acknowledged At" 
                    value={format(new Date(intimation.acknowledgedAt), 'MMM dd, yyyy hh:mm a')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-background">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(intimation)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={() => onCancel(intimation)} 
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Intimation
            </Button>
          )}
          {onAcknowledge && (
            <Button onClick={() => onAcknowledge(intimation)}>
              <Check className="h-4 w-4 mr-2" />
              Acknowledge
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
