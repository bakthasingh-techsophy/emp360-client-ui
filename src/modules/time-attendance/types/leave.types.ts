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

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectedBy?: string;
  rejectedOn?: string;
  rejectionReason?: string;
  cancelledOn?: string;
  cancellationReason?: string;
  attachments?: string[];
  comments?: LeaveComment[];
}

export interface LeaveComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
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

export interface ApplyLeaveFormData {
  leaveTypeId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  numberOfDays: number;
  reason: string;
  attachments?: File[];
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'optional' | 'restricted';
  description?: string;
  imageUrl?: string;
}
