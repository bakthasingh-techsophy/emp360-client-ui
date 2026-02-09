/**
 * Holiday Card Component
 * Displays a single holiday in the grid view
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Holiday } from '../types';

interface HolidayCardProps {
  holiday: Holiday;
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (holiday: Holiday) => void;
  isAdmin?: boolean;
}

export const HolidayCard: React.FC<HolidayCardProps> = ({
  holiday,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
        {holiday.imageUrl ? (
          <img
            src={holiday.imageUrl}
            alt={holiday.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-xs text-muted-foreground">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header with Actions */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-base line-clamp-2 flex-1">{holiday.name}</h3>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(holiday)} className="cursor-pointer">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(holiday)}
                    className="cursor-pointer text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description */}
        {holiday.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {holiday.description}
          </p>
        )}

        {/* Companies */}
        <div className="mt-auto">
          <p className="text-xs text-muted-foreground mb-2">
            Applicable to {holiday.companyIds.length} company{holiday.companyIds.length !== 1 ? 'ies' : ''}
          </p>
          <div className="flex flex-wrap gap-1">
            {holiday.companyIds.slice(0, 3).map((companyId) => (
              <Badge key={companyId} variant="secondary" className="text-xs">
                {companyId}
              </Badge>
            ))}
            {holiday.companyIds.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{holiday.companyIds.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
