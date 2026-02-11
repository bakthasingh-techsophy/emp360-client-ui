/**
 * Template Builder Component - HR Only
 * Dynamic column and row builder with full CRUD
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    PerformanceTemplate,
    TemplateColumn,
    TemplateRow,
    ColumnType,
    ColumnEditableBy,
} from '../types';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Operations'];
const COLUMN_TYPES: ColumnType[] = ['TEXT', 'NUMBER', 'RATING', 'SELECT', 'CALCULATED'];
const EDITABLE_OPTIONS: ColumnEditableBy[] = ['EMPLOYEE', 'MANAGER', 'HR', 'ALL'];

interface TemplateBuilderProps {
    initialTemplate?: PerformanceTemplate;
    onSave: (template: PerformanceTemplate) => void;
    onCancel: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
    initialTemplate,
    onSave,
    onCancel,
}) => {
    const [title, setTitle] = useState(initialTemplate?.title || '');
    const [description, setDescription] = useState(initialTemplate?.description || '');
    const [department, setDepartment] = useState(initialTemplate?.department || '');
    const [templateStatus, setTemplateStatus] = useState(initialTemplate?.templateStatus ?? true);
    const [columns, setColumns] = useState<TemplateColumn[]>(initialTemplate?.columns || []);
    const [rows, setRows] = useState<TemplateRow[]>(initialTemplate?.rows || []);

    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);

    // ============= COLUMN OPERATIONS =============
    const addColumn = () => {
        setColumns((prev) => [
            ...prev,
            {
                id: `col-${Date.now()}`,
                name: 'New Column',
                type: 'TEXT',
                editableBy: ['EMPLOYEE'],
                mandatory: false,
                displayOrder: prev.length + 1,
            },
        ]);
    };

    const updateColumn = (columnId: string, updates: Partial<TemplateColumn>) => {
        setColumns((prev) =>
            prev.map((col) =>
                col.id === columnId ? { ...col, ...updates } : col
            )
        );
    };

    const deleteColumn = (columnId: string) => {
        setColumns((prev) =>
            prev.filter((col) => col.id !== columnId)
        );
    };

    // ============= ROW OPERATIONS =============
    const addRow = () => {
        setRows((prev) => [
            ...prev,
            {
                id: `row-${Date.now()}`,
                label: 'New Row',
                weightage: 1,
                displayOrder: prev.length + 1,
            },
        ]);
    };

    const updateRow = (rowId: string, updates: Partial<TemplateRow>) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, ...updates } : row
            )
        );
    };

    const deleteRow = (rowId: string) => {
        setRows((prev) =>
            prev.filter((row) => row.id !== rowId)
        );
    };

    // ============= SAVE =============
    const handleSave = () => {
        if (!title.trim() || !department) {
            alert('Please fill in title and department');
            return;
        }

        const template: PerformanceTemplate = {
            id: initialTemplate?.id || `template-${Date.now()}`,
            title,
            description,
            department,
            templateStatus,
            columns: columns.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
            rows: rows.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
            createdBy: initialTemplate?.createdBy || 'hr-001',
            createdAt: initialTemplate?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onSave(template);
    };

    return (
        <div className="space-y-6">
            {/* Basic Details Tab */}
            <Card>
                <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                    <CardDescription>Configure basic template information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Template Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Engineering Annual Review FY2026"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department *</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this template"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="status"
                                checked={templateStatus}
                                onCheckedChange={(checked) => setTemplateStatus(checked as boolean)}
                            />
                            <Label htmlFor="status">Template Open for Review</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Columns & Rows Builder */}
            <Tabs defaultValue="columns" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="columns">Columns ({columns.length})</TabsTrigger>
                    <TabsTrigger value="rows">Rows ({rows.length})</TabsTrigger>
                </TabsList>

                {/* Columns Tab */}
                <TabsContent value="columns" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Dynamic Columns</h3>
                        <Button onClick={addColumn} size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Column
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {columns.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No columns added yet
                            </p>
                        ) : (
                            columns.map((column, idx) => (
                                <div key={column.id} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <GripVertical className="w-4 h-4" />
                                            Column {idx + 1}
                                        </div>
                                        <Button
                                            onClick={() => deleteColumn(column.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {editingColumnId === column.id ? (
                                        <ColumnEditor
                                            column={column}
                                            onUpdate={(updates) => updateColumn(column.id, updates)}
                                            onClose={() => setEditingColumnId(null)}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => setEditingColumnId(column.id)}
                                            className="cursor-pointer space-y-1 text-sm"
                                        >
                                            <p>
                                                <strong>Name:</strong> {column.name}
                                            </p>
                                            <p>
                                                <strong>Type:</strong> {column.type}
                                            </p>
                                            <p>
                                                <strong>Editable by:</strong> {column.editableBy.join(', ')}
                                            </p>
                                            {column.ratingRange && (
                                                <p>
                                                    <strong>Rating Range:</strong> {column.ratingRange.min} - {column.ratingRange.max}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2 cursor-pointer underline">
                                                Click to edit
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Rows Tab */}
                <TabsContent value="rows" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Performance Rows</h3>
                        <Button onClick={addRow} size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Row
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {rows.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No rows added yet
                            </p>
                        ) : (
                            rows.map((row, idx) => (
                                <div key={row.id} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <GripVertical className="w-4 h-4" />
                                            Row {idx + 1}
                                        </div>
                                        <Button
                                            onClick={() => deleteRow(row.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {editingRowId === row.id ? (
                                        <RowEditor
                                            row={row}
                                            onUpdate={(updates) => updateRow(row.id, updates)}
                                            onClose={() => setEditingRowId(null)}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => setEditingRowId(row.id)}
                                            className="cursor-pointer space-y-1 text-sm"
                                        >
                                            <p>
                                                <strong>Label:</strong> {row.label}
                                            </p>
                                            <p>
                                                <strong>Weightage:</strong> {row.weightage}%
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2 cursor-pointer underline">
                                                Click to edit
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                <Button onClick={onCancel} variant="outline">
                    Cancel
                </Button>
                <Button onClick={handleSave}>
                    {initialTemplate ? 'Update' : 'Create'} Template
                </Button>
            </div>
        </div>
    );
};

// ============= COLUMN EDITOR =============
interface ColumnEditorProps {
    column: TemplateColumn;
    onUpdate: (updates: Partial<TemplateColumn>) => void;
    onClose: () => void;
}

const ColumnEditor: React.FC<ColumnEditorProps> = ({
    column,
    onUpdate,
    onClose,
}) => {
    const [localColumn, setLocalColumn] = useState<TemplateColumn>(column);

    useEffect(() => {
        setLocalColumn(column);
    }, [column]);


    return (
        <div className="space-y-3 bg-muted p-3 rounded border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                        value={localColumn.name}
                        onChange={(e) =>
                            setLocalColumn({ ...localColumn, name: e.target.value })
                        }
                    />
                </div>

                <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={localColumn.type}
                        onValueChange={(type) =>
                            setLocalColumn({
                                ...localColumn,
                                type: type as ColumnType,
                            })
                        }>
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {COLUMN_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {localColumn.type === 'RATING' && (
                    <>
                        <div className="space-y-1">
                            <Label className="text-xs">Min Rating</Label>
                            <Input
                                type="number"
                                value={localColumn.ratingRange?.min || 1}
                                onChange={(e) =>
                                    setLocalColumn({
                                        ...localColumn,
                                        ratingRange: {
                                            min: Number(e.target.value),
                                            max: localColumn.ratingRange?.max || 5,
                                        },
                                    })
                                }
                                className="h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Max Rating</Label>
                            <Input
                                type="number"
                                value={localColumn.ratingRange?.max || 5}
                                onChange={(e) =>
                                    setLocalColumn({
                                        ...localColumn,
                                        ratingRange: {
                                            min: localColumn.ratingRange?.min || 1,
                                            max: Number(e.target.value),
                                        },
                                    })
                                }
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold">Editable By</Label>
                <div className="grid grid-cols-4 gap-2">
                    {EDITABLE_OPTIONS.map((role) => (
                        <div key={role} className="flex items-center space-x-1">
                            <Checkbox
                                id={`edit-${role}`}
                                checked={localColumn.editableBy.includes(role)}
                                onCheckedChange={() => {
                                    const updatedRoles = localColumn.editableBy.includes(role)
                                        ? localColumn.editableBy.filter((r) => r !== role)
                                        : [...localColumn.editableBy, role];

                                    setLocalColumn({
                                        ...localColumn,
                                        editableBy: updatedRoles,
                                    });
                                }}

                            />
                            <Label htmlFor={`edit-${role}`} className="text-xs cursor-pointer">
                                {role}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="mandatory"
                    checked={localColumn.mandatory}
                    onCheckedChange={(checked) =>
                        setLocalColumn({
                            ...localColumn,
                            mandatory: checked as boolean,
                        })
                    }
                />
                <Label htmlFor="mandatory" className="text-xs">
                    Mandatory Field
                </Label>
            </div>

            <Button
                onClick={() => {
                    onUpdate(localColumn);   // Save to parent
                    onClose();               // Close edit mode
                }}
                size="sm"
                variant="outline"
                className="w-full"
            >
                Done
            </Button>
        </div>
    );
};

// ============= ROW EDITOR =============
interface RowEditorProps {
    row: TemplateRow;
    onUpdate: (updates: Partial<TemplateRow>) => void;
    onClose: () => void;
}

const RowEditor: React.FC<RowEditorProps> = ({ row, onUpdate, onClose }) => {
    const [localRow, setLocalRow] = useState<TemplateRow>(row);

    useEffect(() => {
        setLocalRow(row);
    }, [row]);

    return (
        <div className="space-y-3 bg-muted p-3 rounded border">
            <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                    value={localRow.label}
                    onChange={(e) =>
                        setLocalRow({ ...localRow, label: e.target.value })
                    }
                />
            </div>

            <div className="space-y-1">
                <Label className="text-xs">Weightage (%)</Label>
                <Input
                    type="number"
                    value={localRow.weightage}
                    onChange={(e) =>
                        setLocalRow({ ...localRow, weightage: Number(e.target.value) })
                    }
                    min="1"
                    max="100"
                />
            </div>

            <Button
                onClick={() => {
                    onUpdate(localRow);   // Save to parent
                    onClose();               // Close edit mode
                }}
                size="sm"
                variant="outline"
                className="w-full"
            >
                Done
            </Button>

        </div>
    );
};
