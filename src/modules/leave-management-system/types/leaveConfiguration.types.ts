/**
 * Leave Configuration Types
 * Matches backend models from com.techsophy.user_management.models.leaves
 */

/**
 * ProbationRestrictions - Defines restrictions for employees in probation period
 */
export interface ProbationRestrictions {
  allowed: boolean; // whether leave is applicable to employees in probation
}

/**
 * Restrictions - Defines various restrictions for a leave configuration
 */
export interface Restrictions {
  approvalRequired: boolean; // if true, respective person should approve the leave
  maxConsecutiveDays: number; // how many consecutive days can be applied
  minGapBetweenLeaves: number; // minimum gap between leaves
  maxRequestsPerYear: number; // how many requests can be raised per year
  includeHolidaysWeekends: boolean; // include holidays and weekends in calculation
  probationRestrictions: ProbationRestrictions; // restrictions for probation period
}

/**
 * CalendarConfiguration - Defines the calendar settings for a leave configuration
 */
export interface CalendarConfiguration {
  monthType: string; // standard or custom
  startDay: number; // standard - 1, custom any
  yearType: string; // fiscal year type
  startMonth: number; // start month - 1-12
}

/**
 * ExpirePolicy - Defines the expiration policy for a leave configuration
 */
export interface ExpirePolicy {
  carryForward: boolean; // won't expire, if true
  expireFrequency: string; // monthly, afterCredit, yearly, custom
  afterCreditExpiryDays: number; // days after credit expiry
  customDates: string[]; // custom dates, if custom
}

/**
 * MonetizationPolicy - Defines the monetization policy for a leave configuration
 */
export interface MonetizationPolicy {
  encashableCount: number; // number of leaves that can be encashed
  encashableLimit: number; // maximum limit for encashment
}

/**
 * CreditPolicy - Defines the credit policy for a leave configuration
 */
export interface CreditPolicy {
  onDemandCredit: boolean; // credit will be based on user request
  value: number; // number of leave to be credited
  frequency: string; // monthly, yearly, quarterly, custom
  customDates: string[]; // custom dates, if custom
  maxLimit: number; // credit limit, credit will stop after this point
}

/**
 * LMSProperties - Defines the properties and types allowed for an absence configuration
 */
export interface LMSProperties {
  allowedTypes: string[]; // fullDay, partialDay, partialTimings
  numberOfDaysPerOneLeave: number; // defines custom value, default to 1
}

/**
 * @deprecated Use LMSProperties instead
 */
export type LeaveProperties = LMSProperties;

/**
 * ApplicableCategories - Defines categories of applicability for leave configuration
 * Now simplified to only represent structural applicability
 */
export interface ApplicableCategories {
  // This interface can be extended in future for other applicability criteria
  // For now, gender and marriedStatus have been moved to LeaveConfiguration root
}

/**
 * LMSConfiguration - Main model for absence type configuration (Leave Management System)
 * Defines policies, restrictions, and applicability rules for different absence types
 */
export interface LMSConfiguration {
  id: string;

  // Basic Information
  name: string; // name of the absence type
  code: string; // unique code for the configuration
  tagline: string; // short tagline
  description: string; // detailed description for the absence type

  // Category
  category: string; // flexible, accrued, special, monetization

  // LMS Properties
  lmsProperties: LMSProperties; // types and properties of absences

  // Credit Configuration
  allowCreditPolicy: boolean;
  creditPolicy: CreditPolicy | null; // policy for crediting absences

  // Monetization Configuration
  allowMonetization: boolean;
  monetizationPolicy: MonetizationPolicy | null; // policy for monetization

  // Expiration Configuration
  allowExpirePolicy: boolean;
  expirePolicy: ExpirePolicy | null; // policy for expiration

  // Calendar Configuration
  calendarConfiguration: CalendarConfiguration; // calendar settings

  // Restrictions Configuration
  allowRestrictions: boolean;
  restrictions: Restrictions | null; // various restrictions

