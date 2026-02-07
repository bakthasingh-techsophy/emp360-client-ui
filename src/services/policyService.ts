/**
 * Policy Service
 * Handles all policy-related API operations
 */

import { ApiResponse } from "@/types/responses";
import Pagination from "@/types/pagination";
import UniversalSearchRequest from "@/types/search";
import { Policy, PolicyCarrier } from "@/modules/policy-documents/types";
import { apiRequest } from "./utils";

const BASE_PATH = "/emp-user-management/v1/policies";

/**
 * Create a new policy
 */
export const apiCreatePolicy = async (
  carrier: PolicyCarrier,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Policy>> => {
  return apiRequest<Policy>({
    method: "POST",
    endpoint: BASE_PATH,
    tenant,
    accessToken,
    body: carrier,
  });
};

/**
 * Get policy by ID
 */
export const apiGetPolicyById = async (
  id: string,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Policy>> => {
  return apiRequest<Policy>({
    method: "GET",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update policy
 */
export const apiUpdatePolicy = async (
  id: string,
  payload: Record<string, any>,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Policy>> => {
  return apiRequest<Policy>({
    method: "PATCH",
    endpoint: `${BASE_PATH}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Search policies with pagination
 */
export const apiSearchPolicies = async (
  searchRequest: UniversalSearchRequest,
  page: number,
  pageSize: number,
  tenant: string,
  accessToken: string
): Promise<ApiResponse<Pagination<Policy>>> => {
  return apiRequest<Pagination<Policy>>({
    method: "POST",
    endpoint: `${BASE_PATH}/search?page=${page}&size=${pageSize}`,
    tenant,
    accessToken,
    body: searchRequest,
  });
};

/**
 * Delete policy by ID
 */
export const apiDeletePolicyById = async (
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
 * Bulk delete policies by IDs
 */
export const apiBulkDeletePolicies = async (
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
 * Bulk update policies
 */
export const apiBulkUpdatePolicies = async (
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
