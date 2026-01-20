/**
 * Intimation Types
 * Type definitions for expense intimation requests
 */

// ==================== Enums ====================

export type IntimationType = 'travel' | 'other';

export type IntimationStatus = 
  | 'draft'
  | 'submitted'
  | 'acknowledged'
  | 'cancelled';

// ==================== Journey Related ====================

export interface JourneySegment {
  id: string;
  from: string;
  to: string;
  fromDate: string; // ISO date string - journey start date
  toDate: string; // ISO date string - journey end date
  modeOfTransport: string;
  estimatedCost: number;
  notes?: string;
}

export interface JourneyExpense {
  accommodation?: number;
  meals?: number;
  localTransport?: number;
  other?: number;
  notes?: string;
}

// ==================== Core Interfaces ====================

export interface IntimationFormData {
  type: IntimationType;
  journeySegments?: JourneySegment[]; // For travel type
  description?: string; // For other type
  additionalNotes?: string;
}

export interface Intimation {
  id: string;
  intimationNumber: string; // e.g., "INT-2024-001"
  
  // Employee details
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  
  // Intimation details
  type: IntimationType;
  journeySegments?: JourneySegment[];
  description?: string;
  additionalNotes?: string;
  
  // Calculated totals (for travel)
  estimatedTotalCost?: number;
  
  // Status and workflow
  status: IntimationStatus;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  acknowledgedAt?: string;
}
