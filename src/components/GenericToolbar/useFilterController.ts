/**
 * Filter Controller - Utility for connecting external components to GenericToolbar's filter system
 * 
 * This allows custom components (tabs, buttons, etc.) to act as filters while
 * staying decoupled from the GenericToolbar's rendering.
 */

import { useMemo } from 'react';
import { ActiveFilter, FilterOperator } from './types';

export interface FilterControllerConfig {
  // Define what filters this controller represents
  representedFilters: Array<{
    filterId: string; // Must match a filter ID from availableFilters
    operator: FilterOperator;
    value: any;
  }>;
}

export interface FilterControllerConnection {
  activeFilters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
}

/**
 * Hook to create a filter controller for external components
 * Returns utilities to check if represented filters are active and apply/remove them
 */
export function useFilterController(
  config: FilterControllerConfig,
  connection: FilterControllerConnection
) {
  const { representedFilters } = config;
  const { activeFilters, onFilterChange } = connection;

  // Check if any of the represented filters are active
  const isActive = useMemo(() => {
    if (!representedFilters || representedFilters.length === 0) return false;
    
    return representedFilters.some(rf => 
      activeFilters.some(af => 
        af.filterId === rf.filterId && 
        af.operator === rf.operator &&
        JSON.stringify(af.value) === JSON.stringify(rf.value)
      )
    );
  }, [activeFilters, representedFilters]);

  // Apply the represented filters
  const applyFilters = () => {
    // Remove any existing filters for the same filterId
    const filterIds = new Set(representedFilters.map(rf => rf.filterId));
    const otherFilters = activeFilters.filter(af => !filterIds.has(af.filterId));
    
    // Add the new filters
    const newFilters = representedFilters.map((rf, index) => ({
      id: `${rf.filterId}-${rf.value}-${Date.now()}-${index}`,
      filterId: rf.filterId,
      operator: rf.operator,
      value: rf.value,
    }));
    
    onFilterChange([...otherFilters, ...newFilters]);
  };

  // Remove the represented filters (keeping other filters intact)
  const removeFilters = () => {
    const filterIds = new Set(representedFilters.map(rf => rf.filterId));
    const otherFilters = activeFilters.filter(af => !filterIds.has(af.filterId));
    onFilterChange(otherFilters);
  };

  // Toggle the represented filters
  const toggleFilters = () => {
    if (isActive) {
      removeFilters();
    } else {
      applyFilters();
    }
  };

  return {
    isActive,
    applyFilters,
    removeFilters,
    toggleFilters,
    activeFilters,
    onFilterChange,
  };
}

/**
 * Get filter IDs that are represented by external filter controllers
 * Use this to exclude them from the main toolbar's available filters
 */
export function getRepresentedFilterIds(
  controllers: FilterControllerConfig[]
): Set<string> {
  const ids = new Set<string>();
  
  controllers.forEach(controller => {
    if (controller.representedFilters) {
      controller.representedFilters.forEach(rf => ids.add(rf.filterId));
    }
  });
  
  return ids;
}

/**
 * Get filter IDs that are currently ACTIVE from external controllers
 * Use this to conditionally show/hide filters in the toolbar
 */
export function getActiveControllerFilterIds(
  controllers: FilterControllerConfig[],
  activeFilters: ActiveFilter[]
): Set<string> {
  const ids = new Set<string>();
  
  controllers.forEach(controller => {
    if (controller.representedFilters) {
      controller.representedFilters.forEach(rf => {
        const isActive = activeFilters.some(af => 
          af.filterId === rf.filterId && 
          af.operator === rf.operator &&
          JSON.stringify(af.value) === JSON.stringify(rf.value)
        );
        
        if (isActive) {
          ids.add(rf.filterId);
        }
      });
    }
  });
  
  return ids;
}
