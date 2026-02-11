/**
 * Role Profile Switcher - Development Only
 * Allows switching between different RBAC roles for testing
 */

import React from 'react';
import { User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '../types';
import { mockUsers } from '../dummy-data';

interface RoleProfileSwitcherProps {
    currentRole: UserRole;
    currentUserId: string;
    onRoleChange: (role: UserRole, userId: string) => void;
}

export const RoleProfileSwitcher: React.FC<RoleProfileSwitcherProps> = ({
    currentRole,
    currentUserId,
    onRoleChange,
}) => {
    const currentUser = mockUsers.find((u) => u.id === currentUserId);

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'HR':
                return 'bg-purple-100 text-purple-800';
            case 'REPORTING_MANAGER':
                return 'bg-blue-100 text-blue-800';
            case 'EMPLOYEE':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline text-xs">{currentUser?.name || 'User'}</span>
                    <Badge className={getRoleBadgeColor(currentRole)}>{currentRole}</Badge>
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Development: Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Group users by role */}
                {(['HR', 'REPORTING_MANAGER', 'EMPLOYEE'] as UserRole[]).map((role) => {
                    const usersInRole = mockUsers.filter((u) => u.role === role);
                    return (
                        <div key={role}>
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1">
                                {role}
                            </DropdownMenuLabel>
                            {usersInRole.map((user) => (
                                <DropdownMenuItem
                                    key={user.id}
                                    onClick={() => onRoleChange(user.role, user.id)}
                                    className={currentUserId === user.id ? 'bg-muted' : ''}
                                >
                                    <div className="flex flex-1 items-center justify-between gap-2">
                                        <span className="text-sm">{user.name}</span>
                                        {currentUserId === user.id && (
                                            <Badge variant="secondary" className="ml-2">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                        </div>
                    );
                })}

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1">
                    Quick Information
                </DropdownMenuLabel>
                <div className="px-2 py-1 text-xs text-muted-foreground space-y-1">
                    <p>• <strong>HR:</strong> Full access to all templates and reviews</p>
                    <p>• <strong>Manager:</strong> Can review team members' submissions</p>
                    <p>• <strong>Employee:</strong> Can fill own performance reviews</p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
