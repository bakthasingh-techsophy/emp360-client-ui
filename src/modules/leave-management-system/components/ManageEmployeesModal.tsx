/**
 * Manage Employees Modal
 * Modal for selecting employees to involve in a leave configuration
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UsersSelector } from '@/components/context-aware/UsersSelector';
import { X } from 'lucide-react';

interface ManageEmployeesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployeeIds: string[];
  onInvolveAll: () => void;
  onInvolveSelected: (employeeIds: string[]) => void;
  leaveTypeName?: string;
}

export function ManageEmployeesModal({
  open,
  onOpenChange,
  selectedEmployeeIds,
  onInvolveAll,
  onInvolveSelected,
  leaveTypeName = 'Leave Type',
}: ManageEmployeesModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(selectedEmployeeIds);
  const [selectedUserDetails, setSelectedUserDetails] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Initialize with current employee ids
  useEffect(() => {
    if (open) {
      setSelectedUsers(selectedEmployeeIds);
      // For now, we'll just use the IDs as names. In production, you might fetch full details
      setSelectedUserDetails(
        selectedEmployeeIds.map((id) => ({ id, name: id }))
      );
    }
  }, [open, selectedEmployeeIds]);

  const handleUserSelect = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      const newUsers = [...selectedUsers, userId];
      setSelectedUsers(newUsers);
      setSelectedUserDetails([
        ...selectedUserDetails,
        { id: userId, name: userId },
      ]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    setSelectedUserDetails(
      selectedUserDetails.filter((user) => user.id !== userId)
    );
  };

  const handleInvolveAll = () => {
    onInvolveAll();
    onOpenChange(false);
  };

  const handleInvolveSelected = () => {
    onInvolveSelected(selectedUsers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Employees</DialogTitle>
          <DialogDescription>
            Select employees to involve in {leaveTypeName} leave configuration
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* User Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employees</label>
            <UsersSelector
              value=""
              onChange={handleUserSelect}
              placeholder="Search and select employees..."
              disabled={false}
            />
          </div>

          {/* Selected Employees List */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Selected ({selectedUserDetails.length})
            </label>
            <ScrollArea className="border rounded-md p-4 h-[200px]">
              {selectedUserDetails.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No employees selected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedUserDetails.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-muted p-2 rounded-md"
                    >
                      <Badge variant="outline" className="text-xs">
                        {user.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button
            variant="destructive"
            onClick={handleInvolveAll}
            className="flex-1"
          >
            Involve All
          </Button>
          <Button
            onClick={handleInvolveSelected}
            disabled={selectedUserDetails.length === 0}
            className="flex-1"
          >
            Involve Selected ({selectedUserDetails.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
