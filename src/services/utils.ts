// src/services/utils.ts

import { ApiResponse } from "@/types/responses";
import wretch from "wretch";

export const AUTH_GATEWAY = "https://auth-uni.techsophy.com/auth";
export const API_GATEWAY = "http://localhost:8081";

export const apiHeaders = (tenant: string, accessToken?: string) => {
  const baseHeaders = {
    "Content-Type": "application/json",
    "X-Client-Type": "web",
    "X-Tenant-ID": tenant,
  };

  if (accessToken) {
    return {
      ...baseHeaders,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  return baseHeaders;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method: HttpMethod;
  endpoint: string;
  tenant: string;
  accessToken?: string;
  body?: any;
}

/**
 * Generic API request wrapper with standardized error handling
 * Handles 400 (Bad Request), 403 (Forbidden), and 500 (Internal Server Error)
 */
export const apiRequest = async <T = any>(
  options: ApiRequestOptions
): Promise<ApiResponse<T>> => {
  const { method, endpoint, tenant, accessToken, body } = options;
  
  let request = wretch(`${API_GATEWAY}${endpoint}`)
    .headers(apiHeaders(tenant, accessToken));

  // Add body for POST/PUT/PATCH requests
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    request = request.json(body);
  }

  // Execute the appropriate HTTP method with error handling
  return request[method.toLowerCase() as Lowercase<HttpMethod>]()
    .badRequest(async (err) => await err.response.json())
    .forbidden(async (err) => await err.response.json())
    .internalError(async (err) => await err.response.json())
    .json<ApiResponse<T>>();
};
