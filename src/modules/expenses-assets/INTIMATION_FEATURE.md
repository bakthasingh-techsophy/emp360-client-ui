# Intimation Feature Implementation

## Overview
The intimation feature allows employees to notify the finance team about upcoming expenses for better planning and budget management before actual expenses are incurred.

## Architecture

### 1. Types (`types/intimation.types.ts`)
- **IntimationType**: `'travel'` | `'other'`
- **IntimationStatus**: `'draft'` | `'submitted'` | `'acknowledged'` | `'cancelled'`
- **JourneySegment**: Structure for travel segments with from/to locations, dates, transport mode, and costs
- **IntimationFormData**: Main form data interface
- **Intimation**: Complete intimation record with employee details and status

### 2. Branch Form Components

#### JourneyFormBranch (`components/JourneyFormBranch.tsx`)
Purpose: Handles travel intimations with multiple journey segments

**Features:**
- Add/remove journey segments dynamically
- Each segment includes:
  - From/To locations
  - Travel date
  - Mode of transport
  - Estimated cost
  - Optional notes
- Real-time total cost calculation
- Visual segment numbering (Segment 1, 2, 3...)
- Professional card-based UI with icons

**Props:**
- `value`: Array of JourneySegment objects
- `onChange`: Callback to update segments

#### OtherFormBranch (`components/OtherFormBranch.tsx`)
Purpose: Handles generic (non-travel) intimations

**Features:**
- Simple description textarea
- Professional card-based UI
- Clear instructions for users

**Props:**
- `value`: Description string
- `onChange`: Callback to update description

### 3. Main Form (`IntimationForm.tsx`)

#### Structure
```
├── Header (with icon and description)
├── Type Selector (Travel/Other dropdown)
├── Branch Form Renderer (switches based on type)
├── Additional Notes (optional textarea)
└── Fixed Action Bar (Cancel/Submit buttons)
```

#### Features
- **Dynamic Form Rendering**: Automatically switches between JourneyFormBranch and OtherFormBranch based on selected type
- **Form Validation**:
  - Travel: Validates all journey segments have required fields
  - Other: Validates description is not empty
- **State Management**: Uses react-hook-form for centralized form state
- **Toast Notifications**: Success/error feedback for user actions
- **Total Cost Calculation**: Automatically calculates total estimated cost for travel intimations
- **Responsive Design**: Works on all screen sizes

#### Validation Rules
**Travel Type:**
- At least one journey segment required
- All locations (from/to) must be filled
- Mode of transport required for each segment
- Travel date required for each segment

**Other Type:**
- Description field is required
- Cannot be empty or only whitespace

#### Form Submission
On submit, creates payload with:
- Form data (type, segments/description, notes)
- Estimated total cost (for travel type)
- Status set to 'submitted'
- Timestamp metadata

### 4. Integration

#### ExpenseList.tsx
Added "New Intimation" button next to "New Expense" button:
- Icon: Bell icon for visibility
- Variant: Outline style to differentiate from primary action
- Position: Right side of tab bar

#### App.tsx
Added route: `/expense-management/intimation/new` → `IntimationForm`

## User Flow

### Travel Intimation
1. User clicks "New Intimation" button
2. Form opens with "Travel" type selected by default
3. One journey segment is pre-populated
4. User fills in journey details (A → B)
5. User can add more segments (B → C → D)
6. System calculates total estimated cost
7. User optionally adds additional notes
8. User submits → navigates back to expense list

### Other Intimation
1. User clicks "New Intimation" button
2. User selects "Other" from type dropdown
3. Form switches to simple description field
4. User describes the intimation purpose
5. User optionally adds additional notes
6. User submits → navigates back to expense list

## File Structure
```
src/modules/expenses-assets/
├── IntimationForm.tsx                      # Main parent form
├── components/
│   ├── JourneyFormBranch.tsx              # Travel intimation branch form
│   ├── OtherFormBranch.tsx                # Generic intimation branch form
│   └── index.ts                           # Updated exports
└── types/
    └── intimation.types.ts                # Type definitions
```

## Design Patterns

### Branch Form Pattern
- Branch forms are **presentation components only**
- No submission logic or action bars
- Controlled by parent form via props
- Reusable and testable
- Clear separation of concerns

### Parent Form Pattern
- Manages overall form state with react-hook-form
- Handles type selection and form switching
- Performs validation
- Handles submission and navigation
- Contains fixed action bar

### Component Modularity
- Each component has single responsibility
- Components can be reused in different contexts
- Easy to add new intimation types in future
- Follows existing expense form architecture

## Future Enhancements
1. **Approval Workflow**: Add approval flow similar to expenses
2. **More Types**: Add specific types like "Equipment", "Event", etc.
3. **Budget Integration**: Check against department budgets
4. **Notifications**: Email notifications to finance team
5. **History View**: List of submitted intimations with status tracking
6. **Templates**: Save journey templates for frequent routes

## Technical Notes
- Uses shadcn/ui components for consistency
- Follows existing form patterns in the codebase
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Form validation with react-hook-form
- Toast notifications for user feedback
- Sidebar-aware fixed action bar
