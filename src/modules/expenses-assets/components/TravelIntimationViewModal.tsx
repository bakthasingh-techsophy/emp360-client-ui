/**
 * Travel Intimation View Modal Component
 * Displays travel intimation details with journey segments
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Building2, Clock, 
  FileText, Edit, X, DollarSign, MapPin, Calendar, Plane, Copy, Check, ArrowRight
} from 'lucide-react';
import { Intimation } from '../types/intimation.types';
import { Timeline } from '@/components/timeline/Timeline';
import { TimelineItem } from '@/components/timeline/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface TravelIntimationViewModalProps {
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

export function TravelIntimationViewModal({ 
  intimation, 
  open, 
  onClose,
  onEdit,
  onAcknowledge,
  onCancel
}: TravelIntimationViewModalProps) {
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

  const totalEstimatedCost = intimation.journeySegments?.reduce(
    (sum, segment) => sum + segment.estimatedCost, 
    0
  ) || 0;

  // Convert journey segments to timeline items
  const timelineItems: TimelineItem[] = intimation.journeySegments?.map((segment, index) => ({
    id: segment.id,
    type: 'journey-segment',
    timestamp: new Date(segment.fromDate),
    data: {
      ...segment,
      segmentNumber: index + 1,
    },
  })) || [];

  // Timeline configuration
  const timelineTypeConfigs = [
    {
      type: 'journey-segment',
      renderer: (item: TimelineItem) => (
        <div className="rounded-lg border bg-card">
          {/* Card Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {item.data.segmentNumber}
              </div>
              <Badge variant="secondary" className="text-xs capitalize">
                {item.data.modeOfTransport.replace('_', ' ').replace('/', ' / ')}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {item.data.estimatedCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Journey Content */}
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* From Location */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">From</span>
                </div>
                <p className="text-sm font-semibold">{item.data.from}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.data.fromDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

              {/* To Location */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">To</span>
                </div>
                <p className="text-sm font-semibold">{item.data.to}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.data.toDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {item.data.notes && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-start gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground italic">
                    "{item.data.notes}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      icon: { component: MapPin },
      color: { 
        dot: 'bg-primary/10', 
        iconColor: 'text-primary' 
      }
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden" hideClose>
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-xl">{intimation.intimationNumber}</DialogTitle>
                <Badge className={getStatusColor(intimation.status)}>
                  {getStatusLabel(intimation.status)}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Plane className="h-3 w-3 mr-1" />
                  Travel
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {intimation.journeySegments && intimation.journeySegments.length > 0 && (
                  <span>
                    {intimation.journeySegments.length === 1 
                      ? `${intimation.journeySegments[0].from} → ${intimation.journeySegments[0].to}`
                      : `${intimation.journeySegments[0].from} → ... → ${intimation.journeySegments[intimation.journeySegments.length - 1].to} (${intimation.journeySegments.length} segments)`
                    }
                  </span>
                )}
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

            {/* Journey Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Journey Details
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {intimation.journeySegments?.length || 0} {intimation.journeySegments?.length === 1 ? 'Segment' : 'Segments'}
                </Badge>
              </div>
              <Timeline
                items={timelineItems}
                typeConfigs={timelineTypeConfigs}
                autoSort={false}
                emptyMessage="No journey segments found"
                emptyIcon={MapPin}
              />
            </div>

            <Separator />

            {/* Financial Summary */}
            <div className="p-4 rounded-lg bg-primary/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Summary
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <InfoField 
                  icon={DollarSign} 
                  label="Total Estimated Cost" 
                  value={
                    <span className="text-lg font-bold text-primary">
                      ${totalEstimatedCost.toLocaleString()}
                    </span>
                  }
                />
                <InfoField 
                  icon={MapPin} 
                  label="Number of Segments" 
                  value={`${intimation.journeySegments?.length || 0} ${intimation.journeySegments?.length === 1 ? 'segment' : 'segments'}`}
                />
              </div>
            </div>

            {/* Additional Notes */}
            {intimation.additionalNotes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Additional Notes
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{intimation.additionalNotes}</p>
                </div>
              </>
            )}

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
