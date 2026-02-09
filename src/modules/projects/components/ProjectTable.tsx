import { useMemo } from 'react';
import { useProjectStore, ParentProject, SubProject } from '../store/projectStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ProjectTableProps {
    onEdit: (project: ParentProject | SubProject) => void;
    searchQuery?: string;
}

export function ProjectTable({ onEdit, searchQuery = '' }: ProjectTableProps) {
    const {
        currentUser,
        parentProjects,
        subProjects,
        allocations
    } = useProjectStore();

    const isAdmin = currentUser.role === 'ADMIN';

    // Filter projects based on RBAC and Search
    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase();

        // 1. Get relevant SubProjects
        let relevantSubProjects = subProjects;

        if (currentUser.role === 'MANAGER') {
            relevantSubProjects = subProjects.filter(sp => sp.managerId === currentUser.id);
        } else if (currentUser.role === 'EMPLOYEE') {
            const myAllocations = allocations.filter(a => a.employeeId === currentUser.id);
            const myProjectIds = myAllocations.map(a => a.subProjectId);
            relevantSubProjects = subProjects.filter(sp => myProjectIds.includes(sp.id));
        }

        // Apply Search to SubProjects
        if (query) {
            relevantSubProjects = relevantSubProjects.filter(sp =>
                sp.projectName.toLowerCase().includes(query) ||
                sp.projectCode.toLowerCase().includes(query) ||
                sp.client.toLowerCase().includes(query)
            );
        }

        // 2. Group by Parent Project for display
        const visibleParentIds = new Set(relevantSubProjects.map(sp => sp.parentProjectId));

        let relevantParents = parentProjects;
        if (currentUser.role !== 'ADMIN') {
            relevantParents = parentProjects.filter(p => visibleParentIds.has(p.id));
        }

        // Apply Search to Parents (if parent matches, include it even if subprojects don't - OR logic? 
        // usually if parent matches we show it. 
        // If sub matches we show parent + specific sub.
        // Let's refine: Filter parents if they match OR if they have matching subprojects.

        if (query) {
            relevantParents = relevantParents.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.client.toLowerCase().includes(query) ||
                visibleParentIds.has(p.id) // Include if it has matching subprojects
            );
        }

        return relevantParents.map(parent => ({
            ...parent,
            subProjects: relevantSubProjects.filter(sp => sp.parentProjectId === parent.id)
        })).filter(p => p.subProjects.length > 0 || (isAdmin && (p.name.toLowerCase().includes(query) || p.client.toLowerCase().includes(query))));
        // Admin sees all matching parents even if empty. Others see only if they have subprojects.

    }, [currentUser, parentProjects, subProjects, allocations, searchQuery, isAdmin]);

    if (filteredData.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No projects found for your view.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Project Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nature</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        {isAdmin && <TableHead className="w-[50px]">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((parent) => (
                        <>
                            {/* Parent Project Row */}
                            <TableRow key={parent.id} className="bg-muted/50 hover:bg-muted/50 font-medium">
                                <TableCell colSpan={7}>
                                    {parent.name} <span className="text-muted-foreground font-normal ml-2">({parent.client})</span>
                                </TableCell>
                                {isAdmin && (
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(parent)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                            {/* Sub Project Rows */}
                            {parent.subProjects.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="pl-8">{sub.projectName}</TableCell>
                                    <TableCell>{sub.projectCode}</TableCell>
                                    <TableCell>{sub.client}</TableCell>
                                    <TableCell>{sub.type}</TableCell>
                                    <TableCell>{sub.projectNature}</TableCell>
                                    <TableCell>{sub.category}</TableCell>
                                    <TableCell>
                                        <Badge variant={sub.billingType === 'Billable' ? 'default' : 'secondary'}>
                                            {sub.billingType}
                                        </Badge>
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(sub)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {parent.subProjects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground italic text-xs py-2">
                                        No sub-projects
                                    </TableCell>
                                </TableRow>
                            )}
                        </>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
