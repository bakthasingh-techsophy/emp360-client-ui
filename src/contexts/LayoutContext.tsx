import { createContext, ReactNode, useContext, useState } from 'react';

export const AVAILABLE_MENUS = [
  'dashboard',
  'settings',
  'support',
] as const;

export type ActivePage = (typeof AVAILABLE_MENUS)[number];

interface LayoutContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedCompanyScope: string | null | undefined; // Can be companyId or 'all'
  setSelectedCompanyScope: (scope: string | null | undefined) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  allowedCompanySelectorPaths: string[]; // Paths where company selector should be visible
  setAllowedCompanySelectorPaths: (paths: string[]) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedCompanyScope, setSelectedCompanyScope] = useState<string | null | undefined>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [allowedCompanySelectorPaths, setAllowedCompanySelectorPaths] = useState<string[]>([]);

  return (
    <LayoutContext.Provider value={{ activePage, setActivePage, selectedCompanyScope, setSelectedCompanyScope, sidebarCollapsed, setSidebarCollapsed, allowedCompanySelectorPaths, setAllowedCompanySelectorPaths }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};