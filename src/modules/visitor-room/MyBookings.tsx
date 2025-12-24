/**
 * My Bookings Page - User Dashboard
 * Shows user's upcoming bookings, recent bookings, and quick actions
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  CheckCircle2,
  TrendingUp,
  History,
  CalendarDays,
} from 'lucide-react';
import { mockRooms, mockBookings } from './mockData';
import { RoomBooking, Room } from './types';
import { format, isToday, isTomorrow, isFuture, isPast } from 'date-fns';

export function MyBookings() {
  const navigate = useNavigate();

  // Mock user ID - in real app, get from auth context
  const currentUserId = 'user-001';

  // Filter bookings for current user
  const myBookings = mockBookings.filter((b) => b.bookedBy === currentUserId);
  
  const upcomingBookings = myBookings
    .filter((b) => isFuture(new Date(b.startDateTime)) || isToday(new Date(b.startDateTime)))
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const pastBookings = myBookings
    .filter((b) => isPast(new Date(b.endDateTime)) && !isToday(new Date(b.startDateTime)))
    .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());

  // Get popular rooms (mock - based on total bookings)
  const popularRooms = [...mockRooms]
    .sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0))
    .slice(0, 3);

  // Stats
  const stats = {
    upcoming: upcomingBookings.length,
    total: myBookings.length,
    thisWeek: upcomingBookings.filter((b) => {
      const bookingDate = new Date(b.startDateTime);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return bookingDate <= weekFromNow;
    }).length,
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const BookingCard = ({ booking }: { booking: RoomBooking }) => {
    const room = mockRooms.find((r) => r.id === booking.roomId);
    
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{booking.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{booking.roomName}</p>
          </div>
          <Badge className={getBookingStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{getDateLabel(booking.startDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(booking.startDateTime), 'HH:mm')} -{' '}
              {format(new Date(booking.endDateTime), 'HH:mm')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{room?.floor || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{booking.numberOfAttendees} attendees</span>
          </div>
        </div>

        {booking.recurrence !== 'none' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            <span>Recurring: {booking.recurrence}</span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/room-management/booking-form?roomId=${booking.roomId}&date=${booking.date}`)}
          >
            View Details
          </Button>
          {booking.status === 'confirmed' && isFuture(new Date(booking.startDateTime)) && (
            <Button variant="ghost" size="sm" className="text-destructive">
              Cancel
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const PopularRoomCard = ({ room }: { room: Room }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
      <div className="aspect-video relative overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : room.imageUrl ? (
          <img
            src={room.imageUrl}
            alt={room.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">{room.name}</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{room.capacity} people</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{room.floor}</span>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/room-management/booking-form?roomId=${room.id}`)}
          className="w-full"
          size="sm"
        >
          Book Now
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-muted-foreground">
                Manage your room bookings and discover available spaces
              </p>
            </div>
            <Button onClick={() => navigate('/room-management/browse')} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Book a Room
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-3xl font-bold mt-1">{stats.upcoming}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-3xl font-bold mt-1">{stats.thisWeek}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Bookings Tabs */}
            <Card className="p-6">
              <Tabs defaultValue="upcoming" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past ({pastBookings.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Upcoming Bookings</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by booking a room for your next meeting
                      </p>
                      <Button onClick={() => navigate('/room-browse')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Book a Room
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                  {pastBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Past Bookings</h3>
                      <p className="text-muted-foreground">
                        Your booking history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Popular Rooms */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Rooms
              </h3>
              <div className="space-y-4">
                {popularRooms.map((room) => (
                  <PopularRoomCard key={room.id} room={room} />
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/room-management/browse')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Rooms
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/room-management/browse?filter=available')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Available Now
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
