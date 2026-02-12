/**
 * Performance Review Form Component
 * Handles employee, manager, and HR views with RBAC
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    PerformanceTemplate,
    PerformanceReviewRequest,
    ReviewCellValue,
    UserRole,
} from '../types';
import {
    canEditColumn,
    canEditRequest,
    shouldMaskCellValues,
    getVisibleColumns,
    getStatusLabel,
} from '../utils/rbac';

interface ReviewFormProps {
    request: PerformanceReviewRequest;
    template: PerformanceTemplate;
    currentUserRole: UserRole;
    currentUserId: string;
    onSave: (values: ReviewCellValue[]) => void;
    onSubmit: (values: ReviewCellValue[]) => void;
    onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    request,
    template,
    currentUserRole,
    currentUserId,
    onSave,
    onSubmit,
    onCancel,
}) => {
    const [values, setValues] = useState<Map<string, ReviewCellValue>>(new Map());
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    // Initialize form values from request
    useEffect(() => {
        const valueMap = new Map<string, ReviewCellValue>();
        request.values.forEach((val) => {
            valueMap.set(`${val.rowId}-${val.columnId}`, val);
        });
        setValues(valueMap);
    }, [request]);

    const canEdit = canEditRequest(request, currentUserRole, currentUserId);
    const maskValues = shouldMaskCellValues(currentUserRole);
    const visibleColumns = getVisibleColumns(template.columns, currentUserRole, request.status);

    // ============= VALUE MANAGEMENT =============
    const updateValue = (rowId: string, columnId: string, value: string | number) => {
        const key = `${rowId}-${columnId}`;

        const newValue: ReviewCellValue = {
            rowId,
            columnId,
            value,
            editedBy: currentUserId,
            editedAt: new Date().toISOString(),
        };

        setValues(new Map(values.set(key, newValue)));
    };

    const getValue = (rowId: string, columnId: string): string | number => {
        const key = `${rowId}-${columnId}`;
        return values.get(key)?.value ?? '';
    };

    // ============= SAVE & SUBMIT =============
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
            const allValues = Array.from(values.values());
            onSave(allValues);
            setLastSaved(new Date().toLocaleTimeString());
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!confirm(`Submit to ${currentUserRole === 'EMPLOYEE' ? 'Manager' : 'HR'}?`)) {
            return;
        }
        const allValues = Array.from(values.values());
        onSubmit(allValues);
    };

    // ============= RENDER CELL INPUT =============
    const renderCellInput = (row: typeof template.rows[0], column: typeof template.columns[0]) => {
        const isEditable = canEdit && canEditColumn(column, currentUserRole);
        const value = getValue(row.id, column.id);
        const displayValue = maskValues ? (isEditable ? '' : '***') : value;

        if (column.type === 'CALCULATED') {
            // Calculate average for calculated columns
            const rowValues = Array.from(values.values())
                .filter((v) => v.rowId === row.id && template.columns.find((c) => c.id === v.columnId)?.type === 'RATING')
                .map((v) => Number(v.value))
                .filter((v) => !isNaN(v));
            const avg = rowValues.length > 0 ? (rowValues.reduce((a, b) => a + b, 0) / rowValues.length).toFixed(2) : '-';
            return (
                <TableCell className="font-semibold text-center">
                    {maskValues ? '***' : avg}
                </TableCell>
            );
        }

        if (!isEditable) {
            return (
                <TableCell className="text-center text-muted-foreground">
                    {displayValue === '' ? '-' : displayValue}
                </TableCell>
            );
        }

        switch (column.type) {
            case 'RATING':
                return (
                    <TableCell className="text-center">
                        <Select value={value ? String(value) : 'unset'} onValueChange={(v) => updateValue(row.id, column.id, v === 'unset' ? '' : Number(v))}>
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="Rate" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unset">Not Rated</SelectItem>
                                {Array.from(
                                    { length: (column.ratingRange?.max || 5) - (column.ratingRange?.min || 1) + 1 },
                                    (_, i) => (column.ratingRange?.min || 1) + i
                                ).map((rating) => (
                                    <SelectItem key={rating} value={String(rating)}>
                                        {rating}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                );

            case 'NUMBER':
                return (
                    <TableCell>
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => updateValue(row.id, column.id, e.target.value ? Number(e.target.value) : '')}
                            className="h-8 text-center"
                        />
                    </TableCell>
                );

            case 'SELECT':
                return (
                    <TableCell>
                        <Select value={String(value)} onValueChange={(v) => updateValue(row.id, column.id, v)}>
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">--</SelectItem>
                                {(column.options || []).map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                );

            case 'TEXT':
                return (
                    <TableCell>
                        <Input
                            value={value}
                            onChange={(e) => updateValue(row.id, column.id, e.target.value)}
                            className="h-8"
                            placeholder="Enter text"
                        />
                    </TableCell>
                );

            default:
                return <TableCell>-</TableCell>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription className="space-y-2">
                        <p>{template.description}</p>
                        <p className="text-sm">
                            <strong>Status:</strong> {getStatusLabel(request.status)}
                        </p>
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Alerts */}
            {maskValues && (
                <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        You can view the final score only. Individual cell values are masked for privacy.
                    </AlertDescription>
                </Alert>
            )}

            {!canEdit && (
                <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        This review is read-only. You cannot make changes at this stage.
                    </AlertDescription>
                </Alert>
            )}

            {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Last saved at {lastSaved}
                </div>
            )}

            {/* Review Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-32">Period</TableHead>
                                    {visibleColumns.map((col) => (
                                        <TableHead key={col.id} className="text-center whitespace-nowrap">
                                            <div className="font-semibold">{col.name}</div>
                                            {col.type === 'RATING' && col.ratingRange && (
                                                <div className="text-xs text-muted-foreground">
                                                    {col.ratingRange.min}-{col.ratingRange.max}
                                                </div>
                                            )}
                                            {canEditColumn(col, currentUserRole) && (
                                                <div className="text-xs font-bold text-blue-600">Editable</div>
                                            )}
                                            {col.mandatory && (
                                                <div className="text-xs text-red-600">*</div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {template.rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">
                                            {row.label}
                                            {row.weightage && (
                                                <div className="text-xs text-muted-foreground">{row.weightage}% weight</div>
                                            )}
                                        </TableCell>
                                        {visibleColumns.map((col) => (
                                            <React.Fragment key={`${row.id}-${col.id}`}>
                                                {renderCellInput(row, col)}
                                            </React.Fragment>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                <Button onClick={onCancel} variant="outline">
                    Cancel
                </Button>
                {canEdit && (
                    <>
                        <Button onClick={handleSave} disabled={isSaving} variant="outline">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            Submit to {currentUserRole === 'EMPLOYEE' ? 'Manager' : 'HR'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
