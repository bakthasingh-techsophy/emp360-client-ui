/**
 * Types for Employee Onboarding Forms
 * Synced with backend Java models
 */

/**
 * User Status Enum - Backend aligned
 * ACTIVE: User is active and can login
 * INACTIVE: User is inactive and cannot login
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

/**
 * Employee Type Enum - Backend aligned
 * Maps to backend EmployeeType enum
 */
export enum EmployeeType {
  FULL_TIME = "FULL_TIME",
  CONTRACT = "CONTRACT",
  TEMPORARY = "TEMPORARY",
  INTERN = "INTERN",
}

/**
 * Gender Enum - Backend aligned
 */
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

/**
 * Marital Status Enum - Backend aligned
 */
export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
}

/**
 * Event Type Enum - Backend aligned
 */
export enum EventType {
  PROMOTION = "PROMOTION",
  DEMOTION = "DEMOTION",
  TRANSFER = "TRANSFER",
  ROLE_CHANGE = "ROLE_CHANGE",
  JOINING = "JOINING",
  RESIGNATION = "RESIGNATION",
  OTHER = "OTHER",
}

/**
 * Certification Type Enum - Backend aligned
 */
export enum CertificationType {
  URL = "URL",
  FILE = "FILE",
  NONE = "NONE",
}

/**
 * Document Type Enum - Backend aligned
 */
export enum DocumentType {
  URL = "URL",
  FILE = "FILE",
}

// User Details - Basic registration (Backend aligned with UserDetails.java)
export interface UserDetails {
  id: string; // Maps to @Id field - this is the employeeId
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: UserStatus;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

/**
 * User Details Snapshot - Backend aligned model
 * Maps to UserDetailsSnapshot collection in MongoDB
 */
export interface UserDetailsSnapshot {
  /** Internal unique identifier - this is the employeeId */
  id: string;
  
  firstName: string;
  lastName: string;
  designation: string;
  reportingTo?: string;

  /** Contact info */
  email: string;
  phone: string;

  /** Org structure */
  department: string;

  /** Employment status */
  status: UserStatus;

  /** Location & dates */
  location: string;
  joiningDate: string; // LocalDate as ISO string
  dateOfBirth?: string; // LocalDate as ISO string

  /** Identity documents */
  panNumber?: string;
  aadharNumber?: string;

  /** Emergency contact */
  emergencyContact?: EmergencyContact;

  /** Skills */
  skills?: string[];

