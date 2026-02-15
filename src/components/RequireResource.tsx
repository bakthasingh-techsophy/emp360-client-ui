/**
 * RequireResource Component
 * Protects routes by checking if user has access to a specific resource
 * If user doesn't have access, shows an access restricted message and redirects to home
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getMenuResource } from '@/config/menuResourceMap';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface RequireResourceProps {
  /** Route ID or menu ID to check resource access against */
  resourceId: string;
  /** Page content to render if user has access */
  children: React.ReactNode;
  /** Optional message to show when access is denied */
  denialMessage?: string;
  /** If true, shows restricted UI instead of redirecting */
  showDenial?: boolean;
}

/**
 * Require Resource Component
 * Use Route: <RequireResource resourceId="user-management"><UserManagement /></RequireResource>
 * Or use it with explicit resource: <RequireResource resourceId="user-management" showResourceDenial><UserManagement /></RequireResource>
 */
export function RequireResource({
  resourceId,
  children,
  denialMessage,
  showDenial = false,
}: RequireResourceProps) {
  const auth = useAuth();

  // Get the resource required for this route
  const resource = getMenuResource(resourceId);

  // If no resource mapping found, allow access (for routes without resource restriction)
  if (!resource) {
    return <>{children}</>;
  }

  // Check if user has access to this resource
  const hasAccess = auth.hasResourceAccess(resource);

  if (!hasAccess) {
    if (showDenial) {
      // Show restricted message and home button
      return (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="mt-2 space-y-2">
                <p className="font-semibold">{denialMessage || "Access Restricted"}</p>
                <p className="text-sm">
                  You don't have access to this resource. Please contact your administrator if you believe this is an error.
                </p>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Required Resource: <strong>{resource}</strong>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <Button asChild className="w-full" variant="outline">
              <a href="/dashboard">Return to Dashboard</a>
            </Button>
          </div>
        </div>
      );
    }

    // Redirect to home/dashboard if user doesn't have access
    return <Navigate to="/dashboard" replace />;
  }

  // User has access, render children
  return <>{children}</>;
}

export default RequireResource;
