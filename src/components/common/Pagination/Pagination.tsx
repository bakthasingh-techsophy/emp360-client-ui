// Pagination - Main entry point with variant support

import { PaginationProps, PaginationVariant } from './types';
import { DefaultPagination } from './DefaultPagination';
import { CompactPagination } from './CompactPagination';
import { SimplePagination } from './SimplePagination';
import { NumberedPagination } from './NumberedPagination';

export interface PaginationComponentProps extends PaginationProps {
  variant?: PaginationVariant;
  loading?: boolean;
  loadMoreText?: string;
}

export function Pagination({ variant = 'default', ...props }: PaginationComponentProps) {
  switch (variant) {
    case 'compact':
      return <CompactPagination {...props} />;
    case 'simple':
      return <SimplePagination {...props} />;
    case 'numbered':
      return <NumberedPagination {...props} />;
    case 'default':
    default:
      return <DefaultPagination {...props} />;
  }
}
