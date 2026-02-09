/**
 * Space Setup Component
 * Handles space creation and connection for visitor management
 */

import { useState } from 'react';
import { Building2, Plus, Link2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SpaceCreationForm } from './components/SpaceCreationForm';
import { SpaceConnectionForm } from './components/SpaceConnectionForm';
import { PageLayout } from '@/components/PageLayout';

type SetupMode = 'select' | 'create' | 'connect';

interface SpaceSetupProps {
  onComplete: () => void;
  isPending?: boolean;
}

export function SpaceSetup({ onComplete, isPending = false }: SpaceSetupProps) {
  const [mode, setMode] = useState<SetupMode>('select');

  // Show pending status if connection request is awaiting approval
  if (isPending) {
    return (
      <PageLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <CardTitle className="text-center">Connection Request Pending</CardTitle>
              <CardDescription className="text-center">
                Your request to join a visitor management space is awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The space owner has been notified of your request. You will be able to access 
                  visitor management once your request is approved.
                </AlertDescription>
              </Alert>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Need help? Contact your building or space administrator.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (mode === 'create') {
    return <SpaceCreationForm onSuccess={onComplete} onBack={() => setMode('select')} />;
  }

  if (mode === 'connect') {
    return <SpaceConnectionForm onSuccess={onComplete} onBack={() => setMode('select')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Management Space</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Before you can start managing visitors, you need to set up a space. 
            Create a new space for your organization or connect to an existing shared space.
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Space */}
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setMode('create')}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Create New Space</CardTitle>
              <CardDescription>
                Set up a new visitor management space for your organization. 
                Ideal for single-company buildings or dedicated floors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Full control over space settings</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Can invite other companies later</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Perfect for dedicated locations</span>
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => setMode('create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Space
              </Button>
            </CardContent>
          </Card>

          {/* Connect to Existing Space */}
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setMode('connect')}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Link2 className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Connect to Existing Space</CardTitle>
              <CardDescription>
                Join a shared visitor management space. 
                Perfect for multi-company buildings or shared floors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Share visitor database with others</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Coordinate with shared reception</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Request must be approved by space owner</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-4" onClick={() => setMode('connect')}>
                <Link2 className="h-4 w-4 mr-2" />
                Connect to Space
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">What is a Visitor Management Space?</h3>
                <p className="text-sm text-muted-foreground">
                  A space is a shared database for managing visitors in a specific location (building, floor, or office). 
                  Multiple companies can share the same space to coordinate visitor management with a shared reception desk.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
