/**
 * Company Model
 * Represents a parent company in the multi-company structure
 * One parent company can have multiple child companies (managed via tenant)
 */
export interface CompanyModel {
  id: string;
  name: string;
  description?: string;
  code?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  logoUrl?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive?: boolean;
}

/**
 * Represents a company with its hierarchy and tenants
 */
export interface CompanyWithTenants extends CompanyModel {
  tenants?: string[]; // tenant IDs associated with this company
  tenantCount?: number;
}

/**
 * Company Carrier/DTO for creating companies
 * 
 * Validation Rules:
 * - name: Required, max 255 characters
 * - description: Optional, max 500 characters
 * - code: Optional, max 50 characters
 * - email: Optional, must be valid email if provided, max 100 characters
 * - phone: Optional, max 20 characters
 * - website: Optional, max 255 characters
 * - industry: Optional, max 100 characters
 * - registrationNumber: Optional, max 50 characters
 * - address: Optional, max 500 characters
 * - city: Optional, max 100 characters
 * - state: Optional, max 100 characters
 * - country: Optional, max 100 characters
 * - zipCode: Optional, max 20 characters
 * - logoUrl: Optional, max 500 characters
 * - isActive: Optional, defaults to true
 * - createdAt: Required, ISO timestamp string
 * - createdBy: Optional, max 100 characters
 */
export interface CompanyCarrier {
  name: string; // Required
  description?: string;
  code?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  logoUrl?: string;
  isActive?: boolean;
  createdAt: string; // Required
  createdBy?: string;
}
