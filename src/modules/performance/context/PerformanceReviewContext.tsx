/**
 * Performance Reviews Context
 * Manages templates, requests, and score calculations
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    PerformanceTemplate,
    PerformanceReviewRequest,
    ReviewCellValue,
    ScoreCalculationResult,
    RequestFilter,
    ReviewDraft,
    TemplateRow,
    TemplateColumn,
} from '../types';
import { mockTemplates, mockRequests } from '../dummy-data';

interface PerformanceReviewContextType {
    // Templates
    templates: PerformanceTemplate[];
    addTemplate: (template: PerformanceTemplate) => void;
    updateTemplate: (template: PerformanceTemplate) => void;
    deleteTemplate: (templateId: string) => void;
    getTemplateById: (id: string) => PerformanceTemplate | undefined;
    getTemplatesByDepartment: (department: string) => PerformanceTemplate[];

    // Requests
    requests: PerformanceReviewRequest[];
    addRequest: (request: PerformanceReviewRequest) => void;
    updateRequest: (request: PerformanceReviewRequest) => void;
    getRequestById: (id: string) => PerformanceReviewRequest | undefined;
    getRequestsByFilter: (filter: RequestFilter) => PerformanceReviewRequest[];
    getRequestsByEmployee: (employeeId: string) => PerformanceReviewRequest[];
    getRequestsByManager: (managerId: string) => PerformanceReviewRequest[];

    // Drafts
    drafts: Map<string, ReviewDraft>;
    saveDraft: (requestId: string, values: ReviewCellValue[]) => void;
    getDraft: (requestId: string) => ReviewDraft | undefined;
    clearDraft: (requestId: string) => void;

    // Actions
    freezeRequest: (requestId: string) => void;
    revokeRequest: (requestId: string) => void;
    submitToManager: (requestId: string) => void;
    submitToHR: (requestId: string) => void;

    // Score calculation
    calculateScore: (request: PerformanceReviewRequest, template: PerformanceTemplate) => ScoreCalculationResult;
}

const PerformanceReviewContext = createContext<PerformanceReviewContextType | undefined>(undefined);

/**
 * Calculate final score based on weightage and ratings
 */
function calculateFinalScore(
    request: PerformanceReviewRequest,
    template: PerformanceTemplate
): ScoreCalculationResult {
    const breakdown: ScoreCalculationResult['breakdown'] = [];

    // Group values by row
    const valuesByRow = new Map<string, ReviewCellValue[]>();
    request.values.forEach((val: ReviewCellValue) => {
        if (!valuesByRow.has(val.rowId)) {
            valuesByRow.set(val.rowId, []);
        }
        valuesByRow.get(val.rowId)!.push(val);
    });

    // Calculate weighted scores
    let totalWeightage = 0;
    let totalWeightedScore = 0;

    template.rows.forEach((row: TemplateRow) => {
        const rowValues = valuesByRow.get(row.id) || [];
        const ratingValues = rowValues
            .filter((v: ReviewCellValue) => {
                const col = template.columns.find((c: TemplateColumn) => c.id === v.columnId);
                return col?.type === 'RATING';
            })
            .map((v) => Number(v.value))
            .filter((v) => !isNaN(v));

        if (ratingValues.length > 0) {
            const avgRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
            const weightage = row.weightage || 1;

            totalWeightage += weightage;
            totalWeightedScore += avgRating * weightage;

            breakdown.push({
                rowId: row.id,
                label: row.label,
                weightage,
                rating: avgRating,
                contribution: (avgRating * weightage) / 100,
            });
        }
    });

    const finalScore = totalWeightage > 0 ? totalWeightedScore / totalWeightage : 0;

    return {
        finalScore: Math.round(finalScore * 100) / 100,
        breakdown,
    };
}

