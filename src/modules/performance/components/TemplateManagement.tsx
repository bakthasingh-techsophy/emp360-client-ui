/**
 * Template Management Component - HR Only
 * View, edit, and delete performance templates using DataTable
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { DataTableRef } from "@/components/common/DataTable/types";
import { ColumnDef } from "@tanstack/react-table";
import { GenericToolbar } from "@/components/GenericToolbar/GenericToolbar";
import { PerformanceTemplate } from "../types";
import {
  AvailableFilter,
  ActiveFilter,
} from "@/components/GenericToolbar/types";
import { usePerformance } from "@/contexts/PerformanceContext";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { useAuth } from "@/contexts/AuthContext";
import { Department } from "@/modules/user-management/types/settings.types";
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle, FileText } from "lucide-react";

interface TemplateManagementProps {
  onEdit: (template: PerformanceTemplate) => void;
  onDelete: (templateId: string) => void;
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({
  onEdit,
  onDelete,
}) => {
  const { refreshPerformanceTemplates, updatePerformanceTemplate, isLoading } = usePerformance();
  const { refreshDepartments } = useUserManagement();
  const { hasResourceRole } = useAuth();
  
  // Check if user is a performance review admin
  const isAdmin = hasResourceRole('performance-reviews', 'pra');
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [templates, setTemplates] = useState<PerformanceTemplate[]>([]);
  const tableRef = useRef<DataTableRef>(null);

  // ============= LOAD DEPARTMENTS AND TEMPLATES ON MOUNT =============
  // Load departments first, then templates
  const loadData = async () => {
    // Load departments first
    const deptResult = await refreshDepartments({}, 0, 100);
    if (deptResult?.content) {
      setDepartments(deptResult.content);
    }
    
    // Load templates
    const templateResult = await refreshPerformanceTemplates({}, 0, 100);
    if (templateResult?.content) {
      setTemplates(templateResult.content);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  // ============= STATUS UPDATE HANDLERS =============
  const handleOpenForReview = async (template: PerformanceTemplate) => {
    try {
      const updated = await updatePerformanceTemplate(template.id, { 
        templateStatus: 'open' 
      });
      if (updated) {
        // Refresh the templates list
        await loadData();
      }
    } catch (error) {
      console.error('Error opening template for review:', error);
    }
  };

  const handleCloseTemplate = async (templateId: string) => {
    try {
      const updated = await updatePerformanceTemplate(templateId, { 
        templateStatus: 'closed' 
      });
      if (updated) {
        // Refresh the templates list
        await loadData();
      }
    } catch (error) {
      console.error('Error closing template:', error);
    }
  };

  // Create a map of departmentId -> department name
  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((dept) => {
      map.set(dept.id, dept.department);
    });
    return map;
  }, [departments]);

  // Define available filters for templates
  const availableFilters = useMemo(() => {
    const filters: AvailableFilter[] = [
      {
        id: "department",
        label: "Department",
        type: "select",
        operators: [{ label: "Is", value: "eq" }],
        options: departments.map((dept) => ({
          label: dept.department,
          value: dept.id,
        })),
      },
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
  }, [departments]);

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<PerformanceTemplate>[]>(
    () => {
      const baseColumns: ColumnDef<PerformanceTemplate>[] = [
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
          size: 250,
        },
      ];

      // Admin-only columns: department, columns count, rows count
      if (isAdmin) {
        baseColumns.push(
          {
            id: "department",
            header: "Department",
            accessorKey: "departmentId",
            cell: ({ row }) => {
              const deptId = row.original.departmentId;
              const deptName = departmentMap.get(deptId);
              console.log(
                "Rendering department for template:",
                deptId,
                "->",
                deptName,
                "map size:",
                departmentMap.size,
              );
              return <span className="text-sm">{deptName || deptId || "N/A"}</span>;
            },
            size: 150,
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
        );
      }

      // Status column (visible to all)
      baseColumns.push(
        {
          id: "status",
          header: "Status",
          accessorKey: "templateStatus",
          cell: ({ row }) => {
            const status = row.original.templateStatus || 'hold';
            const statusConfig = {
              open: { label: 'Open', variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600' },
              hold: { label: 'Hold', variant: 'secondary' as const, className: 'bg-yellow-500 hover:bg-yellow-600' },
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
      );

      // Actions column - different for admin vs regular user
      baseColumns.push({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          if (isAdmin) {
            // Admin view: Open for Review, Fill Form, Dropdown (Edit, Close, Delete)
            return (
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => handleOpenForReview(row.original)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={row.original.templateStatus === 'open'}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {row.original.templateStatus === 'open' ? 'Opened' : 'Open for Review'}
                </Button>

                <Button
                  onClick={() => {
                    // TODO: Navigate to fill form
                    console.log('Fill form:', row.original.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Fill Form
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit(row.original)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to close this template? It will no longer be available for reviews.",
                          )
                        ) {
                          handleCloseTemplate(row.original.id);
                        }
                      }}
                      disabled={row.original.templateStatus === 'closed'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Close Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this template? This action cannot be undone.",
                          )
                        ) {
                          onDelete(row.original.id);
                        }
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          } else {
            // Regular user view: Only Fill Form button
            return (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    // TODO: Navigate to fill form
                    console.log('Fill form:', row.original.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Fill Form
                </Button>
              </div>
            );
          }
        },
        enableSorting: false,
        enableHiding: false,
        size: isAdmin ? 300 : 150,
      });

      return baseColumns;
    },
    [onEdit, onDelete, departments, handleOpenForReview, handleCloseTemplate, isAdmin, departmentMap],
  );

  // Handle pagination changes
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  const totalPages = Math.ceil(templates.length / pageSize);

  return (
    <div className="space-y-4">
      {/* Debug Info */}
      {false && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p>
            Departments: {departments.length} | Templates: {templates.length} |
            Map Size: {departmentMap.size}
          </p>
        </div>
      )}

      {/* Toolbar with Search and Filters */}
      <GenericToolbar
        showSearch={true}
        searchPlaceholder="Search by template name, description, or department..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilters={true}
        availableFilters={availableFilters}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
      />

      {/* DataTable */}
      <DataTable<PerformanceTemplate>
        ref={tableRef}
        columns={columns}
        data={templates}
        loading={isLoading}
        pagination={{
          pageIndex,
          pageSize,
          totalPages,
          totalItems: templates.length,
          canNextPage: pageIndex < totalPages - 1,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        paginationVariant="default"
        fixedPagination={true}
        serverSidePagination={true}
        emptyState={{
          title: "No templates found",
          description:
            templates.length === 0 && templates.length === 0
              ? "No templates created yet."
              : "No templates match your search or filters.",
        }}
      />
    </div>
  );
};
