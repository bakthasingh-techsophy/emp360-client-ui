/**
 * UsersSelector Component
 * 
 * A searchable user selector that loads users on-demand to avoid memory issues
 * with large user datasets. Uses UserManagement context for fetching.
 * 
 * Features:
 * - Search-driven loading (no initial load of all users)
 * - Filters only active users
 * - Searches across firstName, lastName, email, employeeId
 * - Loads selected user by ID when value is provided
 * - Displays user info with avatar
 * 
 * Usage:
 * ```tsx
 * <UsersSelector
 *   value={selectedUserId}
 *   onChange={(userId) => setSelectedUserId(userId)}
 *   placeholder="Select a user"
 *   disabled={false}
 * />
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserManagement } from '@/contexts/UserManagementContext';
import { UserDetails } from '@/modules/user-management/types/onboarding.types';

interface UsersSelectorProps {
  value?: string; // User ID or employeeId
  onChange: (userId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string; // For form validation errors
}

export function UsersSelector({
  value,
  onChange,
  placeholder = 'Select user',
  disabled = false,
  className,
  error,
}: UsersSelectorProps) {
  const { refreshUsers } = useUserManagement();
  
  // State
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);
  
  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load selected user when value changes (for edit mode or pre-selected value)
  useEffect(() => {
    const loadSelectedUser = async () => {
      if (!value) {
        setSelectedUser(null);
        return;
      }

      // If already selected, no need to reload
      if (selectedUser?.id === value) {
        return;
      }

      setIsLoadingSelected(true);
      try {
        // Search for user by ID
        const result = await refreshUsers(
          {
            filters: {
              and: {
                id: value,
                status: 'ACTIVE',
              },
            },
          },
          0,
          1
        );

        if (result && result.content && result.content.length > 0) {
          setSelectedUser(result.content[0]);
        }
      } catch (error) {
        console.error('Error loading selected user:', error);
      } finally {
        setIsLoadingSelected(false);
      }
    };

    loadSelectedUser();
  }, [value]);

  // Search users with debounce
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setUsers([]);
        return;
      }

      setIsLoadingUsers(true);
      try {
        const result = await refreshUsers(
          {
            searchText: query.trim(),
            searchFields: ['firstName', 'lastName', 'email', 'id'], // 'id' is the employeeId
            filters: {
              and: {
                status: 'ACTIVE',
              },
            },
          },
          0,
          20 // Limit to 20 results
        );

        if (result && result.content) {
          setUsers(result.content);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [refreshUsers]
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
    [searchUsers]
  );

  // Handle user selection
  const handleSelect = useCallback(
    (user: UserDetails) => {
      setSelectedUser(user);
      onChange(user.id);
      setOpen(false);
      setSearchQuery('');
      setUsers([]);
    },
    [onChange]
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
              'w-full justify-between h-auto min-h-[2rem] py-2',
              !selectedUser && 'text-muted-foreground',
              error && 'border-destructive',
              className
            )}
          >
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
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search by name, email, or employee ID..."
                value={searchQuery}
                onValueChange={handleSearchChange}
                className="h-10"
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
                          'ml-auto h-4 w-4 shrink-0',
                          selectedUser?.id === user.id
                            ? 'opacity-100'
                            : 'opacity-0'
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
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
