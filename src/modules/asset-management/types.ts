/**
 * Asset Management Types
 */

export type AssetStatus = 'available' | 'assigned' | 'retired' | 'under-maintenance';
export type AssetCategory = 'Electronics' | 'Furniture' | 'Vehicles' | 'IT Equipment' | 'Office Supplies' | 'Other';

/**
 * Asset - Core asset definition
 */
export interface Asset {
  id: string;
  assetName: string;
  assetCode: string;
  category: AssetCategory;
  description?: string;
  status: AssetStatus;
  
  // Assignment details
  assignedTo?: string; // Employee ID
  assignedDate?: string; // ISO datetime
  expectedReturnDate?: string; // ISO datetime
  
  // Purchase details
  purchaseDate?: string; // ISO datetime
  purchasePrice?: number;
  vendor?: string;
  warrantyExpiryDate?: string; // ISO datetime
  
  // Additional metadata
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  location?: string;
  notes?: string;
  
  companyId: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

/**
 * Asset Snapshot - extends Asset with employee details for table display
 */
export interface AssetSnapshot extends Asset {
  // Derived employee information (populated from assignedTo)
  employeeFirstName?: string;
  employeeLastName?: string;
  employeeEmail?: string;
  employeeDepartment?: string;
}

/**
 * Asset Form Data - for creating/editing assets
 */
export type AssetFormData = Pick<Asset, 
  'assetName' | 'assetCode' | 'category' | 'description' | 'status' | 
  'assignedTo' | 'assignedDate' | 'expectedReturnDate' |
  'purchaseDate' | 'purchasePrice' | 'vendor' | 'warrantyExpiryDate' |
  'serialNumber' | 'modelNumber' | 'manufacturer' | 'location' | 'notes'
>;

/**
 * Asset Assignment - for tracking asset assignments
 */
export interface AssetAssignment {
  id: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  employeeId: string;
  employeeName: string;
  assignedDate: string; // ISO datetime
  returnDate?: string; // ISO datetime
  expectedReturnDate?: string; // ISO datetime
  notes?: string;
  status: 'active' | 'returned';
  createdAt: string;
  updatedAt: string;
}

/**
 * Asset Filter Options
 */
export interface AssetFilters {
  status?: AssetStatus[];
  category?: AssetCategory[];
  assignedTo?: string;
  searchTerm?: string;
}
