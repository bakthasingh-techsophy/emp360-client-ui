/**
 * Policy Library Types
 */

export type PolicyStatus = 'active' | 'draft' | 'archived';
export type PolicyCategory = 'hr' | 'it' | 'security' | 'compliance' | 'general' | 'safety';

export interface Policy {
  id: string;
  name: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  version: string;
  fileUrl?: string;
  fileType?: 'pdf' | 'docx' | 'url';
  fileSize?: number; // in bytes
  effectiveDate: string;
  expiryDate?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  updatedAt?: string;
  viewCount?: number;
  mandatory?: boolean;
}

export interface PolicyFormData {
  name: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  version: string;
  fileUrl?: string;
  fileType?: 'pdf' | 'docx' | 'url';
  effectiveDate: Date;
  expiryDate?: Date;
  mandatory?: boolean;
}

export interface PolicyStats {
  totalPolicies: number;
  activePolicies: number;
  draftPolicies: number;
  mandatoryPolicies: number;
}
