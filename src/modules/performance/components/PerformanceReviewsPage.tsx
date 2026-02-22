/**
 * Main Performance Reviews Page Component
 * Simplified for admin view - shows all functionality
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PerformanceTemplate } from '../types';
import { usePerformance } from '@/contexts/PerformanceContext';
import { TemplateManagement } from './TemplateManagement';
import { MySubmissions } from './MySubmissions';

export const PerformanceReviewsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ============= STATE =============
    const { deletePerformanceTemplateById } = usePerformance();

    // UI State
    const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'templates');

    // ============= TEMPLATE ACTIONS =============
    const handleCreateTemplate = () => {
        navigate('/performance-reviews/templates?mode=create');
    };

    const handleEditTemplate = (template: PerformanceTemplate) => {
        navigate(`/performance-reviews/templates?mode=edit&id=${template.id}`);
    };

    const handleDeleteTemplate = async (templateId: string) => {
        await deletePerformanceTemplateById(templateId);
    };

    // ============= RENDER =============
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Performance Reviews</h1>
                    <p className="text-muted-foreground">
                        Manage performance reviews, templates, and submissions
                    </p>
                </div>
                {/* Create Template Button - Right aligned */}
                {activeTab === 'templates' && (
                    <Button
                        onClick={handleCreateTemplate}
                        className="gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Create Template
                    </Button>
                )}
            </div>

            {/* Tabs with Create Template Button */}
            <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={(tab) => {
                    setActiveTab(tab);
                    navigate(`/performance-reviews?tab=${tab}`);
                }} className="flex-1">
                    <TabsList>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
                        <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
                    </TabsList>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="mt-4">
                        <TemplateManagement
                            onEdit={handleEditTemplate}
                            onDelete={handleDeleteTemplate}
                        />
                    </TabsContent>

                    {/* All Reviews Tab */}
                    <TabsContent value="all-reviews" className="mt-4">
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-muted-foreground">Review requests feature coming soon</p>
                        </div>
                    </TabsContent>

                    {/* My Submissions Tab */}
                    <TabsContent value="my-submissions" className="mt-4">
                        <MySubmissions />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
