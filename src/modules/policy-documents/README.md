## Policy Library Module

A comprehensive policy document management system for organizations to upload, manage, and distribute company policies to employees.

### Features

#### For Administrators
- ✅ Upload new policies (file upload or external URL)
- ✅ Edit existing policies
- ✅ Delete policies with confirmation
- ✅ Set policy status (Active, Draft, Archived)
- ✅ Categorize policies (HR, IT, Security, Compliance, General, Safety)
- ✅ Mark policies as mandatory
- ✅ Set effective and expiry dates
- ✅ Version management

#### For Employees
- ✅ View all active policies
- ✅ Search and filter policies
- ✅ Open policy documents in new tab
- ✅ See policy metadata (category, version, dates, views)
- ✅ Identify mandatory policies

### File Structure

```
src/modules/policy-documents/
├── PolicyLibrary.tsx          # Main component
├── types.ts                   # TypeScript interfaces
├── constants.ts               # Labels, colors, icons
├── mockData.ts               # Sample policy data
└── components/
    ├── PolicyStatsCards.tsx   # Statistics cards
    ├── PolicyCard.tsx         # Individual policy card
    └── PolicyFormModal.tsx    # Upload/Edit modal
```

### Components

#### PolicyLibrary (Main)
Main page component with:
- Statistics dashboard (Total, Active, Draft, Mandatory)
- Search and filter toolbar
- Card grid layout
- Role-based actions (admin vs employee)
- Upload/Edit modal integration
- Confirmation dialogs

#### PolicyStatsCards
Displays 4 statistics cards:
- Total Policies
- Active Policies
- Draft Policies
- Mandatory Policies

#### PolicyCard
Individual policy card showing:
- Policy name and description
- Category and status badges
- Mandatory indicator
- Version and file size
- Effective/Expiry dates
- Uploaded by information
- View count
- Action buttons (role-based)

#### PolicyFormModal
Form modal for creating/editing policies with fields:
- Policy name *
- Description
- Category * (dropdown)
- Status * (Draft/Active/Archived)
- Version *
- Document source (File upload or URL)
- Effective date *
- Expiry date (optional)
- Mandatory checkbox

### Data Types

```typescript
type PolicyStatus = 'active' | 'draft' | 'archived';
type PolicyCategory = 'hr' | 'it' | 'security' | 'compliance' | 'general' | 'safety';

interface Policy {
  id: string;
  name: string;
  description?: string;
  category: PolicyCategory;
  status: PolicyStatus;
  version: string;
  fileUrl?: string;
  fileType?: 'pdf' | 'docx' | 'url';
  fileSize?: number;
  effectiveDate: string;
  expiryDate?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  updatedAt?: string;
  viewCount?: number;
  mandatory?: boolean;
}
```

### Features in Detail

#### 1. Card-Based Layout
Policies are displayed in a responsive grid:
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop
- 4 columns on large screens

#### 2. Search & Filters
**Search**: By name, description, or category
**Filters**:
- Status (Active, Draft, Archived)
- Category (HR, IT, Security, Compliance, General, Safety)
- Mandatory (Yes/No)

#### 3. Role-Based Access
**Admin Actions**:
- Upload Policy button in toolbar
- Edit button on each card
- Delete option in card menu
- Download option

**Employee View**:
- View Policy button only
- No edit/delete options
- No upload button in toolbar

#### 4. Confirmation Dialogs
Uses the generic ConfirmationDialog component for:
- Delete confirmation with warning
- Shows policy name and destructive action warning

#### 5. File Handling
- Supports PDF and DOCX file uploads
- Supports external URLs
- Shows file type icon (📄 PDF, 📝 DOCX, 🔗 URL)
- Displays file size in MB

#### 6. Visual Indicators
**Status Colors**:
- Active: Green
- Draft: Yellow
- Archived: Gray

**Category Colors**:
- HR: Blue
- IT: Purple
- Security: Red
- Compliance: Orange
- General: Gray
- Safety: Green

**Special Badges**:
- Mandatory (red border)
- Expired (destructive variant)

### Integration Points

1. **GenericToolbar**: Reuses search and filter functionality
2. **ConfirmationDialog**: Shared confirmation component
3. **PageLayout**: Standard layout wrapper
4. **Shadcn UI**: All UI components (cards, badges, buttons, forms)

### Mock Data

8 sample policies included covering:
- Code of Conduct (HR, Mandatory)
- Remote Work Policy (HR)
- Data Security & Privacy (Security, Mandatory)
- IT Acceptable Use (IT, Mandatory)
- Leave and Attendance (HR)
- Workplace Safety (Safety, Mandatory)
- Social Media Draft (General, Draft)
- Anti-Harassment (Compliance, Mandatory)

### Usage Example

```tsx
import { PolicyLibrary } from '@/modules/policy-documents/PolicyLibrary';

// In your routing
<Route path="/policies" element={<PolicyLibrary />} />
```

### API Integration Points

Replace console.log calls with actual API calls:
- `handleFormSubmit`: Create/Update policy
- `handleDelete`: Delete policy
- `handleView`: Track view count
- Initial data fetch

### Future Enhancements

- [ ] Policy acknowledgment tracking
- [ ] Email notifications for new/updated policies
- [ ] Policy comparison (version diff)
- [ ] Advanced search with date ranges
- [ ] Bulk upload
- [ ] Policy templates
- [ ] Analytics dashboard
- [ ] Document preview
- [ ] Comments/feedback
- [ ] Policy history/audit trail
