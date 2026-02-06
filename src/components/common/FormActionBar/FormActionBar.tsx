import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLayoutContext } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';

export interface ActionButton {
  /**
   * Unique identifier for the action
   */
  id: string;
  
  /**
   * Label text for the button
   */
  label: string;
  
  /**
   * Click handler for the button
   */
  onClick: () => void;
  
  /**
   * Button variant
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether to show loading state
   */
  loading?: boolean;
  
  /**
   * Button type attribute
   */
  type?: 'button' | 'submit' | 'reset';
}

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
   * Custom action buttons to replace default Cancel/Submit buttons
   * When provided, default buttons are not rendered
   */
  customActions?: ActionButton[];
  
  /**
   * Position of custom actions - 'left', 'right', or 'split'
   * 'split' will use the first button on left, rest on right
   */
  customActionsPosition?: 'left' | 'right' | 'split';
  
  /**
   * Whether to hide default action buttons (Cancel/Submit)
   */
  hideDefaultActions?: boolean;
  
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
 * Supports custom action buttons for advanced use cases.
 * 
 * Usage (Default):
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
 * 
 * Usage (Custom Actions):
 * ```tsx
 * <FormActionBar
 *   onCancel={handleCancel}
 *   customActions={[
 *     { id: 'cancel', label: 'Cancel', onClick: handleCancel, variant: 'outline' },
 *     { id: 'reject', label: 'Reject', onClick: handleReject, variant: 'destructive', disabled: !isValid },
 *     { id: 'approve', label: 'Approve', onClick: handleApprove, variant: 'default', disabled: !isValid }
 *   ]}
 *   customActionsPosition="split"
 * />
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
  customActions,
  customActionsPosition = 'split',
  hideDefaultActions = false,
  className = '',
}: FormActionBarProps) {
  const { sidebarCollapsed } = useLayoutContext();
  
  const defaultSubmitText = mode === 'edit' 
    ? (isSubmitting ? 'Updating...' : 'Update')
    : (isSubmitting ? 'Creating...' : 'Create');
  
  const finalSubmitText = submitText || defaultSubmitText;

  // Render custom action buttons
  const renderCustomActions = () => {
    if (!customActions || customActions.length === 0) return null;

    return customActions.map((action) => (
      <Button
        key={action.id}
        type={action.type || 'button'}
        variant={action.variant || 'default'}
        onClick={action.onClick}
        disabled={action.disabled}
      >
        {action.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {action.label}
      </Button>
    ));
  };

  // Render default action buttons
  const renderDefaultActions = () => {
    if (hideDefaultActions || customActions) return null;

    return (
      <>
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
      </>
    );
  };

  // Determine left and right content based on custom actions position
  const getLeftRightContent = () => {
    if (!customActions) {
      return {
        left: (
          <div className="flex items-center gap-4">
            {showRequiredIndicator && (
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive">*</span> Required fields
              </p>
            )}
            {leftContent}
          </div>
        ),
        right: (
          <div className="flex items-center gap-3">
            {rightContent}
            {renderDefaultActions()}
          </div>
        )
      };
    }

    // Custom actions handling
    const actions = renderCustomActions();
    
    if (customActionsPosition === 'left') {
      return {
        left: (
          <div className="flex items-center gap-3">
            {leftContent}
            {actions}
          </div>
        ),
        right: rightContent
      };
    }
    
    if (customActionsPosition === 'right') {
      return {
        left: leftContent,
        right: (
          <div className="flex items-center gap-3">
            {rightContent}
            {actions}
          </div>
        )
      };
    }
    
    // Split position - first action on left, rest on right
    if (customActionsPosition === 'split' && customActions.length > 0) {
      const firstAction = customActions[0];
      const restActions = customActions.slice(1);
      
      return {
        left: (
          <div className="flex items-center gap-3">
            {leftContent}
            <Button
              key={firstAction.id}
              type={firstAction.type || 'button'}
              variant={firstAction.variant || 'outline'}
              onClick={firstAction.onClick}
              disabled={firstAction.disabled}
            >
              {firstAction.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {firstAction.label}
            </Button>
          </div>
        ),
        right: (
          <div className="flex items-center gap-3">
            {rightContent}
            {restActions.map((action) => (
              <Button
                key={action.id}
                type={action.type || 'button'}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action.label}
              </Button>
            ))}
          </div>
        )
      };
    }

    return { left: leftContent, right: rightContent };
  };

  const { left, right } = getLeftRightContent();

  // Determine flex justification based on content presence
  const getJustifyClass = () => {
    if (left && right) return 'justify-between';
    if (right && !left) return 'justify-end';
    if (left && !right) return 'justify-start';
    return 'justify-start';
  };

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40',
      'transition-[margin] duration-200 ease-out',
      'lg:ml-16',
      !sidebarCollapsed && 'lg:ml-64',
      className
    )}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className={cn(
          'flex items-center gap-4',
          getJustifyClass()
        )}>
          {left}
          {right}
        </div>
      </div>
    </div>
  );
}
