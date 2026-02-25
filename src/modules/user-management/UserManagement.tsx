/**
 * User Management System
 * Manage users with filtering, search, and CRUD operations
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  UserX,
  Trash2,
  Gift,
  UserCheck,
  Settings,
  X,
  Loader2,
  FileUp,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { GenericToolbar } from "@/components/GenericToolbar/GenericToolbar";
import {
  AvailableFilter,
  ActiveFilter,
  BulkAction,
} from "@/components/GenericToolbar/types";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { useExcelSheet } from "@/contexts/ExcelSheetContext";
import { useCompany } from "@/contexts/CompanyContext";
import { UsersTable } from "./UsersTable";
import { useUserManagementPermissions } from "@/lib/permissions";
import { buildUniversalSearchRequest } from "@/components/GenericToolbar/searchBuilder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

import type {
  DeactivationCarrier,
  ReactivationCarrier,
  BulkCreditCarrier,
} from "@/services/userManagementService";
import { BulkImportDialog } from "./components/BulkImportDialog";
import { CreditDeductLeavesDialog } from "./components/CreditDeductLeavesDialog";
import { AddCreditsDialog } from "./components/AddCreditsDialog";

export function UserManagement() {
  const navigate = useNavigate();
  const { bulkDeleteUsers, bulkReactivateUsers, bulkDeactivateUsers, bulkAddCredits, creditLeaves, deductLeaves } =
    useUserManagement();
  const {
    exportUsersToExcel,
    isExporting,
    downloadImportTemplate,
    bulkImportUsers,
    isImporting,
  } = useExcelSheet();
  const { companies, refreshCompanies } = useCompany();

  // Load companies on mount so the company filter options are available
  useEffect(() => {
    refreshCompanies();
  }, []);
  const permissions = useUserManagementPermissions();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  ``;
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Credit/Deduct Leaves Dialog state
  const [creditDeductDialogOpen, setCreditDeductDialogOpen] = useState(false);
  const [creditDeductFormData, setCreditDeductFormData] = useState({
    leaveTypeId: "",
    category: "",
    count: "",
    actionType: "credit" as "credit" | "deduct",
  });
  const [creditDeductTargetIds, setCreditDeductTargetIds] = useState<string[]>(
    [],
  );
  const [creditDeductIsBulk, setCreditDeductIsBulk] = useState(false);
  const [isSubmittingCredit, setIsSubmittingCredit] = useState(false);

  // Deactivation Dialog state
  const [deactivationDialogOpen, setDeactivationDialogOpen] = useState(false);
  const [deactivationFormData, setDeactivationFormData] = useState({
    lastWorkingDay: new Date(),
    deactivationType: "" as "termination" | "resignation" | "",
    comments: "",
  });
  const [deactivationTargetIds, setDeactivationTargetIds] = useState<string[]>(
    [],
  );
  const [deactivationIsBulk, setDeactivationIsBulk] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Bulk Import Dialog state
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);

  // Reactivation Dialog state
  const [reactivationDialogOpen, setReactivationDialogOpen] = useState(false);
  const [reactivationFormData, setReactivationFormData] = useState({
    reactivationDate: new Date(),
    reactivationType: "" as ReactivationCarrier["reactivationType"] | "",
    comments: "",
  });
  const [reactivationTargetIds, setReactivationTargetIds] = useState<string[]>(
    [],
  );
  const [reactivationIsBulk, setReactivationIsBulk] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  // Add Credits Dialog state
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [addCreditsTargetIds, setAddCreditsTargetIds] = useState<string[]>([]);
  const [isSubmittingAddCredits, setIsSubmittingAddCredits] = useState(false);

  // Action handlers
  const handleSettings = useCallback(() => {
    navigate("/user-management/settings");
  }, [navigate]);

  // Credit/Deduct Leaves handlers
  const handleOpenCreditDeductDialog = useCallback(
    (employeeIds: string[], isBulk: boolean = false) => {
      setCreditDeductTargetIds(employeeIds);
      setCreditDeductIsBulk(isBulk);
      setCreditDeductFormData({
        leaveTypeId: "",
        category: "",
        count: "",
        actionType: "credit",
      });
      setCreditDeductDialogOpen(true);
    },
    [],
  );

  const handleSubmitCreditDeduct = useCallback(async (action: "credit" | "deduct") => {
    if (!creditDeductFormData.leaveTypeId || !creditDeductFormData.count) {
      alert("Please fill all required fields");
      return;
    }

    const carrier = {
      leaveTypes: [creditDeductFormData.leaveTypeId],
      employeeIds: creditDeductTargetIds,
      leaveAmount: parseFloat(creditDeductFormData.count),
    };

    setIsSubmittingCredit(true);
    const success =
      action === "credit"
        ? await creditLeaves(carrier)
        : await deductLeaves(carrier);
    setIsSubmittingCredit(false);

    if (success) {
      setCreditDeductDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [creditDeductFormData, creditDeductTargetIds, creditLeaves, deductLeaves]);

  // Add Credits handlers
  const handleOpenAddCreditsDialog = useCallback(
    (employeeIds: string[], _isBulk: boolean = false) => {
      setAddCreditsTargetIds(employeeIds);
      setAddCreditsDialogOpen(true);
    },
    [],
  );

  const handleSubmitAddCredits = useCallback(
    async (carrier: BulkCreditCarrier) => {
      setIsSubmittingAddCredits(true);
      try {
        const success = await bulkAddCredits(
          carrier.userIds,
          {
            creditType: carrier.creditType,
            fromDate: carrier.fromDate,
            toDate: carrier.toDate,
            reason: carrier.reason,
            createdAt: carrier.createdAt,
          },
        );

        if (success) {
          setAddCreditsDialogOpen(false);
          setAddCreditsTargetIds([]);
          setRefreshTrigger((prev) => prev + 1);
        }
      } finally {
        setIsSubmittingAddCredits(false);
      }
    },
    [bulkAddCredits],
  );

  // Deactivation handlers
  const handleOpenDeactivationDialog = useCallback(
    (employeeIds: string[], isBulk: boolean = false) => {
      setDeactivationTargetIds(employeeIds);
      setDeactivationIsBulk(isBulk);
      setDeactivationFormData({
        lastWorkingDay: new Date(),
        deactivationType: "",
        comments: "",
      });
      setDeactivationDialogOpen(true);
    },
    [],
  );

  const handleSubmitDeactivation = useCallback(async () => {
    if (!deactivationFormData.deactivationType) {
      alert("Please select deactivation type");
      return;
    }

    const payload: DeactivationCarrier = {
      employeeIds: deactivationTargetIds,
      lastWorkingDay: deactivationFormData.lastWorkingDay.toISOString(),
      deactivationType: deactivationFormData.deactivationType as
        | "termination"
        | "resignation",
      comments: deactivationFormData.comments,
      createdAt: new Date().toISOString(),
    };

    setIsDeactivating(true);
    const success = await bulkDeactivateUsers(payload);
    setIsDeactivating(false);
    if (success) {
      setDeactivationDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [deactivationFormData, deactivationTargetIds]);

  const handleRemoveDeactivationEmployeeId = useCallback(
    (idToRemove: string) => {
      setDeactivationTargetIds((prev) =>
        prev.filter((id) => id !== idToRemove),
      );
    },
    [],
  );

  // Reactivation handlers
  const handleOpenReactivationDialog = useCallback(
    (employeeIds: string[], isBulk: boolean = false) => {
      setReactivationTargetIds(employeeIds);
      setReactivationIsBulk(isBulk);
      setReactivationFormData({
        reactivationDate: new Date(),
        reactivationType: "",
        comments: "",
      });
      setReactivationDialogOpen(true);
    },
    [],
  );

  const handleSubmitReactivation = useCallback(async () => {
    if (!reactivationFormData.reactivationType) {
      alert("Please select a reactivation type");
      return;
    }

    const payload: ReactivationCarrier = {
      employeeIds: reactivationTargetIds,
      reactivationDate: reactivationFormData.reactivationDate.toISOString(),
      reactivationType:
        reactivationFormData.reactivationType as ReactivationCarrier["reactivationType"],
      comments: reactivationFormData.comments,
      createdAt: new Date().toISOString(),
    };

    setIsReactivating(true);
    const success = await bulkReactivateUsers(payload);
    setIsReactivating(false);
    if (success) {
      setReactivationDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [reactivationFormData, reactivationTargetIds, bulkReactivateUsers]);

  const handleRemoveReactivationEmployeeId = useCallback(
    (idToRemove: string) => {
      setReactivationTargetIds((prev) =>
        prev.filter((id) => id !== idToRemove),
      );
    },
    [],
  );

  // If user has no access at all, show restricted message
  if (!permissions.hasAnyAccess) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access User Management.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator for access.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // If user can't view employees but has other permissions, show limited access message
  if (!permissions.canView) {
    return (
      <PageLayout
        toolbar={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  User Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage system users, roles, and access control
                </p>
              </div>
              <div className="flex items-center gap-2">
                {permissions.canAccessSettings && (
                  <Button
                    onClick={handleSettings}
                    variant="outline"
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                )}
                {permissions.canCreate && (
                  <Button
                    onClick={() =>
                      navigate("/user-management/employee-onboarding")
                    }
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Onboard New Employee
                  </Button>
                )}
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-2xl font-bold">Limited Access</h2>
            <p className="text-muted-foreground">
              You don't have permission to view the employee list.
            </p>
            <p className="text-sm text-muted-foreground">
              {permissions.canCreate ? (
                <>
                  However, you can create new employees. Click the "Onboard New
                  Employee" button above to get started.
                </>
              ) : permissions.canAccessSettings ? (
                <>
                  However, you can access settings. Click the "Settings" button
                  above to manage employee types, designations, and more.
                </>
              ) : (
                "Please contact your administrator to request additional access."
              )}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Column visibility state - minimal columns visible by default
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "employeeId",
    "name",
    "contactInfo",
    "department",
    "status",
  ]);

  // Filter configuration – memoized so options update when companies load
  const filterConfig: AvailableFilter[] = useMemo(() => [
    {
      id: "employeeId",
      label: "Employee ID",
      type: "text",
      placeholder: "Enter employee ID...",
    },
    {
      id: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Enter first name...",
    },
    {
      id: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Enter last name...",
    },
    {
      id: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
    {
      id: "companyId",
      label: "Company",
      type: "multiselect",
      options: companies.map((company: any) => ({
        value: company.id,
        label: company.name,
      })),
      defaultOperator: "in",
      operators: [{ value: "in", label: "In" }],
    },
    {
      id: "department",
      label: "Department",
      type: "multiselect",
      options: [
        { value: "Engineering", label: "Engineering" },
        { value: "Human Resources", label: "Human Resources" },
        { value: "Finance", label: "Finance" },
        { value: "Marketing", label: "Marketing" },
        { value: "Sales", label: "Sales" },
        { value: "Operations", label: "Operations" },
        { value: "IT", label: "IT" },
        { value: "Legal", label: "Legal" },
        { value: "Administration", label: "Administration" },
      ],
    },
    {
      id: "location",
      label: "Location",
      type: "multiselect",
      options: [
        { value: "bangalore", label: "Bangalore" },
        { value: "hyderabad", label: "Hyderabad" },
        { value: "pune", label: "Pune" },
        { value: "mumbai", label: "Mumbai" },
        { value: "delhi", label: "Delhi" },
        { value: "remote", label: "Remote" },
      ],
    },
    {
      id: "reportingTo",
      label: "Reporting To",
      type: "text",
      placeholder: "Enter manager name...",
    },
    {
      id: "joiningDate",
      label: "Joining Date",
      type: "date",
    },
    {
      id: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
    },
    {
      id: "panNumber",
      label: "PAN Number",
      type: "text",
      placeholder: "Enter PAN number...",
    },
    {
      id: "aadharNumber",
      label: "Aadhar Number",
      type: "text",
      placeholder: "Enter Aadhar number...",
    },
    {
      id: "skills",
      label: "Skills",
      type: "text",
      placeholder: "Enter skill name...",
    },
    {
      id: "createdAt",
      label: "Created At",
      type: "date",
    },
    {
      id: "updatedAt",
      label: "Updated At",
      type: "date",
    },
  ], [companies]);

  // Define available columns for column visibility toggle
  const allColumns = [
    { id: "employeeId", label: "Employee ID" },
    { id: "name", label: "Name" },
    { id: "contactInfo", label: "Contact Info" },
    { id: "department", label: "Department" },
    { id: "status", label: "Status" },
    { id: "location", label: "Location" },
    { id: "reportingTo", label: "Reporting To" },
    { id: "joiningDate", label: "Joining Date" },
    { id: "dateOfBirth", label: "Date of Birth" },
    { id: "panNumber", label: "PAN Number" },
    { id: "aadharNumber", label: "Aadhar Number" },
    { id: "skills", label: "Skills" },
    { id: "createdAt", label: "Created At" },
    { id: "updatedAt", label: "Updated At" },
  ];

  // Action handlers
  const handleAddUser = useCallback(() => {
    navigate("/user-management/employee-onboarding");
  }, [navigate]);

  const handleExportAll = useCallback(
    async (_sendEmail: boolean, _email?: string) => {
      if (isExporting) return;
      // Export all users — pass empty search request (no filters)
      await exportUsersToExcel({});
    },
    [isExporting],
  );

  const handleExportResults = useCallback(
    async (_sendEmail: boolean, _email?: string) => {
      if (isExporting) return;
      // Export only the currently filtered results
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
      await exportUsersToExcel(searchRequest);
    },
    [isExporting, activeFilters, searchQuery],
  );

  const handleImportUsers = useCallback(() => {
    setBulkImportDialogOpen(true);
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    await downloadImportTemplate();
  }, [downloadImportTemplate]);

  const handleToggleSelection = useCallback(() => {
    setSelectionMode((prev) => {
      const newMode = !prev;
      // Clear selection when turning OFF selection mode
      if (prev) {
        setSelectedIds([]);
      }
      return newMode;
    });
  }, []);

  const handleSelectionChange = useCallback((selectedUserIds: string[]) => {
    setSelectedIds(selectedUserIds);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  const handleVisibleColumnsChange = useCallback((columns: string[]) => {
    // Always include actions - it should not be hideable
    const finalColumns = [...columns];
    if (!finalColumns.includes("actions")) {
      finalColumns.push("actions");
    }
    setVisibleColumns(finalColumns);
  }, []);

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;

    setConfirmDialog({
      open: true,
      title: "Delete Selected Users",
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedIds.length}</strong> selected user(s)?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. All user data will be permanently
            removed.
          </p>
        </div>
      ),
      variant: "destructive",
      onConfirm: async () => {
        // Build UniversalSearchRequest with idsList
        const searchRequest = {
          idsList: selectedIds,
        };
        const success = await bulkDeleteUsers(searchRequest);
        if (success) {
          handleClearSelection();
          setRefreshTrigger((prev) => prev + 1);
        }
      },
    });
  }, [selectedIds, bulkDeleteUsers, handleClearSelection]);

  const handleBulkCreditLeaves = useCallback(() => {
    if (selectedIds.length > 0) {
      handleOpenCreditDeductDialog(selectedIds, true);
    }
  }, [selectedIds, handleOpenCreditDeductDialog]);

  const handleBulkAddCredits = useCallback(() => {
    if (selectedIds.length > 0) {
      handleOpenAddCreditsDialog(selectedIds, true);
    }
  }, [selectedIds, handleOpenAddCreditsDialog]);

  const handleBulkDeactivate = useCallback(() => {
    if (selectedIds.length === 0) return;
    handleOpenDeactivationDialog(selectedIds, true);
  }, [selectedIds, handleOpenDeactivationDialog]);

  const handleBulkEnable = useCallback(() => {
    if (selectedIds.length === 0) return;
    handleOpenReactivationDialog(selectedIds, true);
  }, [selectedIds, handleOpenReactivationDialog]);

  // Memoize activeFilters to prevent unnecessary re-renders of UsersTable
  const memoizedActiveFilters = useMemo(() => activeFilters, [activeFilters]);

  // Define bulk actions based on permissions
  const bulkActions: BulkAction[] = useMemo(() => {
    const actions: BulkAction[] = [];

    // Delete action - only if user has delete permission
    if (permissions.canDelete) {
      actions.push({
        id: "delete",
        label: "Delete Selected",
        icon: <Trash2 className="h-4 w-4" />,
        type: "button",
        variant: "destructive",
        onClick: handleBulkDelete,
      });
    }

    // Deactivate action - only if user has deactivate permission
    if (permissions.canDeactivate) {
      actions.push({
        id: "deactivate",
        label: "Deactivate",
        icon: <UserX className="h-4 w-4" />,
        type: "button",
        variant: "outline",
        onClick: handleBulkDeactivate,
      });
    }

    // Reactivate action - only if user has enable permission
    if (permissions.canEnable) {
      actions.push({
        id: "reactivate",
        label: "Reactivate",
        icon: <UserCheck className="h-4 w-4" />,
        type: "button",
        variant: "outline",
        onClick: handleBulkEnable,
      });
    }

    // Credit/Deduct leaves - only if user has edit permission
    if (permissions.canEdit) {
      actions.push({
        id: "credit-leaves",
        label: "Credit/Deduct Leaves",
        icon: <Gift className="h-4 w-4" />,
        type: "button",
        variant: "outline",
        onClick: handleBulkCreditLeaves,
      });

      // Add Credits action
      actions.push({
        id: "add-credits",
        label: "Add Credits",
        icon: <Gift className="h-4 w-4" />,
        type: "button",
        variant: "outline",
        onClick: handleBulkAddCredits,
      });
    }

    return actions;
  }, [
    permissions,
    handleBulkDelete,
    handleBulkDeactivate,
    handleBulkEnable,
    handleBulkCreditLeaves,
    handleBulkAddCredits,
  ]);

  return (
    <>
      <PageLayout
        toolbar={
          <div className="space-y-4">
            {/* Page Header with Action Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  User Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage system users, roles, and access control
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Download import template — only visible with bulk-import permission */}
                {permissions.canBulkImport && (
                  <Button
                    onClick={handleDownloadTemplate}
                    variant="outline"
                    className="gap-2"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Template</span>
                  </Button>
                )}

                {/* Bulk import users — only visible with bulk-import permission */}
                {permissions.canBulkImport && (
                  <Button
                    onClick={handleImportUsers}
                    variant="outline"
                    className="gap-2"
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileUp className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Import Users</span>
                  </Button>
                )}

                {permissions.canAccessSettings && (
                  <Button
                    onClick={handleSettings}
                    variant="outline"
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                )}
                {permissions.canCreate && (
                  <Button onClick={handleAddUser} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Onboard New Employee
                  </Button>
                )}
              </div>
            </div>

            {/* Generic Toolbar */}
            <GenericToolbar
              showSearch
              searchPlaceholder="Search by name, email, employee ID, department..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              showConfigureView
              allColumns={allColumns}
              visibleColumns={visibleColumns}
              onVisibleColumnsChange={handleVisibleColumnsChange}
              showFilters
              availableFilters={filterConfig}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
              showExport={!selectionMode && permissions.canBulkExport}
              onExportAll={handleExportAll}
              onExportResults={handleExportResults}
              isExporting={isExporting}
              showBulkActions
              bulkActions={bulkActions}
              selectedCount={selectedIds.length}
              onToggleSelection={handleToggleSelection}
              selectionMode={selectionMode}
            />
          </div>
        }
      >
        {/* Users Table Component */}
        <UsersTable
          searchQuery={searchQuery}
          activeFilters={memoizedActiveFilters}
          visibleColumns={visibleColumns}
          selectionMode={selectionMode}
          onSelectionChange={handleSelectionChange}
          refreshTrigger={refreshTrigger}
          permissions={permissions}
          onCreditDeductLeaves={handleOpenCreditDeductDialog}
          onAddCredits={handleOpenAddCreditsDialog}
          onDeactivate={handleOpenDeactivationDialog}
          onReactivate={handleOpenReactivationDialog}
        />
      </PageLayout>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={
          confirmDialog.variant === "destructive" ? "Delete" : "Confirm"
        }
      />

      {/* Credit/Deduct Leaves Dialog */}
      <CreditDeductLeavesDialog
        open={creditDeductDialogOpen}
        onOpenChange={setCreditDeductDialogOpen}
        formData={creditDeductFormData}
        onFormDataChange={setCreditDeductFormData}
        targetIds={creditDeductTargetIds}
        isBulk={creditDeductIsBulk}
        onSubmit={handleSubmitCreditDeduct}
        isSubmitting={isSubmittingCredit}
      />

      {/* Deactivation Dialog */}
      <DeactivationDialog
        open={deactivationDialogOpen}
        onOpenChange={setDeactivationDialogOpen}
        formData={deactivationFormData}
        onFormDataChange={setDeactivationFormData}
        targetIds={deactivationTargetIds}
        isBulk={deactivationIsBulk}
        onSubmit={handleSubmitDeactivation}
        onRemoveEmployeeId={handleRemoveDeactivationEmployeeId}
        isSubmitting={isDeactivating}
      />

      {/* Reactivation Dialog */}
      <ReactivationDialog
        open={reactivationDialogOpen}
        onOpenChange={setReactivationDialogOpen}
        formData={reactivationFormData}
        onFormDataChange={setReactivationFormData}
        targetIds={reactivationTargetIds}
        isBulk={reactivationIsBulk}
        onSubmit={handleSubmitReactivation}
        onRemoveEmployeeId={handleRemoveReactivationEmployeeId}
        isSubmitting={isReactivating}
      />

      {/* Add Credits Dialog */}
      <AddCreditsDialog
        open={addCreditsDialogOpen}
        onOpenChange={setAddCreditsDialogOpen}
        userIds={addCreditsTargetIds}
        onSubmit={handleSubmitAddCredits}
        isSubmitting={isSubmittingAddCredits}
      />

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={bulkImportDialogOpen}
        onOpenChange={setBulkImportDialogOpen}
        onSubmit={bulkImportUsers}
        isSubmitting={isImporting}
      />
    </>
  );
}
// Deactivation Dialog Component
interface DeactivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    lastWorkingDay: Date;
    deactivationType: "termination" | "resignation" | "";
    comments: string;
  };
  onFormDataChange: (data: any) => void;
  targetIds: string[];
  isBulk: boolean;
  onSubmit: () => void;
  onRemoveEmployeeId?: (id: string) => void;
  isSubmitting?: boolean;
}

function DeactivationDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  targetIds,
  isBulk,
  onSubmit,
  onRemoveEmployeeId,
  isSubmitting = false,
}: DeactivationDialogProps) {
  const isValid = formData.deactivationType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 gap-0 flex flex-col"
        hideClose
      >
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Deactivate User(s)</DialogTitle>
              <DialogDescription className="mt-1">
                {isBulk
                  ? `Deactivate ${targetIds.length} selected employee(s)`
                  : "Deactivate the selected employee"}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full shrink-0 -mt-2"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-6 ${isSubmitting ? "pointer-events-none opacity-60" : ""}`}
        >
          <div className="space-y-4">
            {/* Employee IDs - Bulk Mode with removable chips */}
            {isBulk && (
              <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
                <Label className="text-xs font-semibold">
                  Selected Employees
                </Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {targetIds.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm"
                    >
                      <span className="font-medium">{id}</span>
                      <button
                        onClick={() => onRemoveEmployeeId?.(id)}
                        className="ml-0.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                        title={`Remove ${id}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {targetIds.length === 0 && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    No employees selected
                  </p>
                )}
              </div>
            )}

            {/* Last Working Day */}
            <div className="space-y-2">
              <Label htmlFor="last-working-day">Last Working Day *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {format(formData.lastWorkingDay, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.lastWorkingDay}
                    onSelect={(date) =>
                      onFormDataChange({
                        ...formData,
                        lastWorkingDay: date || new Date(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                You can select past dates to backdate deactivations
              </p>
            </div>

            {/* Deactivation Type */}
            <div className="space-y-2">
              <Label htmlFor="deactivation-type">Deactivation Type *</Label>
              <Select
                value={formData.deactivationType}
                onValueChange={(value) =>
                  onFormDataChange({
                    ...formData,
                    deactivationType: value as
                      | "termination"
                      | "resignation"
                      | "",
                  })
                }
              >
                <SelectTrigger id="deactivation-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="termination">Termination</SelectItem>
                  <SelectItem value="resignation">Resignation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any additional comments..."
                value={formData.comments}
                onChange={(e) =>
                  onFormDataChange({ ...formData, comments: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!isValid || targetIds.length === 0 || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reactivation Dialog Component
interface ReactivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    reactivationDate: Date;
    reactivationType: ReactivationCarrier["reactivationType"] | "";
    comments: string;
  };
  onFormDataChange: (data: any) => void;
  targetIds: string[];
  isBulk: boolean;
  onSubmit: () => void;
  onRemoveEmployeeId?: (id: string) => void;
  isSubmitting?: boolean;
}

function ReactivationDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  targetIds,
  isBulk,
  onSubmit,
  onRemoveEmployeeId,
  isSubmitting = false,
}: ReactivationDialogProps) {
  const isValid = formData.reactivationType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 gap-0 flex flex-col"
        hideClose
      >
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Reactivate User(s)</DialogTitle>
              <DialogDescription className="mt-1">
                {isBulk
                  ? `Reactivate ${targetIds.length} selected employee(s)`
                  : "Reactivate the selected employee"}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full shrink-0 -mt-2"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-6 ${isSubmitting ? "pointer-events-none opacity-60" : ""}`}
        >
          <div className="space-y-4">
            {/* Employee IDs - Bulk Mode with removable chips */}
            {isBulk && (
              <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
                <Label className="text-xs font-semibold">
                  Selected Employees
                </Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {targetIds.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm"
                    >
                      <span className="font-medium">{id}</span>
                      <button
                        onClick={() => onRemoveEmployeeId?.(id)}
                        className="ml-0.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                        title={`Remove ${id}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {targetIds.length === 0 && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    No employees selected
                  </p>
                )}
              </div>
            )}

            {/* Reactivation Date */}
            <div className="space-y-2">
              <Label htmlFor="reactivation-date">Reactivation Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {format(formData.reactivationDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.reactivationDate}
                    onSelect={(date) =>
                      onFormDataChange({
                        ...formData,
                        reactivationDate: date || new Date(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                The date from which the employee is considered active again
              </p>
            </div>

            {/* Reactivation Type */}
            <div className="space-y-2">
              <Label htmlFor="reactivation-type">Reactivation Type *</Label>
              <Select
                value={formData.reactivationType}
                onValueChange={(value) =>
                  onFormDataChange({
                    ...formData,
                    reactivationType:
                      value as ReactivationCarrier["reactivationType"],
                  })
                }
              >
                <SelectTrigger id="reactivation-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rehire">
                    Rehire — returning after leaving voluntarily
                  </SelectItem>
                  <SelectItem value="reinstatement">
                    Reinstatement — restored after wrongful termination
                  </SelectItem>
                  <SelectItem value="contract_renewal">
                    Contract Renewal — previous contract extended
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="reactivation-comments">Comments (Optional)</Label>
              <Textarea
                id="reactivation-comments"
                placeholder="Add any additional context for this reactivation..."
                value={formData.comments}
                onChange={(e) =>
                  onFormDataChange({ ...formData, comments: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={!isValid || targetIds.length === 0 || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reactivating...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Reactivate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
