/**
 * My Leave Credits Component
 * Employee's personal credits with toolbar and DataTable
 *
 * Uses DataTable from @/components/common/DataTable for advanced table features
 * including pagination, sorting, filtering, and row selection.
 * Displays credits allocated to the employee with status, validity dates, and available balance.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSelfService } from "@/contexts/SelfServiceContext";
import { useLeaveManagement } from "@/contexts/LeaveManagementContext";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { DataTableRef } from "@/components/common/DataTable/types";
import { GenericToolbar } from "@/components/GenericToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Credit } from "../types/leave.types";
import UniversalSearchRequest, {
  Filters,
  FiltersMap,
  SortMap,
} from "@/types/search";
import { format } from "date-fns";
import { X } from "lucide-react";
import {
  AvailableFilter,
  ActiveFilter,
} from "@/components/GenericToolbar/types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface MyLeaveCreditsProps {}

export function MyLeaveCredits({}: MyLeaveCreditsProps) {
  const { getCredits, cancelCredit, isLoading } = useSelfService();
  const { searchLeaveConfigurations } = useLeaveManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [credits, setCredits] = useState<Credit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Leave configuration state for mapping credit types to names
  const [creditTypeMap, setCreditTypeMap] = useState<Record<string, string>>({});

  // Column visibility state - default columns to show
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "creditType",
    "credits",
    "available",
    "consumed",
    "status",
    "validity",
    "expiryOn",
    "reason",
    "actionTookOn",
    "actions",
  ]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCredits = useCallback(
    async (page: number, size: number) => {
      // Convert activeFilters to FiltersMap
      const filtersMap: FiltersMap = {};

      activeFilters.forEach((filter) => {
        if (filter.value) {
          filtersMap[filter.id] = filter.value;
        }
      });

      // Build Filters object with 'and' clause (optional)
      const filters: Filters | undefined =
        Object.keys(filtersMap).length > 0 ? { and: filtersMap } : undefined;

      // Build SortMap with proper typing
      const sort: SortMap = {
        createdAt: -1 as const,
      };

      // Construct UniversalSearchRequest with proper typing
      const searchRequest: UniversalSearchRequest = {
        searchText: searchQuery || undefined,
        searchFields: ["creditType", "reason"],
        ...(filters && { filters }),
        sort,
      };

      const result = await getCredits(searchRequest, page, size);

      if (result) {
        setCredits(result.content || []);
        setTotalPages(result.totalPages || 0);
        setTotalItems(result.totalElements || 0);
      }
    },
    [searchQuery, activeFilters, getCredits],
  );

  // Reset pagination when search/filters change
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, activeFilters]);

  // Fetch credits when pagination or search/filters change
  useEffect(() => {
    fetchCredits(pageIndex, pageSize);
  }, [pageIndex, pageSize, searchQuery, activeFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch leave configurations on mount to build credit type map
  const fetchLeaveConfigurations = async () => {
    const searchRequest: UniversalSearchRequest = {
      searchText: undefined,
      searchFields: [],
    };

    const result = await searchLeaveConfigurations(searchRequest, 0, 100);

    if (result && result.content) {
      // Build map from credit type code to configuration name
      const typeMap: Record<string, string> = {};
      result.content.forEach((config) => {
        typeMap[config.code] = config.name;
      });
      setCreditTypeMap(typeMap);
    }
  };
  useEffect(() => {
    fetchLeaveConfigurations();
  }, []);

  // Filter fields
  const filterFields: AvailableFilter[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Pending", value: "PENDING" },
        { label: "Approved", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" },
      ],
    },
    {
      id: "creditType",
      label: "Credit Type",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Compensatory Off", value: "CO" },
        { label: "Special Leave", value: "SL" },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    return (
      <Badge
        variant={
          statusLower === "approved"
            ? "default"
            : statusLower === "rejected"
              ? "destructive"
              : "secondary"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handleExport = () => {
    console.log("Export credits");
  };

  const handleCancelCredit = async (id: string) => {
    const success = await cancelCredit(id);
    if (success) {
      await fetchCredits(pageIndex, pageSize);
    }
  };

  // Define all available columns with labels for column configuration
  const allColumnsConfig = [
    { id: "id", label: "Credit ID" },
    { id: "creditType", label: "Credit Type" },
    { id: "credits", label: "Requested Credits" },
    { id: "available", label: "Available" },
    { id: "consumed", label: "Consumed" },
    { id: "status", label: "Status" },
    { id: "validity", label: "Requested Dates" },
    { id: "expiryOn", label: "Expiry Date" },
    { id: "reason", label: "Reason" },
    { id: "actionTookOn", label: "Action Date" },
    { id: "createdAt", label: "Created On" },
    { id: "actions", label: "Actions" },
  ];

  // Define table columns using ColumnDef from @tanstack/react-table
  const columns: ColumnDef<Credit>[] = useMemo(
    () => [
      {
        id: "id",
        header: () => <div className="text-center">Credit ID</div>,
        accessorKey: "id",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold whitespace-nowrap">
              {row.original.id}
            </span>
          </div>
        ),
        size: 140,
      },
      {
        id: "creditType",
        header: () => <div className="text-center">Credit Type</div>,
        accessorKey: "creditType",
        cell: ({ row }) => {
          const code = row.original.creditType;
          const name = creditTypeMap[code] || code;
          const shouldShowTooltip = name.length > 20;
          return (
            <div className="flex flex-col gap-1 items-center justify-center">
              {shouldShowTooltip ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-medium truncate max-w-xs cursor-help">
                        {name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="font-medium">{name}</span>
              )}
            </div>
          );
        },
        size: 180,
      },
      {
        id: "credits",
        header: () => <div className="text-center">Requested Credits</div>,
        accessorKey: "credits",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold whitespace-nowrap">
              {row.original.credits}
            </span>
          </div>
        ),
        size: 140,
      },
      {
        id: "available",
        header: () => <div className="text-center">Available</div>,
        accessorKey: "available",
        cell: ({ row }) => {
          const available = row.original.available ?? 0;
          return (
            <div className="text-center">
              <Badge variant="secondary" className="whitespace-nowrap">
                {available}
              </Badge>
            </div>
          );
        },
        size: 120,
      },
      {
        id: "consumed",
        header: () => <div className="text-center">Consumed</div>,
        accessorKey: "consumed",
        cell: ({ row }) => {
          const consumed = row.original.consumed ?? 0;
          return (
            <div className="text-center">
              <span className="whitespace-nowrap font-medium text-orange-600">
                {consumed}
              </span>
            </div>
          );
        },
        size: 120,
      },
      {
        id: "status",
        header: () => <div className="text-center">Status</div>,
        accessorKey: "status",
        cell: ({ row }) => (
          <div className="text-center whitespace-nowrap">
            {getStatusBadge(row.original.status)}
          </div>
        ),
        size: 140,
      },
      {
        id: "validity",
        header: () => <div className="text-center">Requested Dates</div>,
        cell: ({ row }) => {
          const fromDate = formatDate(row.original.fromDate);
          const toDate = formatDate(row.original.toDate);
          const dateRangeText = `${fromDate} to ${toDate}`;
          return (
            <div className="flex flex-col items-center justify-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      <span className="text-sm truncate max-w-xs">
                        {fromDate}
                      </span>
                      <span className="text-xs text-muted-foreground">to</span>
                      <span className="text-sm truncate max-w-xs">{toDate}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dateRangeText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
        enableSorting: false,
        size: 280,
      },
      {
        id: "expiryOn",
        header: () => <div className="text-center">Expiry Date</div>,
        accessorKey: "expiryOn",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="whitespace-nowrap">
              {formatDate(row.original.expiryOn)}
            </span>
          </div>
        ),
        size: 150,
        enableHiding: true,
      },
      {
        id: "reason",
        header: () => <div className="text-center">Reason</div>,
        accessorKey: "reason",
        cell: ({ row }) => {
          const reason = row.original.reason;
          const shouldShowTooltip = reason.length > 30;
          return (
            <div className="text-center">
              {shouldShowTooltip ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm truncate max-w-xs cursor-help">
                        {reason}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{reason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-sm">{reason}</span>
              )}
            </div>
          );
        },
        size: 200,
      },
      {
        id: "actionTookOn",
        header: () => <div className="text-center">Action Date</div>,
        accessorKey: "actionTookOn",
        cell: ({ row }) => {
          const actionDate = row.original.actionTookOn;
          return (
            <div className="text-center">
              {actionDate ? (
                <span className="whitespace-nowrap">
                  {formatDate(actionDate)}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        id: "createdAt",
        header: () => <div className="text-center">Created On</div>,
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="whitespace-nowrap">
              {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
            </span>
          </div>
        ),
        size: 150,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            {row.original.status.toUpperCase() === "PENDING" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelCredit(row.original.id)}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        ),
        size: 120,
      },
    ],
    [creditTypeMap],
  );

  // Filter columns based on visibleColumns configuration
  const filteredColumns = useMemo(
    () =>
      columns.filter((column: any) => {
        // For other columns, check if they're in visibleColumns
        if (column.id) {
          return visibleColumns.includes(column.id);
        }
        return true;
      }),
    [columns, visibleColumns],
  );

  // Build columnVisibility object for DataTable initial state
  // This maps column IDs to their visibility state
  const initialColumnVisibilityState = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    allColumnsConfig.forEach((col) => {
      // Set to false if not in visibleColumns, true otherwise
      visibility[col.id] = visibleColumns.includes(col.id);
    });
    return visibility;
  }, [visibleColumns]);

  const handleExportAll = () => {
    handleExport();
  };

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when page size changes
  };

  return (
    <div className="space-y-4">
      <GenericToolbar
        searchPlaceholder="Search credits..."
        onSearchChange={setSearchQuery}
        showFilters={true}
        availableFilters={filterFields}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        showExport={true}
        onExportAll={handleExportAll}
        showConfigureView={true}
        allColumns={allColumnsConfig}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
      />

      <DataTable<Credit>
        ref={tableRef}
        columns={filteredColumns}
        data={credits}
        loading={isLoading}
        pagination={{
          pageIndex,
          pageSize,
          totalPages,
          totalItems,
          canNextPage: pageIndex < totalPages - 1,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        paginationVariant="default"
        fixedPagination={true}
        serverSidePagination={true}
        enableColumnVisibility={true}
        initialColumnVisibility={initialColumnVisibilityState}
        emptyState={{
          title: "No credits found",
          description: "You have no credits allocated yet.",
          action: {
            label: "Request Credits",
            onClick: () => {
              // Navigate to request credits page
              console.log("Navigate to request credits");
            },
          },
        }}
        loadingState={{
          message: "Loading your credits...",
        }}
      />
    </div>
  );
}