  /** Audit fields */
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

/**
 * CARRIER TYPES - DTOs for API submissions (Create operations)
 * These mirror the backend carrier models and are used to send data from frontend to backend
 */

// User Details Carrier - DTO for user creation
export interface UserDetailsCarrier {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeIdChanged?: boolean;
  status: UserStatus;
  createdAt: string; // ISO instant
}

// Job Details Carrier - DTO for job details creation
export interface JobDetailsCarrier {
  officialEmail: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  designation: string;
  department?: string;
  employeeType: EmployeeType;
  workLocation?: string;
  reportingManager?: string;
  joiningDate?: string;
  dateOfBirth?: string;
  celebrationDOB?: string;
  sameAsDOB?: boolean;
  shift?: string;
  probationPeriod?: number;
  createdAt: string; // ISO instant
}

// General Details Carrier - DTO for general details creation
export interface GeneralDetailsCarrier {
  firstName: string;
  lastName: string;
  officialEmail: string;
  phone: string;
  secondaryPhone?: string;
  gender?: Gender;
  bloodGroup?: string;
  panNumber?: string;
  aadharNumber?: string;
  contactAddress?: string;
  permanentAddress?: string;
  sameAsContactAddress?: boolean;
  emergencyContacts?: EmergencyContact[];
  personalEmail?: string;
  nationality?: string;
  physicallyChallenged?: boolean;
  passportNumber?: string;
  passportExpiry?: string;
  maritalStatus?: MaritalStatus;
  createdAt: string; // ISO instant
}

// Banking Details Carrier - DTO for banking details creation
export interface BankingDetailsCarrier {
  employeeId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  createdAt: string; // ISO instant
}

// Employment History Item Carrier - DTO for employment history creation
export interface EmploymentHistoryItemCarrier {
  employeeId: string;
  companyName: string;
  role: string;
  location?: string;
  startDate?: string; // ISO instant
  endDate?: string; // ISO instant
  createdAt: string; // ISO instant
}

// Skill Item Carrier - DTO for skill creation
export interface SkillItemCarrier {
  employeeId: string;
  name: string;
  certificationType: CertificationType;
  certificationUrl?: string;
  certificationFileName?: string;
  createdAt: string; // ISO instant
}

// Document Item Carrier - DTO for document creation
export interface DocumentItemCarrier {
  employeeId: string;
  name: string;
  type: DocumentType;
  url: string;
  fileName: string;
  fileSize?: string;
  uploadedDate?: string;
  createdAt: string; // ISO instant
}

// Event History Item Carrier - DTO for event history creation
export interface EventHistoryItemCarrier {
  employeeId: string;
  date?: string;
  type: EventType;
  oldRole?: string;
  newRole?: string;
  oldDepartment?: string;
  newDepartment?: string;
  reason?: string;
  effectiveDate?: string;
  createdAt: string; // ISO instant
}

// Job Details - Professional work information (Backend aligned with JobDetails.java)
export interface JobDetails {
  id: string; // Maps to @Id field - this is the employeeId
  email: string;
  phone: string;
  secondaryPhone: string;
  designation: string;
  department: string;
  employeeType: EmployeeType;
  location: string;
  reportingTo: string;
  joiningDate: string;
  dateOfBirth: string;
  celebrationDOB: string;
  sameAsDOB: boolean;
  shift: string;
  probationPeriod: number;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

// Emergency Contact Info (Backend aligned with EmergencyContact.java)
export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

// General Details - Personal information (Backend aligned with GeneralDetails.java)
export interface GeneralDetails {
  id: string; // Maps to @Id field - this is the employeeId
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  gender: Gender;
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
  maritalStatus: MaritalStatus;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

// Banking Details (Backend aligned with BankingDetails.java)
export interface BankingDetails {
  id: string; // Maps to @Id field - this is the employeeId
  employeeId: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

// Employment History - Work experience (Backend aligned with EmploymentHistoryItem.java)
export interface EmploymentHistoryItem {
  id: string;
  employeeId: string;
  companyName: string;
  role: string;
  location: string;
  startDate: string; // ISO instant
  endDate: string; // ISO instant
  tenure: string;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

export interface EmploymentHistory {
  items: EmploymentHistoryItem[];
  viewMode: "timeline" | "edit";
}

// Skills Set (Backend aligned with SkillItem.java)
export interface SkillItem {
  id: string;
  employeeId: string;
  name: string;
  certificationType: CertificationType;
  certificationUrl?: string;
  certificationFile?: File | null; // For frontend file upload only
  certificationFileName?: string;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

export interface SkillsSetForm {
  items: SkillItem[];
  viewMode: "view" | "edit";
}

// Document Pool (Backend aligned with DocumentItem.java)
export interface DocumentItem {
  id: string;
  employeeId: string;
  name: string;
  type: DocumentType;
  url: string;
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

export interface DocumentPool {
  documents: DocumentItem[];
}

// Event History (Backend aligned with EventHistoryItem.java)
export interface EventHistoryItem {
  id: string;
  employeeId: string;
  date: string;
  type: EventType;
  oldRole: string;
  newRole: string;
  oldDepartment: string;
  newDepartment: string;
  reason: string;
  effectiveDate: string;
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
}

export interface EventHistoryForm {
  items: EventHistoryItem[];
}

export interface EventHistoryForm {
  items: EventHistoryItem[];
}

// Employee Aggregate (Backend aligned with EmployeeAggregate.java)
export interface EmployeeAggregate {
  id: string; // Maps to @Id field - this is the employeeId
  bankingDetailsIds: string[];
  documentIds: string[];
  employmentHistoryIds: string[];
  eventHistoryIds: string[];
  skillIds: string[];
  createdAt: string; // ISO instant
  updatedAt: string; // ISO instant
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
