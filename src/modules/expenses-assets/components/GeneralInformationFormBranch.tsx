/**
 * General Information Form Branch
 * Child form component for general request details (applicable to all request types)
 */

import { useState, useEffect } from 'react';
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
import { UsersSelector } from '@/components/context-aware/UsersSelector';
import { useExpenseManagement } from '@/contexts/ExpenseManagementContext';
import { ExpenseCategoryConfig } from '../types/settings.types';
import { ExpenseFormData } from '../types/expense.types';

interface GeneralInformationFormBranchProps {
  form: UseFormReturn<ExpenseFormData>;
  mode: 'create' | 'edit';
}

export function GeneralInformationFormBranch({ form }: GeneralInformationFormBranchProps) {
  const { watch, setValue } = form;
  const expenseType = watch('type');
  const raisedFor = watch('raisedFor') || 'myself';
  const selectedEmployeeId = watch('raisedByEmployeeId') || '';
  const { searchExpenseCategories } = useExpenseManagement();

  // Expense category state
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryConfig[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch expense categories using context
  useEffect(() => {
    const fetchExpenseCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const result = await searchExpenseCategories(
          {
            filters: {},
          },
          0,
          100
        );
        
        if (result && result.content) {
          setExpenseCategories(result.content);
        }
      } catch (error) {
        console.error('Failed to fetch expense categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchExpenseCategories();
  }, []);

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
            value={raisedFor}
            onValueChange={(value) => {
              setValue('raisedFor', value as 'myself' | 'employee' | 'temporary-person');
            }}
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
        {raisedFor === 'employee' && (
          <div className="space-y-2">
            <Label htmlFor="employee-select">Select Employee *</Label>
            <UsersSelector
              value={selectedEmployeeId}
              onChange={(userId) => setValue('raisedByEmployeeId', userId)}
              placeholder="Select an employee"
            />
            <p className="text-xs text-muted-foreground">
              Select the employee for whom you are raising this request
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
            rows={3}
            placeholder="Provide details about this expense/advance request"
            className="resize-none"
            {...form.register('description')}
          />
          <p className="text-xs text-muted-foreground">
            Explain the purpose and nature of this request
          </p>
        </div>

        {/* Expense Category - Only for expense type */}
        {expenseType === 'expense' && (
          <div className="space-y-2">
            <Label htmlFor="expense-category">Expense Category *</Label>
            <Select value={watch('expenseCategoryId') || ''} onValueChange={(value) => setValue('expenseCategoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select expense category"} />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.category}
                    {category.description && ` - ${category.description}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the category that best describes this expense
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
