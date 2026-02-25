/**
 * Role Management Service
 * Main service for role and resource management operations
 *
 * Endpoints:
 * - POST /emp-user-management/v1/role-management/resources - Create resource
 * - POST /emp-user-management/v1/role-management/resources/delete - Delete resource
 * - POST /emp-user-management/v1/role-management/resources/:resourceId/roles - Create role
 * - POST /emp-user-management/v1/role-management/roles/delete - Delete role
 */

import { ApiResponse } from "@/types/responses";
import { apiRequest } from "./utils";
import { ResourceCarrier, RoleModelCarrier, DeleteResourceCarrier, DeleteRoleCarrier } from "@/modules/role-management";

const BASE_PATH = "/emp-user-management/v1/role-management";

/**
 * Create Resource via Role Management
 * POST /emp-user-management/v1/role-management/resources
 */
export const apiCreateResourceViaRoleManagement = async (
  carrier: ResourceCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  return apiRequest<any>({
    method: "POST",
    endpoint: `${BASE_PATH}/resources`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Update Resource via Role Management
 * PATCH /emp-user-management/v1/role-management/resources/:id
 */
export const apiUpdateResourceViaRoleManagement = async (
  id: string,
  payload: Record<string, any>,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  return apiRequest<any>({
    method: "PATCH",
    endpoint: `${BASE_PATH}/resources/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Resource via Role Management
 * POST /emp-user-management/v1/role-management/resources/delete
 * Accepts DeleteResourceCarrier with resourceId and deleteFromKeycloak flag
 */
export const apiDeleteResourceViaRoleManagement = async (
  carrier: DeleteResourceCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  return apiRequest<any>({
    method: "POST",
    endpoint: `${BASE_PATH}/resources/delete`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Create Role via Role Management
 * POST /emp-user-management/v1/role-management/resources/:resourceId/roles
 */
export const apiCreateRoleViaRoleManagement = async (
  resourceId: string,
  carrier: RoleModelCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  return apiRequest<any>({
    method: "POST",
    endpoint: `${BASE_PATH}/resources/${resourceId}/roles`,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Update Role via Role Management
 * PATCH /emp-user-management/v1/role-management/roles/:id
 */
export const apiUpdateRoleViaRoleManagement = async (
  id: string,
  payload: Record<string, any>,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  return apiRequest<any>({
    method: "PATCH",
    endpoint: `${BASE_PATH}/roles/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Role via Role Management
 * POST /emp-user-management/v1/role-management/roles/delete
 * Accepts DeleteRoleCarrier with roleId and deleteFromKeycloak flag
 */
export const apiDeleteRoleViaRoleManagement = async (
  carrier: DeleteRoleCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  return apiRequest<any>({
    method: "POST",
    endpoint: `${BASE_PATH}/roles/delete`,
    tenant,
    accessToken,
    body: carrier,
  });
};
