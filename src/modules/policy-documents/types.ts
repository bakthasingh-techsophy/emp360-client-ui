/**
 * Policy Library Types
 */

export type PolicyStatus = "draft" | "published" | "archived";
export type PolicyCategory =
  | "hr"
  | "it"
  | "security"
  | "compliance"
  | "general"
  | "safety";
export type DocumentSourceType = "upload" | "url";

export interface PolicyVersion {
  id: string;
  policyId: string;
  versionNumber: string;
  documentId?: string; // For uploaded files
  documentUrl?: string; // For external URLs or uploaded file URL
  sourceType: DocumentSourceType;
  fileType?: "pdf" | "docx";
  fileSize?: number; // in bytes
  createdAt: string;
  updatedAt?: string;
  changeNotes?: string;
}

export interface Policy {
  id: string; // policy id.
  name: string;
  companyId: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  currentVersion: string;
  versionsIds: string[]; // Version history ids
  effectiveDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt?: string;
  mandatory?: boolean;
}

export interface PolicyFormData {
  name: string;
  companyId?: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  versionNumber: string;
  sourceType: DocumentSourceType;
  documentId?: string; // For uploaded files
  documentUrl?: string; // For URL
  fileType?: "pdf" | "docx";
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

/**
 * API Carrier Types - for backend communication
 */

/**
 * Policy Carrier
 * Payload for creating/updating policies via API
 */
export interface PolicyCarrier {
  name: string;
  companyId: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  currentVersion: string;
  versionsIds: string[];
  effectiveDate: string;
  expiryDate?: string;
  mandatory?: boolean;
  createdAt: string;
    versionNumber: string;
  documentId?: string;
  documentUrl?: string;
  sourceType: DocumentSourceType;
  fileType?: "pdf" | "docx";
  fileSize?: number; // in bytes
  changeNotes?: string;
}

/**
 * Policy Version Carrier
 * Payload for creating/updating policy versions via API
 */
export interface PolicyVersionCarrier {
  policyId: string;
  versionNumber: string;
  documentId?: string;
  documentUrl?: string;
  sourceType: DocumentSourceType;
  fileType?: "pdf" | "docx";
  fileSize?: number; // in bytes
  changeNotes?: string;
  createdAt: string;
}
