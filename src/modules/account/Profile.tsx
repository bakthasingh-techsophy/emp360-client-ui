import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Briefcase, Hash, CheckCircle2 } from 'lucide-react';
import { decodeJWT } from '@/lib/tokenUtils';

export function Profile() {
  const { token, employeeId } = useAuth();

  // Decode JWT to extract token claims
  const tokenData = token ? decodeJWT(token) : null;

  if (!tokenData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View your account information
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No user data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View your account information
        </p>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">First Name</p>
              <p className="text-base font-semibold">{tokenData.given_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Name</p>
              <p className="text-base font-semibold">{tokenData.family_name || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="text-base flex items-center gap-2">
                {tokenData.email}
                {tokenData.email_verified && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-base">{tokenData.preferred_username || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Information</CardTitle>
          <CardDescription>Your employee details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Employee ID
              </p>
              <p className="text-base font-mono">{employeeId || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                User Subject
              </p>
              <p className="text-base font-mono text-sm">{tokenData.sub || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Email Verification</p>
              <Badge
                variant={tokenData.email_verified ? 'default' : 'secondary'}
                className="capitalize"
              >
                {tokenData.email_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Token Type</p>
              <Badge variant="outline" className="capitalize">
                {tokenData.typ || 'Bearer'}
              </Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">Scope</p>
              <div className="flex flex-wrap gap-2">
                {tokenData.scope?.split(' ').map((scope: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {scope}
                  </Badge>
                )) || 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}