import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { isTokenExpired, removeStorageItem } from '@/store/localStorage';
import StorageKeys from '@/constants/storageConstants';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * RequireAuth - Protected route wrapper
 * - Checks if user is authenticated
 * - Validates token is not expired
 * - Redirects to login if unauthorized or token expired
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Check if token has expired
    if (isTokenExpired()) {
      // Token expired - clear storage and logout
      removeStorageItem(StorageKeys.USER);
      removeStorageItem(StorageKeys.SESSION);
      removeStorageItem(StorageKeys.TENANT);
      logout();
      setIsValid(false);
    }
  }, [logout]);

  // If token is invalid or user not authenticated, redirect to login
  if (!isValid || !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
