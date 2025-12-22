import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bug, X, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function ThemeDebugPanel() {
  const { mode, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Bug className="mr-2 h-4 w-4" />
        Theme Debug
      </Button>
    );
  }

  const getCSSVariable = (name: string): string => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || 'not set';
  };

  const colorTokens = [
    { name: '--background', label: 'Background' },
    { name: '--foreground', label: 'Foreground' },
    { name: '--card', label: 'Card' },
    { name: '--card-foreground', label: 'Card Foreground' },
    { name: '--primary', label: 'Primary' },
    { name: '--primary-foreground', label: 'Primary Foreground' },
    { name: '--secondary', label: 'Secondary' },
    { name: '--muted', label: 'Muted' },
    { name: '--muted-foreground', label: 'Muted Foreground' },
    { name: '--accent', label: 'Accent' },
    { name: '--destructive', label: 'Destructive' },
    { name: '--border', label: 'Border' },
    { name: '--input', label: 'Input' },
    { name: '--ring', label: 'Ring' },
  ];

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            <CardTitle className="text-sm">Theme Debug</CardTitle>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            size="icon"
            variant="ghost"
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Current theme state and tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Mode:</span>
            <Badge variant="outline">{mode}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Resolved:</span>
            <Badge variant={resolvedTheme === 'dark' ? 'default' : 'secondary'}>
              {resolvedTheme}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">data-theme:</span>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {document.documentElement.getAttribute('data-theme')}
            </code>
          </div>
        </div>

        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-xs">CSS Variables ({colorTokens.length})</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto scrollbar-themed">
              {colorTokens.map((token) => (
                <div
                  key={token.name}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <span className="text-muted-foreground">{token.label}:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded border border-border"
                      style={{ background: `hsl(${getCSSVariable(token.name)})` }}
                    />
                    <code className="bg-muted px-1 py-0.5 rounded text-[10px]">
                      {getCSSVariable(token.name)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="pt-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            All colors are CSS variable-driven. No hardcoded values.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
