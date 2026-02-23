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
import { Textarea } from "@/components/ui/textarea";
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
} from "@/modules/role-management/types";
import UniversalSearchRequest from "@/types/search";

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
  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED);
  
  // ── Edit mode states ──
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // ── Form states ──
  const [newClientId, setNewClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientDescription, setNewClientDescription] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDisplayName, setNewRoleDisplayName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
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

  // ──────────────────────────────────────────────────────
  // Validation & Transformation Utilities
  // ──────────────────────────────────────────────────────

  /**
   * Transform ID input: slug style
   * - Only alphanumeric and hyphens
   * - Spaces convert to hyphens
   * - Removes all other special characters
   * - Converts to lowercase
   * Examples: "My App" → "my-app", "Hello_World 123!" → "hello-world-123"
   */
  const transformIdInput = (value: string): string => {
    return value
      .replace(/\s+/g, "-")           // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-]/g, "") // Remove all non-alphanumeric and non-hyphen chars
      .toLowerCase();                  // Convert to lowercase
  };

  /**
   * Validate ID format
   */
  const isValidId = (id: string): boolean => {
    if (!id.trim()) return false;
    return /^[a-zA-Z0-9-]+$/.test(id) && id.length <= 100;
  };

  /**
   * Validate name format (allows spaces and special chars except certain ones)
   */
  const isValidName = (name: string): boolean => {
    if (!name.trim()) return false;
    return name.length >= 2 && name.length <= 100;
  };

  // ── Handlers ──

  // ──────────────────────────────────────────────────────
  // Placeholder Handler Functions (to be implemented)
  // ──────────────────────────────────────────────────────

  const handleCreateClient = async () => {
    if (!isValidId(newClientId) || !isValidName(newClientName)) return;
    setIsMutating(true);
    await createResourceViaRoleManagement({
      id: newClientId.trim(),
      name: newClientName.trim(),
      description: newClientDescription.trim() || undefined,
    });
    setNewClientId("");
    setNewClientName("");
    setNewClientDescription("");
    setCreateClientDialogOpen(false);
    await loadResources();
    setIsMutating(false);
  };

  const handleCreateRole = async () => {
    if (!selectedResource || !isValidId(newRoleName) || !isValidName(newRoleDisplayName)) return;
    setIsMutating(true);
    await createRoleViaRoleManagement(selectedResource.id, {
      id: newRoleName.trim(),
      resourceId: selectedResource.id,
      roleName: newRoleDisplayName.trim(),
      description: newRoleDescription.trim() || undefined,
    });
    setNewRoleName("");
    setNewRoleDisplayName("");
    setNewRoleDescription("");
    setCreateRoleDialogOpen(false);
    await loadRoles(selectedResource.id);
    setIsMutating(false);
  };

  const handleAssignRoles = async () => {
    if (!selectedResource) return;
    setIsMutating(true);
    setAssignRoleDialogOpen(false);
    await loadRoles(selectedResource.id);
    setIsMutating(false);
  };

  const handleEditResource = () => {
    if (!selectedResource) return;
    setNewClientId(selectedResource.id);
    setNewClientName(selectedResource.name);
    setNewClientDescription(selectedResource.description || "");
    setIsEditingResource(true);
    setCreateClientDialogOpen(true);
  };

  const handleEditRole = (role: RoleModel) => {
    setNewRoleName(role.id);
    setNewRoleDisplayName(role.roleName);
    setNewRoleDescription(role.description || "");
    setEditingRoleId(role.id);
    setIsEditingRole(true);
    setCreateRoleDialogOpen(true);
  };

  const handleUpdateResource = async () => {
    if (!selectedResource || !newClientName.trim()) return;
    setIsMutating(true);
    await updateResourceViaRoleManagement(selectedResource.id, {
      name: newClientName.trim(),
      description: newClientDescription.trim() || undefined,
    });
    setNewClientId("");
    setNewClientName("");
    setNewClientDescription("");
    setIsEditingResource(false);
    setCreateClientDialogOpen(false);
    await loadResources();
    setIsMutating(false);
  };

  const handleUpdateRole = async () => {
    if (!selectedResource || !newRoleDisplayName.trim() || !editingRoleId) return;
    setIsMutating(true);
    await updateRoleViaRoleManagement(editingRoleId, {
      roleName: newRoleDisplayName.trim(),
      description: newRoleDescription.trim() || undefined,
    });
    setNewRoleName("");
    setNewRoleDisplayName("");
    setNewRoleDescription("");
    setEditingRoleId(null);
    setIsEditingRole(false);
    setCreateRoleDialogOpen(false);
    await loadRoles(selectedResource.id);
    setIsMutating(false);
  };

  const handleDeleteResource = () => {
    if (!selectedResource) return;
    setConfirm({
      open: true,
      title: "Delete Resource",
      description: `Are you sure you want to delete "${selectedResource.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setIsMutating(true);
        await deleteResourceViaRoleManagement(selectedResource.id);
        setConfirm(CONFIRM_CLOSED);
        await loadResources();
        setIsMutating(false);
      },
    });
  };

  const handleDeleteRole = (role: RoleModel) => {
    setConfirm({
      open: true,
      title: "Delete Role",
      description: `Are you sure you want to delete "${role.roleName}"? This action cannot be undone.`,
      onConfirm: async () => {
        setIsMutating(true);
        await deleteRoleViaRoleManagement(role.id);
        setConfirm(CONFIRM_CLOSED);
        if (selectedResource) await loadRoles(selectedResource.id);
        setIsMutating(false);
      },
    });
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
            <Button onClick={() => setCreateClientDialogOpen(true)}>
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
              <Button size="lg" onClick={() => setCreateClientDialogOpen(true)}>
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
                          onClick={() => setCreateRoleDialogOpen(true)}
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
                            onClick={() => setCreateRoleDialogOpen(true)}
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

      {/* Create/Edit Resource */}
      <Dialog
        open={createClientDialogOpen}
        onOpenChange={(open) => {
          setCreateClientDialogOpen(open);
          if (!open) {
            setIsEditingResource(false);
            setNewClientId("");
            setNewClientName("");
            setNewClientDescription("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingResource ? "Edit Resource" : "Create New Resource"}
            </DialogTitle>
            <DialogDescription>
              {isEditingResource
                ? "Update the resource details."
                : "A resource groups roles for a specific application or service."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="client-id">Resource ID {isEditingResource ? "(readonly)" : "*"}</Label>
              <Input
                id="client-id"
                placeholder="e.g., my_application"
                value={newClientId}
                onChange={(e) => setNewClientId(transformIdInput(e.target.value))}
                disabled={isEditingResource}
              />
              <p className="text-xs text-muted-foreground">
                {isEditingResource
                  ? "Resource ID cannot be changed."
                  : "Alphanumeric with hyphens only (spaces auto-convert to hyphens)."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-name">Resource Name *</Label>
              <Input
                id="client-name"
                placeholder="e.g., My Application"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-description">Description</Label>
              <Textarea
                id="client-description"
                placeholder="Describe what this resource is for..."
                value={newClientDescription}
                onChange={(e) => setNewClientDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateClientDialogOpen(false);
                setIsEditingResource(false);
                setNewClientId("");
                setNewClientName("");
                setNewClientDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditingResource ? handleUpdateResource : handleCreateClient}
              disabled={!newClientId.trim() || !newClientName.trim() || isMutating}
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isEditingResource ? (
                <Edit className="h-4 w-4 mr-2" />
              ) : (
                <PackagePlus className="h-4 w-4 mr-2" />
              )}
              {isMutating
                ? isEditingResource
                  ? "Updating…"
                  : "Creating…"
                : isEditingResource
                  ? "Update Resource"
                  : "Create Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Role */}
      <Dialog
        open={createRoleDialogOpen}
        onOpenChange={(open) => {
          setCreateRoleDialogOpen(open);
          if (!open) {
            setIsEditingRole(false);
            setEditingRoleId(null);
            setNewRoleName("");
            setNewRoleDisplayName("");
            setNewRoleDescription("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingRole ? "Edit Role" : "Add Role"}
            </DialogTitle>
            <DialogDescription>
              {isEditingRole
                ? "Update the role details."
                : `Add a new role to resource ${
                    selectedResource ? selectedResource.name : ""
                  }`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-id">Role ID {isEditingRole ? "(readonly)" : "*"}</Label>
              <Input
                id="role-id"
                placeholder="e.g., admin_user"
                value={newRoleName}
                onChange={(e) => setNewRoleName(transformIdInput(e.target.value))}
                disabled={isEditingRole}
              />
              <p className="text-xs text-muted-foreground">
                {isEditingRole
                  ? "Role ID cannot be changed."
                  : "Alphanumeric with hyphens (spaces auto-convert to hyphens)."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-display-name">Role Name *</Label>
              <Input
                id="role-display-name"
                placeholder="e.g., Administrator, Viewer, Editor"
                value={newRoleDisplayName}
                onChange={(e) => setNewRoleDisplayName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Human-readable role name (2-100 characters).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe what this role allows..."
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Optional description of the role.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateRoleDialogOpen(false);
                setIsEditingRole(false);
                setEditingRoleId(null);
                setNewRoleName("");
                setNewRoleDisplayName("");
                setNewRoleDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditingRole ? handleUpdateRole : handleCreateRole}
              disabled={!newRoleName.trim() || !newRoleDisplayName.trim() || isMutating}
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isEditingRole ? (
                <Edit className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isMutating
                ? isEditingRole
                  ? "Updating…"
                  : "Adding…"
                : isEditingRole
                  ? "Update Role"
                  : "Add Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
