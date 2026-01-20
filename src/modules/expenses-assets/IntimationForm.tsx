/**
 * Intimation Form - Parent Form Component
 * Main form for creating expense intimation requests
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PageLayout } from '@/components/PageLayout';
import { FormHeader } from '@/components/common/FormHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FormActionBar } from '@/components/common/FormActionBar/FormActionBar';
import { JourneyFormBranch, JourneyFormBranchRef } from './components/JourneyFormBranch';
import { OtherFormBranch } from './components/OtherFormBranch';
import { IntimationFormData, IntimationType, JourneySegment } from './types/intimation.types';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function IntimationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const journeyFormRef = useRef<JourneyFormBranchRef>(null);

  // Initialize form with react-hook-form
  const form = useForm<IntimationFormData>({
    defaultValues: {
      type: 'travel',
      journeySegments: [
        {
          id: `segment-${Date.now()}`,
          from: '',
          to: '',
          fromDate: format(new Date(), 'yyyy-MM-dd'),
          toDate: format(new Date(), 'yyyy-MM-dd'),
          modeOfTransport: '',
          estimatedCost: 0,
          notes: '',
        },
      ],
      description: '',
      additionalNotes: '',
    },
  });

  const { watch, setValue } = form;
  const intimationType = watch('type');
  const journeySegments = watch('journeySegments') || [];
  const description = watch('description') || '';
  const additionalNotes = watch('additionalNotes') || '';

  // Handle type change
  const handleTypeChange = (value: IntimationType) => {
    setValue('type', value);
    
    // Clear errors when changing type
    if (journeyFormRef.current) {
      journeyFormRef.current.clearErrors();
    }
    
    // Reset form fields based on type
    if (value === 'travel') {
      setValue('journeySegments', [
        {
          id: `segment-${Date.now()}`,
          from: '',
          to: '',
          fromDate: format(new Date(), 'yyyy-MM-dd'),
          toDate: format(new Date(), 'yyyy-MM-dd'),
          modeOfTransport: '',
          estimatedCost: 0,
          notes: '',
        },
      ]);
      setValue('description', '');
    } else {
      setValue('journeySegments', []);
      setValue('description', '');
    }
  };

  // Handle journey segments change
  const handleJourneySegmentsChange = (segments: JourneySegment[]) => {
    setValue('journeySegments', segments, { shouldValidate: true });
  };

  // Handle description change (for 'other' type)
  const handleDescriptionChange = (value: string) => {
    setValue('description', value, { shouldValidate: true });
  };

  // Handle additional notes change
  const handleAdditionalNotesChange = (value: string) => {
    setValue('additionalNotes', value, { shouldValidate: true });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    if (intimationType === 'travel') {
      // Use the journey form's validation
      if (journeyFormRef.current) {
        const isValid = journeyFormRef.current.validate();
        if (!isValid) {
          // Scroll to top to show errors
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
      }
    } else if (intimationType === 'other') {
      if (!description || description.trim() === '') {
        toast({
          title: 'Validation Error',
          description: 'Please provide a description for your intimation',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = form.getValues();
      
      // Calculate total estimated cost for travel type
      let totalCost = 0;
      if (intimationType === 'travel' && formData.journeySegments) {
        totalCost = formData.journeySegments.reduce(
          (sum, seg) => sum + Number(seg.estimatedCost || 0),
          0
        );
      }

      // Prepare payload
      const payload = {
        ...formData,
        estimatedTotalCost: intimationType === 'travel' ? totalCost : undefined,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };

      console.log('Intimation Payload:', payload);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'Intimation submitted successfully',
      });

      // Navigate back to list
      navigate('/expense-management');
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit intimation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/expense-management');
  };

  return (
    <PageLayout>
      <div className="flex justify-center px-2 sm:px-4 lg:px-6">
        <div className="w-full max-w-[min(100%,1400px)] space-y-6 pb-24">
          {/* Header */}
          <FormHeader
            title="New Intimation"
            description="Notify the finance team about upcoming expenses for better planning"
            onBack={handleCancel}
          />

          <form className="space-y-6">
            {/* Type Selector */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Intimation Type</Label>
                  <Select value={intimationType} onValueChange={handleTypeChange}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select intimation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the type of intimation you want to submit
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Branch Form Renderer */}
            <div>
              {intimationType === 'travel' && (
                <JourneyFormBranch
                  ref={journeyFormRef}
                  value={journeySegments}
                  onChange={handleJourneySegmentsChange}
                />
              )}
              {intimationType === 'other' && (
                <OtherFormBranch
                  value={description}
                  onChange={handleDescriptionChange}
                />
              )}
            </div>

            {/* Additional Notes */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any additional information or context..."
                    value={additionalNotes}
                    onChange={(e) => handleAdditionalNotesChange(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <FormActionBar
        onCancel={handleCancel}
        customActions={[
          {
            id: 'cancel',
            label: 'Cancel',
            onClick: handleCancel,
            variant: 'outline',
          },
          {
            id: 'submit',
            label: 'Submit Intimation',
            onClick: handleSubmit,
            variant: 'default',
            loading: isSubmitting,
          },
        ]}
        customActionsPosition="split"
      />
    </PageLayout>
  );
}
