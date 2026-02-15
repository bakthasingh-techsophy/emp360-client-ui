# Asset Management Module

A comprehensive asset management system for tracking and managing company assets, assignments, and inventory.

## Overview

The Asset Management module provides a complete solution for managing company assets including IT equipment, furniture, vehicles, and office supplies. It features advanced filtering, sorting, search capabilities, and a clean user interface built with GenericToolbar and DataTable components.

## Features

- **Asset Tracking**: Track assets with detailed information including serial numbers, purchase details, and warranty
- **Assignment Management**: Assign assets to employees and track assignment history
- **Status Management**: Track asset status (Available, Assigned, Retired, Under Maintenance)
- **Category Organization**: Organize assets by category (IT Equipment, Furniture, Vehicles, etc.)
- **Advanced Search**: Search by asset name, code, serial number, or description
- **Flexible Filtering**: Filter by status, category, vendor, location, purchase date, and more
- **Column Configuration**: Customize visible columns to match your workflow
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Structure

```
asset-management/
├── AssetManagement.tsx          # Main page component
├── components/
│   ├── AssetsTable.tsx          # Data table component
│   └── index.ts
├── types.ts                      # TypeScript type definitions
├── constants.ts                  # Constants and configuration
├── mockData.ts                   # Mock data for development
└── index.ts                      # Module exports
```

## Types

### Core Types

- `Asset`: Core asset definition with all fields
- `AssetSnapshot`: Extended asset with employee details for table display
- `AssetFormData`: Form data for creating/editing assets
- `AssetAssignment`: Tracks asset assignment history
- `AssetFilters`: Filter configuration

### Enums

- `AssetStatus`: 'available' | 'assigned' | 'retired' | 'under-maintenance'
- `AssetCategory`: 'Electronics' | 'Furniture' | 'Vehicles' | 'IT Equipment' | 'Office Supplies' | 'Other'

## Components

### AssetManagement

Main page component that provides:
- Page header with title and "Add Asset" button
- GenericToolbar with search, filters, sorting, and column configuration
- AssetsTable for displaying and managing assets

### AssetsTable

Data table component featuring:
- Customizable columns
- Pagination
- Row actions (View, Edit, Delete)
- Empty state with call-to-action
- Confirmation dialogs for destructive actions

## Usage

### Accessing the Module

Navigate to `/asset-management` in the application. The menu item is located under the "Expenses & Assets" category in the sidebar.

### Adding an Asset

1. Click the "Add Asset" button in the page header
2. Fill in the asset details (name, code, category, etc.)
3. Optionally assign to an employee
4. Save the asset

### Managing Assets

- **View**: Click the row menu → View Details
- **Edit**: Click the row menu → Edit
- **Delete**: Click the row menu → Delete (with confirmation)

### Filtering Assets

Use the toolbar filters to narrow down assets by:
- Status (Available, Assigned, Retired, Under Maintenance)
- Category (IT Equipment, Furniture, etc.)
- Asset Name or Code
- Serial Number
- Vendor
- Location
- Purchase Date
- Assigned Employee

### Sorting Assets

Sort by:
- Creation Date
- Update Date
- Asset Name
- Asset Code
- Purchase Date
- Purchase Price

## Routes

- Main page: `/asset-management`
- Create new: `/asset-management?mode=create` (planned)
- Edit asset: `/asset-management?mode=edit&id={assetId}` (planned)
- View details: `/asset-management?mode=view&id={assetId}` (planned)

## Integration

### Menu Configuration

Added to [menuConfig.tsx](../../config/menuConfig.tsx):

```tsx
{
  id: 'asset-management',
  to: '/asset-management',
  icon: Package,
  label: 'Asset Management',
  category: 'Expenses & Assets',
}
```

### App Routing

Added to [App.tsx](../../App.tsx):

```tsx
import { AssetManagement } from './modules/asset-management';

// In routes:
<Route path="/asset-management" element={<AssetManagement />} />
```

## Development

### Mock Data

The module currently uses mock data from `mockData.ts` with 8 sample assets covering various categories and statuses.

### Future Enhancements

- [ ] API integration for CRUD operations
- [ ] Asset assignment form
- [ ] Asset details view modal
- [ ] Asset history tracking
- [ ] Barcode/QR code scanning
- [ ] Asset maintenance scheduling
- [ ] Bulk import/export
- [ ] Asset depreciation tracking
- [ ] Mobile app integration

## Dependencies

- React 18+
- React Router DOM
- TanStack Table (react-table)
- Lucide React (icons)
- shadcn/ui components
- GenericToolbar component
- DataTable component

## Related Modules

- **User Management**: For employee assignment
- **Expense Management**: For asset purchase tracking
- **Self Service**: For employee asset requests (planned)

## Notes

- Assets tab has been removed from User Management Settings
- Now a dedicated, independent module with its own page and menu item
- Uses the same GenericToolbar and DataTable patterns as Visitor Management
- Fully typed with TypeScript for type safety
- Zero compilation errors
