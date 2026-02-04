/**
 * Types for Employee Onboarding Forms
 */

/**
 * User Status Enum - Backend aligned
 * ACTIVE: User is active and can login
 * INACTIVE: User is inactive and cannot login
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// User Details - Basic registration (simplified, all editable)
export interface UserDetails {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: UserStatus;
}

/**
 * User Details Snapshot - Backend aligned model
 * Maps to UserDetailsSnapshot collection in MongoDB
 */
export type UserDetailsSnapshot = {
  /** Internal unique identifier */
  id: string;

  /** Employee-specific fields */
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  reportingTo?: string;

  /** Contact info */
  email: string;
  phone: string;

  /** Org structure */
  department: string;
  role: string;

  /** Employment status */
  status: UserStatus;

  /** Location & dates */
  location: string;
  joiningDate: string; // ISO date string

  /** Audit fields */
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
};



// User Details Carrier - DTO for API submission (extends UserDetails)
export interface UserDetailsCarrier extends UserDetails {
  createdAt: string;
}

// Job Details - Professional work information
export interface JobDetails {
  employeeId: string;
  officialEmail: string;
  primaryPhone: string;
  secondaryPhone: string;
  designation: string;
  employeeType: 'full-time' | 'part-time' | 'contract' | 'intern';
  workLocation: string;
  reportingManager: string;
  joiningDate: string;
  dateOfBirth: string;
  celebrationDOB: string;
  sameAsDOB: boolean;
  shift: string;
  probationPeriod: number;
}

// Emergency Contact Info
export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

// General Details - Personal information
export interface GeneralDetails {
  firstName: string;
  lastName: string;
  employeeId: string;
  officialEmail: string;
  phone: string;
  secondaryPhone: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  panNumber: string;
  aadharNumber: string;
  contactAddress: string;
  permanentAddress: string;
  sameAsContactAddress: boolean;
  emergencyContacts: EmergencyContact[];
  personalEmail: string;
  nationality: string;
  physicallyChallenged: boolean;
  passportNumber: string;
  passportExpiry: string;
  maritalStatus: 'single' | 'married';
}

// Banking Details
export interface BankingDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

// Employment History - Work experience
export interface EmploymentHistoryItem {
  id: string;
  companyName: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  tenure: string;
}

export interface EmploymentHistory {
  items: EmploymentHistoryItem[];
  viewMode: 'timeline' | 'edit';
}

// Skills Set
export interface SkillItem {
  id: string;
  name: string;
  certificationType: 'url' | 'file' | 'none';
  certificationUrl?: string;
  certificationFile?: File | null;
  certificationFileName?: string;
}

export interface SkillsSetForm {
  items: SkillItem[];
  viewMode: 'view' | 'edit';
}

// Document Pool
export interface DocumentItem {
  id: string;
  name: string;
  type: 'url' | 'file';
  url?: string;
  fileName?: string;
  fileSize?: string;
  uploadedDate: string;
}

export interface DocumentPool {
  documents: DocumentItem[];
}

// Event History (formerly Promotion/Revision History)
export interface EventHistoryItem {
  id: string;
  date: string;
  type: 'promotion' | 'demotion' | 'transfer' | 'role-change' | 'joining' | 'resignation' | 'other';
  oldRole: string;
  newRole: string;
  oldDepartment?: string;
  newDepartment?: string;
  reason: string;
  effectiveDate: string;
  order: number; // For manual ordering
}

export interface EventHistoryForm {
  items: EventHistoryItem[];
}

// Keep old names as aliases for backward compatibility
export type PromotionHistoryItem = EventHistoryItem;
export type PromotionHistoryForm = EventHistoryForm;

// Tab Configuration
export interface OnboardingTab {
  id: number;
  key: string;
  label: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
}
