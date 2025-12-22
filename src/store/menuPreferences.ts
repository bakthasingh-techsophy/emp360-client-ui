/**
 * Menu Preferences Store
 * Manages user's pinned/visible menu items in sidebar (Outlook-style)
 */

const MENU_PREFERENCES_KEY = 'emp360_menu_preferences';

export interface MenuPreferences {
  pinnedMenuIds: string[];
  lastUpdated: string;
}

/**
 * Default pinned menus (shown initially)
 * Focused on most commonly used HRMS features
 */
const DEFAULT_PINNED_MENUS = [
  'dashboard',
  'visitor-management',
  'room-booking',
  'policy-library',
  'expense-management',
  'user-management',
  'my-profile',
  'leave-holiday',
  'system-settings',
  'attendance-management',
  'project-list',
];

/**
 * Get user's menu preferences from localStorage
 */
export function getMenuPreferences(): MenuPreferences {
  try {
    const stored = localStorage.getItem(MENU_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load menu preferences:', error);
  }

  // Return defaults if nothing stored
  return {
    pinnedMenuIds: DEFAULT_PINNED_MENUS,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save user's menu preferences to localStorage
 */
export function saveMenuPreferences(preferences: MenuPreferences): void {
  try {
    preferences.lastUpdated = new Date().toISOString();
    localStorage.setItem(MENU_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save menu preferences:', error);
  }
}

/**
 * Add a menu to pinned list
 */
export function addPinnedMenu(menuId: string): void {
  const prefs = getMenuPreferences();
  if (!prefs.pinnedMenuIds.includes(menuId)) {
    prefs.pinnedMenuIds.push(menuId);
    saveMenuPreferences(prefs);
  }
}

/**
 * Remove a menu from pinned list
 */
export function removePinnedMenu(menuId: string): void {
  const prefs = getMenuPreferences();
  prefs.pinnedMenuIds = prefs.pinnedMenuIds.filter((id) => id !== menuId);
  saveMenuPreferences(prefs);
}

/**
 * Check if a menu is pinned
 */
export function isMenuPinned(menuId: string): boolean {
  const prefs = getMenuPreferences();
  return prefs.pinnedMenuIds.includes(menuId);
}

/**
 * Reset to default pinned menus
 */
export function resetMenuPreferences(): void {
  saveMenuPreferences({
    pinnedMenuIds: DEFAULT_PINNED_MENUS,
    lastUpdated: new Date().toISOString(),
  });
}
