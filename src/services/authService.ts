import { ApiResponse, AuthData } from "@/types/responses";
import { apiRequest } from "./utils";

export const apiLogin = async (username: string, password: string, tenant: string): Promise<ApiResponse<AuthData>> => {
  try {
    return await apiRequest<AuthData>({
      method: 'POST',
      endpoint: '/user-management/v1/auth/login',
      tenant,
      body: { username, password }
    });
  } catch (error: unknown) {
    // Return error response instead of throwing
    // This allows the UI to handle authentication failures gracefully

    // Try to parse error.message as JSON (it contains ApiResponse)
    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(error.message) as ApiResponse<AuthData>;
        return parsedError;
      } catch (parseError) {
        // If parsing fails, return generic error
        return {
          success: false,
          message: error.message,
          data: {} as AuthData,
          code: 'ERROR',
        } as ApiResponse<AuthData>;
      }
    }

    // Fallback for unknown error type
    return {
      success: false,
      message: 'Login request failed',
      data: {} as AuthData,
      code: 'ERROR',
    } as ApiResponse<AuthData>;
  }
};
