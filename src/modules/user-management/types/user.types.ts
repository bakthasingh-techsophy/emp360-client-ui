/**
 * User Management Types
 * Types and interfaces for User Management system
 */

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type Department = 
  | 'Engineering'
  | 'Human Resources'
  | 'Finance'
  | 'Marketing'
  | 'Sales'
  | 'Operations'
  | 'IT'
  | 'Legal'
  | 'Administration';

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

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  designation: string;
  role: UserRole;
  status: UserStatus;
  joiningDate: string;
  lastActive: string;
  reportingTo?: string;
  location: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
}
