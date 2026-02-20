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
 * Leave Application - Complete leave application model (Backend aligned)
 * Maps to LeaveApplication.java in MongoDB collection
 */
export interface LeaveApplication {
  // Core Identifiers
  id: string;
  
  // Employee Information
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  reportingTo: string; // Email of the reporting person
  
  // Leave Details
  fromDate: string; // ISO instant
  toDate: string; // ISO instant
  leaveType: string; // Code of the leave type (e.g., GL, PL, maternity, WFH)
  leaveCategory: string; // fullDay / partialDay
  reason: string;
  fromTime?: string; // ISO instant
  toTime?: string; // ISO instant
  informTo?: string[]; // List of emails
  specialRequestReference?: string;
  
  // Leave Calculations
  totalDays?: number;
  lopDays?: number;
  lop?: boolean;
  encashmentUsage?: number;
  timeRange?: string;
  
  // Approvals
  approvedOn?: string; // ISO instant
  autoApprovalTimeInMinutes?: string;
  
  // Status
  status: string; // pending, approved, rejected, etc.
  
  // Timestamps
  createdAt: string; // ISO instant
  updatedAt?: string; // ISO instant
}

/**
 * Leave Application Carrier - DTO for creating/updating leave applications
 * Minimal required fields for backend API without the ID
 * Maps to LeaveApplicationCarrier.java
 */
export interface LeaveApplicationCarrier {
  fromDate: string; // ISO instant
  toDate: string; // ISO instant
  leaveType: string; // Required - leave type code
  leaveCategory: string; // Required - fullDay / partialDay
  partialDaySelection?: string; // firstHalf / secondHalf for partial day leaves
  reason: string; // Required
  fromTime?: string; // HH:MM a
  toTime?: string; // HH:MM a 
  informTo?: string[]; // List of emails
}

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
