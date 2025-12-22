import { ActiveFilter } from './types';
import { 
  UniversalSearchRequest, 
  FieldFilterValue, 
  OperatorMap,
  DateFilter,
  DateFilterType 
} from '@/types/search';

/**
 * Builds a UniversalSearchRequest from GenericToolbar's ActiveFilter array
 * Maps operators to the structured format expected by backend QueryBuilderUtil
 * 
 * Backend expects:
 * {
 *   searchText: "keyword",
 *   searchFields: ["name", "email"],
 *   filters: {
 *     and: { 
 *       field1: { op: "eq", value: "value1" },
 *       field2: { op: "all", values: ["value2", "value3"] },
 *       field3: { op: "regex", pattern: "text", options: "i" }
 *     },
 *     or: { field4: { op: "in", values: [...] } }
 *   },
 *   dateFilter: {
 *     type: "between",
 *     field: "createdAt",
 *     startDate: "2025-10-01T00:00:00Z",
 *     endDate: "2025-10-31T23:59:59Z"
 *   }
 * }
 * 
 * Example with 'all' operator (includes all):
 * - ActiveFilter: { filterId: "userTypes", operator: "all", value: ["staff"] }
 * - Output: { filters: { and: { userTypes: { op: "all", values: ["staff"] } } } }
 */
export function buildUniversalSearchRequest(
  activeFilters: ActiveFilter[],
  searchText?: string,
  searchFields?: string[]
): UniversalSearchRequest {
  const request: UniversalSearchRequest = {};

  // Add search text if provided
  if (searchText && searchText.trim()) {
    request.searchText = searchText.trim();
    request.searchFields = searchFields || [];
  }

  // Process filters
  const andFilters: Record<string, FieldFilterValue> = {};
  let dateFilter: DateFilter | undefined;

  for (const filter of activeFilters) {
    const { filterId, operator, value } = filter;

    // Skip if no value (except for 'today' and 'exists' operators)
    if (operator !== 'today' && operator !== 'exists') {
      if (value === null || value === undefined || value === '') continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        const objValue = value as any;
        const hasValue = Object.values(objValue).some(v => v !== null && v !== undefined && v !== '');
        if (!hasValue) continue;
      }
    }

    // Handle date filters separately
    if (isDateOperator(operator)) {
      dateFilter = buildDateFilter(filterId, operator, value);
      continue;
    }

    // Build operator map based on operator type
    const filterValue = buildFilterValue(operator, value);
    andFilters[filterId] = filterValue;
  }

  // Add filters to request (backend expects filters.and or filters.or directly)
  if (Object.keys(andFilters).length > 0) {
    request.filters = { and: andFilters };
  }

  // Add date filter if present
  if (dateFilter) {
    request.dateFilter = dateFilter;
  }

  return request;
}

/**
 * Checks if operator is a date operator
 */
function isDateOperator(operator: string): operator is DateFilterType {
  return ['today', 'on', '>=', '<=', 'between'].includes(operator);
}

/**
 * Builds a DateFilter from operator and value
 * Backend expects: { type, field, startDate?, endDate?, onDate? }
 * Dates must be ISO 8601 format (e.g., "2025-10-01T00:00:00Z")
 */
function buildDateFilter(field: string, operator: DateFilterType, value: any): DateFilter {
  const dateFilter: DateFilter = {
    type: operator,
    field: field,
  };

  if (operator === 'today') {
    // No additional fields needed - backend handles it
    return dateFilter;
  }

  if (operator === 'on') {
    // Backend expects 'onDate' field
    const dateValue = value?.from || value;
    dateFilter.onDate = ensureISO8601(dateValue);
    return dateFilter;
  }

  if (operator === '>=') {
    // Backend expects 'startDate' field
    const dateValue = value?.from || value;
    dateFilter.startDate = ensureISO8601(dateValue);
    return dateFilter;
  }

  if (operator === '<=') {
    // Backend expects 'endDate' field
    const dateValue = value?.from || value;
    dateFilter.endDate = ensureISO8601(dateValue);
    return dateFilter;
  }

  if (operator === 'between') {
    // Backend expects both 'startDate' and 'endDate'
    dateFilter.startDate = ensureISO8601(value?.from);
    dateFilter.endDate = ensureISO8601(value?.to);
    return dateFilter;
  }

  return dateFilter;
}

/**
 * Ensures date is in ISO 8601 format expected by backend
 * Backend expects: "2025-10-01T00:00:00Z"
 */
function ensureISO8601(date: any): string {
  if (!date) return '';
  
  // If already a string in ISO format, return as-is
  if (typeof date === 'string') {
    // If it's already in ISO format with timezone, return it
    if (date.includes('T') && date.includes('Z')) {
      return date;
    }
    // If it's just a date string (YYYY-MM-DD), add time component
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return `${date}T00:00:00Z`;
    }
    // Try to parse and convert
    try {
      return new Date(date).toISOString();
    } catch {
      return date;
    }
  }
  
  // If it's a Date object or timestamp
  try {
    return new Date(date).toISOString();
  } catch {
    return '';
  }
}

/**
 * Builds the appropriate FieldFilterValue based on operator and value
 * Matches backend QueryBuilderUtil.buildFieldCriteria() expectations:
 * 
 * 1. Structured operator map: { op: "all", values: [...] } or { op: "eq", value: ... }
 * 2. Collection -> defaults to $in (backward compatibility)
 * 3. String with "regex:" prefix -> regex filter
 * 4. Other primitives -> exact match
 */
function buildFilterValue(operator: string, value: any): FieldFilterValue {
  // Text operators
  if (operator === 'regex') {
    // Backend expects: { op: "regex", pattern: "text", options: "i" }
    const operatorMap: OperatorMap = {
      op: 'regex',
      pattern: value,
      options: 'i', // case-insensitive by default
    };
    return operatorMap;
  }

  // Comparison operators (eq, lt, lte, gt, gte)
  if (['eq', 'lt', 'lte', 'gt', 'gte'].includes(operator)) {
    // Backend expects: { op: "eq", value: ... }
    const operatorMap: OperatorMap = {
      op: operator as 'eq' | 'lt' | 'lte' | 'gt' | 'gte',
      value: value,
    };
    return operatorMap;
  }

  // Collection operators (in, all, nin)
  if (['in', 'all', 'nin'].includes(operator)) {
    // Backend expects: { op: "in", values: [...] }
    const values = Array.isArray(value) ? value : [value];
    const operatorMap: OperatorMap = {
      op: operator as 'in' | 'all' | 'nin',
      values: values,
    };
    return operatorMap;
  }

  // Size operator
  if (operator === 'size') {
    // Backend expects: { op: "size", value: number }
    const operatorMap: OperatorMap = {
      op: 'size',
      value: Number(value),
    };
    return operatorMap;
  }

  // Exists operator
  if (operator === 'exists') {
    // Backend expects: { op: "exists", value: boolean }
    const operatorMap: OperatorMap = {
      op: 'exists',
      value: value === true || value === 'true',
    };
    return operatorMap;
  }

  // Fallback for backward compatibility:
  // - If value is array -> backend will treat as $in
  // - If value is string -> exact match (unless starts with "regex:")
  // - Other types -> exact match
  return value;
}

