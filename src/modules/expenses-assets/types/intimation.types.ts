/**
 * Intimation Types
 * Type definitions for expense intimation requests
 */

// ==================== Enums ====================

export type IntimationType = "travel" | "other";

export type IntimationStatus =
  | "draft"
  | "submitted"
  | "pending_approval" // Single or multi-level approval in progress
  | "approved"
  | "rejected"
  | "acknowledged"
  | "cancelled";

// Approval action types
export type ApprovalAction = "approve" | "reject";

// Approval history entry
export interface ApprovalHistoryEntry {
  id: string;
  level: string; // e.g., 'level1', 'level2'
  approverId: string;
  approverName: string;
  approverRole: string;
  action: ApprovalAction;
  comments?: string;
  timestamp: string;
  adjustedEstimatedCost?: number; // If approver modifies estimated cost
}

// ==================== Journey Related ====================

/**
 * Cost breakdown for a single journey segment
 * Provides detailed visibility into expense categories
 */
export interface JourneyCostBreakdown {
  transport: number; // Flight, train, bus, cab fares
  accommodation: number; // Hotel, lodging costs
  food: number; // Meals, refreshments
  miscellaneous: number; // Other expenses (parking, tolls, tips, etc.)
}

/**
 * Journey Segment with detailed cost breakdown
 * Each segment represents one leg of travel with independent cost tracking
 */
export interface JourneySegment {
  id: string;
  from: string;
  to: string;
  fromDate: string; // ISO date string - journey start date
  toDate: string; // ISO date string - journey end date
  modeOfTransport: string;
  notes?: string;

  // Cost breakdown - provides transparency on expense categories
  costBreakdown: JourneyCostBreakdown;

  // Calculated total from breakdown (transport + accommodation + food + miscellaneous)
  totalCost: number;

  // UI state flags (optional, not persisted to backend)
  isEditing?: boolean; // Card is in edit mode
  isSaved?: boolean; // Card has been saved
}

export interface JourneyExpense {
  accommodation?: number;
  meals?: number;
  localTransport?: number;
  other?: number;
  notes?: string;
}

// ==================== Core Interfaces ====================

/**
 * Generic Intimation Interface
 * T - Type of data (e.g., JourneySegment[] for travel type)
 */
export interface Intimation<T = any> {
  id: string;
  companyId: string; // Company ID for the intimation

  // Intimation type
  type: IntimationType; // 'travel' | 'other'

  // Raised for details (myself, another employee, or temporary person)
  raisedFor: string; // "myself" | "employee" | "temporary-person"

  // Employee details
  employeeId: string;

  // Raised by details (for intimations raised on behalf)
  raisedByEmployeeId?: string;

  // Temporary person details (if applicable - only when raisedFor="temporary-person")
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;

  // Generic data - type depends on intimation type
  data?: T; // JourneySegment[] for travel, string for other

  // Description
  description?: string;

  // Status and workflow
  status: IntimationStatus;

  // Approval workflow
  currentApprovalLevel?: string; // e.g., 'level1', 'level2'

  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface TravelIntimationData {
  journeySegments: JourneySegment[];
}

export interface OtherIntimationData {
  description: string;
}
/**
 * Specific Intimation Types
 */
export type TravelIntimation = Intimation<TravelIntimationData>;
export type OtherIntimation = Intimation<string>; // description string for 'other' type

// ==================== Carrier Types for API ====================

/**
 * IntimationCarrier
 * Carrier for creating/updating intimations
 * Minimal required fields for backend API
 */
export interface IntimationCarrier {
  // Required fields
  type: IntimationType; // 'travel' | 'other'
  raisedFor: string; // "myself" | "employee" | "temporary-person"
  description?: string;

  // Company and employee context
  companyId: string;
  employeeId?: string; // Employee ID (required when raisedFor="myself" or "employee")

  // Conditional required fields
  raisedByEmployeeId?: string; // Mandatory if raisedFor != "myself", else null

  // Temporary person fields (when raisedFor="temporary-person")
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;

  // Data based on type
  data?: any; // JourneySegment[] for travel, string for other

  // Metadata
  createdAt: string;
}

// ==================== View Models ====================

/**
 * IntimationSnapshot
 * Lightweight snapshot of intimation data optimized for table rendering
 * Extends Intimation with cached computed fields for improved performance
 */
export interface IntimationSnapshot extends Intimation {
  /**
   * Employee details for display purposes (cached from employee data)
   */
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  /**
   * Raised by details for display purposes (populated from raised by employee details)
   */
  raisedByFirstName?: string;
  raisedByLastName?: string;
  raisedByEmail?: string;
  raisedByPhone?: string;

  /**
   * Cached journey count for travel type intimations
   */
  journeyCount?: number;

  /**
   * Total estimated cost for travel intimations
   */
  totalEstimatedCost?: number;
}

// ==================== Form Data ====================

/**
 * Form data for intimation creation/editing
 */
export interface IntimationFormData {
  // General Information
  type: IntimationType; // 'travel' | 'other'
  companyId: string;
  raisedFor: string; // "myself" | "employee" | "temporary-person"
  employeeId?: string;
  raisedByEmployeeId?: string;
  description?: string;

  // Temporary person details (only when raisedFor="temporary-person")
  temporaryPersonName?: string;
  temporaryPersonPhone?: string;
  temporaryPersonEmail?: string;

  // Type-specific data
  journeySegments?: JourneySegment[]; // For travel type
}
