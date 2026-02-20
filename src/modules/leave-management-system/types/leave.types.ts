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
