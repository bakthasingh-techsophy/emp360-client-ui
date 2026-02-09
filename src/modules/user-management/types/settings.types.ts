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
  employeeType: string;
  description: string;

  createdAt?: string;
  updatedAt?: string;
  // may come future properties like benefits eligibility, etc.
}

/**
 * Employee Type Carrier
 * Payload for creating/updating employee types
 * Matches backend EmployeeTypeCarrier validation rules
 */
export interface EmployeeTypeCarrier {
  id: string; // required, unique identifier
  employeeType: string; // required, display label
  description: string; // required, max 255 characters
  createdAt?: string; // optional, ISO date string (set by server on create)
}

/**
 * Work Location
 * Represents office locations and remote work settings
 */
export interface WorkLocation {
  id: string;
  location: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  // may come future properties like address, time zone, etc.
}

/**
 * Work Location Carrier
 * Payload for creating/updating work locations
 */
export interface WorkLocationCarrier {
  id: string; // required, unique identifier
  location: string; // required, display label
  description: string; // required
  createdAt: string; // ISO date string
}

/**
 * Designation
 * Represents job titles and positions
 */
export interface Designation {
  id: string;
  designation: string;
  description: string;

  createdAt?: string;
  updatedAt?: string;
  // may come future properties like seniority level, etc.
}

/**
 * Designation Carrier
 * Payload for creating/updating designations
 */
export interface DesignationCarrier {
  id: string; // required, unique identifier
  designation: string; // required, display label
  description: string; // required
  createdAt: string; // ISO date string
}

/**
 * Department
 * Represents organizational departments and units
 */
export interface Department {
  id: string;
  department: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  // may come future properties like parent department, etc.
}

/**
 * Department Carrier
 * Payload for creating/updating departments
 */
export interface DepartmentCarrier {
  id: string; // required, unique identifier
  department: string; // required, display label
  description: string; // required
  createdAt: string; // ISO date string
}
