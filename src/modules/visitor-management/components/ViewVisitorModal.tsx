/**
 * View Visitor Modal Component
 * Displays comprehensive visitor information in a dialog
 * Structured following EmployeeViewModal pattern
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Mail, Phone, Building2, Clock, Calendar, 
  FileText, Edit, X, UserCheck, UserX, Copy, Briefcase
} from 'lucide-react';
import { VisitorSnapshot } from '../types';
import { 
  VISITOR_STATUS_LABELS, 
  VISITOR_STATUS_COLORS, 
  PURPOSE_LABELS
} from '../constants';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ViewVisitorModalProps {
  visitor: VisitorSnapshot | null;
  open: boolean;
  onClose: () => void;
  onEdit: (visitor: VisitorSnapshot) => void;
  onCheckIn?: (visitor: VisitorSnapshot) => void;
  onCheckOut?: (visitor: VisitorSnapshot) => void;
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

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Info row component
  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );

  // Info row with copy button
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
  const canCheckIn = (visitor.visitorStatus === 'approved' || visitor.visitorStatus === 'pending') && !hasCheckedIn;
  const canCheckOut = hasCheckedIn && !hasCheckedOut;
  const canEdit = !hasCheckedIn;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 flex flex-col" hideClose>
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-16 w-16 ring-2 ring-muted">
                {visitor.photoUrl && <AvatarImage src={visitor.photoUrl} alt={visitor.visitorName} />}
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {getInitials(visitor.visitorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-xl mb-1">{visitor.visitorName}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={VISITOR_STATUS_COLORS[visitor.visitorStatus]}>
                    {VISITOR_STATUS_LABELS[visitor.visitorStatus]}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    {PURPOSE_LABELS[visitor.purpose]}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Contact Information - Light background grid */}
            <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRowWithCopy icon={Mail} label="Email Address" value={visitor.visitorEmail} />
                <InfoRowWithCopy icon={Phone} label="Phone Number" value={visitor.visitorPhone} />
                {visitor.companyId && (
                  <InfoRow icon={Building2} label="Company" value={visitor.companyId} />
                )}
              </div>
            </div>

            <Separator />

            {/* Visit Details */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Visit Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow 
                  icon={FileText} 
                  label="Purpose" 
                  value={PURPOSE_LABELS[visitor.purpose]} 
                />
                {visitor.notes && (
                  <InfoRow 
                    icon={FileText} 
                    label="Notes" 
                    value={visitor.notes} 
                  />
                )}
                <InfoRow 
                  icon={Calendar} 
                  label="Expected Arrival" 
                  value={`${format(new Date(visitor.expectedArrivalDate), 'MMM dd, yyyy')} at ${visitor.expectedArrivalTime}`}
                />
              </div>
            </div>

            <Separator />

            {/* Host Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Host Employee
              </h3>
              <div className="bg-muted/20 dark:bg-muted/5 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <InfoRow 
                    icon={User} 
                    label="Name" 
                    value={`${visitor.firstName} ${visitor.lastName}`} 
                  />
                  <InfoRowWithCopy icon={Mail} label="Email" value={visitor.email} />
                  <InfoRowWithCopy icon={Phone} label="Phone" value={visitor.phone} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Check-in/Check-out Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Check In/Out Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {visitor.checkInTime ? (
                  <InfoRow 
                    icon={UserCheck} 
                    label="Checked In" 
                    value={
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {format(new Date(visitor.checkInTime), 'MMM dd, yyyy hh:mm a')}
                      </span>
                    }
                  />
                ) : (
                  <InfoRow 
                    icon={UserCheck} 
                    label="Check-in Status" 
                    value={<span className="text-muted-foreground">Not checked in</span>}
                  />
                )}
                {visitor.checkOutTime ? (
                  <InfoRow 
                    icon={UserX} 
                    label="Checked Out" 
                    value={
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">
                        {format(new Date(visitor.checkOutTime), 'MMM dd, yyyy hh:mm a')}
                      </span>
                    }
                  />
                ) : (
                  <InfoRow 
                    icon={UserX} 
                    label="Check-out Status" 
                    value={<span className="text-muted-foreground">Not checked out</span>}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Registered on: {format(new Date(visitor.createdAt), 'MMM dd, yyyy hh:mm a')}
          </div>
          <div className="flex gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
