/**
 * Template Builder Component - HR Only
 * Dynamic column and row builder with full CRUD
 * Supports validation errors display and integration with parent form
 */

import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Edit2, GripVertical } from 'lucide-react';
import { usePerformance } from '@/contexts/PerformanceContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
} from '../types';

const COLUMN_TYPES: ColumnType[] = ['TEXT', 'NUMBER', 'RATING', 'SELECT', 'CALCULATED'];

interface TemplateBuilderProps {
    initialTemplate?: PerformanceTemplate;
    onSave?: (template: PerformanceTemplate) => void;
    onCancel?: () => void;
    validationErrors?: Record<string, string>;
    departments?: Array<{ id: string; department: string }>;
}

export interface TemplateBuilderRef {
    getSaveData: () => PerformanceTemplate | null;
}

export const TemplateBuilder = forwardRef<TemplateBuilderRef, TemplateBuilderProps>(
    ({ initialTemplate, onSave: _onSave, onCancel: _onCancel, validationErrors = {}, departments = [] }, ref) => {
    const [title, setTitle] = useState(initialTemplate?.title || '');
    const [description, setDescription] = useState(initialTemplate?.description || '');
    const [department, setDepartment] = useState(initialTemplate?.departmentId || '');
    const [columns, setColumns] = useState<TemplateColumn[]>([]);
    const [rows, setRows] = useState<TemplateRow[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Get performance context functions
    const { 
        addColumnToTemplate, 
        addRowToTemplate, 
        removeColumnFromTemplate, 
        removeRowFromTemplate,
        refreshTemplateColumns,
        refreshTemplateRows,
        updateTemplateColumn,
        updateTemplateRow
    } = usePerformance();

    // Modal states
    const [columnModalOpen, setColumnModalOpen] = useState(false);
    const [rowModalOpen, setRowModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<TemplateColumn | null>(null);
    const [editingRow, setEditingRow] = useState<TemplateRow | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'column' | 'row'; id: string } | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Load columns and rows when editing existing template
    useEffect(() => {
        const loadTemplateData = async () => {
            if (initialTemplate?.id) {
                setIsLoadingData(true);
                try {
                    // Load columns if columnIds exist
                    if (initialTemplate.columnIds && initialTemplate.columnIds.length > 0) {
                        const columnsResult = await refreshTemplateColumns(
                            { idsList: initialTemplate.columnIds },
                            0,
                            100
                        );
                        if (columnsResult?.content) {
                            // Sort by displayOrder
                            const sortedColumns = [...columnsResult.content].sort(
                                (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
                            );
                            setColumns(sortedColumns);
                        }
                    }

                    // Load rows if rowIds exist
                    if (initialTemplate.rowIds && initialTemplate.rowIds.length > 0) {
                        const rowsResult = await refreshTemplateRows(
                            { idsList: initialTemplate.rowIds },
                            0,
                            100
                        );
                        if (rowsResult?.content) {
                            // Sort by displayOrder
                            const sortedRows = [...rowsResult.content].sort(
                                (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
                            );
                            setRows(sortedRows);
                        }
                    }
                } catch (error) {
                    console.error('Error loading template data:', error);
                } finally {
                    setIsLoadingData(false);
                }
            }
        };

        loadTemplateData();
    }, [initialTemplate?.id]);

    // Expose getSaveData method to parent component
    useImperativeHandle(ref, () => ({
        getSaveData: () => {
            // Build and return the template data without saving
            if (!title.trim() || !department) {
                return null;
            }

            const sortedColumns = columns.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            const sortedRows = rows.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

            const template: PerformanceTemplate = {
                id: initialTemplate?.id || `template-${Date.now()}`,
                title,
                description,
                departmentId: department,
                columnIds: sortedColumns.map(c => c.id),
                templateStatus: initialTemplate?.templateStatus || 'hold',
                rowIds: sortedRows.map(r => r.id),
                createdBy: initialTemplate?.createdBy || 'hr-001',
                createdAt: initialTemplate?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            return template;
        }
    }), [title, department, description, columns, rows, initialTemplate]);

    // ============= COLUMN OPERATIONS =============
    const updateColumn = async (columnId: string, updates: Partial<TemplateColumn>) => {
        // If in edit mode with template ID, call API to update column
        if (initialTemplate?.id) {
            setIsSaving(true);
            try {
                const updatedColumn = await updateTemplateColumn(columnId, updates);
                if (updatedColumn) {
                    setColumns((prev) => {
                        const updated = prev.map((col) =>
                            col.id === columnId ? updatedColumn : col
                        );
                        // Sort by displayOrder
                        return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                    });
                }
            } catch (error) {
                console.error('Error updating column:', error);
            } finally {
                setIsSaving(false);
            }
        } else {
            // Create mode - just update locally
            setColumns((prev) =>
                prev.map((col) =>
                    col.id === columnId ? { ...col, ...updates } : col
                )
            );
        }
    };

    const deleteColumn = async (columnId: string) => {
        // If in edit mode with template ID, call API to remove column
        if (initialTemplate?.id) {
            setIsSaving(true);
            try {
                await removeColumnFromTemplate(initialTemplate.id, columnId);
                setColumns((prev) => prev.filter((col) => col.id !== columnId));
            } catch (error) {
                console.error('Error removing column from template:', error);
            } finally {
                setIsSaving(false);
            }
        } else {
            // Create mode - just remove from local state
            setColumns((prev) => prev.filter((col) => col.id !== columnId));
        }
    };

    // ============= ROW OPERATIONS =============
    const updateRow = async (rowId: string, updates: Partial<TemplateRow>) => {
        // If in edit mode with template ID, call API to update row
        if (initialTemplate?.id) {
            setIsSaving(true);
            try {
                const updatedRow = await updateTemplateRow(rowId, updates);
                if (updatedRow) {
                    setRows((prev) => {
                        const updated = prev.map((row) =>
                            row.id === rowId ? updatedRow : row
                        );
                        // Sort by displayOrder
                        return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                    });
                }
            } catch (error) {
                console.error('Error updating row:', error);
            } finally {
                setIsSaving(false);
            }
        } else {
            // Create mode - just update locally
            setRows((prev) =>
                prev.map((row) =>
                    row.id === rowId ? { ...row, ...updates } : row
                )
            );
        }
    };

    const deleteRow = async (rowId: string) => {
        // If in edit mode with template ID, call API to remove row
        if (initialTemplate?.id) {
            setIsSaving(true);
            try {
                await removeRowFromTemplate(initialTemplate.id, rowId);
                setRows((prev) => prev.filter((row) => row.id !== rowId));
            } catch (error) {
                console.error('Error removing row from template:', error);
            } finally {
                setIsSaving(false);
            }
        } else {
            // Create mode - just remove from local state
            setRows((prev) => prev.filter((row) => row.id !== rowId));
        }
    };

    // ============= ORDER UPDATE OPERATIONS =============
    const handleColumnOrderChange = async (columnId: string, newOrder: number) => {
        if (newOrder < 1) return; // Minimum order is 1
        await updateColumn(columnId, { displayOrder: newOrder });
    };

    const handleRowOrderChange = async (rowId: string, newOrder: number) => {
        if (newOrder < 1) return; // Minimum order is 1
        await updateRow(rowId, { displayOrder: newOrder });
    };

    // ============= SAVE =============
    // Save is handled through ref's getSaveData() method called from parent component
    

    return (
        <div className="space-y-6">
            {/* Basic Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                    <CardDescription>Configure basic template information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium">
                                Template Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Engineering Annual Review FY2026"
                                className={validationErrors['title'] ? 'border-destructive' : ''}
                            />
                            {validationErrors['title'] && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{validationErrors['title']}</span>
                                </div>
                            )}
                        </div>

                        {/* Department Field */}
                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-sm font-medium">
                                Department <span className="text-destructive">*</span>
                            </Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger id="department" className={validationErrors['departmentId'] || validationErrors['department'] ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.department}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {validationErrors['department'] && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{validationErrors['department']}</span>
                                </div>
                            )}
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this template"
                                className={validationErrors['description'] ? 'border-destructive' : ''}
                            />
                            {validationErrors['description'] && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{validationErrors['description']}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Columns & Rows Builder */}
            <Tabs defaultValue="columns" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="columns" className="gap-2">
                        <span>Columns</span>
                        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-semibold">{columns.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rows" className="gap-2">
                        <span>Rows</span>
                        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-semibold">{rows.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Columns Tab */}
                <TabsContent value="columns" className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-base">Review Evaluation Columns</h3>
                            <p className="text-xs text-muted-foreground mt-1">Define the evaluation criteria and their properties</p>
                        </div>
                        <Button
                            onClick={() => setColumnModalOpen(true)}
                            size="sm"
                            className="gap-2 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Add Column
                        </Button>
                    </div>

                    {/* Columns Validation Error */}
                    {validationErrors['columns'] && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-destructive">{validationErrors['columns']}</span>
                        </div>
                    )}

                    {isLoadingData ? (
                        <div className="text-center py-12">
                            <div className="bg-muted rounded-lg p-6 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-muted-foreground text-sm">Loading columns...</p>
                            </div>
                        </div>
                    ) : columns.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-muted rounded-lg p-6 space-y-3">
                                <p className="text-muted-foreground text-sm">No columns added yet</p>
                                <p className="text-xs text-muted-foreground">Add at least one evaluation column to define what will be reviewed.</p>
                                <Button
                                    onClick={() => setColumnModalOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create First Column
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {columns.map((column, idx) => (
                                <ColumnListItem
                                    key={column.id}
                                    column={column}
                                    index={idx}
                                    isEditMode={!!initialTemplate?.id}
                                    onEdit={() => {
                                        setEditingColumn(column);
                                        setColumnModalOpen(true);
                                    }}
                                    onDelete={() => setDeleteConfirm({ type: 'column', id: column.id })}
                                    onOrderChange={(newOrder) => handleColumnOrderChange(column.id, newOrder)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Rows Tab */}
                <TabsContent value="rows" className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-base">Performance Evaluation Parameters</h3>
                            <p className="text-xs text-muted-foreground mt-1">Define the parameters to be evaluated (e.g., Quality, Teamwork, etc.)</p>
                        </div>
                        <Button
                            onClick={() => setRowModalOpen(true)}
                            size="sm"
                            className="gap-2 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Add Row
                        </Button>
                    </div>

                    {/* Rows Validation Error */}
                    {validationErrors['rows'] && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-destructive">{validationErrors['rows']}</span>
                        </div>
                    )}

                    {isLoadingData ? (
                        <div className="text-center py-12">
                            <div className="bg-muted rounded-lg p-6 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-muted-foreground text-sm">Loading rows...</p>
                            </div>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-muted rounded-lg p-6 space-y-3">
                                <p className="text-muted-foreground text-sm">No rows added yet</p>
                                <p className="text-xs text-muted-foreground">Add at least one row to define the evaluation parameters.</p>
                                <Button
                                    onClick={() => setRowModalOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create First Row
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rows.map((row, idx) => (
                                <RowListItem
                                    key={row.id}
                                    row={row}
                                    index={idx}
                                    isEditMode={!!initialTemplate?.id}
                                    onEdit={() => {
                                        setEditingRow(row);
                                        setRowModalOpen(true);
                                    }}
                                    onDelete={() => setDeleteConfirm({ type: 'row', id: row.id })}
                                    onOrderChange={(newOrder) => handleRowOrderChange(row.id, newOrder)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Column Modal Dialog */}
            <Dialog open={columnModalOpen} onOpenChange={setColumnModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingColumn ? 'Edit Column' : 'Add Column'}</DialogTitle>
                        <DialogDescription>
                            {editingColumn ? 'Update the column properties' : 'Define the column properties for evaluation'}
                        </DialogDescription>
                    </DialogHeader>
                    <ColumnModalForm
                        column={editingColumn}
                        isSaving={isSaving}
                        onSave={async (column) => {
                            if (editingColumn) {
                                updateColumn(editingColumn.id, column);
                            } else {
                                // If in edit mode with template ID, call API to add column
                                if (initialTemplate?.id) {
                                    setIsSaving(true);
                                    try {
                                        const newColumn = await addColumnToTemplate(initialTemplate.id, {
                                            name: column.name || '',
                                            type: column.type || '',
                                            mandatory: column.mandatory || false,
                                            ratingRange: column.ratingRange,
                                            options: column.options,
                                            calculationFormula: column.calculationFormula,
                                            displayOrder: columns.length + 1,
                                        });
                                        
                                        if (newColumn) {
                                            setColumns((prev) => {
                                                const updated = [...prev, newColumn];
                                                // Sort by displayOrder
                                                return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                                            });
                                        }
                                    } catch (error) {
                                        console.error('Error adding column to template:', error);
                                    } finally {
                                        setIsSaving(false);
                                    }
                                } else {
                                    // Create mode - just add locally
                                    const newColumn: TemplateColumn = {
                                        id: `col-${Date.now()}`,
                                        name: column.name || '',
                                        columnType: column.columnType || 'TEXT',
                                        type: column.type || '',
                                        mandatory: column.mandatory || false,
                                        ratingRange: column.ratingRange,
                                        options: column.options,
                                        calculationFormula: column.calculationFormula,
                                        displayOrder: columns.length + 1,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                    };
                                    setColumns((prev) => [...prev, newColumn]);
                                }
                            }
                            setColumnModalOpen(false);
                            setEditingColumn(null);
                        }}
                        onCancel={() => {
                            setColumnModalOpen(false);
                            setEditingColumn(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Row Modal Dialog */}
            <Dialog open={rowModalOpen} onOpenChange={setRowModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingRow ? 'Edit Row' : 'Add Row'}</DialogTitle>
                        <DialogDescription>
                            {editingRow ? 'Update the row properties' : 'Define the evaluation parameter'}
                        </DialogDescription>
                    </DialogHeader>
                    <RowModalForm
                        row={editingRow}
                        isSaving={isSaving}
                        onSave={async (row) => {
                            if (editingRow) {
                                updateRow(editingRow.id, row);
                            } else {
                                // If in edit mode with template ID, call API to add row
                                if (initialTemplate?.id) {
                                    setIsSaving(true);
                                    try {
                                        const newRow = await addRowToTemplate(initialTemplate.id, {
                                            label: row.label || '',
                                            weightage: row.weightage || 0,
                                            displayOrder: rows.length + 1,
                                        });
                                        
                                        if (newRow) {
                                            setRows((prev) => {
                                                const updated = [...prev, newRow];
                                                // Sort by displayOrder
                                                return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                                            });
                                        }
                                    } catch (error) {
                                        console.error('Error adding row to template:', error);
                                    } finally {
                                        setIsSaving(false);
                                    }
                                } else {
                                    // Create mode - just add locally
                                    const newRow: TemplateRow = {
                                        id: `row-${Date.now()}`,
                                        label: row.label || '',
                                        weightage: row.weightage || 0,
                                        displayOrder: rows.length + 1,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                    };
                                    setRows((prev) => [...prev, newRow]);
                                }
                            }
                            setRowModalOpen(false);
                            setEditingRow(null);
                        }}
                        onCancel={() => {
                            setRowModalOpen(false);
                            setEditingRow(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {deleteConfirm?.type === 'column' ? 'Column' : 'Row'}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The {deleteConfirm?.type} will be permanently removed from the template.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (deleteConfirm?.type === 'column') {
                                    await deleteColumn(deleteConfirm.id);
                                } else if (deleteConfirm?.id) {
                                    await deleteRow(deleteConfirm.id);
                                }
                                setDeleteConfirm(null);
                            }}
                            disabled={isSaving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSaving ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
});

TemplateBuilder.displayName = 'TemplateBuilder';

// ============= COLUMN MODAL FORM =============
interface ColumnModalFormProps {
    column: TemplateColumn | null;
    onSave: (column: Partial<TemplateColumn>) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

const ColumnModalForm: React.FC<ColumnModalFormProps> = ({ column, onSave, onCancel, isSaving = false }) => {
    const [name, setName] = useState(column?.name || '');
    const [columnType, setColumnType] = useState<ColumnType>(column?.columnType || 'TEXT');
    const [displayType, setDisplayType] = useState(column?.type || '');
    const [mandatory, setMandatory] = useState(column?.mandatory || false);
    const [minRating, setMinRating] = useState(column?.ratingRange?.min || 1);
    const [maxRating, setMaxRating] = useState(column?.ratingRange?.max || 5);
    const [options, setOptions] = useState<string[]>(column?.options || []);
    const [formula, setFormula] = useState(column?.calculationFormula || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        const columnData: Partial<TemplateColumn> = {
            name: name.trim(),
            columnType,
            type: displayType,
            mandatory,
        };

        if (columnType === 'RATING') {
            columnData.ratingRange = { min: minRating, max: maxRating };
        } else if (columnType === 'SELECT') {
            columnData.options = options.filter(o => o.trim());
        } else if (columnType === 'CALCULATED') {
            columnData.calculationFormula = formula;
        }

        onSave(columnData);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Column name"
                    className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={columnType} onValueChange={(value) => setColumnType(value as ColumnType)}>
                    <SelectTrigger>
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

            <div className="space-y-2">
                <Label>Display Type</Label>
                <Input
                    value={displayType}
                    onChange={(e) => setDisplayType(e.target.value)}
                    placeholder="e.g., Competency, Skill"
                />
            </div>

            {columnType === 'RATING' && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label>Min Rating</Label>
                        <Input
                            type="number"
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Max Rating</Label>
                        <Input
                            type="number"
                            value={maxRating}
                            onChange={(e) => setMaxRating(Number(e.target.value))}
                            min="1"
                        />
                    </div>
                </div>
            )}

            {columnType === 'SELECT' && (
                <div className="space-y-2">
                    <Label>Options (comma-separated)</Label>
                    <Input
                        value={options.join(', ')}
                        onChange={(e) => setOptions(e.target.value.split(',').map(o => o.trim()).filter(Boolean))}
                        placeholder="Option 1, Option 2, Option 3"
                    />
                </div>
            )}

            {columnType === 'CALCULATED' && (
                <div className="space-y-2">
                    <Label>Formula</Label>
                    <Input
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        placeholder="e.g., [column1] + [column2]"
                    />
                </div>
            )}

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="mandatory"
                    checked={mandatory}
                    onCheckedChange={(checked) => setMandatory(checked as boolean)}
                />
                <Label htmlFor="mandatory" className="font-normal">
                    Mandatory Field
                </Label>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button onClick={onCancel} variant="outline" disabled={isSaving}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : column ? 'Update' : 'Create'}
                </Button>
            </div>
        </div>
    );
};

// ============= ROW MODAL FORM =============
interface RowModalFormProps {
    row: TemplateRow | null;
    onSave: (row: Partial<TemplateRow>) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

const RowModalForm: React.FC<RowModalFormProps> = ({ row, onSave, onCancel, isSaving = false }) => {
    const [label, setLabel] = useState(row?.label || '');
    const [weightage, setWeightage] = useState(row?.weightage || 0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!label.trim()) newErrors.label = 'Label is required';
        if (weightage < 0 || weightage > 100) newErrors.weightage = 'Weightage must be between 0 and 100';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        onSave({
            label: label.trim(),
            weightage,
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Row label"
                    className={errors.label ? 'border-destructive' : ''}
                />
                {errors.label && <p className="text-xs text-destructive">{errors.label}</p>}
            </div>

            <div className="space-y-2">
                <Label>Weightage (%) *</Label>
                <Input
                    type="number"
                    value={weightage}
                    onChange={(e) => setWeightage(Number(e.target.value))}
                    min="0"
                    max="100"
                    className={errors.weightage ? 'border-destructive' : ''}
                />
                {errors.weightage && <p className="text-xs text-destructive">{errors.weightage}</p>}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button onClick={onCancel} variant="outline" disabled={isSaving}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : row ? 'Update' : 'Create'}
                </Button>
            </div>
        </div>
    );
};

// ============= COLUMN LIST ITEM =============
interface ColumnListItemProps {
    column: TemplateColumn;
    index: number;
    isEditMode: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onOrderChange: (newOrder: number) => void;
}

const ColumnListItem: React.FC<ColumnListItemProps> = ({
    column,
    index,
    isEditMode,
    onEdit,
    onDelete,
    onOrderChange,
}) => {
    const [orderValue, setOrderValue] = React.useState(column.displayOrder?.toString() || (index + 1).toString());

    const handleOrderBlur = () => {
        const newOrder = parseInt(orderValue, 10);
        if (!isNaN(newOrder) && newOrder > 0 && newOrder !== column.displayOrder) {
            onOrderChange(newOrder);
        } else {
            // Reset to current value if invalid
            setOrderValue(column.displayOrder?.toString() || (index + 1).toString());
        }
    };

    const handleOrderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    React.useEffect(() => {
        setOrderValue(column.displayOrder?.toString() || (index + 1).toString());
    }, [column.displayOrder, index]);
    return (
        <Card key={column.id} className="overflow-hidden border hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    {/* Left: Order Field & Content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-1 pt-1">
                            <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                            {isEditMode ? (
                                <Input
                                    type="number"
                                    value={orderValue}
                                    onChange={(e) => setOrderValue(e.target.value)}
                                    onBlur={handleOrderBlur}
                                    onKeyDown={handleOrderKeyDown}
                                    min="1"
                                    className="h-8 w-14 text-center text-xs font-semibold"
                                    title="Display order"
                                />
                            ) : (
                                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                                    #{index + 1}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                {column.mandatory && (
                                    <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                                        Required
                                    </span>
                                )}
                            </div>
                            <h4 className="font-semibold text-base mb-2 truncate">{column.name}</h4>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground">Type</span>
                                    <p className="font-medium text-sm">{column.columnType}</p>
                                </div>
                                {column.type && (
                                    <div>
                                        <span className="text-xs text-muted-foreground">Display Type</span>
                                        <p className="font-medium text-sm truncate">{column.type}</p>
                                    </div>
                                )}
                                {column.ratingRange && (
                                    <div>
                                        <span className="text-xs text-muted-foreground">Rating Range</span>
                                        <p className="font-medium text-sm">
                                            {column.ratingRange.min} - {column.ratingRange.max}
                                        </p>
                                    </div>
                                )}
                                {column.options && column.options.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="text-xs text-muted-foreground">Options</span>
                                        <p className="font-medium text-sm truncate">{column.options.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col gap-1.5">
                        <Button
                            onClick={onEdit}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            title="Edit column"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            onClick={onDelete}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                            title="Delete column"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ============= ROW LIST ITEM =============
interface RowListItemProps {
    row: TemplateRow;
    index: number;
    isEditMode: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onOrderChange: (newOrder: number) => void;
}

const RowListItem: React.FC<RowListItemProps> = ({
    row,
    index,
    isEditMode,
    onEdit,
    onDelete,
    onOrderChange,
}) => {
    const [orderValue, setOrderValue] = React.useState(row.displayOrder?.toString() || (index + 1).toString());

    const handleOrderBlur = () => {
        const newOrder = parseInt(orderValue, 10);
        if (!isNaN(newOrder) && newOrder > 0 && newOrder !== row.displayOrder) {
            onOrderChange(newOrder);
        } else {
            // Reset to current value if invalid
            setOrderValue(row.displayOrder?.toString() || (index + 1).toString());
        }
    };

    const handleOrderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    React.useEffect(() => {
        setOrderValue(row.displayOrder?.toString() || (index + 1).toString());
    }, [row.displayOrder, index]);
    return (
        <Card key={row.id} className="overflow-hidden border hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    {/* Left: Order Field & Content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-1 pt-1">
                            <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                            {isEditMode ? (
                                <Input
                                    type="number"
                                    value={orderValue}
                                    onChange={(e) => setOrderValue(e.target.value)}
                                    onBlur={handleOrderBlur}
                                    onKeyDown={handleOrderKeyDown}
                                    min="1"
                                    className="h-8 w-14 text-center text-xs font-semibold"
                                    title="Display order"
                                />
                            ) : (
                                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                                    #{index + 1}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base mb-3">{row.label}</h4>
                            
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground">Weightage</span>
                                    <p className="font-medium text-sm">{row.weightage || 0}%</p>
                                </div>
                                {row.displayOrder && (
                                    <div>
                                        <span className="text-xs text-muted-foreground">Display Order</span>
                                        <p className="font-medium text-sm">{row.displayOrder}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col gap-1.5">
                        <Button
                            onClick={onEdit}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            title="Edit row"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            onClick={onDelete}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                            title="Delete row"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
