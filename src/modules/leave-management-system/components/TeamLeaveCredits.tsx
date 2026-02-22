/**
 * Team Leave Credits Component
 * Manager view for team member credit requests with approval actions
 *
 * Uses DataTable from @/components/common/DataTable for advanced table features
 * including pagination, sorting, filtering, and row selection.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { CheckCircle, XCircle } from "lucide-react";
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

interface TeamLeaveCreditsProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  refreshDependency?: number;
}

export function TeamLeaveCredits({
  onApprove,
  onReject,
  refreshDependency = 0,
}: TeamLeaveCreditsProps) {
  const { getTeamCreditRequests, isLoading } = useLeaveManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [credits, setCredits] = useState<Credit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Column visibility state - default columns to show
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "employeeName",
    "creditType",
    "credits",
    "available",
    "consumed",
    "status",
    "expiryOn",
    "reason",
    "actionTookOn",
  ]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchTeamCredits = useCallback(
    async (page: number, size: number) => {
      // Convert activeFilters to FiltersMap
      const filtersMap: FiltersMap = {};

      activeFilters.forEach((filter) => {
        if (filter.value) {
          filtersMap[filter.id] = filter.value;
        }
      });

      // Build Filters object with 'and' clause
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

      const result = await getTeamCreditRequests(
        searchRequest,
        page,
        size
      );
      if (result) {
        setCredits(result.content || []);
        setTotalItems(result.totalElements || 0);
        setTotalPages(result.totalPages || 0);
      }
    },
    [searchQuery, activeFilters]
  );

  // Reset pagination when search/filters change
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, activeFilters, refreshDependency]);

  // Fetch credits when pagination or search/filters change
  useEffect(() => {
    fetchTeamCredits(pageIndex, pageSize);
  }, [pageIndex, pageSize, searchQuery, activeFilters, refreshDependency]); // eslint-disable-line react-hooks/exhaustive-deps

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
        { label: "Maternity Leave", value: "ML" },
        { label: "Paternity Leave", value: "PL" },
        { label: "Medical Leave", value: "MEL" },
        { label: "Compassionate Leave", value: "CL" },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
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
        {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handleExport = () => {
    console.log("Export team credits");
  };

  // Define all available columns with labels for column configuration
  const allColumnsConfig = [
    { id: "employeeName", label: "Employee" },
    { id: "id", label: "Credit ID" },
    { id: "creditType", label: "Credit Type" },
    { id: "credits", label: "Requested Credits" },
    { id: "available", label: "Available" },
    { id: "consumed", label: "Consumed" },
    { id: "status", label: "Status" },
    { id: "expiryOn", label: "Expiry Date" },
    { id: "reason", label: "Reason" },
    { id: "actionTookOn", label: "Action Date" },
    { id: "createdAt", label: "Created On" },
  ];

  // Define table columns using ColumnDef from @tanstack/react-table
  const columns: ColumnDef<Credit>[] = useMemo(
    () => [
      {
        id: "employeeName",
        header: () => <div>Employee</div>,
        cell: ({ row }) => {
          const empName = `${row.original.firstName || ""} ${row.original.lastName || ""}`.trim();
          return <div className="font-medium">{empName}</div>;
        },
        size: 150,
      },
      {
        id: "id",
        header: () => <div className="text-center">Credit ID</div>,
        accessorKey: "id",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold whitespace-nowrap text-xs">
              {row.original.id}
            </span>
          </div>
        ),
        size: 120,
      },
      {
        id: "creditType",
        header: () => <div className="text-center">Credit Type</div>,
        accessorKey: "creditType",
        cell: ({ row }) => {
          const creditType = row.original.creditType || "-";
          const shouldShowTooltip = creditType.length > 20;

          return (
            <div className="text-center">
              {shouldShowTooltip ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate max-w-xs cursor-help">
                        {creditType}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{creditType}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span>{creditType}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "credits",
        header: () => <div className="text-center">Requested Credits</div>,
        accessorKey: "credits",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold">{row.original.credits || "-"}</span>
          </div>
        ),
      },
      {
        id: "available",
        header: () => <div className="text-center">Available</div>,
        accessorKey: "available",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {row.original.available || "-"}
            </Badge>
          </div>
        ),
      },
      {
        id: "consumed",
        header: () => <div className="text-center">Consumed</div>,
        accessorKey: "consumed",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="text-orange-600 font-medium">
              {row.original.consumed || "-"}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: () => <div className="text-center">Status</div>,
        accessorKey: "status",
        cell: ({ row }) => (
          <div className="text-center">
            {getStatusBadge(row.original.status)}
          </div>
        ),
      },
      {
        id: "expiryOn",
        header: () => <div className="text-center">Expiry Date</div>,
        accessorKey: "expiryOn",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {row.original.expiryOn
              ? formatDate(row.original.expiryOn)
              : "-"}
          </div>
        ),
      },
      {
        id: "reason",
        header: () => <div>Reason</div>,
        accessorKey: "reason",
        cell: ({ row }) => {
          const reason = row.original.reason || "-";
          const shouldShowTooltip = reason.length > 30;

          return (
            <div>
              {shouldShowTooltip ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate max-w-xs cursor-help">
                        {reason}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{reason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="truncate">{reason}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "actionTookOn",
        header: () => <div className="text-center">Action Date</div>,
        accessorKey: "actionTookOn",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {row.original.actionTookOn
              ? formatDate(row.original.actionTookOn)
              : "-"}
          </div>
        ),
      },
      {
        id: "createdAt",
        header: () => <div className="text-center">Created On</div>,
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {row.original.createdAt
              ? formatDate(row.original.createdAt)
              : "-"}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const isPending =
            row.original.status?.toUpperCase() === "PENDING";
          return (
            <div className="flex items-center justify-center gap-2">
              {isPending ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onApprove(row.original.id)}
                    className="h-8 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onReject(row.original.id)}
                    className="h-8"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  // Filter columns based on visibility state
  const filteredColumns = useMemo(
    () =>
      columns.filter((column) => {
        // Always show actions column
        if (column.id === "actions") {
          return true;
        }
        // For other columns, check if they're in visibleColumns
        if (column.id) {
          return visibleColumns.includes(column.id);
        }
        return true;
      }),
    [columns, visibleColumns]
  );

  // Build columnVisibility object for DataTable initial state
  const initialColumnVisibilityState = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    allColumnsConfig.forEach((col) => {
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
    setPageIndex(0);
  };

  return (
    <div className="space-y-4">
      <GenericToolbar
        searchPlaceholder="Search team credit requests..."
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
          title: "No team credit requests found",
          description: "Your team has no pending credit requests at the moment.",
        }}
        loadingState={{
          message: "Loading team credit requests...",
        }}
      />
    </div>
  );
}
