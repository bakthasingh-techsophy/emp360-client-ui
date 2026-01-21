# Employee Onboarding Forms - Implementation Guide

## Overview
This document outlines the complete structure for the employee onboarding system with 9 form sections.

## File Structure

```
src/modules/administration/
├── types/
│   └── onboarding.types.ts          ✅ Complete - All types defined
├── components/onboarding/
│   ├── UserDetailsForm.tsx           ✅ Complete - Simplified (6 fields)
│   ├── JobDetailsForm.tsx            📝 Placeholder - Needs implementation
│   ├── GeneralDetailsForm.tsx        📝 Placeholder - Needs implementation
│   ├── BankingDetailsForm.tsx        📝 Placeholder - Needs implementation
│   ├── EmploymentHistoryForm.tsx    📝 Placeholder - Needs implementation
│   ├── SkillsSetForm.tsx            📝 Placeholder - Needs implementation
│   ├── DocumentPoolForm.tsx         📝 Placeholder - Needs implementation
│   ├── PromotionHistoryForm.tsx     📝 Placeholder - Needs implementation
│   └── OnboardingTabsNavigation.tsx ✅ Complete - Responsive tabs
└── EmployeeOnboarding.tsx            🔄 Needs update - Wire up new forms
```

## Form Specifications

### 1. User Details Form ✅ COMPLETE
**Status**: Implemented
**Fields**: employeeId, firstName, lastName, email, phone, status
**Notes**: All fields editable, no role/department

### 2. Job Details Form 📝 TO IMPLEMENT
**Components Needed**: Combobox (with search), DatePicker, Checkbox, Dropdown
**Fields**:
- employeeId (text)
- officialEmail (email)
- primaryPhone, secondaryPhone (tel)
- designation (combobox with search)
- employeeType (dropdown: full-time, part-time, contract, intern)
- workLocation (combobox with search)
- reportingManager (combobox with search)
- joiningDate (date picker)
- dateOfBirth (date picker)
- celebrationDOB (date picker)
- sameAsDOB (checkbox - auto-fills celebrationDOB)
- shift (dropdown with options like "Day Shift (9 AM - 6 PM)")
- probationPeriod (number, months)

### 3. General Details Form 📝 TO IMPLEMENT
**Components Needed**: EditableItemsTable, Checkbox, Radio/Toggle, Textarea
**Sections**:

**Basic Info**:
- firstName, lastName, employeeId, officialEmail, phone, secondaryPhone

**Personal Details**:
- gender (dropdown: male/female/other)
- bloodGroup (dropdown: A+, A-, B+, B-, O+, O-, AB+, AB-)
- panNumber, aadharNumber (text with validation)

**Addresses**:
- contactAddress (textarea)
- permanentAddress (textarea)  
- sameAsContactAddress (checkbox - copies contact to permanent)

**Emergency Contacts** (EditableItemsTable):
- Array of: {name, relation, phone}

**Additional**:
- personalEmail
- nationality
- physicallyChallenged (toggle/checkbox, default: false)
- passportNumber, passportExpiry (date)
- maritalStatus (radio: single/married)

### 4. Banking Details Form 📝 TO IMPLEMENT
**Fields**:
- accountHolderName
- accountNumber
- ifscCode (with format validation)
- bankName
- branchName

### 5. Employment History Form 📝 TO IMPLEMENT
**Components Needed**: Timeline, EditableItemsTable, View/Edit Toggle
**Features**:
- View/Edit dropdown toggle
- **View Mode**: Display Timeline component
- **Edit Mode**: EditableItemsTable with fields:
  - companyName, role, location, startDate, endDate, tenure (auto-calculated)
- Sort by date (most recent first)

### 6. Skills Set Form 📝 TO IMPLEMENT
**Components Needed**: EditableItemsTable, File Upload, View/Edit Toggle
**Features**:
- View/Edit dropdown toggle
- **View Mode**: Cards or simple table display
- **Edit Mode**: EditableItemsTable with fields:
  - name (skill name)
  - certificationType (dropdown: url/file/none)
  - certificationUrl (if type=url)
  - certificationFile (if type=file)
- Download button for uploaded files

### 7. Document Pool Form 📝 TO IMPLEMENT
**Components Needed**: Card Grid, Modal Dialog, File Upload
**Features**:
- Grid layout (3-4 cards per row)
- Upload button (opens modal)
- Each card shows: name, type, date, size
- Modal fields:
  - name (text)
  - type selector (url/file)
  - url input OR file upload
- Edit/Delete on each card
- Download for uploaded files

### 8. Promotion/Revision History Form 📝 TO IMPLEMENT
**Components Needed**: Timeline, Modal for adding entries
**Fields per entry**:
- date
- type (promotion/demotion/transfer/role-change)
- oldRole, newRole
- oldDepartment, newDepartment (optional, for transfers)
- reason
- effectiveDate
**Features**:
- Color coding by type
- Add new entry button

### 9. Leave Details Form 🔮 FUTURE
**Status**: To be discussed later

## Tab Configuration

Update in `EmployeeOnboarding.tsx`:

```typescript
const tabs = [
  { key: 'user-details', label: 'User Details' },
  { key: 'job-details', label: 'Job Details' },
  { key: 'general-details', label: 'General Details' },
  { key: 'banking-details', label: 'Banking Details' },
  { key: 'employment-history', label: 'Employment History' },
  { key: 'skills-set', label: 'Skills Set' },
  { key: 'document-pool', label: 'Document Pool' },
  { key: 'promotion-history', label: 'Promotion History' },
  { key: 'leave-details', label: 'Leave Details' },
];
```

## Components to Use from Library

### Existing Components
- `@/components/ui/input`, `select`, `button`, `card`, `label`
- `@/components/ui/checkbox`, `radio-group`
- `@/components/common/EditableItemsTable`
- `@/components/timeline/Timeline`

### To Be Created/Configured
- Combobox with search (check shadcn/ui docs)
- DatePicker (use shadcn/ui date-picker)
- File upload component
- Document card component
- Modal dialogs for uploads

## Mock Data Updates Needed

Expand `mockUsers` in `/data/mockData.ts` to include sample data for:
- Job details (designation, shifts, etc.)
- General details (PAN, Aadhar, addresses, emergency contacts)
- Banking info
- Employment history (previous companies)
- Skills with certifications
- Documents
- Promotion history

## Implementation Steps

1. ✅ **Phase 1**: Create types and file structure (DONE)
2. 📝 **Phase 2**: Update tabs configuration in EmployeeOnboarding.tsx
3. 📝 **Phase 3**: Implement Job Details Form (comboboxes, dates)
4. 📝 **Phase 4**: Implement General Details Form (with EditableItemsTable for emergency contacts)
5. 📝 **Phase 5**: Implement Banking Details Form
6. 📝 **Phase 6**: Implement Employment History Form (Timeline + EditableItemsTable)
7. 📝 **Phase 7**: Implement Skills Set Form (with file uploads)
8. 📝 **Phase 8**: Implement Document Pool Form (card grid + modal)
9. 📝 **Phase 9**: Implement Promotion History Form (Timeline)
10. 📝 **Phase 10**: Update mock data for all forms
11. 📝 **Phase 11**: Wire up all forms in EmployeeOnboarding with form instances

## Notes

- All forms should support both create and edit modes
- Validation should be comprehensive
- File uploads need proper handling (consider file size limits)
- Comboboxes should have search/filter capability
- EditableItemsTable should support add/edit/delete rows
- Timeline component exists in `/components/timeline`

## Next Steps

Start with Phase 2: Update tabs configuration in EmployeeOnboarding.tsx to reflect the new tab structure.
