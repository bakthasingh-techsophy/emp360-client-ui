/**
 * Space Management Types
 */

export type SpaceType = 'building' | 'floor' | 'office';

export type SpaceStatus = 'active' | 'pending' | 'rejected';

export interface Space {
  spaceId: string;
  spaceName: string;
  spaceType: SpaceType;
  location: string;
  address: string;
  floorNumber?: number;
  capacity?: number;
  description?: string;
  ownerId: string;
  ownerCompany: string;
  createdAt: string;
  members: SpaceMember[];
}

export interface SpaceMember {
  companyId: string;
  companyName: string;
  joinedAt: string;
  role: 'owner' | 'member';
}

export interface SpaceConfiguration {
  spaceId: string;
  status: SpaceStatus;
  isOwner: boolean;
  requestedAt?: string;
  approvedAt?: string;
}

export interface SpaceConnectionRequest {
  requestId: string;
  spaceId: string;
  requestingCompanyId: string;
  requestingCompany: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface SpaceNotification {
  id: string;
  type: 'space_connection_request';
  spaceId: string;
  requestingCompany: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
