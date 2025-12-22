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

export interface MenuItemConfig {
  id: string;
  to: string;
  icon: LucideIcon;
  label: string;
  permission?: () => boolean;
  exact?: boolean;
  children?: MenuItemConfig[];
  category?: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: MenuItemConfig[];
}

/**
 * Complete menu structure for Employee 360 HRMS
 */
export const menuStructure: MenuCategory[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    items: [
      {
        id: 'dashboard',
        to: '/dashboard',
        icon: Home,
        label: 'Dashboard',
        exact: true,
      },
    ],
  },
  {
    id: 'core-hr',
    label: 'Core HR',
    icon: Users,
    items: [
      {
        id: 'employee-database',
        to: '/core-hr/employee-database',
        icon: Users,
        label: 'Employee Database',
      },
      {
        id: 'org-structure',
        to: '/core-hr/org-structure',
        icon: Building2,
        label: 'Organization Structure',
      },
      {
        id: 'employee-documents',
        to: '/core-hr/employee-documents',
        icon: FileText,
        label: 'Employee Documents',
      },
    ],
  },
  {
    id: 'time-attendance',
    label: 'Time, Leave & Attendance',
    icon: Clock,
    items: [
      {
        id: 'attendance-management',
        to: '/time-attendance/attendance',
        icon: Clock,
        label: 'Attendance Management',
      },
      {
        id: 'shift-schedule',
        to: '/time-attendance/shift-schedule',
        icon: CalendarCheck,
        label: 'Shift & Schedule',
      },
      {
        id: 'leave-holiday',
        to: '/time-attendance/leave-holiday',
        icon: Calendar,
        label: 'Leave & Holiday',
      },
      {
        id: 'overtime',
        to: '/time-attendance/overtime',
        icon: Clock,
        label: 'Overtime Management',
      },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll & Compensation',
    icon: DollarSign,
    items: [
      {
        id: 'salary-structure',
        to: '/payroll/salary-structure',
        icon: Layers,
        label: 'Salary Structure',
      },
      {
        id: 'payroll-run',
        to: '/payroll/payroll-run',
        icon: DollarSign,
        label: 'Payroll Run & Payslips',
      },
      {
        id: 'statutory-compliance',
        to: '/payroll/statutory-compliance',
        icon: FileCheck,
        label: 'Statutory & Compliance',
      },
      {
        id: 'incentives-bonuses',
        to: '/payroll/incentives-bonuses',
        icon: Award,
        label: 'Incentives & Bonuses',
      },
    ],
  },
  {
    id: 'recruitment',
    label: 'Recruitment & Onboarding',
    icon: UserPlus,
    items: [
      {
        id: 'job-requisitions',
        to: '/recruitment/job-requisitions',
        icon: FileText,
        label: 'Job Requisitions',
      },
      {
        id: 'candidate-tracking',
        to: '/recruitment/candidate-tracking',
        icon: UserPlus,
        label: 'Candidate Tracking',
      },
      {
        id: 'interviews',
        to: '/recruitment/interviews',
        icon: MessageSquare,
        label: 'Interviews & Evaluations',
      },
      {
        id: 'offers-preboarding',
        to: '/recruitment/offers-preboarding',
        icon: FileCheck,
        label: 'Offers & Pre-boarding',
      },
      {
        id: 'onboarding',
        to: '/recruitment/onboarding',
        icon: UserCheck,
        label: 'Onboarding Checklists',
      },
    ],
  },
  {
    id: 'performance',
    label: 'Performance & Development',
    icon: Target,
    items: [
      {
        id: 'goals-okrs',
        to: '/performance/goals-okrs',
        icon: Target,
        label: 'Goals / OKRs',
      },
      {
        id: 'performance-reviews',
        to: '/performance/performance-reviews',
        icon: ClipboardList,
        label: 'Performance Reviews',
      },
      {
        id: '360-feedback',
        to: '/performance/360-feedback',
        icon: TrendingUp,
        label: '360° Feedback',
      },
      {
        id: 'training-learning',
        to: '/performance/training-learning',
        icon: BookOpen,
        label: 'Training & Learning',
      },
      {
        id: 'skills-career',
        to: '/performance/skills-career',
        icon: GitBranch,
        label: 'Skills & Career Paths',
      },
    ],
  },
  {
    id: 'self-service',
    label: 'Employee & Manager Self Service',
    icon: UserCircle,
    items: [
      {
        id: 'my-profile',
        to: '/self-service/my-profile',
        icon: UserCircle,
        label: 'My Profile',
      },
      {
        id: 'my-attendance-leave',
        to: '/self-service/my-attendance-leave',
        icon: Calendar,
        label: 'My Attendance & Leave',
      },
      {
        id: 'my-payslips',
        to: '/self-service/my-payslips',
        icon: FileBarChart,
        label: 'My Payslips & Tax Proofs',
      },
      {
        id: 'my-expenses',
        to: '/self-service/my-expenses',
        icon: Receipt,
        label: 'My Expenses & Travel',
      },
      {
        id: 'my-requests',
        to: '/self-service/my-requests',
        icon: MessageSquare,
        label: 'My Requests / Tickets',
      },
      {
        id: 'team-overview',
        to: '/self-service/team-overview',
        icon: Users,
        label: 'Manager: Team Overview',
      },
      {
        id: 'manager-approvals',
        to: '/self-service/manager-approvals',
        icon: FileCheck,
        label: 'Manager: Approvals',
      },
    ],
  },
  {
    id: 'expenses-assets',
    label: 'Expenses, Travel & Assets',
    icon: Receipt,
    items: [
      {
        id: 'expense-management',
        to: '/expenses-assets/expense-management',
        icon: Receipt,
        label: 'Expense Management',
      },
      {
        id: 'travel-requests',
        to: '/expenses-assets/travel-requests',
        icon: MapPin,
        label: 'Travel Requests',
      },
      {
        id: 'advances-settlements',
        to: '/expenses-assets/advances-settlements',
        icon: CreditCard,
        label: 'Advances & Settlements',
      },
      {
        id: 'asset-management',
        to: '/expenses-assets/asset-management',
        icon: Briefcase,
        label: 'Asset Assignment',
      },
    ],
  },
  {
    id: 'policy-documents',
    label: 'Policy & Document Center',
    icon: BookOpen,
    items: [
      {
        id: 'policy-library',
        to: '/policy-documents/policy-library',
        icon: BookOpen,
        label: 'Policy Library',
      },
      {
        id: 'acknowledgements',
        to: '/policy-documents/acknowledgements',
        icon: FileCheck,
        label: 'Acknowledgements',
      },
      {
        id: 'forms-templates',
        to: '/policy-documents/forms-templates',
        icon: FolderOpen,
        label: 'Forms & Templates',
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects & Work Management',
    icon: Briefcase,
    items: [
      {
        id: 'project-list',
        to: '/projects/project-list',
        icon: Folder,
        label: 'Project List & Allocation',
      },
      {
        id: 'tasks-timesheets',
        to: '/projects/tasks-timesheets',
        icon: ClipboardList,
        label: 'Tasks / Timesheets',
      },
      {
        id: 'project-attendance',
        to: '/projects/project-attendance',
        icon: Clock,
        label: 'Project Attendance',
      },
    ],
  },
  {
    id: 'visitor-room',
    label: 'Visitor & Room Management',
    icon: Eye,
    items: [
      {
        id: 'visitor-management',
        to: '/visitor-room/visitor-management',
        icon: Eye,
        label: 'Visitor Management',
      },
      {
        id: 'room-booking',
        to: '/visitor-room/room-booking',
        icon: Calendar,
        label: 'Meeting Room Booking',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration & Security',
    icon: Shield,
    items: [
      {
        id: 'user-management',
        to: '/administration/user-management',
        icon: Users,
        label: 'User Management',
      },
      {
        id: 'role-permissions',
        to: '/administration/role-permissions',
        icon: Shield,
        label: 'Role & Permissions',
      },
      {
        id: 'audit-logs',
        to: '/administration/audit-logs',
        icon: FileText,
        label: 'Audit Logs',
      },
      {
        id: 'integrations',
        to: '/administration/integrations',
        icon: GitBranch,
        label: 'Integrations',
      },
      {
        id: 'system-settings',
        to: '/administration/system-settings',
        icon: SettingsIcon,
        label: 'System Settings',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Dashboards',
    icon: BarChart3,
    items: [
      {
        id: 'hr-dashboard',
        to: '/analytics/hr-dashboard',
        icon: BarChart3,
        label: 'HR Dashboard',
      },
      {
        id: 'workforce-analytics',
        to: '/analytics/workforce-analytics',
        icon: PieChart,
        label: 'Workforce & Time Analytics',
      },
      {
        id: 'payroll-analytics',
        to: '/analytics/payroll-analytics',
        icon: DollarSign,
        label: 'Payroll & Cost Analytics',
      },
      {
        id: 'custom-reports',
        to: '/analytics/custom-reports',
        icon: FileBarChart,
        label: 'Custom Reports',
      },
    ],
  },
];

/**
 * Flatten menu structure for routing
 */
export const getAllMenuItems = (): MenuItemConfig[] => {
  const items: MenuItemConfig[] = [];
  menuStructure.forEach((category) => {
    category.items.forEach((item) => {
      items.push(item);
    });
  });
  return items;
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = (id: string): MenuItemConfig | undefined => {
  return getAllMenuItems().find((item) => item.id === id);
};

/**
 * Get menu item by route
 */
export const getMenuItemByRoute = (route: string): MenuItemConfig | undefined => {
  return getAllMenuItems().find((item) => item.to === route);
};
