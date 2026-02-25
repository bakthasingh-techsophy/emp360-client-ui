/**
 * Delete Resource Dialog
 * Dialog for confirming resource deletion with Keycloak sync option
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { DeleteResourceCarrier } from "../types";

interface DeleteResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: { id: string; name: string } | null;
  onSubmit: (carrier: DeleteResourceCarrier) => Promise<void>;
  isSubmitting?: boolean;
}

export function DeleteResourceDialog({
  open,
  onOpenChange,
  resource,
  onSubmit,
  isSubmitting = false,
}: DeleteResourceDialogProps) {
  const [deleteFromKeycloak, setDeleteFromKeycloak] = useState(false);

  const handleSubmit = async () => {
    if (!resource) return;

    await onSubmit({
      resourceId: resource.id,
      deleteFromKeycloak,
    });

    setDeleteFromKeycloak(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setDeleteFromKeycloak(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription className="mt-1">
              Confirm deletion of this resource and all associated roles
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 rounded-full"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. All roles associated with this resource will be permanently deleted.
            </AlertDescription>
          </Alert>

          {resource && (
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <p className="text-sm font-medium">Resource to Delete:</p>
              <p className="text-sm text-muted-foreground">
                {resource.name} <span className="font-mono text-xs">(ID: {resource.id})</span>
              </p>
            </div>
          )}

          {/* Delete from Keycloak Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-keycloak"
                checked={deleteFromKeycloak}
                onCheckedChange={(checked) =>
                  setDeleteFromKeycloak(checked === true)
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="delete-keycloak" className="font-normal cursor-pointer">
                Delete from Keycloak as well
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {deleteFromKeycloak
                ? "Resource will be deleted from both database and Keycloak"
                : "Resource will be deleted from database only, Keycloak entry will remain"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Resource"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
