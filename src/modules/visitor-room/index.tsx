/**
 * Room Management Entry Point
 * Routes to appropriate dashboard based on user role:
 * - Regular users (user, employee, manager): See MyBookings dashboard
 * - Admin/Receptionist: See RoomManagementAdmin dashboard with approvals
 */

import { MyBookings } from './MyBookings';
import { RoomManagementAdmin } from './RoomManagementAdmin';

export function RoomManagement() {
  // TODO: Replace with actual auth context - useAuth() or AuthContext
  const userRole = 'admin'; // This should come from authentication context
  
  const isAdmin = userRole === 'admin' || userRole === 'receptionist';

  // Render appropriate dashboard based on role
  if (isAdmin) {
    // Admin/Receptionist see: Pending Approvals, Today, Upcoming, All Bookings
    return <RoomManagementAdmin />;
  } else {
    // Regular users see: My Bookings, History, Quick Stats, Popular Rooms
    return <MyBookings />;
  }
}
