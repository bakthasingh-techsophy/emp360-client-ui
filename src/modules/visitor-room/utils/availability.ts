/**
 * Room Availability Utilities
 * Functions to check room availability and generate blocked dates
 */

import { Room, RoomBooking, TimeSlot } from '../types';
import { format, isWithinInterval } from 'date-fns';

/**
 * Check if a room is available for a specific date and time range
 */
export function isRoomAvailable(
  room: Room,
  date: Date,
  startTime: string, // HH:mm format
  endTime: string, // HH:mm format
  bookings: RoomBooking[],
  excludeBookingId?: string
): boolean {
  // Check if the day is available
  const dayOfWeek = date.getDay();
  if (!room.availableDays.includes(dayOfWeek)) {
    return false;
  }

  // Check if within room's operating hours
  if (startTime < room.availableFrom || endTime > room.availableTo) {
    return false;
  }

  // Check for conflicting bookings
  const dateStr = format(date, 'yyyy-MM-dd');
  const roomBookings = bookings.filter(
    (b) => 
      b.roomId === room.id && 
      b.date === dateStr && 
      b.status !== 'cancelled' && 
      b.status !== 'no-show' &&
      b.id !== excludeBookingId
  );

  for (const booking of roomBookings) {
    const bookingStart = format(new Date(booking.startDateTime), 'HH:mm');
    const bookingEnd = format(new Date(booking.endDateTime), 'HH:mm');

    // Check for time overlap
    if (
      (startTime >= bookingStart && startTime < bookingEnd) ||
      (endTime > bookingStart && endTime <= bookingEnd) ||
      (startTime <= bookingStart && endTime >= bookingEnd)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Get blocked/unavailable dates for a room in a given month
 * Returns dates that have at least one booking (fully or partially booked)
 */
export function getBlockedDatesInMonth(
  room: Room,
  year: number,
  month: number, // 0-indexed
  bookings: RoomBooking[]
): Date[] {
  const blockedDates: Set<string> = new Set();
  const roomBookings = bookings.filter(
    (b) => b.roomId === room.id && (b.status === 'confirmed' || b.status === 'pending')
  );

  roomBookings.forEach((booking) => {
    const bookingDate = new Date(booking.startDateTime);
    if (bookingDate.getMonth() === month && bookingDate.getFullYear() === year) {
      const dateStr = format(bookingDate, 'yyyy-MM-dd');
      blockedDates.add(dateStr);
    }
  });

  return Array.from(blockedDates).map((d) => new Date(d));
}

/**
 * Get upcoming blocked dates (next N dates with bookings)
 */
export function getUpcomingBlockedDates(
  room: Room,
  bookings: RoomBooking[],
  limit: number = 3
): Array<{ date: string; bookingsCount: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const roomBookings = bookings
    .filter(
      (b) =>
        b.roomId === room.id &&
        (b.status === 'confirmed' || b.status === 'pending') &&
        new Date(b.startDateTime) >= today
    )
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  // Group by date
  const dateMap = new Map<string, number>();
  roomBookings.forEach((booking) => {
    const dateStr = format(new Date(booking.startDateTime), 'yyyy-MM-dd');
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  });

  return Array.from(dateMap.entries())
    .slice(0, limit)
    .map(([date, count]) => ({ date, bookingsCount: count }));
}

/**
 * Generate time slots for a specific date showing availability
 */
export function generateTimeSlots(
  room: Room,
  date: Date,
  bookings: RoomBooking[],
  slotDuration: number = 30 // minutes
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = format(date, 'yyyy-MM-dd');

  // Check if day is available
  const dayOfWeek = date.getDay();
  if (!room.availableDays.includes(dayOfWeek)) {
    return slots;
  }

  // Parse available hours
  const [startHour, startMin] = room.availableFrom.split(':').map(Number);
  const [endHour, endMin] = room.availableTo.split(':').map(Number);

  let currentTime = startHour * 60 + startMin; // minutes from midnight
  const endTime = endHour * 60 + endMin;

  // Get bookings for this date
  const dayBookings = bookings.filter(
    (b) =>
      b.roomId === room.id &&
      b.date === dateStr &&
      (b.status === 'confirmed' || b.status === 'pending')
  );

  while (currentTime < endTime) {
    const slotStart = `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;
    const nextTime = currentTime + slotDuration;
    const slotEnd = `${String(Math.floor(nextTime / 60)).padStart(2, '0')}:${String(nextTime % 60).padStart(2, '0')}`;

    // Check if slot overlaps with any booking
    let isAvailable = true;
    let conflictingBooking: RoomBooking | undefined;

    for (const booking of dayBookings) {
      const bookingStart = format(new Date(booking.startDateTime), 'HH:mm');
      const bookingEnd = format(new Date(booking.endDateTime), 'HH:mm');

      if (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      ) {
        isAvailable = false;
        conflictingBooking = booking;
        break;
      }
    }

    slots.push({
      start: slotStart,
      end: slotEnd,
      available: isAvailable,
      bookingId: conflictingBooking?.id,
      bookingTitle: conflictingBooking?.title,
    });

    currentTime = nextTime;
  }

  return slots;
}

/**
 * Get current room status based on real-time availability
 */
export function getRoomCurrentStatus(
  room: Room,
  bookings: RoomBooking[]
): 'available' | 'occupied' | 'upcoming' {
  // If room is in maintenance or inactive, respect that
  if (room.status === 'maintenance' || room.status === 'inactive') {
    return room.status as any;
  }

  const now = new Date();
  const currentDate = format(now, 'yyyy-MM-dd');
  const currentTime = format(now, 'HH:mm');

  // Find any active booking right now
  const activeBooking = bookings.find((b) => {
    if (b.roomId !== room.id || b.status !== 'confirmed') return false;
    
    const bookingStart = new Date(b.startDateTime);
    const bookingEnd = new Date(b.endDateTime);
    
    return isWithinInterval(now, { start: bookingStart, end: bookingEnd });
  });

  if (activeBooking) {
    return 'occupied';
  }

  // Check if there's an upcoming booking in next 30 minutes
  const upcomingBooking = bookings.find((b) => {
    if (b.roomId !== room.id || b.status !== 'confirmed' || b.date !== currentDate) {
      return false;
    }
    
    const bookingStart = format(new Date(b.startDateTime), 'HH:mm');
    const minutesUntilBooking = getMinutesBetween(currentTime, bookingStart);
    
    return minutesUntilBooking > 0 && minutesUntilBooking <= 30;
  });

  if (upcomingBooking) {
    return 'upcoming';
  }

  return 'available';
}

/**
 * Calculate minutes between two times (HH:mm format)
 */
function getMinutesBetween(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  return minutes2 - minutes1;
}

/**
 * Calculate utilization rate for a room based on bookings
 */
export function calculateUtilization(
  room: Room,
  bookings: RoomBooking[],
  startDate: Date,
  endDate: Date
): number {
  const roomBookings = bookings.filter(
    (b) => {
      const bookingDate = new Date(b.startDateTime);
      return (
        b.roomId === room.id &&
        b.status === 'confirmed' &&
        bookingDate >= startDate &&
        bookingDate <= endDate
      );
    }
  );

  if (roomBookings.length === 0) return 0;

  // Calculate total available minutes in the period
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const [startHour, startMin] = room.availableFrom.split(':').map(Number);
  const [endHour, endMin] = room.availableTo.split(':').map(Number);
  const dailyAvailableMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  const totalAvailableMinutes = daysInPeriod * dailyAvailableMinutes * room.availableDays.length / 7;

  // Calculate total booked minutes
  const totalBookedMinutes = roomBookings.reduce((sum, booking) => {
    const start = new Date(booking.startDateTime);
    const end = new Date(booking.endDateTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    return sum + duration;
  }, 0);

  return Math.round((totalBookedMinutes / totalAvailableMinutes) * 100);
}
