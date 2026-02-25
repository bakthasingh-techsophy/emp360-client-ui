import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Plus, ArrowLeft, Check, X } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { UsersSelector } from "@/components/context-aware/UsersSelector";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { useRoleManagement } from "@/contexts/RoleManagementContext";
import { Resource, RoleModel } from "@/modules/role-management/types";
import { UserRoles } from "@/modules/user-management/types/user.types";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RolesEditingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userIdFromUrl = searchParams.get("id");
  
  const { getUserRoles, assignRolesToUsers } = useUserManagement();
  const { refreshResources, refreshRoles } = useRoleManagement();
  const { toast } = useToast();

  // ── States ──
  const [selectedUserId, setSelectedUserId] = useState<string>(userIdFromUrl || "");
  const [userRoles, setUserRoles] = useState<UserRoles | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allRoles, setAllRoles] = useState<RoleModel[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [isLoadingUser, setIsLoadingUser] = useState(!!userIdFromUrl);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  // ── Load all resources and roles on mount ──
  const loadResourcesAndRoles = useCallback(async () => {
    try {
      setIsLoadingResources(true);
      const emptySearch = {};

      // Load resources
      const resourcesResult = await refreshResources(emptySearch, 0, 1000);
      if (resourcesResult?.content?.length) {
        setResources(resourcesResult.content);
        // Set first resource as selected
        setSelectedResourceId(resourcesResult.content[0].id);
      }

      // Load all roles
      const rolesResult = await refreshRoles(emptySearch, 0, 1000);
      if (rolesResult?.content) {
        setAllRoles(rolesResult.content);
      }
    } catch (error) {
      console.error("Error loading resources and roles:", error);
      toast({
        title: "Error",
        description: "Failed to load resources and roles",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResources(false);
    }
  }, [refreshResources, refreshRoles, toast]);

  // ── Load user roles when user is selected ──
  const handleUserSelect = useCallback(
    async (selectedValue: string | string[]) => {
      // Handle both single and multiple mode - we only care about single user
      const userId = typeof selectedValue === "string" ? selectedValue : selectedValue[0];

      setSelectedUserId(userId || "");
      if (!userId) {
        setUserRoles(null);
        return;
      }

      try {
        setIsLoadingUser(true);
        const roles = await getUserRoles(userId);
        setUserRoles(roles);
      } catch (error) {
        console.error("Error loading user roles:", error);
        toast({
          title: "Error",
          description: "Failed to load user roles",
          variant: "destructive",
        });
        setUserRoles(null);
      } finally {
        setIsLoadingUser(false);
      }
    },
    [getUserRoles, toast]
  );

  // ── Load resources and roles on mount ──
  useEffect(() => {
    loadResourcesAndRoles();
  }, []);

  // ── Load user roles when URL param is provided ──
  useEffect(() => {
    if (userIdFromUrl && !userRoles) {
      handleUserSelect(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  // ── Get roles for selected resource ──
  const selectedResourceRoles = useMemo(() => {
    if (!selectedResourceId) return [];
    return allRoles.filter((role) => role.resourceId === selectedResourceId);
  }, [selectedResourceId, allRoles]);

  // ── Get roles already assigned to user in selected resource ──
  const assignedRoleIds = useMemo(() => {
    if (!userRoles || !selectedResourceId) return [];
    const rolesData = userRoles.rolesData as Record<string, any> | undefined;
    const resourceRoles = rolesData?.[selectedResourceId];
    return resourceRoles?.roleIds || [];
  }, [userRoles, selectedResourceId]);

  // ── Check if role is assigned ──
  const isRoleAssigned = useCallback(
    (roleId: string) => {
      return assignedRoleIds.includes(roleId);
    },
    [assignedRoleIds]
  );

  // ── Handle checkbox toggle ──
  const handleRoleToggle = useCallback((roleId: string) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  }, []);

  // ── Select all roles ──
  const handleSelectAll = useCallback(() => {
    const allRoleIds = selectedResourceRoles.map((role) => role.id);
    setSelectedRoles(new Set(allRoleIds));
  }, [selectedResourceRoles]);

  // ── Unselect all roles ──
  const handleUnselectAll = useCallback(() => {
    setSelectedRoles(new Set());
  }, []);

  // ── Handle bulk role assignment ──
  const handleAssignSelected = useCallback(
    async () => {
      if (!selectedUserId || !selectedResourceId || selectedRoles.size === 0) {
        toast({
          title: "Error",
          description: "Please select at least one role to assign",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsAssigningRole(true);
        const roleIds = Array.from(selectedRoles);
        const success = await assignRolesToUsers({
          userIds: [selectedUserId],
          resourceId: selectedResourceId,
          roleIds,
        });

        if (success) {
          // Refresh user roles
          const updated = await getUserRoles(selectedUserId);
          setUserRoles(updated);
          // Clear selection
          setSelectedRoles(new Set());
          toast({
            title: "Success",
            description: `Successfully assigned ${roleIds.length} role(s)`,
          });
        }
      } catch (error) {
        console.error("Error assigning roles:", error);
        toast({
          title: "Error",
          description: "Failed to assign roles",
          variant: "destructive",
        });
      } finally {
        setIsAssigningRole(false);
      }
    },
    [selectedUserId, selectedResourceId, selectedRoles, assignRolesToUsers, getUserRoles, toast]
  );

  // ── Handle resource change - clear selections ──
  const handleResourceChange = useCallback((resourceId: string) => {
    setSelectedResourceId(resourceId);
    setSelectedRoles(new Set());
  }, []);
  // ── Get selected resource name ──
  const selectedResource = useMemo(
    () => resources.find((r) => r.id === selectedResourceId),
    [resources, selectedResourceId]
  );

  return (
    <PageLayout>
      <div className="space-y-8 p-6">
        {/* Header with Back Button */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/user-management")}
              className="h-8 w-8 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">User Role Management</h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-11">
            Select a user to view and manage their roles across different resources.
          </p>
        </div>

        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
            <CardDescription>Choose a user to manage their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersSelector
              value={selectedUserId}
              onChange={handleUserSelect}
              placeholder="Search and select a user..."
              type="single"
              returnField="id"
            />
          </CardContent>
        </Card>

        {/* Main Content - Only show when user is selected */}
        {selectedUserId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - User's Current Roles */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Current Roles</CardTitle>
                  <CardDescription>Roles assigned to this user</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUser ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : userRoles && Object.keys(userRoles.rolesData || {}).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(userRoles.rolesData || {}).map(([resourceId, resourceRoles]: [string, any]) => {
                        const resource = resources.find((r) => r.id === resourceId);
                        return (
                          <div key={resourceId} className="p-3 border rounded-lg bg-muted/30">
                            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              {resource?.name || resourceId}
                            </p>
                            <div className="flex flex-wrap gap-2 ml-4">
                              {resourceRoles.roleIds?.length > 0 ? (
                                resourceRoles.roleIds.map((roleId: string) => (
                                  <Badge key={roleId} variant="default" className="text-xs">
                                    <Check className="h-3 w-3 mr-1" />
                                    {roleId}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No roles assigned</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <X className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">No roles assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Role Assignment */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Roles</CardTitle>
                  <CardDescription>Select a resource and assign roles to this user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resource Selector */}
                  {isLoadingResources ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Resource</label>
                      <Select 
                        value={selectedResourceId} 
                        onValueChange={handleResourceChange}
                        disabled={selectedRoles.size > 0}
                      >
                        <SelectTrigger className={selectedRoles.size > 0 ? "opacity-50 cursor-not-allowed" : ""}>
                          <SelectValue placeholder="Choose a resource" />
                        </SelectTrigger>
                        <SelectContent>
                          {resources.map((resource) => (
                            <SelectItem key={resource.id} value={resource.id}>
                              {resource.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedRoles.size > 0 && (
                        <p className="text-xs text-amber-600">
                          Resource is locked while roles are selected. Clear selection to change resource.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Available Roles for Selected Resource */}
                  {selectedResourceId && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium">
                            Available Roles in {selectedResource?.name}
                          </h3>
                          {selectedResourceRoles.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Selected: {selectedRoles.size} / {selectedResourceRoles.length}
                            </div>
                          )}
                        </div>

                        {isLoadingResources ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-10 w-full" />
                            ))}
                          </div>
                        ) : selectedResourceRoles.length > 0 ? (
                          <>
                            <div className="space-y-3">
                              {selectedResourceRoles.map((role) => {
                                const isSelected = selectedRoles.has(role.id);
                                const isAlreadyAssigned = isRoleAssigned(role.id);
                                return (
                                  <div
                                    key={role.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                      isSelected
                                        ? "border-primary bg-primary/5"
                                        : isAlreadyAssigned
                                        ? "border-muted bg-muted/30"
                                        : "border-muted hover:border-primary/50 hover:bg-accent/30"
                                    } ${isAlreadyAssigned ? "opacity-60" : ""}`}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => handleRoleToggle(role.id)}
                                      disabled={isAlreadyAssigned}
                                      className="mt-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium">{role.id}</p>
                                      {role.roleName && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {role.roleName}
                                        </p>
                                      )}
                                    </div>
                                    {isAlreadyAssigned && (
                                      <Badge variant="secondary" className="text-xs">
                                        Assigned
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Selection Controls */}
                            <div className="flex gap-2 mt-4 pt-4 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                disabled={selectedResourceRoles.every((r) => selectedRoles.has(r.id) || isRoleAssigned(r.id))}
                                className="text-xs"
                              >
                                Select All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUnselectAll}
                                disabled={selectedRoles.size === 0}
                                className="text-xs"
                              >
                                Unselect
                              </Button>
                            </div>

                            {/* Assign Button */}
                            <Button
                              onClick={handleAssignSelected}
                              disabled={selectedRoles.size === 0 || isAssigningRole}
                              className="w-full mt-4 gap-2"
                            >
                              {isAssigningRole ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  Assign Selected ({selectedRoles.size})
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <div className="py-8 text-center">
                            <X className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground">
                              No roles available for this resource
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State - No user selected */}
        {!selectedUserId && (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Select a user above to begin managing their roles.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
