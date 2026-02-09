import { useState, useMemo } from 'react';
import { useProjectStore } from '../store/projectStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';

/** 🔒 FIXED COLUMN WIDTHS */
const EMPLOYEE_COL_WIDTH = 250;
const TOTAL_COL_WIDTH = 100;
const PROJECT_COL_WIDTH = 150;

export function AllocationTable() {
  const {
    currentUser,
    users,
    subProjects,
    allocations,
    updateAllocation,
  } = useProjectStore();

  const isAdmin = currentUser.role === 'ADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  /** =========================
   * PROJECT COLUMNS
   ========================= */
  const allProjectColumns = useMemo(() => {
    let projects = subProjects;

    if (currentUser.role === 'MANAGER') {
      projects = subProjects.filter(
        (sp) => sp.managerId === currentUser.id
      );
    } else if (currentUser.role === 'EMPLOYEE') {
      const myProjectIds = allocations
        .filter((a) => a.employeeId === currentUser.id)
        .map((a) => a.subProjectId);

      projects = subProjects.filter((sp) =>
        myProjectIds.includes(sp.id)
      );
    }

    return projects.map((p) => ({
      id: p.id,
      label: p.projectCode
        ? `${p.projectCode} - ${p.projectName}`
        : p.projectName,
      original: p,
    }));
  }, [subProjects, currentUser, allocations]);

  const displayedProjects = useMemo(() => {
    if (visibleColumns.length === 0) return allProjectColumns;
    return allProjectColumns.filter((p) =>
      visibleColumns.includes(p.id)
    );
  }, [allProjectColumns, visibleColumns]);

  /** =========================
   * EMPLOYEE FILTERING
   ========================= */
  const filteredEmployees = useMemo(() => {
    let employees = users.filter((u) => u.role === 'EMPLOYEE');

    if (currentUser.role === 'MANAGER') {
      const myProjectIds = subProjects
        .filter((sp) => sp.managerId === currentUser.id)
        .map((sp) => sp.id);

      const allocatedEmployeeIds = allocations
        .filter((a) => myProjectIds.includes(a.subProjectId))
        .map((a) => a.employeeId);

      employees = employees.filter((u) =>
        allocatedEmployeeIds.includes(u.id)
      );
    } else if (currentUser.role === 'EMPLOYEE') {
      employees = employees.filter(
        (u) => u.id === currentUser.id
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      employees = employees.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return employees;
  }, [users, currentUser, subProjects, allocations, searchQuery]);

  /** =========================
   * ALLOCATION STATUS
   ========================= */
  const employeeStatus = (employeeId: string) => {
    const employeeAllocations = allocations.filter(
      (a) => a.employeeId === employeeId
    );

    const total =
      Math.round(
        employeeAllocations.reduce(
          (sum, a) => sum + a.allocation,
          0
        ) * 100
      ) / 100;

    return {
      total,
      isValid: total === 1,
    };
  };

  const handleAllocationChange = (
    employeeId: string,
    projectId: string,
    value: string
  ) => {
    if (!isAdmin) return;

    if (value === '') {
      updateAllocation(employeeId, projectId, 0);
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
      updateAllocation(employeeId, projectId, num);
    }
  };

  return (
    <div className="space-y-4">
      <GenericToolbar
        showSearch
        searchPlaceholder="Search employees..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showConfigureView
        allColumns={allProjectColumns}
        visibleColumns={
          visibleColumns.length
            ? visibleColumns
            : allProjectColumns.map((p) => p.id)
        }
        onVisibleColumnsChange={setVisibleColumns}
      />

      <div className="rounded-md border overflow-x-auto max-h-[600px] relative">
        <Table className="table-fixed">
          {/* 🔥 COLGROUP FIX */}
          <colgroup>
            <col style={{ width: EMPLOYEE_COL_WIDTH }} />
            <col style={{ width: TOTAL_COL_WIDTH }} />
            {displayedProjects.map((p) => (
              <col
                key={p.id}
                style={{ width: PROJECT_COL_WIDTH }}
              />
            ))}
          </colgroup>

          <TableHeader className="sticky top-0 z-40 bg-background shadow-sm">
            <TableRow>
              <TableHead
                className="sticky left-0 z-30 bg-background border-r"
              >
                Employee
              </TableHead>

              <TableHead
                className="sticky z-20 bg-background border-r text-center"
                style={{ left: EMPLOYEE_COL_WIDTH }}
              >
                Total
              </TableHead>

              {displayedProjects.map((proj) => (
                <TableHead
                  key={proj.id}
                  className="text-center"
                >
                  <div className="flex flex-col py-2">
                    <span className="font-semibold">
                      {proj.original.projectCode}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {proj.original.projectName}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredEmployees.map((emp) => {
              const status = employeeStatus(emp.id);

              return (
                <TableRow
                  key={emp.id}
                  className={
                    status.isValid
                      ? 'hover:bg-muted/50'
                      : 'bg-red-50/50 hover:bg-red-50/60'
                  }
                >
                  <TableCell
                    className="sticky left-0 z-30 bg-background border-r"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{emp.name}</span>
                        {!status.isValid && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Total is{' '}
                                {Math.round(
                                  status.total * 100
                                )}
                                %
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {emp.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell
                    className="sticky z-20 bg-background border-r text-center"
                    style={{ left: EMPLOYEE_COL_WIDTH }}
                  >
                    <Badge
                      variant={
                        status.isValid
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {Math.round(status.total * 100)}%
                    </Badge>
                  </TableCell>

                  {displayedProjects.map((proj) => {
                    const alloc = allocations.find(
                      (a) =>
                        a.employeeId === emp.id &&
                        a.subProjectId === proj.id
                    );

                    const val = alloc?.allocation ?? 0;

                    return (
                      <TableCell
                        key={proj.id}
                        className="text-center"
                      >
                        {isAdmin ? (
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            className={`w-20 mx-auto h-8 text-center ${
                              val > 0
                                ? 'bg-blue-50 font-bold'
                                : 'text-muted-foreground'
                            }`}
                            value={val === 0 ? '' : val}
                            placeholder="-"
                            onChange={(e) =>
                              handleAllocationChange(
                                emp.id,
                                proj.id,
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <span
                            className={
                              val > 0
                                ? 'font-bold'
                                : 'text-muted-foreground'
                            }
                          >
                            {val > 0
                              ? `${Math.round(val * 100)}%`
                              : '-'}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
