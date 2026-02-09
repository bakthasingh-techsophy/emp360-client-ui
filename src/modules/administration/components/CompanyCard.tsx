/**
 * Company Card Component
 * Displays individual company information in a card layout
 */

import { useState } from 'react';
import { Building2, Mail, Phone, Globe, MapPin, MoreVertical, Pencil, Trash2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { CompanyModel } from '@/types/company';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company: CompanyModel;
  onEdit?: (company: CompanyModel) => void;
  onDelete?: (company: CompanyModel) => void;
  onView?: (company: CompanyModel) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

export function CompanyCard({
  company,
  onEdit,
  onDelete,
  onView,
  selectionMode = false,
  selected = false,
  onSelectChange,
}: CompanyCardProps) {
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
          {/* Selection and Logo/Icon */}
          <div className="flex items-start gap-3">
            {selectionMode && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelectChange}
                className="mt-1"
              />
            )}
            
            <div className="flex-shrink-0">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>

            {/* Company Name and Code */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate">{company.name}</h3>
                <Badge variant={company.isActive ? 'default' : 'secondary'}>
                  {company.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {company.code && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Code: {company.code}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => copyToClipboard(company.code!, `code-${company.id}`)}
                        >
                          {copiedField === `code-${company.id}` ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy code</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
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
                <DropdownMenuItem onClick={() => onView(company)}>
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(company)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(company)}
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
        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {company.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Information */}
        <div className="grid gap-2">
          {company.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{company.email}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{company.phone}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {company.website}
              </a>
            </div>
          )}
          {(company.city || company.state || company.country) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {[company.city, company.state, company.country]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {company.industry && (
            <div>
              <span className="font-medium">Industry:</span> {company.industry}
            </div>
          )}
          {company.registrationNumber && (
            <div>
              <span className="font-medium">Reg. No:</span> {company.registrationNumber}
            </div>
          )}
          {company.createdAt && (
            <div>
              <span className="font-medium">Created:</span> {formatDate(company.createdAt)}
            </div>
          )}
          {company.updatedAt && (
            <div>
              <span className="font-medium">Updated:</span> {formatDate(company.updatedAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
