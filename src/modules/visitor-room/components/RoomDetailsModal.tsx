/**
 * Room Details Modal
 * Shows room details, blocked dates preview, and quick book option
 */

import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Building2,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';
import { Room, RoomBooking } from '../types';
import {
  ROOM_STATUS_COLORS,
  ROOM_STATUS_LABELS,
  ROOM_TYPE_LABELS,
  AMENITY_ICONS,
} from '../constants';
import { getUpcomingBlockedDates, getRoomCurrentStatus } from '../utils/availability';
import { format } from 'date-fns';

interface RoomDetailsModalProps {
  room: Room | null;
  bookings: RoomBooking[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomDetailsModal({
  room,
  bookings,
  open,
  onOpenChange,
}: RoomDetailsModalProps) {
  const navigate = useNavigate();

  if (!room) return null;

  // Get dynamic room status
  const currentStatus = getRoomCurrentStatus(room, bookings);
  const displayStatus = currentStatus === 'upcoming' ? 'available' : currentStatus;
  
  // Get upcoming blocked dates (limit to 5)
  const upcomingBlocked = getUpcomingBlockedDates(room, bookings, 5);

  // Get all amenities
  const amenities = Object.entries(room.amenities)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  const handleBookRoom = () => {
    onOpenChange(false);
    // Navigate to booking page with room ID
    navigate(`/room-booking-form?roomId=${room.id}`);
  };

  const handleViewFullCalendar = () => {
    onOpenChange(false);
    navigate(`/room-booking-form?roomId=${room.id}&view=calendar`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{room.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {room.description || 'No description available'}
              </DialogDescription>
            </div>
            <Badge className={`${ROOM_STATUS_COLORS[displayStatus]} ml-4`}>
              {currentStatus === 'upcoming' ? 'Booked Soon' : ROOM_STATUS_LABELS[displayStatus]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Room Image */}
          {room.imageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="font-medium">{room.capacity} people</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{ROOM_TYPE_LABELS[room.type]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Floor</p>
                <p className="font-medium">{room.floor}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Hours</p>
                <p className="font-medium text-sm">
                  {room.availableFrom} - {room.availableTo}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-lg">{AMENITY_ICONS[amenity as keyof typeof AMENITY_ICONS]}</span>
                    <span className="capitalize">{amenity.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Upcoming Blocked Dates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Upcoming Bookings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewFullCalendar}
                className="text-xs"
              >
                View Full Calendar
              </Button>
            </div>

            {upcomingBlocked.length === 0 ? (
              <Card className="p-4 bg-muted/30 border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  No upcoming bookings - room is available!
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {upcomingBlocked.map(({ date, bookingsCount }) => (
                  <Card key={date} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bookingsCount} {bookingsCount === 1 ? 'booking' : 'bookings'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Booked
                      </Badge>
                    </div>
                  </Card>
                ))}
                {upcomingBlocked.length >= 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Showing first 5 dates • View full calendar for more
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Location Details */}
          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-sm text-muted-foreground">
              {room.location}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleBookRoom}
              className="flex-1"
              disabled={room.status === 'maintenance' || room.status === 'inactive'}
            >
              Book This Room
            </Button>
            <Button
              variant="outline"
              onClick={handleViewFullCalendar}
              className="flex-1"
            >
              View Availability
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
