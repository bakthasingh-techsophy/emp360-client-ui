/**
 * Request List Component
 * Shows different views for Employee, Manager, and HR roles with GenericToolbar
 */

import React, { useState, useMemo } from 'react';
import { Edit, Lock, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import {
    PerformanceReviewRequest,
    PerformanceTemplate,
    UserRole,
} from '../types';
import {
    getStatusLabel,
    getStatusColor,
    getAvailableActions,
    canViewFinalScore,
} from '../utils/rbac';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

interface RequestListProps {
    requests: PerformanceReviewRequest[];
    templates: Map<string, PerformanceTemplate>;
    currentUserRole: UserRole;
    currentUserId: string;
    onEdit: (request: PerformanceReviewRequest) => void;
    onFreeze?: (requestId: string) => void;
    onRevoke?: (requestId: string) => void;
    onExport?: () => void;
}

export const RequestList: React.FC<RequestListProps> = ({
    requests,
    templates,
    currentUserRole,
    currentUserId,
    onEdit,
    onFreeze,
    onRevoke,
    onExport,
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

    // Define filter options based on role
    const availableFilters = useMemo(() => {
        const filters: AvailableFilter[] = [
            {
                id: 'status',
                label: 'Status',
                type: 'select',
                operators: [{ label: 'Is', value: 'eq' }],
                options: [
                    { label: 'At Employee', value: 'AT_EMPLOYEE' },
                    { label: 'At Manager', value: 'AT_MANAGER' },
                    { label: 'At HR', value: 'AT_HR' },
                    { label: 'Freezed', value: 'FREEZED' },
                    { label: 'Revoked', value: 'REVOKED' },
                ],
            },
        ];

        if (currentUserRole === 'HR') {
            filters.push(
                {
                    id: 'department',
                    label: 'Department',
                    type: 'select',
                    operators: [{ label: 'Is', value: 'eq' }],
                    options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Operations'].map(dept => ({
                        label: dept,
                        value: dept,
                    })),
                },
                {
                    id: 'employee',
                    label: 'Employee',
                    type: 'text',
                    operators: [{ label: 'Contains', value: 'regex' }],
                }
            );
        }

        if (currentUserRole === 'REPORTING_MANAGER') {
            filters.push({
                id: 'daterange',
                label: 'Date Range',
                type: 'date',
                operators: [{ label: 'Between', value: 'between' }],
                defaultOperator: 'between',
            });
        }

        return filters;
    }, [currentUserRole]);

    // Filter requests based on search and filters
    const filteredRequests = useMemo(() => {
        let result = [...requests];

        // Apply text search
        if (searchValue) {
            const search = searchValue.toLowerCase();
            result = result.filter(req =>
                req.employeeName.toLowerCase().includes(search) ||
                req.managerName.toLowerCase().includes(search) ||
                req.id.toLowerCase().includes(search) ||
                templates.get(req.templateId)?.title.toLowerCase().includes(search)
            );
        }

        // Apply filters
        activeFilters.forEach(filter => {
            if (!filter.value && filter.filterId !== 'daterange') return;

            switch (filter.filterId) {
                case 'status':
                    if (filter.value) {
                        result = result.filter(req => req.status === filter.value);
                    }
                    break;
                case 'department':
                    if (filter.value) {
                        result = result.filter(req => req.department === filter.value);
                    }
                    break;
                case 'employee':
                    if (filter.value) {
                        result = result.filter(req =>
                            req.employeeName.toLowerCase().includes(String(filter.value).toLowerCase())
                        );
                    }
                    break;
                case 'daterange':
                    if (filter.value && typeof filter.value === 'object' && 'from' in filter.value) {
                        const range = filter.value as { from?: Date; to?: Date };
                        result = result.filter(req => {
                            const createdDate = new Date(req.createdAt);
                            if (range.from && createdDate < range.from) return false;
                            if (range.to && createdDate > range.to) return false;
                            return true;
                        });
                    }
                    break;
            }
        });

        return result;
    }, [requests, searchValue, activeFilters, templates]);

    if (requests.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No reviews found.</p>
                </CardContent>
            </Card>
        );
    }

    // ============= TOOLBAR & SEARCH/FILTER SECTION =============
    const toolbarSection = (
        <GenericToolbar
            showSearch={true}
            searchPlaceholder="Search by employee, manager, template, or request ID..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            showFilters={true}
            availableFilters={availableFilters}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showExport={true}
            onExportResults={onExport}
        />
    );

    // Show message if no results after filtering
    if (filteredRequests.length === 0) {
        return (
            <div className="space-y-4">
                {toolbarSection}
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No reviews match your search or filters.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ============= EMPLOYEE VIEW =============
    if (currentUserRole === 'EMPLOYEE') {
        return (
            <div className="space-y-4">
                {toolbarSection}
                {filteredRequests.map((request) => {
                    const template = templates.get(request.templateId);
                    const actions = getAvailableActions(request, currentUserRole, currentUserId);
                    const canViewScore = canViewFinalScore(request, currentUserRole, currentUserId);

                    return (
                        <Card key={request.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{template?.title}</CardTitle>
                                        <CardDescription>
                                            {template?.description}
                                        </CardDescription>
                                    </div>
                                    <Badge className={getStatusColor(request.status)}>
                                        {getStatusLabel(request.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Department</p>
                                        <p className="font-semibold">{request.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Manager</p>
                                        <p className="font-semibold">{request.managerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Created</p>
                                        <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {canViewScore && (
                                        <div>
                                            <p className="text-muted-foreground">Final Score</p>
                                            <p className="font-semibold text-lg text-blue-600">{request.finalScore.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button onClick={() => onEdit(request)} variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    {actions.canEdit && (
                                        <Button onClick={() => onEdit(request)} size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    }

    // ============= MANAGER VIEW =============
    if (currentUserRole === 'REPORTING_MANAGER') {
        // Separate into "My Requests" and "Team Requests" from filtered results
        const myRequests = filteredRequests.filter((r) => r.employeeId === currentUserId);
        const teamRequests = filteredRequests.filter((r) => r.managerId === currentUserId && r.employeeId !== currentUserId);

        return (
            <div className="space-y-4">
                {toolbarSection}
                {/* My Requests */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">My Requests (As Employee)</h3>
                    {myRequests.length === 0 ? (
                        <p className="text-muted-foreground">No requests assigned to you as employee.</p>
                    ) : (
                        <div className="space-y-4">
                            {myRequests.map((request) => {
                                const template = templates.get(request.templateId);
                                const actions = getAvailableActions(request, currentUserRole, currentUserId);

                                return (
                                    <Card key={request.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">{template?.title}</CardTitle>
                                                <Badge className={getStatusColor(request.status)}>
                                                    {getStatusLabel(request.status)}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex justify-end gap-2">
                                            <Button onClick={() => onEdit(request)} variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                            {actions.canEdit && (
                                                <Button onClick={() => onEdit(request)} size="sm">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Team Requests - Accordion */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Team Requests</h3>
                    {teamRequests.length === 0 ? (
                        <p className="text-muted-foreground">No team member requests to review.</p>
                    ) : (
                        <Accordion type="single" collapsible className="space-y-2">
                            {teamRequests.map((request) => {
                                const template = templates.get(request.templateId);
                                const actions = getAvailableActions(request, currentUserRole, currentUserId);
                                const canViewScore = canViewFinalScore(request, currentUserRole, currentUserId);

                                return (
                                    <AccordionItem key={request.id} value={request.id} className="border rounded-lg">
                                        <AccordionTrigger className="px-4">
                                            <div className="flex items-center justify-between w-full text-left">
                                                <div className="flex-1">
                                                    <p className="font-semibold">{request.employeeName}</p>
                                                    <p className="text-sm text-muted-foreground">{template?.title}</p>
                                                </div>
                                                <div className="flex items-center gap-3 pr-4">
                                                    {canViewScore && (
                                                        <span className="text-lg font-bold text-blue-600">
                                                            {request.finalScore.toFixed(2)}
                                                        </span>
                                                    )}
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {getStatusLabel(request.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 bg-muted/50 px-4 py-3">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Department</p>
                                                    <p className="font-semibold">{request.department}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Created</p>
                                                    <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Last Updated</p>
                                                    <p className="font-semibold">{new Date(request.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button onClick={() => onEdit(request)} variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                {actions.canEdit && (
                                                    <Button onClick={() => onEdit(request)} size="sm">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Review
                                                    </Button>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </div>
            </div>
        );
    }

    // ============= HR VIEW =============
    if (currentUserRole === 'HR') {
        return (
            <div className="space-y-4">
                {toolbarSection}
                <h3 className="text-lg font-semibold">All Performance Reviews</h3>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Template</TableHead>
                                        <TableHead className="text-center">Final Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((request) => {
                                        const template = templates.get(request.templateId);
                                        const actions = getAvailableActions(request, currentUserRole, currentUserId);

                                        return (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-semibold">{request.employeeName}</TableCell>
                                                <TableCell>{request.department}</TableCell>
                                                <TableCell>{template?.title}</TableCell>
                                                <TableCell className="text-center font-bold text-blue-600">
                                                    {request.finalScore.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {getStatusLabel(request.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            onClick={() => onEdit(request)}
                                                            variant="ghost"
                                                            size="sm"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>

                                                        {actions.canFreeze && onFreeze && (
                                                            <Button
                                                                onClick={() => {
                                                                    if (confirm('Freeze this review?')) {
                                                                        onFreeze(request.id);
                                                                    }
                                                                }}
                                                                variant="ghost"
                                                                size="sm"
                                                                title="Freeze Review"
                                                                className="text-green-600"
                                                            >
                                                                <Lock className="w-4 h-4" />
                                                            </Button>
                                                        )}

                                                        {actions.canRevoke && onRevoke && (
                                                            <Button
                                                                onClick={() => {
                                                                    if (confirm('Revoke this review?')) {
                                                                        onRevoke(request.id);
                                                                    }
                                                                }}
                                                                variant="ghost"
                                                                size="sm"
                                                                title="Revoke Review"
                                                                className="text-yellow-600"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
};
