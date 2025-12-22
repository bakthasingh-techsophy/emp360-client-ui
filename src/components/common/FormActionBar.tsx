import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLayoutContext } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';

interface FormActionBarProps {
  /**
   * Mode of the form - 'create' or 'edit'
   */
  mode?: 'create' | 'edit';
  
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
  
  /**
   * Callback when cancel button is clicked
   */
  onCancel: () => void;
  
  /**
   * Text for the submit button (overrides default based on mode)
   */
  submitText?: string;
  
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  
  /**
   * Whether to show required fields indicator
   */
  showRequiredIndicator?: boolean;
  
  /**
   * Additional content to show on the left side
   */
  leftContent?: React.ReactNode;
  
  /**
   * Additional content to show on the right side before action buttons
   */
  rightContent?: React.ReactNode;
  
  /**
   * Custom className for the container
   */
  className?: string;
}

/**
 * FormActionBar Component
 * 
 * A reusable fixed action bar for form pages with Cancel and Submit buttons.
 * Positions itself at the bottom of the viewport and stays within the form container.
 * 
 * Usage:
 * ```tsx
 * <form className="pb-24">
 *   // Your form fields here
 *   <FormActionBar
 *     mode="create"
 *     isSubmitting={isSubmitting}
 *     onCancel={handleClose}
 *   />
 * </form>
 * ```
 */
export function FormActionBar({
  mode = 'create',
  isSubmitting = false,
  onCancel,
  submitText,
  cancelText = 'Cancel',
  showRequiredIndicator = true,
  leftContent,
  rightContent,
  className = '',
}: FormActionBarProps) {
  const { sidebarCollapsed } = useLayoutContext();
  
  const defaultSubmitText = mode === 'edit' 
    ? (isSubmitting ? 'Updating...' : 'Update')
    : (isSubmitting ? 'Creating...' : 'Create');
  
  const finalSubmitText = submitText || defaultSubmitText;

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40',
      'transition-[margin] duration-200 ease-out',
      'lg:ml-16',
      !sidebarCollapsed && 'lg:ml-64',
      className
    )}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showRequiredIndicator && (
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive">*</span> Required fields
              </p>
            )}
            {leftContent}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {rightContent}
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isSubmitting}
            >
              {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {finalSubmitText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
