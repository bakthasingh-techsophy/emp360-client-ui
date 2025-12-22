/**
 * User role definitions for Employee 360 HRMS
 */

export type UserRole =
  | 'super-admin'
  | 'it-admin'
  | 'chro'
  | 'hr-manager'
  | 'hr-executive'
  | 'recruiter'
  | 'lnd-admin'
  | 'payroll-specialist'
  | 'cxo'
  | 'department-head'
  | 'project-manager'
  | 'employee'
  | 'intern'
  | 'candidate'
  | 'finance-user'
  | 'compliance-user'
  | 'helpdesk-agent';

export interface DummyUser {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  description: string;
  category: 'system' | 'hr' | 'management' | 'employee' | 'support';
}

/**
 * Dummy users for testing Employee 360 HRMS
 */
export const dummyUsers: DummyUser[] = [
  // Core system-level users
  {
    id: '1',
    username: 'superadmin',
    password: 'admin123',
    name: 'Alice Martinez',
    email: 'alice.martinez@emp360.com',
    role: 'super-admin',
    roleLabel: 'Super Admin / System Owner',
    description: 'Full platform control across all companies and branches',
    category: 'system',
  },
  {
    id: '2',
    username: 'itadmin',
    password: 'admin123',
    name: 'Bob Chen',
    email: 'bob.chen@emp360.com',
    role: 'it-admin',
    roleLabel: 'IT Admin / HRMS Administrator',
    description: 'Manages user accounts, roles, permissions, and security',
    category: 'system',
  },

  // HR department users
  {
    id: '3',
    username: 'chro',
    password: 'admin123',
    name: 'Catherine Rodriguez',
    email: 'catherine.rodriguez@emp360.com',
    role: 'chro',
    roleLabel: 'CHRO / Head of HR',
    description: 'High-level view of all HR data, reports, and approvals',
    category: 'hr',
  },
  {
    id: '4',
    username: 'hrmanager',
    password: 'admin123',
    name: 'David Kumar',
    email: 'david.kumar@emp360.com',
    role: 'hr-manager',
    roleLabel: 'HR Manager / HR Business Partner',
    description: 'Manages hire-to-retire processes for business units',
    category: 'hr',
  },
  {
    id: '5',
    username: 'hrexec',
    password: 'admin123',
    name: 'Emma Johnson',
    email: 'emma.johnson@emp360.com',
    role: 'hr-executive',
    roleLabel: 'HR Executive / HR Operations',
    description: 'Day-to-day HR transactions and employee data maintenance',
    category: 'hr',
  },
  {
    id: '6',
    username: 'recruiter',
    password: 'admin123',
    name: 'Frank Wilson',
    email: 'frank.wilson@emp360.com',
    role: 'recruiter',
    roleLabel: 'Recruiter / Talent Acquisition',
    description: 'Manages recruitment, interviews, and candidate database',
    category: 'hr',
  },
  {
    id: '7',
    username: 'lndadmin',
    password: 'admin123',
    name: 'Grace Lee',
    email: 'grace.lee@emp360.com',
    role: 'lnd-admin',
    roleLabel: 'L&D / Training Admin',
    description: 'Manages learning catalog, training sessions, and certifications',
    category: 'hr',
  },
  {
    id: '8',
    username: 'payroll',
    password: 'admin123',
    name: 'Henry Thompson',
    email: 'henry.thompson@emp360.com',
    role: 'payroll-specialist',
    roleLabel: 'Payroll & Benefits Specialist',
    description: 'Handles payroll, statutory compliance, and benefits',
    category: 'hr',
  },

  // Management and line users
  {
    id: '9',
    username: 'cxo',
    password: 'admin123',
    name: 'Isabella Davis',
    email: 'isabella.davis@emp360.com',
    role: 'cxo',
    roleLabel: 'Top Management / CXO',
    description: 'Strategic HR reports and high-level dashboards',
    category: 'management',
  },
  {
    id: '10',
    username: 'depthead',
    password: 'admin123',
    name: 'Jack Brown',
    email: 'jack.brown@emp360.com',
    role: 'department-head',
    roleLabel: 'Department Head / Functional Manager',
    description: 'Manages team structure, approvals, and performance reviews',
    category: 'management',
  },
  {
    id: '11',
    username: 'projectmgr',
    password: 'admin123',
    name: 'Karen White',
    email: 'karen.white@emp360.com',
    role: 'project-manager',
    roleLabel: 'Project Manager / Team Lead',
    description: 'Manages project teams, timesheets, and skill mapping',
    category: 'management',
  },

  // Employee and external users
  {
    id: '12',
    username: 'employee',
    password: 'admin123',
    name: 'Liam Garcia',
    email: 'liam.garcia@emp360.com',
    role: 'employee',
    roleLabel: 'Regular Employee',
    description: 'Self-service for profile, leave, attendance, and payslips',
    category: 'employee',
  },
  {
    id: '13',
    username: 'intern',
    password: 'admin123',
    name: 'Mia Martinez',
    email: 'mia.martinez@emp360.com',
    role: 'intern',
    roleLabel: 'Intern / Trainee / Contractor',
    description: 'Limited access to attendance, tasks, and timesheets',
    category: 'employee',
  },
  {
    id: '14',
    username: 'candidate',
    password: 'admin123',
    name: 'Noah Anderson',
    email: 'noah.anderson@example.com',
    role: 'candidate',
    roleLabel: 'Candidate (External User)',
    description: 'Career portal access: apply jobs and track applications',
    category: 'employee',
  },

  // Support and specialized users
  {
    id: '15',
    username: 'finance',
    password: 'admin123',
    name: 'Olivia Taylor',
    email: 'olivia.taylor@emp360.com',
    role: 'finance-user',
    roleLabel: 'Finance / Accounts User',
    description: 'Reads payroll outputs and cost reports',
    category: 'support',
  },
  {
    id: '16',
    username: 'compliance',
    password: 'admin123',
    name: 'Peter Wilson',
    email: 'peter.wilson@emp360.com',
    role: 'compliance-user',
    roleLabel: 'Compliance / Audit User',
    description: 'Read-only access to logs and compliance data',
    category: 'support',
  },
  {
    id: '17',
    username: 'helpdesk',
    password: 'admin123',
    name: 'Quinn Roberts',
    email: 'quinn.roberts@emp360.com',
    role: 'helpdesk-agent',
    roleLabel: 'Helpdesk / HR Support Agent',
    description: 'Manages employee tickets and HRMS queries',
    category: 'support',
  },
];

/**
 * Get users by category for organized display
 */
export const getUsersByCategory = () => {
  const categories = {
    system: dummyUsers.filter((u) => u.category === 'system'),
    hr: dummyUsers.filter((u) => u.category === 'hr'),
    management: dummyUsers.filter((u) => u.category === 'management'),
    employee: dummyUsers.filter((u) => u.category === 'employee'),
    support: dummyUsers.filter((u) => u.category === 'support'),
  };
  return categories;
};

/**
 * Category labels for display
 */
export const categoryLabels = {
  system: 'Core System-Level Users',
  hr: 'HR Department Users',
  management: 'Management and Line Users',
  employee: 'Employee and External Users',
  support: 'Support and Specialized Users',
};
