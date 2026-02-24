/**
 * Excel Sheet Context
 * Provides Excel export/import operations globally with built-in error/success notifications,
 * loading state management, and automatic auth resolution.
 *
 * Features:
 * - Export users to XLSX with optional filter params
 * - Download empty import template
 * - Bulk import users from CSV/XLSX file
 * - Auto-triggers browser download on success
 * - Error/success toast notifications
 * - Separate loading states for export and import
 * - Auto token validation and tenant resolution
 */

import { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { resolveAuth, removeStorageItem } from "@/store/localStorage";
import StorageKeys from "@/constants/storageConstants";
import {
  apiExportUsersToExcel,
  apiDownloadImportTemplate,
  apiBulkImportUsers,
  BulkImportResult,
} from "@/services/excelSheetService";
import UniversalSearchRequest from "@/types/search";

// ==================== CONTEXT TYPE ====================

interface ExcelSheetContextType {
  /**
   * Export users matching the given UniversalSearchRequest to an XLSX file.
   * Pass an empty object `{}` to export all users.
   * Automatically triggers a browser download on success.
   * @returns true on success, false on failure
   */
  exportUsersToExcel: (searchRequest?: UniversalSearchRequest) => Promise<boolean>;

  /**
   * Download the empty XLSX import template.
   * No auth required. Triggers a browser download.
   * @returns true on success, false on failure
   */
  downloadImportTemplate: () => Promise<boolean>;

  /**
   * Upload a CSV or XLSX file to bulk-import users.
   * On success, shows a summary toast. If there are failed rows,
   * automatically downloads the error XLSX sheet.
   * @param file - The .csv or .xlsx File selected by the user
   * @returns BulkImportResult on success, null on failure
   */
  bulkImportUsers: (file: File) => Promise<BulkImportResult | null>;

  /** True while an export or template-download operation is in progress */
  isExporting: boolean;

  /** True while a bulk import operation is in progress */
  isImporting: boolean;
}

// ==================== CONTEXT ====================

const ExcelSheetContext = createContext<ExcelSheetContextType | undefined>(
  undefined
);

// ==================== PROVIDER ====================

export function ExcelSheetProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // ---- Auth helpers ----

  const validateToken = (): { tenant: string; token: string } | null => {
    const auth = resolveAuth();

    if (!auth.accessToken) {
      toast({
        title: "Authentication Failed",
        description: "Session expired. Please login again.",
        variant: "destructive",
      });
      removeStorageItem(StorageKeys.SESSION);
      return null;
    }

    return { tenant: auth.tenant || "", token: auth.accessToken };
  };

  const handleError = (error: any, title = "Export Failed") => {
    console.error(`[ExcelSheet] ${title}:`, error);

    let description = "An unexpected error occurred.";
    if (error?.message) {
      description = error.message;
    }

    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  // ---- Download helper ----

  /**
   * Trigger a browser file download from a Blob.
   */
  const triggerDownload = (blob: Blob, filename: string) => {
    const xlsxBlob = new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(xlsxBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    // Delay revoke so the browser has time to start the download
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 200);
  };

  /** Generate a timestamped filename. */
  const makeFilename = (prefix: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    return `${prefix}_${datePart}_${timePart}.xlsx`;
  };

  // ==================== EXPORT METHODS ====================

  /**
   * Export Users to Excel
   * Calls POST /emp-user-management/v1/excel/export/users and downloads the XLSX blob.
   */
  const exportUsersToExcel = async (
    searchRequest: UniversalSearchRequest = {}
  ): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    setIsExporting(true);
    try {
      const blob = await apiExportUsersToExcel(searchRequest, auth.tenant, auth.token);

      if (!blob || blob.size === 0) {
        handleError(new Error("Server returned an empty file."), "Export Failed");
        return false;
      }

      triggerDownload(blob, makeFilename("users_export"));

      toast({
        title: "Export Successful",
        description: "Users have been exported to Excel successfully.",
      });

      return true;
    } catch (error) {
      handleError(error, "Export Failed");
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  // ==================== TEMPLATE DOWNLOAD ====================

  /**
   * Download Import Template
   * Calls GET /emp-user-management/v1/excel/download-template and downloads the XLSX blob.
   * Requires auth with bulk-import permission.
   */
  const downloadImportTemplate = async (): Promise<boolean> => {
    const auth = validateToken();
    if (!auth) return false;

    setIsExporting(true);
    try {
      const blob = await apiDownloadImportTemplate(auth.tenant, auth.token);

      if (!blob || blob.size === 0) {
        handleError(new Error("Server returned an empty template."), "Download Failed");
        return false;
      }

      triggerDownload(blob, "users_import_template.xlsx");

      toast({
        title: "Template Downloaded",
        description: "Import template downloaded. Fill it in and upload to bulk import users.",
      });

      return true;
    } catch (error) {
      handleError(error, "Template Download Failed");
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  // ==================== BULK IMPORT ====================

  /**
   * Bulk Import Users from File
   * Calls POST /emp-user-management/v1/excel/import/users.
   * On partial failure, automatically downloads the error XLSX sheet.
   */
  const bulkImportUsers = async (file: File): Promise<BulkImportResult | null> => {
    const auth = validateToken();
    if (!auth) return null;

    setIsImporting(true);
    try {
      const result = await apiBulkImportUsers(file, auth.tenant, auth.token);

      if (!result) {
        handleError(new Error("No response from server."), "Import Failed");
        return null;
      }

      const { successCount, failureCount, errorExcelSheet } = result.data;

      if (failureCount > 0 && errorExcelSheet) {
        // Decode base-64 error sheet and trigger download
        const binaryStr = atob(errorExcelSheet);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const errorBlob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        triggerDownload(errorBlob, makeFilename("users_import_errors"));
      }

      if (failureCount === 0) {
        toast({
          title: "Import Successful",
          description: `${successCount} user(s) imported successfully.`,
        });
      } else if (successCount > 0) {
        toast({
          title: "Import Completed with Errors",
          description: `${successCount} user(s) imported, ${failureCount} failed. An error sheet has been downloaded.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Failed",
          description: `All ${failureCount} row(s) failed. Please check the downloaded error sheet.`,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      handleError(error, "Import Failed");
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  // ==================== CONTEXT VALUE ====================

  const value: ExcelSheetContextType = {
    exportUsersToExcel,
    downloadImportTemplate,
    bulkImportUsers,
    isExporting,
    isImporting,
  };

  return (
    <ExcelSheetContext.Provider value={value}>
      {children}
    </ExcelSheetContext.Provider>
  );
}

// ==================== HOOK ====================

/**
 * Custom hook to access the ExcelSheet context.
 * Must be used within an ExcelSheetProvider.
 */
export function useExcelSheet() {
  const context = useContext(ExcelSheetContext);
  if (context === undefined) {
    throw new Error("useExcelSheet must be used within an ExcelSheetProvider");
  }
  return context;
}