  // Applicability
  applicableCategories: ApplicableCategories; // applicable employee categories

  // Company ID
  companyId: string; // company this configuration belongs to

  // Employee List
  employeeIds: string[]; // list of employees covered by this configuration

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use LMSConfiguration instead
 */
export type LeaveConfiguration = LMSConfiguration;

/**
 * LMSConfigurationCarrier - Used for creating new LMS configurations
 * Omits id, createdAt, updatedAt
 */
export interface LMSConfigurationCarrier {
  // Basic Information
  name: string;
  code: string;
  tagline: string;
  description: string;

  // Category
  category: string;

  // LMS Properties
  lmsProperties: LMSProperties;

  // Credit Configuration
  allowCreditPolicy: boolean;
  creditPolicy: CreditPolicy | null;

  // Monetization Configuration
  allowMonetization: boolean;
  monetizationPolicy: MonetizationPolicy | null;

  // Expiration Configuration
  allowExpirePolicy: boolean;
  expirePolicy: ExpirePolicy | null;

  // Calendar Configuration
  calendarConfiguration: CalendarConfiguration;

  // Restrictions Configuration
  allowRestrictions: boolean;
  restrictions: Restrictions | null;

  // Company ID
  companyId: string;

  // Employee List
  employeeIds: string[];
}

/**
 * @deprecated Use LMSConfigurationCarrier instead
 */
export type LeaveConfigurationCarrier = LMSConfigurationCarrier;

/**
 * LMSConfigurationUpdateCarrier - Used for updating existing LMS configurations
 * All fields are optional except those that make sense to update
 */
export interface LMSConfigurationUpdateCarrier {
  name?: string;
  code?: string;
  tagline?: string;
  description?: string;
  category?: string;
  lmsProperties?: LMSProperties;
  allowCreditPolicy?: boolean;
  creditPolicy?: CreditPolicy | null;
  allowMonetization?: boolean;
  monetizationPolicy?: MonetizationPolicy | null;
  allowExpirePolicy?: boolean;
  expirePolicy?: ExpirePolicy | null;
  calendarConfiguration?: CalendarConfiguration;
  allowRestrictions?: boolean;
  restrictions?: Restrictions | null;
  companyId?: string;
  employeeIds?: string[];
}

/**
 * @deprecated Use LMSConfigurationUpdateCarrier instead
 */
export type LeaveConfigurationUpdateCarrier = LMSConfigurationUpdateCarrier;

/**
 * Type guards and validators
 */

export const LeaveCategories = ['flexible', 'accrued', 'special', 'monetization'] as const;
export type LeaveCategory = typeof LeaveCategories[number];

export const LeaveTypeOptions = ['fullDay', 'partialDay', 'partialTimings'] as const;
export type LeaveTypeOption = typeof LeaveTypeOptions[number];

export const CreditFrequencies = ['monthly', 'yearly', 'quarterly', 'custom'] as const;
export type CreditFrequency = typeof CreditFrequencies[number];

export const ExpireFrequencies = ['monthly', 'afterCredit', 'yearly', 'custom'] as const;
export type ExpireFrequency = typeof ExpireFrequencies[number];

export const MonthTypes = ['standard', 'custom'] as const;
export type MonthType = typeof MonthTypes[number];

export const GenderOptions = ['male', 'female', 'other', 'all'] as const;
export type Gender = typeof GenderOptions[number];

export const MarriageStatusOptions = ['married', 'single', 'all'] as const;
export type MarriageStatus = typeof MarriageStatusOptions[number];

export const EmployeeTypeOptions = ['fullTime', 'partTime', 'intern', 'contract', 'all'] as const;
export type EmployeeTypeOption = typeof EmployeeTypeOptions[number];

/**
 * Form data types for UI
 */
export interface LMSConfigurationFormData {
  // Basic Information
  name: string;
  code: string;
  tagline: string;
  description: string;
  category: LeaveCategory;
  startDate: Date | string;

