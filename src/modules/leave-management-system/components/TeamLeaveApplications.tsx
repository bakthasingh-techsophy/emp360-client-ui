/**
 * Team Leave Applications Component
 * Manager view for team member leave applications with approval actions
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
import { AbsenceApplication } from "../types/leave.types";
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

interface TeamLeaveApplicationsProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  refreshDependency?: number;
}

export function TeamLeaveApplications({
  onApprove,
  onReject,
  refreshDependency = 0,
}: TeamLeaveApplicationsProps) {
  const { getTeamAbsenceApplications, isLoading } = useLeaveManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [applications, setApplications] = useState<AbsenceApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Column visibility state - default columns to show
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "employeeName",
    "id",
    "absenceType",
    "duration",
    "status",
    "createdAt",
    "approvedOn",
    "fromDate",
    "toDate",
    "reason",
  ]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchTeamApplications = useCallback(
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
        searchFields: ["absenceType", "reason"],
        ...(filters && { filters }),
        sort,
      };

      const result = await getTeamAbsenceApplications(
        searchRequest,
        page,
        size
      );
      if (result) {
        setApplications(result.content || []);
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

  // Fetch applications when pagination or search/filters change
  useEffect(() => {
    fetchTeamApplications(pageIndex, pageSize);
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
      id: "absenceType",
      label: "Leave Type",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Annual Leave", value: "AL" },
        { label: "Sick Leave", value: "SL" },
        { label: "Casual Leave", value: "CL" },
        { label: "Compensatory Off", value: "CO" },
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
    console.log("Export team applications");
  };

  // Define all available columns with labels for column configuration
  const allColumnsConfig = [
    { id: "employeeName", label: "Employee" },
    { id: "id", label: "Application ID" },
    { id: "absenceType", label: "Leave Type" },
    { id: "duration", label: "Duration" },
    { id: "status", label: "Status" },
    { id: "createdAt", label: "Applied On" },
    { id: "approvedOn", label: "Approved On" },
    { id: "fromDate", label: "Start Date" },
    { id: "toDate", label: "End Date" },
    { id: "reason", label: "Reason" },
  ];

  // Define table columns using ColumnDef from @tanstack/react-table
  const columns: ColumnDef<AbsenceApplication>[] = useMemo(
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
        header: () => <div className="text-center">Application ID</div>,
        accessorKey: "id",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-semibold whitespace-nowrap text-xs">
              {row.original.id}
            </span>
          </div>
        ),
        size: 140,
      },
      {
        id: "absenceType",
        header: () => <div className="text-center">Leave Type</div>,
        accessorKey: "absenceType",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-medium">{row.original.absenceType}</span>
          </div>
        ),
      },
      {
        id: "duration",
        header: () => <div className="text-center">Duration</div>,
        cell: ({ row }) => {
          const fromDate = formatDate(row.original.fromDate);
          const toDate = formatDate(row.original.toDate);
          const fullRange = `${fromDate} to ${toDate}`;
          const shouldShowTooltip =
            fromDate.length + toDate.length + 4 > 30;

          return (
            <div className="text-center">
              {shouldShowTooltip ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate max-w-xs cursor-help text-sm">
                        {fromDate} to {toDate}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fullRange}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-sm">
                  {fromDate} to {toDate}
                </span>
              )}
            </div>
          );
        },
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
        id: "createdAt",
        header: () => <div className="text-center">Applied On</div>,
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
        id: "approvedOn",
        header: () => <div className="text-center">Approved On</div>,
        accessorKey: "approvedOn",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {row.original.approvedOn
              ? formatDate(row.original.approvedOn)
              : "-"}
          </div>
        ),
      },
      {
        id: "fromDate",
        header: () => <div className="text-center">Start Date</div>,
        accessorKey: "fromDate",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {formatDate(row.original.fromDate)}
          </div>
        ),
      },
      {
        id: "toDate",
        header: () => <div className="text-center">End Date</div>,
        accessorKey: "toDate",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {formatDate(row.original.toDate)}
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
        searchPlaceholder="Search team applications..."
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

      <DataTable<AbsenceApplication>
        ref={tableRef}
        columns={filteredColumns}
        data={applications}
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
          title: "No team applications found",
          description:
            "Your team has no pending leave applications at the moment.",
        }}
        loadingState={{
          message: "Loading team leave applications...",
        }}
      />
    </div>
  );
}
