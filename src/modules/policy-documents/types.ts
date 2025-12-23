/**
 * Policy Library Types
 */

export type PolicyStatus = 'draft' | 'published' | 'archived';
export type PolicyCategory = 'hr' | 'it' | 'security' | 'compliance' | 'general' | 'safety';
export type DocumentSourceType = 'upload' | 'url';

export interface PolicyVersion {
  versionNumber: string;
  documentId?: string; // For uploaded files
  documentUrl?: string; // For external URLs or uploaded file URL
  sourceType: DocumentSourceType;
  fileType?: 'pdf' | 'docx';
  fileSize?: number; // in bytes
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  changeNotes?: string;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  currentVersion: string;
  versions: PolicyVersion[]; // Version history
  effectiveDate: string;
  expiryDate?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  viewCount?: number;
  mandatory?: boolean;
}

export interface PolicyFormData {
  name: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  versionNumber: string;
  sourceType: DocumentSourceType;
  documentId?: string; // For uploaded files
  documentUrl?: string; // For URL
  fileType?: 'pdf' | 'docx';
  changeNotes?: string;
  effectiveDate: Date;
  expiryDate?: Date;
  mandatory?: boolean;
}

export interface PolicyStats {
  totalPolicies: number;
  publishedPolicies: number;
  draftPolicies: number;
  mandatoryPolicies: number;
}
