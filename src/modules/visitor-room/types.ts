/**
 * Room Management Types
 */

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'inactive';
export type RoomType = 'conference' | 'meeting' | 'huddle' | 'training' | 'boardroom' | 'event';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
export type BookingRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

/**
 * Company that can share rooms
 */
export interface Company {
  id: string;
  name: string;
  subscriptionType: 'owner' | 'shared'; // owner = has subscription, shared = using under owner's subscription
  ownerCompanyId?: string; // if subscriptionType is 'shared', reference to owner company
  isActive: boolean;
}

/**
 * Room Amenities
 */
export interface RoomAmenities {
  projector?: boolean;
  whiteboard?: boolean;
  videoConference?: boolean;
  audioSystem?: boolean;
  wifi?: boolean;
  television?: boolean;
  airConditioning?: boolean;
  phoneConference?: boolean;
  smartBoard?: boolean;
  refreshments?: boolean;
}

/**
 * Room entity
 */
export interface Room {
  id: string;
  name: string;
  description?: string;
  type: RoomType;
  status: RoomStatus;
  capacity: number; // Maximum number of people
  floor: string;
  building?: string;
  location: string; // Full location description
  amenities: RoomAmenities;
  
  // Company ownership & sharing
  ownerCompanyId: string; // Company that owns/manages this room
  sharedWithCompanies: string[]; // Other companies that can book this room
  
  // Images & Visual
  imageUrl?: string;
  thumbnailUrl?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  
  // Availability settings
  availableFrom: string; // Time in HH:mm format (e.g., "08:00")
  availableTo: string; // Time in HH:mm format (e.g., "18:00")
  availableDays: number[]; // 0-6 (Sunday-Saturday)
  
  // Statistics
  totalBookings?: number;
  utilizationRate?: number; // Percentage
}

/**
 * Room booking
 */
export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  
  // Booking details
  title: string;
  description?: string;
  purpose: string;
  
  // Date & Time
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  date: string; // Date only for easy filtering
  
  // Recurrence
  recurrence: BookingRecurrence;
  recurrenceEndDate?: string;
  recurrenceInstances?: string[]; // Array of booking IDs if recurring
  
  // Attendees
  numberOfAttendees: number;
  
  // Booking user (employee who booked)
  bookedBy: string; // User ID
  bookedByName: string;
  bookedByEmail: string;
  bookedByCompanyId: string;
  bookedByCompanyName: string;
  
  // Host information (if different from booker)
  hostName?: string;
  hostEmail?: string;
  
  // External guests (optional)
  hasExternalGuests: boolean;
  externalGuestCount?: number;
  externalGuestCompanies?: string[]; // List of external companies
  
  // Special requirements
  cateringRequired?: boolean;
  cateringDetails?: string;
  setupRequirements?: string;
  specialRequests?: string;
  
  // Status
  status: BookingStatus;
  
  // Notifications
  reminderSent?: boolean;
  notifyAttendees?: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  
  // Check-in/Check-out
  checkedInAt?: string;
  checkedOutAt?: string;
  actualEndTime?: string;
}

/**
 * Form data for room
 */
export interface RoomFormData {
  name: string;
  description?: string;
  type: RoomType;
  capacity: number;
  floor: string;
  building?: string;
  location: string;
  
  // Amenities (dynamic based on configuration)
  amenities: Record<string, boolean>;
  
  // Availability
  availableFrom: string;
  availableTo: string;
  availableDays: number[];
  
  // Images
  imageUrl?: string;
  imageFile?: File; // For upload option
}

/**
 * Form data for booking
 */
export interface BookingFormData {
  roomId: string;
  title: string;
  description?: string;
  purpose: string;
  date: Date;
  startTime: string;
  endTime: string;
  numberOfAttendees: number;
  
  // Recurrence
  recurrence: BookingRecurrence;
  recurrenceEndDate?: Date;
  
  // Host
  hostName?: string;
  hostEmail?: string;
  
  // External guests
  hasExternalGuests: boolean;
  externalGuestCount?: number;
  externalGuestCompanies?: string[];
  
  // Special requirements
  cateringRequired?: boolean;
  cateringDetails?: string;
  setupRequirements?: string;
  specialRequests?: string;
  
  // Notifications
  notifyAttendees?: boolean;
}

/**
 * Stats for room management dashboard
 */
export interface RoomStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalBookingsToday: number;
  upcomingBookings: number;
  averageUtilization: number;
}

/**
 * Time slot for availability checking
 */
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  bookingId?: string;
  bookingTitle?: string;
}
