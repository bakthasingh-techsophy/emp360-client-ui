/**
 * FormHeader Component
 * Reusable header for all forms with back navigation, title, description, and actions
 */

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export interface FormHeaderProps {
  /** Main heading text */
  title: string;
  /** Subtitle/description text */
  description?: string;
  /** Handler for back button click */
  onBack?: () => void;
  /** Hide back button completely */
  hideBackButton?: boolean;
  /** Actions to display on the right side (buttons, dropdowns, etc.) */
  actions?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function FormHeader({
  title,
  description,
  onBack,
  hideBackButton = false,
  actions,
  className = '',
}: FormHeaderProps) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {/* Back button */}
      {!hideBackButton && onBack && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="shrink-0 h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Title and description */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            {description}
          </p>
        )}
      </div>
      
      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
