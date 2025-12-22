// src/types/pagination.ts

/** Stable pagination DTO matching backend Pagination<T> */
export interface Pagination<T> {
  content: T[];
  /**
   * Zero-based page index (matches backend `page` field).
   */
  page: number;
  /**
   * Page size requested / returned.
   */
  size: number;
  /**
   * Total number of elements available across all pages.
   */
  totalElements: number;
  /**
   * Total number of pages available.
   */
  totalPages: number;
  /**
   * True if this is the first page.
   */
  first: boolean;
  /**
   * True if this is the last page.
   */
  last: boolean;
}
export default Pagination;
