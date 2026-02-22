/**
 * Performance Management Service
 * Handles API operations for managing template rows and columns within templates
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/performance-management/templates/{templateId}/rows - Add row to template
 * - POST /emp-user-management/v1/performance-management/templates/{templateId}/columns - Add column to template
 * - DELETE /emp-user-management/v1/performance-management/templates/{templateId}/rows/{rowId} - Remove row from template
 * - DELETE /emp-user-management/v1/performance-management/templates/{templateId}/columns/{columnId} - Remove column from template
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";
import { PerformanceTemplate, TemplateRow, TemplateColumn, TemplateRowCarrier, TemplateColumnCarrier } from "@/modules/performance/types";

const BASE_ENDPOINT = "/emp-user-management/v1/performance-management/templates";

/**
 * Add Template Row to Template
 * POST /emp-user-management/v1/performance-management/templates/{templateId}/rows
 * 
 * Adds a template row to an existing performance template.
 * Creates the row and updates the template's rowIds list.
 * 
 * @param templateId - Performance Template ID
 * @param carrier - TemplateRowCarrier with label, weightage, and displayOrder
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateRow>>
 * 
 * @example
 * const response = await apiAddRowToTemplate('TEMPLATE-123', {
 *   label: 'Performance Metrics',
 *   weightage: 0.35,
 *   displayOrder: 1
 * }, 'tenant-001');
 */
export const apiAddRowToTemplate = async (
  templateId: string,
  carrier: TemplateRowCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateRow>> => {
  return apiRequest<TemplateRow>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/${templateId}/rows`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Add Template Column to Template
 * POST /emp-user-management/v1/performance-management/templates/{templateId}/columns
 * 
 * Adds a template column to an existing performance template.
 * Creates the column and updates the template's columnIds list.
 * 
 * @param templateId - Performance Template ID
 * @param carrier - TemplateColumnCarrier with name, type, mandatory, and other properties
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<TemplateColumn>>
 * 
 * @example
 * const response = await apiAddColumnToTemplate('TEMPLATE-123', {
 *   name: 'Technical Skills',
 *   type: 'RATING',
 *   mandatory: true,
 *   ratingRange: { min: 1, max: 5 },
 *   displayOrder: 1
 * }, 'tenant-001');
 */
export const apiAddColumnToTemplate = async (
  templateId: string,
  carrier: TemplateColumnCarrier,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<TemplateColumn>> => {
  return apiRequest<TemplateColumn>({
    method: "POST",
    endpoint: `${BASE_ENDPOINT}/${templateId}/columns`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Remove Template Row from Template
 * DELETE /emp-user-management/v1/performance-management/templates/{templateId}/rows/{rowId}
 * 
 * Removes a template row from an existing performance template.
 * Deletes the row and updates the template's rowIds list.
 * 
 * @param templateId - Performance Template ID
 * @param rowId - Template Row ID to remove
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<PerformanceTemplate>> - Returns updated template
 * 
 * @example
 * const response = await apiRemoveRowFromTemplate('TEMPLATE-123', 'ROW-456', 'tenant-001');
 */
export const apiRemoveRowFromTemplate = async (
  templateId: string,
  rowId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<PerformanceTemplate>> => {
  return apiRequest<PerformanceTemplate>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${templateId}/rows/${rowId}`,
    tenant,
    accessToken,
  });
};

/**
 * Remove Template Column from Template
 * DELETE /emp-user-management/v1/performance-management/templates/{templateId}/columns/{columnId}
 * 
 * Removes a template column from an existing performance template.
 * Deletes the column and updates the template's columnIds list.
 * 
 * @param templateId - Performance Template ID
 * @param columnId - Template Column ID to remove
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<PerformanceTemplate>> - Returns updated template
 * 
 * @example
 * const response = await apiRemoveColumnFromTemplate('TEMPLATE-123', 'COLUMN-789', 'tenant-001');
 */
export const apiRemoveColumnFromTemplate = async (
  templateId: string,
  columnId: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<PerformanceTemplate>> => {
  return apiRequest<PerformanceTemplate>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${templateId}/columns/${columnId}`,
    tenant,
    accessToken,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const performanceManagementService = {
  apiAddRowToTemplate,
  apiAddColumnToTemplate,
  apiRemoveRowFromTemplate,
  apiRemoveColumnFromTemplate,
};
