/**
 * View Booking Modal
 * Displays detailed information about a booking
 */

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, FileText } from 'lucide-react';

interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  bookedByName: string;
  bookedByEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

interface ViewBookingModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
}

export function ViewBookingModal({ open, onClose, booking }: ViewBookingModalProps) {
  const getStatusBadge = (status: Booking['status']) => {
    const variants: Record<Booking['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      rejected: { variant: 'secondary', label: 'Rejected' },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            {getStatusBadge(booking.status)}
          </div>

          {/* Room Information */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Room Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Room</span>
                <p className="font-medium">{booking.roomName}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Booking Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Date</span>
                <p className="font-medium">{format(new Date(booking.date), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Time</span>
                <p className="font-medium">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Attendees</span>
                <p className="font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {booking.attendees}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Recurrence</span>
                <p className="font-medium capitalize">{booking.recurrence}</p>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Purpose
            </h4>
            <p className="text-sm">{booking.purpose}</p>
          </div>

          {/* Booked By */}
          <div className="space-y-3">
            <h4 className="font-semibold">Booked By</h4>
            <div className="text-sm">
              <p className="font-medium">{booking.bookedByName}</p>
              <p className="text-muted-foreground">{booking.bookedByEmail}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span>Created</span>
                <p>{format(new Date(booking.createdAt), 'MMM dd, yyyy hh:mm a')}</p>
              </div>
              <div>
                <span>Updated</span>
                <p>{format(new Date(booking.updatedAt), 'MMM dd, yyyy hh:mm a')}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
