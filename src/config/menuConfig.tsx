import { AppShellMenuItem } from '@/components/AppShell';
import {
  Users,
  Building2,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  UserPlus,
  Target,
  UserCircle,
  Receipt,
  Briefcase,
  BookOpen,
  Eye,
  Shield,
  BarChart3,
  Home,
  Folder,
  CalendarCheck,
  Settings as SettingsIcon,
  FileCheck,
  TrendingUp,
  Award,
  ClipboardList,
  PieChart,
  CreditCard,
  FileBarChart,
  UserCheck,
  GitBranch,
  FolderOpen,
  MessageSquare,
  Layers,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


/**
 * Complete flat menu structure for Employee 360 HRMS
 * All menus are independent - no grouping, no sub-paths
 */
export const allMenuItems: AppShellMenuItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    to: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    category: 'Dashboard',
    exact: true,
    order: 1,
  },

  // Core HR
  {
    id: 'employee-database',
    to: '/employee-database',
    icon: Users,
    label: 'Employee Database',
    category: 'Core HR',
  },
  {
    id: 'org-structure',
    to: '/org-structure',
    icon: Building2,
    label: 'Organization Structure',
    category: 'Core HR',
  },
  {
    id: 'employee-documents',
    to: '/employee-documents',
    icon: FileText,
    label: 'Employee Documents',
    category: 'Core HR',
  },

  // Time, Leave & Attendance
  {
    id: 'attendance-management',
    to: '/attendance-management',
    icon: Clock,
    label: 'Attendance Management',
    category: 'Time & Attendance',
  },
  {
    id: 'shift-schedule',
    to: '/shift-schedule',
    icon: CalendarCheck,
    label: 'Shift & Schedule',
    category: 'Time & Attendance',
  },
  {
    id: 'leave-holiday',
    to: '/leave-holiday',
    icon: Calendar,
    label: 'Leave & Holiday',
    category: 'Time & Attendance',
  },
  {
    id: 'overtime',
    to: '/overtime',
    icon: Clock,
    label: 'Overtime Management',
    category: 'Time & Attendance',
  },

  // Payroll & Compensation
  {
    id: 'salary-structure',
    to: '/salary-structure',
    icon: Layers,
    label: 'Salary Structure',
    category: 'Payroll',
  },
  {
    id: 'payroll-run',
    to: '/payroll-run',
    icon: DollarSign,
    label: 'Payroll Run & Payslips',
    category: 'Payroll',
  },
  {
    id: 'statutory-compliance',
    to: '/statutory-compliance',
    icon: FileCheck,
    label: 'Statutory & Compliance',
    category: 'Payroll',
  },
  {
    id: 'incentives-bonuses',
    to: '/incentives-bonuses',
    icon: Award,
    label: 'Incentives & Bonuses',
    category: 'Payroll',
  },

  // Recruitment & Onboarding
  {
    id: 'job-requisitions',
    to: '/job-requisitions',
    icon: FileText,
    label: 'Job Requisitions',
    category: 'Recruitment',
  },
  {
    id: 'candidate-tracking',
    to: '/candidate-tracking',
    icon: UserPlus,
    label: 'Candidate Tracking',
    category: 'Recruitment',
  },
  {
    id: 'interviews',
    to: '/interviews',
    icon: MessageSquare,
    label: 'Interviews & Evaluations',
    category: 'Recruitment',
  },
  {
    id: 'offers-preboarding',
    to: '/offers-preboarding',
    icon: FileCheck,
    label: 'Offers & Pre-boarding',
    category: 'Recruitment',
  },
  {
    id: 'onboarding',
    to: '/onboarding',
    icon: UserCheck,
    label: 'Onboarding Checklists',
    category: 'Recruitment',
  },

  // Performance & Development
  {
    id: 'goals-okrs',
    to: '/goals-okrs',
    icon: Target,
    label: 'Goals / OKRs',
    category: 'Performance',
  },
  {
    id: 'performance-reviews',
    to: '/performance-reviews',
    icon: ClipboardList,
    label: 'Performance Reviews',
    category: 'Performance',
  },
  {
    id: '360-feedback',
    to: '/360-feedback',
    icon: TrendingUp,
    label: '360° Feedback',
    category: 'Performance',
  },
  {
    id: 'training-learning',
    to: '/training-learning',
    icon: BookOpen,
    label: 'Training & Learning',
    category: 'Performance',
  },
  {
    id: 'skills-career',
    to: '/skills-career',
    icon: GitBranch,
    label: 'Skills & Career Paths',
    category: 'Performance',
  },

  // Employee & Manager Self Service
  {
    id: 'my-profile',
    to: '/my-profile',
    icon: UserCircle,
    label: 'My Profile',
    category: 'Self Service',
  },
  {
    id: 'my-attendance-leave',
    to: '/my-attendance-leave',
    icon: Calendar,
    label: 'My Attendance & Leave',
    category: 'Self Service',
  },
  {
    id: 'my-payslips',
    to: '/my-payslips',
    icon: FileBarChart,
    label: 'My Payslips & Tax Proofs',
    category: 'Self Service',
  },
  {
    id: 'my-expenses',
    to: '/my-expenses',
    icon: Receipt,
    label: 'My Expenses & Travel',
    category: 'Self Service',
  },
  {
    id: 'my-requests',
    to: '/my-requests',
    icon: MessageSquare,
    label: 'My Requests / Tickets',
    category: 'Self Service',
  },
  {
    id: 'team-overview',
    to: '/team-overview',
    icon: Users,
    label: 'Manager: Team Overview',
    category: 'Self Service',
  },
  {
    id: 'manager-approvals',
    to: '/manager-approvals',
    icon: FileCheck,
    label: 'Manager: Approvals',
    category: 'Self Service',
  },

  // Expenses, Travel & Assets
  {
    id: 'expense-management',
    to: '/expense-management',
    icon: Receipt,
    label: 'Expense Management',
    category: 'Expenses & Assets',
  },
  {
    id: 'travel-requests',
    to: '/travel-requests',
    icon: MapPin,
    label: 'Travel Requests',
    category: 'Expenses & Assets',
  },
  {
    id: 'advances-settlements',
    to: '/advances-settlements',
    icon: CreditCard,
    label: 'Advances & Settlements',
    category: 'Expenses & Assets',
  },
  {
    id: 'asset-management',
    to: '/asset-management',
    icon: Briefcase,
    label: 'Asset Assignment',
    category: 'Expenses & Assets',
  },

  // Policy & Document Center
  {
    id: 'policy-library',
    to: '/policy-library',
    icon: BookOpen,
    label: 'Policy Library',
    category: 'Policy & Documents',
  },
  {
    id: 'acknowledgements',
    to: '/acknowledgements',
    icon: FileCheck,
    label: 'Acknowledgements',
    category: 'Policy & Documents',
  },
  {
    id: 'forms-templates',
    to: '/forms-templates',
    icon: FolderOpen,
    label: 'Forms & Templates',
    category: 'Policy & Documents',
  },

  // Projects & Work Management
  {
    id: 'project-list',
    to: '/project-list',
    icon: Folder,
    label: 'Project List & Allocation',
    category: 'Projects',
  },
  {
    id: 'tasks-timesheets',
    to: '/tasks-timesheets',
    icon: ClipboardList,
    label: 'Tasks / Timesheets',
    category: 'Projects',
  },
  {
    id: 'project-attendance',
    to: '/project-attendance',
    icon: Clock,
    label: 'Project Attendance',
    category: 'Projects',
  },

  // Visitor & Room Management
  {
    id: 'visitor-management',
    to: '/visitor-management',
    icon: Eye,
    label: 'Visitor Management',
    category: 'Visitor & Room',
    order: 1,
  },
  {
    id: 'room-management',
    to: '/room-management',
    icon: Building2,
    label: 'Room Management',
    category: 'Visitor & Room',
    order: 2,
  },

  // Administration & Security
  {
    id: 'user-management',
    to: '/user-management',
    icon: Users,
    label: 'User Management',
    category: 'Administration',
  },
  {
    id: 'company-management',
    to: '/company-management',
    icon: Building2,
    label: 'Company Management',
    category: 'Administration',
  },
  {
    id: 'role-permissions',
    to: '/role-permissions',
    icon: Shield,
    label: 'Role & Permissions',
    category: 'Administration',
  },
  {
    id: 'audit-logs',
    to: '/audit-logs',
    icon: FileText,
    label: 'Audit Logs',
    category: 'Administration',
  },
  {
    id: 'integrations',
    to: '/integrations',
    icon: GitBranch,
    label: 'Integrations',
    category: 'Administration',
  },
  {
    id: 'system-settings',
    to: '/system-settings',
    icon: SettingsIcon,
    label: 'System Settings',
    category: 'Administration',
  },

  // Analytics & Dashboards
  {
    id: 'hr-dashboard',
    to: '/hr-dashboard',
    icon: BarChart3,
    label: 'HR Dashboard',
    category: 'Analytics',
  },
  {
    id: 'workforce-analytics',
    to: '/workforce-analytics',
    icon: PieChart,
    label: 'Workforce & Time Analytics',
    category: 'Analytics',
  },
  {
    id: 'payroll-analytics',
    to: '/payroll-analytics',
    icon: DollarSign,
    label: 'Payroll & Cost Analytics',
    category: 'Analytics',
  },
  {
    id: 'custom-reports',
    to: '/custom-reports',
    icon: FileBarChart,
    label: 'Custom Reports',
    category: 'Analytics',
  },
];

