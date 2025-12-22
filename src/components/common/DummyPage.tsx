import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Construction } from 'lucide-react';
import { getMenuItemByRoute } from '@/config/menuConfig';

interface DummyPageProps {
  title?: string;
  description?: string;
  category?: string;
}

/**
 * Generic dummy page component for all HRMS modules
 * Shows a placeholder with module information
 */
export function DummyPage({ title, description, category }: DummyPageProps) {
  const location = useLocation();
  const menuItem = getMenuItemByRoute(location.pathname);

  const pageTitle = title || menuItem?.label || 'Module';
  const pageDescription = description || `This is the ${pageTitle} module page.`;
  const pageCategory = category || 'Employee 360 HRMS';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is a placeholder page for the <strong>{pageTitle}</strong> module.
          The actual functionality will be implemented in future iterations.
        </AlertDescription>
      </Alert>

      {/* Module Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-primary" />
            Module Under Development
          </CardTitle>
          <CardDescription>
            Technical details and specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Module Name</label>
              <p className="text-base mt-1">{pageTitle}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Category</label>
              <p className="text-base mt-1">{pageCategory}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Route</label>
              <p className="text-sm mt-1 font-mono bg-muted px-2 py-1 rounded">
                {location.pathname}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Status</label>
              <p className="text-base mt-1">
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  Planned
                </Badge>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-semibold text-muted-foreground">Description</label>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {pageDescription}
            </p>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">
              Planned Features
            </label>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Complete CRUD operations for data management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Advanced filtering, sorting, and search capabilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Export functionality (Excel, PDF, CSV)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Role-based access control and permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Audit trail and activity logging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Real-time notifications and alerts</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Additional Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Statistics and key metrics will be displayed here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent transactions and updates will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Frequently used actions and shortcuts will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
