/**
 * Resource Debug Panel
 * Displays user's available resources from JWT token
 * Useful for debugging role-based access issues
 */

import { useAuth } from '@/contexts/AuthContext';
import { getAvailableResources, getResourceRoles, decodeJWT } from '@/lib/tokenUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ResourceDebugPanel() {
  const auth = useAuth();

  if (!auth.token) {
    return null;
  }

  const decoded = decodeJWT(auth.token);
  const availableResources = getAvailableResources(auth.token);

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-sm">🔍 Resource Access Debug</CardTitle>
        <CardDescription>User's available resources from JWT token</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2">User: {decoded?.preferred_username || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{decoded?.email}</p>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2">Available Resources ({availableResources.length}):</p>
          <div className="space-y-2">
            {availableResources.length > 0 ? (
              availableResources.map((resource) => {
                const roles = getResourceRoles(auth.token!, resource);
                return (
                  <div key={resource} className="text-xs p-2 bg-muted rounded">
                    <p className="font-mono font-semibold">{resource}</p>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No resources assigned</p>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Total Resources: {availableResources.length}</p>
          <p>Token Expires: {new Date(decoded?.exp * 1000).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
