import { ApiResponse, AuthData } from "@/types/responses";
import wretch from "wretch";
import { AUTH_GATEWAY } from "./utils";

/**
 * Login API - Integrates with Keycloak authentication server
 * 
 * Authenticates user against the Keycloak realm using password grant type
 * Endpoint: /realms/{realm}/protocol/openid-connect/token
 * 
 * @param username - User username (e.g., EMP001)
 * @param password - User password
 * @param realm - Keycloak realm name (default: techsophy, will be made dynamic later)
 * @returns Promise<ApiResponse<AuthData>> - Contains access_token, refresh_token, etc.
 */
export const apiLogin = async (
  username: string,
  password: string,
  realm: string = 'techsophy'
): Promise<ApiResponse<AuthData>> => {
  try {
    // Construct the Keycloak token endpoint
    const keycloakTokenUrl = `${AUTH_GATEWAY}/realms/${realm}/protocol/openid-connect/token`;

    // Prepare form data for Keycloak
    const formData = new URLSearchParams();
    formData.append('client_id', 'web-token-issuer');
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);

    // Make request to Keycloak auth server
    const response = await wretch(keycloakTokenUrl)
      .headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      })
      .post(formData)
      .badRequest(async (err) => {
        const errorData = await err.response.json();
        throw new Error(JSON.stringify(errorData));
      })
      .unauthorized(async (err) => {
        const errorData = await err.response.json();
        throw new Error(JSON.stringify(errorData));
      })
      .internalError(async (err) => {
        const errorData = await err.response.json();
        throw new Error(JSON.stringify(errorData));
      })
      .json<AuthData>();

    // Success response
    return {
      success: true,
      message: 'Login successful',
      data: response,
      code: 'SUCCESS',
    };
  } catch (error: unknown) {
    // Handle authentication errors gracefully
    if (error instanceof Error) {
      try {
        // Try to parse error response from Keycloak
        const errorData = JSON.parse(error.message);
        return {
          success: false,
          message: errorData.error_description || errorData.error || 'Login failed',
          data: {} as AuthData,
          code: 'AUTH_ERROR',
        };
      } catch (parseError) {
        // If parsing fails, return generic error
        return {
          success: false,
          message: error.message || 'Login request failed',
          data: {} as AuthData,
          code: 'ERROR',
        };
      }
    }

    // Fallback for unknown error type
    return {
      success: false,
      message: 'Login request failed',
      data: {} as AuthData,
      code: 'ERROR',
    };
  }
};
