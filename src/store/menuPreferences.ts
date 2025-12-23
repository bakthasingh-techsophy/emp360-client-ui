/**
 * Menu Preferences Store
 * Manages user's pinned/visible menu items in sidebar (Outlook-style)
 */

const MENU_PREFERENCES_KEY = 'emp360_menu_preferences';

export interface MenuPreferences {
  pinnedMenuIds: string[];
  menuOrder: Record<string, number>; // Maps menuId to order position
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
  const defaultOrder: Record<string, number> = {};
  DEFAULT_PINNED_MENUS.forEach((id, index) => {
    defaultOrder[id] = index;
  });
  
  return {
    pinnedMenuIds: DEFAULT_PINNED_MENUS,
    menuOrder: defaultOrder,
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
    // Assign order as the last position
    prefs.menuOrder[menuId] = Object.keys(prefs.menuOrder).length;
    saveMenuPreferences(prefs);
  }
}

/**
 * Remove a menu from pinned list
 */
export function removePinnedMenu(menuId: string): void {
  const prefs = getMenuPreferences();
  prefs.pinnedMenuIds = prefs.pinnedMenuIds.filter((id) => id !== menuId);
  // Remove from order mapping
  delete prefs.menuOrder[menuId];
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
  const defaultOrder: Record<string, number> = {};
  DEFAULT_PINNED_MENUS.forEach((id, index) => {
    defaultOrder[id] = index;
  });
  
  saveMenuPreferences({
    pinnedMenuIds: DEFAULT_PINNED_MENUS,
    menuOrder: defaultOrder,
    lastUpdated: new Date().toISOString(),
  });
}

/**
 * Update menu order for pinned items
 * @param orderedMenuIds - Array of menu IDs in desired order
 */
export function updateMenuOrder(orderedMenuIds: string[]): void {
  const prefs = getMenuPreferences();
  const newOrder: Record<string, number> = {};
  
  orderedMenuIds.forEach((id, index) => {
    newOrder[id] = index;
  });
  
  prefs.menuOrder = newOrder;
  prefs.pinnedMenuIds = orderedMenuIds;
  saveMenuPreferences(prefs);
}

/**
 * Get ordered menu IDs for sidebar display
 * Sorts pinned menus by their order value
 */
export function getOrderedPinnedMenuIds(): string[] {
  const prefs = getMenuPreferences();
  
  return [...prefs.pinnedMenuIds].sort((a, b) => {
    const orderA = prefs.menuOrder[a] ?? Number.MAX_SAFE_INTEGER;
    const orderB = prefs.menuOrder[b] ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}
