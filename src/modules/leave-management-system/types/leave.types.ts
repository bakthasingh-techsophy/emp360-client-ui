/**
 * Leave Management Types
 */

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  color: string;
  icon?: string;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  color: string;
  totalAllotted: number;
  used: number;
  pending: number;
  available: number;
  carriedForward?: number;
  lapsed?: number;
}

/**
 * AbsenceApplication - Complete absence application model (Backend aligned)
 * Maps to AbsenceApplication.java in MongoDB collection
 */
export interface AbsenceApplication {
  // Core Identifiers
  id: string;
  
  // Employee Information
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  reportingTo: string; // Email of the reporting person
  
  // Absence Details
  fromDate: string; // ISO instant
  toDate: string; // ISO instant
  absenceType: string; // Code of the absence type (e.g., GL, PL, maternity, WFH)
  absenceCategory: string; // fullDay / partialDay
  reason: string;
  fromTime?: string; // ISO instant
  toTime?: string; // ISO instant
  informTo?: string[]; // List of emails
  creditReference?: string;
  
  // Absence Calculations
  totalDays?: number;
  lopDays?: number;
  lop?: boolean;
  encashmentUsage?: number;
  timeRange?: string;
  
  // Approvals
  approvedOn?: string; // ISO instant
  autoApproveAt?: string; // ISO instant
  
  // Status
  status: string; // pending, approved, rejected, etc.
  
  // Timestamps
  createdAt: string; // ISO instant
  updatedAt?: string; // ISO instant
}

/**
 * @deprecated Use AbsenceApplication instead
 */
export type LeaveApplication = AbsenceApplication;

/**
 * AbsenceCarrier - DTO for creating/updating absence applications
 * Minimal required fields for backend API without the ID
 * Maps to AbsenceCarrier.java
 */
export interface AbsenceCarrier {
  fromDate: string; // ISO instant
  toDate: string; // ISO instant
  absenceType: string; // Required - absence type code
  absenceCategory: string; // Required - fullDay / partialDay
  partialDaySelection?: string; // firstHalf / secondHalf for partial day leaves
  reason: string; // Required
  fromTime?: string; // ISO instant
  toTime?: string; // ISO instant 
  informTo?: string[]; // List of emails
  creditReference?: string; // Optional reference
  createdAt: string; // ISO instant
}

/**
 * @deprecated Use AbsenceCarrier instead
 */
export type LeaveApplicationCarrier = AbsenceCarrier;

export interface LeaveStats {
  totalLeaves: number;
  usedLeaves: number;
  pendingLeaves: number;
  availableLeaves: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

/**
 * Credit - Model for managing employee credits (e.g., comp-off, special leave credits)
 * Tracks credit allocation, consumption, and expiry for employees
 */
export interface Credit {
  // Core Identifiers
  id: string;

  // Employee Information
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  reportingTo: string; // Email of reporting manager

  // Credit Details
  creditType: string; // Type of credit (e.g., "COMP_OFF", "SPECIAL_LEAVE")
  credits: number; // Total credits allocated
  available?: number; // Current available credits
  consumed?: number; // Total credits consumed
  expiredCount?: number; // Total credits expired
  expired?: boolean;

  // Dates and Status
  fromDate: string; // Credit valid from date (ISO instant)
  toDate: string; // Credit valid until date (ISO instant)
  expiryOn: string; // Expiry date of the credit (ISO instant)

  // Approval and Tracking
  status: string; // Status of the credit (PENDING, APPROVED, REJECTED, etc.)
  reason: string; // Reason for credit allocation
  actionTookOn?: string; // ISO instant

  // Metadata
  companyId: string; // Company this credit belongs to
  createdAt: string; // ISO instant
  updatedAt?: string; // ISO instant
}

/**
 * CreditCarrier - DTO for creating/updating credit requests
 * Minimal required fields for backend API
 */
export interface CreditCarrier {
  creditType: string; // Type of credit
  fromDate: string; // ISO instant
  toDate: string; // ISO instant
  reason: string; // Reason for credit request
  informTo?: string[]; // List of emails to inform
  createdAt: string; // ISO instant
}

/**
 * HolidayInfo - Simple holiday information for display
 * Note: For full Holiday CRUD operations, use Holiday from holiday-management/types
 */
export interface HolidayInfo {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'optional' | 'restricted';
  description?: string;
  imageUrl?: string;
}