  // LMS Properties
  allowedTypes: LeaveTypeOption[];
  numberOfDaysPerOneLeave: number;

  // Credit Configuration
  allowCreditPolicy: boolean;
  onDemandCredit?: boolean;
  creditValue?: number;
  creditFrequency?: CreditFrequency;
  creditCustomDates?: string[];
  creditMaxLimit?: number;

  // Monetization Configuration
  allowMonetization: boolean;
  encashableCount?: number;
  encashableLimit?: number;

  // Expiration Configuration
  allowExpirePolicy: boolean;
  carryForward?: boolean;
  expireFrequency?: ExpireFrequency;
  afterCreditExpiryDays?: number;
  expireCustomDates?: string[];

  // Calendar Configuration
  monthType: MonthType;
  startDay: number;
  yearType: string;
  startMonth: number;

  // Restrictions Configuration
  allowRestrictions: boolean;
  approvalRequired?: boolean;
  maxConsecutiveDays?: number;
  minGapBetweenLeaves?: number;
  maxRequestsPerYear?: number;
  includeHolidaysWeekends?: boolean;
  probationAllowed?: boolean;

  // Applicability
  isForAllEmployeeTypes: boolean;
  companyId: string;
  employeeIds: string[];
}

/**
 * @deprecated Use LMSConfigurationFormData instead
 */
export type LeaveConfigurationFormData = LMSConfigurationFormData;

/**
 * LeaveBalanceModel - Unified absence balance model that supports 4 types:
 * 1. ACCRUED: available, consumed, accrued (where accrued = available + consumed)
 * 2. FLEXIBLE: consumed (consumption-only, no available/accrued, like remote work requests)
 * 3. SPECIAL: available, consumed, expired
 * 4. MONETIZATION: available, encashable, monetizable
 * 
 * Type is determined by LMSConfiguration.category field
 * Unused properties will be null for the given type
 */
export interface LeaveBalanceModel {
  // ACCRUED type properties
  available?: number | null; // Available balance days (ACCRUED, SPECIAL, MONETIZABLE)
  consumed?: number | null; // Consumed balance days (ACCRUED, FLEXIBLE, SPECIAL)
  accrued?: number | null; // Total accrued = available + consumed (ACCRUED only, calculated)
  
  // FLEXIBLE type properties
  // consumed (shared above)
  
  // SPECIAL type properties
  // available (shared above)
  // consumed (shared above)
  expired?: number | null; // Expired balance days (SPECIAL only)
  
  // MONETIZABLE type properties
  encashable?: number | null; // Encashable balance days (MONETIZABLE)
  monetizable?: number | null; // Monetizable balance days (MONETIZABLE)
}

/**
 * LeaveDetails - Employee leave information and balances
 * Contains employee personal information and leave balance map for all assigned leave types
 */
export interface LeaveDetails {
  id: string; // Usually employeeId for easy retrieval
  
  // Employee Information
  email: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  maritalStatus: MarriageStatus;

  // Leave Balances
  assignedLeaveTypes: string[]; // Array of leave codes assigned to the employee
  balances: Record<string, LeaveBalanceModel>; // Map: leaveCode -> balance details

  // Timestamps
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * LeaveDetailsCarrier - Data transfer object for creating/updating leave details
 * Used in API requests without the id field
 */
export interface LeaveDetailsCarrier {
  email: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  maritalStatus: MarriageStatus;
  assignedLeaveTypes: string[];
  balances: Record<string, LeaveBalanceModel>;
}

/**
 * EmployeeLeavesInformation - Combined employee absence information
 * Contains both absence balances and LMS configurations for self-service view
 */
export interface EmployeeLeavesInformation {
  balances: Record<string, LeaveBalanceModel>; // Key: absence type code, Value: balance details
  configurations: Record<string, LMSConfiguration>; // Key: absence type code, Value: configuration
}
