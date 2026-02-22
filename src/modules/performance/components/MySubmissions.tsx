/**
 * My Submissions Component - Employee Self-Service
 * View performance templates available for employee's department
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { DataTableRef } from "@/components/common/DataTable/types";
import { ColumnDef } from "@tanstack/react-table";
import { GenericToolbar } from "@/components/GenericToolbar/GenericToolbar";
import { PerformanceTemplate } from "../types";
import {
  AvailableFilter,
  ActiveFilter,
} from "@/components/GenericToolbar/types";
import { useSelfService } from "@/contexts/SelfServiceContext";
import { Eye } from "lucide-react";

export const MySubmissions: React.FC = () => {
  const { getMyPerformanceTemplates } = useSelfService();
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [templates, setTemplates] = useState<PerformanceTemplate[]>([]);
  const tableRef = useRef<DataTableRef>(null);

  // ============= LOAD TEMPLATES ON MOUNT =============
  const loadData = async () => {
    const templateResult = await getMyPerformanceTemplates();
    if (templateResult) {
      setTemplates(templateResult);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Define available filters for templates
  const availableFilters = useMemo(() => {
    const filters: AvailableFilter[] = [
      {
        id: "templateStatus",
        label: "Template Status",
        type: "select",
        operators: [{ label: "Is", value: "eq" }],
        options: [
          { label: "Open", value: "open" },
          { label: "Hold", value: "hold" },
          { label: "Closed", value: "closed" },
        ],
      },
    ];
    return filters;
  }, []);

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<PerformanceTemplate>[]>(
    () => [
      {
        id: "title",
        header: "Title",
        accessorKey: "title",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.title}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.description}
            </p>
          </div>
        ),
        size: 300,
      },
      {
        id: "columns",
        header: () => <div className="text-center">Columns</div>,
        accessorKey: "columnIds",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant="secondary">
              {(row.original.columnIds || []).length}
            </Badge>
          </div>
        ),
        size: 100,
      },
      {
        id: "rows",
        header: () => <div className="text-center">Rows</div>,
        accessorKey: "rowIds",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant="secondary">
              {(row.original.rowIds || []).length}
            </Badge>
          </div>
        ),
        size: 100,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "templateStatus",
        cell: ({ row }) => {
          const status = row.original.templateStatus || 'hold';
          const statusConfig = {
            open: { label: 'Open', variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600 text-white' },
            hold: { label: 'Hold', variant: 'secondary' as const, className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
            closed: { label: 'Closed', variant: 'outline' as const, className: 'bg-gray-500 hover:bg-gray-600 text-white' },
          };
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.hold;
          return (
            <Badge variant={config.variant} className={config.className}>
              {config.label}
            </Badge>
          );
        },
        size: 100,
      },
      {
        id: "updatedAt",
        header: "Last Updated",
        accessorKey: "updatedAt",
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.original.updatedAt).toLocaleDateString()}
          </span>
        ),
        size: 140,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                // TODO: View template details
                console.log('View template:', row.original.id);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={row.original.templateStatus !== 'open'}
            >
              <Eye className="w-3 h-3 mr-1" />
              {row.original.templateStatus === 'open' ? 'Start Review' : 'Not Available'}
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 150,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      {/* Toolbar with Search and Filters */}
      <GenericToolbar
        showSearch={true}
        searchPlaceholder="Search by template name or description..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        availableFilters={availableFilters}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
      />

      {/* Data Table */}
      <DataTable<PerformanceTemplate>
        ref={tableRef}
        columns={columns}
        data={templates}
        initialPageSize={10}
        emptyState={{
          title: "No templates found",
          description: "No performance templates are available for your department at this time."
        }}
      />
    </div>
  );
};
