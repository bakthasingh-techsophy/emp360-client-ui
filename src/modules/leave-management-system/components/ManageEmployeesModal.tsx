/**
 * Manage Employees Modal
 * Modal for selecting employees to involve in a leave configuration
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, UserPlus, UserMinus, ChevronsUpDown, Loader2 } from 'lucide-react';
import { UserDetails } from '@/modules/user-management/types/onboarding.types';
import { useUserManagement } from '@/contexts/UserManagementContext';
import UniversalSearchRequest from '@/types/search';

interface ManageEmployeesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployeeIds: string[];
  onSave: (employeeIds: string[]) => void;
  leaveTypeName?: string;
}

export function ManageEmployeesModal({
  open,
  onOpenChange,
  selectedEmployeeIds,
  onSave,
  leaveTypeName = 'Leave Type',
}: ManageEmployeesModalProps) {
  const { refreshUsers } = useUserManagement();
  const [employees, setEmployees] = useState<UserDetails[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(selectedEmployeeIds);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails[]>([]);
  const [comboOpen, setComboOpen] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Fetch all employees when modal opens
  useEffect(() => {
    const fetchEmployees = async () => {
      if (open && employees.length === 0) {
        setIsLoadingEmployees(true);
        try {
          // Empty search request to fetch all users from all companies
          const searchRequest: UniversalSearchRequest = {};
          const result = await refreshUsers(searchRequest, 0, 1000); // Fetch up to 1000 employees
          if (result && result.content) {
            setEmployees(result.content);
          }
        } catch (error) {
          console.error('Failed to fetch employees:', error);
        } finally {
          setIsLoadingEmployees(false);
        }
      }
    };
    fetchEmployees();
  }, [open, refreshUsers, employees.length]);

  // Initialize with current employee ids
  useEffect(() => {
    if (open && employees.length > 0) {
      setSelectedUsers(selectedEmployeeIds);
      // Map selected IDs to employee details from fetched list
      const details = selectedEmployeeIds
        .map(id => employees.find(emp => emp.id === id))
        .filter((emp): emp is UserDetails => emp !== undefined);
      setSelectedUserDetails(details);
    }
  }, [open, selectedEmployeeIds, employees]);

  const handleUserSelect = (employeeId: string) => {
    if (!selectedUsers.includes(employeeId) && employeeId) {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const newUsers = [...selectedUsers, employeeId];
        setSelectedUsers(newUsers);
        setSelectedUserDetails([...selectedUserDetails, employee]);
      }
    }
    setComboOpen(false);
  };

  // Get available employees (not already selected)
  const availableEmployees = employees.filter(
    emp => !selectedUsers.includes(emp.id)
  );

  const handleRemoveUser = (employeeId: string) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== employeeId));
    setSelectedUserDetails(
      selectedUserDetails.filter((user) => user.id !== employeeId)
    );
  };

  const handleSelectAll = () => {
    // Select all available employees
    setSelectedUsers(employees.map(emp => emp.id));
    setSelectedUserDetails([...employees]);
  };

  const handleRemoveAll = () => {
    setSelectedUsers([]);
    setSelectedUserDetails([]);
  };

  const handleSave = () => {
    onSave(selectedUsers);
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

        {/* Loading Indicator */}
        {isLoadingEmployees && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Loading employees...</span>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Employee Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employees</label>
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  className="w-full justify-between"
                >
                  Select an employee to add...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0">
                <Command>
                  <CommandInput placeholder="Search by name, employee ID, or email..." />
                  <CommandList>
                    <CommandEmpty>
                      {isLoadingEmployees ? 'Loading employees...' : 'No employees found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {availableEmployees.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={`${employee.firstName} ${employee.lastName} ${employee.id} ${employee.email}`}
                          onSelect={() => handleUserSelect(employee.id)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{employee.id}</span>
                              <span>•</span>
                              <span>{employee.email}</span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Action buttons for bulk operations */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveAll}
                disabled={selectedUserDetails.length === 0}
                className="gap-2"
              >
                <UserMinus className="h-4 w-4" />
                Remove All
              </Button>
            </div>
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
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{user.id}</span>
                          <span>•</span>
                          <span>{user.email}</span>
                        </div>
                      </div>
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

        {/* Footer with Save Button */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