export const PerformanceReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [templates, setTemplates] = useState<PerformanceTemplate[]>(mockTemplates);
    const [requests, setRequests] = useState<PerformanceReviewRequest[]>(mockRequests);
    const [drafts, setDrafts] = useState<Map<string, ReviewDraft>>(new Map());

    // ============= TEMPLATE OPERATIONS =============
    const getTemplateById = useCallback(
        (id: string) => templates.find((t) => t.id === id),
        [templates]
    );

    const getTemplatesByDepartment = useCallback(
        (department: string) => templates.filter((t) => t.department === department && t.templateStatus),
        [templates]
    );

    const addTemplate = useCallback((template: PerformanceTemplate) => {
        setTemplates((prev) => [...prev, template]);
    }, []);

    const updateTemplate = useCallback((template: PerformanceTemplate) => {
        setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
    }, []);

    const deleteTemplate = useCallback((templateId: string) => {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    }, []);

    // ============= REQUEST OPERATIONS =============
    const getRequestById = useCallback(
        (id: string) => requests.find((r) => r.id === id),
        [requests]
    );

    const getRequestsByFilter = useCallback(
        (filter: RequestFilter) => {
            return requests.filter((req) => {
                if (filter.status && !filter.status.includes(req.status)) return false;
                if (filter.department && req.department !== filter.department) return false;
                if (filter.templateId && req.templateId !== filter.templateId) return false;
                if (filter.search) {
                    const search = filter.search.toLowerCase();
                    return (
                        req.employeeName.toLowerCase().includes(search) ||
                        req.department.toLowerCase().includes(search)
                    );
                }
                return true;
            });
        },
        [requests]
    );

    const getRequestsByEmployee = useCallback(
        (employeeId: string) => requests.filter((r) => r.employeeId === employeeId),
        [requests]
    );

    const getRequestsByManager = useCallback(
        (managerId: string) => requests.filter((r) => r.managerId === managerId),
        [requests]
    );

    const addRequest = useCallback((request: PerformanceReviewRequest) => {
        setRequests((prev) => [...prev, request]);
    }, []);

    const updateRequest = useCallback((request: PerformanceReviewRequest) => {
        setRequests((prev) =>
            prev.map((r) => {
                if (r.id === request.id) {
                    return request;
                }
                return r;
            })
        );
    }, []);

    // ============= DRAFT OPERATIONS =============
    const saveDraft = useCallback((requestId: string, values: ReviewCellValue[]) => {
        setDrafts((prev) => {
            const newDrafts = new Map(prev);
            newDrafts.set(requestId, {
                id: `draft-${requestId}`,
                requestId,
                values,
                lastSavedAt: new Date().toISOString(),
            });
            return newDrafts;
        });
    }, []);

    const getDraft = useCallback((requestId: string) => drafts.get(requestId), [drafts]);

    const clearDraft = useCallback((requestId: string) => {
        setDrafts((prev) => {
            const newDrafts = new Map(prev);
            newDrafts.delete(requestId);
            return newDrafts;
        });
    }, []);

    // ============= STATUS ACTIONS =============
    const freezeRequest = useCallback((requestId: string) => {
        updateRequest(
            requests.find((r) => r.id === requestId)
                ? { ...getRequestById(requestId)!, status: 'FREEZED', updatedAt: new Date().toISOString() }
                : getRequestById(requestId)!
        );
    }, [updateRequest, requests, getRequestById]);

    const revokeRequest = useCallback((requestId: string) => {
        const req = getRequestById(requestId);
        if (req) {
            updateRequest({ ...req, status: 'REVOKED', updatedAt: new Date().toISOString() });
        }
    }, [updateRequest, getRequestById]);

    const submitToManager = useCallback((requestId: string) => {
        const req = getRequestById(requestId);
        if (req && req.status === 'AT_EMPLOYEE') {
            updateRequest({
                ...req,
                status: 'AT_MANAGER',
                submittedByEmployeeAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            clearDraft(requestId);
        }
    }, [updateRequest, getRequestById, clearDraft]);

    const submitToHR = useCallback((requestId: string) => {
        const req = getRequestById(requestId);
        if (req && req.status === 'AT_MANAGER') {
            updateRequest({
                ...req,
                status: 'AT_HR',
                submittedByManagerAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            clearDraft(requestId);
        }
    }, [updateRequest, getRequestById, clearDraft]);

    // ============= SCORE CALCULATION =============
    const calculateScore = useCallback(
        (request: PerformanceReviewRequest, template: PerformanceTemplate) => {
            return calculateFinalScore(request, template);
        },
        []
    );

    const contextValue: PerformanceReviewContextType = {
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplateById,
        getTemplatesByDepartment,

        requests,
        addRequest,
        updateRequest,
        getRequestById,
        getRequestsByFilter,
        getRequestsByEmployee,
        getRequestsByManager,

        drafts,
        saveDraft,
        getDraft,
        clearDraft,

        freezeRequest,
        revokeRequest,
        submitToManager,
        submitToHR,

        calculateScore,
    };

    return (
        <PerformanceReviewContext.Provider value={contextValue}>
            {children}
        </PerformanceReviewContext.Provider>
    );
};

export const usePerformanceReview = () => {
    const context = useContext(PerformanceReviewContext);
    if (!context) {
        throw new Error('usePerformanceReview must be used within PerformanceReviewProvider');
    }
    return context;
};
