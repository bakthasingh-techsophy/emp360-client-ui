/**
 * Role Management Page
 * Comprehensive role and permission management system
 * - Manage Keycloak clients (shown as "resources") and roles
 * - Create, update, delete roles
 * - Assign/revoke roles to users
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Plus,
  Trash2,
  MoreVertical,
  UserPlus,
  Search,
  RefreshCw,
  Layers,
  PackagePlus,
  ArrowRight,
  Loader2,
  Edit,
} from "lucide-react";
import { useRoleManagement } from "@/contexts/RoleManagementContext";
import {
  Resource,
  RoleModel,
  DeleteResourceCarrier,
  DeleteRoleCarrier,
} from "@/modules/role-management/types";
import UniversalSearchRequest from "@/types/search";
import { CreateResourceDialog } from "./components/CreateResourceDialog";
import { CreateRoleDialog } from "./components/CreateRoleDialog";
import { DeleteResourceDialog } from "./components/DeleteResourceDialog";
import { DeleteRoleDialog } from "./components/DeleteRoleDialog";

// ── Confirmation dialog state shape ──
interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

const CONFIRM_CLOSED: ConfirmState = {
  open: false,
  title: "",
  description: "",
  onConfirm: () => {},
};

export const RoleManagement: React.FC = () => {
  const {
    refreshResources,
    refreshRoles,
    createResourceViaRoleManagement,
    createRoleViaRoleManagement,
    updateResourceViaRoleManagement,
    updateRoleViaRoleManagement,
    deleteResourceViaRoleManagement,
    deleteRoleViaRoleManagement,
    isLoading,
  } = useRoleManagement();

  // ── Data state ──
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedResourceRoles, setSelectedResourceRoles] = useState<RoleModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Loading states ──
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // ── Dialog / sheet states ──
  const [createResourceDialogOpen, setCreateResourceDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [deleteResourceDialogOpen, setDeleteResourceDialogOpen] = useState(false);
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED);
  
  // ── Edit mode states ──
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingRole, setEditingRole] = useState<RoleModel | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleModel | null>(null);

  // ── Form states (for assign roles dialog) ──
  const [assignUserId, setAssignUserId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Derived
  const hasResources = resources.length > 0;

  // ──────────────────────────────────────────────────────
  // Load Resources and Roles Functions (Outside useEffect)
  // ──────────────────────────────────────────────────────

  /**
   * Load all resources from the API
   * Uses refreshResources with empty search to get all resources
   */
  const loadResources = useCallback(async () => {
    const emptySearch: UniversalSearchRequest = {};
    const result = await refreshResources(emptySearch, 0, 1000);
    if (result?.content?.length) {
      setResources(result.content);
      const firstResource = result.content[0];
      setSelectedResource(firstResource);
      await loadRoles(firstResource.id);
    } else {
      setResources([]);
      setSelectedResource(null);
      setSelectedResourceRoles([]);
    }
    setInitialLoading(false);
  }, [refreshResources]);

  /**
   * Load roles for a specific resource
   */
  const loadRoles = useCallback(
    async (resourceId: string) => {
      const emptySearch: UniversalSearchRequest = {};
      const result = await refreshRoles(emptySearch, 0, 1000);
      if (result?.content) {
        setSelectedResourceRoles(
          result.content.filter((role) => role.resourceId === resourceId)
        );
      } else {
        setSelectedResourceRoles([]);
      }
    },
    [refreshRoles]
  );

  // ──────────────────────────────────────────────────────
  // End Load Functions
  // ──────────────────────────────────────────────────────

  // ── Load on component mount ──
  useEffect(() => {
    loadResources();
  }, []);

  // ── Load roles when selected resource changes ──
  useEffect(() => {
    if (selectedResource) {
      loadRoles(selectedResource.id);
    }
  }, [selectedResource]);

  // ── Filtered roles ──
  const filteredRoles = useMemo(() => {
    if (!searchQuery) return selectedResourceRoles;
    return selectedResourceRoles.filter((r) =>
      r.roleName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedResourceRoles, searchQuery]);



  // ── Handlers ──

  // Create Resource Handler
  const handleCreateResource = async (carrier: any) => {
    setIsMutating(true);
    await createResourceViaRoleManagement(carrier);
    setCreateResourceDialogOpen(false);
    setEditingResource(null);
    await loadResources();
    setIsMutating(false);
  };

  // Update Resource Handler
  const handleUpdateResource = async (id: string, data: any) => {
    setIsMutating(true);
    await updateResourceViaRoleManagement(id, data);
    setCreateResourceDialogOpen(false);
    setEditingResource(null);
    await loadResources();
    setIsMutating(false);
  };

  // Open edit resource dialog
  const handleEditResource = () => {
    if (!selectedResource) return;
    setEditingResource(selectedResource);
    setCreateResourceDialogOpen(true);
  };

  // Create Role Handler
  const handleCreateRole = async (carrier: any) => {
    setIsMutating(true);
    await createRoleViaRoleManagement(selectedResource?.id || "", carrier);
    setCreateRoleDialogOpen(false);
    setEditingRole(null);
    if (selectedResource) {
      await loadRoles(selectedResource.id);
    }
    setIsMutating(false);
  };

  // Update Role Handler
  const handleUpdateRole = async (id: string, data: any) => {
    setIsMutating(true);
    await updateRoleViaRoleManagement(id, data);
    setCreateRoleDialogOpen(false);
    setEditingRole(null);
    if (selectedResource) {
      await loadRoles(selectedResource.id);
    }
    setIsMutating(false);
  };

  // Open edit role dialog
  const handleEditRole = (role: RoleModel) => {
    setEditingRole(role);
    setCreateRoleDialogOpen(true);
  };

  // Delete Resource Handler
  const handleDeleteResource = () => {
    if (!selectedResource) return;
    setDeletingResource(selectedResource);
    setDeleteResourceDialogOpen(true);
  };

  // Delete Resource Submit Handler
  const handleSubmitDeleteResource = async (carrier: DeleteResourceCarrier) => {
    setIsMutating(true);
    await deleteResourceViaRoleManagement(carrier);
    setDeleteResourceDialogOpen(false);
    setDeletingResource(null);
    await loadResources();
    setIsMutating(false);
  };

  // Delete Role Handler
  const handleDeleteRole = (role: RoleModel) => {
    setDeletingRole(role);
    setDeleteRoleDialogOpen(true);
  };

  // Delete Role Submit Handler
  const handleSubmitDeleteRole = async (carrier: DeleteRoleCarrier) => {
    setIsMutating(true);
    await deleteRoleViaRoleManagement(carrier);
    setDeleteRoleDialogOpen(false);
    setDeletingRole(null);
    if (selectedResource) {
      await loadRoles(selectedResource.id);
    }
    setIsMutating(false);
  };

  const handleAssignRoles = async () => {
    if (!selectedResource) return;
    setIsMutating(true);
    setAssignRoleDialogOpen(false);
    await loadRoles(selectedResource.id);
    setIsMutating(false);
  };

  // ════════════════════════════════════════════════════════
  return (
    <PageLayout>
      <div className="space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              Role Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage resources, roles, and user permissions
              {hasResources && (
                <span className="ml-2">
                  · {resources.length} Resource{resources.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          {/* Always-visible: refresh + create */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={loadResources}
              disabled={isLoading}
              title="Refresh resources and roles"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button onClick={() => {
              setEditingResource(null);
              setCreateResourceDialogOpen(true);
            }}>
              <PackagePlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Resource</span>
            </Button>
          </div>
        </div>

        {/* ── Initial page skeleton (first load only) ── */}
        {initialLoading && (
          <div className="space-y-5">
            {/* Resource selector skeleton */}
            <Skeleton className="h-10 w-full sm:w-72" />
            {/* Info card skeleton */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-8 w-32 shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Roles card skeleton */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Empty state ── */}
        {!initialLoading && !isLoading && !hasResources && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-6 text-center px-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                <Layers className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h2 className="text-xl font-semibold">No resources found</h2>
                <p className="text-muted-foreground text-sm">
                  Resources represent application clients that group roles
                  together. Create your first resource to start managing roles
                  and permissions.
                </p>
              </div>
              <Button size="lg" onClick={() => {
                setEditingResource(null);
                setCreateResourceDialogOpen(true);
              }}>
                <PackagePlus className="h-5 w-5 mr-2" />
                Create your first Resource
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Main UI (resources exist) ── */}
        {!initialLoading && hasResources && (
          <>
            {/* Resource selector row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Select
                value={selectedResource?.id ?? ""}
                onValueChange={(value) => {
                  const resource = resources.find((r) => r.id === value);
                  setSelectedResource(resource ?? null);
                }}
              >
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      <span className="font-medium">{resource.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* No resource selected nudge */}
            {!selectedResource && (
              <Card className="border-dashed">
                <CardContent className="py-10">
                  <div className="text-center space-y-2">
                    <Layers className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="font-medium">Select a resource</p>
                    <p className="text-sm text-muted-foreground">
                      Choose a resource from the dropdown above to view and
                      manage its roles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedResource && (
              <>
                {/* Resource Info Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          <Layers className="h-5 w-5 text-primary shrink-0" />
                          <span className="truncate">
                            {selectedResource.name}
                          </span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {selectedResource.description ||
                            "No description available"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 self-start"
                          disabled={isLoading || isMutating}
                          onClick={handleEditResource}
                        >
                          <Edit className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="shrink-0 self-start"
                          disabled={isLoading || isMutating}
                          onClick={handleDeleteResource}
                        >
                          <Trash2 className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Delete Resource</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Resource ID
                        </p>
                        <p className="font-medium text-sm break-all">
                          {selectedResource.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Total Roles
                        </p>
                        <p className="font-medium text-sm">
                          {selectedResourceRoles.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Created
                        </p>
                        <p className="font-medium text-sm">
                          {new Date(selectedResource.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Roles Card — actions live here */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>
                          Roles defined under{" "}
                          <span className="font-semibold">
                            {selectedResource ? selectedResource.name : ""}
                          </span>
                        </CardDescription>
                      </div>
                      {/* Role actions — live inside the Roles card */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search roles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 w-full sm:w-48"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignRoleDialogOpen(true)}
                        >
                          <UserPlus className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Assign to User</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingRole(null);
                            setCreateRoleDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Add Role</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Skeleton rows while refreshing roles */}
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : filteredRoles.length === 0 ? (
                      <div className="text-center py-12 space-y-3">
                        <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? "No roles found matching your search"
                            : "No roles defined for this resource yet"}
                        </p>
                        {!searchQuery && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditingRole(null);
                              setCreateRoleDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add first role
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredRoles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <h4 className="font-medium truncate">{role.roleName}</h4>
                                <p className="text-xs text-muted-foreground truncate">{role.id}</p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs hidden sm:inline-flex"
                              >
                                {selectedResource.id}
                              </Badge>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0"
                                  disabled={isLoading || isMutating}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditRole(role)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteRole(role)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Role
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>

      {/* ════════════ DIALOGS ════════════ */}

      {/* Confirmation (delete) */}
      <AlertDialog
        open={confirm.open}
        onOpenChange={(open) => !open && setConfirm(CONFIRM_CLOSED)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirm.onConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Resource Dialog Component */}
      <CreateResourceDialog
        open={createResourceDialogOpen}
        onOpenChange={setCreateResourceDialogOpen}
        editingResource={editingResource}
        onSubmit={handleCreateResource}
        onUpdate={handleUpdateResource}
        isSubmitting={isMutating}
      />

      {/* Create/Edit Role Dialog Component */}
      <CreateRoleDialog
        open={createRoleDialogOpen}
        onOpenChange={setCreateRoleDialogOpen}
        selectedResource={selectedResource}
        editingRole={editingRole}
        onSubmit={handleCreateRole}
        onUpdate={handleUpdateRole}
        isSubmitting={isMutating}
      />

      {/* Delete Resource Dialog Component */}
      <DeleteResourceDialog
        open={deleteResourceDialogOpen}
        onOpenChange={setDeleteResourceDialogOpen}
        resource={deletingResource}
        onSubmit={handleSubmitDeleteResource}
        isSubmitting={isMutating}
      />

      {/* Delete Role Dialog Component */}
      <DeleteRoleDialog
        open={deleteRoleDialogOpen}
        onOpenChange={setDeleteRoleDialogOpen}
        role={deletingRole}
        onSubmit={handleSubmitDeleteRole}
        isSubmitting={isMutating}
      />

      {/* Assign Roles to User */}
      <Dialog
        open={assignRoleDialogOpen}
        onOpenChange={setAssignRoleDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Roles to User</DialogTitle>
            <DialogDescription>
              Select roles from{" "}
              <span className="font-semibold">
                {selectedResource ? selectedResource.name : ""}
              </span>{" "}
              to assign to a user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-id">User ID *</Label>
              <Input
                id="user-id"
                placeholder="Enter Keycloak user UUID"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Roles *</Label>
              <div className="border rounded-lg p-3 max-h-56 overflow-y-auto space-y-1">
                {selectedResourceRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer select-none"
                    onClick={() =>
                      setSelectedRoles((prev) =>
                        prev.includes(role.id)
                          ? prev.filter((r) => r !== role.id)
                          : [...prev, role.id]
                      )
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => {}}
                      className="accent-primary"
                    />
                    <p className="font-medium text-sm">{role.roleName}</p>
                  </div>
                ))}
              </div>
              {selectedRoles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedRoles.length} role
                  {selectedRoles.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAssignRoleDialogOpen(false);
                setAssignUserId("");
                setSelectedRoles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRoles}
              disabled={
                !assignUserId.trim() ||
                selectedRoles.length === 0 ||
                isMutating
              }
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isMutating ? "Assigning…" : "Assign Roles"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};
