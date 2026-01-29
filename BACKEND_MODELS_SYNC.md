# Backend Models Synchronization - Complete ✅

## Overview
Frontend types have been updated to align with backend Java models. All forms now support the backend structure with employee-scoped data storage.

---

## Updated Type Definitions

### 1. **General Details Form**
**Backend Model:** `GeneralDetailsForm`

**Changes:**
- Added `id`, `createdAt`, `updatedAt` fields
- Changed `gender` enum: `'male' | 'female' | 'other'` → `'MALE' | 'FEMALE' | 'OTHER'` (Java enum format)
- Changed `maritalStatus` enum: `'single' | 'married'` → `'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'`
- Removed `employeeId` dependency (managed at parent level)

**Structure:**
```typescript
interface GeneralDetailsForm {
  id?: string;
  firstName: string;
  lastName: string;
  officialEmail: string;
  phone: string;
  secondaryPhone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  panNumber: string;
  aadharNumber: string;
  contactAddress: string;
  permanentAddress: string;
  sameAsContactAddress: boolean;
  emergencyContacts: EmergencyContact[];
  personalEmail: string;
  nationality: string;
  physicallyChallenged: boolean;
  passportNumber: string;
  passportExpiry: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  createdAt?: string;
  updatedAt?: string;
}
```

---

### 2. **Banking Details Form**
**Backend Model:** `BankingDetails` (Multiple per employee)

**Key Changes:**
- Changed from single `BankingDetailsForm` to **`BankingDetailsItem[]`** array
- Added `employeeId` field (for querying multiple accounts)
- Added `id`, `createdAt`, `updatedAt` fields
- Wrapped in `BankingDetailsForm` with `items` array

**Structure:**
```typescript
interface BankingDetailsItem {
  id?: string;
  employeeId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BankingDetailsForm {
  items: BankingDetailsItem[];
}
```

**Use Case:** Employees can now have multiple bank accounts, each searchable by `employeeId`.

---

### 3. **Document Pool Form**
**Backend Model:** `DocumentItem` (Centralized storage)

**Key Changes:**
- Changed `type` enum: `'url' | 'file'` → `'AADHAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'OTHER'` (specific document types)
- Added `employeeId` field (for centralized document storage)
- Added `id`, `createdAt`, `updatedAt` fields
- Made URL optional (can be file-based)

**Structure:**
```typescript
interface DocumentItem {
  id?: string;
  employeeId: string;
  name: string;
  type: 'AADHAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'OTHER';
  url?: string;
  fileName?: string;
  fileSize?: string;
  uploadedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DocumentPoolForm {
  documents: DocumentItem[];
}
```

**Use Case:** Centralized document management across all employees, filterable by type and employee.

---

### 4. **Employment History Form**
**Backend Model:** `EmploymentHistoryItem`

**Changes:**
- Added `employeeId` field (for filtering)
- Added `id`, `createdAt`, `updatedAt` fields

