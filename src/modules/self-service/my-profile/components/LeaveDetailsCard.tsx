/**
 * Leave Details Card for Self-Service Profile
 * View-only display of leave balance and history
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LeaveDetailsCard() {
  // Placeholder implementation - leave details management will be implemented separately
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Leave Details
        </CardTitle>
        <CardDescription>Leave balance and leave history</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Leave management details are coming soon. Please check back later for your leave balance and history.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
