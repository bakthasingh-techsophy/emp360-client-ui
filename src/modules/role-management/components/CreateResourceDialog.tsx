/**
 * Create Resource Dialog
 * Dialog for creating and editing resources with Keycloak sync option
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
import { Loader2, PackagePlus, Edit } from "lucide-react";
import { ResourceCarrier, Resource } from "../types";

interface CreateResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingResource?: Resource | null;
  onSubmit: (carrier: ResourceCarrier) => Promise<void>;
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

export function CreateResourceDialog({
  open,
  onOpenChange,
  editingResource = null,
  onSubmit,
  onUpdate,
  isSubmitting = false,
}: CreateResourceDialogProps) {
  const isEditing = !!editingResource;

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    loadFromKeycloak: false,
  });

  useEffect(() => {
    if (isEditing && editingResource) {
      setFormData({
        id: editingResource.id,
        name: editingResource.name,
        description: editingResource.description || "",
        loadFromKeycloak: false,
      });
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        loadFromKeycloak: false,
      });
    }
  }, [isEditing, editingResource, open]);

  const isValid = isValidId(formData.id) && isValidName(formData.name);

  const handleSubmit = async () => {
    if (!isValid) return;

    if (isEditing && editingResource && onUpdate) {
      await onUpdate(editingResource.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
    } else {
      await onSubmit({
        id: formData.id.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        loadFromKeycloak: formData.loadFromKeycloak,
      });
    }

    setFormData({
      id: "",
      name: "",
      description: "",
      loadFromKeycloak: false,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({
      id: "",
      name: "",
      description: "",
      loadFromKeycloak: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Resource" : "Create New Resource"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the resource details."
              : "A resource groups roles for a specific application or service."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resource ID */}
          <div className="space-y-2">
            <Label htmlFor="resource-id">
              Resource ID {isEditing ? "(readonly)" : "*"}
            </Label>
            <Input
              id="resource-id"
              placeholder="e.g., my-application"
              value={formData.id}
              onChange={(e) =>
                setFormData({ ...formData, id: transformIdInput(e.target.value) })
              }
              disabled={isEditing || isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "Resource ID cannot be changed."
                : "Alphanumeric with hyphens only (spaces auto-convert to hyphens)."}
            </p>
          </div>

          {/* Resource Name */}
          <div className="space-y-2">
            <Label htmlFor="resource-name">Resource Name *</Label>
            <Input
              id="resource-name"
              placeholder="e.g., My Application"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              placeholder="Describe what this resource is for..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
              rows={3}
              className="resize-none"
            />
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
                  ? "Sync existing Keycloak client with this resource"
                  : "Create new resource in both database and Keycloak"}
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
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Update Resource
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4 mr-2" />
                Create Resource
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
