/**
 * Visitor Management Types
 */

export type VisitorStatus = 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out' | 'expired';
export type RegistrationType = 'pre-registered' | 'instant';
export type VisitorPurpose = 'meeting' | 'interview' | 'delivery' | 'maintenance' | 'vendor' | 'personal' | 'other';

export interface Visitor {
  id: string;
  // Basic Information
  name: string;
  email: string;
  phone: string;
  company?: string;
  idType?: 'passport' | 'driving_license' | 'national_id' | 'other';
  idNumber?: string;
  photoUrl?: string;
  
  // Visit Details
  purpose: VisitorPurpose;
  purposeDetails?: string;
  hostEmployeeId: string;
  hostEmployeeName: string;
  hostEmployeeEmail: string;
  hostDepartment?: string;
  
  // Registration Info
  registrationType: RegistrationType;
  registeredBy: string; // User ID who registered
  registeredByName: string;
  registrationDate: string;
  
  // Visit Schedule
  expectedArrivalDate: string;
  expectedArrivalTime: string; // 12-hour format (e.g., "02:00 PM")
  expectedDepartureTime?: string; // 12-hour format (e.g., "04:00 PM")
  
  // Status & Approval
  status: VisitorStatus;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvalDate?: string;
  rejectionReason?: string;
  
  // Check-in/out
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  checkedInBy?: string;
  checkedInByName?: string;
  checkedOutBy?: string;
  checkedOutByName?: string;
  
  // Security
  badgeNumber?: string;
  accessLevel?: string;
  escortRequired?: boolean;
  
  // Additional
  notes?: string;
  vehicleNumber?: string;
  itemsCarried?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface VisitorFormData {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  company?: string;
  
  // Visit Details
  purpose: VisitorPurpose;
  hostEmployeeId: string;
  registeringForOther?: boolean; // For employees registering for someone else
  
  // Visit Schedule
  expectedArrivalDate: Date;
  expectedArrivalTime: string; // 12-hour format
  expectedDepartureTime?: string; // 12-hour format
  
  // Registration Type
  registrationType: RegistrationType;
  
  // Notes
  notes?: string;
}

export interface VisitorStats {
  totalVisitors: number;
  checkedIn: number;
  pending: number;
  expectedToday: number;
}
