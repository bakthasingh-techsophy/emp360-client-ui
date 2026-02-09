/**
 * Space Creation Form Component
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

interface SpaceCreationFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function SpaceCreationForm({ onSuccess, onBack }: SpaceCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createSpace } = useSpace();

  const form = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      spaceId: '',
      spaceName: '',
      address: '',
      description: '',
    },
  });

  const onSubmit = async (data: SpaceFormValues) => {
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();

      // Create space carrier
      const spaceCarrier: SpaceCarrier = {
        id: data.spaceId,
        spaceName: data.spaceName,
        address: data.address,
        description: data.description,
        ownerId: 'COMPANY-ID', // TODO: Get from company context
        ownerCompany: 'Your Company Name', // TODO: Get from company context
        createdAt: now,
      };

      // Create space using context
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

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create space. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onBack();
  };

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto p-4">
        <div className="space-y-6 pb-32">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Space</h1>
              <p className="text-muted-foreground mt-1">Set up your visitor management space</p>
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
                        {...field}
                        onChange={(e) => {
                          const transformed = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '_')
                            .replace(/[^a-z_]/g, '');
                          field.onChange(transformed);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Database-safe identifier using only lowercase letters and underscores. Spaces will be converted to underscores.
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
                      <Input placeholder="e.g., Tech Tower Reception" {...field} />
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
            <FormActionBar
              mode="create"
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
              submitText="Create Space"
            />
          </form>
        </Form>
        </div>
      </div>
    </PageLayout>
  );
}