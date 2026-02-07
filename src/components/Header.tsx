import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { User, LogOut, Settings, Code, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { CompanySelector } from './CompanySelector';
import { useLayoutContext } from '@/contexts/LayoutContext';

/**
 * Main Header Component
 * 
 * Features:
 * - Company selector for multi-company support
 * - User dropdown menu with account settings
 * - Theme toggle
 * - Switch user functionality
 * - Mobile-responsive design
 * 
 * This header is used throughout the application as the top toolbar
 */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSwitchUser, setShowSwitchUser] = useState(false);
  const { hideCompanySelector } = useLayoutContext();

  const handleSwitchUser = () => {
    setShowSwitchUser(true);
  };

  return (
    <>
      {/* Main Header - Responsive toolbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
          {/* Left Section: Company Selector - Always visible unless explicitly hidden */}
          <div className="flex flex-1 items-center gap-2 min-w-0">
            {!hideCompanySelector && <CompanySelector />}
          </div>

          {/* Right Section: Actions & User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />

            {/* Switch User Button - Hide text on small screens */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchUser}
              className="hidden sm:flex"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Switch User</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwitchUser}
              className="sm:hidden flex-shrink-0"
              aria-label="Switch user"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)]">
                <DropdownMenuLabel>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/account/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/account/inspector" className="flex items-center">
                    <Code className="mr-2 h-4 w-4" />
                    Session Inspector
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SwitchUserModal
        open={showSwitchUser}
        onClose={() => setShowSwitchUser(false)}
        onSuccess={() => {
          setShowSwitchUser(false);
          navigate('/');
        }}
      />
    </>
  );
}

interface SwitchUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function SwitchUserModal({ open, onClose, onSuccess }: SwitchUserModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logout, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    logout();

    // TODO: Replace with real API authentication
    const result = await login(email, password);

    if (result.success) {
      setEmail('');
      setPassword('');
      onSuccess();
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch User</DialogTitle>
          <DialogDescription>
            Log out and sign in as a different user. This requires valid credentials.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="switch-email">Email</Label>
            <Input
              id="switch-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="switch-password">Password</Label>
            <Input
              id="switch-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Switch User
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground">
          Tip: Go to the login page for the demo users helper
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default Header;
