/**
 * UsersSelector Component
 *
 * A searchable user selector that loads users on-demand to avoid memory issues
 * with large user datasets. Uses UserManagement context for fetching.
 * Supports both single and multiple selection modes.
 *
 * Features:
 * - Search-driven loading (no initial load of all users)
 * - Filters only active users
 * - Searches across firstName, lastName, email, employeeId
 * - Loads selected user(s) by ID or email when value is provided
 * - Displays user info with avatar
 * - Single and multiple selection modes
 * - Configurable return field (id or email)
 * - Custom search filters support
 *
 * Usage - Single Mode:
 * ```tsx
 * <UsersSelector
 *   value={selectedUserId}
 *   onChange={(userId) => setSelectedUserId(userId)}
 *   placeholder="Select a user"
 *   disabled={false}
 *   type="single"
 *   returnField="id"
 * />
 * ```
 *
 * Usage - Multiple Mode:
 * ```tsx
 * <UsersSelector
 *   value={selectedUserIds}
 *   onChange={(userIds) => setSelectedUserIds(userIds)}
 *   placeholder="Select users"
 *   disabled={false}
 *   type="multiple"
 *   returnField="email"
 * />
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserManagement } from "@/contexts/UserManagementContext";
import { UserDetails } from "@/modules/user-management/types/onboarding.types";

interface UsersSelectorProps {
  value?: string | string[]; // User ID, employeeId, or email (depends on returnField). Array for multiple mode.
  onChange: (selectedValue: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string; // For form validation errors
  returnField?: "id" | "email"; // Which field to return on selection (default: 'id')
  filters?: Record<string, any>; // Custom filters to merge with default filters
  type?: "single" | "multiple"; // Selection mode (default: 'single')
}

export function UsersSelector({
  value,
  onChange,
  placeholder = "Select user",
  disabled = false,
  className,
  error,
  returnField = "id",
  filters,
  type = "single",
}: UsersSelectorProps) {
  const { refreshUsers } = useUserManagement();

  // State
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<UserDetails[]>([]); // For multiple mode
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);

  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load selected user(s) when value changes (for edit mode or pre-selected value)
  const loadSelectedUser = async () => {
    if (type === "multiple") {
      // Multiple mode
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setSelectedUsers([]);
        return;
      }

      const valuesToLoad = Array.isArray(value) ? value : [value];

      setIsLoadingSelected(true);
      try {
        const searchField = returnField === "email" ? "email" : "id";

        // Build search request using UniversalSearchRequest format
        const searchRequest = {
          filters: {
            and: {
              [searchField]: { op: "in" as const, values: valuesToLoad },
              status: "ACTIVE",
              ...filters,
            },
          },
        };

        const result = await refreshUsers(searchRequest, 0, 100);

        if (result && result.content) {
          setSelectedUsers(result.content);
        }
      } catch (error) {
        console.error("Error loading selected users:", error);
      } finally {
        setIsLoadingSelected(false);
      }
    } else {
      // Single mode
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setSelectedUser(null);
        return;
      }

      const singleValue = Array.isArray(value) ? value[0] : value;

      // Determine which field to search on based on returnField
      const searchField = returnField === "email" ? "email" : "id";
      const isAlreadySelected =
        returnField === "email"
          ? selectedUser?.email === singleValue
          : selectedUser?.id === singleValue;

      // If already selected, no need to reload
      if (isAlreadySelected) {
        return;
      }

      setIsLoadingSelected(true);
      try {
        // Build search request using UniversalSearchRequest format
        const searchRequest = {
          filters: {
            and: {
              [searchField]: singleValue,
              status: "ACTIVE",
              ...filters,
            },
          },
        };

        const result = await refreshUsers(searchRequest, 0, 1);

        if (result && result.content && result.content.length > 0) {
          setSelectedUser(result.content[0]);
        }
      } catch (error) {
        console.error("Error loading selected user:", error);
      } finally {
        setIsLoadingSelected(false);
      }
    }
  };

  useEffect(() => {
    loadSelectedUser();
  }, [value, returnField, filters, type]);

  // Search users with debounce
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setUsers([]);
        return;
      }

      setIsLoadingUsers(true);
      try {
        // Build search request using UniversalSearchRequest format
        const mergedFilters = {
          and: {
            status: "ACTIVE",
            ...filters,
          },
        };

        const searchRequest = {
          searchText: query.trim(),
          searchFields: ["firstName", "lastName", "email", "id"],
          filters: mergedFilters,
        };

        const result = await refreshUsers(searchRequest, 0, 20);

        if (result && result.content) {
          setUsers(result.content);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [refreshUsers, filters],
  );

  // Handle search input change with debounce
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(query);
      }, 300); // 300ms debounce
    },
    [searchUsers],
  );

  // Handle user selection
  const handleSelect = useCallback(
    (user: UserDetails) => {
      const valueToReturn =
        returnField === "email" ? user.email || user.id : user.id;

      if (type === "multiple") {
        // Multiple mode: add to selected users
        const alreadySelected = selectedUsers.some((u) =>
          returnField === "email"
            ? u.email === valueToReturn
            : u.id === valueToReturn,
        );

        if (!alreadySelected) {
          const newSelectedUsers = [...selectedUsers, user];
          setSelectedUsers(newSelectedUsers);

          // Return array of selected values
          const selectedValues = newSelectedUsers.map((u) =>
            returnField === "email" ? u.email || u.id : u.id,
          );
          onChange(selectedValues);
        }
        // Keep popover open for multiple selection
        setSearchQuery("");
        setUsers([]);
      } else {
        // Single mode: replace selection and close
        setSelectedUser(user);
        onChange(valueToReturn);
        setOpen(false);
        setSearchQuery("");
        setUsers([]);
      }
    },
    [onChange, returnField, type, selectedUsers],
  );

  // Handle removing a user from multiple selection
  const handleRemoveUser = useCallback(
    (userToRemove: UserDetails) => {
      const newSelectedUsers = selectedUsers.filter((u) => {
        if (returnField === "email") {
          return u.email !== userToRemove.email;
        }
        return u.id !== userToRemove.id;
      });
      setSelectedUsers(newSelectedUsers);

      // Return updated array
      const selectedValues = newSelectedUsers.map((u) =>
        returnField === "email" ? u.email || u.id : u.id,
      );
      onChange(selectedValues);
    },
    [onChange, returnField, selectedUsers],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get display name
  const getDisplayName = (user: UserDetails | null) => {
    if (!user) return null;
    return `${user.firstName} ${user.lastName}`;
  };

  // Get display details
  const getDisplayDetails = (user: UserDetails | null) => {
    if (!user) return null;
    return `${user.id} • ${user.email}`;
  };

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-[2rem] py-2",
              type === "single" && !selectedUser && "text-muted-foreground",
              type === "multiple" &&
                selectedUsers.length === 0 &&
                "text-muted-foreground",
              error && "border-destructive",
              className,
            )}
          >
            {type === "multiple" ? (
              // Multiple mode display
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isLoadingSelected ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span className="text-sm">Loading users...</span>
                  </>
                ) : selectedUsers.length > 0 ? (
                  <span className="text-sm font-medium">
                    {selectedUsers.length}{" "}
                    {selectedUsers.length === 1 ? "user" : "users"} selected
                  </span>
                ) : (
                  <span className="text-sm">{placeholder}</span>
                )}
              </div>
            ) : (
              // Single mode display
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isLoadingSelected ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span className="text-sm">Loading user...</span>
                  </>
                ) : selectedUser ? (
                  <>
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-xs">
                        {selectedUser.firstName?.[0]}
                        {selectedUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium truncate w-full text-left">
                        {getDisplayName(selectedUser)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full text-left">
                        {getDisplayDetails(selectedUser)}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-sm">{placeholder}</span>
                )}
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden" align="start">
          <Command shouldFilter={false} className="w-full">
            <div className="flex items-center border-b px-3 py-2 gap-2 w-full">
              <CommandInput
                placeholder="Search by name"
                value={searchQuery}
                onValueChange={handleSearchChange}
                className="flex-1 w-full text-sm"
              />
            </div>
            <CommandList>
              <CommandEmpty>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Searching users...
                    </span>
                  </div>
                ) : searchQuery.trim().length < 2 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No users found
                  </div>
                )}
              </CommandEmpty>
              {users.length > 0 && (
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => handleSelect(user)}
                      className="flex items-center gap-2 px-2 py-2"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.id} • {user.email}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4 shrink-0",
                          (() => {
                            if (type === "multiple") {
                              const isSelected = selectedUsers.some((u) =>
                                returnField === "email"
                                  ? u.email === user.email
                                  : u.id === user.id,
                              );
                              return isSelected ? "opacity-100" : "opacity-0";
                            } else {
                              return returnField === "email"
                                ? selectedUser?.email === user.email
                                  ? "opacity-100"
                                  : "opacity-0"
                                : selectedUser?.id === user.id
                                  ? "opacity-100"
                                  : "opacity-0";
                            }
                          })(),
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users chips for multiple mode */}
      {type === "multiple" && selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map((user) => (
            <Badge
              key={`${returnField === "email" ? user.email : user.id}`}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <span className="text-xs">
                {user.firstName} {user.lastName}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveUser(user)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5 transition-colors"
                aria-label={`Remove ${user.firstName} ${user.lastName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
