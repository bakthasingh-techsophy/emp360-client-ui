/**
 * Room Management Constants
 */

import { RoomStatus, RoomType, BookingStatus, BookingRecurrence } from './types';

/**
 * Room Status Labels
 */
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
};

/**
 * Room Status Colors
 */
export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  occupied: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

/**
 * Room Type Labels
 */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  conference: 'Conference Room',
  meeting: 'Meeting Room',
  huddle: 'Huddle Room',
  training: 'Training Room',
  boardroom: 'Boardroom',
  event: 'Event Space',
};

/**
 * Room Type Colors
 */
export const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  conference: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  meeting: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  huddle: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  training: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  boardroom: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  event: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
};

/**
 * Room Type Icons (emoji)
 */
export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  conference: '🏢',
  meeting: '📊',
  huddle: '💭',
  training: '📚',
  boardroom: '👔',
  event: '🎉',
};

/**
 * Booking Status Labels
 */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed',
  'no-show': 'No Show',
};

/**
 * Booking Status Colors
 */
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'no-show': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

/**
 * Recurrence Labels
 */
export const RECURRENCE_LABELS: Record<BookingRecurrence, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

/**
 * Amenity Labels
 */
export const AMENITY_LABELS: Record<string, string> = {
  projector: 'Projector',
  whiteboard: 'Whiteboard',
  videoConference: 'Video Conference',
  audioSystem: 'Audio System',
  wifi: 'Wi-Fi',
  television: 'Television',
  airConditioning: 'Air Conditioning',
  phoneConference: 'Phone Conference',
  smartBoard: 'Smart Board',
  refreshments: 'Refreshments',
};

/**
 * Amenity Icons
 */
export const AMENITY_ICONS: Record<string, string> = {
  projector: '📽️',
  whiteboard: '📝',
  videoConference: '📹',
  audioSystem: '🔊',
  wifi: '📶',
  television: '📺',
  airConditioning: '❄️',
  phoneConference: '☎️',
  smartBoard: '🖥️',
  refreshments: '☕',
};

/**
 * Day labels for availability
 */
export const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Day short labels
 */
export const DAY_SHORT_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Default availability settings
 */
export const DEFAULT_AVAILABILITY = {
  availableFrom: '08:00',
  availableTo: '18:00',
  availableDays: [1, 2, 3, 4, 5], // Monday to Friday
};

/**
 * Default amenities configuration (can be overridden by admin settings)
 */
export const DEFAULT_AMENITIES = [
  'projector',
  'whiteboard',
  'videoConference',
  'audioSystem',
  'wifi',
  'television',
  'airConditioning',
  'phoneConference',
  'smartBoard',
  'refreshments',
];

/**
 * Purpose options for bookings
 */
export const BOOKING_PURPOSE_OPTIONS = [
  'Team Meeting',
  'Client Meeting',
  'Interview',
  'Training Session',
  'Workshop',
  'Presentation',
  'Brainstorming',
  'Project Discussion',
  'Board Meeting',
  'Town Hall',
  'Conference Call',
  'Other',
];
