/**
 * Profile Toggle Dropdown (Dev-Only)
 * Allows switching between EMPLOYEE and REPORTING_MANAGER roles for testing
 */

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Users, ChevronDown } from 'lucide-react';
import { AttendanceRole } from '@/types/attendance';
import { MOCK_USERS } from '@/services/attendanceService';

interface ProfileToggleProps {
  currentRole: AttendanceRole;
  onRoleChange: (role: AttendanceRole) => void;
}

export const ProfileToggle: React.FC<ProfileToggleProps> = ({ currentRole, onRoleChange }) => {
  const [open, setOpen] = useState(false);

  const currentUser =
    currentRole === 'EMPLOYEE'
      ? { name: `${MOCK_USERS.employee.firstName} ${MOCK_USERS.employee.lastName}`, email: MOCK_USERS.employee.email }
      : { name: `${MOCK_USERS.reportingManager.firstName} ${MOCK_USERS.reportingManager.lastName}`, email: MOCK_USERS.reportingManager.email };

  const getRoleColor = (role: AttendanceRole) => {
    return role === 'EMPLOYEE' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          title="Switch role (Dev-only)"
        >
          <div className="flex items-center gap-2">
            {currentRole === 'EMPLOYEE' ? (
              <User className="h-4 w-4" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            <div className="hidden sm:flex flex-col items-start gap-0">
              <span className="text-[10px] text-muted-foreground">Role</span>
              <Badge variant="secondary" className={`text-xs px-2 py-0 ${getRoleColor(currentRole)}`}>
                {currentRole === 'EMPLOYEE' ? 'Employee' : 'Reporting Manager'}
              </Badge>
            </div>
          </div>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Profile</p>
          <p className="text-sm font-medium mt-1">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          <p className={`text-xs mt-1 px-2 py-1 rounded ${getRoleColor(currentRole)}`}>
            {currentRole === 'EMPLOYEE' ? 'Employee' : 'Reporting Manager'}
          </p>
        </div>
        <DropdownMenuSeparator className="my-2" />
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Switch Role</p>
        </div>
        <DropdownMenuItem
          onClick={() => {
            onRoleChange('EMPLOYEE');
            setOpen(false);
          }}
          className={currentRole === 'EMPLOYEE' ? 'bg-accent' : ''}
        >
          <User className="h-4 w-4 mr-2" />
          <div>
            <p className="text-sm font-medium">Employee</p>
            <p className="text-xs text-muted-foreground">{MOCK_USERS.employee.email}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onRoleChange('REPORTING_MANAGER');
            setOpen(false);
          }}
          className={currentRole === 'REPORTING_MANAGER' ? 'bg-accent' : ''}
        >
          <Users className="h-4 w-4 mr-2" />
          <div>
            <p className="text-sm font-medium">Reporting Manager</p>
            <p className="text-xs text-muted-foreground">{MOCK_USERS.reportingManager.email}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <p>💡 <strong>Dev-only feature:</strong> Switch between roles to test RBAC</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
