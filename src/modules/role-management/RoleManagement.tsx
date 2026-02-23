/**
 * Role Management Page
 * Comprehensive role and permission management system
 * - Manage Keycloak clients and roles
 * - Create, update, delete roles
 * - Assign/revoke roles to users
 */

import React, { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Building2,
} from "lucide-react";
import { useRoleManagement } from "@/contexts/RoleManagementContext";
import { KeycloakClient, CreateRoleRequest, DeleteRoleRequest } from "@/modules/role-management/types";

export const RoleManagement: React.FC = () => {
  const {
    getClientsAndRoles,
    createClient,
    deleteClient,
    createRole,
    deleteRole,
    assignRoles,
    isLoading,
  } = useRoleManagement();

  // State
  const [clients, setClients] = useState<KeycloakClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<KeycloakClient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [realm, setRealm] = useState<string>("");
  const [clientCount, setClientCount] = useState<number>(0);

  // Dialog states
  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);

  // Form states
  const [newClientId, setNewClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientDescription, setNewClientDescription] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Load data on mount
  useEffect(() => {
    loadClientsAndRoles();
  }, []);

  const loadClientsAndRoles = async () => {
    const result = await getClientsAndRoles();
    if (result) {
      setClients(result.clients);
      setRealm(result.realm);
      setClientCount(result.clientCount);
      if (result.clients.length > 0 && !selectedClient) {
        setSelectedClient(result.clients[0]);
      }
    }
  };

  // Filtered roles based on search
  const filteredRoles = useMemo(() => {
    if (!selectedClient) return [];
    
    if (!searchQuery) return selectedClient.roles;
    
    return selectedClient.roles.filter((roleName) =>
      roleName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedClient, searchQuery]);

  // Handle create client
  const handleCreateClient = async () => {
    if (!newClientId.trim() || !newClientName.trim()) return;

    const success = await createClient({
      clientId: newClientId.trim(),
      name: newClientName.trim(),
      description: newClientDescription.trim() || undefined,
    });

    if (success) {
      setCreateClientDialogOpen(false);
      setNewClientId("");
      setNewClientName("");
      setNewClientDescription("");
      await loadClientsAndRoles();
    }
  };

  // Handle delete client
  const handleDeleteClient = async (clientId: string) => {
    if (confirm(`Are you sure you want to delete the client "${clientId}"? This will also delete all associated roles.`)) {
      const success = await deleteClient({ clientId });

      if (success) {
        if (selectedClient?.clientId === clientId) {
          setSelectedClient(null);
        }
        await loadClientsAndRoles();
      }
    }
  };

  // Handle create role
  const handleCreateRole = async () => {
    if (!selectedClient || !newRoleName.trim()) return;

    const request: CreateRoleRequest = {
      clientId: selectedClient.clientId,
      roleName: newRoleName.trim(),
      description: newRoleDescription.trim() || undefined,
    };

    const success = await createRole(request);
    if (success) {
      setCreateRoleDialogOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      await loadClientsAndRoles();
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleName: string) => {
    if (!selectedClient) return;

    if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      const request: DeleteRoleRequest = {
        clientId: selectedClient.clientId,
        roleName: roleName,
      };

      const success = await deleteRole(request);

      if (success) {
        await loadClientsAndRoles();
      }
    }
  };

  // Handle assign roles
  const handleAssignRoles = async () => {
    if (!selectedClient || !assignUserId.trim() || selectedRoles.length === 0) return;

    const result = await assignRoles({
      userId: assignUserId.trim(),
      clientId: selectedClient.clientId,
      roleNames: selectedRoles,
    });

    if (result) {
      setAssignRoleDialogOpen(false);
      setAssignUserId("");
      setSelectedRoles([]);
      // Optionally show the assigned roles
      console.log("Assigned roles:", result.assignedRoles);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Manage clients, roles, and user permissions
              {realm && (
                <span className="ml-2">
                  • Realm: <span className="font-semibold">{realm}</span>
                </span>
              )}
              {clientCount > 0 && (
                <span className="ml-2">
                  • {clientCount} Client{clientCount !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Select
              value={selectedClient?.id || ""}
              onValueChange={(value) => {
                const client = clients.find((c) => c.id === value);
                setSelectedClient(client || null);
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => {
                  const displayName = client.name && !client.name.startsWith('${client_') 
                    ? `${client.clientId} (${client.name})` 
                    : client.clientId;
                  const roleCount = client.roles.length;
                  
                  return (
                    <SelectItem key={client.id} value={client.id}>
                      {displayName} - {roleCount} role{roleCount !== 1 ? 's' : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={loadClientsAndRoles}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setCreateClientDialogOpen(true)}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Create Client
            </Button>
            <Button
              variant="outline"
              onClick={() => setAssignRoleDialogOpen(true)}
              disabled={!selectedClient}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Roles to User
            </Button>
            <Button
              onClick={() => setCreateRoleDialogOpen(true)}
              disabled={!selectedClient}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Client Info Card */}
        {selectedClient && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedClient.clientId}</CardTitle>
                  <CardDescription>
                    {selectedClient.description || "No description available"}
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClient(selectedClient.clientId)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Client
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client ID</p>
                  <p className="font-medium">{selectedClient.clientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Roles</p>
                  <p className="font-medium">{selectedClient.roles.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedClient.enabled ? "default" : "secondary"}>
                    {selectedClient.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles Section */}
        {selectedClient && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Roles</CardTitle>
                  <CardDescription>
                    Manage roles for {selectedClient.clientId}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRoles.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No roles found matching your search"
                      : "No roles available for this client"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRoles.map((roleName, index) => (
                    <div
                      key={`${roleName}-${index}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{roleName}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {selectedClient.clientId}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteRole(roleName)}
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
        )}

        {/* No client selected state */}
        {!selectedClient && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a client to manage roles
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Role Dialog */}
      {/* Create Client Dialog */}
      <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              Create a new Keycloak client for managing roles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-id">Client ID *</Label>
              <Input
                id="client-id"
                placeholder="e.g., my-application"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
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
                placeholder="Describe what this client is for..."
                value={newClientDescription}
                onChange={(e) => setNewClientDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateClientDialogOpen(false);
                setNewClientId("");
                setNewClientName("");
                setNewClientDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={!newClientId.trim() || !newClientName.trim() || isLoading}
            >
              Create Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role to {selectedClient?.clientId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g., admin, viewer, editor"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe what this role is for..."
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateRoleDialogOpen(false);
                setNewRoleName("");
                setNewRoleDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={!newRoleName.trim() || isLoading}
            >
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Roles Dialog */}
      <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Roles to User</DialogTitle>
            <DialogDescription>
              Select roles from {selectedClient?.clientId} to assign to a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-id">User ID *</Label>
              <Input
                id="user-id"
                placeholder="Enter user ID (UUID)"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Roles *</Label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {selectedClient?.roles.map((roleName, index) => (
                  <div
                    key={`${roleName}-${index}`}
                    className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => {
                      setSelectedRoles((prev) =>
                        prev.includes(roleName)
                          ? prev.filter((r) => r !== roleName)
                          : [...prev, roleName]
                      );
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(roleName)}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{roleName}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedRoles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedRoles.length} role(s) selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
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
              disabled={!assignUserId.trim() || selectedRoles.length === 0 || isLoading}
            >
              Assign Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};
