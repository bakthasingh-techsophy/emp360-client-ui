/**
 * Holiday Management Types
 * Defines the structure for holidays applicable to companies
 */

/**
 * Holiday - Core entity for company holidays
 */
export interface Holiday {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  companyIds: string[]; // IDs of companies for which this holiday is applicable
  createdAt: string;
  updatedAt: string;
}

/**
 * HolidayCarrier - Used for creating new holidays
 */
export interface HolidayCarrier {
  name: string;
  description?: string;
  imageUrl?: string;
  companyIds: string[];
  createdAt: string;
}

/**
 * HolidayUpdateCarrier - Used for updating existing holidays
 */
export interface HolidayUpdateCarrier {
  name?: string;
  description?: string;
  imageUrl?: string;
  companyIds?: string[];
}

/**
 * HolidayFormData - Form submission shape
 */
export type HolidayFormData = {
  name: string;
  description?: string;
  imageUrl?: string;
  companyIds: string[];
};
