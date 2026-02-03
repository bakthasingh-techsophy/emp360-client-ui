/**
 * Skill Items Service
 * Handles all API operations for skill management
 * 
 * Endpoints:
 * - POST /emp-user-management/v1/skills - Create skill
 * - GET /emp-user-management/v1/skills/{id} - Get skill by ID
 * - PATCH /emp-user-management/v1/skills/{id} - Update skill
 * - DELETE /emp-user-management/v1/skills/{id} - Delete skill
 * 
 * All responses follow ApiResponse<T> wrapper format
 */

import { apiRequest } from "@/services/utils";
import { ApiResponse } from "@/types/responses";

const BASE_ENDPOINT = "/emp-user-management/v1/skills";

/**
 * Skill Item
 * Represents a single skill or certification
 */
export interface SkillItem {
  id?: string;
  name: string;
  certificationType: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "PROFESSIONAL" | "EXPERT";
  certificationUrl?: string;
  issuedDate?: string;
  expiryDate?: string;
  issuer?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update payload - Map of field names to values
 */
export type UpdatePayload = Record<string, any>;

/**
 * Create Skill
 * POST /emp-user-management/v1/skills
 * 
 * @param item - SkillItem with skill information
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<SkillItem>>
 */
export const apiCreateSkill = async (
  item: SkillItem,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<SkillItem>> => {
  return apiRequest<SkillItem>({
    method: "POST",
    endpoint: BASE_ENDPOINT,
    tenant,
    accessToken,
    body: item,
  });
};

/**
 * Get Skill by ID
 * GET /emp-user-management/v1/skills/{id}
 * 
 * @param id - Skill ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<SkillItem>>
 */
export const apiGetSkillById = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<SkillItem>> => {
  return apiRequest<SkillItem>({
    method: "GET",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Update Skill
 * PATCH /emp-user-management/v1/skills/{id}
 * 
 * Partial update - only provided fields are updated
 * 
 * @param id - Skill ID
 * @param payload - Map of fields to update
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<SkillItem>>
 */
export const apiUpdateSkill = async (
  id: string,
  payload: UpdatePayload,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<SkillItem>> => {
  return apiRequest<SkillItem>({
    method: "PATCH",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
    body: payload,
  });
};

/**
 * Delete Skill
 * DELETE /emp-user-management/v1/skills/{id}
 * 
 * @param id - Skill ID
 * @param tenant - Tenant ID
 * @param accessToken - Optional access token for authorization
 * @returns Promise<ApiResponse<void>>
 */
export const apiDeleteSkill = async (
  id: string,
  tenant: string,
  accessToken?: string
): Promise<ApiResponse<void>> => {
  return apiRequest<void>({
    method: "DELETE",
    endpoint: `${BASE_ENDPOINT}/${id}`,
    tenant,
    accessToken,
  });
};

/**
 * Export all service functions as default object for easier importing
 */
export const skillItemsService = {
  apiCreateSkill,
  apiGetSkillById,
  apiUpdateSkill,
  apiDeleteSkill,
};
