/**
 * Space Management Types
 */

// ============================================================================
// Core Space Entity
// ============================================================================

/**
 * Main space entity for visitor management
 * Represents a physical location (building, floor, office) where visitors are managed
 */
export interface Space {
  id: string; // Unique space identifier (e.g., TECH-TOWER-01)
  spaceName: string; // Friendly name for the space
  address: string; // Full address of the space
  description?: string; // Optional description
  ownerId: string; // ID of the company that owns this space
  ownerCompany: string; // Name of the owner company
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// ============================================================================
// Member Reference
// ============================================================================

/**
 * Minimal member reference for companies in a space
 * Contains only essential information needed for display and filtering
 */
export interface MemberReference {
  id: string; // Unique member ID
  companyId: string; // Company identifier
  name: string; // Company name
  email: string; // Contact email
  phone?: string; // Contact phone
  contactInfo?: string; // Combined contact information
  joinedDate: string; // ISO timestamp when joined the space
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// ============================================================================
// Connection Requests
// ============================================================================

/**
 * Status of a space connection request
 */
export type ConnectionRequestStatus = "pending" | "approved" | "rejected";

/**
 * Request from a company to join an existing space
 */
export interface SpaceConnectionRequest {
  id: string; // Unique request ID
  spaceId: string; // Target space ID
  requestingCompanyId: string; // ID of requesting company
  requestingCompany: string; // Name of requesting company
  message: string; // Message explaining why connection is needed
  status: ConnectionRequestStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  reviewedAt?: string; // ISO timestamp when reviewed
  reviewedBy?: string; // ID of user who reviewed
}

// ============================================================================
// Generic Notification System
// ============================================================================

/**
 * All supported notification types across the application
 */
export type NotificationType = "space_connection_request";

/**
 * Status of a notification
 */
export type NotificationStatus = "unread" | "read" | "archived";

/**
 * Generic notification structure
 * The metadata property contains type-specific data
 *
 * @template T - Type of metadata (specific to notification type)
 *
 * @example
 * // Space connection request notification
 * const notification: Notification<SpaceConnectionRequestMetadata> = {
 *   id: 'NOTIF-123',
 *   type: 'space_connection_request',
 *   message: 'Company ABC wants to connect to your space',
 *   status: 'unread',
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   metadata: {
 *     spaceId: 'TECH-TOWER-01',
 *     requestId: 'REQ-123',
 *     requestingCompany: 'Company ABC',
 *     requestStatus: 'pending'
 *   }
 * };
 */
export interface Notification<T = any> {
  id: string;
  type: NotificationType;
  subject: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
  metadata: T; // Type-specific data
}

// ============================================================================
// Notification Metadata Types
// ============================================================================

/**
 * Metadata for space connection request notifications
 */
export interface SpaceConnectionRequestMetadata {
  spaceId: string;
  requestingTenantId: string;
  requestingCompanyId: string;
}