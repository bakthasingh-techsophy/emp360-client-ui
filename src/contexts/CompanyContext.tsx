import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { CompanyModel, CompanyCarrier } from "../types/company";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UniversalSearchRequest } from "@/types/search";
import { resolveAuth } from "@/store/localStorage";
import { apiSearchCompanies, apiGetCompanyById, apiCreateCompany, apiPatchCompany, apiDeleteCompany, apiBulkDeleteCompanies, apiBulkUpdateCompanies } from "@/services/companyService";

interface CompanyContextType {
  activeCompany: CompanyModel | null;
  companies: CompanyModel[];
  companyMap: Record<string, CompanyModel>;
  loading: boolean;
  error: string | null;

  refreshCompanies: (page?: number, size?: number, searchPayload?: UniversalSearchRequest) => Promise<void>;
  fetchCompanyById: (id: string) => Promise<CompanyModel | undefined>;
  setActiveCompany: (id: string) => Promise<void>;
  clearActiveCompany: () => void;
  createCompany: (company: CompanyCarrier) => Promise<CompanyModel>;
  updateCompany: (id: string, updates: Partial<CompanyModel>) => Promise<CompanyModel>;
  deleteCompany: (id: string) => Promise<void>;
  bulkDeleteCompanies: (ids: string[]) => Promise<void>;
  bulkUpdateCompanies: (ids: string[], updates: Partial<CompanyModel>) => Promise<CompanyModel[]>;
  getCompanyById: (id: string) => CompanyModel | undefined;
  canAccessCompany: (companyId: string) => boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const ACTIVE_COMPANY_ID_KEY = "active-company-id";

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();

  // authoritative list from backend
  const [companies, setCompanies] = useState<CompanyModel[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_COMPANY_ID_KEY) ?? null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Always ensure companies array is clean (no null/undefined values)
  const safeCompanies = useMemo(() => {
    return companies.filter((c): c is CompanyModel => c != null && typeof c === 'object' && 'id' in c);
  }, [companies]);

  // persist active id
  useEffect(() => {
    try {
      if (activeCompanyId) localStorage.setItem(ACTIVE_COMPANY_ID_KEY, activeCompanyId);
      else localStorage.removeItem(ACTIVE_COMPANY_ID_KEY);
    } catch {
      // ignore
    }
  }, [activeCompanyId]);

  // Derived active company
  const activeCompany = safeCompanies.find((c) => c.id === activeCompanyId) ?? null;

  // Helper: clear active company
  const clearActiveCompany = () => {
    setActiveCompanyId(null);
  };

  // Helper: refresh companies from API (authoritative)
  const refreshCompanies = async (page: number = 0, size: number = 1000, searchPayload?: UniversalSearchRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken, tenant } = resolveAuth();
      const payload: UniversalSearchRequest = searchPayload ?? {};
      const resp = await apiSearchCompanies(payload, page, size, tenant ?? "", accessToken ?? undefined);
      
      if (!resp) throw new Error("No response from server");
      
      if (!resp.success) {
        toast({
          title: "Failed to Load Companies",
          description: resp.message || "Unable to fetch companies. Please try again.",
          variant: "destructive",
        });
        throw new Error(resp.message || "Failed to fetch companies");
      }

