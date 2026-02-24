/**
 * Excel Sheet Export / Import Service
 * Handles export and import of HR data to/from Excel (XLSX) / CSV files.
 *
 * Endpoints:
 * - POST /emp-user-management/v1/excel/export/users       — Export filtered users to XLSX
 * - GET  /emp-user-management/v1/excel/download-template  — Download empty import template
 * - POST /emp-user-management/v1/excel/import/users       — Bulk import users from CSV/XLSX
 *
 * NOTE: This service bypasses the standard apiRequest JSON wrapper because the
 * responses are either binary XLSX blobs or a custom BulkImportResult JSON body.
 */

import wretch from "wretch";
import { API_GATEWAY, apiHeaders } from "@/services/utils";
import UniversalSearchRequest from "@/types/search";

const BASE_ENDPOINT = "/emp-user-management/v1/excel";

// ==================== TYPES ====================

/** A single row that failed validation during bulk import */
export interface FailedRow {
  rowNumber: number;
  errorMessage: string;
  rowData: Record<string, unknown>;
}

/** Response body returned by POST /excel/import/users */
export interface BulkImportResult {
  success: boolean;
  statusCode: number;
  statusMessage: string;
  data: {
    successCount: number;
    failureCount: number;
    failedRows: FailedRow[];
    /** Base-64 encoded XLSX file containing only the failed rows */
    errorExcelSheet?: string;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Export Users to Excel
 * POST /emp-user-management/v1/excel/export/users
 *
 * Generates an XLSX file with up to 20 columns:
 * Employee ID, Employee Type, Status, Reporting To, Probation, Probation Period,
 * First Name, Last Name, Email, Phone, PAN, Aadhar, Contact Address,
 * Marital Status, Designation, Department, Work Location, Shift,
 * Date of Joining, Date of Birth.
 *
 * @param searchRequest - UniversalSearchRequest to filter exported users (pass {} to export all)
 * @param tenant        - Tenant ID sent via X-Tenant-ID header
 * @param accessToken   - Optional Bearer token
 * @returns Blob containing the XLSX file, or null on error
 */
export const apiExportUsersToExcel = async (
  searchRequest: UniversalSearchRequest,
  tenant: string,
  accessToken?: string
): Promise<Blob | null> => {
  const blob = await wretch(`${API_GATEWAY}${BASE_ENDPOINT}/export/users`)
    .headers(apiHeaders(tenant, accessToken))
    .json(searchRequest)
    .post()
    .badRequest((err) => { throw new Error(`Bad request: ${err.status}`); })
    .unauthorized((err) => { throw new Error(`Unauthorized: ${err.status}`); })
    .forbidden((err) => { throw new Error(`Forbidden: ${err.status}`); })
    .notFound((err) => { throw new Error(`Not found: ${err.status}`); })
    .internalError((err) => { throw new Error(`Server error: ${err.status}`); })
    .blob();

  return blob;
};

/**
 * Download Import Template
 * GET /emp-user-management/v1/excel/download-template
 *
 * Returns an empty XLSX template with all 20 required column headers.
 * Users fill this template and upload it via bulkImportUsers.
 *
 * @param tenant      - Tenant ID sent via X-Tenant-ID header
 * @param accessToken - Optional Bearer token
 * @returns Blob containing the XLSX template, or null on error
 */
export const apiDownloadImportTemplate = async (
  tenant: string,
  accessToken?: string
): Promise<Blob | null> => {
  const blob = await wretch(`${API_GATEWAY}${BASE_ENDPOINT}/download-template`)
    .headers(apiHeaders(tenant, accessToken))
    .get()
    .badRequest((err) => { throw new Error(`Bad request: ${err.status}`); })
    .unauthorized((err) => { throw new Error(`Unauthorized: ${err.status}`); })
    .forbidden((err) => { throw new Error(`Forbidden: ${err.status}`); })
    .notFound((err) => { throw new Error(`Not found: ${err.status}`); })
    .internalError((err) => { throw new Error(`Server error: ${err.status}`); })
    .blob();

  return blob;
};

/**
 * Bulk Import Users from File
 * POST /emp-user-management/v1/excel/import/users
 *
 * Accepts a CSV or XLSX file (multipart/form-data, field name "file").
 * Validates headers, processes rows in batches, and returns a BulkImportResult.
 * If there are failed rows, the result contains a base-64 encoded error XLSX sheet.
 *
 * @param file        - The CSV or XLSX File object selected by the user
 * @param tenant      - Tenant ID sent via X-Tenant-ID header
 * @param accessToken - Optional Bearer token
 * @returns BulkImportResult, or null on network/auth error
 */
export const apiBulkImportUsers = async (
  file: File,
  tenant: string,
  accessToken?: string
): Promise<BulkImportResult | null> => {
  const formData = new FormData();
  formData.append("file", file);

  // For multipart requests, we must NOT set Content-Type header
  // Let the browser set it automatically as multipart/form-data with boundary
  const headers: Record<string, string> = {
    "X-Client-Type": "web",
    "X-Tenant-ID": tenant,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const result: BulkImportResult = await wretch(
    `${API_GATEWAY}${BASE_ENDPOINT}/import/users`
  )
    .headers(headers)
    .body(formData)
    .post()
    .badRequest((err) => { throw new Error(`Bad request: ${err.status}`); })
    .unauthorized((err) => { throw new Error(`Unauthorized: ${err.status}`); })
    .forbidden((err) => { throw new Error(`Forbidden: ${err.status}`); })
    .notFound((err) => { throw new Error(`Not found: ${err.status}`); })
    .internalError((err) => { throw new Error(`Server error: ${err.status}`); })
    .json<BulkImportResult>();

  return result;
};