/**
 * Menu categories for organizing in menu picker
 */
export const menuCategories = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'core-hr', label: 'Core HR', icon: Users },
  { id: 'time-attendance', label: 'Time & Attendance', icon: Clock },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
  { id: 'performance', label: 'Performance', icon: Target },
  { id: 'self-service', label: 'Self Service', icon: UserCircle },
  { id: 'expenses-assets', label: 'Expenses & Assets', icon: Receipt },
  { id: 'policy-documents', label: 'Policy & Documents', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'visitor-room', label: 'Visitor & Room', icon: Eye },
  { id: 'administration', label: 'Administration', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// Legacy support - keeping old structure for backward compatibility
export interface MenuCategory {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: AppShellMenuItem[];
}

export const menuStructure: MenuCategory[] = menuCategories.map((cat) => ({
  ...cat,
  items: allMenuItems.filter((item) => {
    const categoryMap: Record<string, string> = {
      'Dashboard': 'dashboard',
      'Core HR': 'core-hr',
      'Time & Attendance': 'time-attendance',
      'Payroll': 'payroll',
      'Recruitment': 'recruitment',
      'Performance': 'performance',
      'Self Service': 'self-service',
      'Expenses & Assets': 'expenses-assets',
      'Policy & Documents': 'policy-documents',
      'Projects': 'projects',
      'Visitor & Room': 'visitor-room',
      'Administration': 'administration',
      'Analytics': 'analytics',
    };
    return categoryMap[item.category || ''] === cat.id;
  }),
}));

/**
 * Get all menu items (main export for flat menu structure)
 */
export const getAllMenuItems = (): AppShellMenuItem[] => {
  return allMenuItems;
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = (id: string): AppShellMenuItem | undefined => {
  return allMenuItems.find((item) => item.id === id);
};

/**
 * Get menu item by route
 */
export const getMenuItemByRoute = (route: string): AppShellMenuItem | undefined => {
  return allMenuItems.find((item) => item.to === route);
};
