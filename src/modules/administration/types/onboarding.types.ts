/**
 * Types for Employee Onboarding Forms
 * Aligned with backend models
 */

// User Details - Basic registration (simplified, all editable)
export interface UserDetailsForm {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on-leave';
}

// Job Details - Professional work information
export interface JobDetailsForm {
  employeeId: string;
  officialEmail: string;
  primaryPhone: string;
  secondaryPhone: string;
  designation: string;
  employeeType: 'full-time' | 'part-time' | 'contract' | 'intern';
  location: string;
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

// General Details - Personal information (aligned with backend)
export interface GeneralDetailsForm {
  id?: string;
  firstName: string;
  lastName: string;
  officialEmail: string;
  phone: string;
  secondaryPhone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
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
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  createdAt?: string;
  updatedAt?: string;
}

// Banking Details - Multiple accounts per employee (aligned with backend)
export interface BankingDetailsItem {
  id?: string;
  employeeId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankingDetailsForm {
  items: BankingDetailsItem[];
}

// Employment History - Work experience (aligned with backend)
export interface EmploymentHistoryItem {
  id?: string;
  employeeId: string;
  companyName: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  tenure: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmploymentHistoryForm {
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

// Document Pool - Centralized document storage (aligned with backend)
export interface DocumentItem {
  id?: string;
  employeeId: string;
  name: string;
  type: 'AADHAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'OTHER';
  url?: string;
  fileName?: string;
  fileSize?: string;
  uploadedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentPoolForm {
  documents: DocumentItem[];
}

// Event History - Career progression (aligned with backend)
export interface EventHistoryItem {
  id?: string;
  employeeId: string;
  date: string;
  type: 'PROMOTION' | 'DEMOTION' | 'TRANSFER' | 'ROLE_CHANGE' | 'JOINING' | 'RESIGNATION' | 'OTHER';
  oldRole: string;
  newRole: string;
  oldDepartment?: string;
  newDepartment?: string;
  reason: string;
  effectiveDate: string;
  order: number; // For manual ordering
  createdAt?: string;
  updatedAt?: string;
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
