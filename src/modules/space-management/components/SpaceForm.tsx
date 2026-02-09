/**
 * Space Form Component
 * Supports create, edit, and view modes
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/PageLayout';
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceCarrier } from '@/services/spaceService';
import { Space } from '../spaceTypes';

const spaceFormSchema = z.object({
  spaceId: z.string()
    .min(3, 'Space ID must be at least 3 characters')
    .regex(/^[a-z_]+$/, 'Space ID can only contain lowercase letters and underscores')
    .transform(val => val.toLowerCase().replace(/\s+/g, '_')),
  spaceName: z.string().min(3, 'Space name must be at least 3 characters'),
  address: z.string().min(5, 'Address is required'),
  description: z.string().optional(),
});

type SpaceFormValues = z.infer<typeof spaceFormSchema>;

type FormMode = 'create' | 'edit' | 'view';

export function SpaceForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get('mode') || 'create') as FormMode;
  const spaceId = searchParams.get('id');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { createSpace, updateSpace, getSpaceById } = useSpace();

  const form = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      spaceId: '',
      spaceName: '',
      address: '',
      description: '',
    },
  });

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // Load space data for edit/view modes
  useEffect(() => {
    if ((isEditMode || isViewMode) && spaceId) {
      loadSpace(spaceId);
    }
  }, [spaceId, mode]);

  const loadSpace = async (id: string) => {
    setIsLoading(true);
    try {
      const space = await getSpaceById(id);
      if (space) {
        form.reset({
          spaceId: space.id,
          spaceName: space.spaceName,
          address: space.address,
          description: space.description || '',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Space not found',
          variant: 'destructive',
        });
        navigate('/visitor-management/space-management');
      }
    } catch (error) {
      console.error('Failed to load space:', error);
      toast({
        title: 'Error',
        description: 'Failed to load space details',
        variant: 'destructive',
      });
      navigate('/visitor-management/space-management');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SpaceFormValues) => {
    if (isViewMode) return;

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();

      if (mode === 'create') {
        // Create new space
        const spaceCarrier: SpaceCarrier = {
          id: data.spaceId,
          spaceName: data.spaceName,
          address: data.address,
          description: data.description,
          ownerId: 'COMPANY-ID', // TODO: Get from company context
          ownerCompany: 'Your Company Name', // TODO: Get from company context
          createdAt: now,
        };

        const space = await createSpace(spaceCarrier);
        
        if (!space) {
          throw new Error('Failed to create space');
        }

        // Save user's space configuration to localStorage
        localStorage.setItem('visitorManagementSpace', JSON.stringify({
          spaceId: data.spaceId,
          status: 'active',
          isOwner: true,
          joinedAt: now,
        }));

        toast({
          title: 'Space Created Successfully',
          description: `Your space "${data.spaceName}" has been created. Share Space ID "${data.spaceId}" with other companies to let them connect.`,
        });
      } else if (mode === 'edit' && spaceId) {
        // Update existing space
        const updatePayload: Partial<Space> = {
          spaceName: data.spaceName,
          address: data.address,
          description: data.description,
        };

        const updatedSpace = await updateSpace(spaceId, updatePayload);
        
        if (!updatedSpace) {
          throw new Error('Failed to update space');
        }

        toast({
          title: 'Space Updated',
          description: `"${data.spaceName}" has been updated successfully.`,
        });
      }

      // Navigate back to space management
      navigate('/visitor-management/space-management');
    } catch (error) {
      toast({
        title: 'Error',
        description: mode === 'create' ? 'Failed to create space. Please try again.' : 'Failed to update space. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/visitor-management/space-management');
  };

  const handleBack = () => {
    navigate('/visitor-management/space-management');
  };

  const getPageTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Space';
      case 'edit':
        return 'Edit Space';
      case 'view':
        return 'View Space';
      default:
        return 'Space';
    }
  };

  const getPageDescription = () => {
    switch (mode) {
      case 'create':
        return 'Set up your visitor management space';
      case 'edit':
        return 'Update space information';
      case 'view':
        return 'Space details';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading space...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto p-4">
        <div className="space-y-6 pb-32">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
              <p className="text-muted-foreground mt-1">{getPageDescription()}</p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="spaceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Space ID <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., tech_tower_01" 
                          className="font-mono lowercase"
                          disabled={isViewMode || isEditMode} // Space ID cannot be changed after creation
                          {...field}
                          onChange={(e) => {
                            if (!isViewMode && !isEditMode) {
                              const transformed = e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, '_')
                                .replace(/[^a-z_]/g, '');
                              field.onChange(transformed);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditMode || isViewMode 
                          ? 'Space ID cannot be changed after creation'
                          : 'Database-safe identifier using only lowercase letters and underscores. Spaces will be converted to underscores.'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Space Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Tech Tower Reception" 
                          disabled={isViewMode}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A friendly name to identify this space
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full address of the space..."
                          className="min-h-[80px] resize-y"
                          disabled={isViewMode}
                          {...field}
                        />
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
                        <Textarea
                          placeholder="Additional notes about this space..."
                          className="min-h-[100px] resize-y"
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional information for companies connecting to this space
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Action Bar */}
              {!isViewMode && (
                <FormActionBar
                  mode={mode as 'create' | 'edit'}
                  isSubmitting={isSubmitting}
                  onCancel={handleCancel}
                  submitText={mode === 'create' ? 'Create Space' : 'Update Space'}
                />
              )}

              {/* View Mode Actions */}
              {isViewMode && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-10">
                  <div className="container max-w-4xl mx-auto p-4">
                    <div className="flex justify-end gap-4">
                      <Button type="button" variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => navigate(`/visitor-management/space-management/form?mode=edit&id=${spaceId}`)}
                      >
                        Edit Space
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
