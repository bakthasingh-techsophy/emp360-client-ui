/**
 * Visitor Management Types
 */

export type VisitorStatus = 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out' | 'expired';
export type RegistrationType = 'pre-registered' | 'instant';
export type VisitorPurpose = 'meeting' | 'interview' | 'delivery' | 'maintenance' | 'vendor' | 'personal' | 'other';

export interface Visitor {
  id: string;
  
  // Form fields - Basic Information
  name: string;
  email: string;
  phone: string;
  company: string | null;
  photoUrl: string | null;
  
  // Form fields - Visit Details
  purpose: VisitorPurpose;
  hostEmployeeId: string;
  
  // Form fields - Visit Schedule
  expectedArrivalDate: string; // ISO date string
  expectedArrivalTime: string; // 12-hour format (e.g., "02:00 PM")
  expectedDepartureTime: string | null; // 12-hour format
  
  // Form fields - Registration Type & Notes
  registrationType: RegistrationType;
  notes: string | null;
  
  // Derived/System fields (not in form)
  hostEmployeeName: string; // Derived from hostEmployeeId
  hostEmployeeEmail: string; // Derived from hostEmployeeId
  hostDepartment: string | null; // Derived from hostEmployeeId
  
  // Status & Check-in/out
  status: VisitorStatus;
  checkInTime: string | null; // ISO datetime
  checkOutTime: string | null; // ISO datetime
  
  // Metadata
  createdBy: string; // User ID who created/registered
  createdByName: string; // Name of user who created
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// Form data type - picks only form fields from Visitor
export type VisitorFormData = Pick<Visitor, 
  | 'name' 
  | 'email' 
  | 'phone' 
  | 'company'
  | 'purpose'
  | 'hostEmployeeId'
  | 'registrationType'
  | 'expectedArrivalTime'
  | 'expectedDepartureTime'
  | 'notes'
> & {
  expectedArrivalDate: Date; // Date object for form, string in Visitor
  photoUrl?: string; // Optional in form, added after submission
};

export interface VisitorStats {
  totalVisitors: number;
  checkedIn: number;
  pending: number;
  expectedToday: number;
}
