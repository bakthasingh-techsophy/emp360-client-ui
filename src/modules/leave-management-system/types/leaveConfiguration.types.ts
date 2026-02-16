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
 * LeaveProperties - Defines the properties and types allowed for a leave configuration
 */
export interface LeaveProperties {
  allowedTypes: string[]; // fullDay, partialDay, partialTimings
  numberOfDaysPerOneLeave: number; // defines custom value, default to 1
}

/**
 * ApplicableCategories - Defines the categories of employees for whom this leave is applicable
 */
export interface ApplicableCategories {
  gender: string; // male, female, other, all
  marriedStatus: string; // married, single, all
}

/**
 * LeaveConfiguration - Main model for leave type configuration
 * Defines policies, restrictions, and applicability rules for different leave types
 */
export interface LeaveConfiguration {
  id: string;

  // Basic Information
  name: string; // name of the leave type
  code: string; // unique code for the leave configuration
  tagline: string; // short tagline
  description: string; // detailed description
  category: string; // flexible, accrued, special

  // Timeline
  startDate: string; // start date for this leave configuration

  // Leave Properties
  leaveProperties: LeaveProperties; // types and properties of leaves

  // Credit Configuration
  allowCreditPolicy: boolean;
  creditPolicy: CreditPolicy | null; // policy for crediting leaves

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

  // Employee List
  employeeIds: string[]; // list of employees covered by this configuration

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * LeaveConfigurationCarrier - Used for creating new leave configurations
 * Omits id, createdAt, updatedAt
 */
export interface LeaveConfigurationCarrier {
  // Basic Information
  name: string;
  code: string;
  tagline: string;
  description: string;
  category: string;

  // Timeline
  startDate: string;

  // Leave Properties
  leaveProperties: LeaveProperties;

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

  // Applicability
  applicableCategories: ApplicableCategories;

  // Employee List
  employeeIds: string[];
}

/**
 * LeaveConfigurationUpdateCarrier - Used for updating existing leave configurations
 * All fields are optional except those that make sense to update
 */
export interface LeaveConfigurationUpdateCarrier {
  name?: string;
  code?: string;
  tagline?: string;
  description?: string;
  category?: string;
  startDate?: string;
  leaveProperties?: LeaveProperties;
  allowCreditPolicy?: boolean;
  creditPolicy?: CreditPolicy | null;
  allowMonetization?: boolean;
  monetizationPolicy?: MonetizationPolicy | null;
  allowExpirePolicy?: boolean;
  expirePolicy?: ExpirePolicy | null;
  calendarConfiguration?: CalendarConfiguration;
  allowRestrictions?: boolean;
  restrictions?: Restrictions | null;
  applicableCategories?: ApplicableCategories;
  employeeIds?: string[];
}

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
export interface LeaveConfigurationFormData {
  // Basic Information
  name: string;
  code: string;
  tagline: string;
  description: string;
  category: LeaveCategory;
  startDate: Date | string;

  // Leave Properties
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
  gender: Gender;
  marriedStatus: MarriageStatus;
  employeeIds: string[];
}
