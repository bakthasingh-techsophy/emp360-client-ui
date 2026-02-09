/**
 * Policy Version Service
 * Handles all policy version-related API operations
 */

import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { PolicyVersion, PolicyVersionCarrier } from "@/modules/policy-documents/types";
import { apiRequest } from "./utils";

const BASE_PATH = "/emp-user-management/v1/policy-versions";

/**
 * Create a new policy version
 */
export const apiCreatePolicyVersion = async (
  carrier: PolicyVersionCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<PolicyVersion>> => {
  return apiRequest<PolicyVersion>({
    method: "POST",
    endpoint: BASE_PATH,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get policy version by ID
 */
export const apiGetPolicyVersionById = async (
  id: string,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<PolicyVersion>> => {
  return apiRequest<PolicyVersion>({
    method: "GET",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update policy version
 */
export const apiUpdatePolicyVersion = async (
  id: string,
  payload: Record<string, any>,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<PolicyVersion>> => {
  return apiRequest<PolicyVersion>({
    method: "PATCH",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search policy versions with pagination
 */
export const apiSearchPolicyVersions = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Pagination<PolicyVersion>>> => {
  return apiRequest<Pagination<PolicyVersion>>({
    method: "POST",
    endpoint: `${BASE_PATH}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete policy version by ID
 */
export const apiDeletePolicyVersionById = async (
  id: string,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Bulk delete policy versions by IDs
 */
export const apiBulkDeletePolicyVersions = async (
  ids: string[],
  tenant: string,
  accessToken: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_PATH}/bulk-delete`,
    tenant,
    accessToken,
    body: ids,
  });
};

/**
 * Bulk update policy versions
 */
export const apiBulkUpdatePolicyVersions = async (
  ids: string[],
  updates: Record<string, any>,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "PATCH",
    endpoint: `${BASE_PATH}/bulk-update`,
    tenant,
    accessToken,
    body: { ids, updates },
  });
};
