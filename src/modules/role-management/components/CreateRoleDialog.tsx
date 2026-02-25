/**
 * Create Role Dialog
 * Dialog for creating and editing roles with Keycloak sync option
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Edit } from "lucide-react";
import { RoleModelCarrier, RoleModel, Resource } from "../types";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResource: Resource | null;
  editingRole?: RoleModel | null;
  onSubmit: (carrier: RoleModelCarrier) => Promise<void>;
  onUpdate?: (id: string, data: any) => Promise<void>;
  isSubmitting?: boolean;
}

const transformIdInput = (value: string): string => {
  return value
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
};

const isValidId = (id: string): boolean => {
  if (!id.trim()) return false;
  return /^[a-zA-Z0-9-]+$/.test(id) && id.length <= 100;
};

const isValidName = (name: string): boolean => {
  if (!name.trim()) return false;
  return name.length >= 2 && name.length <= 100;
};

export function CreateRoleDialog({
  open,
  onOpenChange,
  selectedResource,
  editingRole = null,
  onSubmit,
  onUpdate,
  isSubmitting = false,
}: CreateRoleDialogProps) {
  const isEditing = !!editingRole;

  const [formData, setFormData] = useState({
    id: "",
    roleName: "",
    description: "",
    loadFromKeycloak: false,
  });

  useEffect(() => {
    if (isEditing && editingRole) {
      setFormData({
        id: editingRole.id,
        roleName: editingRole.roleName,
        description: editingRole.description || "",
        loadFromKeycloak: false,
      });
    } else {
      setFormData({
        id: "",
        roleName: "",
        description: "",
        loadFromKeycloak: false,
      });
    }
  }, [isEditing, editingRole, open]);

  const isValid = isValidId(formData.id) && isValidName(formData.roleName);

  const handleSubmit = async () => {
    if (!isValid || !selectedResource) return;

    if (isEditing && editingRole && onUpdate) {
      await onUpdate(editingRole.id, {
        roleName: formData.roleName.trim(),
        description: formData.description.trim() || undefined,
      });
    } else {
      await onSubmit({
        id: formData.id.trim(),
        resourceId: selectedResource.id,
        roleName: formData.roleName.trim(),
        description: formData.description.trim() || undefined,
        loadFromKeycloak: formData.loadFromKeycloak,
      });
    }

    setFormData({
      id: "",
      roleName: "",
      description: "",
      loadFromKeycloak: false,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({
      id: "",
      roleName: "",
      description: "",
      loadFromKeycloak: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Role" : "Add Role"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the role details."
              : `Add a new role to resource ${
                  selectedResource ? selectedResource.name : ""
                }`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Role ID */}
          <div className="space-y-2">
            <Label htmlFor="role-id">
              Role ID {isEditing ? "(readonly)" : "*"}
            </Label>
            <Input
              id="role-id"
              placeholder="e.g., admin-user"
              value={formData.id}
              onChange={(e) =>
                setFormData({ ...formData, id: transformIdInput(e.target.value) })
              }
              disabled={isEditing || isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "Role ID cannot be changed."
                : "Alphanumeric with hyphens (spaces auto-convert to hyphens)."}
            </p>
          </div>

          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name *</Label>
            <Input
              id="role-name"
              placeholder="e.g., Administrator, Viewer, Editor"
              value={formData.roleName}
              onChange={(e) =>
                setFormData({ ...formData, roleName: e.target.value })
              }
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Human-readable role name (2-100 characters).
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              placeholder="Describe what this role allows..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Optional description of the role.
            </p>
          </div>

          {/* Load from Keycloak Checkbox - Only for create mode */}
          {!isEditing && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="load-keycloak"
                  checked={formData.loadFromKeycloak}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      loadFromKeycloak: checked === true,
                    })
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="load-keycloak" className="font-normal cursor-pointer">
                  Load from Keycloak
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.loadFromKeycloak
                  ? "Sync existing Keycloak role with this resource"
                  : "Create new role in both database and Keycloak"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Adding..."}
              </>
            ) : isEditing ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Update Role
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
