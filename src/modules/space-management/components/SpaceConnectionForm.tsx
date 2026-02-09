/**
 * Space Connection Form Component
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/PageLayout';
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationCarrier } from '@/services/notificationApiService';
import { SpaceConnectionRequestMetadata } from '../spaceTypes';

const connectionFormSchema = z.object({
  spaceId: z.string()
    .min(3, 'Space ID must be at least 3 characters')
    .regex(/^[a-z_]+$/, 'Space ID can only contain lowercase letters and underscores')
    .transform(val => val.toLowerCase().replace(/\s+/g, '_')),
  requestMessage: z.string().min(10, 'Please provide a message (minimum 10 characters)'),
});

type ConnectionFormValues = z.infer<typeof connectionFormSchema>;

interface SpaceConnectionFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function SpaceConnectionForm({ onSuccess, onBack }: SpaceConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createNotification } = useNotification();

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      spaceId: '',
      requestMessage: '',
    },
  });

  const onSubmit = async (data: ConnectionFormValues) => {
    setIsSubmitting(true);

    try {
      // Generate timestamp
      const now = new Date().toISOString();

      // Create notification metadata (simplified)
      const metadata: SpaceConnectionRequestMetadata = {
        spaceId: data.spaceId,
        requestingTenantId: 'TENANT-ID', // TODO: Get from auth context
        requestingCompanyId: 'COMPANY-ID', // TODO: Get from company context
      };

      // Create notification carrier for API
      const notificationCarrier: NotificationCarrier<SpaceConnectionRequestMetadata> = {
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'space_connection_request',
        subject: 'New Space Connection Request',
        message: data.requestMessage,
        status: 'unread',
        metadata,
        createdAt: now,
      };

      // Create notification using context
      const notification = await createNotification(notificationCarrier);
      
      if (!notification) {
        throw new Error('Failed to create notification');
      }

      // Save pending request for current company
      localStorage.setItem('visitorManagementSpace', JSON.stringify({
        spaceId: data.spaceId,
        status: 'pending',
        isOwner: false,
        joinedAt: now,
      }));

      toast({
        title: 'Connection Request Sent',
        description: 'Your request has been sent to the space owner. You will be notified once approved.',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send connection request. Please try again.',
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
              <h1 className="text-3xl font-bold tracking-tight">Connect to Existing Space</h1>
              <p className="text-muted-foreground mt-1">Request access to a shared visitor management space</p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need the Space ID from the space owner to connect. Once you submit your request, 
                the space owner will be notified and must approve your connection.
              </AlertDescription>
            </Alert>

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
                      Enter the unique Space ID provided by the space owner (lowercase letters and underscores only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Request Message <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why you want to connect to this space..."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide context about your company and why you need access to this shared space
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* What happens next info */}
            <Alert className="bg-muted/50 border-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">What happens next?</div>
                <ol className="space-y-1.5 text-sm">
                  <li>1. Your connection request will be sent to the space owner</li>
                  <li>2. The space owner will receive a notification to review your request</li>
                  <li>3. Once approved, you'll have access to the shared visitor database</li>
                  <li>4. You can start managing visitors in the shared space</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Form Action Bar */}
            <FormActionBar
              mode="create"
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
              submitText="Send Request"
            />
          </form>
        </Form>
        </div>
      </div>
    </PageLayout>
  );
}
