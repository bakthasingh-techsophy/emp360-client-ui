/**
 * Template Management Component - HR Only
 * View, create, edit, and delete performance templates
 */

import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { GenericToolbar } from '@/components/GenericToolbar/GenericToolbar';
import { PerformanceTemplate } from '../types';
import { AvailableFilter, ActiveFilter } from '@/components/GenericToolbar/types';

interface TemplateManagementProps {
    templates: PerformanceTemplate[];
    onCreateNew: () => void;
    onEdit: (template: PerformanceTemplate) => void;
    onDelete: (templateId: string) => void;
    onToggleStatus: (templateId: string) => void;
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({
    templates,
    onCreateNew,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

    // Define available filters for templates
    const availableFilters = useMemo(() => {
        const filters: AvailableFilter[] = [
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
                id: 'status',
                label: 'Template Status',
                type: 'select',
                operators: [{ label: 'Is', value: 'eq' }],
                options: [
                    { label: 'Active', value: 'true' },
                    { label: 'Inactive', value: 'false' },
                ],
            },
        ];
        return filters;
    }, []);

    // Filter templates based on search and filters
    const filteredTemplates = useMemo(() => {
        let result = [...templates];

        // Apply text search
        if (searchValue) {
            const search = searchValue.toLowerCase();
            result = result.filter(template =>
                template.title.toLowerCase().includes(search) ||
                template.description.toLowerCase().includes(search) ||
                template.department.toLowerCase().includes(search)
            );
        }

        // Apply filters
        activeFilters.forEach(filter => {
            if (!filter.value) return;

            switch (filter.filterId) {
                case 'department':
                    if (filter.value) {
                        result = result.filter(t => t.department === filter.value);
                    }
                    break;
                case 'status':
                    if (filter.value === 'true') {
                        result = result.filter(t => t.templateStatus === true);
                    } else if (filter.value === 'false') {
                        result = result.filter(t => t.templateStatus === false);
                    }
                    break;
            }
        });

        return result;
    }, [templates, searchValue, activeFilters]);
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Performance Templates</h2>
                <p className="text-muted-foreground">
                    Create and manage performance review templates for departments
                </p>
            </div>

            {/* Toolbar with Search, Filters, and Create Button */}
            <GenericToolbar
                showSearch={true}
                searchPlaceholder="Search by template name, description, or department..."
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                showFilters={true}
                availableFilters={availableFilters}
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
                showAddButton={true}
                addButtonLabel="Create Template"
                onAdd={onCreateNew}
            />

            {/* Templates Table */}
            <Card>
                <CardContent className="p-0">
                    {templates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No templates created yet. Click "Create Template" to get started.</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No templates match your search or filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead className="text-center">Columns</TableHead>
                                        <TableHead className="text-center">Rows</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTemplates.map((template) => (
                                        <TableRow key={template.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold">{template.title}</p>
                                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{template.department}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{template.columns.length}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{template.rows.length}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={template.templateStatus ? 'default' : 'secondary'}
                                                    className={
                                                        template.templateStatus
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }
                                                >
                                                    {template.templateStatus ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(template.updatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        onClick={() => onEdit(template)}
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Edit Template"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() => onToggleStatus(template.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        title={template.templateStatus ? 'Close Template' : 'Open Template'}
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to delete this template? This action cannot be undone.'
                                                                )
                                                            ) {
                                                                onDelete(template.id);
                                                            }
                                                        }}
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Delete Template"
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-base">Template Builder Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>✓ Create templates with dynamic columns (TEXT, NUMBER, RATING, SELECT, CALCULATED)</p>
                    <p>✓ Define rows with weightage for auto-calculated scores</p>
                    <p>✓ Control who can edit each column (Employee, Manager, HR)</p>
                    <p>✓ Mark fields as mandatory</p>
                    <p>✓ Set rating ranges and configure calculated columns</p>
                    <p>✓ Toggle template status to open/close for reviews</p>
                </CardContent>
            </Card>
        </div>
    );
};
