import { useLayoutContext } from "@/contexts/LayoutContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Check, ChevronDown, Building2, RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/**
 * CompanySelector
 *
 * - Uses CompanyContext to read/refresh companies and set active company.
 * - If URL contains /:companyId/... it will set that company active.
 * - Selecting a company navigates to /{companyId}/dashboard and sets active company.
 */
export function CompanySelector(): JSX.Element | null {
  const location = useLocation();
  const { selectedCompanyScope, setSelectedCompanyScope } = useLayoutContext();

  // useCompany context
  const {
    activeCompany,
    companies,
    loading,
    error,
    setActiveCompany,
    refreshCompanies,
    clearActiveCompany,
  } = useCompany();

  // Determine current base route (first path segment) — used to navigate to the
  // currently active page when switching companies (e.g. /dashboard or /settings).
  const currentBase = useMemo(() => {
    try {
      const parts = location.pathname.replace(/^\//, "").split("/");
      return parts?.[0] || "dashboard";
    } catch {
      return "dashboard";
    }
  }, [location.pathname]);

  // If the URL contains a company id as the second segment (e.g. /dashboard/:id) or `/.../all`,
  // try to set the active company so the selector shows the right label.
  useEffect(() => {
    try {
      const parts = location.pathname.replace(/^\//, "").split("/");
      // pattern: /<base>/<companyId> OR /<base>/all
      const second = parts?.[1];
      if (!second) {
        // Default to "all" when no company is specified in URL
        clearActiveCompany();
        setSelectedCompanyScope('all');
        return;
      }
      if (second === "all") {
        setSelectedCompanyScope("all");
        clearActiveCompany();
        // no active company for 'all'
        return;
      }
      // Validate that the second segment is actually a valid company ID
      const isValidCompanyId = companies?.some(c => c.id === second);
      if (!isValidCompanyId) {
        // Not a company ID, skip setting active company
        return;
      }
      const urlCompanyId = second;
      if (activeCompany?.id !== urlCompanyId) {
        setActiveCompany(urlCompanyId).catch(() => {
          refreshCompanies().then(() => setActiveCompany(urlCompanyId)).catch(() => { });
        });
      }
      setSelectedCompanyScope(urlCompanyId);
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, companies]);

  // Early UI states
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium truncate">Loading companies…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium truncate">Failed to load companies</span>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return null;
  }

  const handleSelect = (companyId: string | "all") => {
    const currentMenu = currentBase || "dashboard"; // Use the current base route

    if (companyId === "all") {
      clearActiveCompany();
      setSelectedCompanyScope("all");
      // Update URL without navigation to prevent component remount
      window.history.replaceState(null, '', `/${currentMenu}/all`);
      return;
    }

    setActiveCompany(companyId).finally(() => {
      setSelectedCompanyScope(companyId);
      // Update URL without navigation to prevent component remount
      window.history.replaceState(null, '', `/${currentMenu}/${companyId}`);
    });
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await refreshCompanies();
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between gap-2 min-w-[200px] max-w-[280px]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">
                {activeCompany?.name ?? (selectedCompanyScope === "all" ? "All Companies" : "Select Company")}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* All Companies Option */}
        <DropdownMenuItem 
          onClick={() => handleSelect('all')} 
          className="cursor-pointer bg-muted/30 hover:bg-muted/50"
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Building2 className="h-4 w-4 flex-shrink-0 text-primary" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold truncate">All Companies</span>
                <span className="text-xs text-muted-foreground truncate">Show data for all companies</span>
              </div>
            </div>
            {selectedCompanyScope === "all" && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {companies.filter(c => c).map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleSelect(company.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate">{company.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {company.city ? `${company.city}, ${company.state}` : company.code || 'No location'}
                </span>
              </div>
              {activeCompany?.id === company.id && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Refresh Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={loading}
        className="h-9 w-9"
        title="Refresh companies"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}

export default CompanySelector;
