/**
 * Policy Card Component
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { Policy } from '../types';
import {
  POLICY_STATUS_COLORS,
  POLICY_STATUS_LABELS,
  POLICY_CATEGORY_COLORS,
  POLICY_CATEGORY_LABELS,
  FILE_TYPE_ICONS,
} from '../constants';

interface PolicyCardProps {
  policy: Policy;
  onView: (policy: Policy) => void;
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  isAdmin?: boolean;
}

export function PolicyCard({
  policy,
  onView,
  onEdit,
  onDelete,
  isAdmin = false,
}: PolicyCardProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const isExpired = policy.expiryDate && new Date(policy.expiryDate) < new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{FILE_TYPE_ICONS[policy.fileType || 'pdf']}</span>
              <h3 className="font-semibold text-base line-clamp-1">{policy.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
              {policy.description || 'No description available'}
            </p>
          </div>
          
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(policy)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(policy)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onView(policy)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(policy)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={POLICY_CATEGORY_COLORS[policy.category]}>
            {POLICY_CATEGORY_LABELS[policy.category]}
          </Badge>
          <Badge className={POLICY_STATUS_COLORS[policy.status]}>
            {POLICY_STATUS_LABELS[policy.status]}
          </Badge>
          {policy.mandatory && (
            <Badge variant="outline" className="border-red-500 text-red-700 dark:text-red-400">
              <AlertCircle className="h-3 w-3 mr-1" />
              Mandatory
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive">
              Expired
            </Badge>
          )}
        </div>

        {/* Policy Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 flex-shrink-0" />
            <span>Version {policy.version}</span>
            <span>•</span>
            <span>{formatFileSize(policy.fileSize)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>Effective: {format(new Date(policy.effectiveDate), 'MMM dd, yyyy')}</span>
          </div>

          {policy.expiryDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className={isExpired ? 'text-destructive' : ''}>
                Expires: {format(new Date(policy.expiryDate), 'MMM dd, yyyy')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <User className="h-3 w-3 flex-shrink-0" />
            <span>Uploaded by {policy.uploadedByName}</span>
          </div>

          {policy.viewCount !== undefined && (
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3 flex-shrink-0" />
              <span>{policy.viewCount} views</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        {isAdmin ? (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(policy)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(policy)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => onView(policy)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Policy
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
