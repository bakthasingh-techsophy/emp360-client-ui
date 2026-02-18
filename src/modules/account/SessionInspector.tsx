import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStorageItem } from '@/store/localStorage';
import StorageKeys from '@/constants/storageConstants';
import { useAuth } from '@/contexts/AuthContext';
import { ResourceDebugPanel } from '@/components/ResourceDebugPanel';

export function SessionInspector() {
  const { user } = useAuth();
  const session = getStorageItem(StorageKeys.SESSION);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Session Inspector</h1>
        <p className="text-muted-foreground">
          View your current session information
        </p>
      </div>

      <ResourceDebugPanel />

      <Card>
        <CardHeader>
          <CardTitle>Session Data</CardTitle>
          <CardDescription>Current authentication session</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
            {JSON.stringify({ user, session }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
