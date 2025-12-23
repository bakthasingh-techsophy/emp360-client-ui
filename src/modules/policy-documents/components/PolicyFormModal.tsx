/**
 * Policy Upload/Edit Modal Component
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Link as LinkIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Policy, PolicyFormData } from '../types';
import { POLICY_CATEGORY_LABELS } from '../constants';

const policyFormSchema = z.object({
  name: z.string().min(3, 'Policy name must be at least 3 characters'),
  description: z.string().optional(),
  category: z.enum(['hr', 'it', 'security', 'compliance', 'general', 'safety']),
  status: z.enum(['active', 'draft', 'archived']),
  version: z.string().min(1, 'Version is required'),
  fileUrl: z.string().optional(),
  fileType: z.enum(['pdf', 'docx', 'url']).optional(),
  effectiveDate: z.date({
    required_error: 'Effective date is required',
  }),
  expiryDate: z.date().optional(),
  mandatory: z.boolean().default(false),
});

interface PolicyFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PolicyFormData) => void;
  policy?: Policy | null;
  mode: 'create' | 'edit';
}

export function PolicyFormModal({
  open,
  onClose,
  onSubmit,
  policy,
  mode,
}: PolicyFormModalProps) {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'general',
      status: 'draft',
      version: '1.0',
      effectiveDate: new Date(),
      mandatory: false,
    },
  });

  useEffect(() => {
    if (policy && mode === 'edit') {
      form.reset({
        name: policy.name,
        description: policy.description || '',
        category: policy.category,
        status: policy.status,
        version: policy.version,
        fileUrl: policy.fileUrl || '',
        fileType: policy.fileType,
        effectiveDate: new Date(policy.effectiveDate),
        expiryDate: policy.expiryDate ? new Date(policy.expiryDate) : undefined,
        mandatory: policy.mandatory || false,
      });
      setUploadType(policy.fileType === 'url' ? 'url' : 'file');
    } else {
      form.reset({
        name: '',
        description: '',
        category: 'general',
        status: 'draft',
        version: '1.0',
        effectiveDate: new Date(),
        mandatory: false,
      });
      setUploadType('file');
    }
  }, [policy, mode, form, open]);

  const handleSubmit = (data: PolicyFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" hideClose>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">
            {mode === 'create' ? 'Upload New Policy' : 'Edit Policy'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Policy Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Code of Conduct" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the policy..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(POLICY_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Version */}
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1.0, 2.3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Type Toggle */}
            <div className="space-y-4">
              <FormLabel>Document Source</FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadType === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadType('file')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={uploadType === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadType('url')}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  External URL
                </Button>
              </div>

              {/* File Upload or URL Input */}
              {uploadType === 'file' ? (
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <Input
                            type="file"
                            accept=".pdf,.docx"
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file.name);
                                form.setValue('fileType', file.name.endsWith('.pdf') ? 'pdf' : 'docx');
                              }
                            }}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <p className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF or DOCX (MAX. 10MB)
                            </p>
                          </label>
                          {field.value && (
                            <p className="text-sm mt-2 text-primary">{field.value}</p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/policy.pdf"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('fileType', 'url');
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the URL to an external policy document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Effective Date */}
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Effective Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiry Date */}
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < (form.getValues('effectiveDate') || new Date())
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mandatory Checkbox */}
            <FormField
              control={form.control}
              name="mandatory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mandatory Policy
                    </FormLabel>
                    <FormDescription>
                      Mark this policy as mandatory for all employees
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Upload Policy' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
