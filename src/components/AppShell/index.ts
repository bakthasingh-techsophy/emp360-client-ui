/**
 * AppShell - Reusable Application Shell Components
 * 
 * This module exports completely generic, reusable shell components
 * that can be used in ANY React/TypeScript project.
 * 
 * @example
 * ```tsx
 * import { AppShell, MenuPickerSheet, type AppShellMenuItem } from '@/components/AppShell';
 * ```
 */

// Main AppShell component and types
export { AppShell } from './AppShell';
export type {
  AppShellMenuItem,
  AppShellMenuGroup,
  AppShellProps,
} from './AppShell';

// Menu Picker Sheet - Generic reusable component
export { MenuPickerSheet, MenuPickerDialog } from './MenuPickerDialog';
export type {
  GenericMenuItem,
  MenuPickerCategory,
  MenuPickerSheetProps,
} from './MenuPickerDialog';

/**
 * 📚 USAGE NOTES:
 * 
 * 1. These components are GENERIC and REUSABLE
 * 2. They accept all configuration via PROPS
 * 3. No app-specific logic is embedded here
 * 4. For app-specific layouts, see @/layout folder
 * 
 * 5. AppShell Props Summary:
 *    - allMenuItems: Your menu items array
 *    - pinnedMenuIds: User's pinned menu IDs
 *    - onTogglePin: Pin/unpin handler
 *    - menuCategories: Categories for menu picker
 *    - headerContent: Custom header toolbar
 *    - sheetAnimationDuration: Sheet animation speed (ms)
 *    - logo, brandName: Branding
 *    - onNavigate: Navigation handler
 * 
 * 6. Complete documentation: See REUSABLE.md
 */

