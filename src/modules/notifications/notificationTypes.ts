/**
 * Notification Types
 * Generic notification system types used across the application
 */

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
 *   subject: 'Connection Request',
 *   message: 'Company ABC wants to connect to your space',
 *   status: 'unread',
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   metadata: {
 *     spaceId: 'tech_tower_01',
 *     requestingTenantId: 'TENANT-123',
 *     requestingCompanyId: 'COMPANY-ABC'
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