**Structure:**
```typescript
interface EmploymentHistoryItem {
  id?: string;
  employeeId: string;
  companyName: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  tenure: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

### 5. **Event History Form**
**Backend Model:** `EventHistoryItem` (Career progression)

**Key Changes:**
- Changed `type` enum to Java format: `'PROMOTION' | 'DEMOTION' | 'TRANSFER' | 'ROLE_CHANGE' | 'JOINING' | 'RESIGNATION' | 'OTHER'`
- Added `employeeId` field (for filtering)
- Added `id`, `createdAt`, `updatedAt` fields

**Structure:**
```typescript
interface EventHistoryItem {
  id?: string;
  employeeId: string;
  date: string;
  type: 'PROMOTION' | 'DEMOTION' | 'TRANSFER' | 'ROLE_CHANGE' | 'JOINING' | 'RESIGNATION' | 'OTHER';
  oldRole: string;
  newRole: string;
  oldDepartment?: string;
  newDepartment?: string;
  reason: string;
  effectiveDate: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EventHistoryForm {
  items: EventHistoryItem[];
}
```

---

## Mock Data Updates

### 1. **Banking Details Mock Data**
```typescript
mockBankingDetails: Record<string, BankingDetailsItem[]> = {
  'EMP001': [
    {
      id: 'bank-001',
      employeeId: 'EMP001',
      accountHolderName: 'Alice Martinez',
      accountNumber: '1234567890123456',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      branchName: 'New York Branch',
      ...
    },
  ],
  ...
}
```

### 2. **Documents Mock Data**
```typescript
mockDocuments: Record<string, DocumentItem[]> = {
  'EMP001': [
    {
      id: 'doc-001',
      employeeId: 'EMP001',
      name: 'Aadhar Card',
      type: 'AADHAR',
      fileName: 'aadhar_alice.pdf',
      fileSize: '2.5 MB',
      uploadedDate: '2020-01-20',
      ...
    },
    ...
  ],
  ...
}
```

### 3. **Employment History Mock Data**
```typescript
mockEmploymentHistory: Record<string, EmploymentHistoryItem[]> = {
  'EMP001': [
    {
      id: 'emp-hist-001',
      employeeId: 'EMP001',
      companyName: 'TechCorp Inc',
      role: 'Senior Developer',
      location: 'San Jose, USA',
      startDate: '2015-06-01',
      endDate: '2019-12-31',
      tenure: '4 years 7 months',
      ...
    },
    ...
  ],
  ...
}
```

### 4. **Event History Mock Data**
```typescript
mockEventHistory: Record<string, EventHistoryItem[]> = {
  'EMP001': [
    {
      id: 'event-001',
      employeeId: 'EMP001',
      date: '2020-01-15',
      type: 'JOINING',
      oldRole: '',
      newRole: 'Director of IT',
      oldDepartment: '',
      newDepartment: 'Information Technology',
      reason: 'Joined Employee 360 as Director',
      effectiveDate: '2020-01-15',
      order: 1,
      ...
    },
    ...
  ],
  ...
}
```

---

## Key Architecture Changes

### Employee-Scoped Data
All forms now follow an **employee-scoped** pattern:
- Each item includes `employeeId` field
- Mock data structured as `Record<employeeId, items[]>`
- Backend queries filtered by `employeeId` for multi-tenancy

### Enum Format Updates
Enums now follow **Java enum naming convention** (UPPERCASE):
- ✅ Gender: `MALE`, `FEMALE`, `OTHER`
- ✅ Marital Status: `SINGLE`, `MARRIED`, `DIVORCED`, `WIDOWED`
- ✅ Document Type: `AADHAR`, `PAN`, `PASSPORT`, `DRIVING_LICENSE`, `OTHER`
- ✅ Event Type: `PROMOTION`, `DEMOTION`, `TRANSFER`, `ROLE_CHANGE`, `JOINING`, `RESIGNATION`, `OTHER`

### Multi-Account Support
- **Banking Details:** Employees can have multiple bank accounts
- **Documents:** Centralized document storage per employee
- **Employment History:** Multiple past employments tracked
- **Event History:** Complete career progression timeline

---

## Files Modified

1. **`/src/modules/administration/types/onboarding.types.ts`**
   - Updated all form interfaces to match backend models
   - Added `employeeId`, `id`, `createdAt`, `updatedAt` fields
   - Changed enum formats to Java style (UPPERCASE)
   - Changed Banking Details from single form to array-based form
   - Backward compatibility maintained via type aliases

2. **`/src/modules/administration/data/mockData.ts`**
   - Added imports for updated types
   - Created comprehensive mock data for:
     - Banking Details (by employee ID)
     - Documents (by employee ID)
     - Employment History (by employee ID)
     - Event History (by employee ID)
   - Mock data includes sample records for EMP001 and EMP002

---

## Migration Guide for Components

### Banking Details Form
**Before:**
```typescript
form.watch('accountHolderName');
form.watch('accountNumber');
```

**After:**
```typescript
form.watch('items').map(item => item.accountNumber);
// Get specific employee's accounts
const accounts = mockBankingDetails['EMP001'];
```

### Document Pool Form
**Before:**
```typescript
form.watch('documents').filter(doc => doc.type === 'url');
```

**After:**
```typescript
form.watch('documents').filter(doc => doc.type === 'AADHAR');
// Get specific employee's documents
const docs = mockDocuments['EMP001'];
```

---

## Backward Compatibility

Type aliases maintained for smooth migration:
```typescript
export type PromotionHistoryItem = EventHistoryItem;
export type PromotionHistoryForm = EventHistoryForm;
```

---

## Next Steps

1. ✅ Update API endpoints to match backend models
2. ✅ Implement API calls in components
3. ✅ Add employee ID parameter to all data fetches
4. ✅ Update form submission handlers to use new structure
5. ✅ Test with actual backend API
