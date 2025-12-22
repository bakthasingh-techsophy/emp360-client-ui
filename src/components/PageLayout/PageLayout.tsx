import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageLayoutProps {
  /** Toolbar component to render at the top */
  toolbar?: ReactNode;
  /** Main content to render */
  children: ReactNode;
  /** Additional className for the content wrapper */
  contentClassName?: string;
  /** Show scroll to top button */
  showScrollTop?: boolean;
  /** Scroll threshold to show button (default: 400px) */
  scrollTopThreshold?: number;
  /** Empty state component when no content */
  emptyState?: ReactNode;
  /** Whether to show empty state */
  showEmptyState?: boolean;
  /** Callback when scroll to top is clicked */
  onScrollTop?: () => void;
  /** Bottom padding for fixed elements like pagination */
  bottomPadding?: string;
}

export function PageLayout({
  toolbar,
  children,
  contentClassName,
  showScrollTop = true,
  scrollTopThreshold = 400,
  emptyState,
  showEmptyState = false,
  onScrollTop,
  bottomPadding = 'pb-20',
}: PageLayoutProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    if (!showScrollTop) return;

    const handleScroll = () => {
      setShowScrollButton(window.scrollY > scrollTopThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollTop, scrollTopThreshold]);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    onScrollTop?.();
  };

  // Show empty state if specified
  if (showEmptyState && emptyState) {
    return (
      <div className="flex flex-col h-full">
        {toolbar && (
          <div className="bg-background pb-4 border-b">
            {toolbar}
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          {emptyState}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar Section */}
      {toolbar && (
        <div className="bg-background pb-4 border-b">
          {toolbar}
        </div>
      )}

      {/* Content Section */}
      <div className={cn('mt-4', bottomPadding, contentClassName)}>
        {children}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && showScrollButton && (
        <Button
          onClick={handleScrollTop}
          size="icon"
          className="fixed bottom-24 right-6 z-50 rounded-full shadow-lg"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
