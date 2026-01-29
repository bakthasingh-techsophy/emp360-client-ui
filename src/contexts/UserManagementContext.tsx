/**
 * User Management Context
 * Manages all user-related operations and provides centralized API access with built-in error/success notifications
 * 
 * Features:
 * - User Details CRUD operations (Create, Read, Update, Delete)
 * - Refresh/Search with pagination
 * - Automatic error toast notifications for all operations
 * - Success toast notifications for create, update, delete operations
 * - Single unified loading state for async operations
 */

import { createContext, ReactNode, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  apiCreateUserDetails,
  apiGetUserDetailsById,
  apiUpdateUserDetails,
  apiSearchUserDetails,
  apiBulkUpdateUserDetails,
  apiDeleteUserDetailsById,
  apiBulkDeleteUserDetailsByIds,
  apiBulkDeleteUserDetailsByFilters,
  UpdatePayload,
} from '@/services/userDetailsService';
import Pagination from '@/types/pagination';
import UniversalSearchRequest from '@/types/search';
import { UserDetails, UserDetailsCarrier } from '@/modules/user-management/types/onboarding.types';

/**
 * User Management Context Type Definition
 */
interface UserManagementContextType {
  // API Methods
  createUserDetails: (carrier: UserDetailsCarrier, tenant: string, accessToken?: string) => Promise<UserDetails | null>;
  getUserDetailsById: (id: string, tenant: string, accessToken?: string) => Promise<UserDetails | null>;
  updateUserDetails: (id: string, payload: UpdatePayload, tenant: string, accessToken?: string) => Promise<UserDetails | null>;
  refreshUsers: (searchRequest: UniversalSearchRequest, page?: number, pageSize?: number, tenant?: string, accessToken?: string) => Promise<Pagination<UserDetails> | null>;
  bulkUpdateUserDetails: (filters: UniversalSearchRequest, updates: UpdatePayload, tenant: string, accessToken?: string) => Promise<boolean>;
  deleteUserDetailsById: (id: string, tenant: string, accessToken?: string) => Promise<boolean>;
  bulkDeleteUserDetailsByIds: (ids: string[], tenant: string, accessToken?: string) => Promise<boolean>;
  bulkDeleteUserDetailsByFilters: (filters: UniversalSearchRequest, tenant: string, accessToken?: string) => Promise<boolean>;

  // Loading State
  isLoading: boolean;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

/**
 * User Management Provider Component
 */
export function UserManagementProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generic error handler
   * Shows error toast and returns null/false based on type
   */
  const handleError = (error: unknown, title: string, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    toast({
      variant: 'destructive',
      title,
      description: errorMessage,
    });
  };

  /**
   * Generic success handler
   * Shows success toast with custom message
   */
  const handleSuccess = (message: string) => {
    toast({
      title: 'Success',
      description: message,
    });
  };

  /**
   * Create User Details
   */
  const createUserDetails = async (
    carrier: UserDetailsCarrier,
    tenant: string,
    accessToken?: string
  ): Promise<UserDetails | null> => {
    setIsLoading(true);
    try {
      const response = await apiCreateUserDetails(carrier, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Creation Failed', response.message || 'Failed to create user details');
        return null;
      }

      handleSuccess('User details created successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred while creating user details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get User Details by ID
   */
  const getUserDetailsById = async (
    id: string,
    tenant: string,
    accessToken?: string
  ): Promise<UserDetails | null> => {
    setIsLoading(true);
    try {
      const response = await apiGetUserDetailsById(id, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Fetch Failed', response.message || 'Failed to fetch user details');
        return null;
      }

      return response.data;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred while fetching user details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update User Details
   */
  const updateUserDetails = async (
    id: string,
    payload: UpdatePayload,
    tenant: string,
    accessToken?: string
  ): Promise<UserDetails | null> => {
    setIsLoading(true);
    try {
      const response = await apiUpdateUserDetails(id, payload, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Update Failed', response.message || 'Failed to update user details');
        return null;
      }

      handleSuccess('User details updated successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred while updating user details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh Users (Search with pagination)
   * No success toast for read operations
   */
  const refreshUsers = async (
    searchRequest: UniversalSearchRequest,
    page: number = 0,
    pageSize: number = 10,
    tenant: string = 'default',
    accessToken?: string
  ): Promise<Pagination<UserDetails> | null> => {
    setIsLoading(true);
    try {
      const response = await apiSearchUserDetails(searchRequest, page, pageSize, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Search Failed', response.message || 'Failed to search user details');
        return null;
      }

      return response.data;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred while searching user details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Bulk Update User Details
   */
  const bulkUpdateUserDetails = async (
    filters: UniversalSearchRequest,
    updates: UpdatePayload,
    tenant: string,
    accessToken?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiBulkUpdateUserDetails(filters, updates, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Bulk Update Failed', response.message || 'Failed to bulk update user details');
        return false;
      }

      handleSuccess(`${response.data?.affected || 0} user(s) updated successfully`);
      return true;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred during bulk update');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete User Details by ID
   */
  const deleteUserDetailsById = async (
    id: string,
    tenant: string,
    accessToken?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiDeleteUserDetailsById(id, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Deletion Failed', response.message || 'Failed to delete user details');
        return false;
      }

      handleSuccess('User details deleted successfully');
      return true;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred while deleting user details');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Bulk Delete User Details by IDs
   */
  const bulkDeleteUserDetailsByIds = async (
    ids: string[],
    tenant: string,
    accessToken?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiBulkDeleteUserDetailsByIds(ids, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Bulk Deletion Failed', response.message || 'Failed to bulk delete user details');
        return false;
      }

      handleSuccess(`${ids.length} user(s) deleted successfully`);
      return true;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred during bulk deletion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Bulk Delete User Details by Filters
   */
  const bulkDeleteUserDetailsByFilters = async (
    filters: UniversalSearchRequest,
    tenant: string,
    accessToken?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiBulkDeleteUserDetailsByFilters(filters, tenant, accessToken);

      if (!response.success) {
        handleError(response.message, 'Bulk Deletion Failed', response.message || 'Failed to bulk delete user details by filters');
        return false;
      }

      handleSuccess('User details deleted successfully');
      return true;
    } catch (error) {
      handleError(error, 'Error', 'An error occurred during bulk deletion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserManagementContext.Provider
      value={{
        // API Methods
        createUserDetails,
        getUserDetailsById,
        updateUserDetails,
        refreshUsers,
        bulkUpdateUserDetails,
        deleteUserDetailsById,
        bulkDeleteUserDetailsByIds,
        bulkDeleteUserDetailsByFilters,

        // Loading State
        isLoading,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
}

/**
 * Hook to use User Management Context
 * 
 * Usage:
 * const { createUserDetails, refreshUsers, isLoading } = useUserManagement();
 */
export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within UserManagementProvider');
  }
  return context;
}