      const items = (resp.data as any)?.content ?? [];
      // Filter out any null or undefined values from the response
      const validItems = items.filter((item: any) => item && item.id);
      setCompanies(validItems as CompanyModel[]);
    } catch (err: any) {
      console.error("CompanyProvider.refreshCompanies error:", err);
      setError(err?.message ?? "Failed to load companies");
      if (err?.message && err.message !== "No response from server") {
        toast({
          title: "Failed to Load Companies",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch single company by id (prefer server)
  const fetchCompanyById = async (id: string): Promise<CompanyModel | undefined> => {
    try {
      const { accessToken, tenant } = resolveAuth();
      const resp = await apiGetCompanyById(id, tenant ?? "", accessToken ?? undefined);
      
      if (resp && resp.success && resp.data) {
        const company = resp.data as CompanyModel;
        // Validate company has required fields
        if (!company || !company.id) {
          console.warn("CompanyProvider.fetchCompanyById: invalid company data", company);
          return safeCompanies.find((c) => c.id === id);
        }
        // upsert into companies
        setCompanies((prev) => {
          const idx = prev.findIndex((p) => p && p.id === company.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = company;
            return copy;
          }
          return [company, ...prev];
        });
        return company;
      }
      // if API returned non-success, return whatever is in memory (if any)
      return safeCompanies.find((c) => c.id === id);
    } catch (err) {
      console.warn("CompanyProvider.fetchCompanyById failed, returning cached if available", err);
      return safeCompanies.find((c) => c.id === id);
    }
  };

  // set active company by id: fetch if not loaded yet
  const setActiveCompany = async (id: string): Promise<void> => {
    if (!id) return;
    const present = safeCompanies.find((c) => c.id === id);
    if (!present) {
      // attempt to fetch from server
      const fetched = await fetchCompanyById(id);
      if (fetched) {
        if (!canAccessCompany(id)) {
          console.warn("CompanyProvider: user cannot access company", id);
          return;
        }
        setActiveCompanyId(fetched.id);
        return;
      } else {
        // company couldn't be fetched and not present locally
        console.warn("CompanyProvider.setActiveCompany: company not found", id);
        return;
      }
    } else {
      // check access rights
      if (!canAccessCompany(id)) {
        console.warn("CompanyProvider: user cannot access company", id);
        return;
      }
      setActiveCompanyId(id);
    }
  };

  // create via API and update local state (throws on failure)
  const createCompany = async (companyData: CompanyCarrier): Promise<CompanyModel> => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken, tenant } = resolveAuth();
      const resp = await apiCreateCompany(companyData, tenant ?? "", accessToken ?? undefined);
      
      if (!resp.success || !resp.data) {
        toast({
          title: "Failed to Create Company",
          description: resp.message || "Unable to create company. Please try again.",
          variant: "destructive",
        });
        throw new Error(resp.message || "Failed to create company");
      }

      const created = resp.data as CompanyModel;
      // Validate created company has required fields
      if (!created || !created.id) {
        throw new Error("Invalid company data returned from server");
      }
      // Filter out any null values and add the new company
      setCompanies((prev) => [created, ...prev.filter(c => c)]);
      
      toast({
        title: "Company Created",
        description: "The company has been successfully created.",
        variant: "success",
      });
      
      return created;
    } catch (err: any) {
      console.error("CompanyProvider.createCompany error:", err);
      setError(err?.message ?? "Failed to create company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // update via API and merge into local state (throws on failure)
  const updateCompany = async (id: string, updates: Partial<CompanyModel>): Promise<CompanyModel> => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken, tenant } = resolveAuth();
      const resp = await apiPatchCompany(id, updates, tenant ?? "", accessToken ?? undefined);
      
      if (!resp.success || !resp.data) {
        toast({
          title: "Failed to Update Company",
          description: resp.message || "Unable to update company. Please try again.",
          variant: "destructive",
        });
        throw new Error(resp.message || "Failed to update company");
      }

      const updated = resp.data as CompanyModel;
      // Validate updated company has required fields
      if (!updated || !updated.id) {
        throw new Error("Invalid company data returned from server");
      }
      setCompanies((prev) => prev.map((c) => (c && c.id === id ? updated : c)));
      
      toast({
        title: "Company Updated",
        description: "The company has been successfully updated.",
        variant: "success",
      });
      
      return updated;
    } catch (err: any) {
      console.error("CompanyProvider.updateCompany error:", err);
      setError(err?.message ?? "Failed to update company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCompanyById = (id: string): CompanyModel | undefined => {
    return safeCompanies.find((c) => c.id === id);
  };

  const canAccessCompany = (_companyId: string): boolean => {
    if (!user) return false;
    // Org owners and admins can access all companies
    if (user.role === "org-owner" || user.role === "org-admin") return true;
    // For other roles, implement access control based on company assignments
    return true; // Default: allow access
  };

  // delete single company via API and update local state (throws on failure)
  const deleteCompany = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken, tenant } = resolveAuth();
      const resp = await apiDeleteCompany(id, tenant ?? "", accessToken ?? undefined);
      
      if (!resp.success) {
        toast({
          title: "Failed to Delete Company",
          description: resp.message || "Unable to delete company. Please try again.",
          variant: "destructive",
        });
        throw new Error(resp.message || "Failed to delete company");
      }

      setCompanies((prev) => prev.filter((c) => c && c.id !== id));
      
      // Clear active company if it was deleted
      if (activeCompany?.id === id) {
        clearActiveCompany();
      }
      
      toast({
        title: "Company Deleted",
        description: "The company has been successfully deleted.",
        variant: "success",
      });
    } catch (err: any) {
      console.error("CompanyProvider.deleteCompany error:", err);
      setError(err?.message ?? "Failed to delete company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // bulk delete multiple companies via API and update local state (throws on failure)
  const bulkDeleteCompanies = async (ids: string[]): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken, tenant } = resolveAuth();
      const resp = await apiBulkDeleteCompanies(ids, tenant ?? "", accessToken ?? undefined);
      
      if (!resp.success) {
        toast({
          title: "Failed to Delete Companies",
          description: resp.message || "Unable to delete companies. Please try again.",
          variant: "destructive",
        });
        throw new Error(resp.message || "Failed to delete companies");
      }

      setCompanies((prev) => prev.filter((c) => c && !ids.includes(c.id)));
      
      // Clear active company if it was in the deleted list
      if (activeCompany && ids.includes(activeCompany.id)) {
        clearActiveCompany();
      }
      
      toast({
        title: "Companies Deleted",
        description: `${ids.length} companies have been successfully deleted.`,
        variant: "success",
      });
    } catch (err: any) {
      console.error("CompanyProvider.bulkDeleteCompanies error:", err);
      setError(err?.message ?? "Failed to delete companies");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // bulk update multiple companies via API and update local state (throws on failure)
  const bulkUpdateCompanies = async (ids: string[], updates: Partial<CompanyModel>): Promise<CompanyModel[]> => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken, tenant } = resolveAuth();
      const resp = await apiBulkUpdateCompanies({ ids, updates }, tenant ?? "", accessToken ?? undefined);
      
      if (!resp.success) {
        toast({
          title: "Failed to Update Companies",
          description: resp.message || "Unable to update companies. Please try again.",
          variant: "destructive",
        });
        throw new Error(resp.message || "Failed to update companies");
      }

      const updatedCompanies = (resp.data as CompanyModel[]) || [];
      // Validate and filter updated companies
      const validUpdated = updatedCompanies.filter(c => c && c.id);
      setCompanies((prev) => {
        const updatedMap = new Map(validUpdated.map((c) => [c.id, c]));
        return prev.map((c) => c && updatedMap.get(c.id) || c).filter(c => c);
      });
      
      toast({
        title: "Companies Updated",
        description: `${ids.length} companies have been successfully updated.`,
        variant: "success",
      });
      
      return updatedCompanies;
    } catch (err: any) {
      console.error("CompanyProvider.bulkUpdateCompanies error:", err);
      setError(err?.message ?? "Failed to update companies");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // initial load: refresh companies from server when user/org changes
  useEffect(() => {
    // attempt to refresh and keep previous state if it fails
    refreshCompanies().catch((e) => {
      console.debug("CompanyProvider initial refresh failed:", e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.orgId]);

  const companyMap = useMemo(() => {
    const map = safeCompanies.reduce((acc, company) => {
      acc[company.id] = company;
      return acc;
    }, {} as Record<string, CompanyModel>);

    return map;
  }, [safeCompanies]);

  return (
    <CompanyContext.Provider
      value={{
        activeCompany,
        companies: safeCompanies,
        companyMap,
        loading,
        error,
        refreshCompanies,
        fetchCompanyById,
        setActiveCompany,
        clearActiveCompany,
        createCompany,
        updateCompany,
        deleteCompany,
        bulkDeleteCompanies,
        bulkUpdateCompanies,
        getCompanyById,
        canAccessCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
