/**
 * Intimation General Information Branch
 * Child form component for general intimation details
 */

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompanyDropdown } from '@/components/context-aware/CompanyDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { IntimationFormData, IntimationType } from '../types/intimation.types';

interface IntimationGeneralInformationBranchProps {
  form: UseFormReturn<IntimationFormData>;
  mode: 'create' | 'edit';
}

export function IntimationGeneralInformationBranch({ form }: IntimationGeneralInformationBranchProps) {
  const { watch, setValue } = form;
  const { user } = useAuth();
  const intimationType = watch('type');
  const raisedFor = watch('raisedFor') || 'myself';
  const selectedEmployeeId = watch('employeeId') || '';

  // Handle raisedFor change to set employeeId and raisedByEmployeeId accordingly
  const handleRaisedForChange = (value: string) => {
    setValue('raisedFor', value as 'myself' | 'employee' | 'temporary-person');
    
    if (value === 'myself') {
      // For myself: set employeeId to hardcoded emp001 (simulating current user)
      setValue('employeeId', 'emp001');
      setValue('raisedByEmployeeId', undefined);
    } else if (value === 'employee') {
      // For another employee: leave employeeId empty for manual input, set raisedByEmployeeId to current user
      setValue('employeeId', '');
      setValue('raisedByEmployeeId', user?.id);
    } else if (value === 'temporary-person') {
      // For temporary person: same as myself, set employeeId to emp001 (simulating current user)
      setValue('employeeId', 'emp001');
      setValue('raisedByEmployeeId', undefined);
    }
  };

  // Handle type change
  const handleTypeChange = (value: IntimationType) => {
    setValue('type', value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Provide overall details about this intimation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Selector */}
        <div className="space-y-2">
          <Label htmlFor="company-select">Company *</Label>
          <CompanyDropdown
            value={watch('companyId') || ''}
            onChange={(companyId) => setValue('companyId', companyId)}
            placeholder="Select company"
          />
          <p className="text-xs text-muted-foreground">
            Select the company for this intimation
          </p>
        </div>

        {/* Intimation Type */}
        <div className="space-y-2">
          <Label htmlFor="intimation-type">Intimation Type *</Label>
          <Select value={intimationType} onValueChange={handleTypeChange}>
            <SelectTrigger id="intimation-type">
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

        {/* Raising For */}
        <div className="space-y-3">
          <Label>
            Raising this intimation for *
          </Label>
          <RadioGroup
            value={raisedFor}
            onValueChange={handleRaisedForChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="myself" id="myself" />
              <Label htmlFor="myself" className="font-normal cursor-pointer">
                Myself
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="employee" id="employee" />
              <Label htmlFor="employee" className="font-normal cursor-pointer">
                Another Employee
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="temporary-person" id="temporary-person" />
              <Label htmlFor="temporary-person" className="font-normal cursor-pointer">
                Temporary/External Person
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Employee ID Input - For another employee */}
        {raisedFor === 'employee' && (
          <div className="space-y-2">
            <Label htmlFor="employee-id-input">Employee ID *</Label>
            <Input
              id="employee-id-input"
              placeholder="Enter employee ID (e.g., emp001, emp002)"
              value={selectedEmployeeId}
              onChange={(e) => setValue('employeeId', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the employee ID for whom you are raising this intimation
            </p>
          </div>
        )}

        {/* Temporary Person Details */}
        {raisedFor === 'temporary-person' && (
          <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium">Person Details</p>
            <div className="space-y-2">
              <Label htmlFor="temp-name">Full Name *</Label>
              <Input
                id="temp-name"
                placeholder="Enter full name"
                {...form.register('temporaryPersonName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-phone">Phone Number</Label>
              <Input
                id="temp-phone"
                type="tel"
                placeholder="Enter phone number"
                {...form.register('temporaryPersonPhone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-email">Email Address</Label>
              <Input
                id="temp-email"
                type="email"
                placeholder="Enter email address"
                {...form.register('temporaryPersonEmail')}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              * At least phone number or email is required
            </p>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Purpose/Description *</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Provide details about this intimation request"
            className="resize-none"
            {...form.register('description')}
          />
          <p className="text-xs text-muted-foreground">
            Explain the purpose and nature of this intimation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
