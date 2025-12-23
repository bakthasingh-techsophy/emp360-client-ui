/**
 * View Visitor Modal Component
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, Building2, Clock, Calendar, 
  FileText, Car, Shield, Edit, X 
} from 'lucide-react';
import { Visitor } from '../types';
import { 
  VISITOR_STATUS_LABELS, 
  VISITOR_STATUS_COLORS, 
  PURPOSE_LABELS 
} from '../constants';
import { format } from 'date-fns';

interface ViewVisitorModalProps {
  visitor: Visitor | null;
  open: boolean;
  onClose: () => void;
  onEdit: (visitor: Visitor) => void;
}

export function ViewVisitorModal({ visitor, open, onClose, onEdit }: ViewVisitorModalProps) {
  if (!visitor) return null;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );

  const formatDateTime = (date: string, time?: string) => {
    try {
      const dateObj = new Date(date);
      const formattedDate = format(dateObj, 'MMM dd, yyyy');
      return time ? `${formattedDate} at ${time}` : formattedDate;
    } catch {
      return date;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Visitor Details</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Badge: {visitor.badgeNumber || 'Not assigned'}
              </p>
            </div>
            <Badge className={VISITOR_STATUS_COLORS[visitor.status]}>
              {VISITOR_STATUS_LABELS[visitor.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="space-y-2">
              <InfoRow icon={User} label="Name" value={visitor.name} />
              <InfoRow icon={Mail} label="Email" value={visitor.email} />
              <InfoRow icon={Phone} label="Phone" value={visitor.phone} />
              {visitor.company && (
                <InfoRow icon={Building2} label="Company" value={visitor.company} />
              )}
              {visitor.idType && visitor.idNumber && (
                <InfoRow 
                  icon={FileText} 
                  label="ID Document" 
                  value={`${visitor.idType.replace('_', ' ').toUpperCase()}: ${visitor.idNumber}`} 
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Visit Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Visit Details
            </h3>
            <div className="space-y-2">
              <InfoRow 
                icon={FileText} 
                label="Purpose" 
                value={PURPOSE_LABELS[visitor.purpose]} 
              />
              {visitor.purposeDetails && (
                <InfoRow 
                  icon={FileText} 
                  label="Details" 
                  value={visitor.purposeDetails} 
                />
              )}
              <InfoRow 
                icon={User} 
                label="Host" 
                value={
                  <div>
                    <p>{visitor.hostEmployeeName}</p>
                    <p className="text-xs text-muted-foreground">{visitor.hostEmployeeEmail}</p>
                    {visitor.hostDepartment && (
                      <p className="text-xs text-muted-foreground">{visitor.hostDepartment}</p>
                    )}
                  </div>
                } 
              />
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </h3>
            <div className="space-y-2">
              <InfoRow 
                icon={Calendar} 
                label="Expected Arrival" 
                value={formatDateTime(visitor.expectedArrivalDate, visitor.expectedArrivalTime)} 
              />
              {visitor.expectedDepartureTime && (
                <InfoRow 
                  icon={Clock} 
                  label="Expected Departure" 
                  value={visitor.expectedDepartureTime} 
                />
              )}
              {visitor.actualCheckInTime && (
                <InfoRow 
                  icon={Clock} 
                  label="Actual Check-in" 
                  value={format(new Date(visitor.actualCheckInTime), 'MMM dd, yyyy HH:mm')} 
                />
              )}
              {visitor.actualCheckOutTime && (
                <InfoRow 
                  icon={Clock} 
                  label="Actual Check-out" 
                  value={format(new Date(visitor.actualCheckOutTime), 'MMM dd, yyyy HH:mm')} 
                />
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(visitor.vehicleNumber || visitor.notes || visitor.escortRequired) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Information
                </h3>
                <div className="space-y-2">
                  {visitor.vehicleNumber && (
                    <InfoRow icon={Car} label="Vehicle Number" value={visitor.vehicleNumber} />
                  )}
                  {visitor.escortRequired && (
                    <InfoRow 
                      icon={Shield} 
                      label="Escort Required" 
                      value={<Badge variant="outline">Yes</Badge>} 
                    />
                  )}
                  {visitor.notes && (
                    <InfoRow icon={FileText} label="Notes" value={visitor.notes} />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Approval Status */}
          {visitor.approvalStatus && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Approval Status</h3>
                <div className="space-y-2">
                  <InfoRow 
                    icon={User} 
                    label="Status" 
                    value={
                      <Badge className={VISITOR_STATUS_COLORS[visitor.status]}>
                        {visitor.approvalStatus.toUpperCase()}
                      </Badge>
                    } 
                  />
                  {visitor.approvedByName && (
                    <InfoRow 
                      icon={User} 
                      label="Approved/Rejected By" 
                      value={visitor.approvedByName} 
                    />
                  )}
                  {visitor.approvalDate && (
                    <InfoRow 
                      icon={Clock} 
                      label="Date" 
                      value={format(new Date(visitor.approvalDate), 'MMM dd, yyyy HH:mm')} 
                    />
                  )}
                  {visitor.rejectionReason && (
                    <InfoRow 
                      icon={FileText} 
                      label="Rejection Reason" 
                      value={visitor.rejectionReason} 
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button onClick={() => onEdit(visitor)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
