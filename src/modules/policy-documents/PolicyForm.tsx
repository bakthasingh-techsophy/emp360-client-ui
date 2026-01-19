/**
 * Policy Form Page - Create/Edit Policy
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Upload, 
  Link as LinkIcon, 
  ArrowLeft,
  History,
  Eye,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Policy, PolicyFormData } from './types';
import { POLICY_CATEGORY_LABELS, FILE_TYPE_ICONS } from './constants';
import { mockPolicies } from './mockData';

const policyFormSchema = z.object({
  name: z.string().min(3, 'Policy name must be at least 3 characters'),
  description: z.string().optional(),
  category: z.enum(['hr', 'it', 'security', 'compliance', 'general', 'safety']),
  status: z.enum(['draft', 'published', 'archived']),
  versionNumber: z.string().min(1, 'Version is required'),
  sourceType: z.enum(['upload', 'url']),
  documentId: z.string().optional(),
  documentUrl: z.string().optional(),
  fileType: z.enum(['pdf', 'docx']).optional(),
  changeNotes: z.string().optional(),
  effectiveDate: z.date({
    required_error: 'Effective date is required',
  }),
  expiryDate: z.date().optional(),
  mandatory: z.boolean().default(false),
});

export function PolicyForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'create' | 'edit') || 'create';
  const policyId = searchParams.get('id');

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [sourceType, setSourceType] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'general',
      status: 'draft',
      versionNumber: '1.0',
      sourceType: 'upload',
      effectiveDate: new Date(),
      mandatory: false,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && policyId) {
      const foundPolicy = mockPolicies.find((p: Policy) => p.id === policyId);
      if (foundPolicy) {
        setPolicy(foundPolicy);
        const latestVersion = foundPolicy.versions[0];
        form.reset({
          name: foundPolicy.name,
          description: foundPolicy.description || '',
          category: foundPolicy.category,
          status: foundPolicy.status,
          versionNumber: foundPolicy.currentVersion,
          sourceType: latestVersion.sourceType,
          documentId: latestVersion.documentId || '',
          documentUrl: latestVersion.documentUrl || '',
          fileType: latestVersion.fileType,
          changeNotes: '',
          effectiveDate: new Date(foundPolicy.effectiveDate),
          expiryDate: foundPolicy.expiryDate ? new Date(foundPolicy.expiryDate) : undefined,
          mandatory: foundPolicy.mandatory || false,
        });
        setSourceType(latestVersion.sourceType);
      }
    }
  }, [mode, policyId, form]);

  const handleSubmit = (data: PolicyFormData) => {
    setIsSubmitting(true);
    console.log('Form submitted:', data);
    // API call here
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/policy-library');
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/policy-library');
  };

  const handleViewVersion = (versionNumber: string) => {
    const version = policy?.versions.find((v: any) => v.versionNumber === versionNumber);
    if (version?.documentUrl) {
      window.open(version.documentUrl, '_blank');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Policy' : 'Upload Policy'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === 'edit' ? `Update: ${policy?.name || ''}` : 'Create a new policy document'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pb-24">
          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Basic Information</h3>
            
            {/* Policy Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel className="text-xs">Policy Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Code of Conduct" 
                      className="text-sm h-9"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel className="text-xs">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the policy..."
                      className="text-sm min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(POLICY_CATEGORY_LABELS).map(([key, label]: [string, any]) => (
                          <SelectItem key={key} value={key} className="text-sm">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft" className="text-sm">Draft</SelectItem>
                        <SelectItem value="published" className="text-sm">Publish</SelectItem>
                        <SelectItem value="archived" className="text-sm">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value === 'published' && (
                      <FormDescription className="text-xs">
                        ✉️ Notifications will be sent to users
                      </FormDescription>
                    )}
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Version Information */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Version Information
            </h3>

            <FormField
              control={form.control}
              name="versionNumber"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel className="text-xs">Version Number *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 1.0, 2.3" 
                      className="text-sm h-9"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Use semantic versioning (e.g., 1.0, 1.1, 2.0)
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="changeNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Change Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What changed in this version?"
                      className="text-sm min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Describe what's new or changed
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </Card>

          {/* Document Source */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Document Source</h3>
            
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant={sourceType === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSourceType('upload');
                  form.setValue('sourceType', 'upload');
                }}
                className="flex items-center gap-2 h-8 text-xs"
              >
                <Upload className="h-3 w-3" />
                Upload File
              </Button>
              <Button
                type="button"
                variant={sourceType === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSourceType('url');
                  form.setValue('sourceType', 'url');
                }}
                className="flex items-center gap-2 h-8 text-xs"
              >
                <LinkIcon className="h-3 w-3" />
                External URL
              </Button>
            </div>

            {sourceType === 'upload' ? (
              <FormField
                control={form.control}
                name="documentId"
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
                              field.onChange(`DOC-${Date.now()}`);
                              form.setValue('documentUrl', file.name);
                              form.setValue('fileType', file.name.endsWith('.pdf') ? 'pdf' : 'docx');
                            }
                          }}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <p className="text-sm font-medium mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF or DOCX (MAX. 10MB)
                          </p>
                        </label>
                        {form.watch('documentUrl') && (
                          <div className="mt-3 p-2 bg-muted rounded-md">
                            <p className="text-sm font-medium text-primary">
                              {form.watch('documentUrl')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Document ID: {field.value}
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="documentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/policy.pdf"
                        className="text-sm h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Enter the URL to an external policy document
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
          </Card>

          {/* Dates */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Effective Dates</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs">Effective Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-9 pl-3 text-left font-normal text-sm',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick date</span>
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
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs">Expiry Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-9 pl-3 text-left font-normal text-sm',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick date</span>
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
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Mandatory Checkbox */}
            <FormField
              control={form.control}
              name="mandatory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 mt-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs">
                      Mandatory Policy
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Mark this policy as mandatory for all employees
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </Card>

          {/* Version History - Only in Edit Mode */}
          {mode === 'edit' && policy && (
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Version History
              </h3>
              <div className="space-y-2">
                {policy.versions.map((version: any, index: number) => (
                  <div
                    key={version.versionNumber}
                    className={cn(
                      'p-3 rounded-lg border text-xs',
                      index === 0 ? 'bg-primary/5 border-primary' : 'bg-muted/30'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {FILE_TYPE_ICONS[version.fileType || 'pdf']}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">
                            Version {version.versionNumber}
                          </p>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground mb-2">
                      <p>
                        <strong>Source:</strong> {version.sourceType === 'upload' ? '📄 Uploaded' : '🔗 URL'}
                      </p>
                      {version.documentId && (
                        <p>
                          <strong>Doc ID:</strong> {version.documentId}
                        </p>
                      )}
                      {version.fileSize && (
                        <p>
                          <strong>Size:</strong> {formatFileSize(version.fileSize)}
                        </p>
                      )}
                      <p>
                        <strong>By:</strong> {version.uploadedByName}
                      </p>
                      <p>
                        <strong>Date:</strong>{' '}
                        {format(new Date(version.uploadedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    {version.changeNotes && (
                      <p className="text-xs text-muted-foreground italic mb-2 p-2 bg-background/50 rounded">
                        "{version.changeNotes}"
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewVersion(version.versionNumber)}
                        className="flex-1 h-7 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewVersion(version.versionNumber)}
                        className="flex-1 h-7 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Form Action Bar */}
          <FormActionBar
            mode={mode}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitText={mode === 'edit' ? 'Update Policy' : 'Create Policy'}
          />
        </form>
      </Form>
    </div>
  );
}
