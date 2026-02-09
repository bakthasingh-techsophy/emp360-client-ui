/**
 * Space Card Component
 * Displays individual space information in a card layout
 */

import { useState } from 'react';
import { Building, MapPin, MoreVertical, Pencil, Trash2, Eye, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Space } from '../spaceTypes';
import { cn } from '@/lib/utils';

interface SpaceCardProps {
  space: Space;
  onEdit?: (space: Space) => void;
  onDelete?: (space: Space) => void;
  onView?: (space: Space) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

export function SpaceCard({
  space,
  onEdit,
  onDelete,
  onView,
  selectionMode = false,
  selected = false,
  onSelectChange,
}: SpaceCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className={cn(
      "relative hover:shadow-md transition-shadow",
      selectionMode && selected && "ring-2 ring-primary"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Selection and Icon */}
          <div className="flex items-start gap-3">
            {selectionMode && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelectChange}
                className="mt-1"
              />
            )}
            
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Space Name and ID */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate">{space.spaceName}</h3>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>ID: {space.id}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => copyToClipboard(space.id, `id-${space.id}`)}
                      >
                        {copiedField === `id-${space.id}` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy ID</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(space)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(space)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(space)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {space.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {space.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Location Information */}
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{space.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">Owner: {space.ownerCompany}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {space.ownerId && (
            <div className="col-span-2">
              <span className="font-medium">Owner ID:</span> {space.ownerId}
            </div>
          )}
          {space.createdAt && (
            <div>
              <span className="font-medium">Created:</span> {formatDate(space.createdAt)}
            </div>
          )}
          {space.updatedAt && (
            <div>
              <span className="font-medium">Updated:</span> {formatDate(space.updatedAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
