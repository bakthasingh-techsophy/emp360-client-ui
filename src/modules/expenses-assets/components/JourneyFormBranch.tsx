/**
 * Journey Form Branch Component
 * Branch form for travel intimations with journey segments
 */

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EditableItemsTable, TableColumn } from '@/components/common/EditableItemsTable/EditableItemsTable';
import { JourneySegment } from '../types/intimation.types';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface JourneyFormBranchProps {
  value: JourneySegment[];
  onChange: (segments: JourneySegment[]) => void;
}

export interface JourneyFormBranchRef {
  validate: () => boolean;
  clearErrors: () => void;
}

export const JourneyFormBranch = forwardRef<JourneyFormBranchRef, JourneyFormBranchProps>(({ value, onChange }, ref) => {
  const segments = value;
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const getTotalEstimatedCost = () => {
    return segments.reduce((sum, seg) => sum + Number(seg.estimatedCost || 0), 0);
  };

  // Validation function
  const validateSegments = (items: JourneySegment[]) => {
    const errors: Record<number, Record<string, string>> = {};
    const messages: string[] = [];

    items.forEach((segment, index) => {
      const rowErrors: Record<string, string> = {};

      // Validate from location
      if (!segment.from || segment.from.trim() === '') {
        rowErrors.from = 'From location is required';
      }

      // Validate to location
      if (!segment.to || segment.to.trim() === '') {
        rowErrors.to = 'To location is required';
      }

      // Validate from date
      if (!segment.fromDate) {
        rowErrors.fromDate = 'From date is required';
      }

      // Validate to date
      if (!segment.toDate) {
        rowErrors.toDate = 'To date is required';
      }

      // Validate date range
      if (segment.fromDate && segment.toDate) {
        const fromDate = new Date(segment.fromDate);
        const toDate = new Date(segment.toDate);
        if (toDate < fromDate) {
          rowErrors.toDate = 'To date must be after from date';
          if (!messages.includes('Segment ' + (index + 1) + ': To date must be after from date')) {
            messages.push('Segment ' + (index + 1) + ': To date must be after from date');
          }
        }
      }

      // Validate mode of transport
      if (!segment.modeOfTransport || segment.modeOfTransport === '') {
        rowErrors.modeOfTransport = 'Transport mode is required';
      }

      // Validate estimated cost
      if (!segment.estimatedCost || segment.estimatedCost <= 0) {
        rowErrors.estimatedCost = 'Cost must be greater than 0';
      }

      if (Object.keys(rowErrors).length > 0) {
        errors[index] = rowErrors;
        
        // Add general error message for this segment
        const fieldNames = Object.keys(rowErrors).map(key => {
          const fieldMap: Record<string, string> = {
            from: 'From location',
            to: 'To location',
            fromDate: 'From date',
            toDate: 'To date',
            modeOfTransport: 'Transport mode',
            estimatedCost: 'Estimated cost',
          };
          return fieldMap[key] || key;
        });
        
        if (fieldNames.length > 0 && !messages.some(msg => msg.startsWith('Segment ' + (index + 1)))) {
          messages.push(`Segment ${index + 1}: Please fill in ${fieldNames.join(', ')}`);
        }
      }
    });

    setValidationErrors(errors);
    setErrorMessages(messages);
    setShowErrors(true);
    return errors;
  };

  // Expose validation methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate: () => {
      const errors = validateSegments(segments);
      return Object.keys(errors).length === 0;
    },
    clearErrors: () => {
      setValidationErrors({});
      setErrorMessages([]);
      setShowErrors(false);
    },
  }));

  // Define columns for the editable table
  const columns: TableColumn<JourneySegment>[] = [
    {
      key: 'from',
      header: 'From Location',
      type: 'text',
      required: true,
      placeholder: 'Starting location',
      flex: 1,
    },
    {
      key: 'to',
      header: 'To Location',
      type: 'text',
      required: true,
      placeholder: 'Destination',
      flex: 1,
    },
    {
      key: 'fromDate',
      header: 'From Date',
      type: 'date',
      required: true,
      width: '140px',
      align: 'center',
    },
    {
      key: 'toDate',
      header: 'To Date',
      type: 'date',
      required: true,
      width: '140px',
      align: 'center',
    },
    {
      key: 'modeOfTransport',
      header: 'Transport',
      type: 'select',
      required: true,
      width: '140px',
      align: 'center',
      options: [
        { label: 'Flight', value: 'flight' },
        { label: 'Train', value: 'train' },
        { label: 'Bus', value: 'bus' },
        { label: 'Car', value: 'car' },
        { label: 'Taxi/Cab', value: 'taxi' },
        { label: 'Metro', value: 'metro' },
        { label: 'Ship/Ferry', value: 'ship' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      key: 'estimatedCost',
      header: 'Est. Cost',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
      placeholder: '0.00',
      width: '120px',
      align: 'center',
    },
    {
      key: 'notes',
      header: 'Notes',
      type: 'text',
      placeholder: 'Optional notes...',
      flex: 1,
    },
  ];

  const emptySegment: JourneySegment = {
    id: `segment-${Date.now()}`,
    from: '',
    to: '',
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd'),
    modeOfTransport: '',
    estimatedCost: 0,
    notes: '',
  };

  return (
    <div className="space-y-4">
      {/* Error Messages - Only show when explicitly validated */}
      {showErrors && errorMessages.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Please correct the following errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {errorMessages.map((message, index) => (
                <li key={index} className="text-sm">{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Journey Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add journey segments and estimated costs for each leg of your travel
          </p>
        </CardHeader>
        <CardContent>
          <EditableItemsTable
            columns={columns}
            items={segments}
            onChange={onChange}
            emptyItemTemplate={emptySegment}
            minItems={1}
            maxItems={20}
            errors={showErrors ? validationErrors : {}}
          />
        </CardContent>
      </Card>

      {/* Total Estimated Cost */}
      {segments.length > 0 && getTotalEstimatedCost() > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Estimated Cost</span>
              <span className="text-2xl font-bold">
                ${getTotalEstimatedCost().toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

JourneyFormBranch.displayName = 'JourneyFormBranch';
