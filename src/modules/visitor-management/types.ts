/**
 * Visitor Management Types
 */

export type VisitorStatus = 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out' | 'expired';
export type VisitorPurpose = 'meeting' | 'interview' | 'delivery' | 'maintenance' | 'vendor' | 'personal' | 'other';

export interface Visitor {
  id: string;
  
  // Form fields - Basic Information
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  companyId: string | null;
  photoUrl: string | null;
  
  // Form fields - Visit Details
  purpose: VisitorPurpose;
  employeeId: string;
  
  // Form fields - Visit Schedule
  expectedArrivalDateTime: string; // ISO UTC timestamp (e.g., "2026-02-09T14:02:00.000Z")
  
  // Form fields - Notes
  notes: string | null;
  
  // Status & Check-in/out
  visitorStatus: VisitorStatus;
  checkInTime: string | null; // ISO datetime
  checkOutTime: string | null; // ISO datetime
  
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

/**
 * Visitor Snapshot - extends Visitor with derived fields for table rendering
 * Used for displaying visitor information in tables with enriched host details
 */
export interface VisitorSnapshot extends Visitor {
  // Derived host information (populated from employeeId)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Form data type - picks only form fields from Visitor
export type VisitorFormData = Pick<Visitor, 
  | 'visitorName' 
  | 'visitorEmail' 
  | 'visitorPhone' 
  | 'companyId'
  | 'purpose'
  | 'employeeId'
  | 'expectedArrivalDateTime'
  | 'notes'
> & {
  photoUrl?: string; // Optional in form, added after submission
};

/**
 * Visitor Carrier - matches backend payload structure
 * Used for API requests/responses
 * Note: id is optional (not sent on create, backend generates it)
 */
export interface VisitorCarrier {
  id?: string; // Optional: not required for create, backend generates it
  
  // Basic Information
  name: string;
  email: string;
  phone: string;
  companyId: string | null;
  photoUrl: string | null;
  
  // Visit Details
  purpose: VisitorPurpose;
  hostEmployeeId: string;
  
  // Visit Schedule
  expectedArrivalDateTime: string; // ISO UTC timestamp (e.g., "2026-02-09T14:02:00.000Z")
  
  // Notes
  notes: string | null;
  
  // Status
  visitorStatus: VisitorStatus;
  
  // Timestamps
  createdAt: string; // ISO UTC timestamp
}
