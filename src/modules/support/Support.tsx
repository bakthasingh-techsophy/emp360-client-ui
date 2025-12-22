import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Support() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Get help and support
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>We're here to assist you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Support center - implement as needed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
