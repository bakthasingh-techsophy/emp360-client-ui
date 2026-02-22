# Template Form Page Refactoring Summary

## Overview
Refactored **TemplateFormPage** to follow the common pattern used in **ApplyLeavePage**, **EmployeeOnboarding**, and **VisitorRegistrationForm** pages, with proper Zod validation schema and structured layout.

## Changes Made

### 1. **New Zod Validation Schema**
**File:** `src/modules/performance/schemas/templateSchema.ts`

- Created comprehensive Zod schema with three main parts:
  - `templateColumnSchema` - Validates individual template columns
  - `templateRowSchema` - Validates individual template rows  
  - `templateFormSchema` - Main form validation schema
  
- **Field Validations:**
  - **title**: Required, minimum 3 characters, maximum 150 characters
  - **department**: Required, must be from predefined options
  - **description**: Optional, maximum 500 characters
  - **templateStatus**: Boolean, defaults to true
  - **columns**: Array, minimum 1, maximum 50 columns required
  - **rows**: Array, minimum 1, maximum 100 rows required

### 2. **Refactored TemplateFormPage**
**File:** `src/modules/performance/TemplateFormPage.tsx`

#### Structure:
```
┌─────────────────────────────────────┐
│  Header Section (Sticky)            │
│  - Back button + title + subtitle   │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│  Form Error Alert (if any)          │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│  Main Content Area                  │
│  - TemplateBuilder Component        │
│  - Scrollable                       │
│  - Padding bottom for action bar    │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│  Fixed Bottom Action Bar            │
│  - Cancel button (outline)          │
│  - Save/Create button (primary)     │
│  - Shows loading state              │
└─────────────────────────────────────┘
```

#### Key Features:
- **Sticky Header**: Navigation remains visible while scrolling through form
- **Ref-based Communication**: Uses `useRef` with `TemplateBuilderRef` to get form data from child component
- **Validation Integration**: Collects validation errors from Zod schema and passes them to TemplateBuilder
- **Error Display**: Shows form-level errors in alert, field-level errors in builder component
- **Loading State**: Proper loading indicators during template fetch and save operations
- **Success Navigation**: Navigates to `/performance-reviews?tab=templates` after successful save

### 3. **Updated TemplateBuilder Component**
**File:** `src/modules/performance/components/TemplateBuilder.tsx`

#### Changes:
- **Converted to forwardRef** with `TemplateBuilderRef` interface
  ```typescript
  export interface TemplateBuilderRef {
    getSaveData: () => PerformanceTemplate | null;
  }
  ```

- **Accepts validationErrors Prop**: Displays validation messages under fields
  ```typescript
  interface TemplateBuilderProps {
    // ... other props
    validationErrors?: Record<string, string>;
  }
  ```

- **Removed Action Buttons**: Now only renders form content
  - Save/Cancel buttons moved to parent's fixed action bar
  - Cleaner, more focused component responsibility

- **Enhanced Validation Display**:
  - Error icons and messages under required fields
  - Red border styling for invalid fields
  - Error alerts for columns/rows validation
  - Empty state messages for columns and rows

- **Improved UX**:
  - Better visual feedback (hover effects on items)
  - Improved spacing and typography
  - Better distinction between editable/non-editable states
  - Clear indication of which fields are required (*)

## Implementation Pattern

This refactoring establishes the following pattern for form pages:

```typescript
// 1. Create validation schema
const formSchema = z.object({ /* ... */ });

// 2. In parent page component:
const builderRef = useRef<BuilderRef>(null);

// 3. Handle save:
const handleSave = () => {
  const data = builderRef.current?.getSaveData();
  // Validate and submit
  const result = schema.safeParse(data);
  if (result.success) {
    // Handle success
  } else {
    // Collect and display errors
  }
};

// 4. In JSX:
<Component ref={builderRef} validationErrors={errors} />
```

## File Structure

```
src/modules/performance/
├── TemplateFormPage.tsx (refactored)
├── components/
│   └── TemplateBuilder.tsx (refactored)
├── schemas/
│   └── templateSchema.ts (NEW)
├── types/
│   └── index.ts (unchanged)
└── context/
    └── PerformanceReviewContext.tsx (unchanged)
```

## Benefits

1. **Consistency**: All form pages now follow the same pattern
2. **Better Validation**: Comprehensive Zod schema with detailed error messages
3. **Improved UX**: 
   - Sticky header for easy navigation
   - Fixed action bar for consistent CTA location
   - Field-level error display
   - Clear loading states
4. **Cleaner Code**: 
   - Separated concerns (validation vs form rendering)
   - Reusable schema pattern
   - Better TypeScript support
5. **Maintainability**: 
   - Clear structure makes it easy to extend
   - Schema serves as single source of truth for validation
   - Ref-based communication is explicit and type-safe

## Testing Checklist

- [ ] Navigate to `/performance-reviews/templates/new`
- [ ] Fill in form fields and verify validation messages appear on blur/submit
- [ ] Try submitting with missing required fields - should show errors
- [ ] Try submitting without columns/rows - should show collection errors
- [ ] Create a new template - should navigate back to list and show in table
- [ ] Navigate to edit template (`/performance-reviews/templates/:id/edit`)
- [ ] Verify existing data loads correctly
- [ ] Update template - should navigate back and reflect changes
- [ ] Click Cancel - should navigate back without saving
- [ ] Scroll through form - header and action bar should remain visible
- [ ] Check responsive design on mobile breakpoints

## Future Enhancements

1. Add field-level validation constraints display (e.g., "Max 150 characters")
2. Implement optimistic updates for faster perceived performance
3. Add unsaved changes warning before navigation
4. Add form field tooltips for complex options
5. Consider implementing debounced validation for real-time feedback
6. Add drag-and-drop reordering for columns and rows
