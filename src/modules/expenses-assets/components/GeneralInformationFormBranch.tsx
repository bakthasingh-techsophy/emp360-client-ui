/**
 * General Information Form Branch
 * Child form component for general request details (applicable to all request types)
 */

import { useState } from 'react';
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
import { ExpenseFormData } from '../types/expense.types';

interface GeneralInformationFormBranchProps {
  form: UseFormReturn<ExpenseFormData>;
  mode: 'create' | 'edit';
}

export function GeneralInformationFormBranch({ form }: GeneralInformationFormBranchProps) {
  const { watch } = form;
  const expenseType = watch('type');

  // Local state for raising for options
  const [raisingFor, setRaisingFor] = useState<'myself' | 'employee' | 'temporary-person'>('myself');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [temporaryPersonName, setTemporaryPersonName] = useState<string>('');
  const [temporaryPersonPhone, setTemporaryPersonPhone] = useState<string>('');
  const [temporaryPersonEmail, setTemporaryPersonEmail] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Provide overall details about this request
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Raising For */}
        <div className="space-y-3">
          <Label>
            Raising this request for *
          </Label>
          <RadioGroup
            value={raisingFor}
            onValueChange={(value) => setRaisingFor(value as 'myself' | 'employee' | 'temporary-person')}
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

        {/* Employee Selection */}
        {raisingFor === 'employee' && (
          <div className="space-y-2">
            <Label htmlFor="employee-select">Select Employee *</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user-001">John Doe - Engineering</SelectItem>
                <SelectItem value="user-002">Jane Smith - Marketing</SelectItem>
                <SelectItem value="user-003">Mike Johnson - Engineering</SelectItem>
                <SelectItem value="user-004">Sarah Williams - Marketing</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the employee for whom you are raising this request
            </p>
          </div>
        )}

        {/* Temporary Person Details */}
        {raisingFor === 'temporary-person' && (
          <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium">Person Details</p>
            <div className="space-y-2">
              <Label htmlFor="temp-name">Full Name *</Label>
              <Input
                id="temp-name"
                value={temporaryPersonName}
                onChange={(e) => setTemporaryPersonName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-phone">Phone Number</Label>
              <Input
                id="temp-phone"
                type="tel"
                value={temporaryPersonPhone}
                onChange={(e) => setTemporaryPersonPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-email">Email Address</Label>
              <Input
                id="temp-email"
                type="email"
                value={temporaryPersonEmail}
                onChange={(e) => setTemporaryPersonEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              * At least phone number or email is required
            </p>
          </div>
        )}

        {/* Advance Amount - Only for advance type */}
        {expenseType === 'advance' && (
          <div className="space-y-2">
            <Label htmlFor="advance-amount">Advance Amount ($) *</Label>
            <Input
              id="advance-amount"
              type="number"
              step="0.01"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information or special instructions"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Optional field for any extra details or context
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
