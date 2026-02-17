/**
 * Leave Settings Page
 * Manage leave types and configurations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit2, Trash2, CalendarDays, FileX, AlertTriangle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { LeaveConfigurationBasicDetails, LeaveConfigurationBasicDetailsCarrier } from '@/services/leaveConfigurationBasicDetailsService';
import { useLeaveManagement } from '@/contexts/LeaveManagementContext';

// Form schema for basic information
const leaveConfigurationBasicInfoFormSchema = z.object({
  name: z
    .string()
    .min(2, "Leave type name must be at least 2 characters")
    .max(50, "Leave type name cannot exceed 50 characters"),
  code: z
    .string()
    .min(2, "Leave code must be at least 2 characters")
    .max(100, "Leave code cannot exceed 100 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Code must contain only lowercase letters, numbers, and underscores",
    ),
  tagline: z
    .string()
    .min(1, "Tagline is required")
    .max(100, "Tagline cannot exceed 100 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description cannot exceed 500 characters"),
});

type LeaveConfigBasicInfoFormData = z.infer<typeof leaveConfigurationBasicInfoFormSchema>;

export function LeaveSettings() {
  const navigate = useNavigate();
  const { 
    searchLeaveConfigurationBasicDetails, 
    deleteLeaveConfigurationBasicDetailsById,
    createLeaveConfigurationBasicDetails,
    updateLeaveConfigurationBasicDetails,
    getLeaveConfigurationBasicDetailsById,
    isLoading 
  } = useLeaveManagement();

  const [leaveConfigurations, setLeaveConfigurations] = useState<LeaveConfigurationBasicDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string | React.ReactNode;
    action: () => void;
    variant?: 'default' | 'destructive';
    confirmText?: string;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  const form = useForm<LeaveConfigBasicInfoFormData>({
    resolver: zodResolver(leaveConfigurationBasicInfoFormSchema),
    defaultValues: {
      name: "",
      code: "",
      tagline: "",
      description: "",
    },
  });

  // Load leave configurations on mount
  useEffect(() => {
    loadLeaveConfigurations();
  }, []);

  const loadLeaveConfigurations = async () => {
    setLoading(true);
    const result = await searchLeaveConfigurationBasicDetails(
      { filters: {} },
      0,
      100
    );
    if (result) {
      setLeaveConfigurations(result.content);
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/leave-holiday');
  };

  const handleAddLeaveType = () => {
    setModalMode('create');
    setEditingConfigId(null);
    form.reset({
      name: "",
      code: "",
      tagline: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEditLeaveType = async (config: LeaveConfigurationBasicDetails) => {
    setModalMode('edit');
    setEditingConfigId(config.id || null);
    
    // Load full config data
    if (config.id) {
      const fullConfig = await getLeaveConfigurationBasicDetailsById(config.id);
      if (fullConfig) {
        form.reset({
          name: fullConfig.name,
          code: fullConfig.code,
          tagline: fullConfig.tagline || "",
          description: fullConfig.description || "",
        });
      }
    }
    
    setIsModalOpen(true);
  };

  const handleDeleteLeaveType = (config: LeaveConfigurationBasicDetails) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Leave Type',
      description: (
        <div className="space-y-2">
          <p>
            Are you sure you want to delete <strong>{config.name}</strong>?
          </p>
          <p className="text-destructive text-xs">
            This action cannot be undone. The leave type will be permanently removed.
          </p>
        </div>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
      action: async () => {
        const success = await deleteLeaveConfigurationBasicDetailsById(config.id!);
        if (success) {
          loadLeaveConfigurations();
        }
      },
    });
  };

  const handleManageLeaveType = (config: LeaveConfigurationBasicDetails) => {
    navigate(`/leave-type-management?id=${config.id}`);
  };

  const handleModalSubmit = async (data: LeaveConfigBasicInfoFormData) => {
    setIsSubmitting(true);

    try {
      if (modalMode === 'create') {
        const carrier: LeaveConfigurationBasicDetailsCarrier = {
          name: data.name,
          code: data.code,
          tagline: data.tagline,
          description: data.description,
          createdAt: new Date().toISOString(),
        };

        const newConfig = await createLeaveConfigurationBasicDetails(carrier);
        if (newConfig) {
          setIsModalOpen(false);
          loadLeaveConfigurations();
        }
      } else {
        // For update
        const updates: Partial<LeaveConfigurationBasicDetailsCarrier> = {
          name: data.name,
          tagline: data.tagline,
          description: data.description,
        };

        const updated = await updateLeaveConfigurationBasicDetails(
          editingConfigId!,
          updates
        );
        if (updated) {
          setIsModalOpen(false);
          loadLeaveConfigurations();
        }
      }
    } catch (error) {
      console.error("Error submitting leave configuration:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    form.reset();
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Leave Settings</h1>
              <p className="text-muted-foreground mt-1">
                Configure leave types and policies
              </p>
            </div>
          </div>
          <Button onClick={handleAddLeaveType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Leave Type
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="leave-types" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
            <TabsTrigger value="holidays" disabled>Holidays</TabsTrigger>
          </TabsList>

          <TabsContent value="leave-types">
            <Card>
              <CardHeader>
                <CardTitle>Leave Types</CardTitle>
                <CardDescription>
                  Manage different types of leaves available in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading || isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading leave types...</p>
                    </div>
                  </div>
                ) : leaveConfigurations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <FileX className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Leave Types Found</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Get started by creating your first leave type. Add annual leave, sick leave, or any custom leave types your organization needs.
                    </p>
                    <Button onClick={handleAddLeaveType}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Leave Type
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Tagline</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveConfigurations.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `#3b82f620` }}
                              >
                                <CalendarDays 
                                  className="h-5 w-5" 
                                  style={{ color: '#3b82f6' }}
                                />
                              </div>
                              <div>
                                <div className="font-medium">{config.name}</div>
                                {config.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                                    {config.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{config.code}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {config.tagline ? (
                                <span className="text-muted-foreground">{config.tagline}</span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLeaveType(config)}
                                title="Edit basic information"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageLeaveType(config)}
                              >
                                Manage
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLeaveType(config)}
                                disabled={isLoading}
                                title="Delete leave type"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays">
            <Card>
              <CardHeader>
                <CardTitle>Holiday Configuration</CardTitle>
                <CardDescription>
                  Manage public holidays and restricted holidays (Coming soon)
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leave Type Modal */}
        <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'create' ? 'Add Leave Type' : 'Edit Leave Type'}
              </DialogTitle>
              <DialogDescription>
                {modalMode === 'create' 
                  ? 'Create a new leave type with basic information' 
                  : 'Update leave type basic information'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleModalSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Annual Leave" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Code *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., annual_leave"
                            maxLength={100}
                            disabled={modalMode === 'edit'}
                            {...field}
                            onChange={(e) => {
                              const transformed = e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, '_')
                                .replace(/[^a-z0-9_]/g, '');
                              field.onChange(transformed);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline *</FormLabel>
                        <FormControl>
                          <Input placeholder="Short tagline..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleModalClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Update'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          onConfirm={confirmDialog.action}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          icon={confirmDialog.variant === 'destructive' ? <AlertTriangle className="h-10 w-10 text-destructive" /> : undefined}
        />
      </div>
    </PageLayout>
  );
}
