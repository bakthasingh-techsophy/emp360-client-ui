/**
 * src/types/universalSearch.ts
 *
 * Extended UniversalSearchRequest types to support structured filter operators
 * (e.g. { op: 'all', values: [...] }) in addition to the existing simple
 * scalar/array and "regex:..." string conventions.
 *
 * This aligns the front-end type definitions with the backend QueryBuilderUtil
 * which accepts structured operator maps for flexible query operators like
 * `all`, `in`, `nin`, `size`, `exists`, `regex`, `eq`, `lt`, `lte`, `gt`, `gte`.
 */

/** Allowed date-filter kinds (matches backend QueryBuilderUtil) */
export type DateFilterType = "on" | ">=" | "<=" | "today" | "between";

/**
 * Primitive types allowed for simple field filters
 */
export type SimpleFieldValue = string | number | boolean;
export type FieldArrayValue = Array<string | number | boolean>;

/**
 * Back-end supported filter operators (structured form)
 */
export type ComparisonOp = "eq" | "lt" | "lte" | "gt" | "gte";
export type CollectionOp = "in" | "all" | "nin";

/**
 * Structured operator variants accepted by backend QueryBuilderUtil
 */
export interface InAllNinOperator {
  op: CollectionOp;           // "in" | "all" | "nin"
  values: FieldArrayValue;    // collection of values
}

export interface SizeOperator {
  op: "size";               // array length check
  value: number;
}

export interface ExistsOperator {
  op: "exists";             // existence check
  value: boolean;
}

export interface RegexOperator {
  op: "regex";              // regex with optional options (e.g. "i")
  pattern: string;           // regex pattern (no prefix)
  options?: string;          // optional flags (e.g. "i")
}

export interface ComparisonOperator {
  op: ComparisonOp;          // eq | lt | lte | gt | gte
  value: SimpleFieldValue;
}

/** Union of all structured operator shapes */
export type OperatorMap =
  | InAllNinOperator
  | SizeOperator
  | ExistsOperator
  | RegexOperator
  | ComparisonOperator;

/**
 * FieldFilterValue allowed on the frontend:
 * - simple primitive (string/number/boolean)
 * - array -> interpreted as Mongo `$in`
 * - structured OperatorMap -> explicit operator like `all`, `size`, `regex`, etc.
 * - legacy string with `regex:` prefix is still allowed (see backend handling)
 */
export type FieldFilterValue =
  | SimpleFieldValue
  | FieldArrayValue
  | OperatorMap
  | string; // keep string to allow legacy "regex:..." convention

/** The 'and' / 'or' maps in filters:
 * each key is a field name and the value can be a scalar, an array (interpreted as "in"),
 * or a structured operator map.
 * e.g. { status: "ACTIVE", city: ["Hyderabad","Pune"], tags: { op: 'all', values: ['red','large'] } }
 */
export type FiltersMap = Record<string, FieldFilterValue>;

/** Top-level Filters container used by the backend QueryBuilderUtil */
export interface Filters {
  and?: FiltersMap;
  or?: FiltersMap;
}

/** Date filter payload that QueryBuilderUtil expects */
export interface DateFilter {
  type: DateFilterType;
  field?: string;       // defaults to createdAt in backend if omitted
  startDate?: string;   // ISO 8601 string, e.g. "2025-10-01T00:00:00Z"
  endDate?: string;     // ISO 8601 string
  onDate?: string;      // ISO 8601 string used when type === "on"
}

/** Universal search request body that maps to QueryBuilderUtil */
export interface UniversalSearchRequest {
  idsList?: string[];             // include only these ids
  notIdsList?: string[];          // exclude these ids
  searchText?: string;            // free text searched across searchFields
  searchFields?: string[];        // fields to apply searchText to (e.g. ["name","email"]) 
  filters?: Filters;              // AND / OR structured filters
  dateFilter?: DateFilter;        // date-based filters (on, between, >=, <=, today)
}

export default UniversalSearchRequest;
