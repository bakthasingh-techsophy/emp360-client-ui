/**
 * View Visitor Modal Component
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Mail, Phone, Building2, Clock, Calendar, 
  FileText, Edit, X, UserCheck, UserX, Copy
} from 'lucide-react';
import { Visitor } from '../types';
import { 
  VISITOR_STATUS_LABELS, 
  VISITOR_STATUS_COLORS, 
  PURPOSE_LABELS,
  REGISTRATION_TYPE_LABELS
} from '../constants';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ViewVisitorModalProps {
  visitor: Visitor | null;
  open: boolean;
  onClose: () => void;
  onEdit: (visitor: Visitor) => void;
  onCheckIn?: (visitor: Visitor) => void;
  onCheckOut?: (visitor: Visitor) => void;
}

export function ViewVisitorModal({ 
  visitor, 
  open, 
  onClose, 
  onEdit, 
  onCheckIn, 
  onCheckOut 
}: ViewVisitorModalProps) {
  if (!visitor) return null;

  const { toast } = useToast();

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );

  const InfoRowWithCopy = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast({
          title: "Copied!",
          description: `${label} copied to clipboard`,
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="flex items-start gap-1.5">
            <p className="text-sm font-medium break-words">{value}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 flex-shrink-0 -mt-0.5"
              onClick={handleCopy}
              title={`Copy ${label.toLowerCase()}`}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Check-in/out logic
  const hasCheckedIn = visitor.checkInTime !== null;
  const hasCheckedOut = visitor.checkOutTime !== null;
  const canCheckIn = (visitor.status === 'approved' || visitor.status === 'pending') && !hasCheckedIn;
  const canCheckOut = hasCheckedIn && !hasCheckedOut;
  const canEdit = !hasCheckedIn;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0 flex flex-col" hideClose>
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {visitor.photoUrl && <AvatarImage src={visitor.photoUrl} alt={visitor.name} />}
                <AvatarFallback className="text-lg">{getInitials(visitor.name)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{visitor.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={VISITOR_STATUS_COLORS[visitor.status]}>
                    {VISITOR_STATUS_LABELS[visitor.status]}
                  </Badge>
                  <Badge variant="outline">
                    {REGISTRATION_TYPE_LABELS[visitor.registrationType]}
                  </Badge>
                </div>
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
            {/* Basic Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-2">
                <InfoRowWithCopy icon={Mail} label="Email" value={visitor.email} />
                <InfoRowWithCopy icon={Phone} label="Phone" value={visitor.phone} />
                {visitor.company && (
                  <InfoRow icon={Building2} label="Company" value={visitor.company} />
                )}
              </div>
            </div>

            <Separator />

            {/* Visit Details */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Visit Details
              </h3>
              <div className="space-y-2">
                <InfoRow 
                  icon={FileText} 
                  label="Purpose" 
                  value={PURPOSE_LABELS[visitor.purpose]} 
                />
                {visitor.hostEmployeeName && (
                  <InfoRow 
                    icon={User} 
                    label="Host Employee" 
                    value={
                      <div className="space-y-1">
                        <div>{visitor.hostEmployeeName}</div>
                        {visitor.hostEmployeeEmail && (
                          <div className="text-xs text-muted-foreground">{visitor.hostEmployeeEmail}</div>
                        )}
                        {visitor.hostDepartment && (
                          <div className="text-xs text-muted-foreground">{visitor.hostDepartment}</div>
                        )}
                      </div>
                    } 
                  />
                )}
                {visitor.notes && (
                  <InfoRow 
                    icon={FileText} 
                    label="Notes" 
                    value={visitor.notes} 
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Schedule & Check-in/out */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </h3>
              <div className="space-y-2">
                <InfoRow 
                  icon={Calendar} 
                  label="Expected Arrival" 
                  value={`${format(new Date(visitor.expectedArrivalDate), 'MMM dd, yyyy')} at ${visitor.expectedArrivalTime}`}
                />
                {visitor.expectedDepartureTime && (
                  <InfoRow 
                    icon={Clock} 
                    label="Expected Departure" 
                    value={visitor.expectedDepartureTime} 
                  />
                )}
                {visitor.checkInTime && (
                  <InfoRow 
                    icon={UserCheck} 
                    label="Check-in Time" 
                    value={
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {format(new Date(visitor.checkInTime), 'MMM dd, yyyy hh:mm a')}
                      </span>
                    }
                  />
                )}
                {visitor.checkOutTime && (
                  <InfoRow 
                    icon={UserX} 
                    label="Check-out Time" 
                    value={
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">
                        {format(new Date(visitor.checkOutTime), 'MMM dd, yyyy hh:mm a')}
                      </span>
                    }
                  />
                )}
              </div>
            </div>

            {/* Metadata */}
            {(visitor.createdByName || visitor.createdAt) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Registration Information
                  </h3>
                  <div className="space-y-2">
                    {visitor.createdByName && (
                      <InfoRow 
                        icon={User} 
                        label="Registered By" 
                        value={visitor.createdByName} 
                      />
                    )}
                    {visitor.createdAt && (
                      <InfoRow 
                        icon={Clock} 
                        label="Registered On" 
                        value={format(new Date(visitor.createdAt), 'MMM dd, yyyy hh:mm a')} 
                      />
                    )}
                    {visitor.updatedAt && (
                      <InfoRow 
                        icon={Clock} 
                        label="Last Updated" 
                        value={format(new Date(visitor.updatedAt), 'MMM dd, yyyy hh:mm a')} 
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-background">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canEdit && (
            <Button onClick={() => onEdit(visitor)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canCheckIn && onCheckIn && (
            <Button onClick={() => onCheckIn(visitor)}>
              <UserCheck className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
          {canCheckOut && onCheckOut && (
            <Button onClick={() => onCheckOut(visitor)}>
              <UserX className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
