/**
 * EXAMPLE: Visitor Management Focused Menu Order
 * 
 * This example shows how to configure menu ordering to prioritize
 * Visitor Management features in the sidebar.
 * 
 * INSTRUCTIONS:
 * 1. Copy the order values below
 * 2. Paste them into the respective menu items in /src/config/menuConfig.tsx
 * 3. The sidebar will automatically display menus in this order
 */

// ============================================
// VISITOR MANAGEMENT FOCUSED ORDER
// ============================================

/* Dashboard */
{
  id: 'dashboard',
  to: '/dashboard',
  icon: Home,
  label: 'Dashboard',
  category: 'Dashboard',
  exact: true,
  order: 1,  // ⭐ First - Overview
}

/* Visitor & Room Management - PRIORITY FEATURES */
{
  id: 'visitor-management',
  to: '/visitor-management',
  icon: Eye,
  label: 'Visitor Management',
  category: 'Visitor & Room',
  order: 2,  // ⭐ Second - Main feature
}

{
  id: 'room-booking',
  to: '/room-booking',
  icon: Calendar,
  label: 'Meeting Room Booking',
  category: 'Visitor & Room',
  order: 3,  // ⭐ Third - Related feature
}

/* Supporting Features */
{
  id: 'policy-library',
  to: '/policy-library',
  icon: BookOpen,
  label: 'Policy Library',
  category: 'Policy & Documents',
  order: 4,  // Visitor policies
}

{
  id: 'user-management',
  to: '/user-management',
  icon: Users,
  label: 'User Management',
  category: 'Administration',
  order: 5,  // Manage reception staff
}

{
  id: 'my-profile',
  to: '/my-profile',
  icon: UserCircle,
  label: 'My Profile',
  category: 'Self Service',
  order: 6,  // User profile
}

{
  id: 'system-settings',
  to: '/system-settings',
  icon: SettingsIcon,
  label: 'System Settings',
  category: 'Administration',
  order: 7,  // Configure visitor settings
}

// ============================================
// RESULT IN SIDEBAR:
// ============================================
// 1. Dashboard
// 2. Visitor Management
// 3. Meeting Room Booking
// 4. Policy Library
// 5. User Management
// 6. My Profile
// 7. System Settings
// ... (other pinned menus without order appear after)

// ============================================
// ALTERNATIVE: Update Default Pinned Order
// ============================================
// Edit /src/store/menuPreferences.ts:

const DEFAULT_PINNED_MENUS = [
  'dashboard',
  'visitor-management',  // ⭐ Priority #1
  'room-booking',        // ⭐ Priority #2
  'policy-library',
  'user-management',
  'my-profile',
  'system-settings',
];

// This sets the default order for new users
// Existing users will keep their saved order until reset
