import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { dummyUsers, getUsersByCategory, categoryLabels, DummyUser } from '@/types/users';
import { User, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'manual' | 'quick'>('quick');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(username, password);
      if (response.success) {
        toast({
          title: 'Success',
          description: `Welcome back, ${response.user?.name || username}!`,
        });
        navigate(from, { replace: true });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Login failed',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (user: DummyUser) => {
    setUsername(user.username);
    setPassword(user.password);
    setIsLoading(true);

    try {
      const response = await login(user.username, user.password);
      if (response.success) {
        toast({
          title: 'Success',
          description: `Logged in as ${user.name} (${user.roleLabel})`,
        });
        navigate(from, { replace: true });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Login failed',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const usersByCategory = getUsersByCategory();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <User className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Employee 360</CardTitle>
          <CardDescription className="text-base">
            HRMS Platform - Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginMode} onValueChange={(v) => setLoginMode(v as 'manual' | 'quick')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="quick">Quick Login (Demo)</TabsTrigger>
              <TabsTrigger value="manual">Manual Login</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
                <strong>Demo Mode:</strong> Select a user below to instantly login and explore different roles in the HRMS system.
                All passwords are <code className="bg-background px-1 py-0.5 rounded">admin123</code>
              </div>

              <Accordion type="multiple" className="w-full" defaultValue={['system', 'hr']}>
                {Object.entries(usersByCategory).map(([category, users]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-sm font-semibold">
                      {categoryLabels[category as keyof typeof categoryLabels]} ({users.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-2 pt-2">
                        {users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleQuickLogin(user)}
                            disabled={isLoading}
                            className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm truncate">{user.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {user.username}
                                  </Badge>
                                </div>
                                <div className="text-xs font-semibold text-primary mb-1">
                                  {user.roleLabel}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {user.description}
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 flex-shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
              <div className="text-xs text-center text-muted-foreground pt-2">
                <p>
                  Demo credentials: Use any username from the Quick Login tab with password{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">admin123</code>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
