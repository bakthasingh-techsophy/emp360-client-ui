/**
 * My Leave Applications Component
 * Employee's personal leave applications with toolbar and DataTable
 *
 * Uses DataTable from @/components/common/DataTable for advanced table features
 * including pagination, sorting, filtering, and row selection.
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
import { AbsenceApplication } from "../types/leave.types";
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

interface MyLeaveApplicationsProps {
}

export function MyLeaveApplications({}: MyLeaveApplicationsProps) {
  const { getLeaveApplicationsSelfService, cancelAbsenceApplication, isLoading } = useSelfService();
  const { searchLeaveConfigurations } = useLeaveManagement();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [applications, setApplications] = useState<AbsenceApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Leave configuration state for mapping absence type codes to names
  const [absenceTypeMap, setAbsenceTypeMap] = useState<Record<string, string>>(
    {},
  );

  // Column visibility state - default columns to show
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "absenceType",
    "duration",
    "timeRange",
    "status",
    "lopDays",
    "createdAt",
    "approvedOn",
    "actions",
  ]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchLeaveApplications = useCallback(
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
        searchFields: ["absenceType", "reason"],
        ...(filters && { filters }),
        sort,
      };

      const result = await getLeaveApplicationsSelfService(
        searchRequest,
        page,
        size,
      );

      if (result) {
        setApplications(result.content || []);
        setTotalPages(result.totalPages || 0);
        setTotalItems(result.totalElements || 0);
      }
    },
    [searchQuery, activeFilters],
  );

  // Reset pagination when search/filters change
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, activeFilters]);

  // Fetch applications when pagination or search/filters change
  useEffect(() => {
    fetchLeaveApplications(pageIndex, pageSize);
  }, [pageIndex, pageSize, searchQuery, activeFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch leave configurations on mount to build absence type map
  const fetchLeaveConfigurations = async () => {
    const searchRequest: UniversalSearchRequest = {
      searchText: undefined,
      searchFields: [],
    };

    const result = await searchLeaveConfigurations(searchRequest, 0, 100);

    if (result && result.content) {
      // Build map from absence type code to configuration name
      const typeMap: Record<string, string> = {};
      result.content.forEach((config) => {
        typeMap[config.code] = config.name;
      });
      setAbsenceTypeMap(typeMap);
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
        { label: "Cancelled", value: "CANCELLED" },
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
    console.log("Export applications");
  };
  const handleCancelLeave = async (id: string) => {
    // Call the cancel API from context
    const success = await cancelAbsenceApplication(id);
    if (success) {
      // Refresh the list after successful cancellation
      await fetchLeaveApplications(pageIndex, pageSize);
    }
  };

  // Define all available columns with labels for column configuration
  const allColumnsConfig = [
    { id: "id", label: "Leave ID" },
    { id: "absenceType", label: "Leave Type" },
    { id: "duration", label: "Duration" },
    { id: "timeRange", label: "Time Range" },
    { id: "status", label: "Status" },
    { id: "lopDays", label: "LOP Days" },
    { id: "createdAt", label: "Applied On" },
    { id: "approvedOn", label: "Approved On" },
    { id: "fromDate", label: "Start Date" },
    { id: "toDate", label: "End Date" },
    { id: "actions", label: "Actions" },
  ];

  // Define table columns using ColumnDef from @tanstack/react-table
  const columns: ColumnDef<AbsenceApplication>[] = useMemo(
    () => [
      {
        id: "id",
        header: () => <div className="text-center">Leave ID</div>,
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
        id: "absenceType",
        header: () => <div className="text-center">Leave Type</div>,
        accessorKey: "absenceType",
        cell: ({ row }) => {
          const code = row.original.absenceType;
          const name = absenceTypeMap[code] || code;
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
        id: "duration",
        header: () => <div className="text-center">Duration</div>,
        cell: ({ row }) => {
          const fromDate = formatDate(row.original.fromDate);
          const toDate = formatDate(row.original.toDate);
          const totalDays = row.original.totalDays || 0;
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
              <span className="text-xs text-muted-foreground">
                ({totalDays} {totalDays === 1 ? "day" : "days"})
              </span>
            </div>
          );
        },
        enableSorting: false,
        size: 280,
      },
      {
        id: "timeRange",
        header: () => <div className="text-center">Time Range</div>,
        accessorKey: "timeRange",
        cell: ({ row }) => {
          const timeRange = row.original.timeRange;
          if (!timeRange)
            return (
              <div className="text-center">
                <span className="text-muted-foreground">-</span>
              </div>
            );

          const rangeDisplay =
            timeRange === "fullDay"
              ? "Full Day"
              : timeRange === "firstHalf"
                ? "First Half"
                : timeRange === "secondHalf"
                  ? "Second Half"
                  : timeRange;

          return (
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {rangeDisplay}
              </Badge>
            </div>
          );
        },
        size: 150,
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
        id: "lopDays",
        header: () => <div className="text-center">LOP Days</div>,
        accessorKey: "lopDays",
        cell: ({ row }) => {
          const lopDays = row.original.lopDays;
          return (
            <div className="text-center">
              <span className="font-semibold whitespace-nowrap">
                {lopDays || 0}
              </span>
            </div>
          );
        },
        size: 120,
      },
      {
        id: "createdAt",
        header: () => <div className="text-center">Applied On</div>,
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
        id: "approvedOn",
        header: () => <div className="text-center">Approved On</div>,
        accessorKey: "approvedOn",
        cell: ({ row }) => {
          const approvedOn = row.original.approvedOn;
          return (
            <div className="text-center">
              {approvedOn ? (
                <span className="whitespace-nowrap">
                  {format(new Date(approvedOn), "MMM dd, yyyy")}
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
        id: "fromDate",
        header: () => <div className="text-center">Start Date</div>,
        accessorKey: "fromDate",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="whitespace-nowrap">
              {formatDate(row.original.fromDate)}
            </span>
          </div>
        ),
        size: 140,
        enableHiding: true,
      },
      {
        id: "toDate",
        header: () => <div className="text-center">End Date</div>,
        accessorKey: "toDate",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="whitespace-nowrap">
              {formatDate(row.original.toDate)}
            </span>
          </div>
        ),
        size: 140,
        enableHiding: true,
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
                onClick={() => handleCancelLeave(row.original.id)}
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
    [absenceTypeMap],
  );

  // Filter columns based on visibleColumns configuration
  const filteredColumns = useMemo(
    () =>
      columns.filter((column: any) => {
        // Always include actions column
        if (column.id === "actions") {
          return true;
        }
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
        searchPlaceholder="Search applications..."
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
          title: "No leave applications found",
          description:
            "You have no leave applications yet. Apply for leave to get started.",
          action: {
            label: "Apply Leave",
            onClick: () => {
              // Navigate to apply leave page
              console.log("Navigate to apply leave");
            },
          },
        }}
        loadingState={{
          message: "Loading your leave applications...",
        }}
      />
    </div>
  );
}
