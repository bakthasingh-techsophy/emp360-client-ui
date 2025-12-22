import { create } from 'zustand';

/**
 * Generic application store using Zustand
 * 
 * This is a minimal store template. Extend it with your application-specific
 * state and actions as needed.
 * 
 * Example usage:
 * ```tsx
 * import { useStore } from '@/store/useStore';
 * 
 * function MyComponent() {
 *   const { items, loading, addItem, setLoading } = useStore();
 *   // Use your state and actions
 * }
 * ```
 */

// Example item type - replace with your own types
interface Item {
  id: string;
  name: string;
  description?: string;
}

interface AppStore {
  // State
  loading: boolean;
  items: Item[];
  
  // Actions
  setLoading: (loading: boolean) => void;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  setItems: (items: Item[]) => void;
  
  // Add your application-specific state and actions here
  // Example:
  // user: User | null;
  // setUser: (user: User | null) => void;
  // theme: 'light' | 'dark';
  // toggleTheme: () => void;
}

export const useStore = create<AppStore>((set) => ({
  // Initial state
  loading: false,
  items: [],
  
  // Actions implementation
  setLoading: (loading: boolean) => set({ loading }),
  
  addItem: (item: Item) =>
    set((state) => ({ items: [...state.items, item] })),
  
  removeItem: (id: string) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  
  updateItem: (id: string, updates: Partial<Item>) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  
  setItems: (items: Item[]) => set({ items }),
  
  // Add your application-specific implementations here
  // Example:
  // user: null,
  // setUser: (user) => set({ user }),
  // theme: 'light',
  // toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
