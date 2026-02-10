/**
 * Approval Workflow Tab
 * Manage expense approval workflow configuration
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ApprovalWorkflowConfig, ApprovalLevel } from '../../types/settings.types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const approvalLevelSchema = z.object({
  id: z.string().min(1, 'Level ID is required'),
  level: z.number().min(1, 'Level must be at least 1'),
  roleName: z.string().min(1, 'Role name is required'),
  threshold: z.number().min(0, 'Threshold must be 0 or greater'),
});

const approvalWorkflowSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  levels: z.array(approvalLevelSchema).min(1, 'At least one approval level is required'),
});

type ApprovalWorkflowFormData = z.infer<typeof approvalWorkflowSchema>;

export function ApprovalWorkflowTab() {
  const { toast } = useToast();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [workflows, setWorkflows] = useState<ApprovalWorkflowConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ApprovalWorkflowFormData>({
    resolver: zodResolver(approvalWorkflowSchema),
    defaultValues: {
      workflowId: '',
      name: '',
      description: '',
      levels: [],
    },
  });

  // Load approval workflows on mount
  const loadWorkflows = async () => {
    setIsLoadingInitial(true);
    try {
      // Mock data - replace with actual API call
      const mockWorkflows: ApprovalWorkflowConfig[] = [
        {
          id: 'WORKFLOW_001',
          workflowId: 'WORKFLOW_001',
          name: 'Standard Approval Workflow',
          description: 'Default approval workflow for expenses',
          levels: [
            { id: 'LEVEL_001', level: 1, roleName: 'Manager', threshold: 5000 },
            { id: 'LEVEL_002', level: 2, roleName: 'Finance', threshold: 25000 },
            { id: 'LEVEL_003', level: 3, roleName: 'Director', threshold: 100000 },
          ],
        },
      ];
      setWorkflows(mockWorkflows);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load approval workflows',
        variant: 'destructive',
      });
    }
    setIsLoadingInitial(false);
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleEditWorkflow = (workflow: ApprovalWorkflowConfig) => {
    form.reset(workflow);
    setEditingId(workflow.id);
  };

  const handleAddLevel = () => {
    const currentLevels = form.getValues('levels');
    const newLevel: ApprovalLevel = {
      id: `LEVEL_${Date.now()}`,
      level: currentLevels.length + 1,
      roleName: '',
      threshold: 0,
    };
    form.setValue('levels', [...currentLevels, newLevel]);
  };

  const handleRemoveLevel = (levelId: string) => {
    const currentLevels = form.getValues('levels');
    const filtered = currentLevels
      .filter((l) => l.id !== levelId)
      .map((l, idx) => ({ ...l, level: idx + 1 }));
    form.setValue('levels', filtered);
  };

  const onSubmit = async (data: ApprovalWorkflowFormData) => {
    try {
      const newWorkflow: ApprovalWorkflowConfig = {
        id: editingId || `WORKFLOW_${Date.now()}`,
        workflowId: data.workflowId,
        name: data.name,
        description: data.description,
        levels: data.levels,
      };

      if (editingId) {
        // Update existing workflow
        setWorkflows(
          workflows.map((w) => (w.id === editingId ? newWorkflow : w))
        );
        toast({
          title: 'Success',
          description: 'Approval workflow updated successfully',
        });
      } else {
        // Add new workflow
        setWorkflows([...workflows, newWorkflow]);
        toast({
          title: 'Success',
          description: 'Approval workflow created successfully',
        });
      }
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save approval workflow',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      setWorkflows(workflows.filter((w) => w.id !== id));
      toast({
        title: 'Success',
        description: 'Approval workflow deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete approval workflow',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingInitial) {
    return <div>Loading...</div>;
  }

  const levels = form.watch('levels');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">

      {/* Existing Workflows List */}
      {workflows.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Configured Workflows</h3>
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium">{workflow.name}</h4>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {workflow.levels.map((level: ApprovalLevel) => (
                      <div
                        key={level.id}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"
                      >
                        <span className="font-medium">Level {level.level}:</span>
                        <span>{level.roleName}</span>
                        <span className="text-muted-foreground">({level.threshold}+)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWorkflow(workflow)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Workflow Form */}
      <Card className="p-6">
        <h3 className="text-base font-medium mb-4">
          {editingId ? 'Edit Workflow' : 'Add New Workflow'}
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workflow name..." {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workflow description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Approval Levels */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Approval Levels</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLevel}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Level
                </Button>
              </div>

              {levels.map((level, index) => (
                <Card key={level.id} className="p-4 bg-muted/50">
                  <div className="flex items-end gap-3">
                    <FormField
                      control={form.control}
                      name={`levels.${index}.level`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Level</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`levels.${index}.roleName`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Manager, Finance..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`levels.${index}.threshold`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Threshold Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Minimum amount for this approval level
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {levels.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveLevel(level.id)}
                        className="mb-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button type="submit">
                {editingId ? 'Update Workflow' : 'Create Workflow'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
