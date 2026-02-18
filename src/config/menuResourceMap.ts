/**
 * Menu Resource Mapping
 * Maps menu items to their corresponding resource/client in the JWT token
 * If a user doesn't have access to a resource, the menu item won't be displayed
 * and the route will be restricted
 */

export const menuResourceMap: Record<string, string> = {
  // Dashboard
  dashboard: 'dashboard',

  // Core HR
  'employee-database': 'core-hr',
  'org-structure': 'core-hr',
  'employee-documents': 'core-hr',

  // Time & Attendance
  'attendance-management': 'time-attendance',
  'shift-schedule': 'time-attendance',
  'overtime': 'time-attendance',

  // Leave Management System
  'leave-holiday': 'leave-management-system',
  'leave-settings': 'leave-management-system',
  'leave-configuration-form': 'leave-management-system',
  'holiday-management': 'leave-management-system',

  // Payroll & Compensation
  'salary-structure': 'payroll',
  'payroll-run': 'payroll',
  'statutory-compliance': 'payroll',
  'incentives-bonuses': 'payroll',

  // Recruitment & Onboarding
  'job-requisitions': 'recruitment',
  'candidate-tracking': 'recruitment',
  'interviews': 'recruitment',
  'offers-preboarding': 'recruitment',
  'onboarding': 'recruitment',

  // Performance & Development
  'goals-okrs': 'performance',
  'performance-reviews': 'performance',
  '360-feedback': 'performance',
  'training-learning': 'performance',
  'skills-career': 'performance',

  // Employee & Manager Self Service
  'my-profile': 'self-service',
  'my-attendance-leave': 'self-service',
  'my-payslips': 'self-service',
  'my-expenses': 'self-service',
  'my-requests': 'self-service',
  'team-overview': 'self-service',
  'manager-approvals': 'self-service',

  // Expenses, Travel & Assets
  'expense-management': 'expenses-assets',
  'travel-requests': 'expenses-assets',
  'advances-settlements': 'expenses-assets',
  'asset-management': 'expenses-assets',

  // Policy & Document Center
  'policy-library': 'policy-documents',
  'acknowledgements': 'policy-documents',
  'forms-templates': 'policy-documents',

  // Projects & Work Management
  'project-list': 'projects',
  'tasks-timesheets': 'projects',
  'project-attendance': 'projects',

  // Visitor & Room Management
  'visitor-management': 'visitor-management',
  'room-management': 'space-management',

  // Administration & Security
  'user-management': 'user-management',
  'company-management': 'user-management',
  'role-permissions': 'user-management',
  'audit-logs': 'user-management',
  'integrations': 'user-management',
  'system-settings': 'user-management',

  // Analytics & Dashboards
  'hr-dashboard': 'analytics',
  'workforce-analytics': 'analytics',
  'payroll-analytics': 'analytics',
  'custom-reports': 'analytics',
};

/**
 * Get the resource required for a menu item
 * @param menuId Menu item ID
 * @returns Resource name or undefined if not mapped
 */
export function getMenuResource(menuId: string): string | undefined {
  return menuResourceMap[menuId];
}

/**
 * Check if a menu item requires a specific resource
 * @param menuId Menu item ID
 * @param resource Resource name to check
 * @returns true if the menu item requires this resource
 */
export function menuRequiresResource(menuId: string, resource: string): boolean {
  return menuResourceMap[menuId] === resource;
}

/**
 * Get all menus for a specific resource
 * @param resource Resource name
 * @returns Array of menu IDs that require this resource
 */
export function getMenusForResource(resource: string): string[] {
  return Object.entries(menuResourceMap)
    .filter(([_, res]) => res === resource)
    .map(([menuId]) => menuId);
}

/**
 * Get all unique resources from the mapping
 * @returns Array of all resource names
 */
export function getAllMappedResources(): string[] {
  return Array.from(new Set(Object.values(menuResourceMap)));
}
