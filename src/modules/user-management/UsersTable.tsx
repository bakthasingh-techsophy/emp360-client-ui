/**
 * Users Table Component
 * Displays users in a table with filtering, search, selection, and pagination.
 * Handles all table-related logic, data fetching via searchUserSnapshots, and user interactions.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  MoreHorizontal,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { DataTableRef } from "@/components/common/DataTable/types";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { useLayoutContext } from "@/contexts/LayoutContext";
import { ActiveFilter } from "@/components/GenericToolbar/types";
import { buildUniversalSearchRequest } from "@/components/GenericToolbar/searchBuilder";
import { UserStatus, UserDetailsSnapshot } from "./types/onboarding.types";
import { EmployeeViewModal } from "./components/EmployeeViewModal";

// Helper component for truncated text with tooltip
function TruncatedText({ text, maxLength = 30 }: { text: string; maxLength?: number }) {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? `${text.substring(0, maxLength)}...` : text;

  if (!isTruncated) return <span>{text}</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-muted-foreground">
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type Props = {
  searchQuery: string;
  activeFilters: ActiveFilter[];
  visibleColumns: string[];
  selectionMode: boolean;
  onSelectionChange: (ids: string[]) => void;
  refreshTrigger?: number;
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAccessSettings: boolean;
    hasAllPermissions: boolean;
    hasAnyAccess: boolean;
    roles: string[];
  };
};

export function UsersTable({
  searchQuery,
  activeFilters,
  visibleColumns,
  selectionMode,
  onSelectionChange,
  refreshTrigger = 0,
  permissions,
}: Props) {
  const navigate = useNavigate();
  const { refreshUserDetailsSnapshots, deleteUser, isLoading } =
    useUserManagement();
  const { selectedCompanyScope } = useLayoutContext();
  const tableRef = useRef<DataTableRef>(null);

  // Table state
  const [tableData, setTableData] = useState<UserDetailsSnapshot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsSnapshot | null>(
    null,
  );

  // Confirmation dialog state for single user deletion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserDetailsSnapshot | null>(
    null,
  );

  // Ref to track previous dependency values to detect actual changes
  const prevDepsRef = useRef<{
    activeFilters: ActiveFilter[];
    searchQuery: string;
    pageIndex: number;
    pageSize: number;
    refreshTrigger: number;
    selectedCompanyScope: string | null | undefined;
  } | null>(null);

  // Get status badge variant
  const getStatusVariant = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // Action handlers - defined before columns to allow memoization
  const handleViewUser = useCallback((user: UserDetailsSnapshot) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  }, []);

  const handleEditUser = useCallback(
    (user: UserDetailsSnapshot) => {
      navigate(`/user-management/employee-onboarding?mode=edit&id=${user.id}`);
    },
    [navigate],
  );

  const handleDeleteUser = useCallback((user: UserDetailsSnapshot) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  }, []);

  const fetchData = async () => {
    try {
      // Build universal search request from filters and search query
      const searchRequest = buildUniversalSearchRequest(
        activeFilters,
        searchQuery,
        [
          "firstName",
          "lastName",
          "email",
          "id",
          "designation",
          "phone",
          "department",
          "employeeType",
        ],
      );

      const result = await refreshUserDetailsSnapshots(
        searchRequest,
        pageIndex,
        pageSize,
      );

      if (result) {
        setTableData(result.content || []);
        setTotalItems(result.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching user snapshots:", error);
    }
  };

  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    const success = await deleteUser(userToDelete.id);
    if (success) {
      // Refresh table data
      fetchData();
    }
    setUserToDelete(null);
  }, [userToDelete]);

  // Fetch data from API when filters or search change
  useEffect(() => {
    // Check if dependencies have actually changed
    const depsChanged =
      !prevDepsRef.current ||
      JSON.stringify(prevDepsRef.current.activeFilters) !==
        JSON.stringify(activeFilters) ||
      prevDepsRef.current.searchQuery !== searchQuery ||
      prevDepsRef.current.pageIndex !== pageIndex ||
      prevDepsRef.current.pageSize !== pageSize ||
      prevDepsRef.current.refreshTrigger !== refreshTrigger ||
      prevDepsRef.current.selectedCompanyScope !== selectedCompanyScope;

    if (!depsChanged) return;

    // Update the ref with current values
    prevDepsRef.current = {
      activeFilters,
      searchQuery,
      pageIndex,
      pageSize,
      refreshTrigger,
      selectedCompanyScope,
    };

    fetchData();
  }, [
    activeFilters,
    searchQuery,
    pageIndex,
    pageSize,
    refreshTrigger,
    selectedCompanyScope,
  ]);

  // Define table columns - memoized to prevent unnecessary re-renders
  const columns: ColumnDef<UserDetailsSnapshot>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) =>
          selectionMode ? (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
              onClick={(e) => e.stopPropagation()}
            />
          ) : null,
        cell: ({ row }) =>
          selectionMode ? (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()}
            />
          ) : null,
        enableSorting: false,
        enableHiding: true,
        size: 50,
      },
      {
        id: "employeeId",
        accessorKey: "id",
        header: "Employee ID",
        cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
        size: 120,
      },
      {
        id: "name",
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => {
          const fullName = `${row.original.firstName} ${row.original.lastName}`;
          return (
            <div className="flex flex-col gap-1 min-w-0">
              <TruncatedText text={fullName} maxLength={25} />
              <span className="text-xs text-muted-foreground truncate">
                RM: {row.original.reportingTo || "Not Assigned"}
              </span>
            </div>
          );
        },
        size: 180,
      },
      {
        id: "contactInfo",
        accessorKey: "email",
        header: "Contact Info",
        cell: ({ row }) => {
          const user = row.original;
          const emailId = `email-${user.id}`;
          const phoneId = `phone-${user.id}`;
          return (
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm truncate">
                  <TruncatedText text={user.email} maxLength={25} />
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(user.email, emailId);
                        }}
                      >
                        {copiedField === emailId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy email</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground truncate">
                  <TruncatedText text={user.phone} maxLength={15} />
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(user.phone, phoneId);
                        }}
                      >
                        {copiedField === phoneId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy phone</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => {
          const designation = row.original.designation;
          const department = row.getValue("department") as string;
          return (
            <div className="flex flex-col gap-1 min-w-0">
              <TruncatedText text={department} maxLength={20} />
              <Badge variant="secondary" className="capitalize text-xs w-fit">
                {designation}
              </Badge>
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as UserStatus;
          return (
            <Badge variant={getStatusVariant(status)} className="capitalize">
              {status}
            </Badge>
          );
        },
        size: 100,
      },
      {
        accessorKey: "workLocation",
        header: "Location",
        cell: ({ row }) => {
          const location = row.getValue("workLocation") as string;
          return (
            <div className="text-sm min-w-0">
              <TruncatedText text={location} maxLength={20} />
            </div>
          );
        },
        size: 140,
      },
      {
        accessorKey: "joiningDate",
        header: "Joining Date",
        cell: ({ row }) => (
          <div className="text-sm whitespace-nowrap">
            {formatDate(row.getValue("joiningDate"))}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) => {
          const dob = row.getValue("dateOfBirth") as string | undefined;
          return (
            <div className="text-sm whitespace-nowrap">
              {dob ? formatDate(dob) : "-"}
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "reportingTo",
        header: "Reporting To",
        cell: ({ row }) => {
          const reportingTo = row.getValue("reportingTo") as string | undefined;
          return (
            <div className="text-sm min-w-0">
              {reportingTo ? (
                <TruncatedText text={reportingTo} maxLength={25} />
              ) : (
                "-"
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "panNumber",
        header: "PAN Number",
        cell: ({ row }) => {
          const panNumber = row.getValue("panNumber") as string | undefined;
          return <div className="text-sm font-mono whitespace-nowrap">{panNumber || "-"}</div>;
        },
        size: 130,
      },
      {
        accessorKey: "aadharNumber",
        header: "Aadhar Number",
        cell: ({ row }) => {
          const aadharNumber = row.getValue("aadharNumber") as string | undefined;
          return <div className="text-sm font-mono whitespace-nowrap">{aadharNumber || "-"}</div>;
        },
        size: 140,
      },
      {
        accessorKey: "emergencyContact",
        header: "Emergency Contact",
        cell: ({ row }) => {
          const contact = row.getValue("emergencyContact") as
            | { name: string; phone: string; relation: string }
            | undefined;
          return (
            <div className="text-sm min-w-0">
              {contact ? (
                <div className="min-w-0">
                  <div className="font-medium min-w-0">
                    <TruncatedText text={contact.name} maxLength={20} />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {contact.phone}
                  </div>
                </div>
              ) : (
                "-"
              )}
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "skills",
        header: "Skills",
        cell: ({ row }) => {
          const skills = row.getValue("skills") as string[] | undefined;
          return (
            <div className="text-sm min-w-0">
              {skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 2).map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs whitespace-nowrap">
                      <TruncatedText text={skill} maxLength={12} />
                    </Badge>
                  ))}
                  {skills.length > 2 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs cursor-help">
                            +{skills.length - 2}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="flex flex-wrap gap-2">
                            {skills.slice(2).map((skill, idx) => (
                              <span key={idx} className="block">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ) : (
                "-"
              )}
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <div className="text-sm whitespace-nowrap">
            {formatDate(row.getValue("createdAt"))}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => (
          <div className="text-sm whitespace-nowrap">
            {formatDate(row.getValue("updatedAt"))}
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-center gap-1">
              {/* View button - always shown if user has view permission */}
              {permissions.canView && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewUser(user);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Edit button - only shown if user has edit permission */}
              {permissions.canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditUser(user);
                  }}
                >
                  Edit
                </Button>
              )}

              {/* Delete dropdown - only shown if user has delete permission */}
              {permissions.canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">More actions</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        },
        size: 130,
      },
    ],
    [
      copyToClipboard,
      copiedField,
      handleViewUser,
      handleEditUser,
      handleDeleteUser,
      permissions,
      selectionMode,
    ],
  );

  // Filter columns based on visibleColumns prop
  const filteredColumns = useMemo(
    () =>
      columns.filter((column: any) => {
        // Always include select column - React Table requires it for selection to function
        if (column.id === "select") {
          return true;
        }
        // Always include action columns
        if (column.id === "actions") {
          return true;
        }
        // For other columns, check if id or accessorKey is in visibleColumns
        if (column.id) {
          return visibleColumns.includes(column.id);
        }
        if ("accessorKey" in column) {
          return visibleColumns.includes(column.accessorKey as string);
        }
        return true;
      }),
    [columns, visibleColumns],
  );

  // Memoize selection config to prevent React Table from rebuilding selection state on every render
  const selectionConfig = useMemo(
    () => ({
      enabled: selectionMode ?? false,
      onSelectionChange,
      getRowId: (user: UserDetailsSnapshot) => user.id,
      enableSelectAll: true,
    }),
    [selectionMode, onSelectionChange],
  );

  return (
    <>
      <DataTable
        ref={tableRef}
        data={tableData}
        columns={filteredColumns}
        loading={isLoading}
        pagination={{
          pageIndex,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          totalItems,
          onPageChange: setPageIndex,
          onPageSizeChange: setPageSize,
        }}
        paginationVariant="default"
        fixedPagination={true}
        selection={selectionConfig}
        emptyState={{
          title: "No users found",
          description:
            "No users match your current filters. Try adjusting your search or filters.",
        }}
      />

      {/* Employee View Modal */}
      <EmployeeViewModal
        employee={selectedUser}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
        }}
        permissions={permissions}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description={
          userToDelete ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {userToDelete.firstName} {userToDelete.lastName}
                </strong>{" "}
                ({userToDelete.id})?
              </p>
              <p className="text-destructive text-xs">
                This action cannot be undone. All user data will be permanently
                removed.
              </p>
            </div>
          ) : (
            "Are you sure you want to delete this user?"
          )
        }
        variant="destructive"
        confirmText="Delete"
        icon={<AlertTriangle className="h-10 w-10 text-destructive" />}
      />
    </>
  );
}

export default UsersTable;
