/**
 * User Management Settings Types
 * Types for employee configuration entities
 */

/**
 * Employee Type
 * Represents employment classifications (Full-time, Part-time, Contract, etc.)
 */
export interface EmployeeType {
  id: string;
  description: string;
}

/**
 * Work Location
 * Represents office locations and remote work settings
 */
export interface WorkLocation {
  id: string;
  description: string;
}

/**
 * Designation
 * Represents job titles and positions
 */
export interface Designation {
  id: string;
  description: string;
}

/**
 * Department
 * Represents organizational departments and units
 */
export interface Department {
  id: string;
  description: string;
}
