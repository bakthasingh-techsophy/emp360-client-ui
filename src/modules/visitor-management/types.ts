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
  expectedArrivalTime: string;
  expectedDepartureTime?: string;
  
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
  idType?: 'passport' | 'driving_license' | 'national_id' | 'other';
  idNumber?: string;
  
  // Visit Details
  purpose: VisitorPurpose;
  purposeDetails?: string;
  hostEmployeeId: string;
  
  // Visit Schedule
  expectedArrivalDate: string;
  expectedArrivalTime: string;
  expectedDepartureTime?: string;
  
  // Registration Type
  registrationType: RegistrationType;
  
  // Additional
  notes?: string;
  vehicleNumber?: string;
  escortRequired?: boolean;
}

export interface VisitorStats {
  totalVisitors: number;
  checkedIn: number;
  pending: number;
  expectedToday: number;
}
