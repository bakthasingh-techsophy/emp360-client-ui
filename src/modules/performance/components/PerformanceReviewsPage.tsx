/**
 * Main Performance Reviews Page Component
 * Orchestrates all views based on user role
 */

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { UserRole, PerformanceTemplate, PerformanceReviewRequest } from '../types';
import { usePerformanceReview } from '../context/PerformanceReviewContext';
import { mockUsers } from '../dummy-data';
import { filterRequestsByRole } from '../utils/rbac';

import { TemplateBuilder } from './TemplateBuilder';
import { TemplateManagement } from './TemplateManagement';
import { ReviewForm } from './ReviewForm';
import { RequestList } from './RequestList';
import { RoleProfileSwitcher } from './RoleProfileSwitcher';

type ViewMode = 'list' | 'form' | 'builder' | 'management';

export const PerformanceReviewsPage: React.FC = () => {
    // ============= STATE =============
    const {
        templates,
        requests,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        updateRequest,
        getTemplateById,
        freezeRequest,
        revokeRequest,
        submitToManager,
        submitToHR,
        saveDraft,
    } = usePerformanceReview();

    // Development: Role switcher
    const [currentUserId, setCurrentUserId] = useState('emp-001');

    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedRequest, setSelectedRequest] = useState<PerformanceReviewRequest | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<PerformanceTemplate | null>(null);

    // ============= DERIVED STATE =============
    const currentUser = useMemo(() => {
        return mockUsers.find((u) => u.id === currentUserId);
    }, [currentUserId]);

    const userRole = currentUser?.role || 'EMPLOYEE';

    const dynamicRequests = useMemo(() => {
        return filterRequestsByRole(requests, userRole, currentUserId);
    }, [requests, userRole, currentUserId]);



    const templatesMap = useMemo(() => {
        const map = new Map<string, PerformanceTemplate>();
        templates.forEach((t) => map.set(t.id, t));
        return map;
    }, [templates]);

    // ============= ROLE CHANGE HANDLER =============
    const handleRoleChange = (_role: UserRole, userId: string) => {
        setCurrentUserId(userId);
        const newUser = mockUsers.find((u) => u.id === userId);
        if (newUser?.role === 'HR') {
            setViewMode('management');
        } else {
            setViewMode('list');
        }
        setSelectedRequest(null);
    };

    // ============= REQUEST ACTIONS =============
    const handleEditRequest = (request: PerformanceReviewRequest) => {
        setSelectedRequest(request);
        setViewMode('form');
    };

    const handleSaveRequest = (values: any) => {
        if (selectedRequest) {
            // Save draft
            saveDraft(selectedRequest.id, values);
        }
    };

    const handleSubmitRequest = (values: any) => {
        if (selectedRequest) {
            const updatedRequest: PerformanceReviewRequest = {
                ...selectedRequest,
                values,
                updatedAt: new Date().toISOString(),
            };

            if (userRole === 'EMPLOYEE') {
                submitToManager(updatedRequest.id);
            } else if (userRole === 'REPORTING_MANAGER') {
                submitToHR(updatedRequest.id);
            }

            updateRequest(updatedRequest);
            setViewMode('list');
            setSelectedRequest(null);
        }
    };

    const handleFreezeRequest = (requestId: string) => {
        freezeRequest(requestId);
    };

    const handleRevokeRequest = (requestId: string) => {
        revokeRequest(requestId);
    };

    // ============= TEMPLATE ACTIONS =============
    const handleCreateTemplate = () => {
        setSelectedTemplate(null);
        setViewMode('builder');
    };

    const handleEditTemplate = (template: PerformanceTemplate) => {
        setSelectedTemplate(template);
        setViewMode('builder');
    };

    const handleSaveTemplate = (template: PerformanceTemplate) => {
        if (selectedTemplate) {
            updateTemplate(template);
        } else {
            addTemplate(template);
        }
        setViewMode('management');
        setSelectedTemplate(null);
    };

    const handleDeleteTemplate = (templateId: string) => {
        deleteTemplate(templateId);
    };

    const handleToggleTemplateStatus = (templateId: string) => {
        const template = getTemplateById(templateId);
        if (template) {
            updateTemplate({
                ...template,
                templateStatus: !template.templateStatus,
            });
        }
    };

    // ============= RENDER =============

    // Auto-direct HR to management view
    if (userRole === 'HR' && viewMode === 'list') {
        setViewMode('management');
    }

    // Form View
    if (viewMode === 'form' && selectedRequest) {
        const template = getTemplateById(selectedRequest.templateId);
        if (!template) return null;

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Performance Review</h1>
                    <RoleProfileSwitcher
                        currentRole={userRole}
                        currentUserId={currentUserId}
                        onRoleChange={handleRoleChange}
                    />
                </div>

                <ReviewForm
                    request={selectedRequest}
                    template={template}
                    currentUserRole={userRole}
                    currentUserId={currentUserId}
                    onSave={handleSaveRequest}
                    onSubmit={handleSubmitRequest}
                    onCancel={() => {
                        setViewMode('list');
                        setSelectedRequest(null);
                    }}
                />
            </div>
        );
    }

    // Builder View (HR)
    if (viewMode === 'builder' && userRole === 'HR') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {selectedTemplate ? 'Edit Template' : 'Create Template'}
                    </h1>
                    <RoleProfileSwitcher
                        currentRole={userRole}
                        currentUserId={currentUserId}
                        onRoleChange={handleRoleChange}
                    />
                </div>

                <TemplateBuilder
                    initialTemplate={selectedTemplate || undefined}
                    onSave={handleSaveTemplate}
                    onCancel={() => {
                        setViewMode('management');
                        setSelectedTemplate(null);
                    }}
                />
            </div>
        );
    }

    // Template Management View (HR)
    if (viewMode === 'management' && userRole === 'HR') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Performance Reviews</h1>
                    </div>
                    <RoleProfileSwitcher
                        currentRole={userRole}
                        currentUserId={currentUserId}
                        onRoleChange={handleRoleChange}
                    />
                </div>

                <Tabs defaultValue="templates" className="w-full">
                    <TabsList>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="requests">All Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates">
                        <TemplateManagement
                            templates={templates}
                            onCreateNew={handleCreateTemplate}
                            onEdit={handleEditTemplate}
                            onDelete={handleDeleteTemplate}
                            onToggleStatus={handleToggleTemplateStatus}
                        />
                    </TabsContent>

                    <TabsContent value="requests">
                        <RequestList
                            requests={dynamicRequests}
                            templates={templatesMap}
                            currentUserRole={userRole}
                            currentUserId={currentUserId}
                            onEdit={handleEditRequest}
                            onFreeze={handleFreezeRequest}
                            onRevoke={handleRevokeRequest}
                            onExport={() => alert('Export feature coming soon!')}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    // List View (Employee, Manager)
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Performance Reviews</h1>
                    <p className="text-muted-foreground">
                        {userRole === 'EMPLOYEE' &&
                            'View and complete your performance reviews'}
                        {userRole === 'REPORTING_MANAGER' &&
                            'Review your team members\' performance submissions'}
                        {userRole === 'HR' &&
                            'Manage performance reviews across the organization'}
                    </p>
                </div>
                <RoleProfileSwitcher
                    currentRole={userRole}
                    currentUserId={currentUserId}
                    onRoleChange={handleRoleChange}
                />
            </div>

            {/* Info Alert for Employee */}
            {userRole === 'EMPLOYEE' && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You can fill and submit your performance reviews. After submission to your manager, you
                        cannot edit until they return it for revision.
                    </AlertDescription>
                </Alert>
            )}

            {/* Info Alert for Manager */}
            {userRole === 'REPORTING_MANAGER' && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You can view your team members' submissions and add your evaluation. Submit to HR when
                        complete.
                    </AlertDescription>
                </Alert>
            )}

            {/* Tabs for Manager (My Requests + Team Requests are in RequestList) */}
            {userRole === 'REPORTING_MANAGER' && (
                <RequestList
                    requests={dynamicRequests}
                    templates={templatesMap}
                    currentUserRole={userRole}
                    currentUserId={currentUserId}
                    onEdit={handleEditRequest}
                />
            )}

            {/* Simple list for Employee and HR */}
            {(userRole === 'EMPLOYEE' || userRole === 'HR') && (
                <RequestList
                    requests={dynamicRequests}
                    templates={templatesMap}
                    currentUserRole={userRole}
                    currentUserId={currentUserId}
                    onEdit={handleEditRequest}
                    onFreeze={handleFreezeRequest}
                    onRevoke={handleRevokeRequest}
                />
            )}
        </div>
    );
};
